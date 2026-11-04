const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const requireAuth = require("../middleware/auth");
const { parseTags } = require("../utils/studyFields");

const router = express.Router();

// All note routes require a valid signed-in student.
router.use(requireAuth);

// GET /api/notes — list only the authenticated student's notes.
router.get("/", async (req, res, next) => {
  try {
    const notes = await Note.find({
      student: req.student._id,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({ notes });
  } catch (error) {
    next(error);
  }
});

// POST /api/notes — create a note for the authenticated student.
router.post("/", async (req, res, next) => {
  try {
    const { title, subject, content, tags, pinned } = req.body;

    if (typeof title !== "string" || !title.trim() || title.trim().length > 120) {
      return res.status(400).json({
        message: "Title must contain 1–120 characters.",
      });
    }

    if (
      subject !== undefined &&
      (typeof subject !== "string" || subject.trim().length > 100)
    ) {
      return res.status(400).json({
        message: "Subject must be a string of up to 100 characters.",
      });
    }

    if (
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 20000
    ) {
      return res.status(400).json({
        message: "Note content must contain 1–20000 characters.",
      });
    }

    let cleanTags = [];

    if (tags !== undefined) {
      const parsedTags = parseTags(tags);

      if (!parsedTags.ok) {
        return res.status(400).json({ message: parsedTags.message });
      }

      cleanTags = parsedTags.value;
    }

    if (pinned !== undefined && typeof pinned !== "boolean") {
      return res.status(400).json({
        message: "Pinned must be true or false.",
      });
    }

    const note = await Note.create({
      student: req.student._id,
      title: title.trim(),
      subject: subject === undefined ? "Personal" : subject.trim() || "Personal",
      content: content.trim(),
      tags: cleanTags,
      pinned: pinned === true,
    });

    return res.status(201).json({
      message: "Note created successfully.",
      note,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notes/:id — update only a note owned by the student.
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID.",
      });
    }

    const allowedFields = ["title", "subject", "content", "tags", "pinned"];
    const suppliedFields = Object.keys(req.body);
    const updates = {};

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        message: "Provide valid note fields to update.",
      });
    }

    for (const field of suppliedFields) {
      const value = req.body[field];

      if (field === "title") {
        if (
          typeof value !== "string" ||
          !value.trim() ||
          value.trim().length > 120
        ) {
          return res.status(400).json({
            message: "Title must contain 1–120 characters.",
          });
        }
        updates.title = value.trim();
      }

      if (field === "subject") {
        if (typeof value !== "string" || value.trim().length > 100) {
          return res.status(400).json({
            message: "Subject must be a string of up to 100 characters.",
          });
        }
        updates.subject = value.trim() || "Personal";
      }

      if (field === "content") {
        if (
          typeof value !== "string" ||
          !value.trim() ||
          value.trim().length > 20000
        ) {
          return res.status(400).json({
            message: "Note content must contain 1–20000 characters.",
          });
        }
        updates.content = value.trim();
      }

      if (field === "tags") {
        const parsedTags = parseTags(value);

        if (!parsedTags.ok) {
          return res.status(400).json({ message: parsedTags.message });
        }

        updates.tags = parsedTags.value;
      }

      if (field === "pinned") {
        if (typeof value !== "boolean") {
          return res.status(400).json({
            message: "Pinned must be true or false.",
          });
        }

        updates.pinned = value;
      }
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: id,
        student: req.student._id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        // Pinning or unpinning is not an edit, so "Updated" keeps its date.
        timestamps: !(suppliedFields.length === 1 && suppliedFields[0] === "pinned"),
      }
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      message: "Note updated successfully.",
      note,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id — delete only a note owned by the student.
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: id,
      student: req.student._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      message: "Note deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
