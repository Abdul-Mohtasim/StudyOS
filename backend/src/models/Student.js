
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
    picture: {
      type: String,
      default: "",
      maxlength: 2048,
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
