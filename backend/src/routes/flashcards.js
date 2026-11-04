"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Flashcard = require("../models/Flashcard");
const requireAuth = require("../middleware/auth");
const { nextSchedule } = require("../utils/srs");

const router = express.Router();
router.use(requireAuth);

const MAX_CARDS_PER_STUDENT = 3000;
const MAX_BULK = 50;

function cleanCard(input) {
  if (!input || typeof input !== "object") return { error: "Invalid card." };
  const front = typeof input.front === "string" ? input.front.trim() : "";
  const back = typeof input.back === "string" ? input.back.trim() : "";
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const noteId = typeof input.noteId === "string" ? input.noteId.trim() : "";
  if (!front || front.length > 400) return { error: "Front must contain 1–400 characters." };
  if (!back || back.length > 1000) return { error: "Back must contain 1–1000 characters." };
  if (subject.length > 100) return { error: "Subject cannot exceed 100 characters." };
  return { value: { front, back, subject, noteId: noteId.slice(0, 40) } };
}

// GET /api/flashcards
router.get("/", async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({ student: req.student._id })
      .sort({ createdAt: -1 })
      .limit(MAX_CARDS_PER_STUDENT)
      .lean();
    return res.status(200).json({ flashcards });
  } catch (error) {
    next(error);
  }
});

// POST /api/flashcards — one card.
router.post("/", async (req, res, next) => {
  try {
    const parsed = cleanCard(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const total = await Flashcard.countDocuments({ student: req.student._id });
    if (total >= MAX_CARDS_PER_STUDENT) {
      return res.status(400).json({ message: `You can keep up to ${MAX_CARDS_PER_STUDENT} flashcards.` });
    }

    const flashcard = await Flashcard.create({ ...parsed.value, student: req.student._id });
    return res.status(201).json({ message: "Flashcard created.", flashcard });
  } catch (error) {
    next(error);
  }
});

// POST /api/flashcards/bulk — several cards at once (e.g. generated from a note).
router.post("/bulk", async (req, res, next) => {
  try {
    const list = Array.isArray(req.body && req.body.cards) ? req.body.cards : null;
    if (!list || list.length === 0 || list.length > MAX_BULK) {
      return res.status(400).json({ message: `Send between 1 and ${MAX_BULK} cards.` });
    }

    const docs = [];
    for (const item of list) {
      const parsed = cleanCard(item);
      if (parsed.error) return res.status(400).json({ message: parsed.error });
      docs.push({ ...parsed.value, student: req.student._id });
    }

    const total = await Flashcard.countDocuments({ student: req.student._id });
    if (total + docs.length > MAX_CARDS_PER_STUDENT) {
      return res.status(400).json({ message: `You can keep up to ${MAX_CARDS_PER_STUDENT} flashcards.` });
    }

    const flashcards = await Flashcard.insertMany(docs);
    return res.status(201).json({ message: "Flashcards created.", flashcards });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/flashcards/:id — edit text / subject.
router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid flashcard ID." });
    }
    const parsed = cleanCard({ ...req.body });
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, student: req.student._id },
      { $set: { front: parsed.value.front, back: parsed.value.back, subject: parsed.value.subject } },
      { new: true, runValidators: true }
    );
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found." });
    return res.status(200).json({ message: "Flashcard updated.", flashcard });
  } catch (error) {
    next(error);
  }
});

// POST /api/flashcards/:id/review  { grade: 0-3, reviewedAt? }
router.post("/:id/review", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid flashcard ID." });
    }
    const grade = req.body && req.body.grade;
    if (![0, 1, 2, 3].includes(grade)) {
      return res.status(400).json({ message: "Grade must be 0, 1, 2 or 3." });
    }

    let reviewedAt = new Date();
    if (req.body.reviewedAt) {
      const d = new Date(req.body.reviewedAt);
      const now = Date.now();
      if (!Number.isNaN(d.getTime()) && d.getTime() <= now + 60000 && d.getTime() >= now - 30 * 86400000) {
        reviewedAt = d;
      }
    }

    const card = await Flashcard.findOne({ _id: req.params.id, student: req.student._id });
    if (!card) return res.status(404).json({ message: "Flashcard not found." });

    Object.assign(card, nextSchedule(card, grade, reviewedAt), { lastReviewedAt: reviewedAt });
    await card.save();
    return res.status(200).json({ message: "Review saved.", flashcard: card });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/flashcards/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid flashcard ID." });
    }
    const card = await Flashcard.findOneAndDelete({ _id: req.params.id, student: req.student._id });
    if (!card) return res.status(404).json({ message: "Flashcard not found." });
    return res.status(200).json({ message: "Flashcard deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
