"use strict";

// Signed-in email endpoints, mounted at /api/email:
//   GET/PUT /prefs   POST /verification   POST /test   POST /note   POST /flashcards

const express = require("express");
const requireAuth = require("../middleware/auth");
const Note = require("../models/Note");
const Flashcard = require("../models/Flashcard");
const EmailPreferences = require("../models/EmailPreferences");
const EmailLog = require("../models/EmailLog");
const { sendMail, isMailConfigured } = require("../services/mailer");
const templates = require("../services/emailTemplates");
const { isEmailVerified, sendVerification } = require("../services/accountEmails");
const { isValidTimeZone } = require("../utils/emailTime");

const router = express.Router();
router.use(requireAuth);

const PREF_KEYS = ["weeklyReport", "examCountdown", "securityAlerts", "dailyDigest", "streakWarning", "flashcardsDue"];
const MANUAL_LIMIT_PER_HOUR = 20;
const MAX_CARDS = 200;

function readPrefs(doc) {
  const row = doc || {};
  const defaults = { weeklyReport: true, examCountdown: true, securityAlerts: true, dailyDigest: false, streakWarning: false, flashcardsDue: false };
  const prefs = {};
  for (const key of PREF_KEYS) prefs[key] = typeof row[key] === "boolean" ? row[key] : defaults[key];
  prefs.timeZone = row.timeZone || "";
  return prefs;
}

// Emails you send to yourself: your own address only, verified only, rate-limited.
async function guardManualSend(req, res) {
  if (!isEmailVerified(req.student)) {
    res.status(403).json({ message: "Confirm your email address first (Settings > Email notifications)." });
    return false;
  }
  if (!isMailConfigured()) {
    res.status(503).json({ message: "Email sending is not set up on the server yet." });
    return false;
  }
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await EmailLog.countDocuments({
    student: req.student._id,
    key: /^manual:/,
    createdAt: { $gte: since },
  });
  if (recent >= MANUAL_LIMIT_PER_HOUR) {
    res.status(429).json({ message: "You have sent a lot of emails this hour. Please try again later." });
    return false;
  }
  await EmailLog.create({
    student: req.student._id,
    key: `manual:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
  });
  return true;
}

router.get("/prefs", async (req, res, next) => {
  try {
    const doc = await EmailPreferences.findOne({ student: req.student._id }).lean();
    return res.status(200).json({
      prefs: readPrefs(doc),
      emailVerified: isEmailVerified(req.student),
      email: req.student.email,
      mailConfigured: isMailConfigured(),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/prefs", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0) {
      return res.status(400).json({ message: "Provide at least one setting." });
    }
    const updates = {};
    for (const key of Object.keys(body)) {
      if (key === "timeZone") {
        if (!isValidTimeZone(body.timeZone)) return res.status(400).json({ message: "Unknown time zone." });
        updates.timeZone = body.timeZone;
      } else if (PREF_KEYS.includes(key)) {
        if (typeof body[key] !== "boolean") return res.status(400).json({ message: `${key} must be true or false.` });
        updates[key] = body[key];
      } else {
        return res.status(400).json({ message: `Unsupported setting: ${key}.` });
      }
    }
    const doc = await EmailPreferences.findOneAndUpdate(
      { student: req.student._id },
      { $set: updates, $setOnInsert: { student: req.student._id } },
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.status(200).json({ message: "Email settings saved.", prefs: readPrefs(doc) });
  } catch (error) {
    next(error);
  }
});

router.post("/verification", async (req, res, next) => {
  try {
    if (!isMailConfigured()) {
      return res.status(503).json({ message: "Email sending is not set up on the server yet." });
    }
    const result = await sendVerification(req.student, req);
    const messages = {
      sent: "Confirmation email sent. Check your inbox.",
      already: "Your email is already confirmed.",
      cooldown: "A confirmation email was just sent. Please wait a minute before asking again.",
      failed: "The email could not be sent. Please try again later.",
      "not-configured": "Email sending is not set up on the server yet.",
    };
    const ok = result === "sent" || result === "already";
    return res.status(ok ? 200 : result === "cooldown" ? 429 : 502).json({ message: messages[result], result });
  } catch (error) {
    next(error);
  }
});

router.post("/test", async (req, res, next) => {
  try {
    if (!(await guardManualSend(req, res))) return;
    await sendMail({ ...templates.testEmail({ student: req.student }), to: req.student.email });
    return res.status(200).json({ message: `Test email sent to ${req.student.email}.` });
  } catch (error) {
    console.error("Test email failed:", error.message);
    return res.status(502).json({ message: "The email provider rejected the message. Check the server's email settings." });
  }
});

router.post("/note", async (req, res, next) => {
  try {
    const { noteId } = req.body || {};
    if (typeof noteId !== "string" || !/^[a-f\d]{24}$/i.test(noteId)) {
      return res.status(400).json({ message: "A valid note is required." });
    }
    const note = await Note.findOne({ _id: noteId, student: req.student._id }).lean();
    if (!note) return res.status(404).json({ message: "Note not found." });
    if (!(await guardManualSend(req, res))) return;
    await sendMail({ ...templates.noteEmail({ student: req.student, note }), to: req.student.email });
    return res.status(200).json({ message: `Note sent to ${req.student.email}.` });
  } catch (error) {
    if (error.status) return res.status(502).json({ message: "The email could not be sent. Please try again later." });
    next(error);
  }
});

router.post("/flashcards", async (req, res, next) => {
  try {
    const { subject } = req.body || {};
    if (subject !== undefined && (typeof subject !== "string" || subject.length > 100)) {
      return res.status(400).json({ message: "Invalid subject." });
    }
    const filter = { student: req.student._id };
    if (subject && subject.trim()) filter.subject = subject.trim();
    const total = await Flashcard.countDocuments(filter);
    if (total === 0) return res.status(404).json({ message: "There are no flashcards to send." });
    const cards = await Flashcard.find(filter).select("front back").sort({ createdAt: 1 }).limit(MAX_CARDS).lean();
    if (!(await guardManualSend(req, res))) return;
    await sendMail({
      ...templates.flashcardSet({ student: req.student, subject: (subject || "").trim(), cards, truncated: total > MAX_CARDS }),
      to: req.student.email,
    });
    return res.status(200).json({ message: `${cards.length} flashcard${cards.length === 1 ? "" : "s"} sent to ${req.student.email}.` });
  } catch (error) {
    if (error.status) return res.status(502).json({ message: "The email could not be sent. Please try again later." });
    next(error);
  }
});

module.exports = router;
