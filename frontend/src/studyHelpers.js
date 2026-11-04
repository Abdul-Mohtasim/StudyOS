// Pure helpers for the StudyOS planning features: priorities and due dates,
// exam countdowns, note formatting and the weekly summary. Nothing in here
// touches React, the network or the DOM, so it is easy to test.

export const PRIORITIES = ["low", "medium", "high"];
export const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function nextPriority(priority) {
  const index = PRIORITIES.indexOf(priority);
  return PRIORITIES[(index + 1) % PRIORITIES.length];
}

// ---------- Dates ("YYYY-MM-DD" strings, always local time) ----------
export function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateKeyToDate(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Whole days from today to the date (0 = today, negative = in the past).
export function daysUntil(key, now = new Date()) {
  const target = dateKeyToDate(key);
  if (!target) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - start) / 86400000);
}

export function formatShortDate(key) {
  const date = dateKeyToDate(key);
  return date
    ? date.toLocaleDateString([], { month: "short", day: "numeric" })
    : "";
}

// Label and tone for a task's due date. Completed tasks are never "overdue".
export function describeDue(key, completed = false, now = new Date()) {
  const days = daysUntil(key, now);
  if (days === null) return null;

  if (completed) {
    return { label: `Due ${formatShortDate(key)}`, tone: "done", days };
  }
  if (days < 0) {
    const late = Math.abs(days);
    return {
      label: late === 1 ? "Overdue by 1 day" : `Overdue by ${late} days`,
      tone: "overdue",
      days,
    };
  }
  if (days === 0) return { label: "Due today", tone: "today", days };
  if (days === 1) return { label: "Due tomorrow", tone: "soon", days };
  if (days <= 3) return { label: `Due in ${days} days`, tone: "soon", days };
  return { label: `Due ${formatShortDate(key)}`, tone: "later", days };
}

export function isTaskOverdue(task, now = new Date()) {
  if (!task || task.completed || !task.dueDate) return false;
  const days = daysUntil(task.dueDate, now);
  return days !== null && days < 0;
}

// "12 days left", "Tomorrow", "Today" or "Passed".
export function describeExamCountdown(key, now = new Date()) {
  const days = daysUntil(key, now);
  if (days === null) return null;
  if (days < 0) return { days, label: "Passed", tone: "passed" };
  if (days === 0) return { days, label: "Today", tone: "urgent" };
  if (days === 1) return { days, label: "Tomorrow", tone: "urgent" };
  return {
    days,
    label: `${days} days left`,
    tone: days <= 7 ? "urgent" : days <= 21 ? "soon" : "later",
  };
}

// ---------- Task sorting ----------
// "newest" keeps the order the server sent. Finished tasks always sink.
export function sortTasks(tasks, mode) {
  if (mode === "newest") return tasks;

  const noDate = Number.MAX_SAFE_INTEGER;
  const dueValue = (task) => {
    const days = daysUntil(task.dueDate);
    return days === null ? noDate : days;
  };

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      if (a.task.completed !== b.task.completed) {
        return a.task.completed ? 1 : -1;
      }

      if (mode === "priority") {
        const rank =
          (PRIORITY_RANK[a.task.priority] ?? 1) -
          (PRIORITY_RANK[b.task.priority] ?? 1);
        if (rank !== 0) return rank;
      }

      const due = dueValue(a.task) - dueValue(b.task);
      if (due !== 0) return due;

      return a.index - b.index;
    })
    .map((entry) => entry.task);
}

// ---------- Notes: tags and light markdown ----------
export const MAX_NOTE_TAGS = 8;

// "Algebra, #exam prep" -> ["algebra", "exam-prep"] (mirrors the server rules).
export function parseTagInput(text) {
  const tags = [];
  String(text || "")
    .split(/[,\n]/)
    .forEach((part) => {
      const tag = part
        .trim()
        .replace(/^#+/, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 30);
      if (tag && !tags.includes(tag)) tags.push(tag);
    });
  return tags.slice(0, MAX_NOTE_TAGS);
}

// Applies a formatting button to the textarea text and returns the new text
// plus where the selection should end up.
export function applyMarkdownFormat(value, start, end, type) {
  const from = Math.max(0, Math.min(start, end));
  const to = Math.max(from, Math.max(start, end));

  if (type === "bold" || type === "italic") {
    const mark = type === "bold" ? "**" : "*";
    const selected = value.slice(from, to);
    const placeholder = selected || (type === "bold" ? "bold text" : "italic text");
    const next = `${value.slice(0, from)}${mark}${placeholder}${mark}${value.slice(to)}`;
    const selStart = from + mark.length;
    return { value: next, start: selStart, end: selStart + placeholder.length };
  }

  // Line based formats: act on every line touched by the selection.
  const prefix =
    type === "bullet" ? "- " : type === "checklist" ? "- [ ] " : "## ";
  const lineStart = value.lastIndexOf("\n", from - 1) + 1;
  const newlineAfter = value.indexOf("\n", to);
  const lineEnd = newlineAfter === -1 ? value.length : newlineAfter;
  const block = value.slice(lineStart, lineEnd);

  const lines = block.split("\n");
  const marker = /^(\s*)([-*]\s+\[[ xX]\]\s+|[-*]\s+|#{1,3}\s+)/;
  const allHavePrefix = lines.every((line) => line.startsWith(prefix));

  const updated = lines
    .map((line) => {
      if (allHavePrefix) return line.slice(prefix.length);
      return `${prefix}${line.replace(marker, "$1")}`;
    })
    .join("\n");

  return {
    value: `${value.slice(0, lineStart)}${updated}${value.slice(lineEnd)}`,
    start: lineStart,
    end: lineStart + updated.length,
  };
}

const CHECKLIST_LINE = /^(\s*[-*]\s+\[)([ xX])(\]\s+.*)$/;

export function parseChecklistLine(line) {
  const match = CHECKLIST_LINE.exec(line);
  return match
    ? { checked: match[2].toLowerCase() === "x", text: match[3].replace(/^\]\s+/, "") }
    : null;
}

// Flips the checkbox on one line of a note and returns the new note text.
export function toggleChecklistLine(content, lineIndex) {
  const lines = String(content).split("\n");
  const match = CHECKLIST_LINE.exec(lines[lineIndex] ?? "");
  if (!match) return content;
  const next = match[2] === " " ? "x" : " ";
  lines[lineIndex] = `${match[1]}${next}${match[3]}`;
  return lines.join("\n");
}

export function checklistProgress(content) {
  let done = 0;
  let total = 0;
  String(content)
    .split("\n")
    .forEach((line) => {
      const item = parseChecklistLine(line);
      if (item) {
        total += 1;
        if (item.checked) done += 1;
      }
    });
  return { done, total };
}

// ---------- Weekly summary ----------
// "This week" is the last seven calendar days (today included), matching the
// Focus chart; "last week" is the seven days before that.
export function buildWeeklySummary({ tasks = [], sessions = [], now = new Date() }) {
  const dayKeys = (offsetStart) =>
    new Set(
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        date.setDate(date.getDate() - offsetStart - index);
        return localDateKey(date);
      })
    );

  const thisWeek = dayKeys(0);
  const lastWeek = dayKeys(7);

  const empty = () => ({ minutes: 0, sessions: 0, tasks: 0 });
  const totals = { current: empty(), previous: empty() };
  const subjectMinutes = new Map();
  const subjectTasks = new Map();

  const bucketFor = (key) =>
    thisWeek.has(key) ? "current" : lastWeek.has(key) ? "previous" : null;

  sessions.forEach((session) => {
    const when = new Date(session.completedAt);
    if (Number.isNaN(when.getTime())) return;
    const bucket = bucketFor(localDateKey(when));
    if (!bucket) return;

    const minutes = Math.max(0, Number(session.durationMinutes) || 0);
    totals[bucket].minutes += minutes;
    totals[bucket].sessions += 1;

    const subject = (session.subject || "").trim();
    if (bucket === "current" && subject) {
      subjectMinutes.set(subject, (subjectMinutes.get(subject) || 0) + minutes);
    }
  });

  tasks.forEach((task) => {
    if (!task.completed) return;
    const when = new Date(task.completedAt);
    if (Number.isNaN(when.getTime())) return;
    const bucket = bucketFor(localDateKey(when));
    if (!bucket) return;

    totals[bucket].tasks += 1;

    const subject = (task.subject || "Personal").trim();
    if (bucket === "current") {
      subjectTasks.set(subject, (subjectTasks.get(subject) || 0) + 1);
    }
  });

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

// "+25%", "-10%", "New" (nothing last week) or "—" (nothing at all).
export function compareToLast(current, previous) {
  if (!previous && !current) return { text: "—", direction: "flat" };
  if (!previous) return { text: "New", direction: "up" };
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return { text: "Same", direction: "flat" };
  return {
    text: `${change > 0 ? "+" : ""}${change}%`,
    direction: change > 0 ? "up" : "down",
  };
}

export function formatHours(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  if (value < 60) return `${value}m`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
