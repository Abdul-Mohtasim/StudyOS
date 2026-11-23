// Zip, the study buddy mascot (the green alien). It is drawn from five artwork poses:
// 0 standing, 1 walking, 2 waving, 3 jumping, 4 cheering. Gestures swap the pose and add a small motion.
// The file keeps its old name so existing imports keep working.
// States: idle (always on), greet, talk, think, success, explain, oops, nod.
import p0 from "./assets/alien/p0.webp";
import p1 from "./assets/alien/p1.webp";
import p2 from "./assets/alien/p2.webp";
import p3 from "./assets/alien/p3.webp";
import p4 from "./assets/alien/p4.webp";

export const ZIP_POSES = [p0, p1, p2, p3, p4];
// load every pose once so a gesture never waits on the network or the disk
if (typeof Image !== "undefined") ZIP_POSES.forEach((u) => { const i = new Image(); i.src = u; });

export function znHtml(h = 92, id = "", cls = "") {
  return `<div class="zn ${cls}" ${id ? `id="${id}"` : ""} style="--zh:${h}px" data-face="happy"><div class="zn-fl"><div class="zn-up"><img class="zl zn-p" alt="" draggable="false" src="${p0}"><div class="zn-fx"></div></div></div></div>`;
}

// nothing to start now (no blinking layers), kept so callers do not change
export function znInit(root) {
  root.querySelectorAll(".zn").forEach((z) => { z._on = true; z.dataset.face = z.dataset.face || "happy"; });
}
export function znStopAll() { /* timers are per mascot and cleared when it is replaced */ }

const ONE = { greet: 1900, think: 2300, success: 1700, explain: 2400, oops: 1100, nod: 650 };
const POSE = { greet: 2, explain: 2, success: 4, think: 0, oops: 0, nod: 0 };
const setPose = (z, n) => { const im = z.querySelector(".zn-p"); if (im && im.getAttribute("src") !== ZIP_POSES[n]) im.src = ZIP_POSES[n]; };
// play a one-shot gesture, then return to standing
export function znSet(z, state, face) {
  if (!z || !z.isConnected) return;
  if (!ONE[state]) return;
  clearTimeout(z._st);
  z.classList.remove(...Object.keys(ONE).map((k) => "s-" + k));
  void z.offsetWidth; // restart the animation
  z.classList.add("s-" + state);
  setPose(z, POSE[state]);
  if (state === "success") { setTimeout(() => z.isConnected && z.classList.contains("s-success") && setPose(z, 3), 380); }
  z._st = setTimeout(() => {
    z.classList.remove("s-" + state);
    setPose(z, 0);
  }, ONE[state]);
  if (state === "success") sparkle(z);
}
export function znFace(z, face) { if (z) z.dataset.face = face; }
// while the speech bubble types, the mascot nods along
export function znTalk(z, on) {
  if (!z) return;
  z._talk = !!on;
  z.classList.toggle("talking", !!on);
}
function sparkle(z) {
  const box = z.querySelector(".zn-fx");
  if (!box) return;
  for (let i = 0; i < 7; i++) {
    const s = document.createElement("i");
    const ang = (-80 + i * 27) * Math.PI / 180, d = 38 + Math.random() * 26;
    s.style.setProperty("--tx", Math.cos(ang) * d + "px");
    s.style.setProperty("--ty", Math.sin(ang) * d - 18 + "px");
    s.style.setProperty("--dl", i * 45 + "ms");
    box.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}
