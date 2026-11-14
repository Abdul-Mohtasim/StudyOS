const mongoose = require("mongoose");

// `requester` follows `recipient` (status is always "accepted"; the field is kept for older data).
const friendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending", required: true },
    // Set once the friend bonus has been paid so it can never be paid twice.
    bonusPaid: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// A pair can only exist once in each direction; the route also blocks the reverse pair.
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.models.Friendship || mongoose.model("Friendship", friendshipSchema);
