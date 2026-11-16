/* eslint-disable */
// Focus Soundscapes: rain, library and cafe sound that plays while a focus round runs.
//
// The sounds are made live with the Web Audio API (filtered noise plus small random events),
// so the app needs no audio files, nothing to download and it works offline.
//
// Two parts:
//  - buildScene(ctx, name, out)  makes one scene on any audio context (real or offline).
//  - createSoundscape()          plays one scene at a time with fade in / fade out.

export const SCENES = [
  { k: "rain", t: "Rain" },
  { k: "library", t: "Library" },
  { k: "cafe", t: "Cafe" },
];

// A few seconds of noise. Looped, it is steady enough that the join cannot be heard.
function noiseBuffer(ctx, seconds, kind) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      if (kind === "brown") {
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.5;
      } else {
        d[i] = white;
      }
    }
    // Fade the last 50 ms into the first samples so the loop point has no click.
    const fade = Math.floor(ctx.sampleRate * 0.05);
    for (let i = 0; i < fade; i++) {
      const w = i / fade;
      d[len - fade + i] = d[len - fade + i] * (1 - w) + d[i] * w;
    }
  }
  return buf;
}

function loopSource(ctx, buf) {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function filter(ctx, type, freq, q) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  if (q !== undefined) f.Q.value = q;
  return f;
}

function gain(ctx, v) {
  const g = ctx.createGain();
  g.gain.value = v;
  return g;
}

function pan(ctx, v) {
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = v;
    return p;
  }
  return gain(ctx, 1);
}

const rand = (a, b) => a + Math.random() * (b - a);

// A short burst of filtered noise: a raindrop, a page turning, a cup being set down.
function burst(ctx, out, t, { buf, type, freq, q, peak, attack, decay, panValue }) {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = filter(ctx, type, freq, q);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  const p = pan(ctx, panValue || 0);
  src.connect(f);
  f.connect(g);
  g.connect(p);
  p.connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + attack + decay + 0.05);
}

// A soft glass or ceramic "tink": two bell tones that die away quickly.
function tink(ctx, out, t, peak, panValue) {
  const base = rand(2400, 3600);
  [1, 1.51].forEach((mult, i) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = base * mult;
    const g = ctx.createGain();
    const p = peak * (i ? 0.5 : 1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(p, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    const pn = pan(ctx, panValue);
    o.connect(g);
    g.connect(pn);
    pn.connect(out);
    o.start(t);
    o.stop(t + 0.32);
  });
}

// Makes one scene. Returns { start(t), stop(t), schedule(from, to) }.
//   start/stop switch the steady layers on and off.
//   schedule(from, to) plants the random small sounds that fall inside that time window.
export function buildScene(ctx, name, out) {
  const white = noiseBuffer(ctx, 5, "white");
  const brown = noiseBuffer(ctx, 6, "brown");
  const sources = [];
  let nextEvent = 0;

  const add = (src) => {
    sources.push(src);
    return src;
  };

  if (name === "rain") {
    // Wide hiss (rain on leaves and ground). A slow swell makes the rain breathe.
    const hiss = add(loopSource(ctx, white));
    const hp = filter(ctx, "highpass", 900, 0.5);
    const lp = filter(ctx, "lowpass", 8000, 0.5);
    const swell = gain(ctx, 0.2);
    hiss.connect(hp);
    hp.connect(lp);
    lp.connect(swell);
    swell.connect(out);
    const lfo = add(ctx.createOscillator());
    lfo.frequency.value = 0.07;
    const depth = gain(ctx, 0.04);
    lfo.connect(depth);
    depth.connect(swell.gain);
    // Low rumble (heavier rain far away)
    const rumble = add(loopSource(ctx, brown));
    const rlp = filter(ctx, "lowpass", 500, 0.7);
    rumble.connect(rlp);
    rlp.connect(gain(ctx, 0.42)).connect(out);
  } else if (name === "library") {
    // Quiet room tone
    const room = add(loopSource(ctx, brown));
    const lp = filter(ctx, "lowpass", 380, 0.6);
    room.connect(lp);
    lp.connect(gain(ctx, 0.5)).connect(out);
    const air = add(loopSource(ctx, white));
    const bp = filter(ctx, "bandpass", 2200, 0.4);
    air.connect(bp);
    bp.connect(gain(ctx, 0.012)).connect(out);
  } else {
    // cafe: a bed of low murmur (many people far away)
    [
      { f: 420, q: 0.9, g: 0.5, lfo: 0.23 },
      { f: 760, q: 1.1, g: 0.36, lfo: 0.31 },
      { f: 1250, q: 1.3, g: 0.2, lfo: 0.17 },
    ].forEach((layer) => {
      const s = add(loopSource(ctx, brown));
      const bp = filter(ctx, "bandpass", layer.f, layer.q);
      const level = gain(ctx, layer.g);
      s.connect(bp);
      bp.connect(level);
      level.connect(out);
      // Each layer rises and falls on its own slow rhythm, like speech
      const lfo = add(ctx.createOscillator());
      lfo.frequency.value = layer.lfo;
      const d = gain(ctx, layer.g * 0.6);
      lfo.connect(d);
      d.connect(level.gain);
    });
    const hum = add(loopSource(ctx, white));
    const hp = filter(ctx, "highpass", 2500, 0.5);
    const lp = filter(ctx, "lowpass", 6500, 0.5);
    hum.connect(hp);
    hp.connect(lp);
    lp.connect(gain(ctx, 0.012)).connect(out);
  }

  return {
    start(t) {
      sources.forEach((s) => s.start(t, s.buffer ? Math.random() * 2 : 0));
    },
    stop(t) {
      sources.forEach((s) => {
        try {
          s.stop(t);
        } catch (_) {}
      });
    },
    schedule(from, to) {
      if (nextEvent < from) nextEvent = from + rand(0.1, 1.5);
      while (nextEvent < to) {
        const t = nextEvent;
        if (name === "rain") {
          // Drops on a window or leaf, a few per second
          burst(ctx, out, t, { buf: white, type: "bandpass", freq: rand(2500, 6500), q: 2, peak: rand(0.015, 0.05), attack: 0.002, decay: rand(0.02, 0.06), panValue: rand(-0.8, 0.8) });
          nextEvent += rand(0.05, 0.35);
        } else if (name === "library") {
          // A page turning: a soft swish
          burst(ctx, out, t, { buf: white, type: "bandpass", freq: rand(1800, 3200), q: 0.6, peak: rand(0.03, 0.06), attack: 0.12, decay: rand(0.25, 0.5), panValue: rand(-0.6, 0.6) });
          nextEvent += rand(9, 26);
        } else {
          // A cup or spoon set down
          tink(ctx, out, t, rand(0.015, 0.04), rand(-0.7, 0.7));
          nextEvent += rand(5, 16);
        }
      }
    },
  };
}

// Plays one scene at a time. Safe to call play() and stop() as often as you like.
export function createSoundscape() {
  let ctx = null;
  let master = null;
  let scene = null;
  let name = "";
  let vol = 0.6;
  let timer = 0;
  let playing = false;

  const ensure = () => {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
    } catch (_) {
      return false;
    }
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    return true;
  };

  // Coming back to the app: some phones pause audio while the app is hidden.
  const onVisible = () => {
    if (!document.hidden && ctx && playing && ctx.state !== "running") ctx.resume().catch(() => {});
  };
  document.addEventListener("visibilitychange", onVisible);

  const level = () => Math.max(0, Math.min(1, vol)) * 0.9;

  function teardown(fadeSeconds) {
    clearInterval(timer);
    timer = 0;
    if (!ctx || !scene) return;
    const old = scene;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + fadeSeconds);
    old.stop(t + fadeSeconds + 0.05);
    scene = null;
  }

  return {
    // Start (or switch to) a scene. Call it from a tap so the phone allows sound.
    // endsIn = seconds until the focus round ends. The sound fades out by itself at that moment,
    // even if the phone is slow to run the timer in the background.
    play(next, volume, endsIn) {
      if (typeof volume === "number") vol = volume;
      if (!ensure()) return false;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      if (playing && scene && next === name) {
        master.gain.setTargetAtTime(level(), ctx.currentTime, 0.1);
        return true;
      }
      if (scene) teardown(0.25);
      const out = ctx.createGain();
      out.gain.value = 1;
      out.connect(master);
      scene = buildScene(ctx, next, out);
      name = next;
      playing = true;
      const t = ctx.currentTime + 0.05;
      const endAt = endsIn > 0 ? t + endsIn : 0;
      if (endAt) {
        out.gain.setValueAtTime(1, Math.max(t, endAt - 1));
        out.gain.linearRampToValueAtTime(0, endAt);
        scene.stop(endAt + 0.1);
      }
      const until = (now) => (endAt ? Math.min(now + 4, endAt) : now + 4);
      scene.start(t);
      scene.schedule(t, until(t));
      timer = setInterval(() => {
        if (!scene) return;
        const now = ctx.currentTime;
        scene.schedule(now, until(now));
      }, 2000);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(level(), ctx.currentTime + 1.2);
      return true;
    },
    stop(fadeSeconds = 0.6) {
      playing = false;
      teardown(fadeSeconds);
    },
    setVolume(v) {
      vol = v;
      if (ctx && master && playing) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.08);
    },
    dispose() {
      playing = false;
      teardown(0.05);
      document.removeEventListener("visibilitychange", onVisible);
      if (ctx) setTimeout(() => ctx && ctx.close().catch(() => {}), 300);
    },
    get playing() {
      return playing;
    },
    get scene() {
      return name;
    },
  };
}
