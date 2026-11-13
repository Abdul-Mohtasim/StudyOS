// Zuno, the tutor mascot, built from separate layers (legs, torso, waving arm, head)
// cut from the original artwork. Eyes and mouth are small vector overlays in the same ink colour.
// States: idle (always on), greet, talk, think, success, explain, oops, nod.
import headUrl from "./assets/zuno/head.png";
import torsoUrl from "./assets/zuno/torso.png";
import armUrl from "./assets/zuno/arm.png";
import legsUrl from "./assets/zuno/legs.png";

const INK = "#181b22";
const FACE = `
<svg class="zl zface" viewBox="0 0 296 380" aria-hidden="true">
 <g class="eyes"><g class="eye l"><ellipse cx="133" cy="90" rx="5.4" ry="5.9" fill="${INK}"/></g><g class="eye r"><ellipse cx="163" cy="90" rx="5.4" ry="5.9" fill="${INK}"/></g></g>
 <g class="eyesh"><path d="M126.500 93.500Q133 84 139.500 93.500" fill="none" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/><path d="M156.500 93.500Q163 84 169.500 93.500" fill="none" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/></g>
 <path class="m m-smile" d="M136 104Q149 115 162 104" fill="none" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/>
 <path class="m m-open" d="M134 103Q148 128 163 103Q148 107 134 103Z" fill="${INK}" stroke="${INK}" stroke-width="2.800" stroke-linejoin="round"/>
 <ellipse class="m m-o" cx="149" cy="109" rx="4.200" ry="5" fill="${INK}"/>
 <path class="m m-flat" d="M140 108Q149 106 158 109" fill="none" stroke="${INK}" stroke-width="3.400" stroke-linecap="round"/>
 <path class="m m-sad" d="M137 111Q149 102 161 111" fill="none" stroke="${INK}" stroke-width="3.400" stroke-linecap="round"/>
</svg>`;

export function znHtml(h = 92, id = "", cls = "") {
  return `<div class="zn ${cls}" ${id ? `id="${id}"` : ""} style="--zh:${h}px" data-face="happy"><div class="zn-fl"><img class="zl" alt="" src="${legsUrl}"><div class="zn-up"><img class="zl" alt="" src="${torsoUrl}"><div class="zl zn-armw"><img class="zl" alt="" src="${armUrl}"></div><div class="zl zn-headw"><img class="zl" alt="" src="${headUrl}">${FACE}</div></div></div><div class="zn-fx"></div></div>`;
}

const live = new Set();
function blinkLoop(z) {
  const eyes = z.querySelector(".eyes");
  if (!eyes) return;
  const t = setTimeout(() => {
    if (!z.isConnected) { live.delete(z); return; }
    z.classList.add("blink");
    setTimeout(() => z.classList.remove("blink"), 150);
    if (Math.random() < 0.25) setTimeout(() => { z.classList.add("blink"); setTimeout(() => z.classList.remove("blink"), 130); }, 300);
    blinkLoop(z);
  }, 2200 + Math.random() * 3200);
  z._bt = t;
}
// start blinking for every Zuno inside root
export function znInit(root) {
  root.querySelectorAll(".zn").forEach((z) => {
    if (z._on) return;
    z._on = true; live.add(z);
    z.dataset.face = z.dataset.face || "happy";
    blinkLoop(z);
  });
}
export function znStopAll() { live.forEach((z) => { clearTimeout(z._bt); clearInterval(z._tt); }); live.clear(); }

const ONE = { greet: 1900, think: 2300, success: 1700, explain: 2400, oops: 1100, nod: 650 };
// play a one-shot gesture, then return to idle smoothly
export function znSet(z, state, face) {
  if (!z || !z.isConnected) return;
  if (!ONE[state]) return;
  clearTimeout(z._st);
  z.classList.remove(...Object.keys(ONE).map((k) => "s-" + k));
  void z.offsetWidth; // restart the animation
  z.classList.add("s-" + state);
  const f = face || { greet: "happy", think: "think", success: "joy", explain: "happy", oops: "oops", nod: "happy" }[state];
  if (f) z.dataset.face = f;
  z._st = setTimeout(() => {
    z.classList.remove("s-" + state);
    if (!z._talk) z.dataset.face = "happy";
  }, ONE[state]);
  if (state === "success") sparkle(z);
}
export function znFace(z, face) { if (z) z.dataset.face = face; }
// mouth moves with the words
export function znTalk(z, on) {
  if (!z) return;
  clearInterval(z._tt);
  z._talk = !!on;
  z.classList.toggle("talking", !!on);
  if (on) {
    let o = 0;
    z._tt = setInterval(() => {
      if (!z.isConnected) { clearInterval(z._tt); return; }
      o = Math.random() < 0.72 ? (o ? 0 : 1) : o;
      z.dataset.mo = String(o);
    }, 120);
  } else z.dataset.mo = "0";
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
