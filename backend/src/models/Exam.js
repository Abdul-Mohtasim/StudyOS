"use strict";

const mongoose = require("mongoose");

// One upcoming exam date per subject, per student.
const examSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters."],
    },

    // Lower-case copy of the subject, used to keep one exam per subject.
    subjectKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },

    // Stored as "YYYY-MM-DD" so the day never shifts with time zones.
    date: {
      type: String,
      required: [true, "Exam date is required."],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Exam date must be YYYY-MM-DD."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

examSchema.index({ student: 1, subjectKey: 1 }, { unique: true });

module.exports =
  mongoose.models.Exam || mongoose.model("Exam", examSchema);
