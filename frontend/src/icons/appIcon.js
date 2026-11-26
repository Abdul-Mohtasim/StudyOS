// Wires StudyOS events into the icon controller, saves its state, and applies the icon to the launcher.
// The launcher icon is only switched when the app goes to the background (or for an explicit user choice),
// so the open app is never interrupted and the launcher refreshes while it is not in use.
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import * as IC from "./iconController.js";
import { DynamicAppIconService as SVC } from "./DynamicAppIconService.js";

// Saved per account, so every user starts from the default icon and keeps their own choice.
const KEY = "studyos-app-icon-state";
let UID = "";
const keyFor = (uid) => KEY + ":" + (uid || "guest");
let S = load(UID), started = false, applying = false;
const subs = new Set();

function load(uid) {
  try { const raw = localStorage.getItem(keyFor(uid)); if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return Object.assign(IC.freshState(), s, { seen: Object.assign(IC.freshState().seen, s.seen || {}) }); } }
  catch (e) { console.warn("[AppIcon] saved state unreadable, starting fresh:", e); }
  return IC.freshState();
}
function save() { try { localStorage.setItem(keyFor(UID), JSON.stringify(S)); } catch (e) { console.warn("[AppIcon] could not save state:", e); } subs.forEach((f) => { try { f(getInfo()); } catch (_) {} }); }
const now = () => Date.now();

async function apply(force) {
  if (applying) return;
  applying = true;
  try {
    const t = now(), d = IC.decide(S, t);
    if (!force && !IC.shouldSwitch(S, d, t)) return;
    if (force && S.nativeIcon === d.icon) return;
    const r = await SVC.setIcon(d.icon);
    if (r.ok) { IC.recordSwitch(S, d.icon, t); S.pending = !!r.pending; }
    else S.lastError = r.reason || "failed";
    save();
  } finally { applying = false; }
}

// reconcile: the launcher is the truth for what is showing now
async function reconcile() {
  const cur = await SVC.getCurrentIcon();
  if (cur && cur !== S.nativeIcon) { S.nativeIcon = cur; save(); }
}

export function startAppIcon() {
  if (started) return; started = true;
  try { localStorage.removeItem(KEY); } catch (_) {}
  S.pending = false; IC.onAppOpen(S, now()); save();
  reconcile();
  window.addEventListener("studyos-focus", (e) => { IC.onFocus(S, !!(e.detail && e.detail.running), now()); save(); });
  if (Capacitor.isNativePlatform()) {
    CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) { S.pending = false; IC.onAppOpen(S, now()); save(); reconcile(); }
      else { S.lastActive = now(); save(); apply(false); }
    }).catch((e) => console.warn("[AppIcon] appStateChange listener failed:", e));
  }
}
/* account switch: load that account's own icon state (a new account gets the default) and apply it */
export async function setAppIconUser(uid) {
  uid = String(uid || "");
  if (uid === UID) return;
  save();                       // keep the previous account's state
  UID = uid;
  S = load(UID);
  S.pending = false;
  IC.onAppOpen(S, now());
  save();
  try { await reconcile(); await apply(true); }
  catch (e) { console.error("[AppIcon] switching account icon failed:", (e && e.message) || String(e)); }
}
/* start screen follows the app theme: Ocean/Forest/Sunset/Mono, Midnight for dark mode, Ember otherwise */
let lastSplash = "";
export function setSplashTheme(theme, palette) {
  const p = String(palette || "").replace(/^theme_/, "");
  const key = ["ocean", "forest", "sunset", "mono"].includes(p) ? p : theme === "dark" ? "midnight" : "ember";
  if (key === lastSplash) return;
  lastSplash = key;
  try { localStorage.setItem("studyos-splash", key); } catch (_) {}
  SVC.setSplashTheme(key);
}
/* event reports (called from the existing widget events, so there is one source) */
export const appIconEvents = {
  taskDone(id) { IC.onTaskDone(S, id, now()); save(); },
  focusDone(id) { IC.onFocusDone(S, id, now()); save(); },
  goal(todayMin, goalMin) { IC.onGoalProgress(S, todayMin, goalMin, now()); save(); },
  streak(m) { IC.onStreakMilestone(S, m, now()); save(); },
  studied(today, yesterday) { if (S.studiedToday !== !!today || S.studiedYesterday !== !!yesterday) { S.studiedToday = !!today; S.studiedYesterday = !!yesterday; save(); } },
};
/* settings */
export function getInfo() { const d = IC.decide(S, now()); return { auto: S.auto, preferred: S.preferred, pending: !!S.pending, current: S.nativeIcon || "flame_default", next: d.icon, reason: d.reason, lastError: S.lastError, icons: IC.ICONS }; }
export function onAppIconChange(f) { subs.add(f); return () => subs.delete(f); }
export async function setAutoIcon(on) { IC.setAuto(S, on); save(); if (!on) await apply(true); }
export async function chooseIcon(icon) { IC.setPreferred(S, icon); save(); if (!S.auto) await apply(true); }
export async function resetAppIcon() { IC.setPreferred(S, "flame_default"); IC.setAuto(S, false); save(); await apply(true); }
export const appIconSupported = () => SVC.isSupported();
