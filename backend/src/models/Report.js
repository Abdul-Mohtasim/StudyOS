const mongoose = require("mongoose");

// A report about another student, kept for review.
const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    reason: {
      type: String,
      enum: ["spam", "harassment", "inappropriate", "fake", "other"],
      required: true,
    },
    details: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: ["open", "reviewed"], default: "open" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.models.Report || mongoose.model("Report", reportSchema);
