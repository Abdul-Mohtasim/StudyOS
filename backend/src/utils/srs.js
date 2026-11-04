"use strict";

// Spaced repetition (SM-2 style). Grades: 0 Again, 1 Hard, 2 Good, 3 Easy.
// The frontend has the same algorithm (frontend/src/srs.js) so reviews done
// offline look identical once they sync.

const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_MS = 10 * 60 * 1000;

function nextSchedule(card, grade, reviewedAt = new Date()) {
  const base = new Date(reviewedAt).getTime();
  let ease = Number(card.ease) || 2.5;
  let interval = Number(card.interval) || 0;
  let reps = Number(card.reps) || 0;
  let lapses = Number(card.lapses) || 0;

  if (grade === 0) {
    reps = 0;
    lapses += 1;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { ease, interval, reps, lapses, dueAt: new Date(base + AGAIN_MS) };
  }

  reps += 1;

  if (reps === 1) {
    interval = [0, 1, 1, 4][grade];
  } else if (reps === 2) {
    interval = [0, 3, 6, 8][grade];
  } else if (grade === 1) {
    interval = Math.max(interval + 1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  } else if (grade === 2) {
    interval = Math.max(interval + 1, Math.round(interval * ease));
  } else {
    interval = Math.max(interval + 2, Math.round(interval * ease * 1.3));
    ease = ease + 0.15;
  }

  interval = Math.min(interval, 3650);
  return { ease, interval, reps, lapses, dueAt: new Date(base + interval * DAY_MS) };
}

module.exports = { nextSchedule };
