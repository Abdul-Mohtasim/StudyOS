"use strict";

const express = require("express");
const Student = require("../models/Student");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const MAX_EMAILS = 500;

// Which of the phone's contacts already use StudyOS?
// The emails are only compared, never stored.
router.post("/match", async (req, res) => {
  try {
    const raw = Array.isArray(req.body?.emails) ? req.body.emails : [];
    const emails = [...new Set(
      raw
        .filter((e) => typeof e === "string")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 3 && e.length <= 254 && e.includes("@"))
    )].slice(0, MAX_EMAILS);
    if (!emails.length) return res.json({ matches: [] });

    const found = await Student.find({ email: { $in: emails }, _id: { $ne: req.student._id } })
      .select("name displayName picture email")
      .limit(50)
      .lean();

    res.json({
      matches: found.map((s) => ({
        id: String(s._id),
        name: s.displayName || s.name,
        picture: s.picture || "",
        email: s.email,
      })),
    });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not look up friends right now." });
  }
});

module.exports = router;
