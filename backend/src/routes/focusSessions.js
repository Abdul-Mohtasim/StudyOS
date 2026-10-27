
const express = require("express");
const mongoose = require("mongoose");
const FocusSession = require("../models/FocusSession");
const requireAuth = require("../middleware/auth");

const router = express.Router();
const FOCUS_SESSION_PAGE_SIZE = 500;

// Every focus-session request requires authentication.
router.use(requireAuth);

// GET /api/focus-sessions
// Return the authenticated student's sessions.
router.get("/", async (req, res) => {
  try {
    const filter = {
      student: req.student._id,
    };
    const { before } = req.query;

    if (before !== undefined) {
      if (typeof before !== "string" || !mongoose.isValidObjectId(before)) {
        return res.status(400).json({
          message: "Invalid focus session cursor.",
        });
      }

      const cursor = await FocusSession.findOne({
        _id: before,
        student: req.student._id,
      })
        .select("completedAt")
        .lean();

      if (!cursor) {
        return res.status(400).json({
          message: "Focus session cursor was not found.",
        });
      }

      filter.$or = [
        { completedAt: { $lt: cursor.completedAt } },
        {
          completedAt: cursor.completedAt,
          _id: { $lt: cursor._id },
        },
      ];
    }

    const [results, totals] = await Promise.all([
      FocusSession.find(filter)
        .sort({ completedAt: -1, _id: -1 })
        .limit(FOCUS_SESSION_PAGE_SIZE + 1)
        .lean(),
      before === undefined
        ? FocusSession.aggregate([
            { $match: { student: req.student._id } },
            {
              $group: {
                _id: null,
                totalMinutes: { $sum: "$durationMinutes" },
                totalSessions: { $sum: 1 },
              },
            },
          ])
        : Promise.resolve(null),
    ]);

    const hasMore = results.length > FOCUS_SESSION_PAGE_SIZE;
    const sessions = results.slice(0, FOCUS_SESSION_PAGE_SIZE);

    return res.status(200).json({
      sessions,
      hasMore,
      ...(totals && {
        totalFocusMinutes: totals[0]?.totalMinutes || 0,
        totalFocusSessionCount: totals[0]?.totalSessions || 0,
      }),
    });
  } catch (error) {
    console.error("Could not retrieve focus sessions:", error);

    return res.status(500).json({
      message: "Could not retrieve focus session history.",
    });
  }
});

// POST /api/focus-sessions
// Save a naturally completed focus session.
router.post("/", async (req, res) => {
  try {
    const { durationMinutes, completedAt } = req.body;

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 180
    ) {
      return res.status(400).json({
        message:
          "Session duration must be a whole number from 1 to 180 minutes.",
      });
    }

    if (
      typeof completedAt !== "string" ||
      completedAt.length > 40 ||
      !Number.isFinite(Date.parse(completedAt))
    ) {
      return res.status(400).json({
        message: "A valid session completion date is required.",
      });
    }

    const completedDate = new Date(completedAt);
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (
      completedDate.getTime() > now + 60_000 ||
      completedDate.getTime() < now - sevenDaysInMs
    ) {
      return res.status(400).json({
        message:
          "The session completion date is outside the allowed range.",
      });
    }

    const session = await FocusSession.create({
      student: req.student._id,
      durationMinutes,
      completedAt: completedDate,
    });

    return res.status(201).json({ session });
  } catch (error) {
    console.error("Could not save focus session:", error);

    return res.status(500).json({
      message: "Could not save the completed focus session.",
    });
  }
});

module.exports = router;
