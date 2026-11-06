"use strict";

// Same numbers as the in-app Weekly Summary (frontend/src/studyHelpers.js):
// "this week" = the last 7 days including today, "last week" = the 7 days before that.

const { partsInZone, addDays } = require("./emailTime");

function weekKeys(todayKey, offset) {
  return new Set(Array.from({ length: 7 }, (_, index) => addDays(todayKey, -offset - index)));
}

function buildWeekly({ sessions = [], tasks = [], todayKey, timeZone }) {
  const thisWeek = weekKeys(todayKey, 0);
  const lastWeek = weekKeys(todayKey, 7);
  const totals = {
    current: { minutes: 0, sessions: 0, tasks: 0 },
    previous: { minutes: 0, sessions: 0, tasks: 0 },
  };
  const subjectMinutes = new Map();
  const subjectTasks = new Map();

  const bucketFor = (key) => (thisWeek.has(key) ? "current" : lastWeek.has(key) ? "previous" : null);

  for (const session of sessions) {
    const when = new Date(session.completedAt);
    if (Number.isNaN(when.getTime())) continue;
    const bucket = bucketFor(partsInZone(when, timeZone).dateKey);
    if (!bucket) continue;
    const minutes = Math.max(0, Number(session.durationMinutes) || 0);
    totals[bucket].minutes += minutes;
    totals[bucket].sessions += 1;
    const subject = String(session.subject || "").trim();
    if (bucket === "current" && subject) {
      subjectMinutes.set(subject, (subjectMinutes.get(subject) || 0) + minutes);
    }
  }

  for (const task of tasks) {
    if (!task.completed) continue;
    const when = new Date(task.completedAt);
    if (Number.isNaN(when.getTime())) continue;
    const bucket = bucketFor(partsInZone(when, timeZone).dateKey);
    if (!bucket) continue;
    totals[bucket].tasks += 1;
    const subject = String(task.subject || "Personal").trim();
    if (bucket === "current") subjectTasks.set(subject, (subjectTasks.get(subject) || 0) + 1);
  }

  const top = (map) =>
    [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];

  let best = null;
  if (subjectMinutes.size > 0) {
    const [name, minutes] = top(subjectMinutes);
    best = { name, minutes, basis: "focus" };
  } else if (subjectTasks.size > 0) {
    const [name, count] = top(subjectTasks);
    best = { name, tasks: count, basis: "tasks" };
  }

  return { current: totals.current, previous: totals.previous, best };
}

// Consecutive days with a focus session, counted back from today
// (or from yesterday when today has no session yet), like the dashboard flame.
function computeStreak(dateKeys, todayKey) {
  const studiedToday = dateKeys.has(todayKey);
  let cursor = studiedToday ? todayKey : addDays(todayKey, -1);
  let streak = 0;
  while (dateKeys.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return { streak, studiedToday };
}

function compareToLast(current, previous) {
  if (!previous && !current) return "—";
  if (!previous) return "New";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "Same";
  return `${change > 0 ? "+" : ""}${change}%`;
}

function formatHours(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  if (value < 60) return `${value}m`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

module.exports = { buildWeekly, computeStreak, compareToLast, formatHours };
