/* Avatar maker: the character, its options and the compact save format.

   TO ADD AN OPTION YOU LIKE
   - Colours: add a hex to the end of a colour list (skin, eyeCol, hairCol, shirt, hatCol, glassCol, bg).
   - Shapes: add a draw function to the matching list (HAIR, GLASSES, BEARD, TOPS, HATS) and its id to the end of the list in AVD.
   - Always add at the END of a list. A saved avatar stores the position of each choice, so adding at the
     end keeps every saved avatar looking the same.
   The editor screen builds itself from AVD and TABS, so new options show up there with no other change. */

import alien from './assets/chars/alien.webp';
import blond from './assets/chars/blond.webp';
import capboy from './assets/chars/capboy.webp';
import grandpa from './assets/chars/grandpa.webp';
import greenhat from './assets/chars/greenhat.webp';
import headband from './assets/chars/headband.webp';
import orange from './assets/chars/orange.webp';
import pinktop from './assets/chars/pinktop.webp';
import ponytail from './assets/chars/ponytail.webp';
import puffs from './assets/chars/puffs.webp';
import redcap from './assets/chars/redcap.webp';
import redhead from './assets/chars/redhead.webp';
import lilac from './assets/chars/lilac.webp';
import clip from './assets/chars/clip.webp';

/* Ready-made characters. Position 0 of the chr choice means "use my own avatar", then these in order.
   To add one: put a 320x400 transparent image in assets/chars, import it above and add it at the END. */
export const CHARS = [
  ['Zip the alien', alien], ['Blond boy', blond], ['Cap boy', capboy], ['Grandpa', grandpa], ['Green hat girl', greenhat], ['Headband girl', headband],
  ['Orange hoodie boy', orange], ['Pink top girl', pinktop], ['Ponytail girl', ponytail], ['Puff hair girl', puffs], ['Red cap kid', redcap], ['Red hair boy', redhead],
  ['Lilac hoodie girl', lilac], ['Clip hair girl', clip]
];
/* Characters sit on the app theme colour instead of a fixed background. */
export const CH_BG = 'color-mix(in oklch,var(--mv,#c9b8c3) 80%,var(--card,#edebec))';
export const ZIP_CHR = 1; /* position of Zip in the chr choice */

export const AVD = {
  skin:    { t: 'Skin tone',          c: ['#6f4a38', '#8d5b43', '#b0714d', '#cf9068', '#e3a883', '#f2b896', '#f8cfb4', '#fbe0cd', '#5a3427', '#7b4a36', '#9a6240', '#c07a54', '#dc9468', '#eba67e', '#f5bfa0'],
             ord: [8, 0, 9, 1, 10, 2, 11, 3, 12, 4, 13, 5, 14, 6, 7] },  /* ord = order shown, dark to light */
  eyeCol:  { t: 'Eye color',          c: ['#3b2a20', '#6b4a2f', '#2f7f6a', '#3f7bd9', '#7a5af5'] },
  expr:    { t: 'Expression',         o: [['open', 'smile'], ['happy', 'grin'], ['wink', 'smile'], ['sleepy', 'flat'], ['open', 'open'], ['happy', 'smile']] },
  hairCol: { t: 'Main hair color',    c: ['#2c2a2e', '#5a3a28', '#8a3a2a', '#c4742d', '#e0b04a', '#c9c9d1', '#e0446c'] },
  hair:    { t: 'Hairstyle',          o: ['curly', 'short', 'buzz', 'long', 'bun', 'mohawk', 'afro', 'bald'] },
  glassCol:{ t: 'Frame color',        c: ['#2a2d33', '#e5484d', '#2f8fe0', '#f2c230', '#ebe8ea'] },
  glasses: { t: 'Glasses',            o: ['none', 'round', 'square', 'sun', 'tint'] },
  beardCol:{ t: 'Facial hair color',  c: ['#2c2a2e', '#5a3a28', '#8a3a2a', '#c4742d', '#e0b04a', '#c9c9d1', '#e0446c'] },
  beard:   { t: 'Facial hair',        o: ['none', 'stubble', 'moustache', 'goatee', 'full'] },
  shirt:   { t: 'Clothes color',      c: ['#e5484d', '#f59e0b', '#2f8f6a', '#4a6fd0', '#7a5af5', '#e0446c', '#ebe8ea'] },
  top:     { t: 'Clothes',            o: ['hoodie', 'tee', 'jacket', 'striped', 'turtle', 'overalls'] },
  hatCol:  { t: 'Cap and hat color',  c: ['#7a5af5', '#2f8fe0', '#3fa34d', '#f2c230', '#f59e0b', '#e5484d', '#2c2a2e'] },
  hat:     { t: 'Caps and hats',      o: ['none', 'cap', 'beanie', 'bucket', 'band'] },
  body:    { t: 'Body',                 o: ['regular', 'slim', 'sloped', 'broad', 'tall', 'wide'] },
  chr:     { t: 'Characters',           o: ['mine'].concat(CHARS.map((c) => c[0])) },
  bg:      { t: 'Background color',   c: ['#d9d6dc', '#9aa3ad', '#3b4350', '#f3c6dc', '#c9b8c3', '#b8a6f0', '#8ec5f7', '#4f8ff0', '#2563b8', '#a5e8d8', '#3fb88e', '#2f8f6a', '#9be08a', '#6aa84f', '#f7e08a', '#f2c230', '#f59e0b', '#f7b38a', '#e5484d', '#e0446c'] }
};

/* Order of the saved numbers. Never reorder, only add new keys at the end. */
export const AVK = ['skin', 'eyeCol', 'expr', 'hairCol', 'hair', 'glassCol', 'glasses', 'beardCol', 'beard', 'shirt', 'top', 'hatCol', 'hat', 'bg', 'chr', 'body'];
export const AVDEF = { skin: 5, eyeCol: 0, expr: 0, hairCol: 0, hair: 1, glassCol: 0, glasses: 0, beardCol: 0, beard: 0, shirt: 3, top: 0, hatCol: 0, hat: 0, bg: 1, chr: 0, body: 0 };

/* Body shapes: [width, height] scale of the torso and clothes around the bottom centre. Index 0 is the original shape. */
const BODY_SC = { regular: [1, 1], slim: [0.8, 1.06], sloped: [1.1, 0.88], broad: [1.2, 1], tall: [0.94, 1.22], wide: [1.32, 0.84] };
const bodyT = (n) => { const m = BODY_SC[n] || BODY_SC.regular; return `translate(100 200) scale(${m[0]} ${m[1]}) translate(-100 -200)`; };

const count = (k) => (AVD[k].c || AVD[k].o).length;

/* "5.0.0.0.1.0.0.0.0.3.0.0.0.1" -> { skin:5, ... }. Bad or missing numbers fall back to the default. */
export function avDecode(str) {
  const parts = typeof str === 'string' ? str.split('.') : [];
  const v = {};
  AVK.forEach((k, i) => {
    const n = parseInt(parts[i], 10);
    v[k] = Number.isInteger(n) && n >= 0 && n < count(k) ? n : AVDEF[k];
  });
  return v;
}
export const avEncode = (v) => AVK.map((k) => v[k]).join('.');

/* Tabs shown in the editor: key, label, icon path, sections. 's' = colour swatches, 't' = picture tiles. */
export const TABS = [
  { k: 'face',    t: 'Face',          d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M9 10v1.500 M15 10v1.500 M8.500 14.500q3.500 3.500 7 0', secs: [['skin', 'k'], ['eyeCol', 's'], ['expr', 't']] },
  { k: 'body',    t: 'Body',          d: 'M12 3.500a2.800 2.800 0 1 0 0 5.600a2.800 2.800 0 0 0 0-5.600z M6 21v-4.500a6 6 0 0 1 12 0V21 M4 12.500l2.500 3 M20 12.500l-2.500 3', secs: [['body', 't']] },
  { k: 'hair',    t: 'Hair',          d: 'M5 15c0-7 3-11 7-11s7 4 7 11c-2.500-1-4.500-3-5.500-5.500C12 12 9 14 5 15z', secs: [['hairCol', 's'], ['hair', 't']] },
  { k: 'glasses', t: 'Glasses',       d: 'M3 10h18 M5 10v3.500a3.500 3.500 0 0 0 7 0V10 M12 10v3.500a3.500 3.500 0 0 0 7 0V10', secs: [['glassCol', 's'], ['glasses', 't']] },
  { k: 'beard',   t: 'Facial hair',   d: 'M3 12c3-4 6-2 9 0c3-2 6-4 9 0c-2 5-6 5-9 2c-3 3-7 3-9-2z', secs: [['beardCol', 's'], ['beard', 't']] },
  { k: 'clothes', t: 'Clothes',       d: 'M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-2 3-4 3s-3-1-4-3z', secs: [['shirt', 's'], ['top', 't']] },
  { k: 'hat',     t: 'Caps and hats', d: 'M5 15a7 7 0 0 1 14 0z M19 15h3 M4 18.500h16', secs: [['hatCol', 's'], ['hat', 't']] },
  { k: 'chars',   t: 'Characters',    d: 'M12 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6z M6 20v-3a6 6 0 0 1 12 0v3 M4 9l2 1 M20 9l-2 1', secs: [['chr', 'c']] },
  { k: 'bg',      t: 'Background',    d: 'M4 4h16v16H4z M4 16l5-5 4 4 3-3 4 4 M15 8.500h.01', secs: [['bg', 'b']] }
];

/* ---- drawing: every list item is a function that returns SVG for a resolved config c ---- */
const HAIR = {
  curly: (c) => `<g fill="${c.hairCol}"><circle cx="58" cy="78" r="15"/><circle cx="72" cy="58" r="16"/><circle cx="100" cy="50" r="17"/><circle cx="128" cy="58" r="16"/><circle cx="142" cy="78" r="15"/><circle cx="100" cy="68" r="16"/><circle cx="80" cy="68" r="12"/><circle cx="120" cy="68" r="12"/></g>`,
  short: (c) => `<path d="M50 94C46 54 76 38 100 38C126 38 154 54 150 94C142 72 124 62 100 62C78 62 58 72 50 94Z" fill="${c.hairCol}"/>`,
  buzz:  (c) => `<path d="M54 88C54 58 76 46 100 46C124 46 146 58 146 88C138 70 124 62 100 62C76 62 62 70 54 88Z" fill="${c.hairCol}" opacity=".6"/>`,
  long:  (c) => `<path d="M48 100C42 50 76 36 100 36C126 36 158 50 152 100C148 76 128 62 100 62C76 62 52 76 48 100Z" fill="${c.hairCol}"/>`,
  bun:   (c) => `<path d="M50 94C46 54 76 40 100 40C126 40 154 54 150 94C142 72 124 62 100 62C78 62 58 72 50 94Z" fill="${c.hairCol}"/><rect x="88" y="42" width="24" height="6" rx="3" fill="#e0446c"/>`,
  mohawk:(c) => `<path d="M86 62L88 30Q100 12 112 30L114 62Z" fill="${c.hairCol}"/>`,
  afro:  (c) => `<path d="M52 92C50 60 76 48 100 48C124 48 150 60 148 92C140 74 124 66 100 66C76 66 60 74 52 92Z" fill="${c.hairCol}"/>`,
  bald:  () => ''
};
const HAIR_BACK = {
  long: (c) => `<path d="M50 90C42 130 44 172 60 186L140 186C156 172 158 130 150 90Z" fill="${c.hairCol}"/>`,
  afro: (c) => `<circle cx="100" cy="76" r="60" fill="${c.hairCol}"/>`,
  bun:  (c) => `<circle cx="100" cy="30" r="17" fill="${c.hairCol}"/>`
};
const GLASSES = {
  none:   () => '',
  round:  (c) => `<g fill="#fff" fill-opacity=".14" stroke="${c.glassCol}" stroke-width="4"><circle cx="80" cy="100" r="15"/><circle cx="120" cy="100" r="15"/></g><path d="M95 98Q100 93 105 98M65 98L52 96M135 98L148 96" fill="none" stroke="${c.glassCol}" stroke-width="4" stroke-linecap="round"/>`,
  square: (c) => `<g fill="#fff" fill-opacity=".14" stroke="${c.glassCol}" stroke-width="4"><rect x="63" y="88" width="34" height="25" rx="7"/><rect x="103" y="88" width="34" height="25" rx="7"/></g><path d="M97 97H103M63 96L52 95M137 96L148 95" fill="none" stroke="${c.glassCol}" stroke-width="4" stroke-linecap="round"/>`,
  sun:    (c) => `<g fill="#1d2026" stroke="${c.glassCol}" stroke-width="4"><path d="M62 90H98V104Q98 118 80 118Q62 118 62 104Z"/><path d="M102 90H138V104Q138 118 120 118Q102 118 102 104Z"/></g><path d="M98 94H102M62 94L52 94M138 94L148 94" fill="none" stroke="${c.glassCol}" stroke-width="4" stroke-linecap="round"/><path d="M68 98L76 94M108 98L116 94" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
  tint:   (c) => `<g fill="#f59e0b" fill-opacity=".55" stroke="${c.glassCol}" stroke-width="4"><circle cx="80" cy="100" r="15"/><circle cx="120" cy="100" r="15"/></g><path d="M95 98Q100 93 105 98M65 98L52 96M135 98L148 96" fill="none" stroke="${c.glassCol}" stroke-width="4" stroke-linecap="round"/>`
};
/* beard is drawn under the mouth, except the moustache which sits on top of it */
const BEARD = {
  none:      () => '',
  stubble:   (c) => `<path d="M54 104C56 140 76 150 100 150C124 150 144 140 146 104C138 124 122 134 100 134C78 134 62 124 54 104Z" fill="${c.beardCol}" opacity=".4"/>`,
  goatee:    (c) => `<path d="M90 140Q100 135 110 140L107 156Q100 162 93 156Z" fill="${c.beardCol}"/>`,
  full:      (c) => `<path d="M52 100C52 146 76 160 100 160C124 160 148 146 148 100C140 120 124 120 100 122C76 120 60 120 52 100Z" fill="${c.beardCol}"/>`,
  moustache: () => ''
};
const BEARD_TOP = {
  moustache: (c) => `<path d="M78 122Q90 110 100 118Q110 110 122 122Q110 128 100 123Q90 128 78 122Z" fill="${c.beardCol}"/>`
};
const TOPS = {
  hoodie:  { back: (c) => `<ellipse cx="100" cy="152" rx="62" ry="26" fill="${c.shirt}"/><ellipse cx="100" cy="152" rx="62" ry="26" fill="#000" opacity=".18"/>`,
             front: () => `<path d="M90 164V184M110 164V184" stroke="#fff" stroke-width="3.500" stroke-linecap="round" opacity=".9" fill="none"/>` },
  tee:     { back: () => '', front: () => `<path d="M80 152Q100 180 120 152" fill="none" stroke="#000" stroke-width="3" opacity=".15"/>` },
  jacket:  { back: () => '', front: () => `<path d="M100 170V200" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/><path d="M82 152L98 170L90 156ZM118 152L102 170L110 156Z" fill="#fff" opacity=".85"/>` },
  turtle:  { back: () => '', front: (c) => `<rect x="82" y="124" width="36" height="46" rx="12" fill="${c.shirt}"/><rect x="82" y="124" width="36" height="46" rx="12" fill="#000" opacity=".1"/><path d="M82 142H118" stroke="#000" stroke-width="3" opacity=".15"/>` },
  overalls:{ back: () => '', front: () => `<path d="M78 172L70 154M122 172L130 154" stroke="#3f5f8f" stroke-width="8" stroke-linecap="round"/><rect x="70" y="168" width="60" height="34" rx="8" fill="#3f5f8f"/><circle cx="78" cy="174" r="3" fill="#f2c230"/><circle cx="122" cy="174" r="3" fill="#f2c230"/>` },
  striped: { back: () => '', front: () => '', inside: () => `<rect x="30" y="164" width="140" height="8" fill="#fff" opacity=".85"/><rect x="30" y="180" width="140" height="8" fill="#fff" opacity=".85"/><rect x="30" y="196" width="140" height="8" fill="#fff" opacity=".85"/>` }
};
const HATS = {
  none:   () => '',
  cap:    (c) => `<path d="M50 84C50 46 76 34 100 34C124 34 150 46 150 84Z" fill="${c.hatCol}"/><path d="M100 34V84" stroke="#000" stroke-width="2.500" opacity=".18"/><circle cx="100" cy="34" r="4.500" fill="#000" opacity=".25"/><path d="M46 84H152Q172 86 178 96Q150 92 46 92Z" fill="${c.hatCol}"/><path d="M46 84H152Q172 86 178 96Q150 92 46 92Z" fill="#000" opacity=".18"/>`,
  beanie: (c) => `<path d="M52 82C48 40 76 26 100 26C124 26 152 40 148 82Z" fill="${c.hatCol}"/><rect x="46" y="70" width="108" height="18" rx="9" fill="${c.hatCol}"/><rect x="46" y="70" width="108" height="18" rx="9" fill="#000" opacity=".2"/><circle cx="100" cy="22" r="10" fill="${c.hatCol}"/><circle cx="100" cy="22" r="10" fill="#fff" opacity=".25"/>`,
  bucket: (c) => `<path d="M60 80C60 48 78 40 100 40C122 40 140 48 140 80Z" fill="${c.hatCol}"/><ellipse cx="100" cy="82" rx="60" ry="11" fill="${c.hatCol}"/><ellipse cx="100" cy="82" rx="60" ry="11" fill="#000" opacity=".18"/><rect x="60" y="68" width="80" height="8" fill="#000" opacity=".22"/>`,
  band:   (c) => `<path d="M50 80Q100 62 150 80L150 92Q100 74 50 92Z" fill="${c.hatCol}"/>`
};
const eyeOpen = (x, c) => `<ellipse cx="${x}" cy="100" rx="8" ry="9" fill="#fff"/><circle cx="${x}" cy="101" r="5.500" fill="${c.eyeCol}"/><circle cx="${x + 2}" cy="98.500" r="1.800" fill="#fff"/>`;
const EYES = {
  open:   (c) => eyeOpen(80, c) + eyeOpen(120, c),
  happy:  () => `<path d="M71 103Q80 91 89 103M111 103Q120 91 129 103" fill="none" stroke="#2a1f1a" stroke-width="4" stroke-linecap="round"/>`,
  wink:   (c) => eyeOpen(80, c) + `<path d="M111 100Q120 108 129 100" fill="none" stroke="#2a1f1a" stroke-width="4" stroke-linecap="round"/>`,
  sleepy: (c) => `<ellipse cx="80" cy="102" rx="8" ry="7" fill="#fff"/><circle cx="80" cy="104" r="5" fill="${c.eyeCol}"/><ellipse cx="120" cy="102" rx="8" ry="7" fill="#fff"/><circle cx="120" cy="104" r="5" fill="${c.eyeCol}"/><path d="M71 103Q80 92 89 103ZM111 103Q120 92 129 103Z" fill="${c.skin}"/><path d="M71 103H89M111 103H129" stroke="#2a1f1a" stroke-width="3.500" stroke-linecap="round"/>`
};
const MOUTH = {
  smile: (c) => `<path d="M86 128Q100 140 114 128" fill="none" stroke="${c.mouthCol}" stroke-width="4" stroke-linecap="round"/>`,
  grin:  (c) => `<path d="M84 124Q100 150 116 124Z" fill="${c.mouthCol}"/><path d="M88 125Q100 130 112 125L110 130Q100 134 90 130Z" fill="#fff"/>`,
  open:  (c) => `<ellipse cx="100" cy="132" rx="7" ry="9" fill="${c.mouthCol}"/>`,
  flat:  (c) => `<path d="M90 131H110" fill="none" stroke="${c.mouthCol}" stroke-width="4" stroke-linecap="round"/>`
};

const VIEWS = { full: '0 0 200 200', face: '34 22 132 132', bust: '18 62 164 138', both: '14 22 172 178', head: '22 28 156 156' };

/* v = saved numbers (see avDecode). o = { view:'full'|'face'|'bust', bg:true|false, cls:'', style:'' } */
export function avatarSvg(v, o = {}) {
  if (v.chr > 0 && CHARS[v.chr - 1]) {
    const bgc = (AVD.bg.c[v.bg] !== undefined ? AVD.bg.c[v.bg] : AVD.bg.c[AVDEF.bg]);
    return `<svg${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''} viewBox="${o.view === 'head' ? '44 2 112 112' : '0 0 200 200'}" role="img" aria-label="${CHARS[v.chr - 1][0]}">`
      + (o.bg ? `<rect width="200" height="200" fill="${bgc}" style="fill:${CH_BG}"/>` : '')
      + `<image href="${CHARS[v.chr - 1][1]}" x="20" y="0" width="160" height="200" preserveAspectRatio="xMidYMax meet"/></svg>`;
  }
  const pick = (k) => { const l = AVD[k].c || AVD[k].o; return l[v[k]] !== undefined ? l[v[k]] : l[AVDEF[k]]; };
  const ex = pick('expr');
  const c = {
    skin: pick('skin'), eyeCol: pick('eyeCol'), hairCol: pick('hairCol'), glassCol: pick('glassCol'), beardCol: pick('beardCol'),
    shirt: pick('shirt'), hatCol: pick('hatCol'), bg: pick('bg'),
    hair: pick('hair'), glasses: pick('glasses'), beard: pick('beard'), top: pick('top'), hat: pick('hat'), body: pick('body'),
    eyes: ex[0], mouth: ex[1]
  };
  c.mouthCol = c.beard === 'full' ? '#f0a89a' : '#6a2f2c';
  const top = TOPS[c.top] || TOPS.hoodie;
  const body = 'M34 200C34 166 64 152 100 152C136 152 166 166 166 200Z';
  return `<svg${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''} viewBox="${VIEWS[o.view] || VIEWS.full}" role="img" aria-label="Your avatar">`
    + (o.bg ? `<rect width="200" height="200" fill="${c.bg}"/>` : '')
    + (HAIR_BACK[c.hair] ? HAIR_BACK[c.hair](c) : '')
    + `<g transform="${bodyT(c.body)}">` + top.back(c)
    + `<path d="${body}" fill="${c.shirt}"/>`
    + (top.inside ? `<clipPath id="avbust"><path d="${body}"/></clipPath><g clip-path="url(#avbust)">${top.inside(c)}</g>` : '') + '</g>'
    + `<rect x="86" y="126" width="28" height="34" rx="12" fill="${c.skin}"/><rect x="86" y="126" width="28" height="34" rx="12" fill="#000" opacity=".12"/>`
    + `<path d="M82 152Q100 176 118 152Z" fill="${c.skin}"/><path d="M82 152Q100 176 118 152Z" fill="#000" opacity=".12"/>`
    + `<g transform="${bodyT(c.body)}">${top.front(c)}</g>`
    + `<circle cx="52" cy="102" r="10" fill="${c.skin}"/><circle cx="148" cy="102" r="10" fill="${c.skin}"/><ellipse cx="100" cy="98" rx="48" ry="52" fill="${c.skin}"/>`
    + (o.blank ? '' : `<circle cx="72" cy="118" r="8" fill="#ff6b6b" opacity=".22"/><circle cx="128" cy="118" r="8" fill="#ff6b6b" opacity=".22"/>`
    + `<path d="M98 108Q100 115 105 112" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".28"/>`
    + (BEARD[c.beard] ? BEARD[c.beard](c) : '')
    + (MOUTH[c.mouth] ? MOUTH[c.mouth](c) : '')
    + (BEARD_TOP[c.beard] ? BEARD_TOP[c.beard](c) : '')
    + `<path d="M69 84Q80 78 91 83" fill="none" stroke="${c.hairCol}" stroke-width="4" stroke-linecap="round"/><path d="M109 83Q120 78 131 84" fill="none" stroke="${c.hairCol}" stroke-width="4" stroke-linecap="round"/>`
    + (EYES[c.eyes] ? EYES[c.eyes](c) : ''))
    + (HAIR[c.hair] ? HAIR[c.hair](c) : '')
    + (!o.blank && GLASSES[c.glasses] ? GLASSES[c.glasses](c) : '')
    + (HATS[c.hat] ? HATS[c.hat](c) : '')
    + '</svg>';
}

export const avBg = (v) => AVD.bg.c[v.bg] || AVD.bg.c[AVDEF.bg];
