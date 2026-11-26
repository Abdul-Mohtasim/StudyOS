/* eslint-disable */
/* StudyOS flame mascot: rendering helpers.

   SvgPatcher   keeps the mascot's SVG elements alive. The rig produces a new SVG string every frame, but the
                structure of that string almost never changes, only numbers inside attributes (path shapes,
                transforms, eye positions). The patcher compares the new string with the last one token by
                token and writes only the attributes that changed, on the elements that are already in the
                page. It never recreates elements unless the structure itself changes (a new expression, a
                prop appears), and then it rebuilds once and carries on patching.
   Governor     adaptive frame rate: picks a starting rate from the device (memory, cores, screen) and then
                adjusts it from the measured cost of drawing, so small or busy phones step down to 45, 30 or
                20 fps and recover when there is headroom.
   PoseCache    renders a pose once and keeps the SVG string, so a static pose (reduced motion, exports,
                first paint) never needs the simulation again. */

const TOK = /<[^>]+>|[^<]+/g;
const ATT = /([\w:.-]+)="([^"]*)"/g;
const dec = (s) => (s.indexOf("&") < 0 ? s : s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
const isTag = (t) => t.charCodeAt(0) === 60;
const isClose = (t) => t.charCodeAt(1) === 47;
const isEl = (t) => isTag(t) && t.charCodeAt(1) !== 47 && t.charCodeAt(1) !== 33 && t.charCodeAt(1) !== 63;
function nameOf(t) { let i = 1; while (i < t.length) { const c = t.charCodeAt(i); if (c === 32 || c === 62 || c === 47 || c === 10 || c === 9) break; i++; } return t.slice(1, i); }
function attrsOf(t) { const o = {}; ATT.lastIndex = 0; let m; while ((m = ATT.exec(t))) o[m[1]] = m[2]; return o; }

/* Embers come and go, so their circles sit at the very end of the SVG and are kept in a small pool: the same
   <circle> elements are reused and hidden when there are fewer embers, never created or removed per frame. */
const EMB = /((?:<circle [^>]*\/>)*)<\/svg>\s*$/, CIRC = /<circle [^>]*\/>/g, EMB_G = '<g class="fp-emb"></g>', NONE = [];
const NS = "http://www.w3.org/2000/svg";
export class SvgPatcher {
  constructor(host) { this.host = host; this.tok = null; this.map = null; this.g = null; this.pool = []; this.ptok = []; this.stats = { frames: 0, patched: 0, rebuilds: 0, attrWrites: 0 }; }
  /* returns the number of attribute writes (-1 when the structure changed and the SVG was rebuilt) */
  update(str) {
    const st = this.stats; st.frames++;
    const em = EMB.exec(str); let main, emb = NONE;
    if (em) { main = str.slice(0, em.index) + EMB_G + "</svg>"; if (em[1]) emb = em[1].match(CIRC) || NONE; }
    else main = str;
    const tok = main.match(TOK) || [], prev = this.tok;
    let w = -1;
    if (prev && this.map && prev.length === tok.length) {
      let ok = true; const ch = [];
      for (let i = 0; i < tok.length; i++) {
        const a = tok[i], b = prev[i];
        if (a === b) continue;
        if (!isEl(a) || !isEl(b) || nameOf(a) !== nameOf(b)) { ok = false; break; }
        ch.push(i);
      }
      if (ok) { w = 0; for (const i of ch) w += this._attrs(this.map[i], tok[i], prev[i]); this.tok = tok; st.patched++; }
    }
    if (w < 0) { this._rebuild(main, tok); st.rebuilds++; }
    const ew = this._emb(emb); st.attrWrites += (w < 0 ? 0 : w) + ew;
    return w < 0 ? -1 : w + ew;
  }
  _attrs(el, nt, ot) {
    const na = attrsOf(nt), oa = ot ? attrsOf(ot) : {}; let w = 0;
    for (const k in na) if (oa[k] !== na[k]) { el.setAttribute(k, dec(na[k])); w++; }
    for (const k in oa) if (!(k in na)) { el.removeAttribute(k); w++; }
    return w;
  }
  _emb(list) {
    const g = this.g; if (!g) return 0;
    const n = list.length, pool = this.pool, pt = this.ptok; let w = 0;
    for (let i = 0; i < n; i++) {
      let el = pool[i];
      if (!el) { el = (this.host.ownerDocument || document).createElementNS(NS, "circle"); g.appendChild(el); pool[i] = el; pt[i] = null; }
      const t = list[i];
      if (pt[i] !== t) { if (pt[i] === null) el.removeAttribute("display"); w += this._attrs(el, t, pt[i]); pt[i] = t; }
    }
    for (let i = n; i < pool.length; i++) if (pt[i] !== null) { pool[i].setAttribute("display", "none"); pt[i] = null; w++; }
    return w;
  }
  _rebuild(str, tok) {
    this.host.innerHTML = str;
    const els = this.host.querySelectorAll("*"), map = []; let n = 0, good = true;
    for (let i = 0; i < tok.length; i++) if (isEl(tok[i])) { map[i] = els[n++]; if (!map[i]) { good = false; break; } }
    if (n !== els.length) good = false;
    this.map = good ? map : null; this.tok = tok;
    this.g = this.host.querySelector(".fp-emb"); this.pool = []; this.ptok = [];
  }
  reset() { this.tok = null; this.map = null; this.g = null; this.pool = []; this.ptok = []; }
}

/* ---------- adaptive frame rate ----------
   Screens refresh at fixed steps (60 Hz = every 16.7 ms), so a rate that is not a whole fraction of it (45 fps on a 60 Hz screen) comes out
   as an uneven 30/60 mix. The steps are therefore 60, 30 and 20 fps: every step is "draw every 1st, 2nd or 3rd screen refresh" (on a
   120 Hz screen the same steps are every 2nd, 4th or 6th), which keeps the motion evenly paced. */
export const TIERS = [60, 30, 20];
export function startTier(env) {
  const mem = env.mem || 4, cores = env.cores || 4, w = env.w || 400;
  const score = (mem <= 2 ? 2 : mem <= 4 ? 1 : 0) + (cores <= 4 ? 1 : 0) + (w <= 360 ? 1 : 0);
  return score >= 3 ? 1 : 0;   // clearly low-end (little memory, few cores, small screen): start at 30 fps. Everything else starts at 60 and steps down only if drawing is slow.
}
export class Governor {
  constructor(env) {
    const n = typeof navigator !== "undefined" ? navigator : {}, s = typeof screen !== "undefined" ? screen : {};
    this.env = env || { mem: n.deviceMemory, cores: n.hardwareConcurrency, w: Math.min(s.width || 400, s.height || 800) };
    this.floor = startTier(this.env); this.tier = this.floor; this.ema = 0; this.calm = 0; this.cool = 0; this.n = 0;
  }
  get fps() { return TIERS[this.tier]; }
  /* ms: time spent simulating and drawing all mascots in the last frame */
  sample(ms) {
    this.n++; this.ema += (ms - this.ema) * .12;
    if (this.cool > 0) { this.cool--; return; }
    const budget = 1000 / this.fps;
    if (this.ema > budget * .45 && this.tier < TIERS.length - 1) { this.tier++; this.cool = 90; this.calm = 0; }          // drawing eats almost half the frame: step down
    else if (this.ema < budget * .12 && this.tier > this.floor) { if (++this.calm > 300) { this.tier--; this.calm = 0; this.cool = 90; } }   // plenty of headroom for 5 s: step up
    else this.calm = 0;
  }
}

/* ---------- cached poses ---------- */
export class PoseCache {
  constructor() { this.m = new Map(); this.hits = 0; this.misses = 0; }
  get(key, build) { if (this.m.has(key)) { this.hits++; return this.m.get(key); } this.misses++; const v = build(); this.m.set(key, v); return v; }
}
