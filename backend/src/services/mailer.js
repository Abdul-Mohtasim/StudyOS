"use strict";

// Sends email through an HTTPS email API (no extra npm packages needed).
//   Resend: set RESEND_API_KEY      (best, needs a domain you own)
//   Brevo:  set BREVO_API_KEY       (works with one verified sender address)
// Also set MAIL_FROM, e.g.  StudyOS <no-reply@yourdomain.com>

const TIMEOUT_MS = 8000;

function provider() {
  const wanted = (process.env.MAIL_PROVIDER || "").toLowerCase();
  if (wanted === "resend" && process.env.RESEND_API_KEY) return "resend";
  if (wanted === "brevo" && process.env.BREVO_API_KEY) return "brevo";
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.BREVO_API_KEY) return "brevo";
  return null;
}

function isMailConfigured() {
  return Boolean(provider() && process.env.MAIL_FROM);
}

function parseFrom(from) {
  const match = String(from).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim() || "StudyOS", email: match[2].trim() };
  return { name: "StudyOS", email: String(from).trim() };
}

async function postJson(url, headers, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    if (!response.ok) {
      const reason = data.message || data.error?.message || data.error || `HTTP ${response.status}`;
      const error = new Error(`Email provider rejected the message: ${String(reason).slice(0, 200)}`);
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// { ok: true, id } when sent, { ok: false, skipped: true } when email is not configured.
async function sendMail({ to, subject, html, text }) {
  if (!to || !subject) throw new Error("sendMail needs a recipient and a subject.");

  const active = provider();
  if (!active || !process.env.MAIL_FROM) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[mail not configured] To: ${to}\nSubject: ${subject}\n${text || ""}\n`);
    } else {
      console.warn(`[mail not configured] Skipped "${subject}". Set RESEND_API_KEY or BREVO_API_KEY and MAIL_FROM.`);
    }
    return { ok: false, skipped: true };
  }

  if (active === "resend") {
    const data = await postJson(
      "https://api.resend.com/emails",
      { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      { from: process.env.MAIL_FROM, to: [to], subject, html, text }
    );
    return { ok: true, id: data.id || "" };
  }

  const sender = parseFrom(process.env.MAIL_FROM);
  const data = await postJson(
    "https://api.brevo.com/v3/smtp/email",
    { "api-key": process.env.BREVO_API_KEY, accept: "application/json" },
    { sender, to: [{ email: to }], subject, htmlContent: html, textContent: text }
  );
  return { ok: true, id: data.messageId || "" };
}

module.exports = { sendMail, isMailConfigured };
