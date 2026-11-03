// StudyOS haptics.
// Native Android/iOS (Capacitor): real impact + notification haptics, chained
// into heavy multi-pulse patterns. Browser: navigator.vibrate fallback
// (Android Chrome only; iOS Safari does not support vibration).
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const STORAGE_KEY = "studyos-haptics";
const native = Capacitor.isNativePlatform();

let enabled = true;
try {
  enabled = localStorage.getItem(STORAGE_KEY) !== "off";
} catch {
  /* storage unavailable: keep default */
}

export function isHapticsEnabled() {
  return enabled;
}

export function setHapticsEnabled(value) {
  enabled = Boolean(value);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (enabled) haptic.press();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safe = (promise) => Promise.resolve(promise).catch(() => {});

function webVibrate(pattern) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

// One step: [style, waitAfterMs]. style: "L" light, "M" medium, "H" heavy,
// or a number = sustained rumble in milliseconds.
async function playNative(steps) {
  for (const [style, wait = 0] of steps) {
    if (typeof style === "number") {
      await safe(Haptics.vibrate({ duration: style }));
      await sleep(style + wait);
      continue;
    }
    const map = { L: ImpactStyle.Light, M: ImpactStyle.Medium, H: ImpactStyle.Heavy };
    await safe(Haptics.impact({ style: map[style] }));
    if (wait) await sleep(wait);
  }
}

function play({ steps, web }) {
  if (!enabled) return;
  if (native) {
    playNative(steps);
  } else {
    webVibrate(web);
  }
}

export const haptic = {
  // Light-but-solid confirmation for any tap.
  tap() {
    play({ steps: [["M"]], web: 14 });
  },
  // Heavy double thump for primary actions.
  press() {
    play({ steps: [["H", 55], ["M"]], web: [34, 45, 20] });
  },
  // Crisp tick for toggles and selections.
  select() {
    play({ steps: [["L"]], web: 8 });
  },
  // Triple punch + success notification: task done, saved, added.
  success() {
    play({
      steps: [["H", 70], ["H", 70], ["M", 60], ["L"]],
      web: [40, 55, 40, 55, 70],
    });
    if (enabled && native) safe(Haptics.notification({ type: NotificationType.Success }));
  },
  // Hard warning buzz: delete, reset.
  warning() {
    play({ steps: [["H", 40], ["H", 40], [90]], web: [70, 45, 70, 45, 90] });
    if (enabled && native) safe(Haptics.notification({ type: NotificationType.Warning }));
  },
  // Rapid triple hit: errors.
  error() {
    play({ steps: [["H", 35], ["H", 35], ["H"]], web: [55, 35, 55, 35, 55] });
    if (enabled && native) safe(Haptics.notification({ type: NotificationType.Error }));
  },
  // Focus session start: a building surge.
  timerStart() {
    play({
      steps: [["L", 60], ["M", 60], ["H", 70], ["H", 40], [120]],
      web: [15, 50, 25, 50, 40, 60, 120],
    });
  },
  // Focus session complete: crescendo, long rumble, then a success finish.
  celebrate() {
    play({
      steps: [
        ["L", 70], ["L", 60], ["M", 60], ["M", 55],
        ["H", 50], ["H", 50], ["H", 80],
        [450, 90],
        ["H", 70], ["H", 70], ["H"],
      ],
      web: [20, 60, 24, 55, 34, 50, 50, 45, 70, 40, 90, 70, 450, 90, 90, 70, 90, 70, 110],
    });
    if (enabled && native) {
      setTimeout(() => safe(Haptics.notification({ type: NotificationType.Success })), 1500);
    }
  },
};

// ---- Global feedback for every tap on a control -------------------------
const INTERACTIVE =
  'button, a[href], [role="button"], [role="tab"], [role="switch"], ' +
  'input[type="checkbox"], input[type="radio"], select, summary';
const DESTRUCTIVE = /delete|remove|trash|clear|logout|log out|sign out/i;
const PRIMARY = /primary|start|save|add|submit|cta|create|continue|get started|google/i;

let lastFired = 0;

function classify(el) {
  const label = `${el.className || ""} ${el.getAttribute("aria-label") || ""} ${
    el.getAttribute("title") || ""
  } ${(el.textContent || "").slice(0, 40)}`;
  if (DESTRUCTIVE.test(label)) return "warning";
  if (el.matches('input[type="checkbox"], input[type="radio"], [role="switch"], select')) {
    return "select";
  }
  if (PRIMARY.test(label)) return "press";
  return "tap";
}

export function installGlobalHaptics() {
  if (typeof document === "undefined") return;
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!enabled) return;
      const el = event.target.closest?.(INTERACTIVE);
      if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
      const now = Date.now();
      if (now - lastFired < 40) return;
      lastFired = now;
      haptic[classify(el)]();
    },
    { capture: true, passive: true }
  );
}
