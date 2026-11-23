/* Animated streak flame: a parametric SVG flame (three layers plus two side tongues) driven by a
   requestAnimationFrame loop, a canvas particle layer (sparks, trails, bursts, shock rings) and
   two CSS glow layers. No libraries. The loop stops by itself when the host leaves the page,
   when the tab is hidden, or on destroy(). Reduced motion draws one still frame.

   const f = createFlame(hostElement, { state: 'idle' });
   f.setState('idle' | 'inactive');   persistent look
   f.increase();                      streak went up: spring bounce plus golden sparks
   f.milestone();                     bigger, brighter, particle explosion and shock rings
   f.destroy();
*/
let UID = 0;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

const COL = {
  outer: [['#ff9a2b', '#9aa7b4'], ['#ff6a2d', '#8693a0'], ['#d93030', '#6b7784']],
  mid:   [['#ffe066', '#b4c0cb'], ['#ffa51f', '#9aa7b4']],
  core:  [['#fffadb', '#cfd8e0'], ['#ffe266', '#b4c0cb']]
};

/* flame outline from a few numbers: w half width, h height, tx tip sideways offset, lean right-shoulder lift */
const body = (w, h, tx, lean, k = .24) => {
  const tipX = 100 + tx, tipY = 226 - h;
  return `M100 226C${100 - w * .66} 226 ${100 - w} 202 ${100 - w} 168`
    + `C${100 - w + tx * .45} ${168 - (168 - tipY) * .42} ${tipX - w * .1} ${tipY + h * k} ${tipX} ${tipY}`
    + `C${tipX + w * .08} ${tipY + h * k} ${100 + w + tx * .45 + lean} ${168 - (168 - tipY) * .42} ${100 + w} 168`
    + `C${100 + w} 202 ${100 + w * .66} 226 100 226Z`;
};
/* side lick: starts inside the body edge, tip flicks outward (dir -1 left, 1 right) */
const tongue = (side, y0, h, wag, wd) => {
  const x0 = 100 + side * 40, tx = 100 + side * (62 + wag), ty = y0 - h;
  return `M${x0 - side * 6} ${y0}C${x0 + side * wd} ${y0 - h * .26} ${tx - side * 6} ${ty + h * .36} ${tx} ${ty}C${tx - side * 2} ${ty + h * .46} ${x0 - side * wd * .2} ${y0 - h * .42} ${x0 - side * 28} ${y0 - 6}Z`;
};

export function createFlame(host, opt = {}) {
  const id = 'fl' + (++UID);
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  host.classList.add('flh');
  host.innerHTML = `<div class="fl-g1"></div><div class="fl-g2"></div>
<svg class="fl-svg" viewBox="0 0 200 240" aria-hidden="true"><defs>
<radialGradient id="${id}o" cx="50%" cy="78%" r="62%"><stop offset="0" stop-color="${COL.outer[0][0]}"/><stop offset=".55" stop-color="${COL.outer[1][0]}"/><stop offset="1" stop-color="${COL.outer[2][0]}"/></radialGradient>
<linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COL.mid[0][0]}"/><stop offset="1" stop-color="${COL.mid[1][0]}"/></linearGradient>
<linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COL.core[0][0]}"/><stop offset="1" stop-color="${COL.core[1][0]}"/></linearGradient></defs>
<ellipse class="fl-sh" cx="100" cy="230" rx="60" ry="8" fill="#000" opacity=".24"/>
<g class="fl-all"><path class="fl-tl" fill="url(#${id}o)"/><path class="fl-tr" fill="url(#${id}o)"/><path class="fl-o" fill="url(#${id}o)"/><path class="fl-m" fill="url(#${id}m)"/><path class="fl-c" fill="url(#${id}c)"/>
<path class="fl-gl" fill="#fff" opacity=".42"/><ellipse class="fl-gd" cx="76" cy="146" rx="4.500" ry="6" fill="#fff" opacity=".55"/></g></svg>
<canvas class="fl-cv" aria-hidden="true"></canvas>`;
  const q = (c) => host.querySelector(c);
  const el = { g1: q('.fl-g1'), g2: q('.fl-g2'), svg: q('.fl-svg'), sh: q('.fl-sh'), all: q('.fl-all'), tl: q('.fl-tl'), tr: q('.fl-tr'), o: q('.fl-o'), m: q('.fl-m'), c: q('.fl-c'), gl: q('.fl-gl'), gd: q('.fl-gd'), cv: q('.fl-cv') };
  const stops = {
    o: [...host.querySelectorAll(`#${id}o stop`)], m: [...host.querySelectorAll(`#${id}m stop`)], c: [...host.querySelectorAll(`#${id}c stop`)]
  };
  const ctx = el.cv.getContext('2d');
  const W = host.clientWidth || 176, H = host.clientHeight || 211;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const CW = W * 1.6, CH = H * 1.5, OX = W * .3, OY = H * .45;
  el.cv.width = Math.round(CW * dpr); el.cv.height = Math.round(CH * dpr);
  const BX = OX + W / 2, BY = OY + H * .94;

  const sprite = (c) => { const s = document.createElement('canvas'); s.width = s.height = 32; const x = s.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, c[0]); g.addColorStop(.35, c[1]); g.addColorStop(1, c[2]); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return s; };
  const SPR = [sprite(['rgba(255,244,190,1)', 'rgba(255,190,60,.8)', 'rgba(255,150,40,0)']), sprite(['rgba(255,214,120,1)', 'rgba(255,122,46,.75)', 'rgba(255,90,40,0)']), sprite(['rgba(255,255,255,.95)', 'rgba(255,224,140,.6)', 'rgba(255,200,80,0)'])];

  const ph = Array.from({ length: 16 }, () => [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28]);
  const nz = (i, t, a, b, c) => (Math.sin(t * a + ph[i][0]) + Math.sin(t * b + ph[i][1]) * .6 + Math.sin(t * c + ph[i][2]) * .4) / 2;

  const S = { target: 'idle', scale: 1, vel: 0, scaleT: 1, hold: 0, energy: 1, energyT: 1, glow: 1, glowT: 1, boost: 0, bright: 0, mute: 0, muteT: 0, rate: 14, rateT: 14, lastMute: -1 };
  const setTarget = (s) => {
    S.target = s;
    if (s === 'inactive') { S.muteT = 0 + 1; S.energyT = .8; S.glowT = .15; S.rateT = .5; S.scaleT = .92; }
    else { S.muteT = 0; S.energyT = 1; S.glowT = 1; S.rateT = 14; S.scaleT = 1; }
  };
  let P = [], rings = [], t = 0, last = performance.now(), raf = 0, dead = false, nextBurst = 2.5, holdT = 0;

  const spawn = (n, power, kind) => {
    for (let i = 0; i < n && P.length < 220; i++) {
      const a = Math.random() * 6.28, sp = power * (.4 + Math.random() * .8);
      if (power) P.push({ x: BX + Math.cos(a) * W * .12, y: BY - H * (.25 + Math.random() * .3), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .8 - power * .5, life: 0, max: .8 + Math.random() * 1.1, s: 2 + Math.random() * 3.6, spr: kind === 'mix' ? i % 3 : (i % 2 ? 0 : 2), w: Math.random() * 6.28, tr: [] , burst: 1 });
      else P.push({ x: BX + (Math.random() - .5) * W * .34, y: BY - H * (.1 + Math.random() * .5), vx: (Math.random() - .5) * 14, vy: -(36 + Math.random() * 74), life: 0, max: 1 + Math.random() * 1.5, s: 1.5 + Math.random() * 2.8, spr: Math.random() < .3 ? 2 : (Math.random() < .5 ? 0 : 1), w: Math.random() * 6.28, tr: [], burst: 0 });
    }
  };

  const setStops = (m) => {
    const L = (arr, list) => list.forEach((s, i) => s.setAttribute('stop-color', mix(arr[i][0], arr[i][1], m)));
    L(COL.outer, stops.o); L(COL.mid, stops.m); L(COL.core, stops.c);
  };

  const draw = () => {
    const f = Math.max(.001, 1 - S.mute * .85);
    const o = { w: 54 + 3.500 * nz(0, t, 1.7, 2.9, 4.1), h: (208 + 14 * nz(1, t, 1.3, 2.2, 3.7)) * S.energy, tx: 14 * nz(2, t, .9, 1.7, 2.6) * f, lean: 8 * nz(3, t, 1.5, 2.4, 3.3) * f };
    const m = { w: 35 + 2.500 * nz(4, t, 2.1, 3.1, 4.3), h: (138 + 14 * nz(5, t, 1.6, 2.7, 3.9)) * S.energy, tx: o.tx * .55 + 6 * nz(6, t, 1.2, 2.2, 3.4) * f, lean: 5 * nz(7, t, 1.8, 2.5, 3.6) * f };
    const c = { w: 19 + 2 * nz(8, t, 2.4, 3.6, 4.8), h: (78 + 9 * nz(9, t, 1.9, 3.2, 4.4)) * S.energy, tx: o.tx * .3 + 3 * nz(10, t, 1.4, 2.6, 3.8) * f, lean: 3 * nz(11, t, 2, 2.9, 4) * f };
    el.o.setAttribute('d', body(o.w, o.h, o.tx, o.lean));
    el.m.setAttribute('d', body(m.w, m.h, m.tx, m.lean, .3));
    el.c.setAttribute('d', body(c.w, c.h, c.tx, c.lean, .42));
    el.m.setAttribute('transform', 'translate(0 -5)'); el.c.setAttribute('transform', 'translate(0 -9)');
    const wl = 12 * nz(12, t, 2.3, 3.4, 5) * f, wr = 10 * nz(13, t, 2.0, 3.0, 4.6) * f;
    el.tl.setAttribute('d', tongue(-1, 196, (84 + 16 * nz(14, t, 1.6, 2.8, 4)) * S.energy, wl, 15));
    el.tr.setAttribute('d', tongue(1, 200, (62 + 12 * nz(15, t, 1.9, 3.1, 4.5)) * S.energy, wr, 13));
    const sx = S.scale - S.vel * .014, sy = S.scale + S.vel * .02, rot = 2.2 * nz(12, t * .8, 1, 1.9, 3) * f;
    el.all.setAttribute('transform', `translate(100 226) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-100 -226)`);
    el.gl.setAttribute('d', `M${66 + o.tx * .35} 160C${64 + o.tx * .35} 128 ${78 + o.tx * .35} 108 ${96 + o.tx * .5} 98C${84 + o.tx * .4} 114 ${78 + o.tx * .3} 132 ${80 + o.tx * .3} 158Z`);
    el.gd.setAttribute('cx', 76 + o.tx * .3);
    el.sh.setAttribute('rx', (58 + (S.scale - 1) * 40).toFixed(1)); el.sh.setAttribute('opacity', (.24 * (.4 + f * .6)).toFixed(3));
    const g = Math.max(0, S.glow * (.86 + .14 * nz(10, t, 1.1, 2, 3)) + S.boost);
    el.g1.style.opacity = Math.min(1, .62 * g).toFixed(3); el.g1.style.transform = `scale(${(.9 + g * .16).toFixed(3)})`;
    el.g2.style.opacity = Math.min(1, .7 * g).toFixed(3); el.g2.style.transform = `scale(${(.9 + g * .12).toFixed(3)})`;
    el.svg.style.filter = S.bright > .02 ? `brightness(${(1 + S.bright * .34).toFixed(3)}) saturate(${(1 + S.bright * .2).toFixed(3)})` : '';
    if (Math.abs(S.mute - S.lastMute) > .004) { setStops(S.mute); S.lastMute = S.mute; }
    // particles
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, CW, CH); ctx.globalCompositeOperation = 'lighter';
    for (const r of rings) { const k = r.life / r.max; ctx.globalAlpha = (1 - k) * .55 * r.a; ctx.lineWidth = 4 * (1 - k) + 1; ctx.strokeStyle = '#ffb02e'; ctx.beginPath(); ctx.arc(BX, BY - H * .4, 20 + k * r.r, 0, 6.283); ctx.stroke(); }
    for (const p of P) {
      const k = p.life / p.max, a = Math.sin(Math.min(1, k) * Math.PI) * (p.burst ? 1 : .9) * (1 - S.mute * .6);
      for (let i = 0; i < p.tr.length; i++) { const tp = p.tr[i]; ctx.globalAlpha = a * .22 * (i + 1) / p.tr.length; const s = p.s * (.5 + i * .12) * 4; ctx.drawImage(SPR[p.spr], tp[0] - s / 2, tp[1] - s / 2, s, s); }
      ctx.globalAlpha = a; const s = p.s * 4.2 * (1 - k * .5); ctx.drawImage(SPR[p.spr], p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };

  const step = (dt) => {
    t += dt;
    const k = 95, cdmp = 9.5;
    if (holdT > 0) { holdT -= dt; if (holdT <= 0) S.scaleT = S.target === 'inactive' ? .92 : 1; }
    S.vel += (-k * (S.scale - S.scaleT) - cdmp * S.vel) * dt; S.scale += S.vel * dt;
    const e = Math.min(1, dt * 1.4), e2 = Math.min(1, dt * 3);
    S.mute += (S.muteT - S.mute) * e; S.energy += (S.energyT - S.energy) * e; S.glow += (S.glowT - S.glow) * e; S.rate += (S.rateT - S.rate) * e;
    S.boost *= Math.pow(.2, dt); S.bright *= Math.pow(.35, dt);
    // spawn
    if (S.rate > .2 && !reduce) { S.acc = (S.acc || 0) + S.rate * dt; while (S.acc >= 1) { S.acc -= 1; spawn(1, 0); } }
    nextBurst -= dt; if (nextBurst <= 0) { nextBurst = 2 + Math.random() * 3; if (S.target !== 'inactive') spawn(5, 110, 'gold'); }
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.life += dt; if (p.life >= p.max) { P.splice(i, 1); continue; }
      p.tr.push([p.x, p.y]); if (p.tr.length > 4) p.tr.shift();
      p.w += dt * 5; p.vx += Math.sin(p.w) * 26 * dt; const dr = p.burst ? 1.6 : .4; p.vx -= p.vx * dr * dt; p.vy += (p.burst ? -30 : -8) * dt; p.vy -= p.vy * (p.burst ? 1.2 : .15) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (let i = rings.length - 1; i >= 0; i--) { rings[i].life += dt; if (rings[i].life >= rings[i].max) rings.splice(i, 1); }
  };

  const frame = (now) => {
    raf = 0; if (dead) return;
    if (!host.isConnected) { destroy(); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    step(dt); draw();
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && !dead && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const onVis = () => { if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0 } } else start(); };
  document.addEventListener('visibilitychange', onVis);

  function destroy() { dead = true; if (raf) cancelAnimationFrame(raf); raf = 0; document.removeEventListener('visibilitychange', onVis); P = []; rings = []; }

  const api = {
    setState(s) { setTarget(s === 'inactive' ? 'inactive' : 'idle'); if (reduce) { S.mute = S.muteT; S.energy = S.energyT; S.glow = S.glowT; draw(); } },
    increase() { if (S.target === 'inactive') return; S.vel += 9; S.boost = Math.max(S.boost, 1.1); S.bright = Math.max(S.bright, .55); spawn(26, 170, 'gold'); },
    milestone() { if (S.target === 'inactive') return; S.scaleT = 1.2; holdT = 1.5; S.vel += 15; S.boost = 2.4; S.bright = 1; S.energy = 1.12;
      spawn(110, 260, 'mix'); rings.push({ life: 0, max: 1.1, r: 150, a: 1 }); setTimeout(() => { if (!dead) rings.push({ life: 0, max: 1.1, r: 190, a: .8 }); }, 180); },
    burst(n, p) { spawn(n || 20, p || 180, 'mix'); },
    state: () => S.target,
    destroy
  };
  setTarget(opt.state === 'inactive' ? 'inactive' : 'idle');
  if (opt.state === 'inactive') { S.mute = 1; S.energy = .8; S.glow = .15; S.rate = .5; S.scale = .92; }
  setStops(S.mute); S.lastMute = S.mute;
  for (let i = 0; i < 10; i++) spawn(1, 0);
  step(.016); draw();
  start();
  return api;
}
