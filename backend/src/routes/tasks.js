
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// All task routes require authentication.
router.use(requireAuth);

// GET /api/tasks — get the logged-in student's active tasks.
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({
      student: req.student._id,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks — create a task.
router.post("/", async (req, res, next) => {
  try {
    const { title, subject, duration } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "A task title is required.",
      });
    }

    const cleanTitle = title.trim();

    if (cleanTitle.length > 200) {
      return res.status(400).json({
        message: "Task title cannot exceed 200 characters.",
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

    let cleanDuration = 25;

    if (duration !== undefined) {
      cleanDuration = Number(duration);

      if (
        !Number.isInteger(cleanDuration) ||
        cleanDuration < 1 ||
        cleanDuration > 1440
      ) {
        return res.status(400).json({
          message: "Duration must be an integer between 1 and 1440 minutes.",
        });
      }
    }

    const task = await Task.create({
      student: req.student._id,
      title: cleanTitle,
      subject:
        subject === undefined ? "Personal" : subject.trim() || "Personal",
      duration: cleanDuration,
    });

    return res.status(201).json({
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id — update an active task.
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const allowedFields = ["title", "subject", "duration", "completed"];
    const updates = {};
    const suppliedFields = Object.keys(req.body);

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        message: "Provide valid task fields to update.",
      });
    }

    for (const field of suppliedFields) {
      const value = req.body[field];

      if (field === "title") {
        if (
          typeof value !== "string" ||
          !value.trim() ||
          value.trim().length > 200
        ) {
          return res.status(400).json({
            message: "Title must contain 1–200 characters.",
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

      if (field === "duration") {
        if (
          !Number.isInteger(value) ||
          value < 1 ||
          value > 1440
        ) {
          return res.status(400).json({
            message: "Duration must be an integer between 1 and 1440 minutes.",
          });
        }

        updates.duration = value;
      }

      if (field === "completed") {
        if (typeof value !== "boolean") {
          return res.status(400).json({
            message: "Completed must be true or false.",
          });
        }

        updates.completed = value;
      }
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        student: req.student._id,
        deletedAt: null,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id — temporarily delete the student's task.
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        student: req.student._id,
        deletedAt: null,
      },
      {
        $set: { deletedAt: new Date() },
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully. You can undo this action.",
      task,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/:id/restore — undo a task deletion.
router.post("/:id/restore", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        student: req.student._id,
        deletedAt: { $ne: null },
      },
      {
        $set: { deletedAt: null },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Deleted task not found or it has already been restored.",
      });
    }

    return res.status(200).json({
      message: "Task restored successfully.",
      task,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
