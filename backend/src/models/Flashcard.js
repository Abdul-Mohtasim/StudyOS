"use strict";

const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    front: { type: String, required: true, trim: true, maxlength: 400 },
    back: { type: String, required: true, trim: true, maxlength: 1000 },
    subject: { type: String, trim: true, maxlength: 100, default: "" },
    // The note this card was made from (optional, informational).
    noteId: { type: String, trim: true, maxlength: 40, default: "" },

    // Spaced-repetition state.
    ease: { type: Number, default: 2.5, min: 1.3, max: 5 },
    interval: { type: Number, default: 0, min: 0, max: 3650 },
    reps: { type: Number, default: 0, min: 0 },
    lapses: { type: Number, default: 0, min: 0 },
    dueAt: { type: Date, default: Date.now },
    lastReviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

flashcardSchema.index({ student: 1, dueAt: 1 });

module.exports =
  mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema);
