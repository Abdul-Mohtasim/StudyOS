/* eslint-disable */
/* StudyOS streak fire: the free-placed effects around the flame, all vector cartoon style.
   - crescents: smooth blades (red-orange body, orange layer, yellow core). Each is BORN INSIDE the flame as a small piece, then
     travels out on its own path and grows to a fixed size. Paths: burst out of the ground, trail the flame, hang in the air and drift,
     break off the top and tumble to the ground, thrown out at landing, thin wisps while it burns.
   - puffs of soft glossy cartoon smoke (on a layer BEHIND the flame): take-off, along the jump, landing burst, a lazy trickle.
   - tiny leaf-shaped sparks.
   Everything is drawn in "design units" (a 140 x 215 flame standing at x = GX, feet on y = GROUND) and the caller maps those
   to the screen with one canvas transform, so the sizes stay right on every phone. tp = pose time from warp(). */
import { poseAt, cl, getRise, H0_DESIGN } from './streakpose.js';
const GX = 180, GROUND = 470;
const sm01 = (k) => { k = cl(k, 0, 1); return k * k * (3 - 2 * k); };
function mkRand(seed) { let a = seed; return () => (a = (a * 1664525 + 1013904223) % 4294967296) / 4294967296; }
let FXLITE = false;
const KCOL = { gold: ['#ffe27a', '#ffa526'], orange: ['#ffb43c', '#ff6a1c'], dark: ['#ff7a2a', '#b8281a'] };
function flameC(tp) { const P = poseAt(tp); return { x: GX + P.x, y: GROUND - 52 * cl(P.sy, .3, 1.2) + P.y }; }
const mkR = mkRand(11), rr = (a, b) => a + (b - a) * mkR();
const FRAGS = [];
const crs = (o) => FRAGS.push(Object.assign({ shape: 'cres', k: 'gold', R: 34, span: 1.5, w: 2.4, cu: .2, side: 1 }, o));
/* take-off: crescents burst out of the ground beside the feet and arc away */
crs({ kind: 'ball', t0: .80, t1: 1.80, x0: GX - 22, y0: GROUND - 8, vx: -105, vy: -270, g: 330, R: 36, span: 1.7, w: 2.6, side: 1 });
crs({ kind: 'ball', t0: .84, t1: 1.85, x0: GX + 24, y0: GROUND - 8, vx: 118, vy: -295, g: 360, k: 'orange', R: 40, span: 1.6, w: 2.4, side: -1 });
crs({ kind: 'ball', t0: .90, t1: 1.95, x0: GX - 8, y0: GROUND - 8, vx: -38, vy: -340, g: 390, R: 24, span: 1.4, w: 1.9, side: 1 });
/* in the air: they trail and swirl with the flame on their own loops, each a different size, lag and direction */
crs({ kind: 'follow', t0: .95, t1: 1.95, lag: .10, cx: -6, cy: -4, ax: 66, ay: 54, ph: -2.2, om: 3.2, R: 40, span: 1.8, w: 2.7 });
crs({ kind: 'follow', t0: 1.0, t1: 2.0, lag: .20, cx: 0, cy: -10, ax: 86, ay: 40, ph: 1.0, om: -2.6, k: 'orange', R: 54, span: 1.4, w: 2.3 });
crs({ kind: 'follow', t0: 1.05, t1: 1.9, lag: .32, cx: 0, cy: 22, ax: 40, ay: 72, ph: .5, om: 3.8, R: 28, span: 1.6, w: 1.8, side: -1 });
crs({ kind: 'follow', t0: .92, t1: 1.72, lag: .16, cx: 0, cy: 0, ax: 104, ay: 26, ph: 3.2, om: 2.2, k: 'dark', R: 62, span: 1.1, w: 2.4 });
/* pieces that hang in the air by themselves and drift up, turning slowly */
crs({ kind: 'float', t0: 1.0, t1: 2.15, x0: GX - 114, y0: GROUND - 175, dx: -14, dy: -55, th0: -.4, spin: 1.7, R: 42, span: 1.5, w: 2.3 });
crs({ kind: 'float', t0: 1.15, t1: 2.3, x0: GX + 112, y0: GROUND - 255, dx: 14, dy: -42, th0: 1.2, spin: -1.9, k: 'orange', R: 36, span: 1.4, w: 2.1 });
crs({ kind: 'float', t0: .9, t1: 1.85, x0: GX + 62, y0: GROUND - 330, dx: 18, dy: -30, th0: .3, spin: 1.3, R: 26, span: 1.3, w: 1.7 });
/* they break off the flame at the top and fall to the ground, tumbling, land flat, bounce a little and melt away */
crs({ kind: 'drop', t0: 1.30, t1: 2.35, cx: -34, cy: -14, gx: GX - 94, gy: GROUND - 3, th0: -.6, spin: 5.6, R: 34, span: 1.6, w: 2.5, bh: 14 });
crs({ kind: 'drop', t0: 1.45, t1: 2.5, cx: 38, cy: -30, gx: GX + 100, gy: GROUND - 2, th0: .4, spin: -4.6, k: 'orange', R: 30, span: 1.5, w: 2.2, bh: 10 });
crs({ kind: 'drop', t0: 1.12, t1: 2.2, cx: 22, cy: 40, gx: GX + 46, gy: GROUND - 1, th0: 1.6, spin: 3.4, k: 'dark', R: 24, span: 1.3, w: 1.9, bh: 7 });
/* landing: splashes thrown out of the ground, fall back in arcs */
crs({ kind: 'ball', t0: 1.80, t1: 2.55, x0: GX - 30, y0: GROUND - 6, vx: -175, vy: -265, g: 700, R: 32, span: 1.5, w: 2.4, side: 1 });
crs({ kind: 'ball', t0: 1.80, t1: 2.5, x0: GX + 30, y0: GROUND - 6, vx: 195, vy: -235, g: 700, k: 'orange', R: 30, span: 1.4, w: 2.2, side: -1 });
crs({ kind: 'ball', t0: 1.84, t1: 2.6, x0: GX - 8, y0: GROUND - 6, vx: -60, vy: -345, g: 750, R: 24, span: 1.3, w: 1.8, side: 1 });
crs({ kind: 'ball', t0: 2.12, t1: 2.85, x0: GX - 16, y0: GROUND - 12, vx: -125, vy: -310, g: 620, R: 26, span: 1.3, w: 1.9, side: 1 });
crs({ kind: 'ball', t0: 2.16, t1: 2.9, x0: GX + 16, y0: GROUND - 12, vx: 135, vy: -290, g: 620, k: 'orange', R: 26, span: 1.3, w: 1.9, side: -1 });
/* while it burns: a thin wisp now and then curls up beside the flame */
for (let n = 0; n < 3; n++) { const sg = n % 2 ? 1 : -1, t0 = 2.7 + 1.55 * n; crs({ kind: 'float', t0, t1: t0 + 1.5, x0: GX + sg * 62, y0: GROUND - 36, dx: sg * 16, dy: -112, th0: sg * .3, spin: sg * 1.2, R: 30, span: 1.2, w: 1.8 }); }
FRAGS.forEach((F, i) => { F.ex = ((i * 37) % 22) - 11; F.ey = 8 - ((i * 23) % 46); });   // where inside the flame body each crescent starts
/* tiny leaf-shaped sparks: some travel with the flame, some are thrown at take-off, landing and spring-back */
const spk = (o) => FRAGS.push(Object.assign({ shape: 'leaf', k: 'gold', s: rr(3.5, 5.5) }, o));
for (let i = 0; i < 9; i++) spk({ kind: 'follow', t0: .9 + i * .1, t1: 1.9 + i * .05, lag: .05 + mkR() * .3, cx: rr(-10, 10), cy: rr(-10, 10), ax: rr(46, 100), ay: rr(40, 90), ph: mkR() * 6.3, om: (i % 2 ? 1 : -1) * rr(2, 4.5), k: i % 3 ? 'gold' : 'orange' });
for (let i = 0; i < 6; i++) spk({ kind: 'ball', t0: .82 + i * .035, t1: 1.8 + i * .03, x0: GX + rr(-24, 24), y0: GROUND - 8, vx: rr(-130, 130), vy: -rr(190, 310), g: 300 });
for (let i = 0; i < 9; i++) spk({ kind: 'ball', t0: 1.8 + i * .03, t1: 2.55 + i * .04, x0: GX + rr(-26, 26), y0: GROUND - 8, vx: (i % 2 ? 1 : -1) * rr(40, 210), vy: -rr(150, 340), g: 620, k: i % 3 ? 'gold' : 'orange' });
for (let i = 0; i < 5; i++) spk({ kind: 'ball', t0: 2.12 + i * .05, t1: 2.9 + i * .05, x0: GX + rr(-20, 20), y0: GROUND - 14, vx: rr(-90, 90), vy: -rr(220, 340), g: 560 });
function posOf(F, k, tp) {
  const tau = tp - F.t0, H = Math.PI / 2;
  if (F.kind === 'ball') { const vy = F.vy + F.g * tau; return { x: F.x0 + F.vx * tau, y: F.y0 + F.vy * tau + .5 * F.g * tau * tau, th: Math.atan2(vy, F.vx) + (F.side || 1) * H, ry: 1 }; }
  if (F.kind === 'follow') { const fc = flameC(tp - F.lag), ph = F.ph + F.om * tau, sg = Math.sign(F.om), x = fc.x + F.cx + Math.cos(ph) * F.ax, y = fc.y + F.cy + Math.sin(ph) * F.ay; return { x, y, th: Math.atan2(Math.cos(ph) * F.ay * sg, -Math.sin(ph) * F.ax * sg) + (F.side || 1) * H, ry: 1 }; }
  if (F.kind === 'drop') {
    const fc = flameC(F.t0), f = cl(k / .66, 0, 1), b = cl((k - .66) / .2, 0, 1), x0 = fc.x + F.cx, y0 = fc.y + F.cy, fe = f * f * (1.3 - .3 * f);
    const x = x0 + (F.gx - x0) * f + Math.sin(f * 7) * 8 * (1 - f), y = y0 + (F.gy - y0) * fe - F.bh * 4 * b * (1 - b), lie = sm01((k - .62) / .1);
    return { x, y, th: (F.th0 + F.spin * f) * (1 - lie) + -Math.PI / 2 * lie, ry: 1 - .62 * lie };
  }
  const wob = Math.sin(tau * 3 + F.t0 * 5) * 5, kh = getRise() / H0_DESIGN; return { x: F.x0 + F.dx * k + wob, y: GROUND + (F.y0 - GROUND + F.dy * k) * kh, th: F.th0 + F.spin * k, ry: 1 };
}
function drawFrag(c, F, tp, tm) {
  const k = (tp - F.t0) / (F.t1 - F.t0); if (k <= 0 || k >= 1) return;
  const fa = F.fadeAt || .55, e = sm01(k / .14) * (1 - sm01((k - fa) / (1 - fa))); if (e < .02) return;
  let q = posOf(F, k, tp), sc = 1; const col = KCOL[F.k];
  if (F.shape === 'cres') {      // every crescent is born INSIDE the flame body as a small piece, then travels out to its own path and grows to a fixed limit
    const m = sm01(k / .4), fc = flameC(tp), ox = fc.x + F.ex, oy = fc.y + F.ey;
    q = { x: ox + (q.x - ox) * m, y: oy + (q.y - oy) * m, th: q.th, ry: q.ry }; sc = .24 + .76 * m;
  }
  if (F.shape === 'leaf') {
    const r = F.s * (.55 + .45 * e), fl = .8 + .2 * Math.sin(tm * 10 + F.t0 * 9);
    c.save(); c.translate(q.x, q.y); c.rotate(q.th); c.globalAlpha = e * fl; c.shadowColor = 'rgba(255,150,40,.7)'; c.shadowBlur = FXLITE ? 0 : 6; c.fillStyle = col[0];
    c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(r * .75, -r * .2, 0, r * .9); c.quadraticCurveTo(-r * .75, -r * .2, 0, -r); c.fill();
    c.fillStyle = col[1]; c.globalAlpha *= .6; c.beginPath(); c.moveTo(0, -r * .2); c.quadraticCurveTo(r * .5, r * .2, 0, r * .9); c.quadraticCurveTo(-r * .5, r * .2, 0, -r * .2); c.fill(); c.restore(); return;
  }
  const R = F.R * 1.05 * sc * (.8 + .2 * e), span = F.span * Math.pow(e, .7), w = F.w * 1.1 * sc * (.55 + .45 * e), ry = q.ry, cx = q.x - R * Math.cos(q.th), cy = q.y - R * Math.sin(q.th) * ry;
  const sp = span * 1.35, N = 36, al = Math.min(1, e * 1.6);
  /* one smooth blade: the centre line is an arc that hooks inward at its tail; the width swells in the middle and ends in soft round tips */
  const blade = (grow, shift) => {
    const O = [], I = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, ang = q.th + (t - .5) * sp, rad = R * (1 - (F.cu || 0) * Math.pow(t, 2.2)), hw = w * 2.7 * grow * (.16 + .84 * Math.pow(Math.sin(Math.PI * (.03 + .94 * t)), .62)) * (.8 + .5 * t), cr = rad - shift * w * 2.7;
      O.push([cx + (cr + hw) * Math.cos(ang), cy + (cr + hw) * Math.sin(ang) * ry]); I.push([cx + (cr - hw * 1.05) * Math.cos(ang), cy + (cr - hw * 1.05) * Math.sin(ang) * ry]);
    }
    const all = O.concat(I.reverse()), n = all.length, mid = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], m0 = mid(all[n - 1], all[0]);
    c.beginPath(); c.moveTo(m0[0], m0[1]); for (let i = 0; i < n; i++) { const A = all[i], B = all[(i + 1) % n], M = mid(A, B); c.quadraticCurveTo(A[0], A[1], M[0], M[1]); } c.closePath();
  };
  const base = F.k === 'dark' ? ['#a8231a', '#e8501e', '#ff8a2a'] : F.k === 'orange' ? ['#e8431a', '#ff7a1c', '#ffb02e'] : ['#ee5a1a', '#ff9a1f', '#ffd83d'];
  c.save(); c.globalAlpha = al; c.lineJoin = 'round';
  c.shadowColor = 'rgba(255,120,30,.55)'; c.shadowBlur = FXLITE ? 0 : 8; blade(1, 0); c.fillStyle = base[0]; c.fill(); c.shadowBlur = 0;
  blade(.68, .12); c.fillStyle = base[1]; c.fill();                                   // orange layer: a smaller copy of the same blade
  blade(.36, .22); c.fillStyle = base[2]; c.fill();                                   // warm yellow core, nearer the inner edge like the icon
  c.restore();
}

/* ---- cartoon smoke: soft glossy puffs (a cluster of round blobs), warm from the fire below, a pale highlight on top. They grow, rise and fade. ---- */
const PUFFS = [];
const puff = (o) => PUFFS.push(Object.assign({ kind: 'stay', r0: 9, r1: 26, rise: 46, dx: 0, a: .55, lit: .8 }, o));
/* take-off: dust and smoke pushed out of the ground around the feet */
for (let i = 0; i < 5; i++) { const sg = i % 2 ? 1 : -1; puff({ t0: .80 + i * .025, t1: 1.75 + i * .05, x0: GX + sg * (14 + i * 5), y0: GROUND - 6, dx: sg * (34 + i * 12), r0: 8, r1: 22 + i * 2, rise: 34 + i * 6, a: .5 }); }
/* in the air: a trail of puffs left hanging at many spots along the jump, each drifting up and sideways on its own */
for (let i = 0; i < 13; i++) { const t0 = .90 + i * .075, sg = i % 2 ? 1 : -1; puff({ kind: 'trail', t0, t1: t0 + 1.05 + (i % 3) * .12, ox: sg * (10 + (i * 7) % 24), oy: ((i * 13) % 40) - 14, dx: sg * (16 + (i * 5) % 30), r0: 7 + (i % 3) * 2, r1: 20 + (i * 3) % 14, rise: 26 + (i * 9) % 38, a: .5 }); }
/* landing: a big burst rolling out along the ground to both sides, with taller puffs rising in the middle */
for (let i = 0; i < 8; i++) { const sg = i % 2 ? 1 : -1, n = Math.floor(i / 2); puff({ t0: 1.79 + n * .035, t1: 2.75 + n * .1, x0: GX + sg * (18 + n * 8), y0: GROUND - 5, dx: sg * (62 + n * 30), r0: 11, r1: 30 + n * 5, rise: 20 + n * 10, a: .62 }); }
for (let i = 0; i < 4; i++) puff({ t0: 1.84 + i * .05, t1: 2.8 + i * .08, x0: GX + (i - 1.5) * 15, y0: GROUND - 14, dx: (i - 1.5) * 12, r0: 9, r1: 22 + (i % 2) * 6, rise: 62 + i * 16, a: .5 });
/* spring-back and burn: smaller puffs off the ground, then a thin lazy trickle above the flame */
for (let i = 0; i < 4; i++) { const sg = i % 2 ? 1 : -1; puff({ t0: 2.15 + i * .06, t1: 3.1 + i * .08, x0: GX + sg * 26, y0: GROUND - 10, dx: sg * (40 + i * 12), r0: 7, r1: 17, rise: 34 + i * 8, a: .45 }); }
for (let i = 0; i < 5; i++) puff({ t0: 2.9 + i * 1.0, t1: 4.6 + i * 1.0, x0: GX + (i % 2 ? 7 : -7), y0: GROUND - 120, dx: (i % 2 ? 14 : -14), r0: 5, r1: 13, rise: 86, a: .34 });
function blob(c, x, y, r, col0, col1, a) {
  const g = c.createRadialGradient(x - r * .28, y - r * .32, r * .08, x, y, r); g.addColorStop(0, col0); g.addColorStop(1, col1);
  c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
}
function drawPuff(c, F, tp, tm) {
  const k = (tp - F.t0) / (F.t1 - F.t0); if (k <= 0 || k >= 1) return;
  const grow = 1 - Math.pow(1 - k, 2.2), e = sm01(k / .15) * (1 - sm01((k - .45) / .55)); if (e < .015) return;
  const r = F.r0 + (F.r1 - F.r0) * grow, lift = F.rise * (1 - Math.pow(1 - k, 1.7)), wob = Math.sin(tm * 1.7 + F.t0 * 6) * 3 * k;
  let x, y; if (F.kind === 'trail') { const fc = flameC(F.t0); x = fc.x + F.ox + F.dx * grow + wob; y = fc.y + F.oy - lift; } else { x = F.x0 + F.dx * grow + wob; y = F.y0 - lift; }
  const a = F.a * e, lit = F.lit * (1 - k * .7);
  c.save(); c.globalCompositeOperation = 'source-over';
  const parts = [[0, 0, 1], [-.62, .16, .68], [.64, .12, .72], [.12, -.5, .6]];
  for (const [ox, oy, sc] of parts) blob(c, x + ox * r, y + oy * r, r * sc, '#f0dccb', '#8c6c5e', a);                // body: warm grey, darker at the bottom
  c.globalCompositeOperation = 'lighter';
  for (const [ox, oy, sc] of parts) { const bx = x + ox * r, by = y + oy * r + r * sc * .4, g = c.createRadialGradient(bx, by, 0, bx, by, r * sc * .9); g.addColorStop(0, `rgba(255,130,40,${.6 * lit})`); g.addColorStop(1, 'rgba(255,100,30,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(bx, by, r * sc * .9, 0, 6.2832); c.fill(); }   // fire light from below
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = a * .75; c.fillStyle = '#fff6ea'; c.beginPath(); c.ellipse(x - r * .3, y - r * .45, r * .26, r * .14, -.5, 0, 6.2832); c.fill();   // glossy highlight
  c.restore();
}
function drawSmokeOnly(c, tp, tm) { if (tp < .7) return; c.save(); c.globalCompositeOperation = 'source-over'; for (const F of PUFFS) drawPuff(c, F, tp, tm); c.restore(); }
function drawFragsOnly(c, tp, tm) { if (tp < .7) return; c.save(); c.globalCompositeOperation = 'source-over'; for (const F of FRAGS) drawFrag(c, F, tp, tm); c.restore(); }
function drawFree(c, tp, tm) { drawSmokeOnly(c, tp, tm); drawFragsOnly(c, tp, tm); }
function setFxLite(v) { FXLITE = !!v; }
export { GX, GROUND, drawSmokeOnly, drawFragsOnly, setFxLite, FRAGS, PUFFS };
