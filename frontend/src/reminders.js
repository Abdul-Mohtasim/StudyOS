// Study reminders: a daily "time to study" nudge and a "streak about to break" warning.
//  * Android app: scheduled with @capacitor/local-notifications as EXACT alarms, so they fire
//    on the minute you pick (even when the app is closed or the phone is idle) with the
//    StudyOS chime.
//  * Browser: Notification API while the app/tab is open (a browser cannot wake itself up).
//    A 1-second clock checks the real time, so background-tab timer throttling cannot delay it.
import { Capacitor, registerPlugin } from "@capacitor/core";

const KEY = "studyos-reminders";
const FIRED_KEY = "studyos-reminders-fired";
const DAILY_ID = 1001; // 1001..1030 (one per upcoming day)
const STREAK_ID = 2001;
const TEST_ID = 2900;
const DAYS_AHEAD = 14;

// Android 8+ takes the sound from the notification *channel*, and a channel can't be edited after
// it has been created, so the id carries a version. Bump it if the sound ever changes.
const CHANNEL_ID = "studyos-reminders-v3";
const OLD_CHANNELS = ["studyos-reminders-v2"];
const NATIVE_SOUND = "studyos_notify.wav"; // android/app/src/main/res/raw/studyos_notify.wav
const WEB_SOUND = "/sounds/studyos-notify.wav"; // public/sounds/studyos-notify.wav
const SMALL_ICON = "ic_stat_studyos";
const ICON_COLOR = "#E5484D";

export const DEFAULT_REMINDERS = { daily: false, time: "18:00", streak: false, streakTime: "20:00" };

export function loadReminderPrefs() {
  try {
    return { ...DEFAULT_REMINDERS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
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

async function plugin() {
  const mod = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

export function notificationsSupported() {
  return isNative() || typeof Notification !== "undefined";
}

// ---------------------------------------------------------------- permissions
// Small native helper (android/.../StudyNotifyPlugin.java): real notification state + settings shortcuts.
const StudyNotify = isNative() ? registerPlugin("StudyNotify") : null;

export async function openNotificationSettings() {
  try {
    await StudyNotify.openNotificationSettings();
  } catch {
    /* helper missing: rebuild the Android app */
  }
}
export async function openChannelSettings() {
  try {
    await StudyNotify.openChannelSettings({ channelId: CHANNEL_ID });
  } catch {
    /* helper missing: rebuild the Android app */
  }
}
// { enabled, channelExists, importance, hasSound } or null when unavailable.
export async function getNotifyStatus() {
  try {
    return await StudyNotify.getStatus({ channelId: CHANNEL_ID });
  } catch {
    return null;
  }
}

// Ask the system for permission.
// Resolves to { state: "granted" | "denied" | "blocked" | "error", message? }
//   blocked = Android will not show the Allow/Deny pop-up any more (it was refused before),
//             so the person has to switch notifications on in the phone's settings.
export async function requestReminderPermission() {
  try {
    if (isNative()) {
      const LN = await plugin();
      const before = await LN.checkPermissions();
      if (before.display === "granted") return { state: "granted" };

      // "denied" (not "prompt") means Android has stopped showing the pop-up for this app.
      if (before.display === "denied") {
        const status = await getNotifyStatus();
        if (status && status.enabled) return { state: "granted" };
        return { state: "blocked", message: "Notifications are turned off for StudyOS in your phone settings." };
      }

      const res = await LN.requestPermissions(); // shows the system Allow / Don't allow pop-up
      if (res.display === "granted") return { state: "granted" };
      return { state: "denied", message: "Notifications were not allowed." };
    }
    if (typeof Notification === "undefined") return { state: "error", message: "This browser does not support notifications." };
    if (Notification.permission === "granted") return { state: "granted" };
    const result = await Notification.requestPermission();
    return result === "granted" ? { state: "granted" } : { state: "denied", message: "Notifications are blocked in your browser." };
  } catch (err) {
    return {
      state: "error",
      message: `Could not ask for notification permission (${(err && err.message) || "unknown error"}). Reinstall the latest app build.`,
    };
  }
}

export async function reminderPermission() {
  try {
    if (isNative()) {
      const LN = await plugin();
      const res = await LN.checkPermissions();
      return res.display === "granted" ? "granted" : "default";
    }
    return typeof Notification === "undefined" ? "denied" : Notification.permission;
  } catch {
    return "default";
  }
}

// Android 12+ only fires a notification at the exact minute when "Alarms & reminders" is allowed
// for the app. Without it Android batches the alarm and it can arrive many minutes late.
// Returns true when exact timing is available.
async function exactAllowed(LN) {
  try {
    const res = await LN.checkExactNotificationSetting();
    return res.exact_alarm === "granted";
  } catch {
    return true; // older plugin/Android: exact alarms are not gated
  }
}

export async function requestExactAlarms() {
  if (!isNative()) return true;
  try {
    const LN = await plugin();
    if (await exactAllowed(LN)) return true;
    const res = await LN.changeExactNotificationSetting(); // opens the system "Alarms & reminders" screen
    return res.exact_alarm === "granted";
  } catch {
    return false;
  }
}

export async function exactAlarmsGranted() {
  if (!isNative()) return true;
  try {
    return await exactAllowed(await plugin());
  } catch {
    return true;
  }
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

const DAILY_TITLE = "Time to study 📚";
const DAILY_BODY = "A short focus session keeps your momentum going.";
const streakTitle = (n) => `Your ${n}-day streak is about to break 🔥`;
const streakBody = (studiedToday) =>
  studiedToday ? "Study a little tomorrow to keep it alive." : "One short session today keeps it alive.";

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

// ---------------------------------------------------------------- Android
let channelReady = false;
async function ensureChannel(LN) {
  if (channelReady) return;
  for (const id of OLD_CHANNELS) {
    try { await LN.deleteChannel({ id }); } catch { /* not there */ }
  }
  try {
    await LN.createChannel({
      id: CHANNEL_ID,
      name: "Study reminders",
      description: "Daily study reminders and streak warnings",
      importance: 5, // max: heads-up banner + sound
      visibility: 1,
      sound: NATIVE_SOUND,
      vibration: true,
      lights: true,
      lightColor: ICON_COLOR,
    });
    channelReady = true;
  } catch {
    /* channels only exist on Android 8+ */
  }
}

const nativeBase = (exact) => ({
  channelId: CHANNEL_ID,
  sound: NATIVE_SOUND,
  smallIcon: SMALL_ICON,
  iconColor: ICON_COLOR,
  isExactNotification: exact,
});

// Re-plan every reminder from the current state. Call whenever prefs, the streak
// or "studied today" change. Safe to call often.
//   state = { streak: number, studiedToday: boolean }
export async function syncReminders(prefs, state) {
  if (isNative()) return syncNative(prefs, state);
  syncWeb(prefs, state);
}

async function syncNative(prefs, { streak, studiedToday }) {
  try {
    const LN = await plugin();
    const pending = await LN.getPending();
    const ours = pending.notifications.filter((n) => n.id >= 1000 && n.id < 3000 && n.id !== TEST_ID);
    if (ours.length) await LN.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
    if ((await LN.checkPermissions()).display !== "granted") return;
    await ensureChannel(LN);

    // Exact when the user has allowed "Alarms & reminders". When they haven't, schedule inexact
    // so a background sync never throws the settings screen at them; the toggle flow asks for it.
    const exact = await exactAllowed(LN);
    const base = nativeBase(exact);

    const notifications = [];
    const now = Date.now();

    if (prefs.daily) {
      const t = parseTime(prefs.time, [18, 0]);
      // One per day for the next two weeks, skipping today when you already studied.
      for (let i = 0; i < DAYS_AHEAD; i += 1) {
        const at = atTime(i, t);
        if (at.getTime() <= now || (i === 0 && studiedToday)) continue;
        notifications.push({
          id: DAILY_ID + i,
          title: DAILY_TITLE,
          body: DAILY_BODY,
          schedule: { at, allowWhileIdle: true },
          ...base,
        });
      }
    }

    if (prefs.streak && streak > 0) {
      const t = parseTime(prefs.streakTime, [20, 0]);
      // The streak is at risk today if you haven't studied yet, otherwise tomorrow.
      const at = atTime(studiedToday ? 1 : 0, t);
      if (at.getTime() > now) {
        notifications.push({
          id: STREAK_ID,
          title: streakTitle(streak),
          body: streakBody(studiedToday),
          schedule: { at, allowWhileIdle: true },
          ...base,
        });
      }
    }

    if (notifications.length) await LN.schedule({ notifications });
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

function syncWeb(prefs, { streak, studiedToday }) {
  webPlan = [];
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    if (prefs.daily && !studiedToday) {
      webPlan.push({ at: atTime(0, parseTime(prefs.time, [18, 0])), title: DAILY_TITLE, body: DAILY_BODY, tag: "studyos-daily" });
    }
    if (prefs.streak && streak > 0 && !studiedToday) {
      webPlan.push({ at: atTime(0, parseTime(prefs.streakTime, [20, 0])), title: streakTitle(streak), body: streakBody(false), tag: "studyos-streak" });
    }
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
      const LN = await plugin();
      if ((await LN.checkPermissions()).display !== "granted") {
        const status = await getNotifyStatus();
        if (!(status && status.enabled)) return { ok: false, message: "Allow notifications first, then try again." };
      }
      await ensureChannel(LN);
      await LN.schedule({
        notifications: [{
          id: TEST_ID,
          title: "StudyOS reminders are on ✅",
          body: "This is how your study reminders will look and sound.",
          // no "schedule": the notification is shown immediately
          ...nativeBase(false),
        }],
      });
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
  showWeb("StudyOS reminders are on ✅", "This is how your study reminders will look and sound.", "studyos-test");
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
  let LN = null;
  try {
    LN = await plugin();
    await LN.checkPermissions();
    add(true, "Notification plugin is installed in this build");
  } catch (err) {
    add(false, "Notification plugin is NOT installed in this build", "Run: npm install, npm run build, npx cap sync android, then reinstall the app.");
    return lines;
  }

  const st = await getNotifyStatus();
  if (!st) {
    add(false, "Native helper missing: this is an old app build", "Rebuild and reinstall. Android > App info should say Version 1.1.");
  } else {
    add(true, `App version ${st.versionName || "?"}, Android API ${st.sdk}`);
    if (st.sdk >= 33) {
      add(Boolean(st.declaresPostNotifications), "App asks Android for notification permission (POST_NOTIFICATIONS)",
        st.declaresPostNotifications ? "" : "Missing from this build's manifest: rebuild and reinstall.");
    } else {
      add(true, "Android 12 or older: no permission pop-up exists, notifications are allowed by default");
    }
    add(Boolean(st.enabled), "Notifications are switched on for StudyOS in Android settings");
    if (st.channelExists) {
      add(st.importance >= 3, `Reminder channel importance: ${st.importance} (needs 3+ to make a sound)`);
      add(Boolean(st.hasSound), "Reminder channel has a sound");
    }
  }

  try {
    const p = await LN.checkPermissions();
    add(p.display === "granted", `Permission state: ${p.display}`);
  } catch { /* ignore */ }
  try {
    const e = await LN.checkExactNotificationSetting();
    add(e.exact_alarm === "granted", `Exact alarms ("Alarms & reminders"): ${e.exact_alarm}`);
  } catch { /* older Android */ }
  try {
    const pending = await LN.getPending();
    add(true, `Reminders currently scheduled: ${pending.notifications.length}`);
  } catch { /* ignore */ }
  return lines;
}
