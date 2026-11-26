/* eslint-disable */
/* StudyOS flame mascot: extra poses, added next to flame_actions.js without changing it.

   sitBranch  perched like a bird: low and compact, both feet gripping the top of a branch (toes curled
              over the edge), body leaning a little forward, wings resting on the thighs.
   sitStump   seated on a stump: knees apart, both feet flat on the top surface, hands on the knees.
   In both poses the feet end exactly on the ground line of the mascot (y = 190 in rig units), so the
   supporting surface of a scene is simply drawn at the mascot's foot line. Same body, colours, outline
   and flame hair as every other action: only the pose numbers change.

   The first keyframe of every action here glides in from whatever pose the mascot was in, so switching
   poses is a smooth tween (nothing snaps). The intro-page actions below are built from these two poses. */
import "./flame_rig.js";
import "./flame_actions.js";

const G = typeof window !== "undefined" ? window : globalThis;
const ACT = G.FLAME_ACTIONS;
const m = (...o) => Object.assign({}, ...o);

export const POSE = {
  sitBranch: { y: 6, sx: 1.03, sy: .98, rot: 2, lfx: -20, rfx: 20, lfy: 1, rfy: 1, lfa: -26, rfa: 26, lhx: -52, lhy: 4, rhx: 52, rhy: 4 },
  sitStump:  { y: 10, sx: 1.06, sy: .95, lfx: -38, rfx: 38, lfa: -6, rfa: 6, lhx: -58, lhy: 12, rhx: 58, rhy: 12 }
};
const B = POSE.sitBranch, S = POSE.sitStump;
const CR = { y: 13, sx: 1.09, sy: .9, lfx: -6, rfx: 6, lhx: -56, lhy: -22, rhx: 56, rhy: -22 };

const NEW = {
  /* ---- the two dedicated sitting poses (idle loops) ---- */
  sitBranch: { loop: 1, fps: 30, k: [
    { p: m(B, { look: .6 }), d: 700, e: 'inout' },
    { p: m(B, { look: -.5, lookY: .3, rot: -1 }), d: 1500, e: 'inout' },
    { p: m(B, { look: .3, squint: .3 }), d: 1200, e: 'inout' }
  ] },
  sitStump: { loop: 1, fps: 30, k: [
    { p: m(S, { look: -.4 }), d: 800, e: 'inout' },
    { p: m(S, { look: .5, lookY: .2 }), d: 1500, e: 'inout' },
    { p: m(S, { look: 0, squint: .25 }), d: 1200, e: 'inout' }
  ] },
  /* ---- intro page 1: perched on the big branch, looks around, waves hello, swings a foot ---- */
  perch: { loop: 1, k: [
    { p: m(B, { look: .7, squint: .15 }), d: 900, e: 'inout' },
    { p: m(B, { look: -.6, lookY: .3 }), d: 1100, e: 'inout' },
    { p: m(B, { rhx: 86, rhy: -104, mouth: 'open', eyes: 'happy', rot: 3 }), d: 380, e: 'back' },
    { p: m(B, { rhx: 62, rhy: -122, mouth: 'open', eyes: 'happy' }), d: 280, e: 'inout' },
    { p: m(B, { rhx: 86, rhy: -104, mouth: 'big', eyes: 'happy' }), d: 280, e: 'inout' },
    { p: m(B, { rhx: 62, rhy: -122, mouth: 'big', eyes: 'happy' }), d: 280, e: 'inout' },
    { p: m(B, { rhx: 86, rhy: -104, mouth: 'open', eyes: 'happy' }), d: 280, e: 'inout' },
    { p: m(B, { look: .3 }), d: 600, e: 'out' },
    { p: m(B, { look: .5, lfy: 4, lfa: -22 }), d: 420, e: 'inout' },
    { p: m(B, { look: .5, rfy: 4, rfa: 22 }), d: 420, e: 'inout' },
    { p: m(B, { look: -.4, lookY: -.5, squint: .2 }), d: 1000, e: 'inout' }
  ] },
  /* ---- intro page 2: sleeping on the stump. One breathing cycle is 3600 ms: the chest rises (inhale), then the head drops and the mouth
         opens (snore, exhale), then it rests. The intro page starts a "z z Z" burst at the start of every snore (see introCore.js, SNORE). ---- */
  doze: { loop: 1, fps: 30, k: [
    { p: m(S, { eyes: 'closed', hair: .55, tilt: 5, lookY: .4, sy: .97, y: 8, mouth: 'smile' }), d: 1300, e: 'inout' },
    { p: m(S, { eyes: 'closed', hair: .4, tilt: 15, lookY: .8, rot: 2, sy: .91, y: 15, mouth: 'o' }), d: 1100, e: 'inout' },
    { p: m(S, { eyes: 'closed', hair: .45, tilt: 8, lookY: .5, sy: .95, y: 11, mouth: 'smile' }), d: 1200, e: 'inout' },
    { p: m(S, { eyes: 'closed', hair: .55, tilt: 4, lookY: .3, sy: .98, y: 7, mouth: 'smile' }), d: 1300, e: 'inout' },
    { p: m(S, { eyes: 'closed', hair: .35, tilt: 18, lookY: .9, rot: 3, sy: .9, y: 16, mouth: 'yawn' }), d: 1100, e: 'inout' },
    { p: m(S, { eyes: 'closed', hair: .45, tilt: 7, lookY: .5, sy: .95, y: 11, mouth: 'smile' }), d: 1200, e: 'inout' }
  ] },
  /* ---- intro page 3: crouched on the ground, picks up a seed, eats it, switches hands ---- */
  eat: { loop: 1, k: [
    { p: m(CR, { look: .5, lookY: .9, hair: .9 }), d: 600, e: 'inout' },
    { p: m(CR, { lhx: -24, lhy: 6, look: .5, lookY: 1, sy: .88 }), d: 480, e: 'inout' },
    { p: m(CR, { lhx: -22, lhy: -62, look: .3, lookY: .2, mouth: 'o' }), d: 520, e: 'inout' },
    { p: m(CR, { lhx: -20, lhy: -56, mouth: 'open', eyes: 'happy' }), d: 200, e: 'inout' },
    { p: m(CR, { lhx: -18, lhy: -50, mouth: 'smile', eyes: 'happy', sy: .92 }), d: 200, e: 'inout' },
    { p: m(CR, { lhx: -18, lhy: -50, mouth: 'open', eyes: 'happy' }), d: 200, e: 'inout' },
    { p: m(CR, { lhx: -18, lhy: -50, mouth: 'smile', eyes: 'happy', sy: .92 }), d: 200, e: 'inout' },
    { p: m(CR, { lhx: -40, lhy: -20, mouth: 'smile', eyes: 'happy', blush: .6, look: -.2 }), d: 520, e: 'out' },
    { p: m(CR, { rhx: 24, rhy: 6, look: -.5, lookY: 1, sy: .88 }), d: 480, e: 'inout' },
    { p: m(CR, { rhx: 22, rhy: -62, look: -.3, lookY: .2, mouth: 'o' }), d: 520, e: 'inout' },
    { p: m(CR, { rhx: 20, rhy: -56, mouth: 'open', eyes: 'happy' }), d: 200, e: 'inout' },
    { p: m(CR, { rhx: 18, rhy: -50, mouth: 'smile', eyes: 'happy', sy: .92 }), d: 200, e: 'inout' },
    { p: m(CR, { rhx: 18, rhy: -50, mouth: 'open', eyes: 'happy' }), d: 200, e: 'inout' },
    { p: m(CR, { rhx: 40, rhy: -20, mouth: 'big', eyes: 'happy', blush: .7, look: 0, lookY: 0 }), d: 600, e: 'out' },
    { p: m(CR, { mouth: 'smile', eyes: 'happy', look: .4 }), d: 700, e: 'inout' }
  ] },
  /* ---- intro page 4: standing on the cliff, waves, thumbs up, small hop ---- */
  greet: { loop: 1, k: [
    { p: { look: -.4, mouth: 'smile', hair: 1.1 }, d: 800, e: 'inout' },
    { p: { rhx: 86, rhy: -104, mouth: 'open', eyes: 'happy', hair: 1.3 }, d: 300, e: 'back' },
    { p: { rhx: 62, rhy: -122, mouth: 'big', eyes: 'happy', hair: 1.3 }, d: 240, e: 'inout' },
    { p: { rhx: 86, rhy: -104, mouth: 'open', eyes: 'happy', hair: 1.3 }, d: 240, e: 'inout' },
    { p: { rhx: 62, rhy: -122, mouth: 'big', eyes: 'happy', hair: 1.3 }, d: 240, e: 'inout' },
    { p: { rhx: 40, rhy: -30, sy: .96, y: 2 }, d: 260, e: 'out' },
    { p: { rhx: 66, rhy: -80, eyes: 'wink', mouth: 'grin', rot: 3, tilt: 5, sy: 1.03, hair: 1.4 }, d: 340, e: 'back' },
    { p: { rhx: 66, rhy: -82, eyes: 'wink', mouth: 'grin', rot: 3, tilt: 5, hair: 1.4 }, d: 1100 },
    { p: { y: 6, sx: 1.07, sy: .93, lhx: -62, lhy: -40, rhx: 62, rhy: -40 }, d: 160, e: 'out' },
    { p: { y: -20, sx: .94, sy: 1.08, fa: .5, lhx: -70, lhy: -100, rhx: 70, rhy: -100, mouth: 'big', eyes: 'happy', hair: 1.6 }, d: 240, e: 'out' },
    { p: { y: -2, fa: 0, sx: .97, sy: 1.04, mouth: 'big', eyes: 'happy' }, d: 220, e: 'in' },
    { p: { y: 5, sx: 1.08, sy: .92 }, d: 110, e: 'out' },
    { p: { look: .4, mouth: 'smile' }, d: 800, e: 'inout' }
  ] }
};
for (const k in NEW) if (!ACT[k]) ACT[k] = NEW[k];

/* poses that ship as separate transparent SVG files in mascot/poses/ */
export const POSE_FILES = { sit_branch: "sitBranch", sit_stump: "sitStump", crouch_eat: "eat", stand_greet: "greet" };
