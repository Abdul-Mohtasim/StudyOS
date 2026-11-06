"use strict";

const mongoose = require("mongoose");

const emailPreferencesSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true, immutable: true },
    // IANA zone such as "Europe/London"; sent by the app so emails arrive at local times.
    timeZone: { type: String, default: "", maxlength: 64 },
    weeklyReport: { type: Boolean, default: true },
    examCountdown: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: false },
    streakWarning: { type: Boolean, default: false },
    flashcardsDue: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports =
  mongoose.models.EmailPreferences || mongoose.model("EmailPreferences", emailPreferencesSchema);
