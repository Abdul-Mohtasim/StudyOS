import React, { useEffect, useState } from "react";
import "./onboarding.css";

// Six read-only intro screens that replace the public landing page on phones.
// Cards, icons and text are display only. Only the buttons (Next, Back, Skip,
// Get started, Sign in, Create my account) do anything.
/* eslint-disable */
/* ===== palette (same as the approved screens) ===== */
const INK='#181b22',SL='#5a707a',LS='#7f949e',MV='#c7b9c4',FACE='#ecebeb',GR='#9ca0ab',SH='#9aa1ae';
const S=(w=4)=>`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const limb=(d,c,w=16)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w+8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand=(x,y,r=7)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${FACE}" ${S(3.5)}/>`;

/* ===== six characters (same people as the approved screens) ===== */
const P={
  1:{hair:'curly',jk:SL,ar:SL},
  2:{hair:'pony',jk:SL,ar:SL},
  3:{hair:'cap',jk:GR,ar:GR},
  4:{hair:'hijab',jk:SL,ar:SL},
  5:{hair:'curly',glasses:true,jk:'#22262e',ar:'#2f343d'},
  6:{hair:'long',jk:SL,ar:SL}
};
function head(p,cx,cy,drape=62){
  let back='',front='';
  const t=p.hair;
  if(t==='curly'){
    back=[[-22,-20,14],[0,-31,17],[22,-20,14],[-32,-4,10],[32,-4,10]].map(([x,y,r])=>`<circle cx="${cx+x}" cy="${cy+y}" r="${r}" fill="${INK}"/>`).join('');
    front=`<path d="M${cx-27} ${cy-11} Q${cx} ${cy-27} ${cx+27} ${cy-11}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${cx-27} ${cy-11} Q${cx} ${cy-27} ${cx+27} ${cy-11}" fill="none" stroke="${FACE}" stroke-width="4.5" stroke-linecap="round"/>`;
  }else if(t==='pony'){
    back=`<circle cx="${cx}" cy="${cy-6}" r="34" fill="${INK}"/><path d="M${cx+28} ${cy-16} C${cx+62} ${cy-26} ${cx+68} ${cy+20} ${cx+44} ${cy+36} C${cx+46} ${cy+12} ${cx+36} ${cy+2} ${cx+28} ${cy-4} Z" fill="${INK}"/>`;
    front=`<path d="M${cx-30} ${cy-2} Q${cx-30} ${cy-34} ${cx} ${cy-34} Q${cx+30} ${cy-34} ${cx+30} ${cy-2} Q${cx+14} ${cy-20} ${cx-8} ${cy-18} Q${cx-22} ${cy-16} ${cx-30} ${cy-2}Z" fill="${INK}"/><circle cx="${cx+31}" cy="${cy-12}" r="4.5" fill="${SL}"/>`;
  }else if(t==='cap'){
    front=`<path d="M${cx-32} ${cy-4} A32 30 0 0 1 ${cx+32} ${cy-4} Z" fill="${GR}" ${S()}/><rect x="${cx+10}" y="${cy-13}" width="40" height="9" rx="4.5" fill="${GR}" ${S()}/>`;
  }else if(t==='hijab'){
    back=`<path d="M${cx-38} ${cy+drape} C${cx-46} ${cy+8} ${cx-36} ${cy-40} ${cx} ${cy-40} C${cx+36} ${cy-40} ${cx+46} ${cy+8} ${cx+38} ${cy+drape} Z" fill="${SL}" ${S()}/>`;
    front=`<path d="M${cx-29} ${cy-3} Q${cx} ${cy-42} ${cx+29} ${cy-3} Q${cx} ${cy-18} ${cx-29} ${cy-3} Z" fill="${SL}" ${S(3.5)}/>`;
  }else if(t==='long'){
    back=`<path d="M${cx-34} ${cy+54} L${cx-34} ${cy-4} A34 34 0 0 1 ${cx+34} ${cy-4} L${cx+34} ${cy+54} Z" fill="${INK}"/>`;
    front=`<path d="M${cx-32} ${cy-4} A32 32 0 0 1 ${cx+32} ${cy-4} Q${cx} ${cy-20} ${cx-32} ${cy-4} Z" fill="${INK}"/><path d="M${cx-29} ${cy-13} Q${cx} ${cy-31} ${cx+29} ${cy-13}" fill="none" stroke="${LS}" stroke-width="6" stroke-linecap="round"/>`;
  }
  const ears=`<circle cx="${cx-30}" cy="${cy+4}" r="5.5" fill="${FACE}" ${S(3.5)}/><circle cx="${cx+30}" cy="${cy+4}" r="5.5" fill="${FACE}" ${S(3.5)}/>`;
  const face=`<circle cx="${cx}" cy="${cy}" r="30" fill="${FACE}" ${S()}/>`;
  const eyes=`<circle cx="${cx-11}" cy="${cy+3}" r="2.9" fill="${INK}"/><circle cx="${cx+11}" cy="${cy+3}" r="2.9" fill="${INK}"/><path d="M${cx-9} ${cy+14} Q${cx} ${cy+22} ${cx+9} ${cy+14}" fill="none" ${S(3)}/>`;
  const gl=p.glasses?`<circle cx="${cx-12}" cy="${cy+3}" r="10" fill="none" ${S(3)}/><circle cx="${cx+12}" cy="${cy+3}" r="10" fill="none" ${S(3)}/><path d="M${cx-2} ${cy+3} H${cx+2}" ${S(3)}/>`:'';
  return {back, front:ears+face+eyes+gl+front};
}
function torso(p,y0,y1,bag=true){
  return `<path d="M70 ${y0+10} Q70 ${y0} 82 ${y0} L118 ${y0} Q130 ${y0} 130 ${y0+10} L130 ${y1} L70 ${y1} Z" fill="${p.jk}" ${S()}/>
  <path d="M89 ${y0} L111 ${y0} L111 ${y1} L89 ${y1} Z" fill="${FACE}" ${S(3.5)}/>
  <path d="M87 ${y0} L100 ${y0+20} L113 ${y0} Z" fill="${p.jk}" ${S(3.5)}/>
  <path d="M80 ${y0+3} L113 ${y1-14}" fill="none" ${S(3.5)}/>`+
  (bag?`<rect x="118" y="${y1-34}" width="34" height="29" rx="7" fill="${LS}" ${S()}/>`:'');
}
const neck=(y)=>`<rect x="93" y="${y}" width="14" height="14" fill="${FACE}" ${S(3.5)}/>`;
const shoes=(y)=>`<rect x="70" y="${y}" width="32" height="16" rx="8" fill="${FACE}" ${S()}/><rect x="98" y="${y}" width="32" height="16" rx="8" fill="${FACE}" ${S()}/>`;
const legs=(y0,h)=>`<rect x="79" y="${y0}" width="20" height="${h}" fill="${MV}" ${S()}/><rect x="101" y="${y0}" width="20" height="${h}" fill="${MV}" ${S()}/>`;
const watch=(x,y)=>`<rect x="${x-4}" y="${y-22}" width="8" height="7" rx="2" fill="${GR}" ${S(3)}/><circle cx="${x}" cy="${y}" r="15" fill="${FACE}" ${S(3.5)}/><path d="M${x} ${y} V${y-8} M${x} ${y} L${x+7} ${y+4}" fill="none" ${S(3)}/>`;

/* standing: viewBox 0 0 200 230, feet at 218 */
function stand(p,o={}){
  const h=head(p,100,58);
  let arms='';
  if(o.wave){arms+=limb('M124 104 Q152 108 150 80',p.ar)+hand(150,70);}
  else if(o.books){arms+=limb('M126 104 Q138 132 124 148',p.ar)+hand(124,150);}
  else arms+=limb('M124 104 Q134 130 128 150',p.ar)+hand(128,154);
  if(o.tablet){arms+=`<rect x="44" y="146" width="32" height="40" rx="6" fill="${LS}" ${S()}/>`+limb('M76 104 Q62 126 62 150',p.ar)+hand(62,156);}
  else if(o.books){arms+=`<rect x="70" y="142" width="60" height="11" rx="2" fill="${SL}" ${S(3.5)}/><rect x="74" y="131" width="52" height="11" rx="2" fill="${FACE}" ${S(3.5)}/>`+limb('M76 104 Q64 132 78 148',p.ar)+hand(78,150);}
  else arms+=limb('M76 104 Q66 130 72 150',p.ar)+hand(72,154);
  const sh=o.shadow?`<ellipse cx="100" cy="222" rx="50" ry="6" fill="${SH}" opacity=".85"/>`:'';
  return `<svg class="${o.cls||''} ob-char" viewBox="0 0 200 230" aria-hidden="true">${sh}${h.back}${legs(168,46)}${shoes(204)}${neck(84)}${torso(p,92,170,!o.books)}${arms}${h.front}</svg>`;
}
/* sitting on an edge: viewBox 0 0 200 222, seat line at y=150 */
function sit(p,o={}){
  const h=head(p,100,48,58);
  let extra='',arms=limb('M76 96 Q64 122 70 146',p.ar)+hand(72,150);
  if(o.raise==='watch'){arms+=limb('M124 96 Q158 100 156 74',p.ar)+hand(156,70)+watch(158,48);}
  if(o.raise==='phone'){
    arms+=`<rect x="104" y="100" width="26" height="40" rx="5" fill="${LS}" ${S(3.5)}/><path d="M111 119 l5 5 l9 -10" fill="none" stroke="${FACE}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`+limb('M124 96 Q142 126 118 136',p.ar)+hand(114,138);
    extra=`<circle cx="164" cy="26" r="13" fill="none" stroke="${SL}" stroke-width="3.2"/><path d="M158 26 l4.5 4.5 l8 -9" fill="none" stroke="${SL}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<svg class="${o.cls||''} ob-char" viewBox="0 0 200 222" aria-hidden="true">${h.back}${o.noLegs?'':legs(142,60)+shoes(196)}<rect x="72" y="136" width="56" height="18" rx="7" fill="${MV}" ${S()}/>${neck(72)}${torso(p,82,150,true)}${arms}${h.front}${extra}</svg>`;
}
/* peeking over a card, one arm resting on the edge, one hanging down over the face of the card */
function peek(p){
  const h=head(p,100,50);
  const rest=limb('M74 98 Q54 108 60 121',p.ar)+limb('M60 121 H96',p.ar)+hand(100,121);
  const main=`<svg class="ob-main" viewBox="0 0 200 130" style="display:block;overflow:visible;width:100%;height:auto" aria-hidden="true">${h.back}${neck(70)}<path d="M70 132 V96 Q70 82 84 82 L116 82 Q130 82 130 96 V132 Z" fill="${p.jk}" ${S()}/><path d="M89 82 H111 V132 H89 Z" fill="${FACE}" ${S(3.5)}/><path d="M87 82 L100 102 L113 82 Z" fill="${p.jk}" ${S(3.5)}/>${limb('M126 98 Q138 112 138 130',p.ar)}${rest}${h.front}</svg>`;
  const front=`<svg class="ob-front" viewBox="0 0 200 90" aria-hidden="true">${limb('M138 -6 Q138 20 136 44',p.ar)}${hand(136,52)}</svg>`;
  return `<div class="ob-char ob-peek" aria-hidden="true">${main}${front}</div>`;
}
/* lying on its side on top of a button, propped on one fist */
function lie(p){
  const h=head(p,52,52,12);
  const bulb=`<g fill="none" stroke="${SL}" stroke-width="3" stroke-linecap="round"><circle cx="92" cy="-6" r="11"/><path d="M88 7 h8 M89.5 12 h5"/><path d="M92 -26 v-4 M108 -20 l3 -3 M76 -20 l-3 -3 M114 -6 h4"/></g>`;
  return `<svg class="ob-char ob-lie" viewBox="0 -38 300 132" aria-hidden="true">${bulb}${h.back}
  <rect x="190" y="52" width="74" height="40" rx="12" fill="${MV}" ${S()}/><path d="M194 72 H262" ${S(3.5)}/><rect x="262" y="50" width="24" height="42" rx="10" fill="${FACE}" ${S()}/>
  <path d="M88 52 Q88 44 98 44 L186 44 Q198 44 198 56 V82 Q198 92 188 92 H98 Q88 92 88 82 Z" fill="${p.jk}" ${S()}/>
  <path d="M130 44 L150 92" fill="none" ${S(3.5)}/>
  ${h.front}
  ${limb('M96 62 Q94 90 66 88',p.ar)}${hand(60,87)}
  </svg>`;
}
function hero(){
  return `<svg viewBox="0 0 260 280" aria-hidden="true"><circle cx="130" cy="138" r="112" fill="${MV}"/><g transform="translate(30,30)">${stand(P[1],{wave:true,tablet:true,shadow:true,cls:'ob-inner'}).replace('class="ob-inner ob-char"','').replace('<svg ','<svg x="0" y="0" width="200" height="230" ')}</g></svg>`;
}

/* ===== icons: simple, hand-drawn on a 24 grid, one per topic ===== */
const I={
  tasks:'<rect x="5" y="5" width="14" height="16" rx="3"/><rect x="9" y="3" width="6" height="4" rx="1.6"/><path d="M8.6 13l2 2 3.8-4"/>',
  planner:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14.5" r=".9" fill="currentColor"/><circle cx="12" cy="14.5" r=".9" fill="currentColor"/><circle cx="15.5" cy="14.5" r=".9" fill="currentColor"/>',
  hourglass:'<path d="M7 3.5h10M7 20.5h10M8 3.5c0 5 4 5.5 4 8.5s-4 3.5-4 8.5M16 3.5c0 5-4 5.5-4 8.5s4 3.5 4 8.5"/>',
  timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 3.5h5M18.6 6l1.4-1.4"/>',
  flame:'<path d="M12 3c.6 3.2 5.2 5 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.1 1-3.4 2.2-4.4 0 2.1.9 3 1.9 3 .4-3-.9-5.2 1.1-8.8z"/>',
  pie:'<path d="M11 5a8 8 0 1 0 8 8h-8z"/><path d="M14.5 3.6a7.8 7.8 0 0 1 5.9 5.9h-5.9z"/>',
  notes:'<path d="M7 3.5h7l4.5 4.5v11.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M14 3.5V8h4.5M8.6 12.5h6.8M8.6 16h4.6"/>',
  cards:'<rect x="8" y="3.5" width="12.5" height="10" rx="2.6"/><rect x="3.5" y="9.5" width="12.5" height="10.5" rx="2.6" fill="var(--ob-iconbox)"/>',
  grades:'<path d="M5 20.5V11M10 20.5V5M15 20.5v-6.5M20 20.5V8.5"/>',
  maths:'<path d="M6.5 3.8v6.4M3.3 7h6.4M14.5 7h6.2M4.4 14.8l5.2 5.2M9.6 14.8L4.4 20M14.5 16h6.2M14.5 19.4h6.2"/>',
  physics:'<ellipse cx="12" cy="12" rx="9.5" ry="3.9"/><ellipse cx="12" cy="12" rx="9.5" ry="3.9" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.9" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  chem:'<path d="M9.5 3.5h5M10.5 3.5v6l-5.2 9a1.6 1.6 0 0 0 1.4 2.3h10.6a1.6 1.6 0 0 0 1.4-2.3l-5.2-9v-6M7.6 15h8.8"/>',
  bio:'<path d="M5 19c0-8.5 5-14 15-14 0 10-6 15-14.5 15M5 19c3-4.2 6.2-6.4 9.5-8.2"/>',
  english:'<path d="M12 6.6C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.6 2-1.6 5-2.1 8.5-1.6V5c-3.5-.5-6.5 0-8.5 1.6zM12 6.6v13"/>',
  code:'<path d="M8.5 8L4 12l4.5 4M15.5 8l4.5 4-4.5 4M13.3 5.5l-2.6 13"/>',
  history:'<path d="M4 9.5L12 4l8 5.5M5.5 9.5h13M7.2 9.5v8M12 9.5v8M16.8 9.5v8M4.5 20h15M5 17.5h14"/>',
  other:'<path d="M12 3.5c.7 4.5 2 5.8 6.5 6.5-4.5.7-5.8 2-6.5 6.5-.7-4.5-2-5.8-6.5-6.5 4.5-.7 5.8-2 6.5-6.5z"/><path d="M18.5 16.5v4M16.5 18.5h4"/>',
  offline:'<path d="M2.5 9.5a14 14 0 0 1 19 0M6 13a9 9 0 0 1 12 0M9.3 16.4a4.4 4.4 0 0 1 5.4 0"/><circle cx="12" cy="19.6" r=".9" fill="currentColor"/><path d="M4 4l16 16"/>',
  sync:'<path d="M19.5 9a8 8 0 0 0-14.3-2M4.5 4v3.6h3.6M4.5 15a8 8 0 0 0 14.3 2M19.5 20v-3.6h-3.6"/>',
  bell:'<path d="M6 17.5V11a6 6 0 0 1 12 0v6.5l1.5 1.5h-15zM10 21.5h4"/>',
  mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M4.5 8l7.5 5.6L19.5 8"/>',
  grad:'<path d="M3 9.5L12 5l9 4.5-9 4.5z"/><path d="M7 12v4c1.4 1.3 3.2 2 5 2s3.6-.7 5-2v-4"/>',
  back:'<path d="M14.5 5.5L8 12l6.5 6.5"/>'
};
const ic=(k,sw=1.8)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
const card=(k,t,d,x='',cls='')=>`<div class="ob-card ${cls}"><div class="ob-ico">${ic(k)}</div><div><h3>${t}</h3><p>${d}</p></div>${x}</div>`;
const nav=(n,skip=true)=>`<div class="ob-nav"><button type="button" class="ob-navbtn" data-act="back" aria-label="Back">${ic('back',2)}</button><div class="ob-bars">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'ob-on':''}"></i>`).join('')}</div>${skip?'<button type="button" class="ob-skip" data-act="skip">Skip</button>':'<span class="ob-skip"></span>'}</div>`;
const head2=(t,d)=>`<div class="ob-head"><h2>${t}</h2><p>${d}</p></div>`;

/* ===== the six screens ===== */
const screens=[
 {html:`
  <div class="ob-logo"><b>${ic('grad',1.8)}</b><span>Study<em>OS</em></span></div>
  <div class="ob-hero">${hero()}</div>
  <h1 class="ob-h1">Plan, focus and learn in one calm place.</h1>
  <p class="ob-lead">Tasks, notes, flashcards and a focus timer that work even without internet.</p>
  <button type="button" class="ob-btn" data-act="next">Get started</button>
  <p class="ob-signin">Already have an account? <button type="button" class="ob-linkbtn" data-act="login">Sign in</button></p>`},
 {html:`
  ${nav(1)}${head2('Plan your day','Everything you need to stay on top of your studies.')}
  <div class="ob-list" style="margin-top:6cqw">
   ${card('tasks','Tasks','Add tasks with a subject, priority and due date, then tick them off as you go.',peek(P[2]),'ob-pad')}
   ${card('planner','Weekly planner','Lay out your week day by day and see how much you have finished.')}
   ${card('hourglass','Exam countdowns','Save your exam dates and watch the days count down on your dashboard.')}
  </div>
  <div class="ob-bottom"><button type="button" class="ob-btn" data-act="next">Next</button></div>`},
 {html:`
  ${nav(2)}${head2('Stay focused','A focus timer made for study sessions.')}
  <div class="ob-list" style="margin-top:2cqw">
   <div class="ob-card ob-dark"><div class="ob-ring"><span>25:00</span></div><div><h3>Focus timer</h3><p>Start a session, pick a subject and the timer keeps count for you.</p></div>${sit(P[3],{raise:'watch',cls:'ob-sit ob-r'})}</div>
   ${card('timer','Focus and break rounds','Pomodoro style cycles, with optional auto start.')}
   ${card('flame','Daily goal and streaks','Set a daily target and keep your study streak alive.')}
   ${card('pie','Time per subject','See how many minutes each subject gets.')}
  </div>
  <div class="ob-bottom"><button type="button" class="ob-btn" data-act="next">Next</button></div>`},
 {html:`
  ${nav(3)}${head2('Learn and remember','Notes, flashcards and grades in one place.')}
  <div class="ob-qwrap"><div class="ob-q"><small>QUESTION</small><strong>What is the powerhouse of the cell?</strong></div></div>
  <div class="ob-list">
   ${card('notes','Notes','Write and pin notes for every subject.')}
   ${card('cards','Flashcards','Turn notes into cards and review them with spaced repetition.')}
   ${card('grades','Grades','Track your marks and see your progress over time.')}
  </div>
  <div class="ob-bottom ob-reserve"><button type="button" class="ob-btn" data-act="next">Next${lie(P[4])}</button></div>`},
 {html:`
  ${nav(4)}${head2('Made for every subject','Your subjects show up in tasks, the planner, focus sessions and grades.')}
  <div class="ob-grid" style="margin-top:8cqw">
   <div class="ob-cell"><div class="ob-ico">${ic('maths')}</div>Mathematics</div>
   <div class="ob-cell"><div class="ob-ico">${ic('physics')}</div>Physics${stand(P[5],{books:true,cls:'ob-stand'})}</div>
   <div class="ob-cell"><div class="ob-ico">${ic('chem')}</div>Chemistry</div>
   <div class="ob-cell"><div class="ob-ico">${ic('bio')}</div>Biology</div>
   <div class="ob-cell"><div class="ob-ico">${ic('english')}</div>English</div>
   <div class="ob-cell"><div class="ob-ico">${ic('code')}</div>Computer Science</div>
   <div class="ob-cell"><div class="ob-ico">${ic('history')}</div>History</div>
   <div class="ob-cell"><div class="ob-ico">${ic('other')}</div>Any other subject</div>
  </div>
  <div class="ob-bottom"><button type="button" class="ob-btn" data-act="next">Next</button></div>`},
 {html:`
  ${nav(5,false)}${head2('Study anywhere','StudyOS keeps working when your connection does not.').replace('class="ob-head"','class="ob-head" style="max-width:none"')}
  <div class="ob-list" style="margin-top:4cqw">
   ${card('offline','Works offline','Keep studying without internet. Your changes are saved on your phone.')}
   ${card('sync','Syncs automatically','When internet returns, everything updates by itself.')}
   ${card('bell','Study reminders','Gentle nudges at the times you choose.')}
   ${card('mail','Email updates','Optional reminders and summaries in your inbox.')}
  </div>
  <div class="ob-bottom ob-reserve"><button type="button" class="ob-btn" data-act="register">Create my account${sit(P[6],{raise:'phone',noLegs:true,cls:'ob-sit ob-l'})}</button><button type="button" class="ob-btn ob-alt" data-act="login">I already have an account</button></div>`}
];

export default function Onboarding({ onLogin, onRegister }) {
  const [step, setStep] = useState(0);
  const last = screens.length - 1;

  // Match the page edges to the light screen while onboarding is open.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.background;
    root.style.background = "#dedcdd";
    return () => {
      root.style.background = previous;
    };
  }, []);

  function handleClick(event) {
    const el = event.target.closest("[data-act]");
    if (!el) return;
    const act = el.getAttribute("data-act");
    if (act === "next") setStep((s) => Math.min(last, s + 1));
    else if (act === "back") setStep((s) => Math.max(0, s - 1));
    else if (act === "skip") setStep(last);
    else if (act === "login") onLogin && onLogin();
    else if (act === "register") onRegister && onRegister();
    window.scrollTo(0, 0);
  }

  return (
    <main className="ob" aria-label={"Welcome to StudyOS, screen " + (step + 1) + " of " + screens.length}>
      <div className="ob-screen" onClick={handleClick}>
        <div
          key={step}
          className="ob-in"
          dangerouslySetInnerHTML={{ __html: screens[step].html }}
        />
      </div>
    </main>
  );
}
