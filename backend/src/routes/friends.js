"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Friendship = require("../models/Friendship");
const Notification = require("../models/Notification");
const FocusSession = require("../models/FocusSession");
const Task = require("../models/Task");
const requireAuth = require("../middleware/auth");
const { award } = require("../services/gems");

const router = express.Router();
router.use(requireAuth);

const MAX_EMAILS = 500;
const MAX_FRIENDS = 500;
const FRIEND_BONUS = 10;

const publicUser = (s) => ({
  id: String(s._id),
  name: s.displayName || s.name,
  picture: s.picture || "",
  gems: s.gems || 0,
});
const USER_FIELDS = "name displayName picture gems";
const displayOf = (s) => s.displayName || s.name || "Someone";

// Which of the phone's contacts already use StudyOS?
// The emails are only compared, never stored.
router.post("/match", async (req, res) => {
  try {
    const raw = Array.isArray(req.body?.emails) ? req.body.emails : [];
    const emails = [...new Set(
      raw
        .filter((e) => typeof e === "string")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 3 && e.length <= 254 && e.includes("@"))
    )].slice(0, MAX_EMAILS);
    if (!emails.length) return res.json({ matches: [] });

    const found = await Student.find({ email: { $in: emails }, _id: { $ne: req.student._id } })
      .select("name displayName picture email")
      .limit(50)
      .lean();

    res.json({
      matches: found.map((s) => ({
        id: String(s._id),
        name: s.displayName || s.name,
        picture: s.picture || "",
        email: s.email,
      })),
    });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not look up friends right now." });
  }
});

// Friends work like following: you follow someone and they see you as a follower.
// GET /api/friends -> { following, followers, leaderboard }
// GET /api/friends -> accepted friends, requests sent to me, requests I sent, weekly leaderboard.
router.get("/", async (req, res) => {
  try {
    const me = req.student._id;
    const rows = await Friendship.find({ $or: [{ requester: me }, { recipient: me }] })
      .limit(MAX_FRIENDS * 2)
      .populate("requester", USER_FIELDS)
      .populate("recipient", USER_FIELDS)
      .lean();
    const friends = [];
    const incoming = [];
    const outgoing = [];
    for (const row of rows) {
      if (!row.requester || !row.recipient) continue; // an account was deleted
      const mine = String(row.requester._id) === String(me);
      const other = publicUser(mine ? row.recipient : row.requester);
      if (row.status === "pending") (mine ? outgoing : incoming).push(other);
      else friends.push(other);
    }

    // Minutes studied in the last 7 days: me plus my friends.
    const ids = [me, ...friends.map((u) => new mongoose.Types.ObjectId(u.id))];
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const totals = await FocusSession.aggregate([
      { $match: { student: { $in: ids }, completedAt: { $gte: since } } },
      { $group: { _id: "$student", minutes: { $sum: "$durationMinutes" } } },
    ]);
    const minutesOf = new Map(totals.map((t) => [String(t._id), t.minutes]));
    const leaderboard = [
      { id: String(me), name: displayOf(req.student), minutes: minutesOf.get(String(me)) || 0, me: true },
      ...friends.map((u) => ({ id: u.id, name: u.name, minutes: minutesOf.get(u.id) || 0, me: false })),
    ].sort((x, y) => y.minutes - x.minutes);

    // `following` is kept so older app versions still show their friends.
    res.json({ friends, incoming, outgoing, following: friends, followers: [], leaderboard });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not load your friends right now." });
  }
});

// GET /api/friends/:userId/profile -> a friend's real study numbers (only for accepted friends).
//   { id, name, picture, joinedYear, gems, streak, hours, tasksDone, sessions, friendsCount,
//     week: [{ date, label, minutes }] (last 7 days, oldest first), meWeek: same for the signed-in student }
const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

async function studyNumbers(id) {
  const [sessions, tasks] = await Promise.all([
    FocusSession.find({ student: id }).select("durationMinutes completedAt").sort({ completedAt: -1 }).limit(3000).lean(),
    Task.find({ student: id, completed: true, deletedAt: null }).select("completedAt").sort({ completedAt: -1 }).limit(3000).lean(),
  ]);
  const days = new Set();
  const minutesByDay = new Map();
  let totalMinutes = 0;
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const key = dayKey(s.completedAt);
    days.add(key);
    minutesByDay.set(key, (minutesByDay.get(key) || 0) + (s.durationMinutes || 0));
    totalMinutes += s.durationMinutes || 0;
  }
  for (const t of tasks) if (t.completedAt) days.add(dayKey(t.completedAt));
  return { days, minutesByDay, totalMinutes, sessions: sessions.length, tasksDone: tasks.length };
}

function streakOf(days, protectedDays) {
  const all = new Set([...days, ...(protectedDays || [])]);
  const today = dayKey(Date.now());
  let cursor = all.has(today) ? Date.parse(today) : Date.parse(today) - DAY_MS;
  let streak = 0;
  while (all.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

function weekOf(minutesByDay) {
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const at = Date.now() - i * DAY_MS;
    const key = dayKey(at);
    out.push({ date: key, label: LETTERS[new Date(at).getUTCDay()], minutes: minutesByDay.get(key) || 0 });
  }
  return out;
}

router.get("/:userId/profile", async (req, res) => {
  try {
    const other = req.params.userId;
    if (!mongoose.isValidObjectId(other)) return res.status(400).json({ message: "Invalid person." });
    const me = req.student._id;

    const link = await Friendship.findOne({
      status: "accepted",
      $or: [{ requester: me, recipient: other }, { requester: other, recipient: me }],
    }).lean();
    if (!link) return res.status(403).json({ message: "You can only open the profile of a friend." });

    const friend = await Student.findById(other).select("name displayName picture gems createdAt protectedDays").lean();
    if (!friend) return res.status(404).json({ message: "That friend could not be found." });

    const [theirs, mine, friendsCount] = await Promise.all([
      studyNumbers(other),
      studyNumbers(me),
      Friendship.countDocuments({ status: "accepted", $or: [{ requester: other }, { recipient: other }] }),
    ]);

    res.json({
      id: String(friend._id),
      name: friend.displayName || friend.name,
      picture: friend.picture || "",
      joinedYear: friend.createdAt ? new Date(friend.createdAt).getUTCFullYear() : null,
      gems: friend.gems || 0,
      streak: streakOf(theirs.days, friend.protectedDays),
      hours: Math.round((theirs.totalMinutes / 60) * 10) / 10,
      tasksDone: theirs.tasksDone,
      sessions: theirs.sessions,
      friendsCount,
      week: weekOf(theirs.minutesByDay),
      meWeek: weekOf(mine.minutesByDay),
    });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not load that profile right now." });
  }
});

// Pays the one-time friend bonus to both people (never twice for the same pair).
async function payBonus(row) {
  const claimed = await Friendship.findOneAndUpdate(
    { _id: row._id, bonusPaid: { $ne: true } },
    { $set: { bonusPaid: true } },
    { new: true }
  ).lean();
  if (!claimed) return 0;
  await award(row.requester, FRIEND_BONUS);
  await award(row.recipient, FRIEND_BONUS);
  return FRIEND_BONUS;
}

// POST /api/friends/request  { userId } or { email }  -> asks that person to be friends
router.post("/request", async (req, res) => {
  try {
    const me = req.student._id;
    let target = null;
    const userId = req.body?.userId;
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (userId !== undefined) {
      if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: "Invalid person." });
      }
      target = await Student.findById(userId).select(USER_FIELDS).lean();
    } else if (email) {
      if (email.length > 254 || !email.includes("@")) {
        return res.status(400).json({ message: "Enter a valid email address." });
      }
      target = await Student.findOne({ email }).select(USER_FIELDS).lean();
    } else {
      return res.status(400).json({ message: "Tell us who to add." });
    }

    // Same answer whether or not the account exists, so emails cannot be probed.
    if (!target) return res.json({ status: "sent", message: "Request sent, if that person has StudyOS." });
    if (String(target._id) === String(me)) {
      return res.status(400).json({ message: "You cannot add yourself." });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: me, recipient: target._id },
        { requester: target._id, recipient: me },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.json({ status: "friends", message: "You are already friends.", user: publicUser(target) });
      }
      if (String(existing.requester) === String(me)) {
        return res.json({ status: "sent", message: "Request already sent." });
      }
      // They already asked me: asking back means yes.
      existing.status = "accepted";
      await existing.save();
      const bonus = await payBonus(existing);
      await Notification.create({
        student: target._id,
        type: "friend_accepted",
        title: `${displayOf(req.student)} is now your friend`,
        body: bonus ? `You both earned ${bonus} gems.` : "",
        from: me,
      });
      return res.json({ status: "friends", message: "You are now friends!", bonus, user: publicUser(target) });
    }

    const count = await Friendship.countDocuments({ $or: [{ requester: me }, { recipient: me }] });
    if (count >= MAX_FRIENDS) return res.status(400).json({ message: "You have reached the friends limit." });

    try {
      await Friendship.create({ requester: me, recipient: target._id, status: "pending" });
    } catch (error) {
      if (error?.code !== 11000) throw error; // sent in a parallel request
      return res.json({ status: "sent", message: "Request already sent." });
    }
    await Notification.create({
      student: target._id,
      type: "friend_request",
      title: `${displayOf(req.student)} wants to study with you`,
      body: "Accept to become friends and earn gems.",
      from: me,
    });
    res.json({ status: "sent", message: "Request sent.", user: publicUser(target) });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not send that request right now." });
  }
});

// POST /api/friends/respond  { userId, accept }  -> answer a request someone sent me
router.post("/respond", async (req, res) => {
  try {
    const me = req.student._id;
    const userId = req.body?.userId;
    if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid person." });
    }
    const accept = req.body?.accept === true;
    const row = await Friendship.findOne({ requester: userId, recipient: me, status: "pending" });
    if (!row) return res.status(404).json({ message: "That request is no longer there." });

    if (!accept) {
      await Friendship.deleteOne({ _id: row._id });
      await Notification.deleteMany({ student: me, type: "friend_request", from: userId });
      return res.json({ status: "declined" });
    }

    row.status = "accepted";
    await row.save();
    const bonus = await payBonus(row);
    await Notification.deleteMany({ student: me, type: "friend_request", from: userId });
    await Notification.create({
      student: userId,
      type: "friend_accepted",
      title: `${displayOf(req.student)} accepted your request`,
      body: bonus ? `You both earned ${bonus} gems.` : "",
      from: me,
    });
    const doc = await Student.findById(me).select("gems").lean();
    res.json({ status: "friends", bonus, gems: doc?.gems || 0 });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not answer that request right now." });
  }
});

// DELETE /api/friends/:userId  (remove a friend, cancel my request or decline theirs)
router.delete("/:userId", async (req, res) => {
  try {
    const other = req.params.userId;
    if (!mongoose.isValidObjectId(other)) return res.status(400).json({ message: "Invalid person." });
    const me = req.student._id;
    await Friendship.deleteMany({
      $or: [
        { requester: me, recipient: other },
        { requester: other, recipient: me },
      ],
    });
    res.json({ status: "removed" });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ error: "Could not remove that friend right now." });
  }
});

module.exports = router;
