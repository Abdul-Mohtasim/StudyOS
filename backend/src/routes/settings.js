
const express = require("express");
const StudentSettings = require("../models/StudentSettings");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

const DEFAULT_SETTINGS = {
  dailyGoalMinutes: 120,
  theme: "dark",
  studyRemindersEnabled: true,
  taskNotificationsEnabled: true,
};

const ALLOWED_FIELDS = Object.keys(DEFAULT_SETTINGS);

// GET /api/settings
// Load the authenticated student's settings.
router.get("/", async (req, res, next) => {
  try {
    const settings = await StudentSettings.findOne({
      student: req.student._id,
    })
      .select("-_id dailyGoalMinutes theme studyRemindersEnabled taskNotificationsEnabled")
      .lean();

    return res.status(200).json({
      settings: {
        ...DEFAULT_SETTINGS,
        ...(settings || {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings
// Update only the settings explicitly provided.
router.put("/", async (req, res, next) => {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      return res.status(400).json({
        message: "Provide at least one valid setting.",
      });
    }

    const updates = {};

    for (const key of Object.keys(body)) {
      if (!ALLOWED_FIELDS.includes(key)) {
        return res.status(400).json({
          message: `Unsupported setting: ${key}.`,
        });
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "dailyGoalMinutes"
      )
    ) {
      const value = body.dailyGoalMinutes;

      if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 720
      ) {
        return res.status(400).json({
          message:
            "Daily goal must be a whole number from 1 to 720 minutes.",
        });
      }

      updates.dailyGoalMinutes = value;
    }

    if (Object.prototype.hasOwnProperty.call(body, "theme")) {
      if (!["light", "dark"].includes(body.theme)) {
        return res.status(400).json({
          message: 'Theme must be either "light" or "dark".',
        });
      }

      updates.theme = body.theme;
    }

    for (const key of [
      "studyRemindersEnabled",
      "taskNotificationsEnabled",
    ]) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        if (typeof body[key] !== "boolean") {
          return res.status(400).json({
            message: `${key} must be true or false.`,
          });
        }

        updates[key] = body[key];
      }
    }

    const settings = await StudentSettings.findOneAndUpdate(
      { student: req.student._id },
      {
        $set: updates,
        $setOnInsert: { student: req.student._id },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .select("-_id dailyGoalMinutes theme studyRemindersEnabled taskNotificationsEnabled")
      .lean();

    return res.status(200).json({
      message: "Settings saved successfully.",
      settings: {
        ...DEFAULT_SETTINGS,
        ...(settings || {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
