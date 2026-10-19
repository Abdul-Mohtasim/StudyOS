
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
