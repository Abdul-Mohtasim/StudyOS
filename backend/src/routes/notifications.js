"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/notifications -> { notifications, unread }
router.get("/", async (req, res) => {
  try {
    const [rows, unread] = await Promise.all([
      Notification.find({ student: req.student._id }).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ student: req.student._id, read: false }),
    ]);
    res.json({
      unread,
      notifications: rows.map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.title,
        body: n.body,
        from: n.from ? String(n.from) : null,
        read: n.read,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not load notifications." });
  }
});

// POST /api/notifications/read-all
router.post("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ student: req.student._id, read: false }, { $set: { read: true } });
    res.json({ unread: 0 });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not update notifications." });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid notification." });
    await Notification.deleteOne({ _id: req.params.id, student: req.student._id });
    res.json({ ok: true });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not remove that notification." });
  }
});

module.exports = router;
