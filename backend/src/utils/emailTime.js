"use strict";

// Time-zone helpers for scheduled emails. Dates in StudyOS are "YYYY-MM-DD" text,
// so everything here works with those keys in the student's own time zone.

function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || !timeZone || timeZone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// { dateKey: "YYYY-MM-DD", hour: 0-23, weekday: 0 (Sunday) - 6 } for an instant in a zone.
function partsInZone(date, timeZone) {
  const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  return {
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) % 24,
    weekday: WEEKDAYS[get("weekday")] ?? 0,
  };
}

function keyToUtcDate(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(dateKey, amount) {
  const date = keyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromKey, toKey) {
  return Math.round((keyToUtcDate(toKey) - keyToUtcDate(fromKey)) / 86400000);
}

// "Mon, Dec 15, 2026" for a YYYY-MM-DD key.
function formatDateKey(dateKey) {
  return keyToUtcDate(dateKey).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

module.exports = { isValidTimeZone, partsInZone, addDays, daysBetween, formatDateKey };
