"use strict";

const mongoose = require("mongoose");

// Devices (browser + operating system) that have signed in, for "new login" alerts.
const loginDeviceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fingerprint: { type: String, required: true, maxlength: 64 },
    label: { type: String, default: "", maxlength: 100 },
    ip: { type: String, default: "", maxlength: 64 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

loginDeviceSchema.index({ student: 1, fingerprint: 1 }, { unique: true });

module.exports = mongoose.models.LoginDevice || mongoose.model("LoginDevice", loginDeviceSchema);
