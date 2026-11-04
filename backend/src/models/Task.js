
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters."],
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters."],
      default: "Personal",
    },

    duration: {
      type: Number,
      min: 1,
      max: 1440,
      default: 25,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // When the task was ticked off (null while it is still to do).
    completedAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium or high.",
      },
      default: "medium",
    },

    // "YYYY-MM-DD" (kept as text so the day never shifts with time zones).
    dueDate: {
      type: String,
      default: null,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD."],
    },

    // Supports temporarily deleting and restoring tasks.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
