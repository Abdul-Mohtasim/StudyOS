"use strict";

const express = require("express");
const requireAuth = require("../middleware/auth");
const league = require("../services/league");

const router = express.Router();
router.use(requireAuth);

// GET /api/league -> the current 7 day round: your trophy, time left and everyone's XP, gems, tasks and subjects.
// Finished rounds are closed here (top 3 with enough XP moves up one trophy; anyone else stays where they are).
router.get("/", async (req, res) => {
  try {
    const data = await league.view(req.student._id);
    if (!data) return res.status(404).json({ message: "Account not found." });
    res.json(data);
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not load the league right now." });
  }
});

module.exports = router;
