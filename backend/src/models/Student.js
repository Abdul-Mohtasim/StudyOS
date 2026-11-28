
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

    // Gem Shop purchases (see services/shop.js).
    shopFreezes: { type: Number, default: 0, min: 0 }, // Streak Freezes in stock
    doubleGemsUntil: { type: Date, default: null }, // Double Gems boost end time
    protectedDays: { type: [String], default: [] }, // YYYY-MM-DD days a Streak Freeze or Streak Repair covered
    shopOwned: { type: [String], default: [] }, // premium items bought once and kept (keys in services/shop.js)
    // When each Special Offer chest was last opened (Early Bird and Night Owl), see services/shop.js.
    chestAt: {
      early: { type: Date, default: null },
      night: { type: Date, default: null },
    },
    // XP boosts won in chests: while one is running, focus minutes and finished tasks give mult x XP in the league.
    xpBoosts: [{ _id: false, from: Date, until: Date, mult: Number }],
    // Weekly League: which trophy (0 Bronze ... 9 Diamond) and when the current 7 day round began.
    league: {
      tier: { type: Number, default: 0, min: 0, max: 9 },
      start: { type: Date, default: null },
      last: { type: mongoose.Schema.Types.Mixed, default: null },
    },

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
