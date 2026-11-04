"use strict";

const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    type: {
      type: String,
      enum: ["quiz", "exam", "assignment", "other"],
      default: "quiz",
    },
    score: { type: Number, required: true, min: 0, max: 100000 },
    maxScore: { type: Number, required: true, min: 0.01, max: 100000 },
    // "YYYY-MM-DD" so the day never shifts with time zones.
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD."],
    },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, date: -1 });

module.exports = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);
