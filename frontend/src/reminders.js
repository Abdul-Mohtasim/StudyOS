// Study reminders: a daily "time to study" nudge and a "streak about to break" warning.
//  * Android app: scheduled natively with AlarmManager (android/.../StudyNotifyPlugin.java), so they fire
//    on the minute you pick, even when the app is closed, with the StudyOS chime.
//  * Browser: Notification API while the app/tab is open (a browser cannot wake itself up).
//    A 1-second clock checks the real time, so background-tab timer throttling cannot delay it.
import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  makePicker, DAILY_POOL, STREAK_POOL, NAG_TIERS, NAG_STREAK_POOL, NAG_FINAL_POOL,
  NAG_FINAL_NO_STREAK_POOL, TEST_POOL, customBody,
} from "./reminderMessages";

const KEY = "studyos-reminders";
const FIRED_KEY = "studyos-reminders-fired";
const DAILY_ID = 1001; // 1001..1014 (one per upcoming day)
const STREAK_ID = 2001;
const CUSTOM_ID = 3000; // 3000 + slot * 20 + day
const NAG_ID = 4000; // 4000 + day * 20 + slot
const NAG_DAYS = 3;
const DAYS_AHEAD = 14;

const WEB_SOUND = "/sounds/studyos-notify.mp3"; // public/sounds/studyos-notify.mp3

export const MAX_CUSTOM = 8;
export const DEFAULT_REMINDERS = {
  daily: false, time: "18:00", streak: false, streakTime: "20:00",
  // "Nag mode": playful, escalating nudges through the day until you study (Duolingo style).
  nag: false, nagStart: "15:00", nagEnd: "21:00", nagEvery: 2,
  // Your own reminders: [{ id, time: "07:30", text: "Revise chemistry", on: true }]
  custom: [],
};

export function loadReminderPrefs() {
  try {
    const saved = { ...DEFAULT_REMINDERS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    if (!Array.isArray(saved.custom)) saved.custom = [];
    return saved;
  } catch {
    return { ...DEFAULT_REMINDERS };
  }
}
export function saveReminderPrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

const isNative = () => Capacitor.isNativePlatform();

export function notificationsSupported() {
  return isNative() || typeof Notification !== "undefined";
}

// ---------------------------------------------------------------- native bridge
const StudyNotify = isNative() ? registerPlugin("StudyNotify") : null;

// Never wait forever on the native side.
function native(call, ms = 10000) {
  return Promise.race([
    call,
    new Promise((_, reject) => setTimeout(() => reject(new Error("The phone did not answer in time.")), ms)),
  ]);
}

export async function openNotificationSettings() {
  try { await native(StudyNotify.openNotificationSettings()); } catch { /* rebuild the app */ }
}
export async function openChannelSettings() {
  try { await native(StudyNotify.openChannelSettings()); } catch { /* rebuild the app */ }
}
// { enabled, sdk, canExact, scheduled, channelExists, importance, hasSound, versionName, ... } or null.
export async function getNotifyStatus() {
  if (!StudyNotify) return null;
  try {
    return await native(StudyNotify.getStatus());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- permissions
// Resolves to { state: "granted" | "denied" | "blocked" | "error", message? }
//   blocked = Android will not show the Allow/Deny pop-up (refused before, or turned off in settings),
//             so the person has to switch notifications on in the phone's settings.
export async function requestReminderPermission() {
  try {
    if (isNative()) {
      const started = Date.now();
      // Waits for the person to answer the system pop-up (Android 13+); older Android answers at once.
      const res = await native(StudyNotify.requestPermission(), 120000);
      if (res.granted) return { state: "granted" };
      if (Date.now() - started < 600) {
        return { state: "blocked", message: "Notifications are turned off for StudyOS in your phone settings." };
      }
      return { state: "denied", message: "Notifications were not allowed." };
    }
    if (typeof Notification === "undefined") return { state: "error", message: "This browser does not support notifications." };
    if (Notification.permission === "granted") return { state: "granted" };
    const result = await Notification.requestPermission();
    return result === "granted" ? { state: "granted" } : { state: "denied", message: "Notifications are blocked in your browser." };
  } catch (err) {
    return {
      state: "error",
      message: `Could not ask for notification permission (${(err && err.message) || "unknown error"}). Uninstall the app, rebuild and reinstall it.`,
    };
  }
}

export async function reminderPermission() {
  if (isNative()) {
    const st = await getNotifyStatus();
    return st && st.enabled ? "granted" : "default";
  }
  return typeof Notification === "undefined" ? "denied" : Notification.permission;
}

// Android 12+ only fires a notification on the exact minute when "Alarms & reminders" is allowed
// for the app. Without it Android may batch the alarm and it can arrive a few minutes late.
export async function exactAlarmsGranted() {
  if (!isNative()) return true;
  const st = await getNotifyStatus();
  return st ? st.canExact !== false : true;
}

export async function requestExactAlarms() {
  if (!isNative()) return true;
  try {
    if (await exactAlarmsGranted()) return true;
    await native(StudyNotify.openExactAlarmSettings()); // opens the system "Alarms & reminders" screen
  } catch {
    /* ignore */
  }
  return exactAlarmsGranted();
}

// ---------------------------------------------------------------- helpers
function parseTime(text, fallback) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text || "");
  const [h, min] = m ? [Number(m[1]), Number(m[2])] : fallback;
  return { hour: Math.min(23, Math.max(0, h)), minute: Math.min(59, Math.max(0, min)) };
}

function atTime(dayOffset, { hour, minute }) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ---------------------------------------------------------------- sound (browser + in-app)
let audio = null;
let unlocked = false;
function getAudio() {
  if (!audio && typeof Audio !== "undefined") {
    audio = new Audio(WEB_SOUND);
    audio.preload = "auto";
  }
  return audio;
}
// Browsers only allow sound after a tap/click, so the first interaction "unlocks" it.
function armAudioUnlock() {
  if (unlocked || typeof document === "undefined") return;
  const unlock = () => {
    unlocked = true;
    const a = getAudio();
    if (a) {
      a.muted = true;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
    }
    ["pointerdown", "keydown", "touchstart"].forEach((e) => document.removeEventListener(e, unlock, true));
  };
  ["pointerdown", "keydown", "touchstart"].forEach((e) => document.addEventListener(e, unlock, true));
}
armAudioUnlock();

export function playReminderSound() {
  const a = getAudio();
  if (!a) return;
  try {
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------- plan
// Nudges start friendly and get cheekier as the day runs out. Every notification gets its own message
// (see reminderMessages.js); nothing repeats within the plan.
function nagMessage(index, count, streak, pick, seed) {
  if (index === count - 1 && count > 1) {
    return streak > 0 ? pick(NAG_FINAL_POOL, seed, { n: streak }) : pick(NAG_FINAL_NO_STREAK_POOL, seed);
  }
  if (streak > 0 && index === Math.max(1, count - 2)) return pick(NAG_STREAK_POOL, seed, { n: streak });
  const tier = Math.min(NAG_TIERS.length - 1, Math.floor((index / Math.max(1, count - 1)) * (NAG_TIERS.length - 1)));
  return pick(NAG_TIERS[tier], seed);
}

function nagTimes(prefs) {
  const start = parseTime(prefs.nagStart, [15, 0]);
  const end = parseTime(prefs.nagEnd, [21, 0]);
  const every = Math.max(1, Math.min(6, Number(prefs.nagEvery) || 2));
  const from = start.hour * 60 + start.minute;
  const to = end.hour * 60 + end.minute;
  const out = [];
  for (let m = from; m <= to && out.length < 12; m += every * 60) out.push({ hour: Math.floor(m / 60), minute: m % 60 });
  return out;
}

// Every reminder that should exist from now on: [{ id, at: Date, title, body }]
function buildPlan(prefs, { streak, studiedToday }) {
  const now = Date.now();
  const items = [];
  const push = (id, at, title, body) => { if (at.getTime() > now) items.push({ id, at, title, body, tag: `studyos-${id}` }); };
  const pick = makePicker();
  const dayKey = (at) => `${at.getFullYear()}-${at.getMonth()}-${at.getDate()}`;

  if (prefs.daily) {
    const t = parseTime(prefs.time, [18, 0]);
    for (let i = 0; i < DAYS_AHEAD; i += 1) {
      if (i === 0 && studiedToday) continue;
      const at = atTime(i, t);
      const [title, body] = pick(DAILY_POOL, `daily|${dayKey(at)}`);
      push(DAILY_ID + i, at, title, body);
    }
  }

  if (prefs.streak && streak > 0) {
    // The streak is at risk today if you haven't studied yet, otherwise tomorrow.
    const at = atTime(studiedToday ? 1 : 0, parseTime(prefs.streakTime, [20, 0]));
    const [title, body] = pick(STREAK_POOL, `streak|${dayKey(at)}`, { n: streak });
    push(STREAK_ID, at, title, body);
  }

  (prefs.custom || []).slice(0, MAX_CUSTOM).forEach((c, slot) => {
    if (!c || c.on === false) return;
    const t = parseTime(c.time, [8, 0]);
    const text = (c.text || "").trim();
    for (let i = 0; i < DAYS_AHEAD; i += 1) {
      const at = atTime(i, t);
      if (text) {
        // your own words stay as the title; the line under it is different every day
        push(CUSTOM_ID + slot * 20 + i, at, text, customBody(slot * 14 + i));
      } else {
        const [title, body] = pick(DAILY_POOL, `custom|${slot}|${dayKey(at)}`);
        push(CUSTOM_ID + slot * 20 + i, at, title, body);
      }
    }
  });

  if (prefs.nag) {
    const times = nagTimes(prefs);
    for (let i = 0; i < NAG_DAYS; i += 1) {
      if (i === 0 && studiedToday) continue; // already studied: no nagging today
      times.forEach((t, j) => {
        const at = atTime(i, t);
        const [title, body] = nagMessage(j, times.length, streak, pick, `nag|${dayKey(at)}|${j}`);
        push(NAG_ID + i * 20 + j, at, title, body);
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------- Android
// Re-plan every reminder from the current state. Call whenever prefs, the streak
// or "studied today" change. Safe to call often.
//   state = { streak: number, studiedToday: boolean }
export async function syncReminders(prefs, state) {
  if (isNative()) return syncNative(prefs, state);
  syncWeb(prefs, state);
}

async function syncNative(prefs, state) {
  try {
    const status = await getNotifyStatus();
    if (!status || !status.enabled) return; // not allowed (yet): nothing to schedule
    const items = buildPlan(prefs, state).map((p) => ({ id: p.id, at: p.at.getTime(), title: p.title, body: p.body }));
    // Always replace the whole list (an empty list cancels everything).
    await native(StudyNotify.scheduleReminders({ items }));
  } catch (err) {
    console.warn("Could not schedule reminders:", err && err.message);
  }
}

// ---------------------------------------------------------------- Browser
let webPlan = [];
let webTicker = null;

function readFired() {
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) || "{}"); } catch { return {}; }
}
function writeFired(map) {
  try { localStorage.setItem(FIRED_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function showWeb(title, body, tag) {
  playReminderSound();
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const opts = { body, tag, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", silent: false, renotify: true };
  const plain = () => { try { new Notification(title, opts); } catch { /* Chrome on Android needs a service worker */ } };
  if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
    // getRegistration() resolves right away (unlike .ready, which can wait forever with no worker).
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => (reg ? reg.showNotification(title, opts) : plain()))
      .catch(plain);
  } else {
    plain();
  }
}

// Fires anything whose time has arrived. A reminder that is up to 10 minutes "late" (for example the
// laptop woke from sleep) still shows once; older ones are dropped.
function checkWebPlan() {
  const now = Date.now();
  const fired = readFired();
  let changed = false;
  for (const item of webPlan) {
    const id = `${item.tag}@${item.at.toDateString()}@${item.at.getHours()}:${item.at.getMinutes()}`;
    const late = now - item.at.getTime();
    if (late >= 0 && late < 10 * 60 * 1000 && !fired[id]) {
      fired[id] = now;
      changed = true;
      showWeb(item.title, item.body, item.tag);
    }
  }
  if (changed) {
    // keep the log small
    const cutoff = now - 3 * 24 * 60 * 60 * 1000;
    Object.keys(fired).forEach((k) => { if (fired[k] < cutoff) delete fired[k]; });
    writeFired(fired);
  }
}

function syncWeb(prefs, state) {
  webPlan = [];
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    const today = new Date().toDateString();
    webPlan = buildPlan(prefs, state).filter((p) => p.at.toDateString() === today); // a browser only knows about today
  }
  if (webPlan.length && !webTicker && typeof window !== "undefined") {
    webTicker = setInterval(checkWebPlan, 1000);
    document.addEventListener("visibilitychange", checkWebPlan);
    window.addEventListener("focus", checkWebPlan);
  } else if (!webPlan.length && webTicker) {
    clearInterval(webTicker);
    webTicker = null;
    document.removeEventListener("visibilitychange", checkWebPlan);
    window.removeEventListener("focus", checkWebPlan);
  }
  checkWebPlan();
}

// ---------------------------------------------------------------- test button
// Shows a reminder right now (with sound) so you can check permission, sound and timing.
// Resolves to { ok, message?, soundIssue? }
export async function sendTestReminder() {
  if (isNative()) {
    try {
      const before = await getNotifyStatus();
      if (!before || !before.enabled) return { ok: false, message: "Allow notifications first, then try again." };
      const [title, body] = makePicker()(TEST_POOL, Date.now());
      await native(StudyNotify.showNow({ title, body }));
      const status = await getNotifyStatus();
      const soundIssue = Boolean(status && status.channelExists && (!status.hasSound || status.importance < 3));
      return { ok: true, soundIssue };
    } catch (err) {
      return { ok: false, message: `Could not show the notification (${(err && err.message) || "unknown error"}).` };
    }
  }
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return { ok: false, message: "Allow notifications first, then try again." };
  }
  const [title, body] = makePicker()(TEST_POOL, Date.now());
  showWeb(title, body, "studyos-test");
  return { ok: true };
}

// ---------------------------------------------------------------- diagnostics
// A plain-language checklist of everything that has to be true for reminders to work.
export async function getDiagnostics() {
  const lines = [];
  const add = (ok, label, detail = "") => lines.push({ ok, label, detail });

  if (!isNative()) {
    add(typeof Notification !== "undefined", "Browser notifications supported");
    if (typeof Notification !== "undefined") add(Notification.permission === "granted", `Browser permission: ${Notification.permission}`);
    return lines;
  }

  add(true, "Running inside the Android app");
  const st = await getNotifyStatus();
  if (!st) {
    add(false, "Reminder helper missing: this is an old app build", "Uninstall the app, then rebuild and reinstall it. Android > App info should say Version 1.3.");
    return lines;
  }
  add(true, `App version ${st.versionName || "?"}, Android API ${st.sdk}`);
  if (st.sdk >= 33) {
    add(Boolean(st.declaresPostNotifications), "App asks Android for notification permission",
      st.declaresPostNotifications ? "" : "Missing from this build: rebuild and reinstall.");
  } else {
    add(true, "Android 12 or older: no permission pop-up exists, notifications are allowed by default");
  }
  add(Boolean(st.enabled), "Notifications are switched on for StudyOS in Android settings");
  if (st.channelExists) {
    add(st.importance >= 3, `Reminder channel importance: ${st.importance} (needs 3+ to make a sound)`);
    add(Boolean(st.hasSound), "Reminder channel has a sound");
  }
  add(st.canExact !== false, `Exact timing ("Alarms & reminders"): ${st.canExact === false ? "not allowed, reminders may be a few minutes late" : "allowed"}`);
  add(true, `Reminders currently scheduled: ${st.scheduled ?? 0}`);
  return lines;
}
