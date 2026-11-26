/* eslint-disable */
// StudyOS intro pages (4 pages): scenery, glass cards, and a live flame mascot on every page.
// mountIntro(host, { onLogin, onStart, onPage }) draws the pages into `host` (a div with class "ix") and returns { back, go, destroy }.
//   - Get started / Next / Skip slide the pages to the left; swipe or arrow keys also work.
//   - Last page: Get started and Create account call onStart (the mascot's question pages); Sign in calls onLogin.
//   - Every class name starts with ix-, so the styles in introCss.js cannot touch the rest of the app.
//   - The mascot is drawn once per page and only its changed attributes are patched each frame (mascot/svgpatch.js);
//     the frame rate adapts to the device, off-screen pages pause, and reduced motion shows one still pose.
import { oi } from "../icons/introIcons.js";
import { SCENES } from "./scenes.js";
import { INTRO_CSS } from "./introCss.js";
import "../mascot/flame_rig.js";
import "../mascot/flame_actions.js";
import "../mascot/flame_poses.js";
import { SvgPatcher, Governor, PoseCache } from "../mascot/svgpatch.js";

const ICON_KEYS = ["tasks", "planner", "hourglass", "timer", "flame", "notes", "cards", "grades", "maths", "physics", "chem", "bio", "english", "code", "history", "other", "offline", "sync", "bell", "mail"];
let cssInjected = false;

export function mountIntro(host, opts = {}) {
  const G = globalThis, FlameRig = G.FlameRig, ACT = G.FLAME_ACTIONS, doc = host.ownerDocument || document;
  if (!FlameRig || !ACT) return { back: () => false, go() {}, pause() {}, destroy() {} };
  if (!cssInjected || !doc.getElementById("ix-style")) {
    const old = doc.getElementById("ix-style"); if (old) old.remove();
    const s = doc.createElement("style"); s.id = "ix-style"; s.textContent = INTRO_CSS; doc.head.appendChild(s); cssInjected = true;
  }
  const IC = {}; ICON_KEYS.forEach((k) => { IC[k] = oi(k); });
  const GOV = new Governor();

  const BI = {
    start: '<svg class="ix-bi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9.5" cy="8" r="3.7"/><path d="M3 20c.5-3.7 3.1-5.8 6.5-5.8 1.7 0 3.1.5 4.2 1.3"/><path d="M18 10.5v6.5M14.8 13.8h6.4"/></svg>',
    login: '<svg class="ix-bi" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4.5h3.2A2.8 2.8 0 0 1 20 7.3v9.4a2.8 2.8 0 0 1-2.8 2.8H14"/><path d="M4 12h10.2"/><path d="M10.4 8l4 4-4 4"/></svg>'
  };
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="#25202b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  let n = 0;
  const st = () => `style="--i:${n++}"`;
  const dots = (k) => `<div class="ix-dots">${[1, 2, 3, 4].map((i) => `<i class="${i === k ? 'ix-on' : ''}"></i>`).join('')}</div>`;
  const trow = (k, skip) => `<div class="ix-trow ix-rv" ${st()}>${dots(k)}${skip ? '<span class="ix-skip">Skip</span>' : ''}</div>`;
  const head = (t, d, e) => `<div class="ix-hb">${e ? `<div class="ix-eyebrow ix-rv" ${st()}>${e}</div>` : ''}<h2 class="ix-rv" ${st()}>${t}</h2><p class="ix-lead ix-rv" ${st()}>${d}</p></div>`;
  const card = (k, t, d) => `<div class="ix-card ix-glass ix-rv" ${st()}>${IC[k]}<div><b>${t}</b><small>${d}</small></div></div>`;
  const next = () => `<div class="ix-bot"><div class="ix-cta ix-a ix-big ix-rv" ${st()}><span>Next</span><span class="ix-arrow">${arrow}</span></div></div>`;
  
  /* only the eyes of the start-screen owl (same drawing as the app's boot splash): no tile, no fill, no border */
  const APPICON = `<svg class="ix-appicon" viewBox="50 68 190 136" aria-hidden="true"><path d="M144 116C134 106 120 102 110 100C108 94 106 90 104 84C100 92 96 98 92 100C90 92 88 82 84 72C74 86 62 100 56 116C50 132 50 150 54 164C62 188 82 200 104 200C122 200 134 194 144 188C154 194 166 200 184 200C206 200 226 188 234 164C238 150 238 132 232 116C226 100 214 86 204 72C200 82 198 92 196 100C192 98 188 92 184 84C182 90 180 94 178 100C168 102 154 106 144 116Z" fill="#7A3B1D"/><rect x="75" y="110" width="54" height="72" rx="26" fill="#FFFFFF"/><rect x="159" y="110" width="54" height="72" rx="26" fill="#FFFFFF"/><ellipse cx="109" cy="148" rx="15" ry="21" fill="#4A2412"/><ellipse cx="104" cy="138" rx="5.5" ry="7" fill="#FFFFFF"/><ellipse cx="179" cy="148" rx="15" ry="21" fill="#4A2412"/><ellipse cx="174" cy="138" rx="5.5" ry="7" fill="#FFFFFF"/></svg>`;
  
  /* scene-space extras (SVG, same coordinates as the scene): sleeping Zs and the seed pile */
  const ZZ = (cx, foot) => `<g class="ix-zzg" transform="translate(${cx + 2} ${foot - 33})"><text class="ix-z" x="0" y="0">z</text><text class="ix-z" x="0" y="0" style="font-size:15px">z</text><text class="ix-z" x="0" y="0" style="font-size:19px">Z</text></g>`;
  const SEEDS = (cx, foot) => `<g transform="translate(${cx - 44} ${foot - 16}) scale(1.1)"><ellipse cx="40" cy="25" rx="30" ry="4.4" fill="#000" opacity=".12"/><path d="M12 25Q22 10 40 9Q58 10 68 25Z" fill="#D9B27A"/><path d="M20 25Q30 15 42 14Q54 15 62 25Z" fill="#E8C792"/><g fill="#8A5A2B"><ellipse cx="28" cy="20" rx="3" ry="1.8" transform="rotate(-20 28 20)"/><ellipse cx="38" cy="15" rx="3" ry="1.8" transform="rotate(15 38 15)"/><ellipse cx="50" cy="19" rx="3" ry="1.8" transform="rotate(-10 50 19)"/><ellipse cx="44" cy="23" rx="3" ry="1.8"/><ellipse cx="33" cy="24" rx="3" ry="1.8" transform="rotate(25 33 24)"/></g></g>`;
  
  const PAGES = [
    { p: 'ix-p1', scene: 'autumn', act: 'perch', pal: 'ember', cx: 176, foot: 430, Wm: 190, strip: 1, ent: 'drop', cap: '1. Welcome',
      note: 'Sits on a branch of the big tree: looks around, waves, swings a foot',
      html: () => { n = 0; return `<div class="ix-ct"><div class="ix-brow ix-rv" ${st()}><div class="ix-brand">${APPICON}<span>Study<em>OS</em></span></div></div>
    ${head('Plan, focus and learn in one calm place.', 'Tasks, notes, flashcards and a focus timer that work even without internet.', 'Your study companion')}
    <div class="ix-cbody"><div class="ix-mini ix-rv" ${st()}><div class="ix-mi"><svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#E0581A" stroke-width="2.6" stroke-linejoin="round"><rect x="7" y="6" width="11" height="14" rx="2.4"/><rect x="22" y="6" width="11" height="7" rx="2.4"/><rect x="22" y="17" width="11" height="9" rx="2.4"/><rect x="7" y="24" width="11" height="6" rx="2.4"/></g><g fill="#E0581A"><circle cx="11" cy="35" r="1.9"/><circle cx="20" cy="35" r="1.9"/><circle cx="29" cy="35" r="1.9"/></g></svg></div><div class="ix-mt"><b>Everything in one place.</b><small>Keep your study life organized, simple and stress-free.</small></div></div></div>
    <div class="ix-mz"></div>
    <div class="ix-bot"><div class="ix-dots ix-dots-b ix-rv" ${st()}>${[1, 2, 3, 4].map((i) => `<i class="${i === 1 ? 'ix-on' : ''}"></i>`).join('')}</div><div class="ix-cta ix-a ix-big ix-rv" ${st()}><span>Get started</span><span class="ix-arrow">${arrow}</span></div><div class="ix-sign ix-rv" ${st()}>Already have an account? <u data-login>Sign in</u></div></div></div>`; } },
    { p: 'ix-p2', scene: 'twilight', act: 'doze', pal: 'night', cx: 112, foot: 490, Wm: 185, strip: 1, noEmb: 1, ent: 'fade', cap: '2. Plan and focus',
      note: 'Sleeps on a tree stump in the snow: breathes, snores, and a z z Z floats out of its mouth at every snore', extra: ZZ(112, 490), snore: { cycle: 3.6, fire: 1.3 },
      html: () => { n = 0; return `<div class="ix-ct">${trow(2, true)}${head('Plan your day and stay focused', 'Everything you need to plan your week and stay on track.', 'Plan and focus')}
    <div class="ix-cbody">${card('tasks', 'Tasks', 'Subject, priority and due date')}${card('planner', 'Weekly planner', 'Lay out your week day by day')}${card('hourglass', 'Exam countdowns', 'Watch the days count down')}${card('timer', 'Focus timer', 'Study and break rounds')}${card('flame', 'Daily goals and streaks', 'Keep your study streak alive')}</div>
    <div class="ix-mz"></div>${next()}</div>`; } },
    { p: 'ix-p3', scene: 'meadow', act: 'eat', pal: 'forest', cx: 150, foot: 506, Wm: 195, strip: 0, ent: 'slide', cap: '3. Learn and remember',
      note: 'Crouches on the meadow, picks up seeds, eats them and switches hands', extra: SEEDS(150, 506),
      html: () => { n = 0; return `<div class="ix-ct">${trow(3, true)}${head('Learn, remember and track progress', 'Notes, flashcards and grades for every subject.', 'Learn and remember')}
    <div class="ix-cbody">${card('notes', 'Notes', 'Write and pin notes')}${card('cards', 'Flashcards', 'Spaced repetition review')}${card('grades', 'Grades and analytics', 'See your progress over time')}
    <div class="ix-sub ix-glass ix-rv" ${st()}><div class="ix-t">Made for every subject</div><div class="ix-g">${[['maths', 'Maths'], ['physics', 'Physics'], ['chem', 'Chemistry'], ['bio', 'Biology'], ['english', 'English'], ['code', 'Computing'], ['history', 'History'], ['other', 'Any other']].map(([k, t]) => `<div class="ix-c">${IC[k]}<span>${t}</span></div>`).join('')}</div></div></div>
    <div class="ix-mz"></div>${next()}</div>`; } },
    { p: 'ix-p4', scene: 'coast', act: 'greet', pal: 'sunset', cx: 110, foot: 444, Wm: 200, strip: 1, ent: 'pop', cap: '4. Study anywhere and sign up',
      note: 'Stands on the cliff at sunset: waves, thumbs up, small hop',
      html: () => { n = 0; return `<div class="ix-ct">${trow(4, false)}${head('Study anywhere, any time', 'Works offline and syncs when you are back online.', 'Study anywhere')}
    <div class="ix-cbody"><div class="ix-tiles"><div class="ix-tile ix-glass ix-rv" ${st()}>${IC.offline}<b>Works offline</b><small>Saved on your phone</small></div><div class="ix-tile ix-glass ix-rv" ${st()}>${IC.sync}<b>Auto sync</b><small>Updates by itself</small></div><div class="ix-tile ix-glass ix-rv" ${st()}>${IC.bell}<b>Reminders</b><small>At times you choose</small></div><div class="ix-tile ix-glass ix-rv" ${st()}>${IC.mail}<b>Email updates</b><small>Optional summaries</small></div></div></div>
    <div class="ix-mz"></div>
    <div class="ix-bot"><div class="ix-cta ix-a ix-rv" data-start ${st()}>${BI.start}<span>Get started</span></div><div class="ix-cta ix-w ix-rv" data-login ${st()}>${BI.login}<span>I already have an account</span></div></div></div></div>`; } }
  ];


  /* ---------- weather and air: one small canvas per page (leaves in the wind, snow, petals and seeds, glowing sparks) ----------
     Only the page you are looking at is drawn. Particles are plain shapes or one cached soft sprite, so a frame costs well under a millisecond. */
  const FXKIND = { autumn: "leaf", twilight: "snow", meadow: "petal", coast: "spark" };
  const FXN = { leaf: 15, snow: 85, petal: 22, spark: 28 };
  function makeFx(canvas, kind) {
    if (!canvas || typeof canvas.getContext !== "function") return null;
    const ctx = canvas.getContext("2d"); if (!ctx) return null;
    const R = Math.random, TAU = Math.PI * 2, dir = kind === "leaf" ? -1 : 1;
    const LEAF = ["#E8782A", "#F2A33A", "#C75B1B", "#D9531E", "#F4B55A"], PET = ["#FFB3CB", "#FFFFFF", "#FFE27A", "#E6C9FF"];
    const spr = (() => { const s = doc.createElement("canvas"); s.width = s.height = 32; const x = s.getContext("2d"); if (!x) return null;
      const rgb = kind === "snow" ? "255,255,255" : kind === "spark" ? "255,226,160" : "255,250,214";
      const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, "rgba(" + rgb + ",1)"); g.addColorStop(.45, "rgba(" + rgb + ",.55)"); g.addColorStop(1, "rgba(" + rgb + ",0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return s; })();
    let W = 0, H = 0, dpr = 1, t = 0, mult = 1, ps = [], ws = [];
    const gust = () => Math.max(0, Math.sin(t * .45) * Math.sin(t * .19 + 1.1));
    function spawn(p, init) {
      const s = W / 360;
      if (kind === "leaf") { p.s = (4.5 + R() * 5) * s; p.vy = (24 + R() * 26) * s; p.x = init ? R() * W : W * (.4 + R() * .7); p.y = init ? R() * H : -20 * s; p.ph = R() * TAU; p.sw = (8 + R() * 16) * s; p.rot = R() * TAU; p.spin = (R() - .5) * 3; p.fl = R() * TAU; p.c = LEAF[(R() * LEAF.length) | 0]; }
      else if (kind === "snow") { const L = R(); p.l = L < .5 ? 0 : L < .85 ? 1 : 2; p.s = [1.1 + R() * .7, 1.9 + R() * .8, 3 + R() * 1.6][p.l] * s; p.vy = [16 + R() * 10, 30 + R() * 14, 52 + R() * 26][p.l] * s; p.x = R() * W; p.y = init ? R() * H : -8 * s; p.ph = R() * TAU; p.sw = [5, 10, 16][p.l] * s * (.6 + R() * .8); p.a = [.55, .8, .92][p.l]; }
      else if (kind === "petal") { p.s = (3 + R() * 3.2) * s; p.vy = (7 + R() * 14) * s; p.x = init ? R() * W : -12 * s; p.y = init ? R() * H * .85 : R() * H * .8; p.ph = R() * TAU; p.sw = (6 + R() * 12) * s; p.rot = R() * TAU; p.spin = (R() - .5) * 4; p.c = PET[(R() * PET.length) | 0]; p.seed = R() < .3; }
      else { p.s = (2.2 + R() * 4.2) * s; p.vy = -(7 + R() * 16) * s; p.x = R() * W; p.y = init ? H * (.3 + R() * .7) : H * (.8 + R() * .25); p.ph = R() * TAU; p.sw = (4 + R() * 9) * s; p.tw = 1.4 + R() * 2.4; }
      return p;
    }
    function setN(m) { mult = m; const n = Math.max(4, Math.round(FXN[kind] * Math.min(1.5, Math.max(.6, (W * H) / (360 * 780))) * m)); while (ps.length < n) ps.push(spawn({}, true)); if (ps.length > n) ps.length = n; }
    function step(dt) {
      t += dt; const g = gust(), s = W / 360;
      for (const p of ps) {
        if (kind === "leaf") { p.y += p.vy * dt * (1 + g * .35); p.x += (Math.sin(p.ph + t * 1.5) * p.sw + dir * (10 + g * 70) * s) * dt; p.rot += p.spin * dt * (1 + g * 1.5); p.fl += dt * 3.2; if (p.y > H + 16 * s || p.x < -30 * s) spawn(p, false); }
        else if (kind === "snow") { p.y += p.vy * dt; p.x += (Math.sin(p.ph + t * (.8 + p.l * .3)) * p.sw * .6 + (4 + p.l * 3) * s) * dt; if (p.y > H + 8 * s) spawn(p, false); else if (p.x > W + 10 * s) p.x = -10 * s; }
        else if (kind === "petal") { p.x += (22 + g * 90 + Math.sin(p.ph + t) * 8) * s * dt; p.y += (p.vy + Math.sin(p.ph + t * 1.7) * p.sw * .8) * dt; p.rot += p.spin * dt; if (p.x > W + 16 * s || p.y > H + 10) spawn(p, false); }
        else { p.y += p.vy * dt; p.x += Math.sin(p.ph + t * .9) * p.sw * dt; if (p.y < -10 * s) spawn(p, false); }
      }
      if ((kind === "leaf" || kind === "petal") && g > .4 && ws.length < 3 && R() < dt * 1.4) ws.push({ x: dir > 0 ? -30 : W + 30, y: H * (.12 + R() * .5), len: (70 + R() * 90) * s, v: (190 + R() * 120) * s * dir, life: 0, max: 1.8 + R(), amp: (5 + R() * 8) * s, ph: R() * TAU });
      for (let i = ws.length - 1; i >= 0; i--) { const w = ws[i]; w.x += w.v * dt; w.life += dt; if (w.life > w.max) ws.splice(i, 1); }
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); const s = W / 360;
      for (const w of ws) {
        const a = Math.sin(Math.PI * w.life / w.max) * .5; if (a <= .01) continue;
        ctx.strokeStyle = "rgba(255,255,255," + a.toFixed(3) + ")"; ctx.lineWidth = 1.5 * s; ctx.lineCap = "round"; ctx.beginPath();
        for (let i = 0; i <= 7; i++) { const u = i / 7, x = w.x - dir * w.len * u, y = w.y + Math.sin(w.ph + u * 5 - t * 3) * w.amp * u; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      }
      for (const p of ps) {
        if (kind === "leaf") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, .3 + .7 * Math.abs(Math.cos(p.fl))); ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.quadraticCurveTo(p.s * .85, -p.s * .1, 0, p.s); ctx.quadraticCurveTo(-p.s * .85, -p.s * .1, 0, -p.s); ctx.fill();
          ctx.strokeStyle = "rgba(110,45,10,.45)"; ctx.lineWidth = .8 * s; ctx.beginPath(); ctx.moveTo(0, -p.s * .9); ctx.lineTo(0, p.s * .9); ctx.stroke(); ctx.restore();
        } else if (kind === "snow") { if (spr) { ctx.globalAlpha = p.a; ctx.drawImage(spr, p.x - p.s * 1.6, p.y - p.s * 1.6, p.s * 3.2, p.s * 3.2); } }
        else if (kind === "petal") {
          if (p.seed) { if (spr) { ctx.globalAlpha = .8; ctx.drawImage(spr, p.x - p.s * 1.5, p.y - p.s * 1.5, p.s * 3, p.s * 3); } }
          else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = .92; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, TAU); ctx.fill(); ctx.restore(); }
        } else if (spr) { ctx.globalAlpha = .25 + .75 * (.5 + .5 * Math.sin(t * p.tw + p.ph)); ctx.drawImage(spr, p.x - p.s * 1.5, p.y - p.s * 1.5, p.s * 3, p.s * 3); }
      }
      ctx.globalAlpha = 1;
    }
    function resize(w, h, d) { if (!w || !h) return; const first = !W; W = w; H = h; dpr = d; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); if (first) { ps = []; } setN(mult); }
    return { resize, step, draw, setN };
  }

  /* ---------- build the four pages: scene and mascot live in the same SVG, so they scale together on every screen ---------- */
  const row = doc.createElement("div"); row.className = "ix-row ix-flow ix-nt"; host.appendChild(row);
  let dead = false, raf = 0, last = 0, paused = false;
  const reduce = !!(G.matchMedia && G.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const live = [], cols = [], poseCache = new PoseCache();
  const staticPose = (m) => poseCache.get(m.act + "|" + m.pal, () => { const s = FlameRig.Sim(ACT, m.act); s.opts({ noEmb: true }); for (let i = 0; i < 120; i++) s.step(1 / 60); FlameRig.setPalette(m.pal); return s.svg(); });
  const place = (m, s) => { if (m.strip) s = s.replace(/<ellipse[^>]*cy="197"[^>]*\/>/, ""); return s.replace('width="100%" height="100%"', m.attr); };
  PAGES.forEach((pg, i) => {
    const H = pg.Wm * 330 / 340, left = pg.cx - pg.Wm / 2, top = pg.foot - .9118 * pg.Wm + 2;
    const attr = `x="${left.toFixed(1)}" y="${top.toFixed(1)}" width="${pg.Wm}" height="${H.toFixed(1)}" style="overflow:visible"`;
    const mascotG = `<g class="ix-mk"><g class="ix-mw"></g>${pg.extra || ""}</g>`;
    let scene = SCENES[pg.scene]().replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="xMidYMax slice"').replace(/(<rect y="\d+" width="300" height="\d+" fill="url\(#[\w-]+d\)"\/>)<\/svg>\s*$/, mascotG + "$1</svg>");
    if (scene.indexOf("ix-mw") < 0) scene = scene.replace(/<\/svg>\s*$/, mascotG + "</svg>");
    const col = doc.createElement("div"); col.className = "ix-col"; col.dataset.i = i; col.style.setProperty("--pi", i);
    col.innerHTML = `<div class="ix-ph ${pg.p} ix-ent-${pg.ent}"><div class="ix-bg">${scene}</div><canvas class="ix-fx" aria-hidden="true"></canvas>${pg.html()}</div>`;
    row.appendChild(col); cols.push(col);
    const ph = col.querySelector(".ix-ph"), mw = col.querySelector(".ix-mw");
    const sim = FlameRig.Sim(ACT, pg.act); sim.opts({ noEmb: !!pg.noEmb });
    for (let k = 0; k < 24; k++) sim.step(1 / 60);
    live.push({ ph, host: mw, mk: col.querySelector(".ix-mk"), pg, k: 1, sim, patch: new SvgPatcher(mw), pal: pg.pal, act: pg.act, strip: pg.strip, attr, vis: true, acc: 0, t: 24 / 60, sp: undefined, isCur: false, fxAcc: 0, fx: reduce ? null : makeFx(col.querySelector(".ix-fx"), FXKIND[pg.scene]) });
  });
  row.querySelectorAll(".ix-cta, .ix-skip, [data-login]").forEach((el) => { el.setAttribute("role", "button"); el.setAttribute("tabindex", "0"); });
  const draw = (m) => { FlameRig.setPalette(m.pal); const s = place(m, m.sim.svg()); if (s === m.last) return; m.last = s; m.patch.update(s); };
  live.forEach(draw);

  /* ---------- the mascot lives in its own space: scaled about its feet to fit between the content and the buttons (never hidden: 85% at the smallest on normal phones, 66% on short screens) ---------- */
  const MIN_K = .85;
  const fit = (m) => {
    const ph = m.ph, W = ph.clientWidth, H = ph.clientHeight; if (!W || !H || !m.mk) return;
    const pg = m.pg, s = Math.max(W / 300, H / 650);
    const footY = H - (650 - pg.foot) * s, full = .9118 * pg.Wm * s, gap = W * .024;
    const last = ph.querySelector(".ix-cbody") || ph.querySelector(".ix-hb");
    if (!last) return;
    const minK = H / W < 2 ? .66 : MIN_K;   // short screens may scale the mascot down a little more so it stays clear of the text
    const k = Math.max(minK, Math.min(1, (footY - (last.offsetTop + last.offsetHeight) - gap) / full));
    if (m.fx) m.fx.resize(W, H, Math.min(G.devicePixelRatio || 1, GOV.floor >= 2 ? 1 : 2));
    m.k = k; m.mk.setAttribute("transform", `translate(${pg.cx} ${pg.foot}) scale(${k.toFixed(3)}) translate(${-pg.cx} ${-pg.foot})`);
  };
  const fitAll = () => live.forEach(fit);
  let ro = null, io = null;
  if (G.ResizeObserver) { ro = new ResizeObserver(fitAll); live.forEach((m) => ro.observe(m.ph)); }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { if (!dead) fitAll(); });
  if (G.IntersectionObserver) { io = new IntersectionObserver((es) => es.forEach((e) => { const m = live.find((x) => x.ph === e.target); if (m) m.vis = e.isIntersecting; }), { threshold: 0 }); live.forEach((m) => io.observe(m.ph)); }

  /* ---------- one loop for all mascots: adaptive frame rate, off-screen pause, unchanged frames skipped ---------- */
  let tier = GOV.tier;
  /* sleeping page: every snore (once per 3.6 s breathing cycle) a "z z Z" floats out of the mouth */
  const burst = (m) => m.ph.querySelectorAll(".ix-z").forEach((z, i) => { z.style.animation = "none"; void z.getBoundingClientRect(); z.style.animation = "ix_zz 2.8s ease-out " + (i * .55).toFixed(2) + "s 1 both"; });
  const snoreCheck = (m) => { const s = m.pg.snore, ph = m.t % s.cycle; if (m.sp !== undefined && ph >= s.fire && m.sp < s.fire && m.isCur) burst(m); m.sp = ph; };
  const frame = (now) => {
    raf = 0; if (dead) return;
    const dt = Math.min(.05, last ? (now - last) / 1000 : 1 / 60); last = now;
    if (!doc.hidden && !paused) {
      const t0 = performance.now(); let drew = false;
      for (const m of live) {
        if (!m.vis) continue;
        m.acc += dt;
        const a = ACT[m.sim.action], cap = Math.min(GOV.fps, (a && a.fps) || 60);
        if (m.fx && (m.isCur || m.hold)) {   // weather: only on the page you are looking at
          m.fxAcc += dt;
          if (m.fxAcc >= (1 / Math.min(GOV.fps, 60)) * .92) { m.fx.step(Math.min(.1, m.fxAcc)); m.fx.draw(); m.fxAcc = 0; drew = true; }
        }
        if (m.acc < (1 / cap) * .92) continue;
        let r = m.acc; m.acc = 0; while (r > 0) { const s = Math.min(r, 1 / 60); m.sim.step(s); m.t += s; r -= s; }
        draw(m); drew = true;
        if (m.pg.snore) snoreCheck(m);
      }
      if (tier !== GOV.tier) { tier = GOV.tier; live.forEach((m) => { if (m.fx) m.fx.setN(tier >= 2 ? .5 : tier === 1 ? .75 : 1); }); }
      if (drew) GOV.sample(performance.now() - t0);
    }
    raf = requestAnimationFrame(frame);
  };
  if (reduce) { live.forEach((m) => { m.host.innerHTML = place(m, staticPose(m)); }); } else raf = requestAnimationFrame(frame);

  /* ---------- the flow: Get started / Next / Skip slide the pages to the left ---------- */
  let cur = -1;
  const replay = (i) => { const ph = cols[i].querySelector(".ix-ph"); ph.classList.remove("ix-go"); void ph.offsetWidth; ph.classList.add("ix-go"); };
  /* while pages slide, all four are drawn; the rest of the time only the page you are on is (the others are hidden by the stylesheet) */
  let moveT = 0; const timers = [];
  const later = (fn, ms) => { const t = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(t); return t; };
  const moving = () => { row.classList.add("ix-moving"); clearTimeout(moveT); moveT = setTimeout(() => row.classList.remove("ix-moving"), 780); };
  const setCur = (i, anim) => {
    const was = cur; cur = Math.max(0, Math.min(PAGES.length - 1, i));
    row.classList.toggle("ix-nt", !anim); row.style.setProperty("--cur", cur);
    cols.forEach((c, k) => c.classList.toggle("ix-cur", k === cur));
    live.forEach((m, k) => { m.isCur = k === cur; if (anim && k === was && was !== cur) { m.hold = true; later(() => { m.hold = false; }, 900); } });
    if (anim) moving(); 
    fitAll();
    if (anim) later(() => replay(cur), 90); else replay(cur);
    if (was !== cur && opts.onPage) opts.onPage(cur);
  };
  const go = (i) => { if (cur < 0 || i === cur || i < 0 || i >= PAGES.length) return; void row.offsetWidth; setCur(i, true); };
  const onClick = (e) => {
    const t = e.target; if (!t || !t.closest) return;
    if (Date.now() - lastDrag < 380) return;
    if (t.closest("[data-login]")) { if (opts.onLogin) opts.onLogin(); return; }
    if (t.closest("[data-start]")) { if (opts.onStart) opts.onStart(); return; }
    const btn = t.closest(".ix-cta, .ix-skip"); if (!btn) return;
    const col = btn.closest(".ix-col"); if (!col) return;
    const idx = +col.dataset.i, lastI = PAGES.length - 1; if (idx !== cur) return;
    if (btn.classList.contains("ix-skip")) go(lastI);
    else if (btn.classList.contains("ix-big") && idx < lastI) go(idx + 1);
  };
  const onKey = (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target && e.target.getAttribute && e.target.getAttribute("role") === "button" && host.contains(e.target)) { e.preventDefault(); e.target.click(); return; }
    if (!host.contains(doc.activeElement) && doc.activeElement !== doc.body) return;
    if (e.key === "ArrowRight") go(cur + 1); else if (e.key === "ArrowLeft") go(cur - 1);
  };
  /* swipe: the pages follow your finger. Let go past a fifth of the width (or flick fast) and the next page settles in; otherwise they spring back.
     The first and last page pull back with resistance. */
  let tx = 0, ty = 0, tt = 0, axis = 0, dxv = 0, dragRaf = 0, lastDrag = 0, pw = 360;
  const setDx = (v) => row.style.setProperty("--dx", v.toFixed(1) + "px");
  const onTs = (e) => { const p = e.changedTouches && e.changedTouches[0]; if (!p || cur < 0) return; tx = p.clientX; ty = p.clientY; tt = Date.now(); axis = 0; dxv = 0; pw = row.clientWidth || host.clientWidth || 360; };
  const onTm = (e) => {
    const p = e.changedTouches && e.changedTouches[0]; if (!p || cur < 0) return;
    const ddx = p.clientX - tx, ddy = p.clientY - ty;
    if (!axis) { if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return; axis = Math.abs(ddx) > Math.abs(ddy) * 1.2 ? 1 : 2; if (axis === 1) { row.classList.add("ix-drag", "ix-moving"); clearTimeout(moveT); } }
    if (axis !== 1) return;
    let v = ddx; if ((cur === 0 && v > 0) || (cur === PAGES.length - 1 && v < 0)) v *= .28;
    dxv = Math.max(-pw, Math.min(pw, v));
    if (!dragRaf) dragRaf = requestAnimationFrame(() => { dragRaf = 0; setDx(dxv); });
  };
  const onTe = (e) => {
    const p = e.changedTouches && e.changedTouches[0]; if (!p) return;
    if (axis !== 1) { axis = 0; return; }
    axis = 0; lastDrag = Date.now();
    const ddx = p.clientX - tx, dt = Math.max(1, Date.now() - tt), vel = ddx / dt;
    let target = cur; if (Math.abs(ddx) > pw * .2 || (Math.abs(vel) > .45 && Math.abs(ddx) > 24)) target = cur + (ddx < 0 ? 1 : -1);
    target = Math.max(0, Math.min(PAGES.length - 1, target));
    if (dragRaf) { cancelAnimationFrame(dragRaf); dragRaf = 0; }
    setDx(dxv); void row.offsetWidth;              // lock the dragged position, then let the transition take over
    row.classList.remove("ix-drag"); setDx(0);
    if (target !== cur) setCur(target, true); else moving();
  };
  row.addEventListener("click", onClick); row.addEventListener("keydown", onKey);
  row.addEventListener("touchstart", onTs, { passive: true }); row.addEventListener("touchmove", onTm, { passive: true }); row.addEventListener("touchend", onTe, { passive: true }); row.addEventListener("touchcancel", onTe, { passive: true });
  setCur(0, false);

  /* The rig's colours are shared with every other mascot in the app: put them back when the intro closes. */
  const restorePalette = () => { const p = doc.documentElement.getAttribute("data-palette"); FlameRig.setPalette(p === "ocean" || p === "forest" || p === "sunset" ? p : "ember"); };
  return {
    back() { if (cur > 0) { go(cur - 1); return true; } return false; },
    go,
    pause(on) { paused = !!on; host.classList.toggle("ix-paused", paused); },
    destroy() {
      dead = true; if (raf) cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect();
      row.removeEventListener("click", onClick); row.removeEventListener("keydown", onKey); row.removeEventListener("touchstart", onTs); row.removeEventListener("touchmove", onTm); row.removeEventListener("touchend", onTe); row.removeEventListener("touchcancel", onTe); timers.forEach(clearTimeout); clearTimeout(moveT); if (dragRaf) cancelAnimationFrame(dragRaf);
      row.remove(); restorePalette();
    }
  };
}
