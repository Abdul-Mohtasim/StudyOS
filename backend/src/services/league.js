"use strict";

const mongoose = require("mongoose");
const Student = require("../models/Student");
const Friendship = require("../models/Friendship");
const FocusSession = require("../models/FocusSession");
const Task = require("../models/Task");
const StudentSettings = require("../models/StudentSettings");
const Note = require("../models/Note");
const Flashcard = require("../models/Flashcard");
const Grade = require("../models/Grade");
const PlannerTask = require("../models/PlannerTask");
const Block = require("../models/Block");

// Weekly League. You compete with your friends for 7 days at a time.
//   XP comes from studying (see RULES below): focus minutes, tasks, notes, flashcards, grades, study days and daily goals.
//   When a round ends, finishing in the top 3 (with at least MIN_XP) moves you up one trophy.
//   Otherwise you stay on the same trophy and a fresh 7 day round starts. You are never moved down.
//   Anyone under DEMOTION_XP is shown in the red "Demotion zone" (a warning only).
const DAY = 86400000;
const ROUND_MS = 7 * DAY;
const TOP = 3;
const MIN_XP = 50;
const DEMOTION_XP = 200;
const MAX_TIER = 9;
const TIERS = ["Bronze", "Silver", "Gold", "Sapphire", "Ruby", "Emerald", "Amethyst", "Pearl", "Obsidian", "Diamond"];
const MAX_PEOPLE = 60;

// Everyone who plays in this student's league: the student and their friends (blocked people left out).
async function groupOf(me) {
  const rows = await Friendship.find({ status: "accepted", $or: [{ requester: me }, { recipient: me }] }).select("requester recipient").limit(MAX_PEOPLE * 2).lean();
  const blocks = await Block.find({ $or: [{ blocker: me }, { blocked: me }] }).select("blocker blocked").lean();
  const hidden = new Set(blocks.map((b) => String(String(b.blocker) === String(me) ? b.blocked : b.blocker)));
  const ids = [];
  for (const r of rows) {
    const other = String(String(r.requester) === String(me) ? r.recipient : r.requester);
    if (!hidden.has(other) && !ids.includes(other)) ids.push(other);
  }
  return [String(me), ...ids.slice(0, MAX_PEOPLE - 1)];
}

// ---- How XP is earned (all counted by the server, so nobody can fake it) ----
// Every source has a daily cap, so one busy day can not decide a whole week.
const RULES = {
  focus: { xp: 1 },                  // per minute of focus
  tasks: { xp: 10, cap: 10 },        // per finished task, up to 10 a day
  planner: { xp: 5, cap: 7 },        // per finished study-plan task, up to 7 a day
  notes: { xp: 5, cap: 5 },          // per note written, up to 5 a day
  cards: { xp: 2, cap: 10 },         // per flashcard made, up to 10 a day
  review: { xp: 1, cap: 30 },        // per flashcard reviewed, up to 30 a day
  grades: { xp: 5, cap: 3 },         // per grade logged, up to 3 a day
  days: { xp: 10 },                  // every day you study or finish a task
  goal: { xp: 20 },                  // every day you reach your daily focus goal
};
const dayOf = (f) => ({ $dateToString: { format: "%Y-%m-%d", date: "$" + f } });
// How many documents of a kind each person made on each day inside the round.
function perDay(Model, ids, field, extra, from, to) {
  return Model.aggregate([
    { $match: { student: { $in: ids }, ...extra, [field]: { $gte: from, $lt: to } } },
    { $group: { _id: { s: "$student", d: dayOf(field) }, n: { $sum: 1 } } },
  ]);
}

// XP, tasks, subjects and where the XP came from, for each person inside [from, to).
async function scoresFor(ids, from, to) {
  const oids = ids.map((i) => new mongoose.Types.ObjectId(i));
  const [sess, tasks, planner, notes, cardsNew, review, grades, settings] = await Promise.all([
    FocusSession.aggregate([
      { $match: { student: { $in: oids }, completedAt: { $gte: from, $lt: to } } },
      { $group: { _id: { s: "$student", d: dayOf("completedAt") }, minutes: { $sum: "$durationMinutes" }, subjects: { $addToSet: "$subject" } } },
    ]),
    perDay(Task, oids, "completedAt", { completed: true, deletedAt: null }, from, to),
    perDay(PlannerTask, oids, "updatedAt", { completed: true }, from, to).catch(() => []),
    perDay(Note, oids, "createdAt", {}, from, to).catch(() => []),
    perDay(Flashcard, oids, "createdAt", {}, from, to).catch(() => []),
    perDay(Flashcard, oids, "lastReviewedAt", {}, from, to).catch(() => []),
    perDay(Grade, oids, "createdAt", {}, from, to).catch(() => []),
    StudentSettings.find({ student: { $in: oids } }).select("student dailyGoalMinutes").lean().catch(() => []),
  ]);
  const goalOf = new Map(settings.map((x) => [String(x.student), x.dailyGoalMinutes || 120]));
  const out = new Map(ids.map((i) => [i, {
    minutes: 0, tasks: 0, subjects: 0, xp: 0, _sub: new Set(), _days: new Set(),
    b: { focus: 0, tasks: 0, planner: 0, notes: 0, cards: 0, review: 0, grades: 0, days: 0, goal: 0 },
  }]));
  for (const r of sess) {
    const o = out.get(String(r._id.s));
    if (!o) continue;
    const m = r.minutes || 0;
    o.minutes += m;
    o.b.focus += m * RULES.focus.xp;
    (r.subjects || []).forEach((x) => { if (typeof x === "string" && x.trim()) o._sub.add(x.trim().toLowerCase()); });
    o._days.add(r._id.d);
    if (m >= (goalOf.get(String(r._id.s)) || 120)) o.b.goal += RULES.goal.xp;
  }
  const add = (rows, key, countIt) => {
    for (const r of rows) {
      const o = out.get(String(r._id.s));
      if (!o) continue;
      const rule = RULES[key];
      o.b[key] += Math.min(r.n, rule.cap) * rule.xp;
      if (countIt) { o.tasks += r.n; o._days.add(r._id.d); }
    }
  };
  add(tasks, "tasks", true);
  add(planner, "planner");
  add(notes, "notes");
  add(cardsNew, "cards");
  add(review, "review");
  add(grades, "grades");
  for (const o of out.values()) {
    o.subjects = o._sub.size;
    o.b.days = o._days.size * RULES.days.xp;
    o.xp = Math.round(Object.values(o.b).reduce((x, y) => x + y, 0));
    delete o._sub;
    delete o._days;
  }
  return out;
}

// Rank of `me` (1 = best). Equal XP: the person with more tasks, then the earlier id, ranks higher.
function rankOf(me, ids, sc) {
  const order = [...ids].sort((a, b) => {
    const A = sc.get(a), B = sc.get(b);
    return B.xp - A.xp || B.tasks - A.tasks || (a < b ? -1 : 1);
  });
  return order.indexOf(String(me)) + 1;
}

// Closes every finished 7 day round (a person who was away can have several) and returns the current state.
async function sync(me) {
  const now = Date.now();
  let doc = await Student.findById(me).select("league").lean();
  if (!doc) return null;
  let tier = Math.min(MAX_TIER, Math.max(0, Number(doc.league && doc.league.tier) || 0));
  let start = doc.league && doc.league.start ? new Date(doc.league.start).getTime() : 0;
  let last = (doc.league && doc.league.last) || null;
  if (!start) {
    start = now;
    await Student.updateOne({ _id: me, "league.start": null }, { $set: { "league.start": new Date(start), "league.tier": tier } });
  } else if (now >= start + ROUND_MS) {
    const ids = await groupOf(me);
    let rounds = 0;
    let cur = start;
    while (now >= cur + ROUND_MS && rounds < 12) {
      const sc = await scoresFor(ids, new Date(cur), new Date(cur + ROUND_MS));
      const mine = sc.get(String(me));
      const rank = rankOf(me, ids, sc);
      const up = rank <= TOP && mine.xp >= MIN_XP && tier < MAX_TIER;
      last = { from: tier, to: up ? tier + 1 : tier, rank, xp: mine.xp, up, at: cur + ROUND_MS };
      if (up) tier += 1;
      cur += ROUND_MS;
      rounds += 1;
    }
    if (now >= cur + ROUND_MS) cur = now; // away for months: start fresh
    // only the first request that gets here saves it, so a double tap cannot promote twice
    const won = await Student.updateOne({ _id: me, "league.start": new Date(start) }, { $set: { "league.start": new Date(cur), "league.tier": tier, "league.last": last } });
    if (!won.modifiedCount && !won.nModified) {
      doc = await Student.findById(me).select("league").lean();
      tier = Math.min(MAX_TIER, Math.max(0, Number(doc.league && doc.league.tier) || 0));
      cur = doc.league && doc.league.start ? new Date(doc.league.start).getTime() : now;
      last = (doc.league && doc.league.last) || last;
    }
    start = cur;
  }
  return { tier, start, last };
}

async function view(me) {
  const st = await sync(me);
  if (!st) return null;
  const now = Date.now();
  const ids = await groupOf(me);
  const end = st.start + ROUND_MS;
  const sc = await scoresFor(ids, new Date(st.start), new Date(Math.min(now, end) + 1000));
  const [people, settings] = await Promise.all([
    Student.find({ _id: { $in: ids } }).select("name displayName picture gems").lean(),
    StudentSettings.find({ student: { $in: ids } }).select("student prefs.avatar").lean(),
  ]);
  const av = new Map(settings.map((s) => [String(s.student), s.prefs && typeof s.prefs.avatar === "string" ? s.prefs.avatar.slice(0, 200) : ""]));
  const by = new Map(people.map((p) => [String(p._id), p]));
  const rows = ids
    .filter((i) => by.has(i))
    .map((i) => {
      const p = by.get(i), s = sc.get(i);
      return { id: i, name: p.displayName || p.name || "Student", picture: p.picture || "", avatar: av.get(i) || "", xp: s.xp, tasks: s.tasks, subjects: s.subjects, gems: p.gems || 0, me: i === String(me), ...(i === String(me) ? { b: s.b } : {}) };
    })
    .sort((a, b) => b.xp - a.xp || b.tasks - a.tasks || (a.id < b.id ? -1 : 1));
  return {
    tier: st.tier,
    tiers: TIERS,
    start: st.start,
    end,
    msLeft: Math.max(0, end - now),
    top: TOP,
    minXp: MIN_XP,
    demotionXp: DEMOTION_XP,
    rules: RULES,
    last: st.last && now - st.last.at < 3 * DAY ? st.last : null,
    rows,
  };
}

module.exports = { view, sync, ROUND_MS, TOP, MIN_XP, DEMOTION_XP, TIERS, RULES };
