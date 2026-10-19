const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Note title is required."],
      trim: true,
      maxlength: [120, "Note title cannot exceed 120 characters."],
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters."],
      default: "Personal",
    },

    content: {
      type: String,
      required: [true, "Note content is required."],
      trim: true,
      maxlength: [20000, "Note content cannot exceed 20000 characters."],
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ student: 1, updatedAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
