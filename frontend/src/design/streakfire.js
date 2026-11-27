/* eslint-disable */
/* StudyOS streak fire v133: vector flame that BENDS (never rotates), slow-motion jump, crescents / smoke / sparks.

   The flame is NOT a picture: every frame is a set of 9 vector colour layers traced from the design sheets (firedata.js).
   Each frame's outline is moved point by point (a lean from -1 left to +1 right, the tip flickers) and every corner is rounded,
   so the flame curls like the 12-frame sheet while its width and colours stay the same. Soft volume shading is clipped to it.

   Phases (the caller starts them, this module draws them):
     grey()          yesterday: grey flame, still
     ignite()        grey floods to fire colour, sparks, the flame wakes up
     jump(opts)      take-off, a curved jump in SLOW MOTION (the air time is stretched, slowest at the top), the flame leans and
                     tilts left, centre, right and back, lands where it started, squashes, dims, springs back and burns.
                     opts: { onApex, onLand }. The landing is at pose time T.land, the effects (streakfx.js) follow the same clock.
     burn()          keeps burning: calm sway, small fire tongues, sparks and embers rise with natural variation.
     wisp(x,y)       small fire wisps for the week row.
   Smoke sits on its own canvas BEHIND the flame, crescents / sparks on the canvas in front. Reduced motion draws one still frame. */
import { FIRE } from './firedata.js';
import { T, warp, poseAt, leanFor, setRise } from './streakpose.js';
import { GX, GROUND, drawSmokeOnly, drawFragsOnly, setFxLite } from './streakfx.js';

const [VX, VY, VW, VH] = FIRE.vb, BASE = FIRE.base, CXV = FIRE.cx;
const A = FIRE.A, S = FIRE.S;
const GREYS = ['283640', '34434e', '3f4f5b', '4b5c68', '576975', '657884', '798c98', '95a6b1', 'b9c5cd'];
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const E = { out: (k) => 1 - Math.pow(1 - k, 3) };
const smt = (k) => k * k * (3 - 2 * k);
const pick = (list) => list.map((n) => A[n - 1]);
const SEQ = {
  ignite: { f: pick([5, 6, 7, 8, 9, 10, 11, 12]), fps: 22 },
  fly: { f: S, fps: 20, loop: true },
  land: { f: A, fps: 24 },
  idle: { f: pick([18, 19, 20, 21, 22, 23, 24, 23, 22, 21, 20, 19]), fps: 11, loop: true },
  lick: { f: pick([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]), fps: 18 }
};
const FX_END = 9.2;                                    // pose time (s) when the last crescent / puff has gone

/* ---- the bend: the flame's own outline is moved, point by point, corners rounded ---- */
const AMP = 50, LG = [1, .99, .97, .94, .91, .88, .85, .82, .8], HT = BASE - 48;
const PARSED = [new WeakMap(), new WeakMap()];
function ringsOf(fr, lite) {
  const cache = PARSED[lite ? 1 : 0]; let p = cache.get(fr); if (p) return p;
  const thr = lite ? 16 : 6.5;                         // thin the outline: points this close add nothing once corners are rounded
  p = fr.d.map((d) => {
    if (!d) return null; const out = [], re = /M(-?\d+) ?(-?\d+)l([^z]*)z/g; let m;
    while ((m = re.exec(d))) { const nums = m[3].match(/-?\d+/g) || []; let x = +m[1], y = +m[2]; const pts = [x, y]; let lx = x, ly = y; for (let i = 0; i + 1 < nums.length; i += 2) { x += +nums[i]; y += +nums[i + 1]; const dx = x - lx, dy = y - ly; if (dx * dx + dy * dy >= thr) { pts.push(x, y); lx = x; ly = y; } } if (pts.length >= 8) out.push(pts); }
    return out;
  });
  cache.set(fr, p); return p;
}
const TX = new Float32Array(6000), TY = new Float32Array(6000), f1 = (v) => Math.round(v * 10) / 10;
function bentPath(rs, lean, tm, gain, flk) {
  let s = '';
  const fa = (Math.sin(tm * 8.3) + .6 * Math.sin(tm * 13.7 + 1.3)) * .5 * flk, fb = Math.sin(tm * 10.9 + .7) * flk, fc = Math.sin(tm * 6.1 + 2.1) * flk;
  for (const r of rs) {
    const n = r.length / 2; if (n > 3000) continue;
    for (let i = 0; i < n; i++) {
      const x = r[2 * i], y = r[2 * i + 1]; let h = (BASE - y) / HT; h = h < 0 ? 0 : h > 1.1 ? 1.1 : h;
      const g = h * h * (.7 + .3 * h), h3 = h * h * h;
      TX[i] = x + lean * AMP * gain * g + 6.5 * h3 * fa + 2.5 * h3 * h * fc * (x < CXV ? -1 : 1) * .4;
      TY[i] = y - 3.2 * h3 * h * fb;
    }
    s += 'M' + f1((TX[n - 1] + TX[0]) / 2) + ' ' + f1((TY[n - 1] + TY[0]) / 2);
    for (let i = 0; i < n; i++) { const j = i + 1 === n ? 0 : i + 1; s += 'Q' + f1(TX[i]) + ' ' + f1(TY[i]) + ' ' + f1((TX[i] + TX[j]) / 2) + ' ' + f1((TY[i] + TY[j]) / 2); }
    s += 'Z';
  }
  return s;
}
const SHADE = (u) => `<clipPath id="${u}cp"><path class="cpp" fill-rule="evenodd"/></clipPath>
<radialGradient id="${u}c" gradientUnits="userSpaceOnUse" cx="${CXV}" cy="${BASE - 62}" r="96"><stop offset="0" stop-color="#fffbe8" stop-opacity=".92"/><stop offset=".38" stop-color="#ffe08a" stop-opacity=".42"/><stop offset="1" stop-color="#ffc55a" stop-opacity="0"/></radialGradient>
<radialGradient id="${u}r" gradientUnits="userSpaceOnUse" cx="${CXV}" cy="${BASE - 135}" r="190"><stop offset="0" stop-color="#7a0008" stop-opacity="0"/><stop offset=".6" stop-color="#7a0008" stop-opacity="0"/><stop offset="1" stop-color="#7a0008" stop-opacity=".5"/></radialGradient>`;
const shadeG = (u) => `<g class="vo" clip-path="url(#${u}cp)"><rect x="${VX - 40}" y="${VY - 20}" width="${VW + 80}" height="${VH + 40}" fill="url(#${u}r)"/><rect x="${VX - 40}" y="${VY - 20}" width="${VW + 80}" height="${VH + 40}" fill="url(#${u}c)"/></g>`;

/* pre-rendered soft sprites: drawn many times, created once */
function glowSprite(size, stops) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, size, size); return c;
}
/* a fire tongue: pointed tip on top, round belly, a bright core */
function tongueSprite(c0, c1, c2) {
  const w = 32, h = 64, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, c0); g.addColorStop(.5, c1); g.addColorStop(1, c2); x.fillStyle = g;
  x.beginPath(); x.moveTo(16, 1); x.bezierCurveTo(18, 16, 31, 30, 29, 46); x.bezierCurveTo(28, 58, 21, 63, 16, 63); x.bezierCurveTo(11, 63, 4, 58, 3, 46); x.bezierCurveTo(1, 30, 14, 16, 16, 1); x.closePath(); x.fill();
  const g2 = x.createLinearGradient(0, 24, 0, h); g2.addColorStop(0, 'rgba(255,244,190,0)'); g2.addColorStop(1, 'rgba(255,244,190,.9)'); x.fillStyle = g2;
  x.beginPath(); x.ellipse(16, 47, 6.5, 12, 0, 0, 6.2832); x.fill(); return c;
}
let SP = null;
function sprites() {
  if (SP) return SP;
  SP = {
    spark: [glowSprite(32, [[0, 'rgba(255,248,210,1)'], [.3, 'rgba(255,196,70,.85)'], [1, 'rgba(255,120,30,0)']]), glowSprite(32, [[0, 'rgba(255,230,160,1)'], [.35, 'rgba(255,110,40,.8)'], [1, 'rgba(255,60,30,0)']])],
    ember: glowSprite(32, [[0, 'rgba(255,220,130,1)'], [.4, 'rgba(255,130,40,.8)'], [1, 'rgba(255,70,30,0)']]),
    tongue: [tongueSprite('#ffd36b', '#ff8a1f', '#e8301c'), tongueSprite('#ff9a3a', '#f0481f', '#b8141a')]
  };
  return SP;
}

let UID = 0;
export function createStreakFire({ host, root, reduce = false, shadow = null }) {
  const id = 'sf' + (++UID), cv = document.createElement('canvas'), cvs = document.createElement('canvas');
  host.classList.add('sf-host');
  if (!host.clientWidth || !host.clientHeight) { host.style.width = Math.round(VW * .5) + 'px'; host.style.height = Math.round(VH * .5) + 'px'; }
  host.style.transformOrigin = '0 0';
  const layerPaths = (cls) => Array.from({ length: 9 }, () => `<path class="${cls}" fill-rule="evenodd" stroke-linejoin="round" stroke-width="1.5"/>`).join('');
  host.innerHTML = `<svg class="sf-svg" viewBox="${VX} ${VY} ${VW} ${VH}" aria-hidden="true" focusable="false"><defs>${SHADE(id)}</defs>
<g class="sf-grey">${layerPaths('sg')}</g><g class="sf-fire" opacity="0"><g class="sf-fa">${layerPaths('sp')}</g><g class="sf-fb">${layerPaths('sq')}</g>${shadeG(id)}</g>
</svg>`;
  const $ = (s) => host.querySelector(s);
  const svg = $('.sf-svg'), gFire = $('.sf-fire'), gGrey = $('.sf-grey'), gA = $('.sf-fa'), gB = $('.sf-fb'), cpp = $('.cpp'), vo = $('.vo');
  const sets = [{ g: gA, p: [...host.querySelectorAll('.sp')], fr: null, c: [] }, { g: gB, p: [...host.querySelectorAll('.sq')], fr: null, c: [] }];
  const pg = [...host.querySelectorAll('.sg')];
  svg.style.overflow = 'visible';
  const gf = A[23], grs = ringsOf(gf, false); pg.forEach((p, i) => { const r = grs[i]; if (r && r.length) p.setAttribute('d', bentPath(r, 0, 0, 1, 0)); p.setAttribute('fill', '#' + GREYS[i]); p.setAttribute('stroke', '#' + GREYS[i]); });

  /* ---------- frame player with cross-fade between neighbouring frames ---------- */
  const opCache = new Map();
  const setOp = (el, v) => { const s = (+v).toFixed(3); if (opCache.get(el) !== s) { opCache.set(el, s); el.setAttribute('opacity', s); } };
  function setFill(set, fr) { set.fr = fr; for (let i = 0; i < 9; i++) { const c = fr.c[i]; if (c !== set.c[i]) { set.c[i] = c; set.p[i].setAttribute('fill', '#' + c); set.p[i].setAttribute('stroke', '#' + c); } } }
  let pa = 0, curIdx = -1, curSeq = null, lite = false, paintN = 0;
  function showSeq(q, pos) {
    const n = q.f.length; let i = Math.floor(pos), f = pos - i;
    if (q.loop) i = ((i % n) + n) % n; else if (i >= n - 1) { i = n - 1; f = 0; } else if (i < 0) { i = 0; f = 0; }
    const nx = q.loop ? (i + 1) % n : Math.min(n - 1, i + 1);
    if (curSeq !== q || curIdx !== i) {
      const sequential = curSeq === q && (q.loop ? i === (curIdx + 1) % n : i === curIdx + 1);
      if (sequential) { pa ^= 1; setFill(sets[pa ^ 1], q.f[nx]); } else { pa = 0; setFill(sets[0], q.f[i]); setFill(sets[1], q.f[nx]); }
      curSeq = q; curIdx = i;
    }
    setOp(sets[pa].g, Math.min(1, 2 * (1 - f))); setOp(sets[pa ^ 1].g, Math.min(1, 2 * f));
  }
  function setFrame(fr) { setFill(sets[0], fr); setFill(sets[1], fr); pa = 0; curSeq = null; curIdx = -1; setOp(sets[0].g, 1); setOp(sets[1].g, 0); }
  setFrame(A[23]);
  /* draw the bent outlines of both layer sets, then clip the shading to the flame's own outline */
  function paint(lean, tm) {
    for (const set of sets) { if (!set.fr) continue; const rs = ringsOf(set.fr, lite); for (let i = 0; i < 9; i++) { const r = rs[i]; set.p[i].setAttribute('d', r && r.length ? bentPath(r, lean, tm, LG[i], 1) : ''); } }
    cpp.setAttribute('d', sets[pa].p[0].getAttribute('d') || '');
    vo.setAttribute('transform', `translate(${(lean * AMP * .1).toFixed(2)} 0)`);
  }

  /* ---------- canvas layers: smoke behind the flame, particles and crescents in front (screen sized, pre-rendered sprites, capped) ---------- */
  cv.className = 'sf-cv'; cv.setAttribute('aria-hidden', 'true'); cvs.className = 'sf-cs'; cvs.setAttribute('aria-hidden', 'true');
  let ctx = null, ctxS = null, W = 0, H = 0, dpr = 1;
  if (!reduce) { root.appendChild(cvs); root.appendChild(cv); ctx = cv.getContext('2d'); ctxS = cvs.getContext('2d'); }
  let G = { k: 1, u: 1, x: 0, baseY: 0, topY: 0, cy: 0, hw: 140, hh: 215 };
  /* where the flame stands on the screen: measured only while it has no transform, then kept (no layout reads per frame) */
  function refreshGeo() {
    if (host.style.transform) return;
    const hr = host.getBoundingClientRect(), rr = root.getBoundingClientRect(), hw = host.clientWidth || hr.width, hh = host.clientHeight || hr.height;
    G = { k: hw / VW, u: hw / 140, x: hr.left - rr.left + hr.width / 2, baseY: hr.top - rr.top + hr.height * ((BASE - VY) / VH), topY: hr.top - rr.top + hr.height * .18, cy: hr.top - rr.top + hr.height / 2, hw, hh };
  }
  const size = () => {
    if (!ctx) { refreshGeo(); return; } dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 2); W = root.clientWidth; H = root.clientHeight;
    for (const c of [cv, cvs]) { c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr)); c.style.width = W + 'px'; c.style.height = H + 'px'; } refreshGeo();
  };
  size();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null; if (ro && ctx) ro.observe(root);

  const P = [], MAXP = 160;
  const add = (p) => { if (P.length < MAXP) P.push(p); };
  function spark(x, y, vx, vy, o = {}) { add({ t: 'spark', x, y, vx, vy, g: o.g || 0, drag: o.drag == null ? 1.2 : o.drag, life: 0, max: o.max || rnd(.45, .95), s: o.s || rnd(2.4, 4.6), sp: (Math.random() * 2) | 0, len: o.len == null ? .012 : o.len }); }
  function ember(x, y) { add({ t: 'ember', x, y, vx: rnd(-14, 14), vy: -rnd(30, 70), g: 0, drag: .5, life: 0, max: rnd(.9, 1.7), s: rnd(2.2, 4.2), w: rnd(0, 6.28), ws: rnd(4, 8) }); }
  /* a small tongue of fire: its tip points where it is going; it shrinks and fades as it burns out */
  function tongue(x, y, vx, vy, o = {}) { add({ t: 'tongue', x, y, vx, vy, g: o.g || 0, drag: o.drag == null ? .8 : o.drag, life: 0, max: o.max || rnd(.5, .9), s: o.s || rnd(12, 26), sp: o.sp == null ? ((Math.random() * 2) | 0) : o.sp, w: rnd(0, 6.28) }); }

  /* ---------- state ---------- */
  let mode = 'grey', seq = null, sT = 0, sDone = null, dead = false, raf = 0, last = 0, now = 0, curName = '';
  let glowT = 0, fireOp = 0, fireTo = 0, greyOp = 1, greyTo = 1, nextLick = 0, burnAcc = 0, tongAcc = 0, emberAcc = 0, trailAcc = 0, expAcc = 0, dimAcc = 0, slow = 0, nFr = 0, burnT0 = -99, lastFilter = '';
  let ST = null, offX = 0, offY = 0;                       // ST = the story of one jump (pose time, callbacks); offX/offY = where the flame's middle is, relative to rest
  function play(name, onDone) { const q = SEQ[name]; curName = name; seq = q; sT = 0; sDone = onDone || null; showSeq(q, 0); }

  /* the flame's transform: scale about its feet (squash and stretch), then a tilt about its feet, then the move */
  function applyT(x, y, tilt, sx, sy) {
    const cx = G.hw / 2, fy = G.hh * .97;
    host.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(${cx}px,${fy}px) scale(${sx.toFixed(3)},${sy.toFixed(3)}) rotate(${tilt.toFixed(2)}deg) translate(${-cx}px,${-fy}px)`;
  }
  function clearT() { host.style.transform = ''; host.style.opacity = ''; host.style.filter = ''; lastFilter = ''; if (shadow) shadow.style.transform = 'translateX(-50%)'; }
  /* the tight halo that follows the flame's own outline (no big circle); brightness drops while it is nearly out */
  function halo(gk, br) {
    const f = [];
    if (br < .995) f.push(`brightness(${br.toFixed(2)})`);
    if (gk > .02) { f.push(`drop-shadow(0 0 ${(2.5 + 1.5 * gk).toFixed(1)}px rgba(255,170,70,${(.6 * gk).toFixed(2)}))`); if (!lite) f.push(`drop-shadow(0 0 ${(8 + 5 * gk).toFixed(1)}px rgba(255,90,35,${(.24 * gk).toFixed(2)}))`); }
    const s = f.join(' '); if (s !== lastFilter) { lastFilter = s; host.style.filter = s; }
  }
  const shadowAt = (rise, x, sx) => { if (shadow) shadow.style.transform = `translateX(-50%) translateX(${x.toFixed(1)}px) scale(${((1 - .45 * clamp(rise, 0, 1)) * (sx > 1 ? Math.min(1.3, sx) : 1)).toFixed(3)})`; };
  const burnLean = () => (.15 * Math.sin(now * 1.6) + .08 * Math.sin(now * 2.7 + 1)) * smt(clamp((now - burnT0) / .8, 0, 1));
  let curLean = 0;

  /* one frame of the story: pose time from the slowed clock, pose from poseAt(), frames, tilt, halo, callbacks */
  function storyStep(tms) {
    if (ST.t0 == null) ST.t0 = tms;
    const jt = Math.max(0, (tms - ST.t0) / 1000), tp = warp(T.launch + jt), Pz = poseAt(tp), u = G.u; ST.tp = tp;
    if (tp > FX_END) { ST = null; return; }
    const lean = leanFor(Pz, now); curLean = lean;
    if (Pz.phase === 'burn') {
      if (!ST.burned) { ST.burned = true; mode = 'burn'; burnT0 = -99; nextLick = now + rnd(1.6, 2.8); play('idle'); clearT(); }
      offX = lean * 13 * u; offY = 0; halo(fireOp * (.92 + .05 * Math.sin(now * 7) + .03 * Math.sin(now * 13.3)), 1);
    } else {
      showSeq(SEQ[Pz.seq] || SEQ.fly, Pz.pos);
      const x = Pz.x * u, y = Pz.y * u + ST.y0 * (1 - E.out(Math.min(1, jt / .16))), tilt = Pz.air ? lean * 17 : 0;
      applyT(x, y, tilt, Pz.sx, Pz.sy); host.style.opacity = jt < .1 ? clamp(jt / .1, 0, 1).toFixed(2) : '';
      halo(clamp(Pz.glow, 0, 1.1) * fireOp * (.92 + .05 * Math.sin(now * 7) + .03 * Math.sin(now * 13.3)), Pz.b);
      shadowAt(clamp(-Pz.y / 170, 0, 1), x, Pz.sx);
      offX = x + lean * 13 * u; offY = y + (G.baseY - .42 * G.hh) - G.cy;
    }
    ST.P = Pz;
    if (!ST.apexed && tp >= T.apex) { ST.apexed = true; if (ST.onApex) ST.onApex(); }
    if (!ST.landed && tp >= T.land) { ST.landed = true; mode = ST.burned ? 'burn' : 'land'; fireTo = 1; greyTo = 0; const cb = ST.onLand; if (cb) cb(); }
  }

  function step(dt, tms) {
    const hadStory = !!ST;
    if (ST) { if (!ST.burned) seq = null; storyStep(tms); }
    // frame player
    if (seq) {
      sT += dt; const n = seq.f.length, pos = sT * seq.fps;
      if (seq.loop) showSeq(seq, pos);
      else if (pos >= n) { const cb = sDone; showSeq(seq, n - 1); seq = null; sDone = null; if (cb) cb(); }
      else showSeq(seq, pos);
    }
    // cross-fade grey -> fire
    const fk = Math.min(1, dt * 10); fireOp += (fireTo - fireOp) * fk; greyOp += (greyTo - greyOp) * fk;
    setOp(gFire, fireOp); setOp(gGrey, greyOp);
    // the bent outline (every other frame on a slow device)
    if (fireOp > .01 && (!lite || (++paintN & 1))) {
      let lean = 0; if (ST) lean = curLean; else if (mode === 'burn') lean = burnLean();
      paint(lean, now);
    }
    if (!ST && hadStory) { clearT(); offX = 0; offY = 0; }
    if (!ST && !hadStory && mode !== 'grey') halo(fireOp * (.92 + .05 * Math.sin(now * 7) + .03 * Math.sin(now * 13.3)), 1);
    if (!ctx) return;
    const q = lite ? .5 : 1, u = G.u, cx = G.x + offX, wind = Math.sin(now * 1.3) * 18;
    const ccy = G.cy + offY;
    // emitters
    if (ST && ST.P && !ST.burned) {
      const Pz = ST.P;
      if (Pz.air) {
        const rate = (warp(T.launch + (tms - ST.t0) / 1000 + .01) - warp(T.launch + (tms - ST.t0) / 1000)) / .01, vx = Pz.vx * u * rate, vy = Pz.vy * u * rate;
        trailAcc += dt * 62 * q;
        while (trailAcc >= 1) {
          trailAcc--;
          const ang = rnd(0, 6.28), R = rnd(8, 46) * G.k;
          if (Math.random() < .5) tongue(cx + Math.cos(ang) * R, ccy + Math.sin(ang) * R, -vx * rnd(.1, .3) + rnd(-50, 50), -vy * rnd(.1, .3) + rnd(-50, 50), { max: rnd(.35, .7), s: rnd(15, 32), drag: 1.3 });
          else spark(cx + Math.cos(ang) * R, ccy + Math.sin(ang) * R, -vx * .25 + Math.cos(ang + 1.57) * rnd(60, 140), -vy * .25 + Math.sin(ang + 1.57) * rnd(60, 140), { max: rnd(.3, .65), s: rnd(2.2, 4.2), drag: 1.8 });
        }
      } else if (Pz.phase === 'dim') {
        dimAcc += dt * 3; while (dimAcc >= 1) { dimAcc--; ember(G.x + rnd(-30, 30) * u, G.baseY - rnd(5, 30) * u); }
      } else if (Pz.phase === 'expand') {
        expAcc += dt * 20 * q; while (expAcc >= 1) { expAcc--; spark(G.x + rnd(-30, 30) * u, G.baseY - rnd(10, 70) * u, rnd(-40, 40), -rnd(100, 220), { max: rnd(.3, .6), s: rnd(2, 3), drag: 1.8 }); }
      }
    }
    if (mode === 'burn') {
      burnAcc += dt * 16 * q; while (burnAcc >= 1) { burnAcc--; spark(G.x + offX + rnd(-34, 34) * G.k * 1.1, G.topY + rnd(0, 40) * G.k, rnd(-46, 46) + wind, -rnd(190, 440), { max: rnd(.4, .9), drag: rnd(1.3, 2) }); }
      tongAcc += dt * 5.5 * q; while (tongAcc >= 1) { tongAcc--; tongue(G.x + rnd(-32, 32) * G.k, G.topY + rnd(0, 50) * G.k, rnd(-34, 34) + wind, -rnd(70, 170), { max: rnd(.5, 1.05), s: rnd(8, 22), drag: rnd(.5, .9) }); }
      emberAcc += dt * 3.5 * q; while (emberAcc >= 1) { emberAcc--; ember(G.x + rnd(-40, 40) * G.k, G.topY + rnd(0, 60) * G.k); }
      if (now > nextLick && curName === 'idle') { nextLick = now + rnd(2.2, 4.2); play('lick', () => { play('idle'); }); for (let i = 0; i < 5 * q; i++) tongue(G.x + rnd(-22, 22) * G.k, G.topY, rnd(-60, 60), -rnd(220, 380), { max: rnd(.5, .9), s: rnd(14, 28) }); for (let i = 0; i < 6 * q; i++) spark(G.x + rnd(-22, 22) * G.k, G.topY, rnd(-90, 90), -rnd(260, 480), { max: rnd(.5, .9) }); }
    }
    // particles
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.life += dt; if (p.life >= p.max) { P.splice(i, 1); continue; }
      const dg = Math.max(0, 1 - p.drag * dt); p.vx *= dg; p.vy = p.vy * dg + p.g * dt;
      if (p.t === 'ember') p.w += p.ws * dt; else if (p.t === 'tongue') p.w += 5 * dt;
      p.x += p.vx * dt + (p.t === 'ember' ? Math.sin(p.w) * .35 : p.t === 'tongue' ? Math.sin(p.w) * .25 : 0); p.y += p.vy * dt;
    }
  }

  /* design units (140 x 215 flame, feet at GX, GROUND) -> screen, so the effects keep their size on every phone */
  function toDesign(c) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.translate(G.x, G.baseY); c.scale(G.u, G.u); c.translate(-GX, -GROUND); }
  function draw() {
    if (!ctx) return; const sp = sprites();
    ctxS.setTransform(dpr, 0, 0, dpr, 0, 0); ctxS.clearRect(0, 0, W, H);
    if (ST && ST.tp != null) { ctxS.save(); toDesign(ctxS); drawSmokeOnly(ctxS, ST.tp, now); ctxS.restore(); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    for (const p of P) {
      if (p.t !== 'tongue') continue;
      const k = p.life / p.max, a = clamp((1 - k) * 1.6, 0, 1) * Math.min(1, p.life * 14), h = p.s * (1 - .6 * k), w = h * .5, v = Math.hypot(p.vx, p.vy);
      ctx.globalAlpha = a; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(v > 12 ? Math.atan2(p.vy, p.vx) + Math.PI / 2 : Math.sin(p.w) * .3); ctx.drawImage(sp.tongue[p.sp], -w / 2, -h / 2, w, h); ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const p of P) {
      if (p.t === 'tongue') continue;
      const k = p.life / p.max, a = p.t === 'ember' ? Math.sin(k * Math.PI) : (1 - k * k);
      ctx.globalAlpha = clamp(a, 0, 1);
      if (p.t === 'ember') { const s = p.s * 3.4; ctx.drawImage(sp.ember, p.x - s / 2, p.y - s / 2, s, s); continue; }
      const v = Math.hypot(p.vx, p.vy), s = p.s * 3.6, Ls = 1 + clamp(v * p.len, 0, 2.4);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2); ctx.drawImage(sp.spark[p.sp], -s / 2, -s * Ls / 2, s, s * Ls); ctx.restore();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (ST && ST.tp != null) { ctx.save(); toDesign(ctx); drawFragsOnly(ctx, ST.tp, now); ctx.restore(); }
  }

  function frame(t) {
    raf = 0; if (dead) return;
    if (!root.isConnected) { api.destroy(); return; }
    const dtRaw = last ? (t - last) / 1000 : 1 / 60; last = t;
    if (!document.hidden) {
      const dt = Math.min(.05, dtRaw); now += dt; step(dt, t); draw();
      // slow device: below ~36 fps for a while -> halve the spawn rate, draw at 1x, no glow blur, coarser outlines
      if (++nFr > 20 && !lite) { slow += dtRaw > .028 ? 1 : -1; slow = clamp(slow, 0, 40); if (slow >= 30) { lite = true; setFxLite(true); size(); } }
    }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && !dead && !reduce) { last = 0; raf = requestAnimationFrame(frame); } };
  const onVis = () => { if (!document.hidden) last = 0; }; document.addEventListener('visibilitychange', onVis);

  /* ---------- public phases ---------- */
  const api = {
    grey() { mode = 'grey'; ST = null; fireTo = 0; greyTo = 1; glowT = 0; fireOp = 0; greyOp = 1; setOp(gFire, 0); setOp(gGrey, 1); start(); },
    ignite() {
      if (reduce) return api.still(); mode = 'ignite'; fireTo = 1; greyTo = 0; play('ignite'); start(); refreshGeo();
      if (ctx) for (let i = 0; i < 14; i++) { const a = rnd(-3.0, -.14), v = rnd(120, 300); spark(G.x, G.baseY - 30 * G.k, Math.cos(a) * v, Math.sin(a) * v, { max: rnd(.4, .8) }); }
    },
    /* the jump: take-off, slow-motion curved air time, landing, spring back, burn. opts: { onApex, onLand } */
    jump(o = {}) {
      if (reduce) { if (o.onApex) o.onApex(); if (o.onLand) o.onLand(); return api.still(); }
      if (ST) return; clearT(); refreshGeo();
      setRise(Math.min(clamp(G.hh * .62, 90, 190), Math.max(90, G.baseY - .42 * G.hh - 24)) / G.u);   // jump height: as before, but the middle of the flame stays on screen at the top
      ST = { t0: null, tp: T.launch, y0: G.hh * .12, apexed: false, landed: false, burned: false, P: null, onApex: o.onApex, onLand: o.onLand };
      mode = 'fly'; fireTo = 1; greyTo = 0; seq = null; trailAcc = expAcc = dimAcc = 0; start();
      applyT(0, ST.y0, 0, 1.2, .62); host.style.opacity = '0';
      if (ctx) for (let i = 0; i < 8; i++) spark(G.x + rnd(-30, 30) * G.k, G.baseY - 8 * G.k, rnd(-60, 60), -rnd(70, 170), { max: rnd(.3, .5), s: rnd(2.4, 3.4), len: .02, drag: 2.2 });
    },
    fly(o) { return api.jump(o); },
    apex() { },
    burn() { mode = 'burn'; fireTo = 1; greyTo = 0; burnT0 = now; nextLick = now + rnd(1.6, 2.8); if (!ST) play('idle'); start(); },
    /* a single flare, e.g. when the flame is tapped */
    burst(n = 18) { if (!ctx || mode === 'grey') return; const cx = G.x + offX; for (let i = 0; i < n; i++) { const a = rnd(-2.6, -.54), v = rnd(220, 480); if (i % 3 === 0) tongue(cx, G.topY + 20 * G.k, Math.cos(a) * v * .7, Math.sin(a) * v * .7, { max: rnd(.45, .8), s: rnd(12, 24), drag: 1.2 }); else spark(cx, G.topY + 20 * G.k, Math.cos(a) * v, Math.sin(a) * v, { max: rnd(.5, .95) }); } if (!seq || curName === 'idle') play('lick', () => { play('idle'); }); },
    /* fire wisps from a spot of the screen (the week row): sparks rise straight up and shoot sideways */
    wisp(x, y, n = 7) {
      if (!ctx) return; start();
      for (let i = 0; i < n; i++) {
        const sd = i % 2 ? 1 : -1, vert = i % 3 === 0;
        if (vert) spark(x + rnd(-8, 8), y + rnd(-4, 4), rnd(-16, 16), -rnd(110, 230), { max: rnd(.5, .95), s: rnd(2.2, 3.6), drag: 1.4, len: .02 });
        else spark(x + rnd(-6, 6), y + rnd(-3, 3), sd * rnd(110, 250), -rnd(10, 60), { max: rnd(.4, .8), s: rnd(2.2, 3.4), drag: 2.2, len: .02 });
      }
      for (let i = 0; i < 2; i++) tongue(x + rnd(-8, 8), y, rnd(-20, 20), -rnd(50, 110), { max: rnd(.4, .7), s: rnd(9, 15) });
    },
    smoke(x, y, n) { return api.wisp(x, y, n); },
    /* root-relative centre of any element */
    at(el) { const r = el.getBoundingClientRect(), rr = root.getBoundingClientRect(); return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2 }; },
    /* reduced motion / skipped: one still flame, no particles */
    still() { mode = 'still'; seq = null; ST = null; clearT(); setFrame(A[19]); fireTo = fireOp = 1; greyTo = greyOp = 0; setOp(gFire, 1); setOp(gGrey, 0); paint(0, 0); },
    get mode() { return mode; },
    get live() { return P.length; },
    destroy() { dead = true; ST = null; document.removeEventListener('visibilitychange', onVis); if (raf) cancelAnimationFrame(raf); raf = 0; if (ro) ro.disconnect(); for (const c of [cv, cvs]) if (c.parentNode) c.parentNode.removeChild(c); P.length = 0; clearT(); }
  };
  api.grey();
  return api;
}
