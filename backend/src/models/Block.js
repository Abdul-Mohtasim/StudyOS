const mongoose = require("mongoose");

// `blocker` has blocked `blocked`. Neither can see or ask the other for friendship.
const blockSchema = new mongoose.Schema(
  {
    blocker: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    blocked: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

module.exports = mongoose.models.Block || mongoose.model("Block", blockSchema);
