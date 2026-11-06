"use strict";

const mongoose = require("mongoose");

// One-time links for email verification and password reset.
// Only the hash of the token is stored.
const emailTokenSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    type: { type: String, enum: ["verify", "reset"], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

// Expired tokens are removed automatically.
emailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.EmailToken || mongoose.model("EmailToken", emailTokenSchema);
