// StudyOS home-screen widgets: web side. Android only; every call is a quiet no-op elsewhere.
// This file only REPORTS real app state and events to the native widgets (android/.../StudyWidgetPlugin.java).
// Mood decisions are made by the mood engine (moodEngine.js / MoodEngine.java), never here.
import { useEffect, useRef } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { newMilestone } from "./moodEngine.js";

const W = Capacitor.isNativePlatform() ? registerPlugin("StudyWidget") : null;
const call = (name, arg) => { try { W?.[name](arg)?.catch?.(() => {}); } catch { /* old build without the plugin */ } };

// The same colours the app screens use for each theme (see design.css).
const PALETTES = {
  "": { pg: "#dfe0e3", card: "#edebec", chip: "#e1e0e2", ink: "#1b1e25", mut: "#4b5d6d", mv: "#c9b8c3", track: "#c8c6c8", onMv: "#1b1e25" },
  ocean: { pg: "#d6e8f1", card: "#eaf3fb", chip: "#c4dbe8", ink: "#14303f", mut: "#44677c", mv: "#8fb9d3", track: "#b7cfdd", onMv: "#10202a" },
  forest: { pg: "#dde8df", card: "#eaf4ec", chip: "#cbdccf", ink: "#16301f", mut: "#46654f", mv: "#93bda1", track: "#bcd0c1", onMv: "#0f2216" },
  sunset: { pg: "#f1ddd5", card: "#f9ece6", chip: "#e6cbc0", ink: "#3b1d12", mut: "#7a5446", mv: "#e0a78f", track: "#dcbfb3", onMv: "#2b140c" },
  mono: { pg: "#e6e6e6", card: "#f5f5f5", chip: "#d4d4d4", ink: "#1e1e1e", mut: "#5c5c5c", mv: "#a8a8a8", track: "#c4c4c4", onMv: "#141414" },
};
const MIDNIGHT = { pg: "#0d1114", card: "#1f252d", chip: "#2a323a", ink: "#ebe8ea", mut: "#9aa6b0", mv: "#c9b8c3", track: "#2d353d", onMv: "#1b1e25" };

export function widgetTheme(theme, palette) {
  const key = String(palette || "").replace(/^theme_/, "");
  // Dark mode keeps dark surfaces, but a chosen colour theme (Ocean...) still sets the widget colour.
  if (theme === "dark") return { dark: true, ...MIDNIGHT, ...(PALETTES[key] ? { mv: PALETTES[key].mv, onMv: PALETTES[key].onMv } : {}) };
  // The app stores paid themes as "theme_ocean"; the colour table is keyed "ocean".
  return { dark: false, ...(PALETTES[key] || PALETTES[""]) };
}

let lastCompletionAt = 0;
/** A study task or a focus session was just finished: the mascot reacts at once. */
export function widgetTaskDone() {
  lastCompletionAt = Date.now();
  call("taskCompleted");
}

/** Open once at app start: forwards focus-running state and widget taps to the app. */
export function startWidgetBridge(onOpen) {
  if (!W) return () => {};
  const onFocus = (e) => call("setSession", { active: Boolean(e.detail?.running) });
  const onWidget = (e) => { try { onOpen?.(JSON.parse(e.detail || "{}").target || ""); } catch { /* ignore */ } };
  window.addEventListener("studyos-focus", onFocus);
  window.addEventListener("studyos-widget-open", onWidget);
  call("setSession", { active: false }); // a timer from a previous run is gone
  // Cold start from a widget tap.
  W.getLaunchTarget?.().then((r) => { if (r?.target) onOpen?.(r.target); }).catch(() => {});
  return () => {
    window.removeEventListener("studyos-focus", onFocus);
    window.removeEventListener("studyos-widget-open", onWidget);
  };
}

/**
 * Pushes a fresh snapshot whenever the real data changes, and starts the milestone celebration
 * when a finished session just raised the streak to a milestone (only then, so loading data never fakes one).
 */
export function useWidgetSync(p) {
  const prevStreak = useRef(null);
  // Widget Pack is a shop item: remember the last known answer so it also works offline.
  let unlocked = p.snapshot.unlocked;
  try {
    const k = `studyos-widgets-unlocked:${p.uid || "me"}`;
    if (typeof unlocked === "boolean") localStorage.setItem(k, unlocked ? "1" : "0");
    else unlocked = localStorage.getItem(k) === "1";
  } catch { unlocked = Boolean(unlocked); }
  const snap = { ...p.snapshot, unlocked };
  const key = JSON.stringify(snap);
  useEffect(() => {
    if (!W || !p.signedIn) return;
    call("sync", { ...snap, signedIn: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, p.signedIn]);

  useEffect(() => {
    if (!W || !p.signedIn || !p.ready) { prevStreak.current = null; return; }
    const store = `studyos-widget-celebrated:${p.uid || "me"}`;
    let celebrated = 0;
    try { celebrated = Number(localStorage.getItem(store)) || 0; } catch { /* storage blocked */ }
    const streak = p.snapshot.streak;
    if (prevStreak.current === null) {
      // First look at real data: remember what was already reached, never celebrate it.
      const base = newMilestone(streak, celebrated);
      if (base) { try { localStorage.setItem(store, String(base)); } catch { /* ignore */ } }
    } else if (streak > prevStreak.current && Date.now() - lastCompletionAt < 20000) {
      const hit = newMilestone(streak, celebrated);
      if (hit) {
        try { localStorage.setItem(store, String(hit)); } catch { /* ignore */ }
        call("celebrate", { milestone: hit });
      }
    }
    prevStreak.current = streak;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.snapshot.streak, p.signedIn, p.ready]);
}
