const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    type: {
      type: String,
      enum: ["friend_request", "friend_accepted", "new_follower", "gems", "streak", "system"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, default: "", maxlength: 300 },
    // Student id of the person this is about (friend requests), so the app can show buttons.
    from: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ student: 1, createdAt: -1 });
// Notifications disappear by themselves after 60 days.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
