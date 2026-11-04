"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Grade = require("../models/Grade");
const requireAuth = require("../middleware/auth");
const { parseRequiredDate } = require("../utils/studyFields");

const router = express.Router();
router.use(requireAuth);

const MAX_GRADES_PER_STUDENT = 1000;
const TYPES = ["quiz", "exam", "assignment", "other"];

function cleanGrade(body) {
  const b = body || {};
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const type = b.type === undefined ? "quiz" : b.type;
  const score = Number(b.score);
  const maxScore = Number(b.maxScore);

  if (!subject || subject.length > 100) return { error: "Subject must contain 1–100 characters." };
  if (title.length > 120) return { error: "Title cannot exceed 120 characters." };
  if (!TYPES.includes(type)) return { error: "Invalid grade type." };
  if (!Number.isFinite(score) || score < 0) return { error: "Score must be zero or more." };
  if (!Number.isFinite(maxScore) || maxScore <= 0) return { error: "Maximum score must be above zero." };
  if (score > maxScore * 10) return { error: "Score looks too high for that maximum." };
  const date = parseRequiredDate(b.date, "Date");
  if (!date.ok) return { error: date.message };

  return { value: { subject, title, type, score, maxScore, date: date.value } };
}

// GET /api/grades
router.get("/", async (req, res, next) => {
  try {
    const grades = await Grade.find({ student: req.student._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(MAX_GRADES_PER_STUDENT)
      .lean();
    return res.status(200).json({ grades });
  } catch (error) {
    next(error);
  }
});

// POST /api/grades
router.post("/", async (req, res, next) => {
  try {
    const parsed = cleanGrade(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const total = await Grade.countDocuments({ student: req.student._id });
    if (total >= MAX_GRADES_PER_STUDENT) {
      return res.status(400).json({ message: `You can log up to ${MAX_GRADES_PER_STUDENT} grades.` });
    }

    const grade = await Grade.create({ ...parsed.value, student: req.student._id });
    return res.status(201).json({ message: "Grade saved.", grade });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/grades/:id
router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid grade ID." });
    }
    const parsed = cleanGrade(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const grade = await Grade.findOneAndUpdate(
      { _id: req.params.id, student: req.student._id },
      { $set: parsed.value },
      { new: true, runValidators: true }
    );
    if (!grade) return res.status(404).json({ message: "Grade not found." });
    return res.status(200).json({ message: "Grade updated.", grade });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/grades/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid grade ID." });
    }
    const grade = await Grade.findOneAndDelete({ _id: req.params.id, student: req.student._id });
    if (!grade) return res.status(404).json({ message: "Grade not found." });
    return res.status(200).json({ message: "Grade deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
