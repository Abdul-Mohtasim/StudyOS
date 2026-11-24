"use strict";

// Public feedback form endpoint, mounted at /api/support (the pages themselves are served by app.js).
//   POST /feedback  { email, subject, description, type, attachments:[{name,type,data(base64)}], website(honeypot) }
// Every message is saved in the database. If SUPPORT_EMAIL and a mail provider are set, it is also emailed
// to the team (with the attachments), with Reply-To set to the sender.

const express = require("express");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { connectDatabase } = require("../config/database");
const Feedback = require("../models/Feedback");
const { sendMail } = require("../services/mailer");
const { TYPES } = require("../pages/helpPages");

const router = express.Router();

// A safe key for the limiter: on some hosts (Vercel / proxies) req.ip can be empty, and the default
// key builder then throws -> "Internal server error". Fall back to the forwarded address.
const keyFor = (req) => {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = req.ip || fwd || (req.socket && req.socket.remoteAddress) || "unknown";
  try { return ipKeyGenerator(ip); } catch { return String(ip); }
};

const limiter = rateLimit({
  keyGenerator: keyFor,
  validate: false,
  passOnStoreError: true,
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.FEEDBACK_RATE_LIMIT) || 6,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "You sent a few messages already. Please try again in an hour." },
});

const OK_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);
const MAX_FILES = 3;
const MAX_BYTES = 3 * 1024 * 1024;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, n);

// Read the JSON body ourselves: works when the host already parsed it (Vercel), when it is a raw
// string/Buffer, or when the stream still has to be read. Never throws; returns {} on bad input.
const MAX_BODY = 6 * 1024 * 1024;
function readBody(req) {
  return new Promise((resolve) => {
    let pre;
    try { pre = req.body; } catch { pre = undefined; }
    if (pre && typeof pre === "object" && !Buffer.isBuffer(pre)) return resolve(pre);
    if (typeof pre === "string" || Buffer.isBuffer(pre)) {
      try { return resolve(JSON.parse(String(pre)) || {}); } catch { return resolve({ __bad: true }); }
    }
    if (req.readableEnded || req.complete === true && !req.readable) return resolve({});
    const chunks = [];
    let size = 0;
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { finish({ __big: true }); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      if (done) return;
      const txt = Buffer.concat(chunks).toString("utf8");
      if (!txt) return finish({});
      try { finish(JSON.parse(txt) || {}); } catch { finish({ __bad: true }); }
    });
    req.on("error", () => finish({ __bad: true }));
    setTimeout(() => finish({ __bad: true }), 20000).unref?.();
  });
}

router.post("/feedback", async (req, res, next) => {
  req.body = await readBody(req);
  next();
}, (req, res, next) => {
  // The limiter must never stop a real message by crashing.
  try { limiter(req, res, () => next()); } catch { next(); }
}, async (req, res) => {
  try {
    const b = req.body || {};
    if (b.__big) return res.status(413).json({ error: "Attachments are too large. Keep them under 3 MB in total." });
    if (b.__bad) return res.status(400).json({ error: "Could not read the form. Please try again." });
    if (b.website) return res.json({ ok: true }); // honeypot: bots fill this hidden field

    const email = clean(b.email, 200).toLowerCase();
    const subject = clean(b.subject, 140);
    const description = clean(b.description, 5000);
    const type = clean(b.type, 60);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
    if (!subject) return res.status(400).json({ error: "Add a subject." });
    if (!description) return res.status(400).json({ error: "Describe the issue." });
    if (!TYPES.includes(type)) return res.status(400).json({ error: "Choose the type of issue." });

    const files = [];
    let bytes = 0;
    const list = Array.isArray(b.attachments) ? b.attachments.slice(0, MAX_FILES) : [];
    for (const f of list) {
      const mime = clean(f && f.type, 60);
      const data = String((f && f.data) || "").replace(/\s+/g, "").replace(/^data:[^,]*,/, "");
      if (!OK_TYPES.has(mime) || !/^[A-Za-z0-9+/=]+$/.test(data)) return res.status(400).json({ error: "Only images and PDF files can be attached." });
      bytes += Math.floor((data.length * 3) / 4);
      if (bytes > MAX_BYTES) return res.status(400).json({ error: "Attachments can be 3 MB in total." });
      const name = clean(f.name, 80).replace(/[^\w.\- ]+/g, "_") || "attachment";
      files.push({ filename: name, content: data });
    }

    let row = null;
    try {
      await connectDatabase();
      row = await Feedback.create({
      email, subject, description, type,
      attachmentNames: files.map((f) => f.filename),
      userAgent: clean(req.get("user-agent"), 300),
      });
    } catch (err) {
      // Saving failed: still try to email it, so the message is not lost.
      if (req.log) req.log.error({ err }, "Feedback could not be saved");
    }

    const to = (process.env.SUPPORT_EMAIL || "").trim();
    if (to) {
      try {
        const sent = await sendMail({
          to,
          replyTo: email,
          subject: `[StudyOS feedback] ${type}: ${subject}`,
          text: `From: ${email}\nType: ${type}\n\n${description}\n`,
          html: `<p><b>From:</b> ${esc(email)}<br><b>Type:</b> ${esc(type)}</p><p style="white-space:pre-wrap">${esc(description)}</p>`,
          attachments: files,
        });
        if (sent && sent.ok && row) await Feedback.updateOne({ _id: row._id }, { emailed: true });
      } catch (err) {
        if (req.log) req.log.warn({ err }, "Feedback email failed (the message is saved in the database)");
      }
    }
    if (!row && !to) return res.status(503).json({ error: "Could not send right now. Please try again in a minute." });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Feedback failed:", err);
    return res.status(500).json({ error: "Could not send. Please try again.", code: String((err && (err.code || err.name)) || "ERR").slice(0, 40) });
  }
});

// Any error inside this router answers with a clear message (never the generic "Internal server error").
router.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err && err.type === "entity.too.large") return res.status(413).json({ error: "Attachments are too large. Keep them under 3 MB in total." });
  if (err instanceof SyntaxError) return res.status(400).json({ error: "Could not read the form. Please try again." });
  if (req.log) req.log.error({ err }, "Feedback route failed");
  return res.status(500).json({ error: "Could not send. Please try again." });
});

module.exports = router;
