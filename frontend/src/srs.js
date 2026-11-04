// Spaced repetition (SM-2 style). Grades: 0 Again, 1 Hard, 2 Good, 3 Easy.
// Mirrors backend/src/utils/srs.js so offline reviews match the server.

const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_MS = 10 * 60 * 1000;

export const GRADES = [
  { value: 0, label: "Again", tone: "again" },
  { value: 1, label: "Hard", tone: "hard" },
  { value: 2, label: "Good", tone: "good" },
  { value: 3, label: "Easy", tone: "easy" },
];

export function nextSchedule(card, grade, reviewedAt = new Date()) {
  const base = new Date(reviewedAt).getTime();
  let ease = Number(card.ease) || 2.5;
  let interval = Number(card.interval) || 0;
  let reps = Number(card.reps) || 0;
  let lapses = Number(card.lapses) || 0;

  if (grade === 0) {
    return {
      ease: Math.max(1.3, ease - 0.2),
      interval: 0,
      reps: 0,
      lapses: lapses + 1,
      dueAt: new Date(base + AGAIN_MS).toISOString(),
    };
  }

  reps += 1;
  if (reps === 1) interval = [0, 1, 1, 4][grade];
  else if (reps === 2) interval = [0, 3, 6, 8][grade];
  else if (grade === 1) {
    interval = Math.max(interval + 1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  } else if (grade === 2) {
    interval = Math.max(interval + 1, Math.round(interval * ease));
  } else {
    interval = Math.max(interval + 2, Math.round(interval * ease * 1.3));
    ease += 0.15;
  }
  interval = Math.min(interval, 3650);

  return { ease, interval, reps, lapses, dueAt: new Date(base + interval * DAY_MS).toISOString() };
}

// "10 min", "1 day", "6 days", "2 mo" - shown under each answer button.
export function describeNext(card, grade) {
  if (grade === 0) return "10 min";
  const { interval } = nextSchedule(card, grade);
  if (interval < 1) return "10 min";
  if (interval === 1) return "1 day";
  if (interval < 30) return `${interval} days`;
  if (interval < 365) return `${Math.round(interval / 30)} mo`;
  return `${(interval / 365).toFixed(1)} yr`;
}

export function isDue(card, now = Date.now()) {
  const due = new Date(card.dueAt).getTime();
  return Number.isNaN(due) || due <= now;
}

export function normalizeCard(c) {
  return {
    id: c._id || c.id,
    front: c.front,
    back: c.back,
    subject: c.subject || "",
    noteId: c.noteId || "",
    ease: Number(c.ease) || 2.5,
    interval: Number(c.interval) || 0,
    reps: Number(c.reps) || 0,
    lapses: Number(c.lapses) || 0,
    dueAt: c.dueAt || new Date().toISOString(),
    lastReviewedAt: c.lastReviewedAt || "",
    createdAt: c.createdAt || "",
  };
}

// ---------- Turn a note into flashcards ----------
// Recognises, in order of confidence:
//   "Term: definition", "Term - definition", "Term — definition"
//   a "## Heading" followed by lines (heading = front, lines = back)
//   "**Term** explanation"
// Anything else is skipped, so the preview only shows useful cards.
export function generateCardsFromNote(note) {
  const text = String(note?.content || "");
  const lines = text.split(/\r?\n/);
  const out = [];
  const seen = new Set();
  const push = (front, back) => {
    front = front.replace(/\*+/g, "").replace(/^[-*•\d.)\s]+/, "").trim();
    back = back.replace(/\*\*/g, "").trim();
    if (front.length < 2 || back.length < 2 || front.length > 300 || back.length > 900) return;
    const key = front.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ front, back });
  };

  let heading = "";
  let body = [];
  const flush = () => {
    if (heading && body.length) push(heading, body.join("\n"));
    heading = "";
    body = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const h = line.match(/^#{1,4}\s+(.+)$/);
    if (h) {
      flush();
      heading = h[1];
      continue;
    }

    if (/^[-*]\s*\[[ xX]\]/.test(line)) continue; // checklist items are tasks, not facts

    const bold = line.match(/^(?:[-*•]\s*)?\*\*(.+?)\*\*[:\s–—-]*(.+)$/);
    const pair = line.match(/^(?:[-*•]\s*)?([^:–—]{2,80}?)\s*(?::|\s[–—-]\s)\s*(.{2,})$/);
    const m = bold || pair;

    if (m && !/^https?$/i.test(m[1].trim())) {
      push(m[1], m[2]);
      continue;
    }

    if (heading) body.push(line.replace(/^[-*•]\s*/, "• "));
  }
  flush();

  return out.slice(0, 50);
}
