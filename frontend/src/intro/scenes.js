/* eslint-disable */
/* StudyOS intro pages: original flat-vector scenery, one scene per page. Class names start with ix- (styles are in introCss.js). */
/* ===== StudyOS intro pages: scenes (original flat-vector art) ===== */
const rnd = (s) => { s = Math.sin(s * 127.1 + 3.7) * 43758.5453; return s - Math.floor(s); };
const tri = (x, y, w, h) => `M${x} ${y - h}L${x + w} ${y}L${x - w} ${y}Z`;
const pine = (x, y, h, c, c2) => { const w = h * .34; return `<g><rect x="${x - 1.6}" y="${y - 2}" width="3.2" height="${h * .12}" fill="${c2 || c}"/><path d="${tri(x, y - h * .5, w * .55, h * .42)}${tri(x, y - h * .26, w * .8, h * .44)}${tri(x, y, w, h * .5)}" fill="${c}"/></g>`; };
const grp = (items, cls, seed, dur0, dur1, neg) => [0, 1, 2].map((g) => `<g class="${cls}" style="animation-delay:${((neg ? -1 : 1) * rnd(g + seed) * 4).toFixed(2)}s;animation-duration:${(dur0 + g * (dur1 - dur0) / 2).toFixed(1)}s">${items.filter((_, i) => i % 3 === g).join('')}</g>`).join('');
const stars = (n, seed, y1, c = '#fff') => grp(Array.from({ length: n }, (_, i) => `<circle cx="${(rnd(i * 5 + seed) * 300).toFixed(0)}" cy="${(rnd(i * 7 + seed) * y1).toFixed(0)}" r="${(.8 + rnd(i * 11 + seed) * 1.3).toFixed(1)}" fill="${c}"/>`), 'ix-tw', seed, 2.6, 4.6, false);
const dust = (n, seed, c) => grp(Array.from({ length: n }, (_, i) => `<circle cx="${(rnd(i * 5 + seed) * 300).toFixed(0)}" cy="${(160 + rnd(i * 7 + seed) * 380).toFixed(0)}" r="${(1 + rnd(i * 11 + seed) * 1.5).toFixed(1)}" fill="${c}" opacity=".7"/>`), 'ix-fz', seed, 10, 17, true);
const cloud = (x, y, s, c, o, d, cls = 'ix-cl') => `<g class="${cls}" style="animation-duration:${d}s"><g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="30" cy="16" rx="30" ry="11" fill="${c}"/><circle cx="20" cy="10" r="12" fill="${c}"/><circle cx="40" cy="7" r="14" fill="${c}"/><circle cx="54" cy="13" r="9" fill="${c}"/></g></g>`;
const tuft = (x, y, c, h = 20) => `<path class="ix-gs" style="animation-delay:${(-((x * 7 + y * 3) % 40) / 10).toFixed(1)}s" d="M${x} ${y}q-4 ${-h * .6} -8 ${-h}M${x} ${y}q1 ${-h * .8} 2 ${-h * 1.2}M${x} ${y}q5 ${-h * .6} 10 ${-h * .9}" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
const SH = (id, a, b) => `<linearGradient id="ixs-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const SR = (id, c, o = 1) => `<radialGradient id="ixs-${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;

/* 1 ---------- autumn forest, big tree with a branch ---------- */
function sceneAutumn() {
  const v = [200, 214, 228, 242].map((x, i) => { const L = 50 + rnd(i + 4) * 60; return `<g class="ix-sw" style="animation-delay:${-i * .7}s"><path d="M${x} 56q${i % 2 ? 5 : -5} ${L / 2} 0 ${L}" stroke="#C75B1B" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="${56 + L}" r="3.6" fill="#C75B1B"/></g>`; }).join('');
  const leaves = [[40, 0, '#E8782A'], [120, -5, '#F2A33A'], [210, -9, '#C75B1B'], [80, -2, '#E8782A'], [260, -11, '#F2A33A']].map(([x, d, c], i) => `<path class="ix-lf" style="animation-delay:${d}s;animation-duration:${13 + i * 2}s" transform="translate(${x} 0)" d="M0 0q5 -4 9 0q-4 6 -9 0z" fill="${c}"/>`).join('');
  return wrap(`<defs>${SH('as', '#FFF7EC', '#FFD3A0')}${SR('ag', '#FFC27A', .95)}${SH('am', '#fff0', '#ffffff90')}${SH('ad', '#3A1E1000', '#3A1E10D0')}</defs>
<rect width="300" height="650" fill="url(#ixs-as)"/>
<circle class="ix-pu" cx="70" cy="300" r="165" fill="url(#ixs-ag)"/>
${cloud(180, 120, .9, '#fff', .75, 60)}${cloud(20, 190, .7, '#fff', .6, 80)}
<path d="M-10 420L30 350 62 380 118 290 176 376 212 336 262 392 310 360V560H-10Z" fill="#E4B9A0"/>
<path d="M118 290L176 376 150 382 130 346 100 366ZM30 350L62 380 38 388ZM212 336L262 392 236 398Z" fill="#F4D6BF"/>
<path d="M-10 452L56 398 112 436 176 392 250 440 310 420V560H-10Z" fill="#D79A78"/>
<rect y="418" width="300" height="140" fill="url(#ixs-am)"/>
${[40, 62, 84, 102].map((x, i) => pine(x, 478 - (i % 2) * 4, 34 + i * 3, '#9A5A33', '#7A3B1D')).join('')}
<rect y="486" width="300" height="34" fill="#F6C99A"/><g class="ix-tw" style="animation-duration:3.4s">${[[50, 496, 36], [120, 504, 52], [190, 494, 30], [150, 512, 44]].map(([x, y, w]) => `<path d="M${x} ${y}h${w}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`).join('')}</g>
<path d="M-10 520Q78 484 170 506T310 490V650H-10Z" fill="#EBA650"/>
<path d="M-10 560Q104 524 204 550T310 538V650H-10Z" fill="#CC7B33"/>
${tuft(40, 566, '#F5B63C', 26)}${tuft(52, 570, '#F5B63C', 22)}${tuft(120, 548, '#F5B63C', 18)}
<path d="M-10 540L40 506 100 516 132 552 120 600-10 626Z" fill="#8A4B2A"/><path d="M40 506L100 516 72 560Z" fill="#B8723F"/><path d="M-10 540L40 506 26 556-10 584Z" fill="#B8723F" opacity=".75"/>
<path d="M250 -6H298V150Q292 300 298 560H240Q258 470 250 330Q246 190 250 -6Z" fill="#7A3B1D"/>
<path d="M262 20Q258 200 264 420" stroke="#A25A32" stroke-width="3" fill="none" opacity=".6"/><path d="M280 60Q284 250 280 440" stroke="#5A2A12" stroke-width="2.4" fill="none" opacity=".5"/>
<path d="M262 452C230 452 198 444 152 440C140 439 128 435 116 427L113 419C128 425 142 428 156 428C196 430 228 428 262 418Z" fill="#7A3B1D"/>
<path d="M150 429C190 432 226 430 258 424" stroke="#B5703F" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M136 428q-12 -24 -4 -42" stroke="#7A3B1D" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#E8782A"><ellipse cx="130" cy="384" rx="9" ry="5.5" transform="rotate(-40 130 384)"/><ellipse cx="140" cy="394" rx="8" ry="5" transform="rotate(20 140 394)"/><ellipse cx="122" cy="398" rx="8" ry="5" transform="rotate(-70 122 398)"/></g>
<g fill="#C75B1B"><ellipse cx="112" cy="414" rx="9" ry="5.5" transform="rotate(-30 112 414)"/><ellipse cx="120" cy="424" rx="8" ry="5" transform="rotate(30 120 424)"/></g>
<g class="ix-cn"><g fill="#E8782A"><circle cx="254" cy="28" r="48"/><circle cx="292" cy="10" r="54"/><circle cx="214" cy="6" r="42"/><circle cx="272" cy="76" r="36"/><circle cx="228" cy="62" r="32"/></g>
<g fill="#C75B1B" opacity=".75"><circle cx="240" cy="46" r="22"/><circle cx="284" cy="54" r="22"/><circle cx="206" cy="26" r="18"/></g></g>
${v}${dust(18, 9, '#fff')}${leaves}
<rect y="420" width="300" height="230" fill="url(#ixs-ad)"/>`);
}

/* 2 ---------- moonlit twilight, pines, lake, stump ---------- */
function sceneTwilight() {
  const pines = [[14, 452, 74], [40, 462, 92], [70, 458, 66], [250, 450, 80], [276, 460, 96], [300, 452, 70], [226, 458, 60]].map(([x, y, h]) => pine(x, y, h, '#6E5AA6', '#4E3F86')).join('');
  const far = [[104, 410, 36], [124, 414, 44], [150, 408, 32], [170, 412, 40], [190, 408, 34]].map(([x, y, h]) => pine(x, y, h, '#9C87C8', '#8571B8')).join('');
  const ff = [[60, 440], [180, 470], [230, 410], [40, 520], [210, 520], [140, 400]].map(([x, y], i) => `<g class="ix-ff${i % 3}" style="animation-delay:${-i * 1.3}s"><circle cx="${x}" cy="${y}" r="9" fill="url(#ixs-bf)"/><circle cx="${x}" cy="${y}" r="1.8" fill="#FFF7B0"/></g>`).join('');
  return wrap(`<defs>${SH('bs', '#C7B2EA', '#FBE4EF')}${SR('bg', '#FFF6D9', .9)}${SR('bf', '#FFF18A', .9)}${SH('bl', '#B7A5DC', '#7F6CB4')}${SH('bd', '#241B4500', '#241B45E0')}${SH('bm', '#ffffff00', '#ffffff80')}${SH('ba', '#9FF0D4', '#F3A8E6')}</defs>
<rect width="300" height="650" fill="url(#ixs-bs)"/>
${stars(30, 3, 330)}
<path class="ix-dr" d="M-20 150Q70 100 150 140T320 110V150Q240 190 150 170T-20 190Z" fill="url(#ixs-ba)" opacity=".28"/>
<circle class="ix-pu" cx="212" cy="176" r="104" fill="url(#ixs-bg)"/>
<circle cx="212" cy="176" r="46" fill="#FFF8E6"/><g fill="#EFE3C8"><circle cx="198" cy="164" r="8"/><circle cx="226" cy="190" r="11"/><circle cx="216" cy="156" r="4.4"/><circle cx="196" cy="194" r="5"/></g>
<g class="ix-ss"><g transform="translate(250 58)"><path d="M0 0L-34 12" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/><path d="M-34 12L-70 24" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".35"/><circle r="2.6" fill="#fff"/></g></g>
${cloud(30, 250, .8, '#fff', .5, 70)}${cloud(190, 300, .6, '#fff', .45, 90)}
<path d="M-10 440L48 346 90 400 142 312 204 410 252 352 310 414V560H-10Z" fill="#B9A5DE"/>
<path d="M142 312L204 410 176 416 154 372 124 398ZM48 346L90 400 62 410ZM252 352L310 414 276 418Z" fill="#F4EEFB"/>
<rect y="396" width="300" height="130" fill="url(#ixs-bm)"/>
${far}
<path d="M-10 458Q90 430 160 448T310 432V560H-10Z" fill="#8E7AC0"/>
${pines}
<rect y="470" width="300" height="76" fill="url(#ixs-bl)"/>
<ellipse cx="212" cy="490" rx="44" ry="6" fill="#FFF6D9" opacity=".55" class="ix-rp"/><ellipse cx="212" cy="506" rx="30" ry="4" fill="#FFF6D9" opacity=".45" class="ix-rp" style="animation-delay:-1.4s"/><ellipse cx="212" cy="522" rx="18" ry="3" fill="#FFF6D9" opacity=".4" class="ix-rp" style="animation-delay:-2.4s"/>
<path d="M-10 536Q80 500 170 524T310 508V650H-10Z" fill="#6E5AA6"/>
<path d="M-10 580Q110 546 210 570T310 556V650H-10Z" fill="#4E3F86"/>
${tuft(30, 590, '#8E7AC0', 22)}${tuft(246, 570, '#8E7AC0', 24)}${tuft(258, 574, '#8E7AC0', 18)}
<g><path d="M62 490L58 548Q112 560 168 548L162 490Z" fill="#8E6A4A"/><path d="M76 492L74 548M96 494L96 554M120 494L122 556M144 494L148 552" stroke="#6B4A30" stroke-width="2.2" opacity=".6"/><path d="M58 548q-12 6 -22 14M168 548q14 6 26 12" stroke="#8E6A4A" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="112" cy="490" rx="52" ry="11" fill="#D9B186"/><ellipse cx="112" cy="490" rx="40" ry="7.5" fill="none" stroke="#B88E62" stroke-width="1.6"/><ellipse cx="112" cy="490" rx="26" ry="4.6" fill="none" stroke="#B88E62" stroke-width="1.4"/><ellipse cx="112" cy="490" rx="12" ry="2.4" fill="none" stroke="#B88E62" stroke-width="1.2"/></g>
<g><path d="M196 560v-14" stroke="#F6E8EE" stroke-width="4" stroke-linecap="round"/><path d="M184 548Q196 528 208 548Z" fill="#E85A8A"/><circle cx="193" cy="543" r="2" fill="#fff"/><circle cx="201" cy="540" r="1.6" fill="#fff"/><path d="M226 572v-10" stroke="#F6E8EE" stroke-width="3" stroke-linecap="round"/><path d="M218 563Q226 549 234 563Z" fill="#B067E0"/></g>
${ff}
<rect y="430" width="300" height="220" fill="url(#ixs-bd)"/>`);
}

/* 3 ---------- spring meadow with a waterfall ---------- */
function sceneMeadow() {
  const flowerOne = (i) => { const x = rnd(i + 20) * 300, y = 520 + rnd(i * 3 + 20) * 110, c = ['#FF8FB1', '#FFE36B', '#fff', '#B58CFF'][i % 4]; return `<path d="M${x.toFixed(0)} ${y.toFixed(0)}v10" stroke="#2F7430" stroke-width="1.6"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3.4" fill="${c}"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1.2" fill="#E8A21F"/>`; };
  const flowers = [0, 1, 2, 3].map((g) => `<g class="ix-gs" style="animation-delay:${(-g * .7).toFixed(1)}s;animation-duration:${(2.8 + g * .6).toFixed(1)}s">${Array.from({ length: 26 }, (_, i) => i).filter((i) => i % 4 === g).map(flowerOne).join('')}</g>`).join('');
  const bf = (c, d, y, dur) => `<g class="ix-bf" style="animation-delay:${d}s;animation-duration:${dur}s"><g class="ix-bfy" style="animation-duration:${dur / 6}s"><g transform="translate(0 ${y})"><g class="ix-wg"><ellipse cx="-4" cy="-2" rx="5" ry="4" fill="${c}"/><ellipse cx="4" cy="-2" rx="5" ry="4" fill="${c}"/></g><rect x="-.8" y="-3" width="1.6" height="7" rx=".8" fill="#4A3A33"/></g></g></g>`;
  return wrap(`<defs>${SH('cs', '#DDF3FF', '#E3F6D6')}${SR('cg', '#FFF3B0', .95)}${SH('cm', '#ffffff00', '#ffffffA0')}${SH('cw', '#ffffff', '#CFEFFF')}${SH('cd', '#12301A00', '#12301AE0')}</defs>
<rect width="300" height="650" fill="url(#ixs-cs)"/>
<circle class="ix-pu" cx="236" cy="96" r="120" fill="url(#ixs-cg)"/><circle cx="236" cy="96" r="24" fill="#FFF6C0"/>
${cloud(20, 70, 1, '#fff', .9, 52)}${cloud(150, 150, .8, '#fff', .8, 70)}${cloud(220, 34, .6, '#fff', .8, 90)}
<path d="M-10 430L40 300 84 360 138 270 196 360 240 316 310 380V560H-10Z" fill="#8CCBC4"/>
<path d="M138 270L196 360 168 366 148 326 120 346ZM40 300L84 360 56 368Z" fill="#F4FBF8"/>
<path d="M30 316L46 316 60 470 20 470Z" fill="#4E8F8B"/>
<path class="ix-fa" d="M40 320Q38 400 36 470" stroke="url(#ixs-cw)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="26 10"/>
<path class="ix-fa" style="animation-delay:-.4s" d="M50 320Q50 400 50 470" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="14 12" opacity=".8"/>
<ellipse class="ix-pu" cx="40" cy="472" rx="36" ry="9" fill="#fff" opacity=".6"/>
<rect y="396" width="300" height="130" fill="url(#ixs-cm)"/>
<path d="M-10 480Q90 440 170 466T310 450V560H-10Z" fill="#7FC66B"/>
${[[110, 462, 20], [130, 458, 26], [196, 458, 22], [226, 464, 18]].map(([x, y, r]) => `<g class="ix-cn" style="animation-delay:${(-x % 5) / 2}s"><rect x="${x - 1.6}" y="${y}" width="3.2" height="14" fill="#6B4A30"/><circle cx="${x}" cy="${y - 4}" r="${r}" fill="#4C9A3C"/><circle cx="${x - 5}" cy="${y - 8}" r="${r * .5}" fill="#7BCB5A" opacity=".7"/></g>`).join('')}
<path d="M-10 510Q90 480 190 500T310 484V650H-10Z" fill="#90CA5B"/>
<path d="M-10 556Q110 524 210 548T310 534V650H-10Z" fill="#509B3F"/>
${tuft(30, 588, '#3F8A2B', 24)}${tuft(44, 592, '#3F8A2B', 18)}${tuft(262, 576, '#3F8A2B', 26)}${tuft(276, 582, '#3F8A2B', 20)}
${flowers}
<g><path d="M-6 80H22L18 330 24 520H-6Z" fill="#F4F1EA"/><g fill="#2B2B2B"><rect x="2" y="130" width="10" height="3" rx="1.5"/><rect x="4" y="210" width="12" height="3" rx="1.5"/><rect x="2" y="300" width="9" height="3" rx="1.5"/><rect x="5" y="400" width="12" height="3" rx="1.5"/></g><g class="ix-cn" fill="#6BBE4E"><circle cx="14" cy="64" r="34"/><circle cx="-4" cy="94" r="28"/><circle cx="34" cy="96" r="24"/></g><g fill="#4C9A3C" opacity=".7"><circle cx="20" cy="76" r="18"/></g></g>
<g><path d="M284 150H306V340L302 520H284Z" fill="#F4F1EA"/><g fill="#2B2B2B"><rect x="286" y="190" width="10" height="3" rx="1.5"/><rect x="288" y="280" width="12" height="3" rx="1.5"/><rect x="286" y="380" width="10" height="3" rx="1.5"/></g><g class="ix-cn" style="animation-delay:-2s" fill="#6BBE4E"><circle cx="298" cy="138" r="32"/><circle cx="280" cy="166" r="24"/></g></g>
${bf('#FF8FB1', -2, 440, 24)}${bf('#FFD24A', -12, 380, 30)}${dust(10, 5, '#fff')}
<rect y="450" width="300" height="200" fill="url(#ixs-cd)"/>`);
}

/* 4 ---------- sunset coast, lighthouse, cliff ---------- */
function sceneCoast() {
  const bird = (x, y, d, dur, s = 1) => `<g class="ix-bd" style="animation-delay:${d}s;animation-duration:${dur}s"><g transform="translate(${x} ${y}) scale(${s})"><path class="ix-wg2" d="M-9 0Q-4.500 -6 0 0Q4.500 -6 9 0" stroke="#5A2A3A" stroke-width="1.8" fill="none" stroke-linecap="round"/></g></g>`;
  const reflOne = (i) => `<rect x="${150 - (62 - i * 5.4) / 2}" y="${408 + i * 11}" width="${62 - i * 5.4}" height="3" rx="1.5" fill="#FFE9A8" opacity=".8"/>`;
  const refl = [0, 1, 2].map((g) => `<g class="ix-tw" style="animation-delay:${(-g * 1.1).toFixed(1)}s;animation-duration:${(3 + g * .6).toFixed(1)}s">${Array.from({ length: 9 }, (_, i) => i).filter((i) => i % 3 === g).map(reflOne).join('')}</g>`).join('');
  return wrap(`<defs>${SH('ds', '#FFD9D2', '#FFA487')}${SR('dg', '#FFD08A', .95)}${SH('dsun', '#FFF1A8', '#FF9A4A')}${SH('dsea', '#FF9C82', '#9A4B7E')}${SH('dd', '#35121E00', '#35121EE6')}</defs>
<rect width="300" height="650" fill="url(#ixs-ds)"/>
<circle class="ix-pu" cx="150" cy="404" r="190" fill="url(#ixs-dg)"/>
${stars(10, 12, 90, '#fff')}
<clipPath id="ixs-dc"><rect y="0" width="300" height="404"/></clipPath><g clip-path="url(#ixs-dc)"><circle cx="150" cy="404" r="68" fill="url(#ixs-dsun)"/></g>
${cloud(10, 90, 1.1, '#FFE9E4', .85, 48)}${cloud(170, 170, .9, '#FFC9C0', .8, 64)}${cloud(40, 270, .8, '#F2A6B0', .7, 80)}${cloud(200, 320, .7, '#E58FA8', .7, 100)}
<rect y="404" width="300" height="130" fill="url(#ixs-dsea)"/>
${refl}
<g class="ix-tw" style="animation-duration:3s">${[[30, 440, 40], [90, 470, 56], [220, 450, 50], [250, 500, 34], [60, 510, 44], [180, 520, 40]].map(([x, y, w]) => `<path d="M${x} ${y}h${w}" stroke="#FFE0D0" stroke-width="2" stroke-linecap="round" opacity=".6"/>`).join('')}</g>
<g class="ix-wv" style="animation-duration:9s"><path d="M-60 428 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0" fill="none" stroke="#FFE9D8" stroke-width="1.6" stroke-linecap="round" opacity="0.35"/></g><g class="ix-wv ix-wv2" style="animation-duration:13s"><path d="M-60 446 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0" fill="none" stroke="#FFE9D8" stroke-width="1.6" stroke-linecap="round" opacity="0.3"/></g><g class="ix-wv" style="animation-duration:10s"><path d="M-60 468 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0 q12 -3 24 0 t24 0" fill="none" stroke="#FFE9D8" stroke-width="1.6" stroke-linecap="round" opacity="0.26"/></g><g class="ix-wv ix-wv2" style="animation-duration:15s"><path d="M-60 496 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0 q12 -4 24 0 t24 0" fill="none" stroke="#FFE9D8" stroke-width="1.6" stroke-linecap="round" opacity="0.22"/></g>
<g class="ix-bb"><path d="M186 424h34l-6 8h-22Z" fill="#6E2E3E"/><path d="M202 390v32M202 394l16 24h-16Z" fill="#FFE9E4" stroke="#6E2E3E" stroke-width="1.2" stroke-linejoin="round"/></g>
<path d="M214 408L226 392H262L270 408Z" fill="#7A3A4A"/>
<g><path d="M236 394L240 336H252L256 394Z" fill="#FFF3EE"/><path d="M237.600 372L238.400 358H253.600L254.400 372Z" fill="#E4455E"/><rect x="238" y="324" width="16" height="12" rx="2" fill="#FFE9A8"/><path d="M236 324L246 312L256 324Z" fill="#7A3A4A"/><path class="ix-bm" d="M254 330L330 308V348Z" fill="#FFE9A8" opacity=".35"/></g>
${bird(60, 120, -2, 26)}${bird(100, 150, -9, 32, .8)}${bird(220, 100, -15, 38, .9)}
<path d="M-10 540Q90 506 180 530T310 512V650H-10Z" fill="#8A3E5A"/>
<path d="M200 650L212 560Q250 520 310 514V650Z" fill="#5A2640"/>
<path d="M-10 650V474Q10 448 62 446Q128 442 176 452Q196 462 204 500L214 650Z" fill="#5A2640"/>
<path d="M-10 474Q10 448 62 446Q128 442 176 452Q190 458 196 474Q150 462 100 466Q40 470 -10 490Z" fill="#7A3A58"/>
<path d="M4 462Q40 448 70 450Q120 446 168 456" stroke="#FFB6A0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>
<path d="M-10 590L40 560 80 580 60 650H-10Z" fill="#3A1428"/><path d="M120 560L150 540 176 580 160 650H110Z" fill="#4A1E36"/>
${tuft(14, 450, '#F5B642', 18)}${tuft(26, 448, '#F5B642', 14)}${tuft(176, 454, '#F5B642', 16)}${tuft(272, 520, '#F5B642', 18)}
<g><path d="M44 452v-10" stroke="#FFE0E8" stroke-width="2"/><circle cx="44" cy="440" r="3.400" fill="#FF8AB0"/><path d="M168 456v-9" stroke="#FFE0E8" stroke-width="2"/><circle cx="168" cy="445" r="3" fill="#FFD24A"/></g>
${dust(10, 15, '#fff')}
<rect y="420" width="300" height="230" fill="url(#ixs-dd)"/>`);
}
export const SCENES = { autumn: sceneAutumn, twilight: sceneTwilight, meadow: sceneMeadow, coast: sceneCoast };
