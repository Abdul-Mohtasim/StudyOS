const mongoose = require("mongoose");

// Messages sent from the public Feedback page (/help/feedback). Attachment files are only emailed, never stored here.
const feedbackSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, maxlength: 200 },
    subject: { type: String, required: true, maxlength: 140 },
    description: { type: String, required: true, maxlength: 5000 },
    type: { type: String, required: true, maxlength: 60 },
    attachmentNames: { type: [String], default: [] },
    userAgent: { type: String, default: "", maxlength: 300 },
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
