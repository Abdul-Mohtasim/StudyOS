"use strict";

// Account emails: welcome, email verification, password reset, new-login alerts.

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const EmailToken = require("../models/EmailToken");
const EmailLog = require("../models/EmailLog");
const LoginDevice = require("../models/LoginDevice");
const EmailPreferences = require("../models/EmailPreferences");
const { sendMail } = require("./mailer");
const templates = require("./emailTemplates");
const { createToken, hashToken } = require("../utils/emailTokens");
const { isValidTimeZone } = require("../utils/emailTime");

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const FRESH_ACCOUNT_MS = 10 * 60 * 1000;
const INLINE_SEND_TIMEOUT_MS = 3500;

// Google accounts have a verified email; email/password accounts must confirm it.
function isEmailVerified(student) {
  return (
    student?.emailVerified === true ||
    !String(student?.googleId || "").startsWith("email:")
  );
}

function logError(req, error, message) {
  if (req?.log) req.log.error({ errorName: error?.name, message: error?.message }, message);
  else console.error(message, error?.message);
}

// Send without ever breaking the request: errors are logged, waiting is capped.
async function deliver(req, student, message, label) {
  try {
    return await Promise.race([
      sendMail({ ...message, to: student.email }),
      new Promise((resolve) => setTimeout(() => resolve({ ok: false, timedOut: true }), INLINE_SEND_TIMEOUT_MS)),
    ]);
  } catch (error) {
    logError(req, error, `${label} email failed.`);
    return { ok: false, error: true };
  }
}

async function claim(studentId, key) {
  const result = await EmailLog.updateOne(
    { student: studentId, key },
    { $setOnInsert: { student: studentId, key } },
    { upsert: true }
  );
  return result.upsertedCount === 1;
}

async function issueToken(student, type, ttlMs) {
  await EmailToken.deleteMany({ student: student._id, type });
  const { token, tokenHash } = createToken();
  await EmailToken.create({
    student: student._id,
    type,
    tokenHash,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

async function recentToken(student, type) {
  const latest = await EmailToken.findOne({ student: student._id, type }).sort({ createdAt: -1 }).lean();
  return latest && Date.now() - new Date(latest.createdAt).getTime() < RESEND_COOLDOWN_MS;
}

// ---------- Verification ----------

// Returns "sent" | "already" | "cooldown" | "failed" | "not-configured"
async function sendVerification(student, req) {
  if (isEmailVerified(student)) return "already";
  if (await recentToken(student, "verify")) return "cooldown";
  const token = await issueToken(student, "verify", VERIFY_TTL_MS);
  const url = templates.appUrl(`/?verify=${token}`);
  const result = await deliver(req, student, templates.verifyEmail({ student, url }), "Verification");
  if (result.skipped) return "not-configured";
  return result.ok ? "sent" : "failed";
}

async function verifyEmailToken(token) {
  if (typeof token !== "string" || token.length < 32 || token.length > 200) return null;
  const record = await EmailToken.findOne({
    tokenHash: hashToken(token),
    type: "verify",
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!record) return null;

  const student = await Student.findByIdAndUpdate(
    record.student,
    { $set: { emailVerified: true, emailVerifiedAt: new Date() } },
    { returnDocument: "after" }
  );
  await EmailToken.deleteMany({ student: record.student, type: "verify" });
  return student;
}

// ---------- Password reset ----------

async function requestPasswordReset(email, req) {
  const student = await Student.findOne({ email }).select("+passwordHash");
  if (!student) return;

  if (!student.passwordHash) {
    // Google account: explain instead of creating a reset link (once per hour).
    const hourKey = `reset-google:${new Date().toISOString().slice(0, 13)}`;
    if (await claim(student._id, hourKey)) {
      await deliver(req, student, templates.passwordResetGoogle({ student }), "Sign-in help");
    }
    return;
  }

  if (await recentToken(student, "reset")) return;
  const token = await issueToken(student, "reset", RESET_TTL_MS);
  const url = templates.appUrl(`/?reset=${token}`);
  await deliver(req, student, templates.passwordReset({ student, url }), "Password reset");
}

// Returns the student, or null when the link is invalid or expired.
async function resetPasswordWithToken(token, newPassword, req) {
  if (typeof token !== "string" || token.length < 32 || token.length > 200) return null;
  const record = await EmailToken.findOne({
    tokenHash: hashToken(token),
    type: "reset",
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!record) return null;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const student = await Student.findByIdAndUpdate(
    record.student,
    // Following the link proves the person controls this inbox.
    { $set: { passwordHash, emailVerified: true, emailVerifiedAt: new Date() } },
    { returnDocument: "after" }
  );
  await EmailToken.deleteMany({ student: record.student, type: "reset" });
  if (student) await deliver(req, student, templates.passwordChanged({ student }), "Password changed");
  return student;
}

// ---------- After sign-in: welcome + new-login alert ----------

function describeDevice(userAgent) {
  const ua = String(userAgent || "");
  const os = /Android/i.test(ua)
    ? "Android"
    : /iPhone|iPad|iOS/i.test(ua)
      ? "iOS"
      : /Windows/i.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "macOS"
          : /CrOS/i.test(ua)
            ? "ChromeOS"
            : /Linux/i.test(ua)
              ? "Linux"
              : "Unknown OS";
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return { label: "StudyOS app (Android)", family: "app", os };
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /SamsungBrowser/i.test(ua)
        ? "Samsung Internet"
        : /Firefox\//i.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/i.test(ua)
            ? "Chrome"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "Browser";
  return { label: `${browser} on ${os}`, family: browser, os };
}

async function afterSignIn(student, req) {
  try {
    // Welcome email, once, for accounts created moments ago.
    const fresh = Date.now() - new Date(student.createdAt || 0).getTime() < FRESH_ACCOUNT_MS;
    if (fresh && (await claim(student._id, "welcome"))) {
      let verifyUrl = null;
      if (!isEmailVerified(student)) {
        const token = await issueToken(student, "verify", VERIFY_TTL_MS);
        verifyUrl = templates.appUrl(`/?verify=${token}`);
      }
      await deliver(req, student, templates.welcome({ student, verifyUrl }), "Welcome");
    }

    // New-device detection. The first device ever seen is recorded silently.
    const device = describeDevice(req?.headers?.["user-agent"]);
    const fingerprint = crypto.createHash("sha256").update(`${device.family}|${device.os}`).digest("hex");
    const ip = String(req?.ip || "").slice(0, 64);

    const result = await LoginDevice.findOneAndUpdate(
      { student: student._id, fingerprint },
      {
        $set: { lastSeenAt: new Date(), ip, label: device.label },
        $setOnInsert: { student: student._id, fingerprint, firstSeenAt: new Date() },
      },
      { upsert: true, includeResultMetadata: true }
    );
    const isNewDevice = result?.lastErrorObject?.updatedExisting === false;
    if (!isNewDevice || fresh) return;

    const hadOtherDevice = await LoginDevice.exists({ student: student._id, fingerprint: { $ne: fingerprint } });
    if (!hadOtherDevice || !isEmailVerified(student)) return;

    const prefs = await EmailPreferences.findOne({ student: student._id }).lean();
    if (prefs && prefs.securityAlerts === false) return;

    const zone = prefs && isValidTimeZone(prefs.timeZone) ? prefs.timeZone : "UTC";
    const when = `${new Date().toLocaleString("en-GB", { timeZone: zone, dateStyle: "medium", timeStyle: "short" })} (${zone})`;
    await deliver(req, student, templates.newLogin({ student, when, device: device.label, ip }), "Login alert");
  } catch (error) {
    // Email problems must never block signing in.
    logError(req, error, "Post sign-in emails failed.");
  }
}

module.exports = {
  isEmailVerified,
  sendVerification,
  verifyEmailToken,
  requestPasswordReset,
  resetPasswordWithToken,
  afterSignIn,
  deliver,
  claim,
};
