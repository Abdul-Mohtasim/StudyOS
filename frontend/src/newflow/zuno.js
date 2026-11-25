/* eslint-disable */
// The study guide mascot, now the StudyOS flame. Same API as before so every screen keeps working.
// States: idle (always on), greet, talk, think, success, explain, oops, nod.
import { playMascot, talkMascot, mountMascots, setMascotBase } from "../mascot";

export const ZIP_POSES = [];
export function znHtml(h = 92, id = "", cls = "") {
  return `<div class="zn fm ${cls}" ${id ? `id="${id}"` : ""} style="--zh:${h}px;--fms:${h}px" data-fm="idle" data-fmk="zn|${h}|${id}" data-face="happy" role="img" aria-label="StudyOS flame"></div>`;
}
export function znInit(root) { mountMascots(root); }
export function znStopAll() {}
// state -> flame action and how long it plays before returning to idle
const MAP = { greet: ["wave", 1900], explain: ["talk", 2400], think: ["think", 2600], success: ["cheer", 1900], oops: ["confused", 1500], nod: ["hop", 700] };
export function znSet(z, state) {
  if (!z || !z.isConnected || !MAP[state]) return;
  const [a, ms] = MAP[state];
  playMascot(z, a, ms);
}
const FACE = { happy: "idle", sad: "sad", proud: "proud", sleepy: "sleep", excited: "excited" };
export function znFace(z, face) { if (z && FACE[face]) setMascotBase(z, FACE[face]); }
export function znTalk(z, on) { if (z) talkMascot(z, on); }
