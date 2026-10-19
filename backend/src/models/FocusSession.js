
const mongoose = require("mongoose");

const focusSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 180,
    },

    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

focusSessionSchema.index({
  student: 1,
  completedAt: -1,
});

module.exports = mongoose.model("FocusSession", focusSessionSchema);
