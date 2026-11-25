/* eslint-disable */
// StudyOS flame mascot: one shared controller for every place in the app.
// Put a mascot anywhere with mascotHtml(action, place); it mounts itself when it reaches the page.
// One animation loop drives every visible mascot. Small mascots run at 30 fps with no embers,
// off-screen or hidden-tab mascots pause, and reduced motion shows a single still pose.
import "./flame_rig.js";
import "./flame_actions.js";
import "./mascot.css";

const G = typeof window !== "undefined" ? window : globalThis;
const RIG = G.FlameRig, ACT = G.FLAME_ACTIONS;
const VB = 'viewBox="-120 -70 240 275"';

// Sizes are the mascot's full height in px (fire tips to feet). Width is 0.873 of that.
export const SIZES = {
  hero: 196,      // big moments: onboarding welcome, profile created
  celebrate: 132, // beside a streak count or a result
  guide: 92,      // talking guide on question screens (next to a speech bubble)
  card: 104,      // empty states inside a card
  inline: 84,     // no results, small notices
  buddy: 76,      // keeps you company on the focus timer
  corner: 56,     // tiny companion in a corner
};
const PAL = { ocean: "ocean", forest: "forest", sunset: "sunset" };
let curPal = "";
function syncPalette() {
  const p = (typeof document !== "undefined" && document.documentElement.getAttribute("data-palette")) || "";
  const k = PAL[p] || "ember";
  if (k !== curPal) { curPal = k; RIG.setPalette(k); }
}

const px = (place) => (typeof place === "number" ? place : SIZES[place] || SIZES.card);
// A mascot is identified by its slot (action + place + class). When a screen redraws and the same
// slot appears again, the existing mascot carries on from the exact frame it was on, instead of
// starting over. Its last frame is written straight into the new HTML, so there is never a blank gap.
const SLOTS = new Map();
const slotKey = (a, place, cls) => a + "|" + place + "|" + cls;
export function mascotHtml(action = "idle", place = "card", cls = "", style = "") {
  const a = ACT[action] ? action : "idle", key = slotKey(a, place, cls), old = SLOTS.get(key);
  return `<div class="fm fm-${typeof place === "number" ? "n" : place} ${cls}" data-fm="${a}" data-fmk="${key}" style="--fms:${px(place)}px;${style}" role="img" aria-label="StudyOS flame">${old ? old.svg : ""}</div>`;
}

const LIVE = new Set();
let raf = 0, last = 0;
// forget slots that have been off the page for a while
setInterval(() => { const n = performance.now(); for (const [k, m] of SLOTS) if (!m.el.isConnected && n - (m.seen || 0) > 4000) SLOTS.delete(k); }, 5000);
const reduced = () => !!(G.matchMedia && G.matchMedia("(prefers-reduced-motion: reduce)").matches);
const io = typeof IntersectionObserver !== "undefined"
  ? new IntersectionObserver((es) => es.forEach((e) => { const m = e.target._fm; if (m) m.vis = e.isIntersecting; if (e.isIntersecting) kick(); }), { rootMargin: "80px" })
  : null;

function draw(m) { const s = m.sim.svg().replace(/viewBox="[^"]*"/, VB); m.svg = s; m.el.innerHTML = s; }
function mount(el) {
  if (el._fm) return el._fm;
  syncPalette();
  const key = el.getAttribute("data-fmk");
  const prev = key && SLOTS.get(key);
  if (prev && prev.el !== el && performance.now() - (prev.seen || 0) < 4000) {
    // same mascot after a redraw: move it to the new element and keep animating from where it was
    if (io && prev.el) io.unobserve(prev.el);
    clearTimeout(prev.gone);
    prev.el = el; el._fm = prev; prev.vis = true; prev.seen = performance.now();
    LIVE.add(prev); el.innerHTML = prev.svg || ""; if (io) io.observe(el); kick();
    return prev;
  }
  const h = el.getBoundingClientRect().height || parseFloat(getComputedStyle(el).getPropertyValue("--fms")) || 100;
  const small = h < 80;
  const base = el.getAttribute("data-fm") || "idle";
  const sim = RIG.Sim(ACT, ACT[base] ? base : "idle");
  sim.opts({ noEmb: small });
  for (let i = 0; i < 24; i++) sim.step(1 / 60); // settle into the pose before the first paint
  const m = { el, sim, base, small, vis: true, acc: 0, t: 0, key, seen: performance.now() };
  el._fm = m; LIVE.add(m); draw(m);
  if (key) SLOTS.set(key, m);
  if (io) io.observe(el);
  kick();
  return m;
}
function kick() { if (!raf && !reduced()) { last = 0; raf = requestAnimationFrame(loop); } }
function loop(now) {
  raf = 0;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60; last = now;
  if (typeof document !== "undefined" && document.hidden) { raf = requestAnimationFrame(loop); return; }
  let any = false;
  for (const m of LIVE) {
    if (!m.el.isConnected) { LIVE.delete(m); if (io) io.unobserve(m.el); continue; }
    m.seen = now;
    if (!m.vis) continue;
    any = true; m.acc += dt;
    if (m.small && m.acc < 1 / 30) continue;
    let r = m.acc; m.acc = 0;
    while (r > 0) { const s = Math.min(r, 1 / 60); m.sim.step(s); r -= s; }
    draw(m);
  }
  if (any || LIVE.size) raf = requestAnimationFrame(loop);
}

// length of one pass through an action, in ms
export function actionMs(a) { const k = (ACT[a] && ACT[a].k) || []; return k.reduce((s, x) => s + (x.d || 0), 0); }
// play an action; with ms (or for one-shot use) it returns to the element's base action afterwards
export function playMascot(el, action, ms) {
  if (!el || !ACT[action]) return;
  const m = el._fm || mount(el);
  clearTimeout(m.back);
  m.sim.play(action);
  if (ms !== 0 && action !== m.base) m.back = setTimeout(() => { if (m.el.isConnected) m.sim.play(m.base); }, ms || actionMs(action));
  if (reduced()) { for (let i = 0; i < 40; i++) m.sim.step(1 / 60); draw(m); }
}
export function setMascotBase(el, action) { const m = el && (el._fm || mount(el)); if (m && ACT[action]) { m.base = action; m.sim.play(action); } }
export function talkMascot(el, on) { const m = el && (el._fm || mount(el)); if (m) m.sim.talk(on); }
export function mountMascots(root) { if (root && root.querySelectorAll) root.querySelectorAll("[data-fm]").forEach(mount); }

// mount every mascot that appears anywhere in the page, in both the app and the new-user flow
if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
  const scan = (n) => { if (n.nodeType !== 1) return; if (n.hasAttribute("data-fm")) mount(n); else if (n.querySelector && n.querySelector("[data-fm]")) mountMascots(n); };
  const start = () => {
    new MutationObserver((rs) => rs.forEach((r) => r.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(() => { syncPalette(); for (const m of LIVE) draw(m); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
    mountMascots(document.body);
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
}
