"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const requireAuth = require("../middleware/auth");
const { parseRequiredDate } = require("../utils/studyFields");

const router = express.Router();

// All exam routes require authentication.
router.use(requireAuth);

const MAX_EXAMS_PER_STUDENT = 100;

// GET /api/exams — the student's exam dates, soonest first.
router.get("/", async (req, res, next) => {
  try {
    const exams = await Exam.find({ student: req.student._id }).sort({
      date: 1,
    });

    return res.status(200).json({ exams });
  } catch (error) {
    next(error);
  }
});

// PUT /api/exams — set (or change) the exam date for a subject.
router.put("/", async (req, res, next) => {
  try {
    const { subject, date } = req.body || {};

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      subject.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Subject must contain 1–100 characters.",
      });
    }

    const parsedDate = parseRequiredDate(date, "Exam date");

    if (!parsedDate.ok) {
      return res.status(400).json({ message: parsedDate.message });
    }

    const cleanSubject = subject.trim();
    const subjectKey = cleanSubject.toLowerCase();

    const existing = await Exam.exists({
      student: req.student._id,
      subjectKey,
    });

    if (!existing) {
      const total = await Exam.countDocuments({ student: req.student._id });

      if (total >= MAX_EXAMS_PER_STUDENT) {
        return res.status(400).json({
          message: `You can save up to ${MAX_EXAMS_PER_STUDENT} exam dates.`,
        });
      }
    }

    const exam = await Exam.findOneAndUpdate(
      { student: req.student._id, subjectKey },
      {
        $set: { subject: cleanSubject, date: parsedDate.value },
        $setOnInsert: { student: req.student._id, subjectKey },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Exam date saved.",
      exam,
    });
  } catch (error) {
    // Two requests racing to create the same subject.
    if (error && error.code === 11000) {
      return res.status(409).json({
        message: "This exam was just saved. Please try again.",
      });
    }

    next(error);
  }
});

// DELETE /api/exams/:id — remove an exam date.
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid exam ID." });
    }

    const exam = await Exam.findOneAndDelete({
      _id: id,
      student: req.student._id,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    return res.status(200).json({ message: "Exam date removed." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
