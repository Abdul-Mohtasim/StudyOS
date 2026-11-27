/* The streak fire sound (design/assets/streak_fire.mp3, 5.0 s) played with Web Audio so it starts at an exact moment.
   The file has 0.28 s of silence at the start, so the caller starts it at SKIP and times the animation from that point.

   preloadStreakSound()   fetch + decode once (call it early; it is cached)
   streakSoundReady(ms)   resolves true when the sound is decoded and the audio context is running, false if not within ms
   playStreakSound(skip)  starts it now (the part that plays during the slow-motion jump is stretched to match); returns { lead, stop() }. `lead` is how many ms the speaker lags behind the call
                          (scheduling + the device's output delay), so the visuals can wait the same time and stay in step. */
import soundUrl from './assets/streak_fire.mp3';
import { T, AIR_D, AIR_RD } from './streakpose.js';

let AC = null, BUF = null, loading = null, failed = false;
const ctx = () => { if (AC) return AC; const C = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext); if (!C) return null; try { AC = new C(); } catch (e) { AC = null; } return AC; };
export function preloadStreakSound() {
  if (BUF || loading || failed) return loading;
  const c = ctx(); if (!c) { failed = true; return null; }
  loading = fetch(soundUrl).then((r) => r.arrayBuffer()).then((b) => new Promise((res, rej) => { const p = c.decodeAudioData(b, res, rej); if (p && p.catch) p.catch(rej); }))
    .then((buf) => { BUF = buf; }).catch(() => { failed = true; });
  return loading;
}
export async function streakSoundReady(maxMs = 450) {
  try {
    preloadStreakSound(); if (!AC) return false;
    if (loading) await Promise.race([loading, new Promise((r) => setTimeout(r, maxMs))]);
    if (!BUF) return false;
    if (AC.state === 'suspended') await Promise.race([AC.resume().catch(() => {}), new Promise((r) => setTimeout(r, 200))]);
    return AC.state === 'running';
  } catch (e) { return false; }
}
export function playStreakSound(skip = 0, vol = 1) {
  if (!BUF || !AC || AC.state !== 'running') return null;
  try {
    /* the jump is in slow motion, so the part of the file that plays during it is stretched to the same length (T.launch to T.land
       plays over AIR_RD seconds); before take-off and after landing it plays at normal speed. */
    const g = AC.createGain(); g.gain.value = vol; g.connect(AC.destination);
    const srcs = [], seg = (when, off, dur, rate) => { const s = AC.createBufferSource(); s.buffer = BUF; s.playbackRate.value = rate; s.connect(g); if (dur > 0) s.start(when, off, dur); else s.start(when, off); srcs.push(s); };
    const sched = .03, t0 = AC.currentTime + sched;
    if (skip < T.launch) { const pre = T.launch - skip; seg(t0, skip, pre, 1); seg(t0 + pre, T.launch, AIR_D, AIR_D / AIR_RD); seg(t0 + pre + AIR_RD, T.land, 0, 1); } else seg(t0, skip, 0, 1);
    const out = Math.min(.15, Math.max(0, (AC.outputLatency || AC.baseLatency || 0)));
    return { lead: Math.round((sched + out) * 1000), stop(fade = .12) { try { const n = AC.currentTime; g.gain.cancelScheduledValues(n); g.gain.setTargetAtTime(0, n, fade / 3); srcs.forEach((s) => { try { s.stop(n + fade); } catch (e) { /* not started or already stopped */ } }); } catch (e) { /* already stopped */ } } };
  } catch (e) { return null; }
}
