// StudyOS dynamic app icon: the ONE place that decides which launcher icon should show.
// Pure logic, no Capacitor, no DOM: decide(state, now) -> { icon, reason, until }.
// Every screen reports events; nothing else ever picks an icon.

export const ICONS = [
  "flame_default", "flame_focused", "flame_celebrating", "flame_sleepy", "flame_away",
  "flame_welcome", "flame_streak", "flame_goal_complete", "flame_resting", "flame_motivated",
];
const H = 3600000, M = 60000;
export const RULES = {
  goalHold: 12 * H,        // goal complete: until 12 h later or the end of the day, whichever comes first
  streakHold: 8 * H,       // streak milestone day
  focusDoneHold: 45 * M,   // after a finished focus session
  taskDoneHold: 20 * M,    // after a finished task
  welcomeHold: 3 * H,      // after coming back from a long break
  welcomeAfter: 24 * H,    // a return counts as "welcome back" after this long away
  sleepyAfter: 24 * H,
  awayAfter: 72 * H,
  minGap: 15 * M,          // never switch the native icon more often than this, except for top-priority moments
  dayCap: 6,               // and at most this many native switches a day
};
// higher number wins; the order is the user's spec
const PRI = { goal: 7, focusDone: 6, taskDone: 5, focusing: 4, welcome: 3, inactive: 2, base: 1 };

const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const endOfDay = (t) => startOfDay(t) + 24 * H;

export function freshState() {
  return {
    v: 1, auto: true, preferred: "flame_default",
    lastActive: 0, focusing: false, focusStart: 0,
    goalDay: 0, goalAt: 0, streakAt: 0, focusDoneAt: 0, taskDoneAt: 0, welcomeAt: 0,
    seen: { task: [], focus: [], goal: "", streak: 0 },
    nativeIcon: "", lastSwitchAt: 0, switchDay: 0, switchCount: 0, lastError: "",
    inactivity: "active", studiedToday: false, studiedYesterday: false,
  };
}

// Inactivity is calculated from saved timestamps whenever the app is opened; nothing runs in the background.
export function classify(s, now) {
  if (!s.lastActive) return "active";
  const gap = now - s.lastActive;
  return gap >= RULES.awayAfter ? "away" : gap >= RULES.sleepyAfter ? "sleepy" : "active";
}

/* ---------- events (each returns the new state; duplicates are ignored) ---------- */
export function onAppOpen(s, now) {
  const gap = s.lastActive ? now - s.lastActive : 0;
  s.inactivity = classify(s, now);
  if (s.lastActive && gap >= RULES.welcomeAfter) s.welcomeAt = now;
  // a timer from a killed process is gone
  s.focusing = false;
  s.lastActive = now;
  return s;
}
export function onActivity(s, now) { s.lastActive = now; s.inactivity = "active"; return s; }
export function onFocus(s, running, now) {
  if (running && !s.focusing) s.focusStart = now;
  s.focusing = !!running; s.lastActive = now; s.inactivity = "active";
  return s;
}
const remember = (list, id, max = 40) => { if (list.includes(id)) return false; list.push(id); if (list.length > max) list.splice(0, list.length - max); return true; };
export function onFocusDone(s, id, now) {
  s.focusing = false; s.lastActive = now; s.inactivity = "active";
  if (remember(s.seen.focus, String(id || now))) s.focusDoneAt = now;
  return s;
}
export function onTaskDone(s, id, now) {
  s.lastActive = now; s.inactivity = "active";
  if (remember(s.seen.task, String(id))) s.taskDoneAt = now;
  return s;
}
export function onGoalProgress(s, todayMin, goalMin, now) {
  const day = startOfDay(now), key = String(day);
  if (goalMin > 0 && todayMin >= goalMin && s.seen.goal !== key) { s.seen.goal = key; s.goalDay = day; s.goalAt = now; }
  return s;
}
export function onStreakMilestone(s, milestone, now) {
  if (milestone > (s.seen.streak || 0)) { s.seen.streak = milestone; s.streakAt = now; }
  return s;
}
export function setAuto(s, on) { s.auto = !!on; return s; }
export function setPreferred(s, icon) { if (ICONS.includes(icon)) s.preferred = icon; return s; }

/* ---------- the decision ---------- */
export function decide(s, now) {
  if (!s.auto) return { icon: ICONS.includes(s.preferred) ? s.preferred : "flame_default", reason: "manual", pri: 9, until: 0 };
  const C = [];
  const live = (at, hold) => at && now >= at && now - at < hold;
  if (s.goalDay === startOfDay(now) && live(s.goalAt, RULES.goalHold)) C.push(["flame_goal_complete", "goal", PRI.goal, Math.min(s.goalAt + RULES.goalHold, endOfDay(now))]);
  if (live(s.streakAt, RULES.streakHold)) C.push(["flame_streak", "streak", PRI.goal, s.streakAt + RULES.streakHold]);
  if (live(s.focusDoneAt, RULES.focusDoneHold)) C.push(["flame_celebrating", "focusDone", PRI.focusDone, s.focusDoneAt + RULES.focusDoneHold]);
  if (live(s.taskDoneAt, RULES.taskDoneHold)) C.push(["flame_celebrating", "taskDone", PRI.taskDone, s.taskDoneAt + RULES.taskDoneHold]);
  if (s.focusing) C.push(["flame_focused", "focusing", PRI.focusing, 0]);
  if (live(s.welcomeAt, RULES.welcomeHold)) C.push(["flame_welcome", "welcome", PRI.welcome, s.welcomeAt + RULES.welcomeHold]);
  const ina = classify(s, now);
  if (ina === "away") C.push(["flame_away", "away", PRI.inactive, 0]);
  else if (ina === "sleepy") C.push(["flame_sleepy", "sleepy", PRI.inactive, 0]);
  // the base icon follows the time of day once the student has studied, otherwise the preferred icon
  const hr = new Date(now).getHours();
  let base = s.preferred || "flame_default";
  if (base === "flame_default") {
    if ((hr >= 22 || hr < 5) && s.studiedToday) base = "flame_resting";
    else if (hr >= 5 && hr < 11 && s.studiedYesterday) base = "flame_motivated";
  }
  C.push([base, "base", PRI.base, 0]);
  C.sort((a, b) => b[2] - a[2]);
  const [icon, reason, pri, until] = C[0];
  return { icon, reason, pri, until };
}

// Should the native icon actually be switched now? Prevents rapid flipping.
export function shouldSwitch(s, d, now) {
  if (!ICONS.includes(d.icon)) return false;
  if (s.nativeIcon === d.icon) return false;
  if (d.reason === "manual") return true;
  if (!s.nativeIcon) return true;
  const day = startOfDay(now);
  const count = s.switchDay === day ? s.switchCount : 0;
  if (count >= RULES.dayCap && d.pri < PRI.goal) return false;
  if (now - (s.lastSwitchAt || 0) < RULES.minGap && d.pri < PRI.focusDone) return false;
  return true;
}
export function recordSwitch(s, icon, now) {
  const day = startOfDay(now);
  if (s.switchDay !== day) { s.switchDay = day; s.switchCount = 0; }
  s.switchCount++; s.nativeIcon = icon; s.lastSwitchAt = now; s.lastError = "";
  return s;
}
