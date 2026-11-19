// StudyOS mascot mood engine: pure, deterministic, no I/O and no animation code.
// The same rules are ported 1:1 to android/.../MoodEngine.java so the home-screen widget
// resolves the same mood even when the app is closed. Keep both files in step
// (widgets/moodVectors.json is checked against both by widgets/moodEngine.test.mjs).
//
// Priority (highest first): celebrating > excited > sleeping > sad > worried > motivated > happy.
// Only one primary mood is ever returned. All day maths use the device's LOCAL time zone.

export const MOODS = ["celebrating", "excited", "sleeping", "sad", "worried", "motivated", "happy"];
export const EXCITED_MS = 3000;       // after a finished task / focus session
export const CELEBRATE_MS = 8000;     // after a streak milestone
export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 730, 1000];

export const DEFAULTS = {
  nightStart: 23, // sleeping hours, local clock (wraps over midnight)
  nightEnd: 6,
  worryHours: 3,  // "worried" starts this many hours before the local day ends
};

const HOUR = 3600000;

function startOfNextDay(now) {
  const d = new Date(now);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function atHour(now, hour, dayOffset) {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

function isNight(now, start, end) {
  const h = new Date(now).getHours();
  return start > end ? h >= start || h < end : h >= start && h < end;
}

/**
 * state: {
 *   now, studiedToday (a focus session or task done today), studiedYesterday (freeze days count),
 *   everStudied, sessionActive, lastTaskAt (ms, 0 = none), celebrationAt (ms, 0 = none),
 *   nightStart?, nightEnd?, worryHours?
 * }
 * returns { mood, level, nextAt }  level: 0..2 (worried 1 then 2 in the last hour); nextAt: next time
 * the answer can change by itself (schedule a refresh then).
 */
export function resolveMood(state) {
  const o = { ...DEFAULTS, ...state };
  const now = o.now;
  const sinceTask = o.lastTaskAt ? now - o.lastTaskAt : Infinity;
  const sinceCeleb = o.celebrationAt ? now - o.celebrationAt : Infinity;
  const midnight = startOfNextDay(now);
  const night = isNight(now, o.nightStart, o.nightEnd);
  const next = [midnight];

  // Upcoming time-driven boundaries.
  if (sinceCeleb >= 0 && sinceCeleb < CELEBRATE_MS) next.push(o.celebrationAt + CELEBRATE_MS);
  if (sinceTask >= 0 && sinceTask < EXCITED_MS) next.push(o.lastTaskAt + EXCITED_MS);
  for (const off of [0, 1]) {
    for (const h of [o.nightStart, o.nightEnd]) {
      const t = atHour(now, h, off);
      if (t > now) next.push(t);
    }
  }
  const left = midnight - now;
  const worryAt = midnight - o.worryHours * HOUR;
  const worry2At = midnight - HOUR;
  if (worryAt > now) next.push(worryAt);
  if (worry2At > now) next.push(worry2At);
  const nextAt = Math.min(...next);

  const done = (mood, level = 0) => ({ mood, level, nextAt });

  if (sinceCeleb >= 0 && sinceCeleb < CELEBRATE_MS) return done("celebrating");
  if (sinceTask >= 0 && sinceTask < EXCITED_MS) return done("excited");
  if (night && !o.sessionActive) return done("sleeping");
  if (o.studiedToday) return done("happy");          // goal met: never sad or worried today
  if (o.everStudied && !o.studiedYesterday) return done("sad");
  if (left <= o.worryHours * HOUR) return done("worried", left <= HOUR ? 2 : 1);
  return done("motivated");
}

/** The streak milestone just reached, or 0. `celebrated` is the highest milestone already shown. */
export function newMilestone(streak, celebrated) {
  let hit = 0;
  for (const m of STREAK_MILESTONES) if (streak >= m && m > celebrated) hit = m;
  return hit;
}
