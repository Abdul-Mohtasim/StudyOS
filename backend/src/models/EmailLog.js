"use strict";

const mongoose = require("mongoose");

// Remembers which scheduled emails were already sent ("weekly:2026-11-08",
// "exam:<id>:7" ...) so nothing is sent twice, and counts manual sends for rate limits.
const emailLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    key: { type: String, required: true, maxlength: 120 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

emailLogSchema.index({ student: 1, key: 1 }, { unique: true });
// Old entries are cleaned up after 120 days.
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 120 });

module.exports = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);
