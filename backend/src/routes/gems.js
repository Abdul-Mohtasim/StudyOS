"use strict";

const express = require("express");
const Student = require("../models/Student");
const requireAuth = require("../middleware/auth");
const gemsService = require("../services/gems");

const router = express.Router();
router.use(requireAuth);

// GET /api/gems -> { gems }
router.get("/", async (req, res) => {
  try {
    const doc = await Student.findById(req.student._id).select("gems").lean();
    res.json({ gems: doc?.gems || 0 });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not load your gems." });
  }
});

// POST /api/gems/onboarding { amount }  (paid once per account, capped)
router.post("/onboarding", async (req, res) => {
  try {
    const result = await gemsService.claimOnboarding(req.student._id, req.body?.amount);
    res.json({ gems: result.balance, added: result.added, claimed: result.claimed });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not add your gems." });
  }
});

module.exports = router;
