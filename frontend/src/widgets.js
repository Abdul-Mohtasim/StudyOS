// StudyOS home-screen widget pack: keeps the native Android widgets (Streak + Mascot,
// Today's Tasks, Study Time This Week, Focus Timer shortcut) in sync with the app.
//
// All the mood/graphics logic lives natively (android/.../StudyWidgetMoodEngine.java) so the
// widgets keep working while the app is closed. This module's only job is to mirror the bits
// of app state a widget could need into SharedPreferences via the StudyWidget plugin, and to
// flag the two events the mood engine can't infer on its own: "a task was just completed"
// (-> Excited) and "a streak milestone was just reached" (-> Celebrating).
import { Capacitor, registerPlugin } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();
const StudyWidget = isNative() ? registerPlugin("StudyWidget") : null;

const MILESTONE_KEY = "studyos-widget-last-celebrated";
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100, 150, 200, 365, 500, 1000];
const CELEBRATE_WINDOW_MS = 6000; // comfortably covers the native engine's 3s Excited/Celebrate window

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Minutes studied per day for the last 7 days (oldest first, today last).
function computeWeekMinutes(focusSessions) {
  const byDay = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const keys = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    keys.push(key);
    byDay.set(key, 0);
  }

  (focusSessions || []).forEach((session) => {
    const completedAt = new Date(session.completedAt);
    if (Number.isNaN(completedAt.getTime())) return;
    const key = getLocalDateKey(completedAt);
    if (!byDay.has(key)) return;
    byDay.set(key, byDay.get(key) + Math.max(0, Number(session.durationMinutes) || 0));
  });

  return keys.map((key) => Math.round(byDay.get(key)));
}

// Highest streak milestone this run just crossed, or 0 if none / already celebrated.
function newlyCrossedMilestone(streak) {
  if (!Number.isFinite(streak) || streak <= 0) return 0;
  let lastCelebrated = 0;
  try {
    lastCelebrated = Number(localStorage.getItem(MILESTONE_KEY)) || 0;
  } catch {
    lastCelebrated = 0;
  }
  const hit = STREAK_MILESTONES.filter((m) => m <= streak && m > lastCelebrated);
  if (hit.length === 0) return 0;
  const best = Math.max(...hit);
  try {
    localStorage.setItem(MILESTONE_KEY, String(best));
  } catch {
    /* ignore */
  }
  return best;
}

function nativeCall(payload, ms = 4000) {
  if (!StudyWidget) return Promise.resolve();
  return Promise.race([
    StudyWidget.pushState(payload).catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

/**
 * Push the latest app state to the widget pack.
 *   taskJustCompleted: set true right after a task is marked done, so the mascot goes
 *     Excited immediately instead of waiting for the next periodic sync.
 */
export function syncWidgets(appState, { taskJustCompleted = false } = {}) {
  if (!isNative()) return Promise.resolve();

  const {
    streak = 0,
    bestStreak = 0,
    studiedToday = false,
    dailyGoalMinutes = 30,
    todayFocusMinutes = 0,
    dailyGoalPercent = 0,
    tasks = [],
    gems = 0,
    settingsTheme = "light",
    activePalette = "",
    isRunning = false,
    focusSessions = [],
  } = appState;

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const themeKey = settingsTheme === "dark" ? "dark" : activePalette || "light";

  const payload = {
    streak,
    bestStreak,
    studiedToday,
    dailyGoalMinutes,
    todayFocusMinutes,
    dailyGoalPercent,
    tasksTotal: tasks.length,
    tasksCompleted: tasks.length - incompleteTasks.length,
    upcomingTasks: incompleteTasks.slice(0, 3).map((task) => task.title || "Untitled task"),
    weekMinutes: computeWeekMinutes(focusSessions),
    gems,
    theme: themeKey,
    activeSessionRunning: isRunning,
  };

  if (taskJustCompleted) {
    payload.lastTaskCompletedAt = Date.now();
  }

  const milestone = newlyCrossedMilestone(streak);
  if (milestone > 0) {
    payload.milestoneCelebrateUntil = Date.now() + CELEBRATE_WINDOW_MS;
    payload.lastCelebratedStreak = milestone;
  }

  return nativeCall(payload);
}

export function widgetsSupported() {
  return isNative();
}
