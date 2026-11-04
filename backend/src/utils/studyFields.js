"use strict";

// Small, dependency-free validators shared by the task, note, focus-session
// and exam routes. Each helper returns { ok: true, value } or
// { ok: false, message } so routes can answer with a clear 400 error.

const PRIORITIES = ["low", "medium", "high"];
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 30;

function parsePriority(value) {
  if (typeof value !== "string" || !PRIORITIES.includes(value)) {
    return {
      ok: false,
      message: "Priority must be low, medium or high.",
    };
  }

  return { ok: true, value };
}

// Dates are stored as plain "YYYY-MM-DD" strings so that a due date or exam
// date never shifts by a day because of time zones.
function isRealCalendarDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    year >= 2000 &&
    year <= 2100
  );
}

// null or "" clears the date.
function parseOptionalDate(value, label = "Date") {
  if (value === null || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "string" || !isRealCalendarDate(value)) {
    return {
      ok: false,
      message: `${label} must be a valid date in YYYY-MM-DD format.`,
    };
  }

  return { ok: true, value };
}

function parseRequiredDate(value, label = "Date") {
  const result = parseOptionalDate(value, label);

  if (result.ok && result.value === null) {
    return { ok: false, message: `${label} is required.` };
  }

  return result;
}

function parseTags(value) {
  if (!Array.isArray(value)) {
    return { ok: false, message: "Tags must be a list." };
  }

  const clean = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return { ok: false, message: "Each tag must be text." };
    }

    const tag = item
      .trim()
      .replace(/^#+/, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    if (!tag) continue;

    if (tag.length > MAX_TAG_LENGTH) {
      return {
        ok: false,
        message: `Each tag can have up to ${MAX_TAG_LENGTH} characters.`,
      };
    }

    if (!clean.includes(tag)) clean.push(tag);
  }

  if (clean.length > MAX_TAGS) {
    return {
      ok: false,
      message: `A note can have up to ${MAX_TAGS} tags.`,
    };
  }

  return { ok: true, value: clean };
}

function parseOptionalSubject(value) {
  if (value === undefined || value === null) {
    return { ok: true, value: "" };
  }

  if (typeof value !== "string" || value.trim().length > 100) {
    return {
      ok: false,
      message: "Subject must be a string of up to 100 characters.",
    };
  }

  return { ok: true, value: value.trim() };
}

module.exports = {
  PRIORITIES,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  isRealCalendarDate,
  parsePriority,
  parseOptionalDate,
  parseRequiredDate,
  parseTags,
  parseOptionalSubject,
};
