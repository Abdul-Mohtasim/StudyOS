"use strict";

// Public email-link endpoints, mounted at /api/auth:
//   POST /forgot-password   POST /reset-password   POST /verify-email

const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  requestPasswordReset,
  resetPasswordWithToken,
  verifyEmailToken,
} = require("../services/accountEmails");

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a while." },
});

router.use(["/forgot-password", "/reset-password", "/verify-email"], limiter);

router.post("/forgot-password", async (req, res) => {
  const generic = {
    message: "If an account exists for that email, we have sent a link to reset the password.",
  };
  try {
    const { email } = req.body || {};
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    await requestPasswordReset(email.trim().toLowerCase(), req);
    return res.status(200).json(generic);
  } catch (error) {
    if (req.log) req.log.error({ errorName: error.name }, "Forgot password failed.");
    // Same answer as success, so this cannot be used to discover accounts.
    return res.status(200).json(generic);
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (typeof token !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "The reset link or password is missing." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
    }
    const student = await resetPasswordWithToken(token, password, req);
    if (!student) {
      return res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
    }
    return res.status(200).json({ message: "Your password was changed. You can sign in now." });
  } catch (error) {
    if (req.log) req.log.error({ errorName: error.name }, "Password reset failed.");
    return res.status(500).json({ error: "Could not reset your password. Please try again." });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body || {};
    const student = await verifyEmailToken(token);
    if (!student) {
      return res.status(400).json({ error: "This confirmation link is invalid or has expired. Open StudyOS > Settings to get a new one." });
    }
    return res.status(200).json({ message: "Your email address is confirmed.", email: student.email });
  } catch (error) {
    if (req.log) req.log.error({ errorName: error.name }, "Email verification failed.");
    return res.status(500).json({ error: "Could not confirm your email. Please try again." });
  }
});

module.exports = router;
