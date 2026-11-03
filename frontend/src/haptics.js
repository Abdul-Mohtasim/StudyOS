// StudyOS haptics: a different, stronger "feel" for every kind of action.
//
// Android app  : one call to the native StudyHaptics plugin plays the whole pattern
//                (hardware primitives when the phone has them, else an amplitude
//                waveform). One bridge call per pattern keeps the UI smooth.
// Fallbacks    : official Capacitor Haptics, then navigator.vibrate in Android Chrome.
//                (iPhone Safari does not allow web pages to vibrate.)
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const STORAGE_KEY = "studyos-haptics";
const native = Capacitor.isNativePlatform();
const StudyHaptics = native ? registerPlugin("StudyHaptics") : null;

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
  if (enabled) haptic.confirm();
}

// Primitive ids: 1 click, 2 thud, 3 spin, 4 quick rise, 5 slow rise,
//                6 quick fall, 7 tick, 8 low tick.
// prims  = [[primitive, strength 0..1, delayBeforeMs], ...]
// wave   = [[durationMs, amplitude 0..255], ...]  (amplitude 0 = pause) - used if no primitives
// web    = navigator.vibrate pattern
// weight = how long it plays (ms) and whether it may be interrupted by small taps
const PATTERNS = {
  // every plain tap: one crisp click
  tap: {
    prims: [[1, 0.9, 0]],
    wave: [[24, 210]],
    web: 18,
    fallback: "medium",
    ms: 40,
  },
  // moving to another section / tab: a quick rise into a click
  nav: {
    prims: [[4, 0.8, 0], [1, 1.0, 20]],
    wave: [[18, 110], [10, 0], [30, 255]],
    web: [18, 12, 30],
    fallback: "medium",
    ms: 90,
  },
  // main buttons (Save / Add / Start): solid thud then a click
  press: {
    prims: [[2, 1.0, 0], [1, 0.8, 45]],
    wave: [[38, 255], [40, 0], [22, 190]],
    web: [38, 40, 22],
    fallback: "heavy",
    ms: 130,
  },
  // switches, checkboxes, theme choices: a tight double tick
  select: {
    prims: [[7, 1.0, 0], [7, 0.7, 28]],
    wave: [[12, 190], [28, 0], [14, 150]],
    web: [12, 28, 14],
    fallback: "light",
    ms: 70,
  },
  // a setting or profile change was saved: click, thud, soft tick
  confirm: {
    prims: [[1, 0.8, 0], [2, 1.0, 55], [7, 0.6, 50]],
    wave: [[22, 170], [45, 0], [50, 255], [40, 0], [16, 120]],
    web: [22, 45, 50, 40, 16],
    fallback: "medium",
    ms: 220,
    strong: true,
  },
  // task / planner item completed: rising swell, thud, click, tick
  success: {
    prims: [[5, 0.9, 0], [2, 1.0, 25], [1, 0.9, 70], [7, 0.8, 50]],
    wave: [[22, 80], [14, 0], [28, 150], [14, 0], [60, 255], [55, 0], [30, 190]],
    web: [22, 14, 28, 14, 60, 55, 30],
    fallback: "success",
    ms: 380,
    strong: true,
  },
  // new task / planner item added: click, click, thud
  add: {
    prims: [[1, 0.9, 0], [1, 0.8, 55], [2, 1.0, 65]],
    wave: [[22, 190], [45, 0], [22, 170], [50, 0], [56, 255]],
    web: [22, 45, 22, 50, 56],
    fallback: "medium",
    ms: 260,
    strong: true,
  },
  // note saved: tick, click, soft low tick, like a stamp
  note: {
    prims: [[7, 1.0, 0], [1, 1.0, 40], [8, 0.9, 55]],
    wave: [[12, 160], [32, 0], [30, 255], [48, 0], [26, 130]],
    web: [12, 32, 30, 48, 26],
    fallback: "medium",
    ms: 230,
    strong: true,
  },
  // delete / reset: two hard thuds that fall away
  warning: {
    prims: [[2, 1.0, 0], [2, 1.0, 75], [6, 1.0, 55]],
    wave: [[75, 255], [55, 0], [75, 255], [55, 0], [150, 160]],
    web: [75, 55, 75, 55, 150],
    fallback: "warning",
    ms: 420,
    strong: true,
  },
  // something went wrong: three rapid hits
  error: {
    prims: [[2, 1.0, 0], [2, 1.0, 55], [2, 1.0, 55]],
    wave: [[55, 255], [45, 0], [55, 255], [45, 0], [55, 255]],
    web: [55, 45, 55, 45, 55],
    fallback: "error",
    ms: 330,
    strong: true,
  },
  // undo: quick fall and a click
  undo: {
    prims: [[6, 0.9, 0], [1, 0.9, 30]],
    wave: [[40, 200], [30, 0], [24, 220]],
    web: [40, 30, 24],
    fallback: "medium",
    ms: 140,
    strong: true,
  },
  // signed in: rise, click, thud, tick
  welcome: {
    prims: [[4, 0.9, 0], [1, 1.0, 35], [2, 1.0, 65], [7, 0.8, 55]],
    wave: [[26, 120], [20, 0], [24, 200], [30, 0], [70, 255], [50, 0], [24, 150]],
    web: [26, 20, 24, 30, 70, 50, 24],
    fallback: "success",
    ms: 380,
    strong: true,
  },
  // focus session starts: slow build into two heavy thuds
  timerStart: {
    prims: [[5, 1.0, 0], [4, 1.0, 40], [2, 1.0, 50], [2, 0.9, 95]],
    wave: [
      [24, 70], [18, 0], [32, 120], [18, 0], [44, 180], [18, 0],
      [80, 255], [60, 0], [120, 230],
    ],
    web: [24, 18, 32, 18, 44, 18, 80, 60, 120],
    fallback: "heavy",
    ms: 700,
    strong: true,
  },
  // focus session finished: crescendo, a long rumble, then a victory finish
  celebrate: {
    prims: [
      [5, 0.8, 0], [5, 1.0, 20], [4, 1.0, 30], [2, 1.0, 50], [1, 1.0, 80],
      [2, 1.0, 100], [1, 1.0, 80], [2, 1.0, 100], [3, 1.0, 70], [2, 1.0, 90],
    ],
    wave: [
      [30, 60], [20, 0], [40, 90], [20, 0], [50, 130], [20, 0], [60, 170], [20, 0],
      [80, 210], [30, 0], [120, 255], [30, 0], [320, 255], [70, 0],
      [70, 255], [50, 0], [90, 255], [50, 0], [160, 255],
    ],
    web: [30, 20, 40, 20, 50, 20, 60, 20, 80, 30, 120, 30, 320, 70, 70, 50, 90, 50, 160],
    fallback: "success",
    ms: 1500,
    strong: true,
  },
};

let busyUntil = 0;

function toWaveform(wave) {
  const timings = [0];
  const amplitudes = [0];
  // Android waveforms start with a pause entry
  for (const [ms, amp] of wave) {
    timings.push(ms);
    amplitudes.push(amp);
  }
  return { timings, amplitudes };
}

async function fallbackNative(kind) {
  try {
    if (kind === "success") await Haptics.notification({ type: NotificationType.Success });
    else if (kind === "warning") await Haptics.notification({ type: NotificationType.Warning });
    else if (kind === "error") await Haptics.notification({ type: NotificationType.Error });
    else if (kind === "heavy") await Haptics.impact({ style: ImpactStyle.Heavy });
    else if (kind === "light") await Haptics.impact({ style: ImpactStyle.Light });
    else await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    /* ignore */
  }
}

function fire(name) {
  if (!enabled) return;
  const pattern = PATTERNS[name];
  if (!pattern) return;

  const now = Date.now();
  // Small taps never cut off a bigger moment that is still playing.
  if (!pattern.strong && now < busyUntil) return;
  busyUntil = pattern.strong ? now + pattern.ms : 0;

  if (native && StudyHaptics) {
    const { timings, amplitudes } = toWaveform(pattern.wave);
    StudyHaptics.play({ prims: pattern.prims, timings, amplitudes }).catch(() =>
      fallbackNative(pattern.fallback)
    );
    return;
  }
  if (native) {
    fallbackNative(pattern.fallback);
    return;
  }
  try {
    navigator.vibrate?.(pattern.web);
  } catch {
    /* ignore */
  }
}

export const haptic = Object.fromEntries(
  Object.keys(PATTERNS).map((name) => [name, () => fire(name)])
);

// ---- Global feedback for every tap on a control -------------------------
const INTERACTIVE =
  'button, a[href], [role="button"], [role="tab"], [role="switch"], ' +
  'input[type="checkbox"], input[type="radio"], select, summary';
const NAV = /(^|\s)(nav-link|as-tab|pl-nav-link|bottom-nav|menu-link)(\s|$)|\[role=tab\]/;
const DESTRUCTIVE = /delete|remove|trash|logout|log out|sign out/i;
const SWITCH = /switch|toggle|settings-theme-option|checkbox|radio/i;
const PRIMARY = /primary|start|save|add|submit|cta|create|continue|get started|google/i;

let lastFired = 0;

function classify(el) {
  const cls = typeof el.className === "string" ? el.className : "";
  const label = `${cls} ${el.getAttribute("aria-label") || ""} ${el.getAttribute("title") || ""}`;
  if (DESTRUCTIVE.test(label)) return "warning";
  if (NAV.test(cls) || el.getAttribute("role") === "tab" || el.closest?.("nav")) return "nav";
  if (
    el.matches('input[type="checkbox"], input[type="radio"], [role="switch"], select') ||
    SWITCH.test(label)
  ) {
    return "select";
  }
  if (PRIMARY.test(`${label} ${(el.textContent || "").slice(0, 24)}`)) return "press";
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
      fire(classify(el));
    },
    { capture: true, passive: true }
  );
}
