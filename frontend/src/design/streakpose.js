/* eslint-disable */
/* StudyOS streak fire: the pose of the flame over time (pure functions, no DOM).

   Timeline (seconds on the sound file's clock): 0.82 take-off, 1.40 top of the jump, 1.79 landing (the file's own times).
   Slow motion in the air: the jump takes AIR_RD (1.9 s) of real time instead of AIR_D (0.97 s of sound), slowest near the top.
   warp(t) turns the clock "real seconds since the file started" into the pose time poseAt() understands.
   fileToReal(t) turns a time in the sound file into real time, so events that belong to the sound (the number roll, the week
   row ...) still land on the right moment of the stretched sound. */
const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
const T = { crouch: .70, ignite: .72, launch: .82, apex: 1.40, land: 1.79, sqIn: .09, hold: .22 };
let H0 = 170; const BULGE = 46, H0_DESIGN = 170;
function setRise(h) { H0 = h > 20 ? h : H0_DESIGN; }                 // jump height in design units (the caller scales it to the phone)
function getRise() { return H0; }
const AIR_D = T.land - T.launch, AIR_RD = 1.9, AIR_X = AIR_RD - AIR_D;
function warp(t) { if (t < T.launch) return t; if (t >= T.launch + AIR_RD) return t - AIR_X; const u = (t - T.launch) / AIR_RD; return T.launch + AIR_D * (u + .28 * Math.sin(2 * Math.PI * u) / (2 * Math.PI)); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const eOut = (k) => 1 - Math.pow(1 - k, 3), eIn = (k) => k * k * k, sm = (k) => k * k * (3 - 2 * k);
function poseAt(t) {
  const P = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, b: 1, glow: 1, fire: 1, seq: 'idle', pos: 0, phase: 'burn', vx: 0, vy: 0, air: 0, e: -1 };
  if (t < T.crouch) { P.fire = 0; P.glow = 0; P.seq = 'grey'; P.phase = 'grey'; return P; }
  if (t < T.launch) {
    const k = (t - T.crouch) / (T.launch - T.crouch), e = eOut(k);
    P.fire = clamp((t - T.ignite) / .1, 0, 1); P.glow = P.fire; P.sy = 1 - .38 * e; P.sx = 1 + .2 * e;
    P.seq = P.fire > 0 ? 'ignite' : 'grey'; P.pos = Math.max(0, t - T.ignite) * 22; P.phase = P.fire > 0 ? 'ignite' : 'crouch'; return P;
  }
  const up = T.apex - T.launch, down = T.land - T.apex, TT = up + down;
  if (t < T.land) {
    const tl = t - T.launch, u = tl / TT; let y, vy;
    if (tl < up) { const a = tl / up; y = -H0 * (1 - (1 - a) * (1 - a)); vy = -2 * H0 * (1 - a) / up; }
    else { const b = clamp((tl - up) / down, 0, 1); y = -H0 * (1 - b * b); vy = 2 * H0 * b / down; }
    const x = BULGE * Math.sin(Math.PI * u), vx = BULGE * Math.PI * Math.cos(Math.PI * u) / TT;
    const rot = 360 * (u - .35 * Math.sin(2 * Math.PI * u) / (2 * Math.PI));          // one full turn, never backwards, a little slower at both ends
    const spd = clamp(Math.abs(vy) / (2 * H0 / Math.min(up, down)), 0, 1), syT = 1 + .14 * spd, sxT = 1 / Math.sqrt(syT), k = eOut(clamp(tl / .1, 0, 1));
    P.x = x; P.y = y; P.rot = rot; P.sy = lerp(.62, syT, k); P.sx = lerp(1.2, sxT, k); P.seq = 'fly'; P.pos = tl * 20; P.phase = 'air'; P.vx = vx; P.vy = vy; P.air = 1; P.glow = 1.1;
    return P;
  }
  const tau = t - T.land; P.tau = tau; const FLY_END = (T.land - T.launch) * 20;
  if (tau < T.sqIn) {                                                                      // squash flat, the light drains
    const k = sm(tau / T.sqIn) * .5 + eIn(tau / T.sqIn) * .5; P.sy = lerp(1.14, .2, k); P.sx = lerp(.937, 1.44, k); P.b = lerp(1, .45, k); P.glow = lerp(1.1, .15, k); P.seq = 'fly'; P.pos = FLY_END; P.phase = 'squash'; return P;
  }
  if (tau < T.sqIn + T.hold) { P.sy = .2; P.sx = 1.44; P.b = .45; P.glow = .15; P.seq = 'fly'; P.pos = FLY_END; P.phase = 'dim'; return P; }   // almost out
  const e = tau - T.sqIn - T.hold; P.e = e;                                                  // springs back to a lively flame
  P.sy = 1 - .8 * Math.exp(-5.5 * e) * Math.cos(11 * e); P.sx = 1 + .55 * (1 - P.sy); P.b = .45 + .55 * sm(clamp(e / .5, 0, 1)); P.glow = .15 + .85 * sm(clamp(e / .6, 0, 1));
  if (e < .42) { P.seq = 'land'; P.pos = 15 + e * 20; P.phase = 'expand'; } else { P.seq = 'idle'; P.pos = (e - .42) * 11; P.phase = 'burn'; }
  return P;
}


const AIRPOS = (T.land - T.launch) * 20;
const smt = (k) => k * k * (3 - 2 * k);
const AIR_K = AIR_RD / AIR_D;                                   // how much the sound is stretched in the air (about 1.96x slower)
function fileToReal(t) { return t < T.launch ? t : t < T.land ? T.launch + (t - T.launch) * AIR_K : t + AIR_X; }
const KL = [0, -.3, -.55, -.8, -1, -.4, .3, .6, .12, 0, 0, 0];
function leanSheet(p) { p = ((p % 12) + 12) % 12; const i = Math.floor(p), t = p - i, g = (j) => KL[(j + 12) % 12], a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
  return 1.0 * .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t); }
function leanFor(P, tm) {
  if (P.air) { const tl = P.pos / 20, u = cl(P.pos / AIRPOS, 0, 1); return leanSheet(8 * u) * smt(cl(tl / .12, 0, 1)); }
  if (P.phase === 'expand') return .3 * Math.exp(-5 * P.e) * Math.sin(12 * P.e);
  if (P.phase === 'burn') return (.15 * Math.sin(tm * 1.6) + .08 * Math.sin(tm * 2.7 + 1)) * smt(cl((P.e - .42) / .8, 0, 1));
  return 0;
}

export { T, H0_DESIGN, setRise, getRise, BULGE, AIR_D, AIR_RD, AIR_X, AIR_K, AIRPOS, warp, poseAt, leanSheet, leanFor, fileToReal, cl, smt };
