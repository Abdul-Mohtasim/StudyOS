"use strict";

// Scheduled emails. Call runEmailJobs() often (every 30-60 minutes is ideal).
// Each email is only sent inside a window of the student's LOCAL time and at most
// once per day/week/exam (tracked in EmailLog), so running it more often is harmless.
//
//   Morning window (07:00-11:59): due-task email, exam countdowns, flashcards due
//   Evening window (19:00-23:59): streak warning
//   Weekly report: Sundays from 18:00

const Student = require("../models/Student");
const Task = require("../models/Task");
const Exam = require("../models/Exam");
const Flashcard = require("../models/Flashcard");
const FocusSession = require("../models/FocusSession");
const EmailPreferences = require("../models/EmailPreferences");
const EmailLog = require("../models/EmailLog");
const { sendMail } = require("./mailer");
const templates = require("./emailTemplates");
const { claim } = require("./accountEmails");
const { isValidTimeZone, partsInZone, addDays } = require("../utils/emailTime");
const { buildWeekly, computeStreak } = require("../utils/emailStats");

const MORNING = [7, 12];
const EVENING = [19, 24];
const WEEKLY_FROM_HOUR = 18;
const MIN_STREAK_TO_WARN = 2;
const MAX_LIST = 12;

const DEFAULT_PREFS = {
  weeklyReport: true,
  examCountdown: true,
  securityAlerts: true,
  dailyDigest: false,
  streakWarning: false,
  flashcardsDue: false,
};

const inWindow = (hour, [from, to]) => hour >= from && hour < to;

async function alreadySent(studentId, key) {
  return Boolean(await EmailLog.exists({ student: studentId, key }));
}

// Claim -> send. If sending fails the claim is released so the next run retries.
async function sendOnce(student, key, message, summary) {
  if (!(await claim(student._id, key))) return;
  try {
    const result = await sendMail({ ...message, to: student.email });
    if (result.skipped) {
      await EmailLog.deleteOne({ student: student._id, key });
      summary.skipped += 1;
      return;
    }
    summary.sent[key.split(":")[0]] = (summary.sent[key.split(":")[0]] || 0) + 1;
  } catch (error) {
    await EmailLog.deleteOne({ student: student._id, key }).catch(() => {});
    summary.errors += 1;
    console.error(`Scheduled email "${key}" failed:`, error.message);
  }
}

async function morningJobs(student, prefs, today, now, summary) {
  const id = student._id;

  if (prefs.dailyDigest && !(await alreadySent(id, `digest:${today}`))) {
    const tomorrow = addDays(today, 1);
    const tasks = await Task.find({
      student: id,
      completed: false,
      deletedAt: null,
      dueDate: { $ne: null, $lte: tomorrow },
    })
      .select("title subject dueDate")
      .sort({ dueDate: 1, createdAt: 1 })
      .limit(60)
      .lean();
    const overdue = tasks.filter((task) => task.dueDate < today).slice(0, MAX_LIST);
    const dueToday = tasks.filter((task) => task.dueDate === today).slice(0, MAX_LIST);
    const dueTomorrow = tasks.filter((task) => task.dueDate === tomorrow).slice(0, MAX_LIST);
    if (overdue.length || dueToday.length) {
      await sendOnce(student, `digest:${today}`, templates.dailyDigest({ student, overdue, today: dueToday, tomorrow: dueTomorrow }), summary);
    }
  }

  if (prefs.examCountdown) {
    for (const daysLeft of [7, 1]) {
      const exams = await Exam.find({ student: id, date: addDays(today, daysLeft) }).select("subject date").lean();
      for (const exam of exams) {
        const key = `exam:${exam._id}:${daysLeft}`;
        if (await alreadySent(id, key)) continue;
        await sendOnce(student, key, templates.examCountdown({ student, subject: exam.subject, date: exam.date, daysLeft }), summary);
      }
    }
  }

  if (prefs.flashcardsDue && !(await alreadySent(id, `cards:${today}`))) {
    const bySubject = await Flashcard.aggregate([
      { $match: { student: id, dueAt: { $lte: now } } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const total = await Flashcard.countDocuments({ student: id, dueAt: { $lte: now } });
    if (total > 0) {
      await sendOnce(
        student,
        `cards:${today}`,
        templates.flashcardsDue({ student, count: total, bySubject: bySubject.map((row) => ({ subject: row._id, count: row.count })) }),
        summary
      );
    }
  }
}

async function eveningJobs(student, prefs, today, zone, now, summary) {
  if (!prefs.streakWarning || (await alreadySent(student._id, `streak:${today}`))) return;
  const since = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000);
  const sessions = await FocusSession.find({ student: student._id, completedAt: { $gte: since } }).select("completedAt").lean();
  const keys = new Set(sessions.map((session) => partsInZone(new Date(session.completedAt), zone).dateKey));
  const { streak, studiedToday } = computeStreak(keys, today);
  if (!studiedToday && streak >= MIN_STREAK_TO_WARN) {
    await sendOnce(student, `streak:${today}`, templates.streakWarning({ student, streak }), summary);
  }
}

async function weeklyJob(student, today, zone, now, summary) {
  const key = `weekly:${today}`;
  if (await alreadySent(student._id, key)) return;
  const since = new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000);
  const [sessions, tasks] = await Promise.all([
    FocusSession.find({ student: student._id, completedAt: { $gte: since } }).select("completedAt durationMinutes subject").lean(),
    Task.find({ student: student._id, completed: true, deletedAt: null, completedAt: { $gte: since } }).select("completedAt subject completed").lean(),
  ]);
  const weekly = buildWeekly({ sessions, tasks, todayKey: today, timeZone: zone });
  const quiet = [weekly.current, weekly.previous].every((w) => !w.minutes && !w.tasks && !w.sessions);
  if (quiet) return;
  await sendOnce(student, key, templates.weeklyReport({ student, weekly }), summary);
}

async function runEmailJobs({ now = new Date() } = {}) {
  const started = Date.now();
  const budgetMs = Number(process.env.EMAIL_RUN_BUDGET_MS) || 8500;
  const defaultZone = isValidTimeZone(process.env.DEFAULT_TIMEZONE) ? process.env.DEFAULT_TIMEZONE : "UTC";
  const summary = { checked: 0, sent: {}, skipped: 0, errors: 0, partial: false };

  const prefsRows = await EmailPreferences.find({}).lean();
  const prefsByStudent = new Map(prefsRows.map((row) => [String(row.student), row]));

  // Only people whose address is verified (Google accounts always are).
  const cursor = Student.find({
    $or: [{ emailVerified: true }, { googleId: { $not: /^email:/ } }],
  })
    .select("name displayName email")
    .lean()
    .cursor();

  for await (const student of cursor) {
    if (Date.now() - started > budgetMs) {
      summary.partial = true;
      break;
    }
    summary.checked += 1;

    const row = prefsByStudent.get(String(student._id)) || {};
    const prefs = { ...DEFAULT_PREFS };
    for (const key of Object.keys(DEFAULT_PREFS)) {
      if (typeof row[key] === "boolean") prefs[key] = row[key];
    }
    const zone = isValidTimeZone(row.timeZone) ? row.timeZone : defaultZone;
    const local = partsInZone(now, zone);

    try {
      if (inWindow(local.hour, MORNING)) await morningJobs(student, prefs, local.dateKey, now, summary);
      if (inWindow(local.hour, EVENING)) await eveningJobs(student, prefs, local.dateKey, zone, now, summary);
      if (prefs.weeklyReport && local.weekday === 0 && local.hour >= WEEKLY_FROM_HOUR) {
        await weeklyJob(student, local.dateKey, zone, now, summary);
      }
    } catch (error) {
      summary.errors += 1;
      console.error("Scheduled email job failed for one student:", error.message);
    }
  }

  summary.ms = Date.now() - started;
  return summary;
}

module.exports = { runEmailJobs, DEFAULT_PREFS };
