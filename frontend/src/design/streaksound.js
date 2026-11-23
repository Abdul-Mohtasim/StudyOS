/* The streak jingle from the intro flow, played when the day's streak goes up. */
import clipUrl from '../newflow/assets/clip0.mp3';
let AC = null, BUF = null;
export async function playStreakClip(vol = 0.9) {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') await AC.resume();
    if (!BUF) { const r = await fetch(clipUrl); BUF = await AC.decodeAudioData(await r.arrayBuffer()); }
    const s = AC.createBufferSource(), g = AC.createGain();
    g.gain.value = vol; s.buffer = BUF; s.connect(g); g.connect(AC.destination); s.start(0);
  } catch (e) { /* sound is optional */ }
}
