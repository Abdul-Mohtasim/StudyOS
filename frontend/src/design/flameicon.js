/* The StudyOS streak flame icon (one drawing used everywhere).
   Rounded red flame, warm orange inner flame with a soft glare, a white drop and a dark pink base.
   viewBox is 0 0 100 120. Big sizes also draw the soft floor shadow.

   FLM(color, dropColor, width, height)  small inline SVG string (kept compatible with the old FLM)
   flameInner(palette, uid, opts)        the shapes only, for hosts that build their own <svg>
   FLAME_PAL                             ready palettes: red, grey, blue, gold, pink, orange, purple
   palOf(color)                          builds a palette from any hex colour
*/
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toH = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toH(A.map((v, i) => v + (B[i] - v) * t)); };
const dk = (h, a) => toH(hx(h).map((v) => v * (1 - a)));

export const OUTER = 'M50 111C26 111 5 96 5 70V27C5 22 9 20 14 21.5L25 26L45 6C48 2.5 52 2.5 56 6C80 28 95 42 95 70C95 96 74 111 50 111Z';
export const INNER = 'M17 64C17 53 23 46 27 42L32 49L42 36C45 32.5 49 32.5 52 36C66 49 82 57 83 74C83 90 68 100 50 100C32 100 17 90 17 74Z';
export const DROP = 'M50 58C55 66 64 72 64 81A14 14 0 0 1 36 81C36 72 45 66 50 58Z';
const GLARE = 'M22 66C22 57 28 49 33 45L36 50C31 55 28 60 28 69Z';

export const FLAME_PAL = {
  red:    { o1: '#FF3B47', o2: '#E8173E', i1: '#FFC21A', i2: '#FF8A1F', i3: '#FF3D45', base: '#B8205C', drop: '#FFFFFF', glow: '255,106,61' },
  grey:   { o1: '#5F6B75', o2: '#4A555E', i1: '#7C8791', i2: '#6B7680', i3: '#5A656E', base: '#3E4850', drop: '#A9B4BC', glow: '120,130,140' },
  blue:   { o1: '#3DA5FF', o2: '#1F6FE0', i1: '#B5EBFF', i2: '#5CC0FF', i3: '#2F85F0', base: '#1B3FA3', drop: '#FFFFFF', glow: '61,165,255' },
  gold:   { o1: '#FFC42E', o2: '#F2A100', i1: '#FFF1A8', i2: '#FFD24A', i3: '#F7B31C', base: '#B9780A', drop: '#FFFFFF', glow: '255,196,46' },
  pink:   { o1: '#FF6FC0', o2: '#E0409F', i1: '#FFC8EA', i2: '#FF8AD0', i3: '#F056B0', base: '#A02770', drop: '#FFFFFF', glow: '255,111,192' },
  orange: { o1: '#FF8A1F', o2: '#EE5F0A', i1: '#FFE07A', i2: '#FFB02E', i3: '#FF7A1A', base: '#A94B08', drop: '#FFFFFF', glow: '255,138,31' },
  purple: { o1: '#A06BFF', o2: '#7A3FE0', i1: '#E2CCFF', i2: '#B98CFF', i3: '#8E52F0', base: '#4A2397', drop: '#FFFFFF', glow: '160,107,255' }
};
export const palOf = (c) => {
  if (!/^#[0-9a-f]{6}$/i.test(c || '')) return FLAME_PAL.red;
  return { o1: mix(c, '#FFFFFF', .08), o2: dk(c, .2), i1: mix(c, '#FFF0A0', .62), i2: mix(c, '#FFD24A', .4), i3: c, base: dk(c, .5), drop: '#FFFFFF', glow: hx(c).join(',') };
};
/* old FLM colour arguments -> palette */
const palFor = (c) => {
  const k = String(c || '').toLowerCase();
  if (k === 'currentcolor' || k === '#1b1e25' || k === '#c9b8c3' || k === '#f0243a' || k === 'url(#gf7)' || k === '') return FLAME_PAL.red;
  if (k === '#5a666f' || k === '#3f4c56') return FLAME_PAL.grey;
  return palOf(k);
};
let UID = 0;
/* the flame shapes. opts: shadow (floor shadow), drop (drop colour), cls (add hook classes for animation) */
export function flameInner(p, uid, opts = {}) {
  const id = uid || ('fi' + (++UID));
  const { shadow = false, drop = p.drop, cls = false } = opts;
  const c = (n) => (cls ? ` class="${n}"` : '');
  return `<defs>
<linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.o1}"/><stop offset="1" stop-color="${p.o2}"/></linearGradient>
<linearGradient id="${id}i" x1=".1" y1="0" x2=".75" y2="1"><stop offset="0" stop-color="${p.i1}"/><stop offset=".38" stop-color="${p.i2}"/><stop offset=".78" stop-color="${p.i3}"/><stop offset="1" stop-color="${p.o2}"/></linearGradient>
<clipPath id="${id}c"><path d="${OUTER}"/></clipPath></defs>`
    + (shadow ? `<ellipse${c('fl-sh')} cx="50" cy="115.5" rx="37" ry="4.6" fill="#7A2A38" opacity=".5"/>` : '')
    + `<g${c('fl-all')}><path d="${OUTER}" fill="url(#${id}o)" stroke="url(#${id}o)" stroke-width="3" stroke-linejoin="round"/>`
    + `<g clip-path="url(#${id}c)"><ellipse cx="50" cy="101" rx="31" ry="12" fill="${p.base}" opacity=".92"/></g>`
    + `<path${c('fl-in')} d="${INNER}" fill="url(#${id}i)" stroke="url(#${id}i)" stroke-width="2" stroke-linejoin="round"/>`
    + `<g clip-path="url(#${id}c)"><ellipse cx="50" cy="103" rx="29" ry="10.5" fill="${p.base}" opacity=".9"/></g>`
    + `<path d="${GLARE}" fill="#FFFFFF" opacity=".5"/><ellipse cx="25" cy="75" rx="2.2" ry="3.2" fill="#FFFFFF" opacity=".5"/>`
    + `<path d="${DROP}" fill="${drop}"/></g>`;
}
/* old API: FLM(outerColour, dropColour, width, height) */
export const FLM = (c, h, w = 20, hh = 24) => {
  const p = palFor(c);
  const drop = /^#[0-9a-f]{6}$/i.test(h || '') && p === FLAME_PAL.grey ? h : p.drop;
  return `<svg viewBox="0 0 100 120" style="width:${w}px;height:${hh}px;display:block;flex:none" aria-hidden="true">${flameInner(p, null, { shadow: w >= 60, drop })}</svg>`;
};
/* same flame without a fixed size (the old flameSvg(outer, inner)) */
export const flameSvg = (o, i) => `<svg viewBox="0 0 100 120" aria-hidden="true">${flameInner(palFor(o), null, {})}</svg>`;
/* small helper for line-icon places that want the same flame at a font-relative size */
export const flameIconHtml = (size = 16, tier = 'red') => `<svg viewBox="0 0 100 120" width="${Math.round(size * .84)}" height="${size}" style="display:block;flex:none" aria-hidden="true">${flameInner(FLAME_PAL[tier] || FLAME_PAL.red, null, { shadow: size >= 60 })}</svg>`;
