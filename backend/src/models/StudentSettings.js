
const mongoose = require("mongoose");

const studentSettingsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
      immutable: true,
    },

    dailyGoalMinutes: {
      type: Number,
      required: true,
      default: 120,
      min: 1,
      max: 720,
      validate: {
        validator: Number.isInteger,
        message: "Daily goal must be a whole number of minutes.",
      },
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
      required: true,
    },

    studyRemindersEnabled: {
      type: Boolean,
      default: true,
      required: true,
    },

    taskNotificationsEnabled: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports =
  mongoose.models.StudentSettings ||
  mongoose.model("StudentSettings", studentSettingsSchema);
