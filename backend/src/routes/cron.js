"use strict";

// GET or POST /api/cron/emails  with header  Authorization: Bearer <CRON_SECRET>
// Call it every 30-60 minutes from any scheduler (see UPDATE_GUIDE_4_EMAILS.md).

const express = require("express");
const { runEmailJobs } = require("../services/emailJobs");
const { isMailConfigured } = require("../services/mailer");
const { safeEqual } = require("../utils/emailTokens");

const router = express.Router();

async function handle(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "CRON_SECRET is not configured on the server." });
  }
  const header = req.headers.authorization || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided || !safeEqual(provided, secret)) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  if (!isMailConfigured()) {
    return res.status(503).json({ error: "Email sending is not configured (RESEND_API_KEY or BREVO_API_KEY, and MAIL_FROM)." });
  }
  try {
    const summary = await runEmailJobs();
    return res.status(200).json({ ok: true, ...summary });
  } catch (error) {
    if (req.log) req.log.error({ errorName: error.name, message: error.message }, "Email jobs failed.");
    return res.status(500).json({ error: "Email jobs failed." });
  }
}

router.get("/emails", handle);
router.post("/emails", handle);

module.exports = router;
