
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    picture: {
      type: String,
      default: "",
      maxlength: 2048,
    },

    // Gems are only ever changed by the server (services/gems.js).
    gems: {
      type: Number,
      default: 0,
      min: 0,
    },
    gemsDay: { type: String, default: "" }, // YYYY-MM-DD of the daily counter below
    gemsToday: { type: Number, default: 0 }, // gems earned from daily-capped sources today
    onboardingGemsClaimed: { type: Boolean, default: false },

    // Email addresses from Google sign-in count as verified (see services/accountEmails.js).
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

studentSchema.index({ email: 1 }, { unique: true });

module.exports =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
