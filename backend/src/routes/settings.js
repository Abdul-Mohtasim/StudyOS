
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

const ALLOWED_FIELDS = [...Object.keys(DEFAULT_SETTINGS), "prefs"];
const SELECT_FIELDS = "-_id dailyGoalMinutes theme studyRemindersEnabled taskNotificationsEnabled prefs";

// Accepts a small, flat object of preferences. Returns { value } or { error }.
function cleanPrefs(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "prefs must be an object." };
  const keys = Object.keys(input);
  if (keys.length === 0 || keys.length > 60) return { error: "Send between 1 and 60 preferences." };
  const out = {};
  for (const key of keys) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(key)) return { error: `Invalid preference name: ${key}.` };
    const v = input[key];
    if (key === "subjects") {
      if (!Array.isArray(v) || v.length > 40) return { error: "subjects must be a list of up to 40." };
      const list = [];
      for (const item of v) {
        const name = typeof item?.name === "string" ? item.name.trim() : "";
        if (!name || name.length > 100) return { error: "Each subject needs a name of 1-100 characters." };
        const color = typeof item?.color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(item.color) ? item.color : "";
        list.push({ name, color });
      }
      out.subjects = list;
    } else if (typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && v.length <= 100)) {
      out[key] = v;
    } else {
      return { error: `Invalid value for ${key}.` };
    }
  }
  return { value: out };
}

// GET /api/settings
// Load the authenticated student's settings.
router.get("/", async (req, res, next) => {
  try {
    const settings = await StudentSettings.findOne({
      student: req.student._id,
    })
      .select(SELECT_FIELDS)
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

    if (Object.prototype.hasOwnProperty.call(body, "prefs")) {
      const cleaned = cleanPrefs(body.prefs);
      if (cleaned.error) return res.status(400).json({ message: cleaned.error });
      for (const [k, v] of Object.entries(cleaned.value)) updates[`prefs.${k}`] = v;
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
      .select(SELECT_FIELDS)
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
