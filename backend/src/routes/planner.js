
const express = require("express");
const mongoose = require("mongoose");
const PlannerTask = require("../models/PlannerTask");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const plannerDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function isValidDeadline(value) {
  if (value === "") return true;

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Every planner request requires an authenticated student.
router.use(requireAuth);

// GET /api/planner — retrieve only this student's planner tasks.
router.get("/", async (req, res, next) => {
  try {
    const tasks = await PlannerTask.find({
      student: req.student._id,
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
});

// POST /api/planner — create a planner task.
router.post("/", async (req, res, next) => {
  try {
    const { title, subject, day, deadline = "" } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 120
    ) {
      return res.status(400).json({
        message: "Title must contain 1–120 characters.",
      });
    }

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      subject.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Subject must contain 1–100 characters.",
      });
    }

    if (!plannerDays.includes(day)) {
      return res.status(400).json({
        message: "Choose a valid day of the week.",
      });
    }

    if (!isValidDeadline(deadline)) {
      return res.status(400).json({
        message: "Enter a valid deadline date.",
      });
    }

    const task = await PlannerTask.create({
      student: req.student._id,
      title: title.trim(),
      subject: subject.trim(),
      day,
      deadline,
      completed: false,
    });

    return res.status(201).json({
      message: "Planner task saved successfully.",
      task,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/planner/:id — update completion status.
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid planner task ID.",
      });
    }

    if (
      Object.keys(req.body).length !== 1 ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "Provide only a valid completed value.",
      });
    }

    const task = await PlannerTask.findOneAndUpdate(
      {
        _id: id,
        student: req.student._id,
      },
      {
        $set: { completed },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Planner task not found.",
      });
    }

    return res.status(200).json({
      message: "Planner task updated successfully.",
      task,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/planner/:id — delete only this student's planner task.
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid planner task ID.",
      });
    }

    const task = await PlannerTask.findOneAndDelete({
      _id: id,
      student: req.student._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Planner task not found.",
      });
    }

    return res.status(200).json({
      message: "Planner task deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
