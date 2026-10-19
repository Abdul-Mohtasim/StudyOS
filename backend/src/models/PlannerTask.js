
const mongoose = require("mongoose");

const plannerTaskSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Study task title is required."],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters."],
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters."],
      default: "Mathematics",
    },

    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    deadline: {
      type: String,
      default: "",
      validate: {
        validator(value) {
          if (value === "") return true;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          const date = new Date(`${value}T00:00:00.000Z`);

          return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value
          );
        },
        message: "Deadline must be a valid YYYY-MM-DD date.",
      },
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

plannerTaskSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("PlannerTask", plannerTaskSchema);
