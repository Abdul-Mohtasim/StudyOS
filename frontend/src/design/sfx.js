/* Short sound effects (chest opening, nudge, league climb) played with Web Audio so they start at an exact moment.
   preloadSfx(name)   fetch + decode once (cached)
   playSfx(name)      start it now; if it is still loading it starts as soon as it is ready (up to 700 ms later) */
import chestUrl from './assets/chest_open.mp3';
import nudgeUrl from './assets/nudge.mp3';
import leagueUrl from './assets/league_up.mp3';

const URLS = { chest: chestUrl, nudge: nudgeUrl, league: leagueUrl };
let AC = null;
const BUF = {}, LOAD = {};
const ctx = () => {
  if (AC) return AC;
  const C = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!C) return null;
  try { AC = new C(); } catch (e) { AC = null; }
  return AC;
};
export function preloadSfx(name) {
  if (BUF[name]) return Promise.resolve(BUF[name]);
  if (LOAD[name]) return LOAD[name];
  const c = ctx();
  if (!c || !URLS[name]) return Promise.resolve(null);
  LOAD[name] = fetch(URLS[name]).then((r) => r.arrayBuffer())
    .then((b) => new Promise((res, rej) => { const p = c.decodeAudioData(b, res, rej); if (p && p.catch) p.catch(rej); }))
    .then((buf) => { BUF[name] = buf; return buf; })
    .catch(() => { LOAD[name] = null; return null; });
  return LOAD[name];
}
export function playSfx(name, volume = 1) {
  const c = ctx();
  if (!c) return null;
  try { if (c.state === 'suspended') c.resume(); } catch (e) { /* ignore */ }
  const start = (buf) => {
    if (!buf) return null;
    try {
      const s = c.createBufferSource(), g = c.createGain();
      s.buffer = buf; g.gain.value = volume; s.connect(g); g.connect(c.destination); s.start(0);
      return s;
    } catch (e) { return null; }
  };
  if (BUF[name]) return start(BUF[name]);
  const t0 = Date.now();
  preloadSfx(name).then((buf) => { if (buf && Date.now() - t0 < 700) start(buf); });
  return null;
}
