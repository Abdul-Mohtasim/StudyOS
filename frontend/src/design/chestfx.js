/* The chest opening, copied from the reference video: a purple page with the chest and "Tap to open!", the lid pops up with a
   burst of sparkles and light, the page goes dark, the prize pops in, lavender bubbles flood the screen and the prize page
   (with bubbles that rise, pop and come back) takes over. Every pop and every new bubble has a small haptic tap.

   const fx = createChestFx({ host, hap, call, icons, done });
   fx.open('early' | 'night')

   call(kind)  -> Promise<{ ok, reward, message }>   (the server decides the prize)
   icons()     -> { gem, freeze } svg strings
   done()      -> called when the player taps CONTINUE */
import lidUrl from './assets/chest_lid.png';
import baseUrl from './assets/chest_base.png';
import potionUrl from './assets/potion.png';
import { playSfx, preloadSfx } from './sfx.js';

const STAR = '<svg viewBox="-1 -1 2 2" aria-hidden="true"><path d="M0 -1Q.09 -.09 1 0Q.09 .09 0 1Q-.09 .09 -1 0Q-.09 -.09 0 -1Z" fill="currentColor"/></svg>';
const BOLT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 2.6 5.2 13.1c-.5.6-.1 1.5.7 1.5h4.2l-1.3 6.2c-.2.8.8 1.2 1.3.6l8.6-10.6c.5-.6.1-1.5-.7-1.5h-4.2l1.2-5.7c.2-.8-.8-1.2-1.4-.5z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
const rnd = (a, b) => a + Math.random() * (b - a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const calmMode = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const LABEL = { early: 'EARLY BIRD', night: 'NIGHT OWL' };

export function createChestFx(env) {
  const { host, hap, esc } = env;
  let busy = false;

  /* ---- little helpers ---- */
  const sparkle = (box, x, y, size, o = {}) => {
    const s = document.createElement('i');
    s.className = 'cx-sp' + (o.cls ? ' ' + o.cls : '');
    s.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;`;
    s.innerHTML = STAR;
    box.appendChild(s);
    return s;
  };
  const petal = (box, x, y) => {
    const p = document.createElement('i');
    p.className = 'cx-pt';
    p.style.cssText = `left:${x}%;top:${y}%;--r:${Math.round(rnd(-50, 50))}deg;--d:${rnd(3.2, 5.2).toFixed(2)}s;animation-delay:${rnd(0, 3).toFixed(2)}s`;
    box.appendChild(p);
  };
  const idleFx = (box) => {
    const spots = [[-14, 18, 20], [96, 14, 14], [112, 54, 18], [-8, 78, 14], [86, 100, 22], [8, -10, 12], [60, -14, 16], [38, 112, 12], [102, 86, 10]];
    spots.forEach(([x, y, sz], i) => {
      const s = sparkle(box, x, y, sz, { cls: 'tw' });
      s.style.setProperty('--d', (1.6 + (i % 4) * .45).toFixed(2) + 's');
      s.style.animationDelay = (i * 0.37).toFixed(2) + 's';
    });
    for (let i = 0; i < 6; i++) petal(box, rnd(-10, 108), rnd(-4, 100));
  };
  const burst = (box, n, big) => {
    for (let i = 0; i < n; i++) {
      const sz = big && i < 2 ? rnd(34, 48) : rnd(10, 26);
      const s = sparkle(box, 50, 46, sz);
      const a = rnd(0, Math.PI * 2), r = rnd(90, 190) * (big && i < 2 ? .5 : 1);
      const dx = Math.cos(a) * r, dy = Math.sin(a) * r - 40;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.1) rotate(0deg)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.2) rotate(20deg)', opacity: 1, offset: .22 },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.5) rotate(90deg)`, opacity: 0 },
      ], { duration: rnd(900, 1500), delay: rnd(0, 160), easing: 'cubic-bezier(.15,.8,.3,1)', fill: 'both' }).onfinish = () => s.remove();
    }
    for (let i = 0; i < Math.round(n / 2); i++) {
      const p = document.createElement('i');
      p.className = 'cx-pt up';
      p.style.cssText = `left:${rnd(20, 80)}%;top:${rnd(30, 60)}%;--r:${Math.round(rnd(-40, 40))}deg`;
      box.appendChild(p);
      p.animate([
        { transform: 'translateY(0) rotate(var(--r)) scale(.6)', opacity: 0 },
        { opacity: 1, offset: .2 },
        { transform: `translateY(${-rnd(150, 300)}px) rotate(calc(var(--r) * 2)) scale(1)`, opacity: 0 },
      ], { duration: rnd(1100, 1800), delay: rnd(0, 300), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }).onfinish = () => p.remove();
    }
  };

  /* ---- the prize page ---- */
  const prizeOf = (rw, icons) => {
    const k = rw && rw.kind;
    if (k === 'xp') {
      const word = rw.mult >= 3 ? 'triple' : 'double';
      return { img: `<img src="${potionUrl}" alt="" draggable="false" decoding="async">`, big: 'x' + (rw.mult || 2), a: `XP Boost activated! Earn ${word} XP for the next`, b: `${rw.minutes} minutes.` };
    }
    if (k === 'freeze') return { img: icons.freeze, big: 'x1', a: 'Streak Freeze added. Your streak is safer now.', b: '' };
    if (k === 'double') return { img: icons.gem, big: 'x2', a: 'Double Gems is on for the next', b: `${Math.round((rw.doubleMin || 60) / 60)} ${(rw.doubleMin || 60) >= 120 ? 'hours.' : 'hour.'}` };
    return { img: icons.gem, big: '+' + (rw && rw.gems || 0), a: 'You found gems in the chest! Spend them in the Gem Shop.', b: '' };
  };

  /* ---- bubbles on the prize page: they rise, pop, and new ones appear (a tiny haptic for each) ---- */
  const bubbles = (layer, H, W, tickHap) => {
    let alive = true, count = 0;
    const live = new Set();
    const spawn = (initial) => {
      if (!alive || count >= 9) return;
      const size = Math.round(rnd(44, 150)), bare = Math.random() < .25;
      const sz = bare ? Math.round(rnd(22, 38)) : size;
      const x = rnd(-.04, .92) * W;
      const y0 = initial ? rnd(.08, .95) * H : H + sz + 10, y1 = -sz - 30;
      const el = document.createElement('div');
      el.className = 'cx-b' + (bare ? ' bare' : '');
      el.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.round(x)}px;top:0`;
      const inner = document.createElement('div');
      inner.className = 'cx-bi';
      inner.innerHTML = bare ? BOLT : (Math.random() < .6 ? '<i></i><span>' + BOLT + '</span>' : '<i></i><u></u>');
      el.appendChild(inner);
      layer.appendChild(el);
      count++;
      const sway = rnd(10, 34) * (Math.random() < .5 ? -1 : 1), dist = y0 - y1;
      const dur = Math.max(2600, dist / rnd(.045, .085));
      const a = el.animate([
        { transform: `translate3d(0,${y0}px,0)`, opacity: initial ? 1 : 0 },
        { transform: `translate3d(${sway * .5}px,${y0 - dist * .12}px,0)`, opacity: 1, offset: .08 },
        { transform: `translate3d(${-sway * .6}px,${y0 - dist * .55}px,0)`, offset: .55 },
        { transform: `translate3d(${sway * .3}px,${y1}px,0)`, opacity: 1 },
      ], { duration: dur, easing: 'linear', fill: 'forwards' });
      let gone = false;
      const remove = () => { if (gone) return; gone = true; live.delete(rec); try { a.cancel(); } catch (e) { /* ignore */ } el.remove(); count--; };
      const rec = { remove };
      live.add(rec);
      const popAt = Math.random() < .8 ? dur * rnd(.18, .85) : dur;
      const t = setTimeout(() => {
        if (!alive || gone) return;
        if (popAt >= dur) { remove(); setTimeout(() => spawn(false), rnd(150, 500)); return; }
        tickHap();
        inner.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.28)', opacity: .9, offset: .4 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 190, easing: 'ease-out', fill: 'forwards' }).onfinish = remove;
        setTimeout(() => { if (alive) { spawn(false); tickHap(); } }, rnd(220, 700));
      }, popAt);
      rec.t = t;
    };
    for (let i = 0; i < 7; i++) setTimeout(() => spawn(true), i * 90);
    const keep = setInterval(() => { if (alive && count < 7) spawn(false); }, 700);
    return () => { alive = false; clearInterval(keep); live.forEach((r) => { clearTimeout(r.t); r.remove(); }); };
  };

  /* ---- the whole experience ---- */
  async function open(kind) {
    if (busy) return;
    busy = true;
    const calm = calmMode();
    const ov = document.createElement('div');
    ov.className = 'cx ' + kind;
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Chest');
    ov.innerHTML = `<div class="cx-bg"></div><div class="cx-dk"></div><div class="cx-fin"><div class="cx-fb"></div></div>
<div class="cx-lab">${esc(LABEL[kind] || 'CHEST')}</div>
<div class="cx-st"><div class="cx-glow"></div><div class="cx-cone"></div><i class="cx-sh"></i>
<div class="cx-ch"><i class="cx-in"></i><img class="cx-base" src="${baseUrl}" alt="" draggable="false" decoding="async"><img class="cx-lid" src="${lidUrl}" alt="" draggable="false" decoding="async"></div>
<div class="cx-fx"></div></div>
<div class="cx-tap">Tap to open!</div>
<div class="cx-wipe"></div><div class="cx-pot"></div>
<div class="cx-rw"><b class="cx-big"></b><p class="cx-cap"></p></div>
<button class="cx-go" type="button">CONTINUE</button>`;
    host.appendChild(ov);
    const q = (s) => ov.querySelector(s);
    const st = q('.cx-st'), ch = q('.cx-ch'), lid = q('.cx-lid'), inn = q('.cx-in'), fx = q('.cx-fx'), glow = q('.cx-glow'), cone = q('.cx-cone');
    const dk = q('.cx-dk'), fin = q('.cx-fin'), pot = q('.cx-pot'), wipe = q('.cx-wipe'), big = q('.cx-big'), cap = q('.cx-cap'), go = q('.cx-go');
    idleFx(fx);
    preloadSfx('chest');
    requestAnimationFrame(() => ov.classList.add('on'));
    hap('light');
    // the server decides the prize while the player looks at the chest
    const pending = Promise.resolve().then(() => env.call(kind)).catch(() => ({ ok: false, message: 'Could not open the chest. Try again.' }));
    let result = null;
    pending.then((r) => { result = r; if (!r || !r.ok) { /* shown when the player taps */ } });
    const idle = ch.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-2.4%)' }, { transform: 'translateY(0)' }], { duration: 2600, iterations: Infinity, easing: 'ease-in-out' });
    const stop = { fn: null };
    const close = () => {
      if (stop.fn) { stop.fn(); stop.fn = null; }
      ov.classList.remove('on');
      setTimeout(() => { ov.remove(); busy = false; }, 280);
      env.setBack && env.setBack(null);
      env.done && env.done();
    };
    env.setBack && env.setBack(() => { if (ov.classList.contains('fin') && go.onclick) go.onclick(); return true; });
    // wait for a tap
    await new Promise((res) => { const f = (e) => { e.stopPropagation(); ov.removeEventListener('click', f); res(); }; ov.addEventListener('click', f); });
    ov.classList.add('go');
    if (!result) { hap('light'); await Promise.race([pending, wait(7000)]); }
    if (!result || !result.ok) {
      env.toast && env.toast((result && result.message) || 'Could not open the chest. Try again.');
      env.failed && env.failed(kind, result);
      idle.cancel(); ov.classList.remove('on'); setTimeout(() => { ov.remove(); busy = false; }, 280);
      env.setBack && env.setBack(null);
      env.done && env.done();
      return;
    }
    env.opened && env.opened(kind, result);
    const rewardPage = prizeOf(result.reward, env.icons());
    playSfx('chest');
    const A = (el, k, o) => el.animate(k, Object.assign({ fill: 'both', easing: 'cubic-bezier(.2,.9,.3,1)' }, o));
    idle.cancel();
    // 0.30  the chest squashes
    await wait(300);
    hap('medium');
    if (!calm) A(ch, [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(4%) scale(1.05,.92)', offset: .5 }, { transform: 'translateY(0) scale(1)' }], { duration: 300, fill: 'none' });
    await wait(200);
    // 0.50  the lid pops up, the inside lights up, sparkles burst
    hap('success');
    A(lid, [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-27%) rotate(-5deg)', offset: .5 }, { transform: 'translateY(-21%) rotate(-3deg)' }], { duration: 520 });
    A(inn, [{ transform: 'scaleY(0)', opacity: 0 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: 360 });
    A(glow, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 600 });
    A(cone, [{ opacity: 0 }, { opacity: 1 }], { duration: 700 });
    if (!calm) burst(fx, 18, true);
    await wait(450);
    // 0.95  the chest floats up while the light grows
    if (!calm) { A(ch, [{ transform: 'translateY(0)' }, { transform: 'translateY(-9%)' }], { duration: 800 }); burst(fx, 8, false); }
    A(glow, [{ opacity: 1 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.25)' }], { duration: 800 });
    await wait(300);
    // 1.25  the dark comes down from the top
    A(dk, [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }], { duration: 850, easing: 'cubic-bezier(.4,0,.2,1)' });
    A(st, [{ opacity: 1, transform: 'translateX(-50%) scale(1)' }, { opacity: 0, transform: 'translateX(-50%) scale(.92)' }], { duration: 750, delay: 250, easing: 'ease-in' });
    await wait(1050);
    ov.classList.add('dark');
    // 2.35  the prize pops in on the dark page
    pot.innerHTML = rewardPage.img;
    big.textContent = rewardPage.big;
    cap.innerHTML = `<span>${esc(rewardPage.a)}</span>${rewardPage.b ? ' <em>' + esc(rewardPage.b) + '</em>' : ''}`;
    A(pot, [{ opacity: 0, transform: 'translate(-50%,0) scale(.5)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1.1)', offset: .65 }, { opacity: 1, transform: 'translate(-50%,0) scale(1)' }], { duration: 520 });
    hap('medium');
    await wait(520);
    // 2.85  lavender bubbles rise from the bottom right and flood the page
    const sizes = [[90, 78, 8], [150, 64, 22], [64, 88, 40], [270, 40, 4], [420, 30, 0], [620, 18, -6]];
    sizes.forEach(([s, x, y], i) => {
      const b = document.createElement('i');
      b.className = 'cx-wb';
      b.style.cssText = `width:${s}px;height:${s}px;right:${-Math.round(s * (.15 + x / 400))}px;bottom:${-Math.round(s * (.3 - y / 200))}px`;
      wipe.appendChild(b);
      if (s > 100) setTimeout(() => hap('tick'), i * 95);
      A(b, [{ transform: 'scale(0)', opacity: .95 }, { transform: 'scale(1)', opacity: .95 }], { duration: 520 + i * 40, delay: i * 95, easing: 'cubic-bezier(.2,.75,.3,1)' });
    });
    const flood = document.createElement('i');
    flood.className = 'cx-flood';
    wipe.appendChild(flood);
    A(flood, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 480, easing: 'ease-in' });
    fin.style.opacity = '0';
    await wait(700);
    // 3.55  the prize page appears under the bubbles
    ov.classList.add('fin');
    A(fin, [{ opacity: 0 }, { opacity: 1 }], { duration: 420 });
    A(wipe, [{ opacity: 1 }, { opacity: 0 }], { duration: 520, delay: 120 });
    await wait(250);
    big.style.opacity = '0';
    A(big, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1.18)', offset: .6 }, { opacity: 1, transform: 'scale(1)' }], { duration: 480 });
    hap('success');
    await wait(170);
    A(cap, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 420 });
    await wait(260);
    A(go, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 440 });
    go.style.pointerEvents = 'auto';
    let lastTick = 0;
    stop.fn = bubbles(q('.cx-fb'), ov.clientHeight || 700, ov.clientWidth || 360, () => { const n = performance.now(); if (n - lastTick > 90) { lastTick = n; hap('tick'); } });
    go.onclick = () => { go.onclick = null; hap('light'); close(); };
  }
  return { open, busy: () => busy };
}
