import p_flame_default from "./previews/flame_default.png";
import p_flame_focused from "./previews/flame_focused.png";
import p_flame_celebrating from "./previews/flame_celebrating.png";
import p_flame_sleepy from "./previews/flame_sleepy.png";
import p_flame_away from "./previews/flame_away.png";
import p_flame_welcome from "./previews/flame_welcome.png";
import p_flame_streak from "./previews/flame_streak.png";
import p_flame_goal_complete from "./previews/flame_goal_complete.png";
import p_flame_resting from "./previews/flame_resting.png";
import p_flame_motivated from "./previews/flame_motivated.png";
// Settings > Appearance > App icon. Uses the existing settings page look (.ss/.ssc/.sit/.tgl).
import { getInfo, onAppIconChange, setAutoIcon, chooseIcon, resetAppIcon, appIconSupported } from "./appIcon.js";
import "./appIcon.css";
export const ICON_PREVIEW = {flame_default:p_flame_default,flame_focused:p_flame_focused,flame_celebrating:p_flame_celebrating,flame_sleepy:p_flame_sleepy,flame_away:p_flame_away,flame_welcome:p_flame_welcome,flame_streak:p_flame_streak,flame_goal_complete:p_flame_goal_complete,flame_resting:p_flame_resting,flame_motivated:p_flame_motivated};
export const ICON_NAME = {"flame_default": "Default", "flame_focused": "Focused", "flame_celebrating": "Celebrating", "flame_sleepy": "Sleepy", "flame_away": "Away", "flame_welcome": "Welcome", "flame_streak": "Streak", "flame_goal_complete": "Goal complete", "flame_resting": "Resting", "flame_motivated": "Motivated"};
const REASON = { manual: "You picked this icon", goal: "All daily goals done", streak: "Streak milestone", focusDone: "Focus session finished", taskDone: "Task finished", focusing: "Focus session running", welcome: "Welcome back", away: "Away for 3+ days", sleepy: "Away for a day", base: "Everyday icon" };
export function appIconRowHtml() {
  const i = getInfo();
  return `<div class="sit aic-row" data-it="App icon"><img src="${ICON_PREVIEW[i.current] || ICON_PREVIEW.flame_default}" alt="">App icon<small>${i.auto ? "Changes with your study" : ICON_NAME[i.preferred]}</small></div>`;
}
export function appIconPageBody(supported) {
  const i = getInfo(), cur = i.current;
  const tiles = i.icons.map((k) => `<button type="button" class="aic-t${(i.auto ? cur : i.preferred) === k ? " on" : ""}" data-aic="${k}" aria-pressed="${(i.auto ? cur : i.preferred) === k}"><img src="${ICON_PREVIEW[k]}" alt=""><span>${ICON_NAME[k]}</span></button>`).join("");
  return `<div class="aic">
  <div class="aic-hero"><img src="${ICON_PREVIEW[cur] || ICON_PREVIEW.flame_default}" alt="Current app icon"><div><b>${ICON_NAME[cur] || "Default"}</b><small>${i.auto ? (REASON[i.reason] || "") + (i.next !== cur ? " · next: " + ICON_NAME[i.next] : "") : "Fixed icon"}</small></div></div>
  ${supported ? "" : `<div class="aic-note">Your device can't change the app icon, so StudyOS keeps the default one.</div>`}
  ${i.pending ? `<div class="aic-note aic-ok">Saved. Your new icon appears on the home screen after you leave StudyOS.</div>` : ""}
  ${i.lastError ? `<div class="aic-note">The last icon change did not work (${String(i.lastError).replace(/[<>&"]/g, "")}). StudyOS will try again later.</div>` : ""}
  <div class="sgrp"><div class="sit tgl rd" data-aic-auto><div>Change automatically<small>The flame on your home screen reacts to your focus sessions, goals and breaks</small></div><div class="ptg${i.auto ? "" : " off"}"><i></i></div></div></div>
  <h4>${i.auto ? "Everyday icon" : "Choose your icon"}</h4>
  <div class="aic-grid">${tiles}</div>
  <p class="aic-help">${i.auto ? "The everyday icon shows when nothing special is happening. Some launchers take a few seconds to update, and a few may move the icon off your home screen when it changes. It stays in your app list." : "Automatic changes are off, so StudyOS keeps the icon you pick. The new icon shows after you leave the app."}</p>
  <button type="button" class="aic-reset" data-aic-reset>Reset to original icon</button></div>`;
}
// called by the page's play(): binds taps; returns an unsubscribe for live refresh
export function bindAppIconPage(root, rerender, hap) {
  let busy = false;
  const run = async (f) => { if (busy) return; busy = true; try { await f(); } catch (e) { console.error("[AppIcon] settings action failed:", e); } finally { busy = false; rerender(); } };
  root.onclick = (e) => {
    if (e.target.closest("[data-aic-auto]")) { hap && hap("light"); run(() => setAutoIcon(!getInfo().auto)); return true; }
    const t = e.target.closest("[data-aic]");
    if (t) { hap && hap("tick"); run(() => chooseIcon(t.dataset.aic)); return true; }
    if (e.target.closest("[data-aic-reset]")) { hap && hap("medium"); run(() => resetAppIcon()); return true; }
    return false;
  };
  return onAppIconChange(() => {});
}
export { appIconSupported };
