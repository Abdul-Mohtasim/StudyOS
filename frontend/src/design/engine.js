/* eslint-disable */
// StudyOS main app screens (app only). Ported from the approved design file StudyOS_Final_Design_v14.html.
import { haptic } from "../haptics";
import "./design.css";
import "./v122.css";
import qrcode from "qrcode-generator";
import { SCENES, createSoundscape } from "./soundscapes";
import { createPolish } from './polish.js';
import { createFlame } from './flame.js';
import { FLM, flameSvg, FLAME_PAL, flameInner, flameIconHtml } from './flameicon.js';
import { TROPHIES, NAV_LEAGUE } from './trophies.js';
import { playStreakClip } from './streaksound.js';
import { avatarSvg, avDecode, avEncode, avBg, CH_BG, AVD, AVK, ZIP_CHR, TABS as AVTABS } from './avatar.js'; import { mascotHtml } from '../mascot'; import { appIconRowHtml, appIconPageBody, bindAppIconPage, appIconSupported } from '../icons/appIconUI.js';
import { LANGS, setLanguage, getLanguage, translate as tr, englishText as en0 } from "../i18n";

export function mountDesign(host, opts = {}) {
host.classList.add('dz');host.setAttribute('data-own-haptics','');
const stage=document.createElement('div');stage.className='dz-stage';host.appendChild(stage);
let R=null,RUN=0,CUR=0,TABSW=false,LAMPX=null;
const P=createPolish(host,stage);
const SCREENS=[];
const IDX=t=>SCREENS.findIndex(s=>s.t===t);
const HMAP={tick:'tap',light:'tap',medium:'press',heavy:'confirm',success:'success',hard:'welcome',thud:'press',buzz:'error',tap:'tap',celebrate:'celebrate',streakBuild:'streakBuild',streakIgnite:'streakIgnite',streakRoll:'streakRoll',streakLand:'streakLand'};
const S={sound:false,haptics:true,unlocked:true,mute:false};
// Optimistic update: change the list first, tell the server after, and undo with a message if it fails.
function optRemoveFriend(id,repaint){
  const old=D.friends||[];
  D.friends=old.filter(f=>String(f.id)!==String(id));
  Promise.resolve().then(()=>CB.removeFriend?CB.removeFriend(id):null).catch(()=>null).then(r=>{
    if(r&&r.ok){hap('success');return}
    D.friends=old;hap('buzz');
    try{repaint&&repaint()}catch(_){}
    toast((r&&r.message)||'Could not remove that friend. They are back on your list.');
  });
}
function hap(k){if(!S.haptics)return;const n=HMAP[k];if(n&&haptic[n])haptic[n]()}
const timers=[];
const at=(ms,fn)=>{const my=RUN;timers.push(setTimeout(()=>{if(my===RUN)fn()},ms))};
const $=(s,r=document)=>r.querySelector(s);
const rv=(el,a='a-pop')=>{if(typeof el==='string')el=$(el,R);if(!el)return;el.classList.remove('hid');el.classList.add(a);return el};
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const rnd=(a,b)=>a+Math.random()*(b-a);
const nop=()=>{};
const DZ={};let SOFT=false;
const sfx=new Proxy({},{get:()=>nop});   // no sound on taps (haptics only)
const E=(ms,s,h,fn)=>at(ms,()=>{if(s)s();if(h)hap(h);if(fn)fn()});
const fx=(el,kf,o)=>el&&el.animate(kf,Object.assign({duration:350,easing:'cubic-bezier(.2,.9,.3,1)',fill:'both'},o));
const rise=(sel,d=0,st=60)=>$$(sel,R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:380,delay:d+i*st,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
const U={i:0,sel:{},name:'',streak:6,done:false,tok:0,dlg:0};
const HOMEI=()=>IDX('Home');
const D=opts.data||{};   // live data from the app (see App.jsx)
const CB=opts.actions||{};
/* the avatar the student made (empty until they save one) */
const hasAv=()=>typeof D.avatar==='string'&&D.avatar!=='';
const chOn=()=>hasAv()&&avDecode(D.avatar).chr>0;
const avPb=v=>v.chr>0?CH_BG:avBg(v);
const myAva=()=>hasAv()?avatarSvg(avDecode(D.avatar),{view:'full',cls:'pfava'}):window.AVA;
const AVU=()=>hasAv()?avatarSvg(avDecode(D.avatar),{view:'full',bg:true,style:'width:100%;height:100%;display:block'}):avatarSvg(Object.assign(avDecode(''),{chr:ZIP_CHR}),{view:'full',bg:true,style:'width:100%;height:100%;display:block'});

/* ---------- icons ---------- */
const FLAME_IC=flameIconHtml(16);
const CUBE='<svg viewBox="6 -41 453 548" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet"><path d="M175 5L275 35L395 130L415 335L385 425L215 462L50 250Z" fill="#ff4a6d"/><path d="M275 35L205 205L210 232L285 350L412 335L275 35Z" fill="#ff617f"/><path d="M275 35L395 130L415 335L412 335Z" fill="#f993ac"/><path d="M50 250L210 232L285 350L215 462Z" fill="#ff335f"/><path d="M285 350L412 335L385 425L215 462Z" fill="#ff4a6d"/></svg>';
const BOLT='<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="#e8a83a"/></svg>';
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="#ebe8ea" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>';
const FO='M50 3C54 22 90 38 90 78c0 24-18 40-40 40S10 102 10 78c0-18 9-28 17-38 3 10 9 15 15 15-3-20 0-38 8-52z';
const FI='M50 66c7 10 14 18 14 27 0 9-6 15-14 15s-14-6-14-15c0-9 7-17 14-27z';

const hexPts='50,2 96,28 96,84 50,110 4,84 4,28';
function burst(x,y,n,o={}){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const{colors=['#c9b8c3','#2f8f6a','#4a6fd0','#e8a83a'],speed=260,life=1200,fall=260,size=[6,12],round=false,up=false}=o;
  for(let i=0;i<n;i++){
    const el=document.createElement('i');el.className='p';const w=rnd(size[0],size[1]);
    el.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${round?w:w*.5}px;border-radius:${round?'50%':'2px'};background:${colors[i%colors.length]}`;
    R.appendChild(el);
    const ang=up?rnd(-Math.PI*.95,-Math.PI*.05):rnd(0,Math.PI*2),v=speed*rnd(.35,1.05),dx=Math.cos(ang)*v,dy=Math.sin(ang)*v,r=rnd(-540,540);
    const a=el.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx*.7}px,${dy*.7}px) rotate(${r*.5}deg)`,opacity:1,offset:.4},{transform:`translate(${dx}px,${dy+fall}px) rotate(${r}deg)`,opacity:0}],{duration:life*rnd(.8,1.2),easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'});
    a.onfinish=()=>el.remove();
  }
}
function fly(x1,y1,x2,y2,html,ms,cb){
  const el=document.createElement('div');el.className='p';el.style.cssText=`left:${x1}px;top:${y1}px;margin:-9px 0 0 -9px;width:18px;height:18px`;el.innerHTML=html;R.appendChild(el);
  const a=el.animate([{transform:'translate(0,0) scale(.6)',opacity:0},{transform:`translate(${(x2-x1)*.15}px,${(y2-y1)*.1-30}px) scale(1.1)`,opacity:1,offset:.25},{transform:`translate(${x2-x1}px,${y2-y1}px) scale(.8)`,opacity:1}],{duration:ms,easing:'cubic-bezier(.5,0,.8,.6)',fill:'forwards'});
  a.onfinish=()=>{el.remove();cb&&cb()};
}
function count(el,from,to,ms,fmt=v=>Math.round(v)){
  const my=RUN,st=performance.now();(function f(n){if(my!==RUN)return;const p=Math.min(1,(n-st)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(f)})(st);
}
const bump=el=>el.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:240,easing:'ease-out'});
const NS0="";
/* ---- core pages ---- */
/* ---------- PDF pages ---------- */
const ic=(d,x='')=>`<svg class="ic" viewBox="0 0 24 24" ${x}>${d}</svg>`;
const ICO={
 search:ic('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>','fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"'),
 bell:ic('<path d="M12 22a2.4 2.4 0 002.3-1.8H9.7A2.4 2.4 0 0012 22zM18 16V11c0-3.1-1.6-5.6-4.5-6.3V4a1.5 1.5 0 00-3 0v.7C7.6 5.4 6 7.9 6 11v5l-2 2v1h16v-1z"/>','fill="currentColor"'),
 back:ic('<path d="M6 6l12 12M18 6L6 18"/>','fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"'),
 chev:ic('<path d="M9 5v14l9-7z"/>','fill="#4b5d6d"'),
 x:ic('<path d="M5 5l14 14M19 5L5 19"/>','fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"'),
 share:ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.5 10.5l7-4M8.5 13.5l7 4" stroke="currentColor" stroke-width="2" fill="none"/>','fill="currentColor"'),
 cal:ic('<rect x="3" y="4" width="18" height="17" rx="2.5" fill="currentColor"/><rect x="7" y="2" width="2" height="4" fill="currentColor"/><rect x="15" y="2" width="2" height="4" fill="currentColor"/><rect x="5.5" y="9" width="13" height="10" fill="var(--pg)"/>','fill="none"'),
 plus:ic('<path d="M12 5v14M5 12h14"/>','fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"'),
 mic:ic('<rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>','fill="none"'),
 clk:ic('<circle cx="12" cy="12" r="10" fill="#4b5d6d"/><path d="M12 6.5V12l3.5 2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>','fill="none"'),
 moon:ic('<path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z"/>','fill="currentColor"'),
 cloud:ic('<path d="M7 19a5 5 0 01-.6-9.96A6 6 0 0118 10.5 4.2 4.2 0 0117.5 19z"/>','fill="currentColor"'),
 dl:ic('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>','fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"'),
 ppl:ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6z"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14c3 0 4.8 1.6 4.8 5H17.5c0-2-.5-3.700-1.700-4.800z"/>','fill="currentColor"'),
 tsk:ic('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 12.500l3 3 6-6.500" stroke="#c9b8c3" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>','fill="#1b1e25"'),
 note:ic('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M12 3v18" stroke="#c9b8c3" stroke-width="2"/>','fill="#1b1e25"'),
 card:ic('<rect x="8" y="3" width="13" height="13" rx="2.500"/><path d="M5 7.500v10a2.500 2.500 0 002.500 2.500H17v-2H7.500a.5.5 0 01-.5-.5v-10z"/>','fill="#1b1e25"'),
 bolt:'',
};
const NAVI={
 home:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
 tasks:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor"/><path d="M7.5 12.500l3 3 6-6.500" fill="none" stroke="var(--cut)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 focus:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9.500" y="1.500" width="5" height="3" rx="1"/><circle cx="12" cy="13.500" r="8.500"/><path d="M12 8.500v5l2.800 2" fill="none" stroke="var(--cut)" stroke-width="2.200" stroke-linecap="round"/></svg>',
 study:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="8" y="3" width="13" height="13" rx="2.500"/><path d="M5 7.500v10a2.500 2.500 0 002.500 2.500H17v-2H7.500a.5.5 0 01-.5-.5v-10z"/></svg>',
 profile:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.500" r="4.500"/><path d="M3.500 21c0-4.500 3.800-7 8.500-7s8.500 2.500 8.500 7z"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="7.500" cy="12" r="1.700" fill="var(--cut)"/><circle cx="12" cy="12" r="1.700" fill="var(--cut)"/><circle cx="16.500" cy="12" r="1.700" fill="var(--cut)"/></svg>'
};
// The last tab is "More". It opens a small menu with Shop and Profile, so the Profile page lights up "More" too.
const nav=a=>`<div class="nav"><i class="lamp" aria-hidden="true"></i>${[['home','Home'],['tasks','Tasks'],['focus','Focus'],['study','Study'],['league','League'],['more','More']].map(([k,l])=>`<div class="nv${k===a||(k==='more'&&a==='profile')?' on':''}" data-k="${k}"${k==='more'?' role="button" aria-haspopup="menu" aria-label="More: Shop and Profile"':''}>${k==='league'?`<img class="nvi" src="${NAV_LEAGUE}" alt="" draggable="false">`:NAVI[k]}${l}</div>`).join('')}</div>`;
const AVH=()=>avatarSvg(hasAv()?avDecode(D.avatar):Object.assign(avDecode(''),{chr:ZIP_CHR}),{view:'head',bg:true,style:'width:100%;height:100%;display:block'});
const tb=()=>`<div class="tb"><div class="tbp" data-pfgo role="button" aria-label="Open my profile">${AVH()}</div><div data-stkopen role="button" aria-label="Open my streak" style="display:flex;align-items:center;gap:7px;cursor:pointer">${FLM((D.streak||0)>0?'currentColor':'#5a666f','var(--pg)',24,28)}<span${(D.streak||0)>0?' style="color:#ff4b5c"':''}>${D.streak||0}</span></div><div data-shopgo role="button" aria-label="Open the Gem Shop" style="display:flex;align-items:center;gap:7px;cursor:pointer"><div style="width:22px;height:22px">${CUBE}</div><span>${(D.gems||0).toLocaleString()}</span></div><div class="sp"></div>${ICO.search}</div>`;
const ring=(sz,sw,pct,col,tr)=>{const r=(sz-sw)/2,c=2*Math.PI*r;return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${tr}" stroke-width="${sw}"/><circle class="rp" data-c="${c}" data-p="${pct}" cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c} ${c}" stroke-dashoffset="${c*(1-pct)}"/></svg>`};
const hdr=(l,r)=>`<div class="hd"><span style="width:24px">${l||''}</span><b>%T%</b><span style="width:24px">${r||''}</span></div>`;
const head=(t,l,r)=>hdr(l,r).replace('%T%',t);
const tg=(off)=>`<div class="tg${off?' off':''}"></div>`;
const trow=(t,tag,meta,ck)=>`<div class="trow"><div class="cb${ck?' ck':''}">${ck?CHECK:''}</div><div><div class="tt">${t}</div><div class="meta"><span class="tag">${tag}</span><span class="mt">${meta}</span></div></div></div>`;
const hex=(col,inner)=>`<svg viewBox="0 0 100 112"><polygon points="${hexPts}" fill="${col}"/>${inner}</svg>`;
const STAR=c=>`<polygon points="50,28 58,47 79,49 63,63 68,83 50,72 32,83 37,63 21,49 42,47" fill="${c}"/>`;
const CKB=c=>`<rect x="28" y="34" width="44" height="44" rx="8" fill="#fff"/><path d="M38 57l8 8 16-17" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const SUN='<circle cx="50" cy="56" r="11" fill="#fff"/><g fill="#fff"><rect x="48" y="30" width="4" height="8"/><rect x="48" y="74" width="4" height="8"/><rect x="24" y="54" width="8" height="4"/><rect x="68" y="54" width="8" height="4"/></g>';
const MOON='<path d="M62 33a24 24 0 1 0 14 36 20 20 0 0 1-14-36z" fill="#fff"/>';
const BOOK='<rect x="30" y="34" width="40" height="44" rx="4" fill="#3d5163"/><rect x="48" y="34" width="4" height="44" fill="#c8c6c8"/>';
const CLKH='<circle cx="50" cy="56" r="24" fill="#3d5163"/><path d="M50 42v15l10 6" stroke="#c8c6c8" stroke-width="5" fill="none" stroke-linecap="round"/>';
const CALH='<rect x="26" y="34" width="48" height="44" rx="6" fill="#3d5163"/><rect x="26" y="34" width="48" height="12" rx="4" fill="#3d5163"/><rect x="34" y="26" width="5" height="12" rx="2" fill="#3d5163"/><rect x="61" y="26" width="5" height="12" rx="2" fill="#3d5163"/><rect x="32" y="50" width="36" height="22" fill="#c8c6c8"/>';
const bdg=(h,l,lk)=>`<div class="badge${lk?' lk':''}">${h}<span>${l}</span></div>`;
const homeInner=()=>homeInnerReal();
const wrap=(inner,dark)=>`<div class="scr n${dark?' nd':''}">${inner}</div>`;

function enter(){if(SOFT)return;if(TABSW){hap('light');return}
  $$('.pg > *',R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:380,delay:i*45,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
  $$('.rp',R).forEach(c=>{const L=+c.dataset.c,p=+c.dataset.p;c.animate([{strokeDashoffset:L},{strokeDashoffset:L*(1-p)}],{duration:900,delay:200,easing:'cubic-bezier(.3,.8,.3,1)',fill:'backwards'})});
  $$('.bar2 i',R).forEach(b=>{b.style.transformOrigin='left';b.animate([{transform:'scaleX(0)'},{transform:'none'}],{duration:800,delay:250,easing:'cubic-bezier(.3,.8,.3,1)',fill:'backwards'})});
  $$('.nav,.fab,.snack',R).forEach(el=>el.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:420,delay:300,easing:'ease-out',fill:'backwards'}));
  hap('light');
}
const NS='No sound on this page. It is a static screen.';
const pg=(t,d,m,h,html,play)=>({t,d,spec:{m,h,s:NS},html,play:play||enter});

SCREENS.push(
pg('Home','Light theme, daily goal, exam mode, tasks','Content rises in with a short stagger, the daily goal ring and exam bar fill, and the tab bar slides up.','Light tap on arrival.',()=>wrap(homeInner())),
pg('Home dark','Midnight theme version of Home','Same layout in the Midnight theme.','Light tap on arrival.',()=>wrap(homeInner(),true)),
pg('Quick add','Bottom sheet: task, note, flashcard','The home screen dims and the sheet slides up from the bottom.','Light tap when the sheet lands.',()=>wrap(homeInner()+`<div class="ov"></div><div class="sheet"><div class="hdl"></div><div style="font:700 20px var(--display)">Quick add</div><div class="tile3"><div><b>${ICO.tsk}</b>Task</div><div><b>${ICO.note}</b>Note</div><div><b>${ICO.card}</b>Flashcard</div></div><div class="input">Revise cell biology</div><div class="chips" style="flex-wrap:nowrap"><span class="chip on">Biology</span><span class="chip">Maths</span><span class="chip">Physics</span><span class="chip">Today</span></div><div class="btn2" style="margin-top:14px">Add</div></div>`),()=>{
  $('.ov',R).animate([{opacity:0},{opacity:1}],{duration:260,fill:'backwards'});
  $('.sheet',R).animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});hap('light')}),
pg('Set your goals','Onboarding step 2 of 3','Progress segments, then each group of chips rises in. The reminder toggle sits at the bottom.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:44px"><div style="display:flex;gap:6px"><i style="flex:1;height:5px;border-radius:3px;background:#1b1e25"></i><i style="flex:1;height:5px;border-radius:3px;background:#1b1e25"></i><i style="flex:1;height:5px;border-radius:3px;background:var(--track)"></i></div>
<div class="ttl" style="font-size:30px;margin-top:22px">Set your goals</div><div class="sub2">We will plan your days around these.</div>
<div class="lbl">Next exam date</div><div class="chips"><span class="chip on">Nov 21</span><span class="chip">Dec 5</span><span class="chip">Dec 18</span><span class="chip">Pick date</span></div>
<div class="lbl">Daily study goal</div><div class="chips"><span class="chip">30 min</span><span class="chip on">60 min</span><span class="chip">90 min</span><span class="chip">2 hours</span></div>
<div class="lbl">Best time to study</div><div class="chips"><span class="chip">Morning</span><span class="chip">Afternoon</span><span class="chip on">Evening</span><span class="chip">Night</span></div>
<div class="card rw" style="margin-top:22px;border-radius:24px"><div><div style="font:700 16px var(--body)">Daily reminder</div><div class="mut" style="font:600 13px var(--body)">Gentle nudge at 6:00 PM</div></div>${tg()}</div>
<div class="btn2" style="margin-top:34px">Continue</div><div style="text-align:center;font:700 15px var(--body);color:var(--mut);margin-top:18px">Skip for now</div></div>`)),
pg('Tasks','Swipe right to finish, left to delete','The Done row slides right and the Delete row slides left, as if swiped. A snackbar offers Undo.','Light tap on each swipe.',()=>wrap(`<div class="pg">${tb()}<div style="text-align:center;font:700 13px var(--body);color:var(--mut);margin-top:2px">Release to refresh</div><div class="ttl" style="margin-top:6px">Tasks</div><div class="sub2">Swipe right to finish, left to delete.</div>
<div class="seg"><span class="on">Today</span><span>Week</span><span>All</span></div>
${trow('Chapter 5 problem set','Mathematics','High')}
<div class="swipe sw1"><div class="bk dn"><span style="width:20px;height:20px;display:block">${CHECK}</span>Done</div>${trow('Lab report draft','Chemistry','Medium')}</div>
<div class="swipe sw2"><div class="bk dl"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 7h12l-1 14H7zM4 5h16v2H4zM9 2h6v2H9z"/></svg>Delete</div>${trow('Read act 2','English','Low')}</div>
${trow('Revise cell biology','Biology','High')}
</div><div class="snack"><span>Task deleted</span><span style="color:var(--mv)">UNDO</span></div><div class="fab">${ICO.plus}</div>${nav('tasks')}`),()=>{
  enter();
  at(700,()=>{$('.sw1 .trow',R).animate([{transform:'none'},{transform:'translateX(105px)'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1)',fill:'forwards'});hap('light')});
  at(1200,()=>{$('.sw2 .trow',R).animate([{transform:'none'},{transform:'translateX(-100px)'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1)',fill:'forwards'});hap('medium')})}),
pg('Tasks, empty','Nothing to do yet','The clipboard pops in, then the message and button rise.','Light tap on arrival.',()=>wrap(`<div class="pg">${tb()}<div class="ttl" style="margin-top:12px">Tasks</div>
<div style="display:flex;justify-content:center;margin-top:78px"><svg width="126" height="126" viewBox="0 0 126 126"><circle cx="63" cy="63" r="63" fill="#c9b8c3"/><rect x="32" y="21" width="62" height="82" rx="10" fill="#1b1e25"/><rect x="51" y="14" width="24" height="15" rx="6" fill="#8296a3"/><rect x="42" y="42" width="40" height="7" rx="3.500" fill="#c9b8c3"/><rect x="42" y="56" width="26" height="7" rx="3.500" fill="#6b8190"/><rect x="42" y="70" width="34" height="7" rx="3.500" fill="#6b8190"/></svg></div>
<div style="text-align:center;font:700 26px var(--display);margin-top:22px">Nothing to do yet</div><div style="text-align:center;font:600 14px/1.5 var(--body);color:var(--mut);margin-top:10px">Add your first task and plan your day.<br>Everything works offline.</div>
<div class="btn2" style="margin-top:22px;border-radius:24px">Add your first task</div></div>${nav('tasks')}`)),
pg('Focus timer','Pomodoro round 2 of 4','The ring draws in and the timer counts down a few seconds.','Light tap on arrival.',()=>wrap(`<div class="pg"><div style="position:relative;height:40px"><span style="position:absolute;left:8px;top:6px;color:#c9c9cc">${ICO.x}</span><span class="tag" style="position:absolute;left:50%;transform:translateX(-50%);top:2px;padding:9px 18px;border-radius:16px;font-size:14px;font-weight:700">Mathematics</span></div>
<div class="ring2" style="margin:62px auto 0;width:250px;height:250px">${ring(250,24,.53,'#c9b8c3','#2d3740')}<div class="c" style="font-size:62px" id="fct">24:12</div></div>
<div style="text-align:center;font:700 15px var(--body);color:#cfd2d6;margin-top:30px">Round 2 of 4 · 5 min break next</div>
<div style="display:flex;justify-content:center;gap:10px;margin-top:20px"><span class="chip" style="border-radius:18px;height:40px;gap:8px;color:#ebe8ea"><span style="color:#c9b8c3;display:flex">${ICO.bell.replace('class="ic"','class="ic" style="width:16px;height:16px"')}</span>Do not disturb on</span><span class="chip" style="border-radius:18px;height:40px;gap:8px;color:#ebe8ea"><span style="color:#c9b8c3;display:flex">${ICO.moon.replace('class="ic"','class="ic" style="width:16px;height:16px"')}</span>Rain sound</span></div></div>
<div style="position:absolute;left:22px;right:22px;bottom:22px;display:flex;gap:10px"><div class="btn2 dk2" style="flex:0 0 104px;height:54px;border-radius:26px">Stop</div><div class="btn2 mv" style="flex:1;height:54px;border-radius:26px">Pause</div></div>`,true),()=>{
  enter();let s=12;[1000,2000,3000,4000].forEach(t=>at(t,()=>{s--;const e=$('#fct');if(e)e.textContent='24:'+String(s).padStart(2,'0')}))}),
pg('Weekly report','7h 15m studied, score, badge','Bars grow from the bottom one by one.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:38px">${head('Weekly report',ICO.x,ICO.share)}
<div class="card dkc" style="border-radius:26px;padding:16px 16px 12px"><div style="font:700 12px var(--body);letter-spacing:.08em;color:#bfc4c9">NOV 3 – NOV 9</div><div style="font:700 44px/1.1 var(--display);color:#c9b8c3;margin-top:4px">7h 15m</div><div style="font:700 14px var(--body);color:#cfd2d6;margin-top:4px">12% more than last week</div>
<div class="bars" style="display:flex;align-items:flex-end;gap:8px;height:96px;margin-top:14px">${[64,43,92,59,86,70,48].map((h,i)=>`<i style="flex:1;height:${h}px;border-radius:9px;background:${i===6?'#ede9ea':'#c9b8c3'}"></i>`).join('')}</div>
<div style="display:flex;gap:8px;margin-top:8px">${['T','W','T','F','S','S','M'].map(l=>`<span style="flex:1;text-align:center;font:700 12px var(--body);color:#bfc4c9">${l}</span>`).join('')}</div></div>
<div class="sw2"><div class="card"><b>74 → 78</b><small>Score change</small></div><div class="card"><b style="font-size:19px;line-height:1.35">Mathematics</b><small>Best subject</small></div><div class="card"><b>6 days</b><small>Streak</small></div><div class="card"><b>12</b><small>Tasks done</small></div></div>
<div class="card rw" style="justify-content:flex-start;gap:14px;border-radius:24px"><div style="width:44px;height:50px">${hex('#e1a63b',STAR('#fff'))}</div><div><div style="font:700 16px var(--body)">New badge: Consistent</div><div class="mut" style="font:600 13px var(--body)">Studied 6 days in a row</div></div></div>
<div class="btn2" style="margin-top:12px;border-radius:24px">Share my week</div></div>`),()=>{
  enter();$$('.bars i',R).forEach((b,i)=>{b.style.transformOrigin='bottom';b.animate([{transform:'scaleY(0)'},{transform:'none'}],{duration:520,delay:300+i*70,easing:'cubic-bezier(.2,1.1,.4,1)',fill:'backwards'})})}),
pg('Badges','Level 4, unlocked and locked badges','Level bar fills, then the badge grid rises in.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:38px">${head('Badges',ICO.back)}
<div class="card dkc" style="border-radius:26px;padding:16px 18px"><div class="rw" style="align-items:baseline"><b style="font:700 34px var(--display);color:#c9b8c3">Level 4</b><span style="font:700 14px var(--body);color:#cfd2d6">640 / 1000 XP</span></div><div class="bar2" style="background:#3c4450;margin:10px 0 8px;height:10px;border-radius:5px"><i style="width:64%;background:#c9b8c3;border-radius:5px"></i></div><div style="font:600 13px var(--body);color:#cfd2d6">360 XP to Level 5</div></div>
<div class="rw" style="margin-top:16px"><b style="font:700 22px var(--display)">Unlocked</b><span class="mut" style="font:700 13px var(--body)">4 of 12</span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);margin-top:14px">${bdg(hex('#2e8059',CKB('#2e8059')),'First 10 tasks')}${bdg(hex('#e8832a',SUN),'Early Bird')}${bdg(hex('#4060b8',MOON),'Night Owl')}</div>
<div style="font:700 22px var(--display);margin-top:16px">Locked</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px;row-gap:12px">${bdg(hex('#5f7482',CKB('#5f7482')),'7 day streak')}${bdg(hex('#c8c6c8',STAR('#3d5163')),'30 day streak',1)}${bdg(hex('#c8c6c8',STAR('#3d5163')),'100 day streak',1)}${bdg(hex('#c8c6c8',BOOK),'50 notes',1)}${bdg(hex('#c8c6c8',CLKH),'20 hours',1)}${bdg(hex('#c8c6c8',CALH),'Perfect week',1)}</div></div>`)),
pg('Exam mode','Physics readiness and today\'s plan','Readiness ring fills, plan rows and chapter bars animate in.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:38px">${head('Exam mode',ICO.back,ICO.cal)}
<div class="card dkc rw" style="justify-content:flex-start;gap:14px;border-radius:26px;height:114px"><div class="ring2">${ring(74,8,.64,'#c9b8c3','#3c4450')}<div class="c" style="font-size:17px">64%</div></div><div><div style="font:700 34px/1 var(--display);color:#c9b8c3">12 days</div><div style="font:700 15px var(--body);color:#ebe8ea;margin-top:6px">Physics · Nov 21</div><div style="font:600 13px var(--body);color:#cfd2d6">Readiness 64%</div></div></div>
<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Today's plan</b><span class="mut" style="font:700 13px var(--body)">90 min</span></div>
<div class="trow" style="height:46px;margin-top:10px"><div class="cb ck">${CHECK}</div><div class="tt">Revise optics · 40 min</div></div>
<div class="trow" style="height:46px"><div class="cb"></div><div class="tt">Practice paper · 30 min</div></div>
<div class="trow" style="height:46px"><div class="cb"></div><div class="tt">Flashcards · 20 cards</div></div>
<b style="display:block;font:700 20px var(--display);margin-top:18px">Chapters</b>
<div class="card" style="border-radius:22px;display:grid;gap:10px">${[['Optics',80],['Mechanics',60],['Electricity',45]].map(([n,p])=>`<div><div class="rw" style="font:700 13px var(--body);margin-bottom:5px"><span>${n}</span><span class="mut">${p}%</span></div><div class="bar2"><i style="width:${p}%"></i></div></div>`).join('')}</div>
<div class="mut" style="font:600 13px var(--body);margin-top:10px">Your plan adjusts automatically as the exam gets closer.</div>
<div class="btn2" style="margin-top:12px;border-radius:24px">Start today's plan</div></div>`)),
pg('Friends','Leaderboard and study groups','Rows slide in one by one, your row is highlighted.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:38px">${head('Friends',ICO.back,ICO.plus)}
<div class="seg"><span class="on">Leaderboard</span><span>Groups</span></div>
<div class="mut" style="font:700 13px var(--body);margin:10px 2px 4px">This week · minutes studied</div>
${[['1','R','Rohan',520],['2','M','Meera',475],['3','A','Aisha (You)',430],['4','K','Kabir',380],['5','S','Sana',300]].map(([r,a,n,m])=>`<div class="lbrow${r==='3'?' me':''}"><span class="rk">${r}</span><span class="ava">${a}</span><span>${n}</span><span class="mn">${m} min</span></div>`).join('')}
<b style="display:block;font:700 20px var(--display);margin-top:18px">Study groups</b>
<div class="card rw" style="justify-content:flex-start;gap:12px;border-radius:22px"><span class="ib" style="width:42px;height:42px">${ICO.ppl.replace('class="ic"','class="ic" style="width:22px;height:22px;color:#1b1e25"')}</span><div><div style="font:700 15px var(--body)">Class 12 Physics</div><div class="mut" style="font:600 13px var(--body)">8 members · 3 shared decks</div></div></div>
<div class="btn2" style="margin-top:14px;border-radius:24px">Invite a friend</div></div>`)),
pg('Search','Notes, cards and tasks','Recent searches and suggestions rise in.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:40px"><div style="display:flex;align-items:center;gap:14px"><span style="color:var(--ink)">${ICO.back}</span><div class="card rw dz-srch" style="flex:1;margin:0;height:46px;border-radius:23px;padding:0 14px;justify-content:flex-start;gap:10px"><span style="color:var(--ink);display:flex">${ICO.search.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><span class="mut" style="font:600 15px var(--body);flex:1">Search notes, cards, tasks</span><span style="color:var(--ink);display:flex">${ICO.mic.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span></div></div>
<div class="chips" style="margin-top:14px"><span class="chip on">All</span><span class="chip">Notes</span><span class="chip">Cards</span><span class="chip">Tasks</span><span class="chip">This week</span><span class="chip">Pinned</span></div>
<div class="rw" style="margin-top:18px"><b style="font:700 20px var(--display)">Recent</b><span class="mut" style="font:700 13px var(--body)">Clear</span></div>
${['cell organelles','newton laws','chapter 5 maths'].map(t=>`<div class="rw" style="height:54px"><div style="display:flex;align-items:center;gap:12px;font:700 16px var(--body)"><span style="display:flex">${ICO.clk.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span>${t}</div><span style="color:#4b5d6d;display:flex">${ICO.x.replace('class="ic"','class="ic" style="width:18px;height:18px"')}</span></div>`).join('')}
<b style="display:block;font:700 20px var(--display);margin-top:14px">Try searching</b><div class="chips" style="margin-top:10px"><span class="chip">Due today</span><span class="chip">High priority</span><span class="chip">Biology deck</span></div></div>`)),
pg('Daily goal reached','Celebration, streak is now 7 days','Confetti drops in, the flame pops, and the reward chips appear.','Success pattern when the flame pops.',()=>wrap(`<div class="pg" style="padding-top:150px;text-align:center"><div style="display:flex;justify-content:center" id="fl2">${FLM('#c9b8c3','#0d1114',100,120)}</div>
<div style="font:700 34px/1.2 var(--display);margin-top:34px;padding:0 20px;color:#ebe8ea">Daily goal reached!</div><div style="font:600 14px var(--body);color:#cfd2d6;margin-top:12px">75 minutes studied. Streak is now 7 days.</div>
<div style="display:flex;justify-content:center;gap:10px;margin-top:26px"><span class="chip" style="height:40px;border-radius:16px;gap:10px;font-weight:700;font-size:16px;color:#ebe8ea"><span style="width:22px;height:22px;display:block">${CUBE}</span>+20</span><span class="chip" style="height:40px;border-radius:16px;font-weight:700;font-size:16px;color:#ebe8ea">+50 XP</span></div></div>
${[[41,90,'#c9b8c3',15],[142,115,'#86c5ec',70],[227,81,'#5ba886',40],[283,119,'#e1a63b',-35],[87,188,'#86c5ec',-35],[310,243,'#c9b8c3',60],[61,308,'#5ba886',-20],[290,350,'#e1a63b',45]].map(([x,y,c,r])=>`<i class="conf" style="left:${x}px;top:${y}px;background:${c};transform:rotate(${r}deg)"></i>`).join('')}
<div style="position:absolute;left:22px;right:22px;bottom:22px;display:grid;gap:10px"><div class="btn2 mv" style="height:50px">Continue</div><div class="btn2 dk2" style="height:50px">Share my streak</div></div>`,true),()=>{
  enter();$('#fl2',R).animate([{transform:'scale(.3)',opacity:0},{transform:'scale(1.15)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],{duration:560,delay:100,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
  $$('.conf',R).forEach((c,i)=>c.animate([{transform:c.style.transform+' translateY(-160px)',opacity:0},{transform:c.style.transform+' translateY(0)',opacity:1}],{duration:700,delay:250+i*60,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
  at(400,()=>hap('success'))}),
pg('Themes','Light, dark, auto and six colour themes','Theme cards pop in one by one.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:38px">${head('Themes',ICO.back)}
<div class="seg" style="border-radius:22px"><span>Light</span><span>Dark</span><span class="on">Auto</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">${[['Calm Mauve','#dfe0e3','#1b1e25','#edebec','Free',1],['Midnight','#12161a','#c9b8c3','#1f252d','Free'],['Ocean','#d6e8f1','#2b6082','#eaf3fb','250'],['Forest','#dde8df','#2f6b4a','#eaf4ec','250'],['Sunset','#f1ddd5','#b4532f','#f9ece6','250'],['Mono','#e6e6e6','#1e1e1e','#f5f5f5','250']].map(([n,b,bar,cd,p,sel])=>`<div class="th${sel?' sel':''}"><div class="pv" style="background:${b}"><i style="background:${bar}"></i><u style="background:${cd}"></u></div><b>${n}</b><small>${p==='Free'?'Free':`<span style="width:14px;height:14px;display:block">${CUBE}</span>${p}`}</small></div>`).join('')}</div>
<div class="mut" style="font:600 13px var(--body);margin-top:14px">Unlock extra themes with gems in the Shop.</div></div>`),()=>{
  enter();$$('.th',R).forEach((t,i)=>t.animate([{transform:'scale(.9)',opacity:0},{transform:'none',opacity:1}],{duration:380,delay:200+i*70,easing:'cubic-bezier(.2,1.1,.4,1)',fill:'backwards'}))}),
pg('Settings','Appearance, language, accessibility, data','Sections rise in one after another.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:38px">${head('Settings',ICO.back)}
<b style="display:block;font:700 18px var(--display);margin-top:6px">Appearance</b>
<div class="card rw" style="justify-content:flex-start;gap:12px;border-radius:22px;margin-top:8px;padding:10px 14px"><span class="ib">${ICO.moon.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><div style="flex:1"><div style="font:700 15px var(--body)">Theme</div><div class="mut" style="font:600 13px var(--body)">Calm Mauve · Auto dark mode</div></div>${ICO.chev.replace('class="ic"','class="ic" style="width:16px;height:16px"')}</div>
<b style="display:block;font:700 18px var(--display);margin-top:14px">Language</b>
<div class="card" style="border-radius:22px;margin-top:8px;padding:10px 14px"><div class="seg" style="background:none;margin:0;padding:0;height:40px"><span class="on" style="border-radius:14px">English</span><span>हिन्दी</span></div></div>
<b style="display:block;font:700 18px var(--display);margin-top:14px">Accessibility</b>
<div class="card" style="border-radius:22px;margin-top:8px"><div style="display:flex;align-items:center;gap:10px"><span style="font:700 12px var(--body)">A</span><div style="flex:1;height:6px;border-radius:3px;background:var(--track);position:relative"><i style="position:absolute;left:0;top:0;bottom:0;width:50%;border-radius:3px;background:#1b1e25"></i><i style="position:absolute;left:50%;top:-8px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#1b1e25"></i></div><span style="font:700 22px var(--body)">A</span></div><div class="mut" style="font:600 13px var(--body);margin-top:8px">Text size</div></div>
<b style="display:block;font:700 18px var(--display);margin-top:14px">Notifications &amp; sync</b>
<div class="card rw" style="justify-content:flex-start;gap:12px;border-radius:22px;margin-top:8px;padding:10px 14px"><span class="ib">${ICO.bell.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><div style="flex:1"><div style="font:700 15px var(--body)">Notifications</div><div class="mut" style="font:600 13px var(--body)">Reminders and reports</div></div>${ICO.chev.replace('class="ic"','class="ic" style="width:16px;height:16px"')}</div>
<div class="card rw" style="justify-content:flex-start;gap:12px;border-radius:22px;padding:10px 14px"><span class="ib">${ICO.cloud.replace('class="ic"','class="ic" style="width:22px;height:22px"')}</span><div style="flex:1"><div style="font:700 15px var(--body)">Sync on Wi-Fi only</div><div class="mut" style="font:600 13px var(--body)">Offline changes sync later</div></div>${tg(1)}</div>
<b style="display:block;font:700 18px var(--display);margin-top:14px">Your data</b>
<div class="card rw" style="justify-content:flex-start;gap:12px;border-radius:22px;margin-top:8px;padding:10px 14px"><span class="ib">${ICO.dl.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><div style="flex:1"><div style="font:700 15px var(--body)">Export my data</div><div class="mut" style="font:600 13px/1.25 var(--body)">Notes, tasks and grades as PDF or CSV</div></div>${ICO.chev.replace('class="ic"','class="ic" style="width:16px;height:16px"')}</div></div>`)),
pg('Widgets','Home-screen streak, goal and task widgets','The three widgets pop in side by side.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:58px"><div style="font:700 26px/1.1 var(--display)">Home-screen widgets</div><div class="mut" style="font:600 14px var(--body);margin-top:8px">Streak, goal and tasks without opening the app.</div></div>
<div class="wid" style="left:19px;top:166px;width:139px;height:139px;background:#1b1e25;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="display:flex">${FLM('#c9b8c3','#1b1e25',32,38)}</div><div style="font:700 42px/1 var(--display);color:#c9b8c3;margin-top:4px">6</div><div style="font:700 13px var(--body);color:#cfd2d6;margin-top:3px">day streak</div></div>
<div class="wid" style="left:176px;top:166px;width:139px;height:139px;background:var(--card);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px"><div class="ring2">${ring(84,8,.6,'#1b1e25','#c8c6c8')}<div class="c" style="font-size:19px;color:#1b1e25">45m</div></div><div class="mut" style="font:700 13px var(--body)">Daily goal</div></div>
<div class="wid" style="left:19px;top:324px;width:322px;background:var(--card);padding:18px 18px 16px"><div style="font:700 17px var(--display)">Today · 3 left</div>${['Chapter 5 problem set','Lab report draft','Read act 2'].map(t=>`<div style="display:flex;align-items:center;gap:12px;margin-top:12px"><div class="cb" style="width:22px;height:22px"></div><span style="font:700 15px var(--body)">${t}</span></div>`).join('')}</div>`),()=>{
  hap('light');$$('.wid',R).forEach((w,i)=>w.animate([{transform:'scale(.8)',opacity:0},{transform:'scale(1.05)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:480,delay:i*110,easing:'ease-out',fill:'backwards'}));$$('.pg > *',R).forEach(el=>el.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:380,fill:'backwards'}));$$('.rp',R).forEach(c=>{const L=+c.dataset.c,p=+c.dataset.p;c.animate([{strokeDashoffset:L},{strokeDashoffset:L*(1-p)}],{duration:900,delay:300,fill:'backwards'})})})
);

/* ---- quick add ---- */
(()=>{


const D='#4a3aae',L='#cfc4f5',M='#8d7be0';
const QI={
 task:`<svg viewBox="0 0 48 48"><rect x="6" y="6" width="36" height="36" rx="9" fill="${D}"/><path d="M15 25l6 6 12-14" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 note:`<svg viewBox="0 0 48 48"><path d="M13 6h24a3 3 0 013 3v27a3 3 0 01-3 3H13a5 5 0 01-5-5V11a5 5 0 015-5z" fill="${L}" stroke="${D}" stroke-width="3" stroke-linejoin="round"/><path d="M8 36a5 5 0 015-5h27" fill="none" stroke="${D}" stroke-width="3"/><rect x="17" y="12" width="15" height="7" rx="1.8" fill="${D}"/><path d="M12 43h26" stroke="${D}" stroke-width="3" stroke-linecap="round"/></svg>`,
 study:`<svg viewBox="0 0 48 48"><path d="M28 3L10 27h12l-4 18 21-27H26z" fill="#f6a928" stroke="#e08a00" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
 plan:`<svg viewBox="0 0 48 48"><rect x="6" y="9" width="36" height="33" rx="7" fill="${L}" stroke="${D}" stroke-width="3"/><path d="M6 17a7 7 0 017-7h22a7 7 0 017 7v2H6z" fill="${D}"/><path d="M15 4v9M33 4v9" stroke="${D}" stroke-width="3.4" stroke-linecap="round"/><g fill="${D}"><circle cx="15" cy="27" r="2"/><circle cx="24" cy="27" r="2"/><circle cx="33" cy="27" r="2"/><circle cx="15" cy="35" r="2"/><circle cx="24" cy="35" r="2"/></g></svg>`,
 subject:`<svg viewBox="0 0 48 48"><path d="M24 14c-5-4-12-4-18-2v24c6-2 13-2 18 2 5-4 12-4 18-2V12c-6-2-13-2-18 2z" fill="${L}" stroke="#6a58d0" stroke-width="3" stroke-linejoin="round"/><path d="M24 14v24" stroke="#6a58d0" stroke-width="3"/><path d="M11 19h8M11 25h8M29 19h8M29 25h8" stroke="#6a58d0" stroke-width="2.4" stroke-linecap="round"/></svg>`,
 quiz:`<svg viewBox="0 0 48 48"><path d="M24 4C13 4 6 11 6 20s7 15 15 16l-3 7 11-7c9-1 15-6 15-16C44 11 35 4 24 4z" fill="#3e2e98"/><path d="M33 36l5 6-10-3z" fill="${L}" opacity=".8"/><text x="24" y="28.500" font-size="23" font-weight="800" text-anchor="middle" fill="#fff" font-family="Space Grotesk,Inter,Arial,sans-serif">?</text></svg>`,
 focus:`<svg viewBox="0 0 48 48"><circle cx="22" cy="26" r="17" fill="${L}" stroke="#6a58d0" stroke-width="3.5"/><circle cx="22" cy="26" r="10" fill="${M}" stroke="${D}" stroke-width="3"/><circle cx="22" cy="26" r="3.5" fill="${D}"/><path d="M24 24L40 8" stroke="${D}" stroke-width="3.4" stroke-linecap="round"/><path d="M34 5l8-1-1 8-3.500-3z" fill="${D}"/></svg>`,
 progress:`<svg viewBox="0 0 48 48"><rect x="6" y="26" width="10" height="16" rx="3.500" fill="#3d9d5f"/><rect x="19" y="16" width="10" height="26" rx="3.500" fill="#3d9d5f"/><rect x="32" y="6" width="10" height="36" rx="3.500" fill="#2f8a50"/></svg>`,
 ach:`<svg viewBox="0 0 48 48"><path d="M14 6h20v12a10 10 0 01-20 0z" fill="#f2a62c"/><path d="M14 10H7c0 8 3 12 8 13M34 10h7c0 8-3 12-8 13" fill="none" stroke="#e39716" stroke-width="3.200" stroke-linecap="round"/><path d="M21 28h6v7h-6z" fill="#e39716"/><rect x="14" y="35" width="20" height="6" rx="2.500" fill="#f2a62c"/><path d="M24 11l2.200 4-2.200 4-2.200-4z" fill="#fff3c9"/></svg>`,
 custom:`<svg viewBox="0 0 48 48"><g fill="#6b6c86">${[0,45,90,135,180,225,270,315].map(a=>`<rect x="19.500" y="2.500" width="9" height="11" rx="2.600" transform="rotate(${a} 24 24)"/>`).join('')}<path fill-rule="evenodd" d="M24 8a16 16 0 100 32 16 16 0 000-32zm0 10a6 6 0 110 12 6 6 0 010-12z"/></g></svg>`,
 remind:`<svg viewBox="0 0 48 48"><path d="M13 5h22a3 3 0 013 3v36l-14-9-14 9V8a3 3 0 013-3z" fill="${M}"/><path d="M13 5h22a3 3 0 013 3v4H10V8a3 3 0 013-3z" fill="#a898ee"/></svg>`,
 upload:`<svg viewBox="0 0 48 48"><path d="M12 4h18l10 10v28a3 3 0 01-3 3H12a3 3 0 01-3-3V7a3 3 0 013-3z" fill="#3b7df0"/><path d="M30 4v8a2 2 0 002 2h8z" fill="#9cc0fb"/><path d="M16 25h16M16 31h16M16 37h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`
};
const TILES=[['note','Note','Add note'],['plan','Planner','Planner'],['subject','Subject','Add subject'],['quiz','Quiz','Quiz'],['progress','Progress','Progress'],['ach','Achievement','Achievement'],['remind','Reminder','Reminder'],['upload','Upload File','Upload file']];
const CHAR=`<svg class="qchar" viewBox="0 0 120 80"><path d="M6 80c0-18 14-25 34-25s30 7 30 25z" fill="#a99be2" stroke="#1b1e25" stroke-width="2.6" stroke-linejoin="round"/><path d="M26 58c4 7 20 7 24 0" fill="none" stroke="#1b1e25" stroke-width="2.4" stroke-linecap="round"/><path d="M62 72c10-2 18-8 21-26" fill="none" stroke="#1b1e25" stroke-width="15" stroke-linecap="round"/><path d="M62 72c10-2 18-8 21-26" fill="none" stroke="#a99be2" stroke-width="10.500" stroke-linecap="round"/><path d="M84 44V30" stroke="#1b1e25" stroke-width="9" stroke-linecap="round"/><path d="M84 44V30" stroke="#fffaf5" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="46" r="6.500" fill="#fffaf5" stroke="#1b1e25" stroke-width="2.4"/><circle cx="38" cy="34" r="21" fill="#fffaf5" stroke="#1b1e25" stroke-width="2.6"/><path d="M17 37C11 8 46 -2 60 26c-8-8-17-8-25-3-7 5-14 6-18 14z" fill="#1b1e25"/><path d="M52 14c6 2 9 6 10 11-4-4-8-6-12-6z" fill="#1b1e25"/><circle cx="30" cy="37" r="2.500" fill="#1b1e25"/><circle cx="46" cy="37" r="2.500" fill="#1b1e25"/><path d="M34 44q5 5 10 0" fill="none" stroke="#1b1e25" stroke-width="2.4" stroke-linecap="round"/><circle cx="25" cy="43" r="3.600" fill="#f6b8c4" opacity=".7"/><circle cx="51" cy="43" r="3.600" fill="#f6b8c4" opacity=".7"/><g stroke="#1b1e25" stroke-width="2.200" stroke-linecap="round"><path d="M92 27l3-6M98 33l6-3M86 18l1-6"/></g></svg>`;
const SPARK=`<svg class="qsp" viewBox="0 0 24 24"><path d="M5 4l5 7M10 14l-6 4M16 9l-3 8" fill="none" stroke="#7a67d8" stroke-width="2.600" stroke-linecap="round"/></svg>`;

const qaHtml=()=>(DZ.editTask=null,wrapD(homeInner()+`<div class="ov"></div><div class="qsheet"><div class="qhd"></div><div class="qtop"><div><div class="qh1">Quick add</div><div class="qh2">What would you like to add?</div></div><button class="qx" type="button" data-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg></button></div>
<div class="qgrid">${TILES.map(([k,l,p])=>`<button class="qt" type="button" data-open="${p}">${QI[k]}${l}</button>`).join('')}</div>
<div class="qban">${CHAR}<div class="qtx"><b>Stay on track!</b><span>Add anything to keep your study journey going.</span></div>${SPARK}</div>
<button class="qcancel" type="button" data-close>Cancel</button></div>`));
const qaPlay=()=>{
 S.mute=false;const ov=$('.ov',R),sh=$('.qsheet',R);
 ov.animate([{opacity:0},{opacity:1}],{duration:260,fill:'backwards'});
 sh.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:440,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
 $$('.qt',R).forEach((t,i)=>t.animate([{opacity:0,transform:'scale(.7) translateY(10px)'},{opacity:1,transform:'none'}],{duration:320,delay:260+i*35,easing:'cubic-bezier(.2,.9,.3,1.2)',fill:'backwards'}));
 $('.qban',R).animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:360,delay:720,fill:'backwards'});
 $('.qchar',R).animate([{transform:'translateY(22px)'},{transform:'translateY(-4px)',offset:.65},{transform:'none'}],{duration:520,delay:760,easing:'ease-out',fill:'backwards'});
 sfx.whoosh(.4);at(320,()=>{sfx.pop();hap('light')});
 R.onclick=e=>{
  if(e.target.closest('[data-close]')){sfx.tick();hap('light');go(HOMEI());return}
  const t=e.target.closest('[data-open]');if(t){sfx.check();hap('medium');t.animate([{transform:'scale(.9)'},{transform:'none'}],{duration:220});const i=SCREENS.findIndex(s=>s.t===t.dataset.open);at(160,()=>go(i))}
 };
};
const qs=SCREENS.find(s=>s.t==='Quick add');
qs.d='Bottom sheet with 8 options and Zip';qs.html=qaHtml;qs.play=qaPlay;
qs.spec={m:'The home screen dims and the sheet slides up. The 8 option tiles pop in one after another, then the Stay on track banner rises and the character bounces in. Tapping a tile opens its page. Close or Cancel returns to Home.',h:'Light tap when the sheet lands, a medium tap when an option is chosen.',s:'Soft whoosh as the sheet rises, a pop when it lands, a check when an option is chosen.'};
window.QAI=()=>SCREENS.findIndex(s=>s.t==='Quick add');

/* ---- page builder ---- */
const ch=(a,on=0)=>a.map((x,i)=>`<span class="chip${i===on?' on':''}" data-chip>${x}</span>`).join('');
const sg=(a,on=0)=>`<div class="seg" data-seg>${a.map((x,i)=>`<span${i===on?' class="on"':''}>${x}</span>`).join('')}</div>`;
const lb=t=>`<div class="lbl">${t}</div>`;
const inp=t=>`<div class="input" style="color:#1b1e25;font-weight:500">${t}</div>`;
const row=(ic,t,s,r='')=>`<div class="qrow"><div class="qri">${QI[ic]}</div><div><b>${t}</b><small>${s}</small></div><span class="qrr">${r}</span></div>`;
const BACK='<svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const qpage=(title,icon,sub,body,cta,kind,m)=>({t:title,d:sub,g:'Quick add pages',
 spec:{m:m||'Content rises in one block after another and the button slides up from the bottom.',h:'Light tap on arrival and on every choice. A medium tap and a success pattern when the item is saved.',s:'Soft pop on arrival, a tick on each choice, a check when saved. Saving opens Session complete, then Streak extended.'},
 html:()=>wrap(`<div class="pg"><div class="qh"><button class="qback" type="button" data-back aria-label="Back">${BACK}</button><div class="qhi">${QI[icon]}</div></div><div class="qpt">${title}</div><div class="qps">${sub}</div>${body}</div>${cta?`<button class="btn2 qcta" type="button" data-save="${kind}">${cta}</button>`:''}`),
 play(){
  S.mute=false;enter();const c=$('.qcta',R);if(c)c.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:420,delay:350,easing:'ease-out',fill:'backwards'});sfx.pop();
  R.onclick=e=>{
   if(e.target.closest('[data-back]')){sfx.tick();hap('light');go(QAI());return}
   const s=e.target.closest('[data-save]');if(s){s.animate([{transform:'scale(.96)'},{transform:'none'}],{duration:200});activity(s.dataset.save);return}
   const c1=e.target.closest('[data-chip]');if(c1){$$('[data-chip]',c1.parentNode).forEach(x=>x.classList.remove('on'));c1.classList.add('on');sfx.tick(1);hap('light');return}
   const sp=e.target.closest('[data-seg] span');if(sp){$$('span',sp.parentNode).forEach(x=>x.classList.remove('on'));sp.classList.add('on');sfx.tick(1);hap('light');return}
   const t=e.target.closest('.tg');if(t){t.classList.toggle('off');sfx.tick(1);hap('light')}
  }}});
const SUBJ=['Biology','Maths','Physics','Chemistry'];DZ.qpage=qpage;DZ.lb=lb;DZ.ch=ch;DZ.sg=sg;DZ.BACK=BACK;DZ.QI=QI;
const wk=(on)=>`<div class="qwk">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>`<div class="${i===on?'on':''}">${d}<b>${9+i}</b></div>`).join('')}</div>`;
const PAGES=[
 qpage('Add task','task','Write it down so you can tick it off.',`${lb('Task')}${inp('Revise cell biology')}${lb('Subject')}<div class="chips">${ch(SUBJ)}</div>${lb('Priority')}${sg(['Low','Medium','High'],2)}${lb('Due')}<div class="chips">${ch(['Today','Tomorrow','Pick date'])}</div><div class="card rw"><div><div style="font:700 15px var(--body)">Remind me</div><div class="mut" style="font:600 12.5px var(--body)">One hour before it is due</div></div>${tg()}</div>`,'Add task','task'),
 qpage('Add note','note','Save what you learn, in your own words.',`${lb('Title')}${inp('Cell division')}${lb('Subject')}<div class="chips">${ch(SUBJ)}</div><div class="card" style="min-height:150px;margin-top:16px;font:600 15px/1.5 var(--body)"><b style="font:700 15px var(--body)">Mitosis in four steps</b><br>Prophase, metaphase, anaphase, telophase. Chromosomes line up in the middle, then split.<div class="mut" style="margin-top:8px">Tap to keep typing...</div></div><div class="chips" style="margin-top:12px">${ch(['Bold','List','Photo','Voice'],-1)}</div>`,'Save note','note'),
 qpage('Quick Study','study','A short sprint, started in one tap.',`${lb('Pick a sprint')}${row('study','5 minute sprint','Recall ten key points','5 min')}${row('study','15 minute sprint','Flashcards and questions','15 min')}${row('study','25 minute sprint','Deep focus on one topic','25 min')}${lb('Subject')}<div class="chips">${ch(SUBJ)}</div>`,'Start sprint','study'),
 qpage('Planner','plan','Place study blocks on your week.',`${wk(2)}${lb('Wednesday')}<div class="qtime"><b>4:00 PM</b><div style="background:var(--mv)">Mathematics<br><span style="font-weight:400;font-size:12.5px">Chapter 5 problem set</span></div></div><div class="qtime"><b>5:30 PM</b><div style="background:var(--card)">Physics<br><span style="font-weight:400;font-size:12.5px">Revise motion</span></div></div><div class="qtime"><b>7:00 PM</b><div style="border:2px dashed #aeb4bb;color:var(--mut);font-weight:600">+ Add a block</div></div>`,'Add to planner','plan'),
 qpage('Add subject','subject','Every subject gets its own colour and goal.',`${lb('Name')}${inp('Biology')}${lb('Colour')}<div class="qdots">${['#c7b9c4','#5a707a','#6a58d0','#3d9d5f','#f2a62c','#e0674f'].map((c,i)=>`<i data-chip class="${i===2?'on':''}" style="background:${c}"></i>`).join('')}</div>${lb('Weekly goal')}${sg(['2 h','4 h','6 h'],1)}${lb('Next exam')}<div class="chips">${ch(['Nov 21','Dec 5','Dec 18','Not sure'])}</div>`,'Add subject','subject'),
 qpage('Quiz','quiz','Test yourself and see what sticks.',`${lb('Subject')}<div class="chips">${ch(SUBJ)}</div>${lb('Questions')}${sg(['5','10','15','20'],1)}${lb('Level')}${sg(['Easy','Medium','Hard'],1)}<div class="card rw"><div><div style="font:700 15px var(--body)">Timer</div><div class="mut" style="font:600 12.5px var(--body)">30 seconds per question</div></div>${tg()}</div>`,'Start quiz','quiz'),
 qpage('Focus Session','focus','Pick your time and silence the rest.',`<div class="qring">${ring(170,12,.62,'#1b1e25','#c8c6c8')}<div class="c">25:00</div></div><div class="qstep"><button type="button">−</button><button type="button">+</button></div>${lb('Subject')}<div class="chips">${ch(SUBJ)}</div><div class="card rw"><div style="font:700 15px var(--body)">Do not disturb</div>${tg()}</div>`,'Start focus','focus'),
 qpage('Progress','progress','How your week is going.',`<div class="card"><div class="rw"><b style="font:700 28px var(--display)">7h 15m</b><span class="tag">+18%</span></div><div class="mut" style="font:600 13px var(--body);margin-top:2px">studied this week</div><div class="qbars">${[40,62,48,80,55,90,70].map((h,i)=>`<i class="${i===5?'hi':''}" style="height:${h}%"></i>`).join('')}</div><div class="rw" style="margin-top:6px;font:700 11px var(--body);color:var(--mut)">${['M','T','W','T','F','S','S'].map(d=>`<span style="flex:1;text-align:center">${d}</span>`).join('')}</div></div>${lb('By subject')}${[['Mathematics',78],['Physics',64],['Biology',52]].map(([n,p])=>`<div style="margin-bottom:10px"><div class="rw" style="font:700 14px var(--body)"><span>${n}</span><span class="mut">${p}%</span></div><div class="bar2" style="margin-top:6px"><i style="width:${p}%"></i></div></div>`).join('')}`,'Log today\'s study','progress'),
 qpage('Achievement','ach','Badges you have earned and the next ones.',`<div class="card rw"><div><div style="font:700 17px var(--display)">Level 4</div><div class="mut" style="font:600 12.5px var(--body)">240 XP to Level 5</div></div><b style="font:700 15px var(--body)">1,240 XP</b></div><div class="qgb"><div>${QI.ach}7 day streak</div><div>${QI.task}First task</div><div>${QI.note}Note taker</div><div class="lk">${QI.focus}Focus 5 h</div><div class="lk">${QI.quiz}Quiz star</div><div class="lk">${QI.progress}30 days</div></div>`,'Claim reward','ach'),
 qpage('Custom Item','custom','Make your own thing to track.',`${lb('Name')}${inp('Drink water')}${lb('Type')}<div class="chips">${ch(['Checklist','Habit','Counter','Link'],1)}</div>${lb('Colour')}<div class="qdots">${['#c7b9c4','#5a707a','#6a58d0','#3d9d5f','#f2a62c','#e0674f'].map((c,i)=>`<i data-chip class="${i===0?'on':''}" style="background:${c}"></i>`).join('')}</div>${lb('Repeat')}${sg(['Daily','Weekdays','Weekly'],0)}`,'Create item','custom'),
 qpage('Reminder','remind','Everything you saved, in one place.',`<div class="chips" style="margin-top:14px">${ch(['All','Notes','Tasks','Files'])}</div>${row('note','Cell division','Note · Biology','Today')}${row('task','Chapter 5 problem set','Task · Maths','6 PM')}${row('upload','Lab report.pdf','File · Chemistry','2 d ago')}${row('study','Motion formulas','Quick Study · Physics','3 d ago')}${row('remind','Read act 2','Reminder · English','Fri')}`,'Set a reminder','remind'),
 qpage('Upload file','upload','PDFs, slides and photos for any subject.',`<div class="qdrop">${QI.upload}<b>Tap to choose a file</b><small>PDF, DOCX, PPT or image · up to 25 MB</small></div>${lb('Subject')}<div class="chips">${ch(SUBJ)}</div>${lb('Recent')}${row('upload','Lab report.pdf','1.2 MB','Done')}${row('upload','Motion notes.docx','640 KB','Done')}`,'Upload','upload')
];
SCREENS.push(...PAGES);

/* ---- activity: every save opens Session complete, then Streak extended ---- */
const SESSI=()=>SCREENS.findIndex(s=>s.t==='Session complete');
window.activity=function(kind){
  S.mute=false;const first=!U.done;U.done=true;if(first)U.streak=7;
  SCREENS[SESSI()].next=first?'Streak extended':'Home';
  sfx.check();hap('medium');hap('success');
  if(CUR===HOMEI()||SCREENS[CUR].g==='Quick add pages')at(380,()=>go(SESSI()));else go(SESSI());
};
})();
/* ---- profile + settings ---- */
(()=>{
const QM=[[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1], [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1], [1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1], [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1], [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0], [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0], [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1], [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0], [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0], [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1]];


const GEAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
const CHV='<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const UADD='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="4"/><path d="M1.5 20c0-4 3.400-6.200 7.500-6.200s7.500 2.200 7.500 6.200z"/><path d="M19 7v6M16 10h6" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/></svg>';
const QRI='<svg viewBox="0 0 24 24" fill="none" stroke="#4aa8e8" stroke-width="2.400" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.800"/><rect x="14" y="3" width="7" height="7" rx="1.800"/><rect x="3" y="14" width="7" height="7" rx="1.800"/><path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2v2h-2z" stroke-linecap="round"/></svg>';
/* user avatar (big, same family as Zip) */
const AVA=avatarSvg(Object.assign(avDecode(''),{chr:ZIP_CHR}),{view:'full',cls:'pfava'});
const SB='<svg class="sb" viewBox="0 0 48 48"><path d="M24 14c-5-4-12-4-18-2v24c6-2 13-2 18 2 5-4 12-4 18-2V12c-6-2-13-2-18 2z" fill="#cfc4f5" stroke="#6a58d0" stroke-width="3" stroke-linejoin="round"/><path d="M24 14v24" stroke="#6a58d0" stroke-width="3"/></svg>';
const PC=`<svg class="pc" viewBox="0 0 132 100"><circle cx="86" cy="44" r="34" fill="#4b6672"/><path d="M62 100c0-22 10-34 26-34s26 12 26 34z" fill="#a99be2" stroke="#1b1e25" stroke-width="3" stroke-linejoin="round"/><circle cx="88" cy="42" r="19" fill="#fffaf5" stroke="#1b1e25" stroke-width="3"/><path d="M69 40c-2-17 12-24 22-23 11 1 19 9 17 23-9-3-18-9-23-14-5 6-10 11-16 14z" fill="#1b1e25"/><circle cx="82" cy="44" r="2.200" fill="#1b1e25"/><circle cx="96" cy="44" r="2.200" fill="#1b1e25"/><path d="M85 51q4 4 8 0" fill="none" stroke="#1b1e25" stroke-width="2" stroke-linecap="round"/><path d="M63 16l7 14 14-4-5 14" fill="none" stroke="#f2a62c" stroke-width="0"/><path d="M70 18L88 4l20 14z" fill="#f2a62c" stroke="#1b1e25" stroke-width="3" stroke-linejoin="round"/><circle cx="88" cy="4" r="4" fill="#f2a62c" stroke="#1b1e25" stroke-width="2.500"/></svg>`;

const profHtml=()=>`<div class="scr n nd" style="--pg:#181b22"><div class="pf${chOn()?' pfc':''}"><div class="pfs" data-sc><div class="hero">${myAva()}<div class="edit" data-edit><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-5L16 4l4 4L9 19z"/></svg></div></div><div class="body"><div class="hdl">@aisha_rahman · Joined 2026</div><div class="pfst"><div data-subj role="button" aria-label="My subjects" style="cursor:pointer"><b>${SB}<span class="plus2">+2</span></b><span>Subjects</span></div><div><b>12</b><span>Following</span></div><div><b>8</b><span>Followers</span></div></div><div class="acts"><button class="btnl" type="button" data-friends>${UADD}ADD FRIENDS</button><button class="btnl sq" type="button" data-qr aria-label="Share QR code">${QRI}</button></div>${DZ.showcaseHtml?DZ.showcaseHtml():''}<div class="sec">Overview</div><div class="pfov"><div>${flameIconHtml(30,(+U.streak||0)>0?'red':'grey')}${U.streak} days</div><div><svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="8" fill="#6a58d0"/><path d="M10 16.500l4 4 8-9" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/></svg>${18+(U.done?1:0)} tasks</div><div><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#35a2f0"/><circle cx="16" cy="16" r="9.500" fill="#fff"/><path d="M16 9.500V16l4.500 3" fill="none" stroke="#1f6fc2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>42 hours</div><div><svg viewBox="0 0 32 32"><path d="M19 2L6 18h8l-3 12 15-17h-9z" fill="#ffc800" stroke="#e8a900" stroke-width="1.500" stroke-linejoin="round"/></svg>1,240 XP</div></div><div class="sec">Friend streaks</div><div class="fs"><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc1"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc1)"><rect width="52" height="52" fill="#fff0f6"/><circle cx="9" cy="14" r="9" fill="#ff8ab8"/><circle cx="22" cy="6" r="8" fill="#ffc83d"/><circle cx="38" cy="8" r="9" fill="#7ad04a"/><rect x="36" y="4" width="14" height="10" rx="2" fill="#7a4a2e"/><circle cx="8" cy="30" r="8" fill="#6bd16a"/><circle cx="26" cy="32" r="14" fill="#f7b79b"/><rect x="11" y="26" width="30" height="10" rx="5" fill="#26303a"/><circle cx="43" cy="38" r="6" fill="#ff8ab8"/><path d="M18 44q8 6 16 0" fill="none" stroke="#c0392b" stroke-width="2.500"/></g></svg><div class="cnt"><svg viewBox="0 0 24 20"><path d="M9 2c3 3 6 5 6 9a6 6 0 01-12 0c0-3 2-4 3-6 1 1 2 2 3 2z" fill="#5d6a74"/><path d="M17 5c2 2 4 4 4 7a4.500 4.500 0 01-8.500 2c2-1 3-3 3-5z" fill="#4a5560"/></svg>132</div></div><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc2"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc2)"><rect width="52" height="52" fill="#2f6fd6"/><path d="M4 18l8-6 4 8zM48 18l-8-6-4 8z" fill="#1b4fae"/><ellipse cx="26" cy="32" rx="16" ry="14" fill="#f2a24a"/><circle cx="17" cy="14" r="7" fill="#7ad04a" stroke="#26303a" stroke-width="2"/><circle cx="35" cy="14" r="7" fill="#7ad04a" stroke="#26303a" stroke-width="2"/><circle cx="17" cy="14" r="2.500" fill="#26303a"/><circle cx="35" cy="14" r="2.500" fill="#26303a"/><path d="M14 34h24l-3 8h-18z" fill="#fff"/><path d="M18 24q8 4 16 0" fill="none" stroke="#26303a" stroke-width="2.500" stroke-linecap="round"/></g></svg><div class="cnt"><svg viewBox="0 0 24 20"><path d="M9 2c3 3 6 5 6 9a6 6 0 01-12 0c0-3 2-4 3-6 1 1 2 2 3 2z" fill="#5d6a74"/><path d="M17 5c2 2 4 4 4 7a4.500 4.500 0 01-8.500 2c2-1 3-3 3-5z" fill="#4a5560"/></svg>47</div></div><div><svg class="fa" viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="#e85a5a"/><text x="26" y="36" text-anchor="middle" font-size="30" font-weight="700" fill="#2a1d1d" font-family="Space Grotesk,Inter,Arial,sans-serif">A</text></svg><svg class="ck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2a3139" stroke="#181b22" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#8b98a2" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="#8b98a2" stroke-width="2" stroke-linecap="round"/></svg></div><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc4"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc4)"><rect width="52" height="52" fill="#b43f86"/><circle cx="26" cy="28" r="20" fill="#7a3a22"/><circle cx="26" cy="30" r="14" fill="#f8d2c0"/><path d="M12 24c4-10 24-10 28 0-6-3-9-5-14-5s-9 2-14 5z" fill="#7a3a22"/><circle cx="20" cy="30" r="2" fill="#26303a"/><circle cx="32" cy="30" r="2" fill="#26303a"/><circle cx="17" cy="35" r="3" fill="#f08a8a"/><circle cx="35" cy="35" r="3" fill="#f08a8a"/><path d="M22 38q4 3 8 0" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/></g></svg><svg class="ck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2a3139" stroke="#181b22" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#8b98a2" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="#8b98a2" stroke-width="2" stroke-linecap="round"/></svg></div><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc5"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc5)"><rect width="52" height="52" fill="#efe0fb"/><path d="M8 52c0-14 8-20 18-20s18 6 18 20z" fill="#b3345a"/><circle cx="26" cy="26" r="13" fill="#f9d6c4"/><path d="M12 28c-2-16 10-20 16-18 8 2 14 8 12 20-2-6-4-10-6-12-8 4-16 6-22 10z" fill="#1d1a22"/><circle cx="21" cy="28" r="2" fill="#26303a"/><circle cx="31" cy="28" r="2" fill="#26303a"/><path d="M23 34q3 3 6 0" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/></g></svg><svg class="ck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2a3139" stroke="#181b22" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#8b98a2" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="#8b98a2" stroke-width="2" stroke-linecap="round"/></svg></div></div><div class="sec">Monthly badges<span style="display:flex"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="bd"><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#8b5ae0"/><circle cx="50" cy="50" r="40" fill="#6a3fc4"/><path d="M50 40C40 34 28 34 20 38v30c8-4 20-4 30 2z" fill="#fff"/><path d="M50 40c10-6 22-6 30-2v30c-8-4-20-4-30 2z" fill="#e6dcff"/><path d="M50 40v30" stroke="#9b7fe6" stroke-width="2.500"/><path d="M26 46h18M26 53h18M26 60h14M56 46h18M56 53h18M56 60h14" stroke="#b8a3f0" stroke-width="2.500" stroke-linecap="round"/><path d="M50 10l3.500 7.500 8 1-6 5.500 1.800 8L50 28l-7.300 4 1.800-8-6-5.500 8-1z" fill="#ffd23f" stroke="#e0a41a" stroke-width="1.500" stroke-linejoin="round" transform="translate(0 6) scale(1)"/></svg><span class="lb">August</span></div><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#28b0ae"/><circle cx="50" cy="50" r="40" fill="#1f8f8d"/><g transform="rotate(40 50 50)"><rect x="41" y="18" width="18" height="46" fill="#ffd23f"/><rect x="41" y="18" width="6" height="46" fill="#ffe680"/><rect x="41" y="26" width="18" height="6" fill="#c9d1d8"/><rect x="41" y="14" width="18" height="12" rx="4" fill="#ff8fab"/><path d="M41 64h18l-9 17z" fill="#f3d2a8"/><path d="M46.500 74h7l-3.500 7z" fill="#2d2d2d"/></g><path d="M22 70l12 0M26 78h12" stroke="#7fe0dd" stroke-width="3" stroke-linecap="round"/><path d="M70 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/></svg><span class="lb">September</span></div><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f6c431"/><circle cx="50" cy="50" r="40" fill="#fff3c4"/><path d="M50 22L14 40l36 17 36-17z" fill="#2d3340"/><path d="M30 52v13c0 7 9 11 20 11s20-4 20-11V52l-20 9z" fill="#434c5e"/><path d="M82 42v22" stroke="#e0a41a" stroke-width="3" stroke-linecap="round"/><circle cx="82" cy="68" r="4.500" fill="#ffb020"/><circle cx="50" cy="40" r="3" fill="#ffd23f"/></svg><span class="lb">October</span></div><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#353b42"/><circle cx="50" cy="50" r="40" fill="#2a2f35"/><circle cx="50" cy="50" r="43.500" fill="none" stroke="#c9b8c3" stroke-width="5" stroke-linecap="round" stroke-dasharray="197 274" transform="rotate(-90 50 50)"/><rect x="29" y="24" width="42" height="52" rx="8" fill="#454b53"/><path d="M36 38l4 4 7-8M36 52l4 4 7-8M54 40h10M54 54h10M36 66h8M54 66h10" fill="none" stroke="#6b737c" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="lb">18 of 25</span></div></div><div class="sec">Achievements<span style="display:flex"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="bd"><div><span class=nw>NEW</span><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 14v34c0 20-16 34-38 42C28 86 12 72 12 52V18z" fill="#3fa56a" stroke="#2c8050" stroke-width="3" stroke-linejoin="round"/><path d="M50 16L22 29l28 13 28-13z" fill="#fff"/><path d="M32 38v10c0 5 8 8 18 8s18-3 18-8V38l-18 8z" fill="#d8f0e0"/><path d="M76 31v14" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><circle cx="76" cy="48" r="3.500" fill="#ffd23f"/><text x="50" y="93" text-anchor="middle" font-size="32" font-weight="800" fill="#fff" stroke="#2c8050" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Space Grotesk,Inter,Arial,sans-serif">300</text></svg><span class="lb">Graduate</span></div><div><span class=nw>NEW</span><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 22v44L50 96 12 70V26z" fill="#7a4fd0" stroke="#5b3fb5" stroke-width="3" stroke-linejoin="round"/><path d="M50 14l28 16v36L50 86 22 66V30z" fill="#9468e8"/><path d="M34 26h32v16a16 16 0 01-32 0z" fill="#ffd23f" stroke="#e0a41a" stroke-width="2"/><path d="M34 30h-8c0 10 4 15 10 16M66 30h8c0 10-4 15-10 16" fill="none" stroke="#e0a41a" stroke-width="3.200" stroke-linecap="round"/><rect x="45" y="56" width="10" height="9" fill="#e0a41a"/><rect x="36" y="65" width="28" height="7" rx="3" fill="#ffd23f" stroke="#e0a41a" stroke-width="2"/><path d="M50 31l2.500 5 5.500.8-4 3.800 1 5.400-5-2.700-5 2.700 1-5.400-4-3.800 5.500-.8z" fill="#fff"/></svg><span class="lb">Class Topper</span></div><div><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 14v34c0 20-16 34-38 42C28 86 12 72 12 52V18z" fill="#a8dcf0" stroke="#6bb6d6" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="17" fill="#ffe27a" stroke="#f0b429" stroke-width="3"/><path d="M42 50h16v8a4 4 0 01-4 4h-8a4 4 0 01-4-4z" fill="#b8c2cc" stroke="#8d99a6" stroke-width="2"/><path d="M44 34q6-5 12 0M50 30v14" fill="none" stroke="#f0b429" stroke-width="2.500" stroke-linecap="round"/><path d="M50 12v-5M28 22l-4-4M72 22l4-4M22 40h-5M78 40h5" stroke="#fff" stroke-width="3.500" stroke-linecap="round"/><text x="50" y="93" text-anchor="middle" font-size="32" font-weight="800" fill="#fff" stroke="#4aa3c9" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Space Grotesk,Inter,Arial,sans-serif">100</text></svg><span class="lb">Brainiac</span></div><div><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 14v34c0 20-16 34-38 42C28 86 12 72 12 52V18z" fill="#ffb020" stroke="#e08a00" stroke-width="3" stroke-linejoin="round"/><rect x="44" y="12" width="12" height="7" rx="2" fill="#7a3a00"/><circle cx="50" cy="40" r="18" fill="#fff" stroke="#c0392b" stroke-width="3.500"/><path d="M50 40V28M50 40l9 6" fill="none" stroke="#c0392b" stroke-width="3.500" stroke-linecap="round"/><circle cx="50" cy="40" r="2.500" fill="#c0392b"/><path d="M50 24v3M66 40h-3M34 40h3" stroke="#e8a090" stroke-width="2.500" stroke-linecap="round"/><path d="M66 24l5-5" stroke="#7a3a00" stroke-width="4" stroke-linecap="round"/><text x="50" y="93" text-anchor="middle" font-size="32" font-weight="800" fill="#fff" stroke="#d97a00" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Space Grotesk,Inter,Arial,sans-serif">25</text></svg><span class="lb">Deep Focus</span></div></div></div></div><div class="pfbar" data-bar><button class="pfx" type="button" data-pfx aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button><div class="hname">Aisha Rahman</div><button class="gear" type="button" data-gear aria-label="Settings">${GEAR}</button></div><div class="navh">${nav('profile')}</div></div></div>`;

/* QR drawn with rounded modules */
const qrSvg=()=>{const n=QM.length,q=1,s=n+q*2;let d='';const fin=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
 const mid=(r,c)=>Math.abs(r-n/2+.5)<4.6&&Math.abs(c-n/2+.5)<4.6;
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!QM[r][c]||fin(r,c)||mid(r,c))continue;d+=`<rect x="${c+q+.08}" y="${r+q+.08}" width=".84" height=".84" rx=".42"/>`}
 let f='';[[0,0],[0,n-7],[n-7,0]].forEach(([r,c])=>{const x=c+q,y=r+q;f+=`<rect x="${x+.5}" y="${y+.5}" width="6" height="6" rx="1.9" fill="none" style="stroke:var(--qm,#181b22)" stroke-width="1"/><rect x="${x+2}" y="${y+2}" width="3" height="3" rx="1" style="fill:var(--qm,#181b22)"/>`});
 return `<svg viewBox="0 0 ${s} ${s}"><g fill="#181b22">${d}</g>${f}</svg>`};
const LOGO='<svg width="28" height="28" viewBox="0 0 48 48"><path d="M24 8L4 18l20 10 20-10z" fill="#c9b8c3"/><path d="M12 24v9c0 4 6 8 12 8s12-4 12-8v-9l-12 6z" fill="#9d8c98"/><path d="M42 20v14" stroke="#c9b8c3" stroke-width="3" stroke-linecap="round"/></svg>';
const SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>';
const COPY='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="3"/><path d="M5 15a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2"/></svg>';
const SAVE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>';
const qrHtml=()=>profHtml().replace(/<\/div><\/div>$/,'')+`<div class="ov" style="z-index:5"></div><div class="qsh" style="z-index:6"><div class="qhd"></div><h2>Share your profile</h2><p>Friends scan this to add you on StudyOS.</p><div class="qcard"><div class="qimg">${qrSvg()}<div class="qlogo">${LOGO}</div></div><div class="qn">Aisha Rahman</div><div class="qhh">@aisha_rahman</div></div><div class="qsb"><button class="prm" type="button" data-sh>${SHARE}Share link</button><button type="button" data-sh>${COPY}Copy</button><button type="button" data-sh>${SAVE}Save</button></div><button class="cl" type="button" data-close2>Close</button></div></div></div>`;

const SET=[['Account',['Profile','Preferences','Appearance','Language','Accessibility','Notifications','Sounds and haptics']],['Data',['Sync and offline','Export my data','Storage and downloads','Privacy settings']],['Support',['Help Center','Feedback']]];
const setHtml=()=>`<div class="scr n nd" style="--pg:#181b22"><div class="ss"><div class="shd"><b>Settings</b><button type="button" data-done>DONE</button></div><div class="ssc">${SET.map(([h,a])=>`<h4>${h}</h4><div class="sgrp">${a.map(x=>`<div class="sit" data-it="${x}">${x}${CHV}</div>`).join('')}</div>`).join('')}<div class="sout" data-out>SIGN OUT</div><div class="slk"><span>TERMS</span><span>PRIVACY POLICY</span><span>ACKNOWLEDGEMENTS</span></div></div></div></div>`;

const IDX=t=>SCREENS.findIndex(s=>s.t===t);
const SPEC=(m,h,s)=>({m,h,s});
const profPlay=()=>{S.mute=false;const sc=$('[data-sc]',R),br=$('[data-bar]',R);const hero=$('.hero',sc);
  // While the profile picture block is still under the header the bar is solid in the hero colour with a thin border (pin); once that block has scrolled away it becomes the themed bar (on).
  const sw=()=>{const on=sc.scrollTop>=(hero?hero.offsetHeight:292)-br.offsetHeight;br.classList.toggle('on',on);br.classList.toggle('pin',!on&&sc.scrollTop>4)};
  sc.addEventListener('scroll',sw,{passive:true});sw();
 $('.hero',R).animate([{opacity:0},{opacity:1}],{duration:300,fill:'backwards'});
 $('.pfava',R).animate([{transform:'translateX(-50%) translateY(50px) scale(.9)',opacity:0},{transform:'translateX(-50%) translateY(-6px) scale(1.02)',opacity:1,offset:.7},{transform:'translateX(-50%)',opacity:1}],{duration:560,delay:120,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
 $$('.body>*',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:380,delay:260+i*70,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
 $('.nav',R).animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:420,delay:300,fill:'backwards'});
 sfx.pop();hap('light');
 R.onclick=e=>{
  if(e.target.closest('[data-gear]')){sfx.tick();hap('light');go(IDX('Settings'));return}
  if(e.target.closest('[data-qr]')){sfx.whoosh(.4);hap('medium');go(IDX('Profile QR'));return}
  if(e.target.closest('[data-friends]')){sfx.tick();hap('light');go(IDX('Friends'));return}
  if(e.target.closest('[data-edit],[data-look]')){sfx.pop();hap('light')}
 }};
const qrPlay=()=>{S.mute=false;const sh=$('.qsh',R);
 $('.ov',R).animate([{opacity:0},{opacity:1}],{duration:260,fill:'backwards'});
 sh.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:440,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
 $('.qcard',R).animate([{transform:'scale(.86) rotate(-3deg)',opacity:0},{transform:'none',opacity:1}],{duration:520,delay:260,easing:'cubic-bezier(.2,.9,.3,1.25)',fill:'backwards'});
 at(300,()=>{sfx.pop();hap('light')});
 R.onclick=e=>{
  if(e.target.closest('[data-close2],.ov')){sfx.tick();hap('light');go(IDX('Profile'));return}
  const b=e.target.closest('[data-sh]');if(b){sfx.check();hap('medium');b.animate([{transform:'scale(.93)'},{transform:'none'}],{duration:200})}
 }};
const setPlay=()=>{S.mute=false;
 $$('.ss h4,.ss .sgrp,.ss .sout,.ss .slk',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:360,delay:i*50,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));hap('light');
 R.onclick=e=>{
  if(e.target.closest('[data-done]')){sfx.tick();hap('light');go(IDX('Profile'));return}
  const it=e.target.closest('[data-it]');if(!it)return;sfx.tick(1);hap('light');
  const m={Profile:'Edit profile',Preferences:'Preferences','Sounds and haptics':'Preferences',Language:'Language',Appearance:'Themes',Notifications:'Notifications','Sync and offline':'Sync and offline','Export my data':'Export my data','Storage and downloads':'Storage and downloads','Privacy settings':'Privacy settings'}[it.dataset.it];if(m)go(IDX(m));
 }};
const i0=IDX('Settings');
SCREENS[i0]={...SCREENS[i0],d:'Account, study, data, subscription and support lists',html:setHtml,play:setPlay,spec:SPEC('Sections rise in one after another. The list scrolls. Appearance, Notifications, Profile and the study items open their pages. DONE returns to Profile.','Light tap on arrival and on every row.','Soft tick on every row.')};
const pi=IDX('Home dark');
SCREENS.splice(pi+1,0,
 {t:'Profile',d:'Avatar, name, stats, add friends, QR share',g:undefined,html:profHtml,play:profPlay,spec:SPEC('The avatar bounces up into the grey header and the details rise one by one. The settings icon sits at the top right. The QR button opens the share sheet.','Light tap on arrival, medium tap when the QR sheet opens.','Soft pop on arrival, a whoosh when the QR sheet opens.')},
 {t:'Profile QR',d:'Share your profile with a scannable QR code',html:qrHtml,play:qrPlay,spec:SPEC('The sheet slides up and the QR card pops in with a small tilt. Share, Copy and Save buttons sit under it.','Light tap when the card lands, medium tap on every button.','Pop when the card lands, a check on each button.')});
window.IDXP=IDX;window.AVA=AVA;
/* tab bar navigation */
document.addEventListener('click',e=>{const n=null;if(!n)return;const m={home:'Home',tasks:'Tasks',focus:'Focus timer',study:'Quick Study',profile:'Profile'}[n.dataset.k];const i=IDX(m);if(i>=0&&i!==CUR){sfx.tick();hap('light');go(i)}},true);
})();
/* ---- settings pages ---- */
(()=>{

const BK='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>';
DZ.BKX=BK;
const CHV='<svg viewBox="0 0 24 24" width="18" height="18" style="color:#8b98a2;flex:none"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CK='<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12.500l4.500 4.500L19 7.500" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const tgx=(on=1)=>`<div class="ptg${on?'':' off'}" data-tg><i></i></div>`;
const LC='stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const IC={
 cloud:`<svg viewBox="0 0 24 24" ${LC}><path d="M7 18a4.500 4.500 0 01-.5-9A6 6 0 0118 10a4 4 0 01-1 8z"/></svg>`,
 wifi:`<svg viewBox="0 0 24 24" ${LC}><path d="M2 9a15 15 0 0120 0M5.500 12.500a10 10 0 0113 0M9 16a5 5 0 016 0"/><circle cx="12" cy="19.500" r="1" fill="currentColor"/></svg>`,
 refresh:`<svg viewBox="0 0 24 24" ${LC}><path d="M20 11a8 8 0 00-14-4.500L4 9M4 4v5h5M4 13a8 8 0 0014 4.500L20 15M20 20v-5h-5"/></svg>`,
 note:`<svg viewBox="0 0 24 24" ${LC}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6"/></svg>`,
 dl:`<svg viewBox="0 0 24 24" ${LC}><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>`,
 play:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#a99be2"/><path d="M10 8l6 4-6 4z" fill="#181b22"/></svg>`,
 trash:`<svg viewBox="0 0 24 24" ${LC}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>`,
 eye:`<svg viewBox="0 0 24 24" ${LC}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
 chart:`<svg viewBox="0 0 24 24" ${LC}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`,
 people:`<svg viewBox="0 0 24 24" ${LC}><circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.500 3-5.500 6.500-5.500M16 11a3 3 0 100-6M17 14.500c2.500.5 4.500 2.300 4.500 5.500"/></svg>`,
 lock:`<svg width="14" height="14" viewBox="0 0 24 24" ${LC}><rect x="5" y="11" width="14" height="10" rx="2.500"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>`
};
/* illustrations */
const V1='#e3dbfa',V2='#a99be2',V3='#6a58d0';
const ILL={
sync:`<svg viewBox="0 0 220 140"><path d="M62 112c-18 0-32-13-32-30s12-29 28-30c4-22 24-36 46-34 20 2 36 15 40 34 16 1 28 14 28 30s-13 30-30 30z" fill="${V1}" stroke="${V2}" stroke-width="5" stroke-linejoin="round"/><path d="M84 78q6 6 12 0M124 78q6 6 12 0M105 88q5 6 10 0" fill="none" stroke="#2a2352" stroke-width="3.600" stroke-linecap="round"/><circle cx="76" cy="90" r="6" fill="#f2a9c0" opacity=".6"/><circle cx="144" cy="90" r="6" fill="#f2a9c0" opacity=".6"/><circle cx="160" cy="108" r="22" fill="${V3}" stroke="#181b22" stroke-width="4"/><path d="M149 106a11 11 0 0118-6M171 110a11 11 0 01-18 6" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round"/><path d="M168 96l1.500 5-5 .5M152 120l-1.500-5 5-.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M178 26l5-8M188 36l9-5" stroke="${V2}" stroke-width="3.400" stroke-linecap="round"/></svg>`,
exp:`<svg viewBox="0 0 220 140"><ellipse cx="110" cy="112" rx="86" ry="20" fill="#2a2740"/><path d="M36 50h46l10 12h74a8 8 0 018 8v46a8 8 0 01-8 8H44a8 8 0 01-8-8z" fill="${V2}"/><path d="M36 74a8 8 0 018-8h132a8 8 0 018 8v42a8 8 0 01-8 8H44a8 8 0 01-8-8z" fill="${V3}"/><path d="M110 78v28M98 96l12 12 12-12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(-8 150 40)"><rect x="140" y="14" width="26" height="32" rx="4" fill="#4faf72"/><path d="M146 24h14M146 30h14M146 36h14" stroke="#cdeed9" stroke-width="2.400"/></g><g transform="rotate(14 178 54)"><rect x="168" y="30" width="24" height="30" rx="4" fill="#4a8ff0"/><path d="M173 40h14M173 46h14M173 52h9" stroke="#cfe2ff" stroke-width="2.400"/></g><rect x="184" y="68" width="24" height="24" rx="5" transform="rotate(10 196 80)" fill="#f5a65b"/><circle cx="192" cy="76" r="3.500" fill="#fff0dc"/><path d="M26 34l3-8 3 8 8 3-8 3-3 8-3-8-8-3z" fill="${V2}" opacity=".6"/></svg>`,
stor:`<svg viewBox="0 0 120 120"><path d="M22 28v62c0 9 17 16 38 16s38-7 38-16V28z" fill="${V1}"/><ellipse cx="60" cy="28" rx="38" ry="14" fill="#f1ecff"/><path d="M22 52c0 9 17 16 38 16s38-7 38-16M22 74c0 9 17 16 38 16s38-7 38-16" fill="none" stroke="${V2}" stroke-width="4"/><circle cx="88" cy="92" r="19" fill="${V3}" stroke="#212a31" stroke-width="4"/><path d="M79 92l6 6 11-12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
priv:`<svg viewBox="0 0 220 140"><path d="M110 12l44 16v36c0 30-20 52-44 62-24-10-44-32-44-62V28z" fill="${V2}"/><path d="M110 12l44 16v36c0 30-20 52-44 62z" fill="${V3}" opacity=".7"/><rect x="92" y="62" width="36" height="30" rx="7" fill="#fff"/><path d="M99 62v-8a11 11 0 0122 0v8" fill="none" stroke="#fff" stroke-width="6"/><circle cx="110" cy="76" r="4.500" fill="${V3}"/><rect x="108" y="78" width="4" height="8" rx="2" fill="${V3}"/><circle cx="150" cy="104" r="19" fill="#2fb5a6" stroke="#181b22" stroke-width="4"/><circle cx="144" cy="104" r="5" fill="none" stroke="#fff" stroke-width="3"/><circle cx="156" cy="104" r="5" fill="none" stroke="#fff" stroke-width="3"/><path d="M60 40l3-8 3 8 8 3-8 3-3 8-3-8-8-3z" fill="${V2}" opacity=".6"/><path d="M164 22l4-7M174 32l8-4" stroke="${V2}" stroke-width="3.400" stroke-linecap="round"/></svg>`
};
const head=(t)=>`<div class="shd"><button class="sbk" type="button" data-back aria-label="Back">${BK}</button><b>${t}</b></div>`;
const AV=()=>window.AVA.replace('class="pfava"','style="width:100%;height:100%;display:block"');
const page=(t,d,body,spec)=>({t,d,g:'Settings pages',spec,html:()=>`<div class="scr n nd" style="--pg:#181b22"><div class="ss">${head(t)}<div class="ssc">${body()}</div></div></div>`});
const row=(t,sub,on)=>`<div class="sit tgl${sub?' rd':''}"><div>${t}${sub?`<small>${sub}</small>`:''}</div>${tgx(on)}</div>`;
const IDX=t=>SCREENS.findIndex(s=>s.t===t);

const LANGS=[['English','English','Hi! I am Flame. Let us study!','ltr'],['Español','Spanish','¡Hola! Soy Flame. ¡A estudiar!','ltr'],['Français','French','Salut ! Je suis Flame. On révise ?','ltr'],['Deutsch','German','Hallo! Ich bin Flame. Lass uns lernen!','ltr'],['العربية','Arabic','مرحبًا! أنا فليم. هيا نذاكر!','rtl']];
const SP=[
page('Edit profile','Avatar, name, username, password, email',()=>`<div class="pav${hasAv()?' pav2':''}">${AVU()}</div><span class="pcl" data-av>CHANGE AVATAR</span><div class="sfl">First name</div><input class="sin" value="Aisha"><div class="sfl">Last name</div><input class="sin" value="Rahman"><div class="sfl">Username</div><input class="sin" value="aisha_rahman"><div class="sfl">Password</div><input class="sin" type="password" value="studyos8"><div class="sfl">Email</div><input class="sin" value="aisha.rahman@gmail.com"><button class="sbtn" type="button" data-go="Export my data">EXPORT MY DATA</button><button class="sbtn red" type="button" data-del>DELETE ACCOUNT</button>`,'The fields rise in one after another. Change avatar and the export and delete buttons are tappable. Export my data opens the export page.'),
page('Preferences','Study experience toggles',()=>`<h4 style="margin-top:14px">Study experience</h4><div class="sgrp">${[['Sound effects',1],['Haptic feedback',1],['Animations',1],['Motivational messages',1],['Streak celebrations',1],['Friend streaks',1],['Weekly report',0]].map(([t,o])=>row(t,'',o)).join('')}</div>`,'The list rises in. Every row toggles on tap, with a tick sound and a light haptic.'),
page('Language','Five languages, device language, time and week',()=>`<div class="sill" style="margin-top:2px">${'<svg viewBox="0 0 220 120"><circle cx="110" cy="62" r="46" fill="#e3dbfa" stroke="#a99be2" stroke-width="5"/><path d="M64 62h92M110 16c-24 26-24 70 0 92M110 16c24 26 24 70 0 92M72 40c26 10 50 10 76 0M72 84c26-10 50-10 76 0" fill="none" stroke="#a99be2" stroke-width="3.600" stroke-linecap="round"/><rect x="146" y="20" width="44" height="28" rx="10" fill="#6a58d0"/><path d="M158 48l-2 10 10-10" fill="#6a58d0"/><text x="168" y="40" font-size="15" font-weight="800" text-anchor="middle" fill="#fff" font-family="Inter,Arial">Hi!</text><rect x="30" y="58" width="40" height="26" rx="9" fill="#c9b8c3"/><path d="M42 84l2 9 8-9" fill="#c9b8c3"/><text x="50" y="76" font-size="14" font-weight="800" text-anchor="middle" fill="#181b22" font-family="Inter,Arial">أ</text></svg>'}</div><div class="sh1">Choose your language</div><div class="sh2">Everything in StudyOS, including Flame, will speak it.</div>
<div class="scd" style="margin-top:14px"><div class="tx"><b>Use device language</b><small>Follow your phone's language setting</small></div>${tgx(0)}</div>
<div class="sgt">Languages</div><div class="sgrp" data-langs>${LANGS.map(([n,e,,d],i)=>`<div class="sit rd${i===0?' on':''}" data-lang="${i}"><div><span>${n}${d==='rtl'?'<span class="rtl">RTL</span>':''}</span><small>${e}</small></div><span class="rad"></span></div>`).join('')}</div>
<div class="zv"><div class="zc">${AV()}</div><div class="zb" data-zb>${LANGS[0][2]}</div></div><div class="snote" data-dirn>Text reads left to right.</div>
<div class="sgt">Format</div><div class="sgrp">${row('24-hour time','Show 18:30 instead of 6:30 PM',0)}${row('Week starts on Monday','Used by the planner and reports',1)}${row('Right-to-left layout','Switches on automatically for Arabic',0)}</div>`,'The globe and header rise in. Tapping a language selects it, Flame greets you in it, and Arabic flips the preview to right-to-left.'),
page('Sync and offline','Auto sync, offline mode, sync status',()=>`<div class="sill">${ILL.sync}</div><div class="sh1">Keep your data in sync</div><div class="sh2">Your study data is safely synced across all your devices.</div>
<div class="scd"><div class="ci">${IC.cloud}</div><div class="tx"><b>Auto sync</b><small>Sync tasks, notes, progress and more</small></div>${tgx(1)}</div>
<div class="scd"><div class="ci">${IC.wifi}</div><div class="tx"><b>Offline mode</b><small>Continue studying without internet</small></div>${tgx(0)}</div>
<div style="font:700 15px var(--body);margin:16px 4px 0;color:#f4f2f3">Sync status</div><div class="scd" style="margin-top:8px"><div class="ci" style="color:#3d9d5f"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3d9d5f"/><path d="M7 12.500l3.500 3.500L17 9" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="tx"><small style="margin:0;font-size:14px;color:#cfd2d6" data-last>Last synced: Today at 9:24 PM</small></div><button class="sref" type="button" data-ref aria-label="Sync now">${IC.refresh}</button></div>
<div class="spill"><div class="pi">i</div><div>Your data is automatically saved and synced when you're back online.</div></div>`,'The cloud bobs in and the cards rise. The refresh button spins and updates the last synced time.'),
page('Export my data','Choose what to export and download it',()=>`<div class="sill">${ILL.exp}</div><div class="sh1">Export your StudyOS data</div><div class="sh2">Download a copy of your data including tasks, notes and progress.</div>
<div class="scd" style="flex-direction:column;align-items:stretch;gap:2px;padding:10px 12px;margin-top:14px">${['Tasks & Notes','Study Progress','Planner & Goals','Achievements'].map(t=>`<div class="sck"><i>${CK}</i>${t}</div>`).join('')}</div>
<div class="sbtn fill" role="button" data-exp style="margin-top:14px;position:relative;overflow:hidden"><i class="epr" style="position:absolute;left:0;top:0;bottom:0;width:0;background:#9d8c98"></i>${IC.dl.replace('<svg','<svg width="22" height="22"')}<span style="position:relative">Export Data</span></div><div class="snote" style="display:flex;justify-content:center;align-items:center;gap:6px">${IC.lock}Your data is private and secure.</div>`,'The folder drops in and the file icons float. Export Data shows progress, then a done state with a success sound and haptic.'),
page('Storage and downloads','Used space and downloaded content',()=>`<div class="scd" style="gap:16px;padding:16px"><div style="width:96px;flex:none">${ILL.stor}</div><div class="tx"><b style="font:700 28px var(--display)" data-mb>12.5 MB</b><small style="font-size:15px;color:#cfd2d6">Used of 1 GB</small><div class="sbar"><i data-sb style="width:6%"></i></div></div></div>
<div class="spill"><div class="pi">i</div><div>You have plenty of space for your notes, files and study materials.</div></div>
<div class="sgt">Downloaded content</div><div class="sgrp">${[['note','Study Notes','2.1 MB · 3 files'],['dl','Offline Resources','4.8 MB · 5 files'],['play','Extra Materials','3.2 MB · 2 files']].map(([i,t,s])=>`<div class="sit rd pvr"><div style="flex-direction:row;align-items:center;gap:14px"><span class="ci" style="width:26px;height:26px;display:grid;place-items:center">${IC[i].replace('<svg','<svg width="24" height="24"')}</span><div style="gap:0"><span>${t}</span><small>${s}</small></div></div>${CHV}</div>`).join('')}</div>
<button class="sbtn" type="button" data-clr style="display:flex;align-items:center;justify-content:center;gap:10px;border-radius:30px;margin-top:16px">${IC.trash.replace('<svg','<svg width="22" height="22"')}<span>Clear Cache</span></button><div class="snote" data-cn>This will remove temporary files.</div>`,'The usage card slides in and the bar fills. Clear Cache removes the temporary files and the used space drops.'),
page('Privacy settings','Information collection, activity sharing, speech sharing',()=>`<div class="sgrp" style="margin-top:6px"><div class="sit tgl big"><div><b>Information collection</b><small>Tracking and personalization for advertising</small></div><div class="rtg" data-tg><i></i><b></b></div></div><div class="sit tgl big"><div><b>Share activity with anyone</b><small>Allow anyone to see your study activity on their Feed, not just friends</small></div><div class="rtg" data-tg><i></i><b></b></div></div><div class="sit tgl big"><div><b>Share speech</b><small>Share speech to help StudyOS improve</small></div><div class="rtg" data-tg><i></i><b></b></div></div></div>`,'The card rises in. Every switch slides and the choice is saved.')
];
SCREENS.push(...SP);
['Add task_','Quick Study','Focus Session','Custom Item'].forEach(t=>{const i=SCREENS.findIndex(s=>s.t===t);if(i>=0)SCREENS.splice(i,1)});
SP.forEach(s=>{s.play=function(){
 S.mute=false;
 $$('.ss .ssc > *',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:360,delay:i*45,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
 const ill=$('.sill svg',R);if(ill)ill.animate([{transform:'translateY(-12px) scale(.9)',opacity:0},{transform:'none',opacity:1}],{duration:560,delay:100,easing:'cubic-bezier(.2,.9,.3,1.3)',fill:'backwards'});
 const sb=$('[data-sb]',R);if(sb)sb.animate([{width:'0%'},{width:'6%'}],{duration:800,delay:300,easing:'ease-out',fill:'backwards'});
 hap('light');sfx.pop();
 R.onclick=e=>{
  const T=e.target;
  if(T.closest('[data-back]')){sfx.tick();hap('light');go(IDX('Settings'));return}
  const g=T.closest('[data-go]');if(g){sfx.tick();hap('light');go(IDX(g.dataset.go));return}
  const lg=T.closest('[data-lang]');if(lg){$$('[data-lang]',R).forEach(x=>x.classList.remove('on'));lg.classList.add('on');const L=LANGS[+lg.dataset.lang],zb=$('[data-zb]',R),d=$('[data-dirn]',R);zb.textContent=L[2];zb.style.direction=L[3];zb.style.textAlign=L[3]==='rtl'?'right':'left';d.textContent=L[3]==='rtl'?'Text reads right to left. The layout flips for you.':'Text reads left to right.';$('.zv',R).style.direction=L[3];zb.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260});sfx.tick(1);hap('light');return}
  const tg=T.closest('[data-tg]');if(tg){tg.classList.toggle('off');sfx.tick(1);hap('light');return}
  const rw=T.closest('.sit.tgl');if(rw){const t=$('[data-tg]',rw);t.classList.toggle('off');sfx.tick(1);hap('light');return}
  if(T.closest('[data-ref]')){const b=$('[data-ref]',R);b.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:800,easing:'ease-in-out'});sfx.whoosh(.3);hap('light');at(820,()=>{$('[data-last]',R).textContent='Last synced: Just now';sfx.check();hap('success')});return}
  const ex=T.closest('[data-exp]');if(ex&&!ex.dataset.busy){ex.dataset.busy=1;const sp=$('span',ex);sp.textContent='Preparing your data...';$('.epr',ex).animate([{width:'0%'},{width:'100%'}],{duration:1500,easing:'ease-in-out',fill:'forwards'});sfx.tick(1);hap('light');at(1550,()=>{sp.textContent='Export ready';ex.style.background='#3d9d5f';ex.style.borderColor='#3d9d5f';ex.style.color='#fff';$('.epr',ex).style.display='none';sfx.check();hap('success')});return}
  const cl=T.closest('[data-clr]');if(cl&&!cl.dataset.busy){cl.dataset.busy=1;$('span',cl).textContent='Cache cleared';cl.style.opacity='.6';$('[data-mb]',R).textContent='9.8 MB';$('[data-sb]',R).style.width='4.5%';$('[data-cn]',R).textContent='Removed 2.7 MB of temporary files.';sfx.check();hap('success');return}
  if(T.closest('[data-av],.pvr,[data-del]')){sfx.tick(1);hap('light')}
 }}});
})();
/* ---- storage ---- */
(()=>{

const L='stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const IC={
 db:`<svg viewBox="0 0 100 100"><path d="M14 30v40c0 9 16 16 36 16s36-7 36-16V30z" fill="#d9cbd4"/><ellipse cx="50" cy="30" rx="36" ry="15" fill="#e9dfe5"/><path d="M14 50c0 9 16 16 36 16s36-7 36-16" fill="none" stroke="#181b22" stroke-width="5"/><path d="M14 70c0 9 16 16 36 16s36-7 36-16" fill="none" stroke="#181b22" stroke-width="5" opacity="0"/></svg>`,
 doc:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h8l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M8 12h8M8 16h8M8 8h4" stroke="#d9cbd4" stroke-width="1.800" stroke-linecap="round"/></svg>`,
 dl:`<svg viewBox="0 0 24 24" ${L} stroke-width="2.400"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>`,
 play:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.500" fill="none" stroke="currentColor" stroke-width="2.600"/><path d="M10 8l6 4-6 4z" fill="currentColor"/></svg>`,
 chv:`<svg viewBox="0 0 24 24" ${L} stroke-width="2.600"><path d="M9 5l7 7-7 7"/></svg>`,
 dn:`<svg viewBox="0 0 24 24" ${L} stroke-width="2.400"><path d="M6 9l6 6 6-6"/></svg>`,
 bk:`<svg width="24" height="24" viewBox="0 0 24 24" ${L} stroke-width="2.400"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
 kb:`<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`,
 sr:`<svg width="26" height="26" viewBox="0 0 24 24" ${L} stroke-width="2.200"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`,
 tr:`<svg viewBox="0 0 24 24" ${L}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>`,
 pdf:`<svg class="fi" viewBox="0 0 30 34"><path d="M4 2h14l8 8v20a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#e5484d"/><path d="M18 2v8h8z" fill="#f2a1a3"/><path d="M8 18h12M8 22h12M8 26h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
 docx:`<svg class="fi" viewBox="0 0 30 34"><path d="M4 2h14l8 8v20a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#3b7df0"/><path d="M18 2v8h8z" fill="#9cc0fb"/><path d="M8 18h12M8 22h12M8 26h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`
};
const FILES=[['pdf','Mathematics Notes.pdf','892 KB'],['docx','Physics Formulas.docx','756 KB'],['pdf','Chemistry Summary.pdf','452 KB']];
const frow=(f,i)=>`<div class="fr" data-f="${i}">${IC[f[0]]}<span>${f[1]}</span><em>${f[2]}</em><button class="dlb" type="button" data-dl aria-label="Download">${IC.dl}</button></div>`;
const html=()=>`<div class="scr n nd" style="--pg:#181b22"><div class="stg"><div class="gh"><button class="bk" type="button" data-back aria-label="Back">${IC.bk}</button><b>Storage and Downloads</b><button class="kb" type="button" data-kb aria-label="More">${IC.kb}</button></div>
<div class="gb"><div class="scard">${IC.db}<div style="flex:1;min-width:0"><div class="n" data-mb>12.5 MB</div><div class="u">Used of 1 GB</div><div class="tr"><i data-bar></i></div></div></div>
<div class="srch">${IC.sr}<input data-q placeholder="Search files..." autocomplete="off"></div>
<div class="gc open" data-g="notes"><div class="gr" data-tog><div class="gi">${IC.doc}</div><div><b>Study Notes</b><small>2.1 MB • 3 files</small></div><div class="ch">${IC.chv}</div></div><div class="fl" data-fl>${frow(FILES[0],0)}${frow(FILES[1],1)}<div data-extra style="display:none">${frow(FILES[2],2)}</div></div><div class="more" data-more><span>+1 more file</span>${IC.dn}</div></div>
<div class="gc" data-g="off"><div class="gr" data-row><div class="gi">${IC.dl}</div><div><b>Offline Resources</b><small>4.8 MB • 5 files</small></div><div class="ch">${IC.chv}</div></div></div>
<div class="gc" data-g="extra"><div class="gr" data-row><div class="gi">${IC.play}</div><div><b>Extra Materials</b><small>3.2 MB • 2 files</small></div><div class="ch">${IC.chv}</div></div></div>
<button class="clr" type="button" data-clr>${IC.tr}Clear Cache</button><div class="cn" data-cn>This will remove temporary files.</div></div></div></div>`;
const play=function(){
 S.mute=false;
 $$('.gb > *',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:360,delay:i*60,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
 $('.scard svg',R).animate([{transform:'scale(.8) rotate(-8deg)',opacity:0},{transform:'none',opacity:1}],{duration:520,delay:120,easing:'cubic-bezier(.2,.9,.3,1.3)',fill:'backwards'});
 const bar=$('[data-bar]',R);bar.animate([{width:'0%'},{width:'8%'}],{duration:900,delay:320,easing:'ease-out',fill:'backwards'});
 hap('light');sfx.pop();
 const idx=t=>SCREENS.findIndex(s=>s.t===t);
 R.onclick=e=>{
  const T=e.target;
  if(T.closest('[data-back]')){sfx.tick();hap('light');go(idx('Settings'));return}
  if(T.closest('[data-kb]')){sfx.tick();hap('light');return}
  const d=T.closest('[data-dl]');if(d){if(!d.classList.contains('done')){d.classList.add('done');d.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>';d.animate([{transform:'scale(.7)'},{transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.9,.3,1.4)'});sfx.check();hap('success')}return}
  const m=T.closest('[data-more]');if(m){const ex=$('[data-extra]',R),open=ex.style.display==='none';ex.style.display=open?'block':'none';m.classList.toggle('up',open);$('span',m).textContent=open?'Show less':'+1 more file';if(open)ex.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:240});sfx.tick(1);hap('light');return}
  const tg=T.closest('[data-tog]');if(tg){const g=tg.parentNode,o=g.classList.toggle('open');$('[data-fl]',g).style.display=o?'block':'none';$('[data-more]',g).style.display=o?'flex':'none';sfx.tick(1);hap('light');return}
  if(T.closest('[data-row]')){sfx.tick(1);hap('light');return}
  if(T.closest('[data-clr]')){$('[data-mb]',R).textContent='9.8 MB';bar.style.width='6%';$('[data-cn]',R).textContent='Cache cleared. Temporary files removed.';sfx.check();hap('success');return}
 };
 R.oninput=e=>{if(!e.target.matches('[data-q]'))return;const q=e.target.value.trim().toLowerCase();$$('.fr',R).forEach(r=>{const n=$('span',r).textContent.toLowerCase();r.style.display=(!q||n.includes(q))?'flex':'none'});if(q){$('[data-extra]',R).style.display='block';$('[data-more]',R).style.display='none'}else{$('[data-extra]',R).style.display='none';$('[data-more]',R).style.display='flex'}};
};
const s=SCREENS.find(x=>x.t==='Storage and downloads');
s.d='Used space, search, downloaded files, clear cache';s.html=html;s.play=play;
s.spec={m:'The storage card, search field and file groups rise in one after another. Study Notes opens and closes, +1 more file shows the third file, each download button turns into a tick, and the search field filters the files. Clear Cache lowers the used space.',h:'Light tap on rows, success pattern on a finished download and on Clear Cache.',s:'Soft tick on rows, check sound when a download finishes or the cache is cleared.'};
})();
/* ---- notifications ---- */
(()=>{
const PHN='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>';
const MLN='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 8l8 5.500L20 8"/></svg>';
const CHN='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#8f9ca8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
const BKS='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NS={smart:1,cal:1,rt:17*60,st:20*60+30};
const fm=m=>{const h=Math.floor(m/60),mm=m%60;return ((h+11)%12+1)+':'+String(mm).padStart(2,'0')+' '+(h<12?'AM':'PM')};
const nic=(l,c)=>`<div class="nr"><b>${l}</b>${[...c].map(k=>{const id=l+k;if(NS[id]===undefined)NS[id]=1;return `<button class="nib${NS[id]?' on':''}" type="button" data-a="ic" data-k="${id}" aria-label="${k==='p'?'Push':'Email'} ${l}">${k==='p'?PHN:MLN}</button>`}).join('')}</div>`;
const ntg=(l,k)=>`<div class="nr" data-a="tg" data-k="${k}"><b>${l}</b><div class="ptg${NS[k]?'':' off'}"><i></i></div></div>`;
const ntm=(l,k,pl)=>`<div class="nr${(k==='rt'&&NS.smart)||(k==='st'&&!NS.cal)?' dim':''}${pl?'':' plain'}" data-a="tm" data-k="${k}"><b>${l}</b><span class="ntm" data-t="${k}">${fm(NS[k])}</span></div>`;
const grp=a=>`<div class="ngrp">${a.join('')}</div>`;
const nsc=(t,body,hub)=>({t:hub?'Notifications':'Notifications · '+t,d:hub?'Reminders, friends, leaderboards, nudges, announcements':'Notification settings: '+t,g:'Settings pages',
 spec:{m:'Cards rise in one after another. Push and email buttons light up when switched on, toggles slide, and the time rows step in 30 minute jumps. Smart scheduling dims the reminder time and Calendar integration wakes the start time.',h:'Medium tap on every switch and button, light tap on rows and Back.',s:'No tap sounds.'},
 html:()=>`<div class="scr n nd nt" style="--pg:#181b22"><div class="ss"><div class="shd"><button class="sbk" type="button" data-a="back" aria-label="Back">${BKS}</button><b>${hub?'Notifications':t}</b></div><div class="ssc" style="padding-top:8px">${body()}</div></div></div>`,
 play(){S.mute=false;rise('.nt .ngrp',0,70);hap('light');
  const refresh=()=>{const r=$('[data-k=rt]',R);if(r)r.classList.toggle('dim',!!NS.smart);const q=$('[data-k=st]',R);if(q)q.classList.toggle('dim',!NS.cal)};
  R.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;
   if(a==='back'){hap('light');go(IDX(hub?'Settings':'Notifications'));return}
   if(a==='open'){hap('light');go(IDX(b.dataset.t));return}
   if(a==='ic'){NS[k]=NS[k]?0:1;b.classList.toggle('on',!!NS[k]);hap('medium');b.animate([{transform:'scale(.84)'},{transform:'scale(1.08)'},{transform:'none'}],{duration:260})}
   else if(a==='tg'){NS[k]=NS[k]?0:1;$('.ptg',b).classList.toggle('off',!NS[k]);hap('medium');refresh()}
   else if(a==='tm'){if(b.classList.contains('dim')){hap('tick');return}NS[k]=(NS[k]+30)%1440;$('[data-t='+k+']',b).textContent=fm(NS[k]);hap('tick')}}}});
const hubRow=(t,d,to)=>`<div class="nr" data-a="open" data-t="Notifications · ${to}"><div><b style="display:block">${t}</b><small>${d}</small></div>${CHN}</div>`;
const NSC=[
 nsc('',()=>grp([hubRow('Reminders','Daily practice and streak reminders','Reminders'),hubRow('Friends','Updates on new followers and your friends’ achievements','Friends'),hubRow('Leaderboards','Progress updates on your league','Leaderboards'),hubRow('Friend Nudges','Reminders from friends','Friend Nudges'),hubRow('Announcements','Updates on new features, promotions, and events','Announcements')]),true),
 nsc('Reminders',()=>grp([nic('Practice reminder','pm'),ntg('Smart scheduling','smart'),ntm('Reminder time','rt')])+grp([nic('Streak Freeze Used','pm'),nic('Streak Saver','p'),nic('Weekly progress','m')])+grp([ntg('Calendar integration','cal'),ntm('Start time','st',1)])),
 nsc('Friends',()=>grp([nic('New follower','pm'),nic('Friend activity','pm'),nic('Friend Streak invites','p')])),
 nsc('Leaderboards',()=>grp([nic('League status','p')])),
 nsc('Friend Nudges',()=>grp([nic('Friend Streaks','p'),nic('Study Quests','p'),nic('Study Groups','p')])),
 nsc('Announcements',()=>grp([nic('News + promotions','pm'),nic('Product updates + learning tips','pm'),nic('Research invitations','m')]))
];
{const k=IDX('Privacy settings');SCREENS.splice(k>=0?k+1:SCREENS.length,0,...NSC)}
})();
/* ================= REAL DATA + ACTIONS (the design screens above are used as drawn) ================= */
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wrapD=h=>wrap(h,!!D.dark);
/* Always-dark pages (Focus, Profile, Settings, Friends...) follow the light theme: add .lt and swap hard-coded dark inline colours for theme variables. */
const LT_MAP={'#ebe8ea':'--ink','#f4f2f3':'--ink','#f5f5f5':'--ink','#d4d4d4':'--ink','#cfd2d6':'--ink','#bfc4c9':'--ink','#c9c9cc':'--ink','#8b98a2':'--mut','#9aa6b0':'--mut','#9aa3ab':'--mut','#c9b8c3':'--mv','#181b22':'--pg','#0d1114':'--pg','#0b0e11':'--pg','#161b21':'--pg','#2d3740':'--chip','#2f3942':'--chip','#3a454e':'--chip','#1f252d':'--card','#262e36':'--card','#2a323a':'--card'};
const ltFix=h=>{
  if(D.dark||typeof h!=='string'||h.indexOf('class="scr n nd')<0||h.indexOf('class="scr n nd')>8)return h;
  h=h.replace('class="scr n nd','class="scr n nd lt').replace(' style="--pg:#181b22"','');
  return h.replace(/style="([^"]*)"/g,(m,v)=>'style="'+v.replace(/#[0-9a-fA-F]{6}\b/g,x=>LT_MAP[x.toLowerCase()]?'var('+LT_MAP[x.toLowerCase()]+')':x)+'"');
};

// Shop features this account owns (Weekly Report Plus = 'report', Exam Mode Pro = 'exam'). Also true with no connection, from the saved list.
const hasPro=k=>!!(DZ.owns&&DZ.owns(k))&&!D.guest;
const LOCKI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
// Shown instead of a Plus feature when it is not owned. Tapping it opens the Gem Shop.
const proLock=(k,t,d)=>`<div class="card pl-lock" data-prolock="${k}" role="button" aria-label="${esc(t)} is locked. Open the Gem Shop"><span class="pl-lki">${LOCKI}</span><div><b>${esc(t)}</b><small>${esc(d)}</small></div><span class="pl-go">Gem Shop</span></div>`;
const dayWord=n=>n===0?'today':n+(n===1?' day':' days');
const emptyRing=1;
function toast(t){const d=document.createElement('div');d.className='dz-toast';d.textContent=t;(R||stage).appendChild(d);d.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:220,fill:'both'});setTimeout(()=>{if(d.isConnected)d.animate([{opacity:1},{opacity:0}],{duration:240,fill:'forwards'}).onfinish=()=>d.remove()},2200)}

/* ---- Home ---- */
const homeTasks=()=>(D.tasks||[]).filter(t=>!t.done).slice(0,3);
// Exam Mode Pro on Home: every upcoming exam with its countdown and today's study target (up to 3).
const proHome=()=>{
  if(!hasPro('exam'))return '';
  const L=(D.exams||[]).slice(0,3);
  if(!L.length)return '';
  return `<div class="pl-hm">${L.map(x=>`<div class="pl-hr"><span>${esc(x.subject)} · ${dayWord(x.days)}</span><b>${Math.min(x.today,x.target)} / ${x.target} min today</b></div>`).join('')}</div>`;
};
const homeInnerReal=()=>{
  const g=Math.max(1,D.goalMin||60),tm=Math.max(0,Math.round(D.todayMin||0)),pct=Math.min(1,tm/g);
  const ex=D.exam,hasEx=!!ex;
  const rows=homeTasks();
  const tl=rows.length?rows.map(t=>trowR(t)).join(''):`<div class="card" style="margin-top:8px;border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:18px">${D.guest?'Create your profile to add tasks.':'Nothing due. Tap + to add a task.'}</div>`;
  return `<div class="pg">${tb()}
<div class="sync"><i${D.online===false||D.pending?' style="background:#d49a3a"':''}></i>${D.syncing?'Syncing your changes...':D.online===false?(D.pending?'Offline · '+D.pending+(D.pending===1?' change':' changes')+' saved on this phone':'Offline · everything is saved on this phone'):D.pending?D.pending+(D.pending===1?' change':' changes')+' waiting to sync':'All changes synced · works offline'}</div>
<div class="ttl">Hi, ${esc(D.first||'there')}</div><div class="sub2">Make today count.</div>
<div class="card dkc rw" style="gap:16px;height:130px;border-radius:26px;justify-content:flex-start;margin-top:14px"><div class="ring2">${ring(94,9,pct,'#c9b8c3','#3c4450')}<div class="c">${tm}m</div></div><div><div style="font:700 17px var(--display);color:#ebe8ea">Daily goal</div><div style="font:600 13px var(--body);color:#cfd2d6;margin:4px 0 9px">${tm} of ${g} min studied</div><span class="tag" style="display:inline-flex;align-items:center;gap:6px;border-radius:16px;padding:6px 12px;font-size:13px">${FLM('#1b1e25','#c9b8c3',11,14)} ${D.streak||0} day streak</span></div></div>
<div class="card" data-exam><div style="font:700 11px var(--body);letter-spacing:.1em;color:var(--mut)">EXAM MODE</div><div class="rw"><b style="font:700 21px var(--display)">${hasEx?esc(ex.subject)+' · '+(ex.days===0?'today':ex.days+(ex.days===1?' day':' days')):'No exam set'}</b><b style="font:700 13px var(--body)">${hasEx?ex.ready+'% ready':''}</b></div><div class="bar2" style="margin-top:10px"><i style="width:${hasEx?ex.ready:0}%"></i></div>${proHome()}</div>
<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Today</b><span class="mut" data-seeall style="font:700 13px var(--body)">See all</span></div>
${tl}
</div><div class="fab">${ICO.plus}</div>${nav('home')}`;
};
const trowR=(t)=>`<div class="trow" data-tid="${esc(t.id)}"><div class="cb${t.done?' ck':''}" data-cb>${t.done?CHECK:''}</div><div><div class="tt"${t.done?' style="text-decoration:line-through;opacity:.6"':''}>${esc(t.title)}</div><div class="meta"><span class="tag">${esc(t.subject)}</span><span class="mt">${esc(t.meta||'')}</span></div></div></div>`;
const bindRows=()=>{
  R.addEventListener('click',e=>{
    const cb=e.target.closest('[data-cb]');if(!cb)return;
    const row=cb.closest('[data-tid]');if(!row)return;
    e.stopPropagation();
    const id=row.dataset.tid,wasDone=cb.classList.contains('ck');
    cb.classList.toggle('ck',!wasDone);cb.innerHTML=wasDone?'':CHECK;
    cb.animate([{transform:'scale(.7)'},{transform:'scale(1.15)'},{transform:'none'}],{duration:260});
    hap(wasDone?'tick':'success');
    if(CB.toggleTask)CB.toggleTask(id);
  },true);
};
const homeEnter=()=>{enter();$$('.trow,.fab',R).forEach(r=>r.style.cursor='pointer');bindRows();hap('light')};
const homeClick=(e)=>{
  if(e.target.closest('[data-cb]'))return;
  if(e.target.closest('.fab')){hap('light');go('Quick add');return}
  if(e.target.closest('[data-seeall]')){hap('light');go('Tasks');return}
};
SCREENS[IDX('Home')].html=()=>wrapD(homeInnerReal());
SCREENS[IDX('Home')].play=()=>{homeEnter();R.onclick=homeClick};
{const k=IDX('Home dark');if(k>=0)SCREENS.splice(k,1)}

/* ---- Tasks ---- */
let TF='Today';
const inRange=(t,f)=>f==='All'||(f==='Today'?(t.when==='today'||t.when==='overdue'):(t.when!=='later'&&t.when!==''));
const tasksHtml=()=>{
  DZ.editTask=null;
  const list=(D.tasks||[]).filter(t=>inRange(t,TF)).sort((a,b)=>(a.done-b.done));
  const rows=list.map(t=>`<div class="swipe" data-sw="${esc(t.id)}"><div class="bk dn"><span style="width:20px;height:20px;display:block">${CHECK}</span>Done</div><div class="bk dl"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 7h12l-1 14H7zM4 5h16v2H4zM9 2h6v2H9z"/></svg>Delete</div>${trowR(t).slice(0,-6)}<button type="button" class="tedit" data-edit="${esc(t.id)}" aria-label="Edit ${esc(t.title)}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button></div></div>`).join('');
  const seg=`<div class="seg" data-tseg>${['Today','Week','All'].map(x=>`<span${x===TF?' class="on"':''}>${x}</span>`).join('')}</div>`;
  if(!(D.tasks||[]).length){
    return wrapD(`<div class="pg">${tb()}<div class="ttl" style="margin-top:12px">Tasks</div>
<div style="display:flex;justify-content:center;margin-top:78px"><svg width="126" height="126" viewBox="0 0 126 126"><circle cx="63" cy="63" r="63" fill="#c9b8c3"/><rect x="32" y="21" width="62" height="82" rx="10" fill="#1b1e25"/><rect x="51" y="14" width="24" height="15" rx="6" fill="#8296a3"/><rect x="42" y="42" width="40" height="7" rx="3.500" fill="#c9b8c3"/><rect x="42" y="56" width="26" height="7" rx="3.500" fill="#6b8190"/><rect x="42" y="70" width="34" height="7" rx="3.500" fill="#6b8190"/></svg></div>
<div style="text-align:center;font:700 26px var(--display);margin-top:22px">Nothing to do yet</div><div style="text-align:center;font:600 14px/1.5 var(--body);color:var(--mut);margin-top:10px">Add your first task and plan your day.<br>Everything works offline.</div>
<div class="btn2" data-addtask style="margin-top:22px;border-radius:24px">Add your first task</div></div>${nav('tasks')}`);
  }
  return wrapD(`<div class="pg">${tb()}<div class="ttl" style="margin-top:10px">Tasks</div><div class="sub2">Swipe right to finish, left to delete.</div>${seg}${rows||`<div class="card" style="margin-top:12px;border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:22px">Nothing here. Try All.</div>`}</div><div class="snack" data-snack style="display:none"><span>Task deleted</span><span data-undo style="color:var(--mv)">UNDO</span></div><div class="fab">${ICO.plus}</div>${nav('tasks')}`);
};
const tasksPlay=()=>{
  enter();hap('light');
  let lastDel=null,snT=0;
  const sn=$('[data-snack]',R);
  const showSnack=()=>{if(!sn)return;sn.style.display='flex';sn.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:240});clearTimeout(snT);snT=setTimeout(()=>{sn.style.display='none';lastDel=null},4000)};
  $$('[data-sw]',R).forEach(sw=>{
    const row=$('.trow',sw),id=sw.dataset.sw;let x0=0,y0=0,dx=0,drag=false,locked=false;
    row.style.touchAction='pan-y';
    row.addEventListener('pointerdown',e=>{if(e.target.closest('[data-cb],[data-edit]'))return;x0=e.clientX;y0=e.clientY;dx=0;drag=true;locked=false;row.style.transition='none'});
    row.addEventListener('pointermove',e=>{if(!drag)return;const K=(host.clientWidth||360)/360;const mx=(e.clientX-x0)/K,my=(e.clientY-y0)/K;if(!locked){if(Math.abs(my)>10&&Math.abs(my)>Math.abs(mx)){drag=false;row.style.transform='';return}if(Math.abs(mx)>8){locked=true;try{row.setPointerCapture(e.pointerId)}catch(_){}}}if(locked){dx=Math.max(-130,Math.min(130,mx));row.style.transform='translateX('+dx+'px)'}});
    const end=()=>{if(!drag&&!locked)return;drag=false;row.style.transition='transform .22s cubic-bezier(.2,.9,.3,1)';
      if(dx>80){hap('success');row.style.transform='';if(CB.toggleTask)CB.toggleTask(id,true);return}
      if(dx<-80){hap('press');const t=(D.tasks||[]).find(z=>String(z.id)===String(id));lastDel=t?{...t}:null;sw.animate([{opacity:1},{opacity:0,height:'0px'}],{duration:220,fill:'forwards'});const pend=CB.deleteTask?CB.deleteTask(id):null;if(DZ.undoOffer&&lastDel)DZ.undoOffer('task',lastDel,pend);else showSnack();return}
      row.style.transform=''};
    row.addEventListener('pointerup',end);row.addEventListener('pointercancel',end);
  });
  bindRows();
  R.onclick=e=>{
    if(e.target.closest('[data-cb]'))return;
    if(e.target.closest('[data-undo]')){hap('light');if(lastDel&&CB.undoDelete)CB.undoDelete(lastDel);lastDel=null;if(sn)sn.style.display='none';return}
    const ed=e.target.closest('[data-edit]');if(ed){hap('light');DZ.editTask=ed.dataset.edit;go('Add task');return}
    const sp=e.target.closest('[data-tseg] span');if(sp){TF=en0(sp).trim();hap('tick');go('Tasks');return}
    if(e.target.closest('.fab,[data-addtask]')){hap('light');DZ.editTask=null;go('Add task');return}
  };
};
SCREENS[IDX('Tasks')].html=tasksHtml;SCREENS[IDX('Tasks')].play=tasksPlay;
{const k=IDX('Tasks, empty');if(k>=0)SCREENS.splice(k,1)}

/* ---- Friends (real friends, same layout) ---- */
const AVCOL=['#e85a5a','#c7b9c4','#9fb6c3','#c9c4a6','#b4c7b0','#d0b09f'];
const colOf=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return AVCOL[h%AVCOL.length]};
let FADD=false,FMSG='';
const friendsHtml=()=>{
  const fr=(D.friends||[]).map(f=>({n:f.name,m:f.gems||0,id:f.id}));
  const rows=[...fr,{n:(D.first||'You')+' (You)',m:D.gems||0,me:1}].sort((a,b)=>b.m-a.m);
  const req=(D.incoming||[]).map(u=>`<div class="rw rw-req" data-req="${esc(u.id)}"><div style="display:flex;align-items:center;gap:12px;font:700 15px var(--body)"><span class="ava">${esc((u.name||'?').charAt(0).toUpperCase())}</span>${esc(u.name)}</div><span style="display:flex;gap:8px"><span class="chip" data-acc style="height:34px;padding:0 14px;font-size:14px;background:#2e8059;color:#fff">Accept</span><span class="chip" data-dec style="height:34px;padding:0 14px;font-size:14px">Decline</span></span></div>`).join('');
  return wrapD(`<div class="pg" style="padding-top:38px">${head('Friends',ICO.back,ICO.plus)}
${FADD?`<div class="card" data-addbox style="margin-top:8px;border-radius:22px"><div class="lbl" style="margin:0 0 8px">Friend's email</div><input class="input dz-in" data-femail type="email" inputmode="email" autocomplete="off" placeholder="friend@email.com" style="width:100%;border:0;outline:0;margin:0"><div class="btn2" data-send style="margin-top:10px;border-radius:24px;height:46px">Send request</div>${FMSG?`<div class="mut" style="font:600 13px var(--body);margin-top:8px">${esc(FMSG)}</div>`:''}</div>`:''}
${req?`<b style="display:block;font:700 20px var(--display);margin-top:14px">Requests</b>${req}`:''}
<div class="mut" style="font:700 13px var(--body);margin:10px 2px 4px">Leaderboard · gems</div>
${rows.map((r,i)=>`<div class="lbrow${r.me?' me':''}"${r.me?'':` data-fid="${esc(r.id)}" role="button" aria-label="Open ${esc(r.n)}'s profile"`}><span class="rk">${i+1}</span><span class="ava">${esc((r.n||'?').charAt(0).toUpperCase())}</span><span>${esc(r.n)}</span><span class="mn">${r.m.toLocaleString()}</span></div>`).join('')}
${fr.length?'':`<div class="mut" style="font:600 14px/1.5 var(--body);margin:12px 4px;text-align:center">No friends yet. Invite someone and you both earn 10 gems.</div>`}
<div class="btn2" data-invite style="margin-top:14px;border-radius:24px">Invite a friend</div></div>`);
};
const friendsPlay=()=>{
  enter();hap('light');
  R.onclick=async e=>{
    if(e.target.closest('.hd span:first-child'))return go('Profile');
    if(e.target.closest('.hd span:last-child')){FADD=!FADD;FMSG='';go('Friends');return}
    const fpr=e.target.closest('[data-fid]');if(fpr&&!e.target.closest('[data-req]')){DZ.openFriend(fpr.dataset.fid,'Friends');return}
    if(e.target.closest('[data-invite]')){hap('light');if(CB.invite)CB.invite();return}
    const send=e.target.closest('[data-send]');
    if(send){const v=($('[data-femail]',R).value||'').trim();if(!v.includes('@')){FMSG='Enter your friend\'s email address.';go('Friends');return}send.textContent='Sending…';const r=CB.addFriend?await CB.addFriend(v):{message:''};FMSG=(r&&r.message)||'';go('Friends');return}
    const rq=e.target.closest('[data-req]');
    if(rq&&e.target.closest('[data-acc]')){hap('success');if(CB.respond)CB.respond(rq.dataset.req,true);return}
    if(rq&&e.target.closest('[data-dec]')){hap('tick');if(CB.respond)CB.respond(rq.dataset.req,false);return}
  };
};
SCREENS[IDX('Friends')].html=friendsHtml;SCREENS[IDX('Friends')].play=friendsPlay;
/* The design's header buttons for these pages are drawn as spans; make them tappable. */

/* ---- Profile (real name, counts, friends) ---- */
{
  const k=IDX('Profile'),ph=SCREENS[k].html,pp=SCREENS[k].play;
  SCREENS[k].html=()=>{
    U.streak=D.streak||0;
    let h=ph();
    const nm=esc(D.fullName||'Student'),fr=(D.friends||[]);
    h=h.replace('<div class="hname">Aisha Rahman</div>','<div class="hname">'+nm+'</div>')
       .replace('@aisha_rahman · Joined 2026','@'+esc(D.username||'student')+' · Joined '+esc(D.joinedYear||new Date().getFullYear()))
       .replace('<span class="plus2">+2</span>','<span class="plus2">'+(D.subjectCount||0)+'</span>')
       .replace('<b>12</b><span>Following</span>','<b>'+fr.length+'</b><span>Following</span>')
       .replace('<b>8</b><span>Followers</span>','<b>'+fr.length+'</b><span>Followers</span>')
       .replace(/\d+ tasks<\/div>/,(D.tasksDone||0)+' tasks</div>')
       .replace('42 hours',(D.hours||0)+' hours')
       .replace(/<svg viewBox="0 0 32 32"><path d="M19 2L6 18h8l-3 12 15-17h-9z"[^]*?<\/svg>1,240 XP/,CUBE+'1,240 XP')
       .replace('1,240 XP',(D.gems||0).toLocaleString()+' gems');
    const a=h.indexOf('<div class="sec">Friend streaks</div>');
    const z=h.indexOf('</div></div><div class="pfbar"');
    if(a>0&&z>a){
      const list=fr.map(f=>`<div data-fid="${esc(f.id)}" role="button" aria-label="Open ${esc(f.name)}'s profile" style="cursor:pointer"><span class="pf-fa${DZ.fxChr&&DZ.fxChr(f.id,f.avatar,'face')?'':' nopic'}" style="--c:${colOf(f.name)}">${DZ.pfFace?DZ.pfFace(f.id,f.avatar,f.picture):''}</span><span class="pf-fn">${esc(String(f.name||'Friend').split(' ')[0])}</span><div class="cnt"><span style="width:18px;height:18px;display:flex;align-items:center;justify-content:center" aria-hidden="true">${flameIconHtml(16,(f.streak||0)>0?'red':'grey')}</span><span aria-label="${f.streak||0} day streak">${f.streak||0}</span></div></div>`).join('');
      h=h.slice(0,a)+'<div class="sec fsx-h"><span>Friend streaks</span>'+(fr.length?`<span class="fsx-n" aria-label="${fr.length} friends">${fr.length}</span>`:'')+'</div>'+((D.incoming||[]).length?`<div class="chip" data-reqs style="margin-bottom:12px;background:#c9b8c3;color:#1b1e25">${(D.incoming||[]).length} friend ${(D.incoming||[]).length===1?'request':'requests'} · View</div>`:'')+(fr.length?`<div class="fs fsx" role="list">${list}</div>`:`<div style="font:700 14px var(--body);color:#8b98a2">Add friends to see them here.</div>`)+h.slice(z);
    }
    return h;
  };
  SCREENS[k].play=()=>{
    pp();const old=R.onclick;
    R.onclick=e=>{
      if(e.target.closest('[data-subj]')){hap('light');go('My subjects');return}
      if(e.target.closest('[data-pfx]')){hap('light');const hn=R.querySelector('.nv[data-k="home"]');if(hn)hn.click();return}
      if(e.target.closest('[data-edit]')){hap('light');go('Edit profile');return}
      const fpf=e.target.closest('[data-fid]');if(fpf){DZ.openFriend(fpf.dataset.fid,'Profile');return}
      if(e.target.closest('[data-reqs]')){hap('light');go('Friends');return}
      if(e.target.closest('[data-look]')){hap('light');return}
      old(e);
    };
  };
}
/* QR sheet shows the real name */
{const k=IDX('Profile QR'),qh=SCREENS[k].html;SCREENS[k].html=()=>{const h=qh();return h.replace('<div class="qn">Aisha Rahman</div><div class="qhh">@aisha_rahman</div>','<div class="qn">'+esc(D.fullName||'Student')+'</div><div class="qhh">@'+esc(D.username||'student')+'</div>')}}

/* ---- Settings: sign out, help, done ---- */
{
  const k=IDX('Settings'),sp=SCREENS[k].play;
  SCREENS[k].play=()=>{sp();const old=R.onclick;R.onclick=e=>{
    if(e.target.closest('[data-out]')){hap('press');if(CB.signOut)CB.signOut();return}
    const it=e.target.closest('[data-it]');
    if(it&&(it.dataset.it==='Help Center'||it.dataset.it==='Feedback')){hap('light');if(CB.help)CB.help(it.dataset.it);return}
    old(e)}};
}

/* ---- Edit profile: real fields ---- */
{
  const k=IDX('Edit profile'),eh=SCREENS[k].html,ep=SCREENS[k].play;
  SCREENS[k].html=()=>{
    const first=esc(D.first||''),last=esc(D.last||''),user=esc(D.username||''),mail=esc(D.email||'');
    return eh().replace('value="Aisha"','value="'+first+'" data-f="first" maxlength="30"').replace('value="Rahman"','value="'+last+'" data-f="last" maxlength="30"').replace('value="aisha_rahman"','value="'+user+'" data-f="username" maxlength="30" readonly').replace('value="studyos8"','value="••••••••" readonly').replace('value="aisha.rahman@gmail.com"','value="'+mail+'" readonly')
      .replace('<button class="sbtn" type="button" data-go="Export my data">','<button class="sbtn fill" type="button" data-savep style="margin-top:18px">SAVE CHANGES</button><button class="sbtn" type="button" data-go="Export my data">');
  };
  SCREENS[k].play=()=>{ep();const old=R.onclick;R.onclick=async e=>{
    if(e.target.closest('[data-savep]')){const f=$('[data-f=first]',R).value.trim(),l=$('[data-f=last]',R).value.trim();const name=(f+' '+l).trim();if(name.length<2){toast('Enter your name (2 to 40 letters)');return}hap('press');const ok=CB.saveProfile?await CB.saveProfile(name):false;toast(ok?'Profile saved':'Could not save. Try again.');if(ok)hap('success');return}
    if(e.target.closest('[data-av]')){hap('light');DZ.openAvatar();return}
    if(e.target.closest('[data-del]')){hap('light');toast('To delete your account, contact support.');return}
    old(e)}};
}

/* ---- Quick add + Add task / Add note with real saves ---- */
{
  const SUBJR=()=>(D.subjects&&D.subjects.length?D.subjects:['Biology','Maths','Physics','Chemistry']);
  const mk=(title,icon,sub,body,cta,kind)=>{const p=DZ.qpage(title,icon,sub,body,cta,kind);return p};
  const pick=(sel)=>{const el=$(sel+' .on',R);return el?en0(el).trim():''};
  const addTaskPage=()=>{
    const p=mk('Add task','task','Write it down so you can tick it off.','','Add task','task');
    // Editing: DZ.editTask holds the id of the task being changed. Empty = a new task.
    const editing=()=>{const id=DZ.editTask;return id?(D.tasks||[]).find(t=>String(t.id)===String(id))||null:null};
    const isoDay=d=>d.toISOString().slice(0,10);
    p.html=()=>{
      const ed=editing();
      let subs=SUBJR().slice();
      if(ed&&ed.subject&&!subs.some(x=>x.toLowerCase()===String(ed.subject).toLowerCase()))subs=[ed.subject,...subs];
      const pre=!ed&&DZ.preSubj?String(DZ.preSubj):'';if(pre&&!subs.some(x=>x.toLowerCase()===pre.toLowerCase()))subs=[pre,...subs];
      const si=ed?Math.max(0,subs.findIndex(x=>x.toLowerCase()===String(ed.subject||'').toLowerCase())):pre?Math.max(0,subs.findIndex(x=>x.toLowerCase()===pre.toLowerCase())):0;DZ.preSubj='';
      const pi=ed?Math.max(0,['low','medium','high'].indexOf(String(ed.priority||'medium').toLowerCase())):1;
      let dueChips=['Today','Tomorrow','Pick date'],di=0;
      if(ed&&ed.dueDate){const t0=new Date(),t1=new Date();t1.setDate(t1.getDate()+1);
        if(ed.dueDate===isoDay(t0))di=0;else if(ed.dueDate===isoDay(t1))di=1;else{dueChips=['Today','Tomorrow',ed.dueDate];di=2}}
      const title=ed?'Edit task':'Add task',sub=ed?'Change anything you like, then save.':'Write it down so you can tick it off.',cta=ed?'Save changes':'Add task';
      const body=`${DZ.lb('Task')}<input class="input dz-in" data-f="title" maxlength="120" placeholder="What do you need to do?" value="${ed?esc(ed.title):''}" style="width:100%;border:0;outline:0;color:#1b1e25;font-weight:500">${DZ.lb('Subject')}<input class="dz-combo" data-combo role="combobox" aria-expanded="false" aria-label="Search or type a subject" autocomplete="off" maxlength="40" placeholder="Search or type a subject"><div class="chips" data-subj role="listbox">${DZ.ch(subs,si)}</div><button type="button" class="dz-disc${ed?' open':''}" data-disc aria-expanded="${ed?'true':'false'}"><span>More options</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="dz-fold${ed?' open':''}" data-fold><div>${DZ.lb('Priority')}<div data-prio>${DZ.sg(['Low','Medium','High'],pi)}</div>${DZ.lb('Due')}<div class="chips" data-due>${DZ.ch(dueChips,di)}</div></div></div><input type="date" data-date style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px">`;
      return wrapD(`<div class="pg"><div class="qh"><button class="qback" type="button" data-back aria-label="Back">${DZ.BACK}</button><div class="qhi">${DZ.QI.task}</div></div><div class="qpt">${title}</div><div class="qps">${sub}</div>${body}</div><button class="btn2 qcta" type="button" data-save="task">${cta}</button>`);
    };
    const op=p.play;
    p.play=function(){op.call(this);const old=R.onclick;const ed=editing();let picked=(ed&&ed.dueDate&&!/^(Today|Tomorrow)$/.test(pick('[data-due]')))?ed.dueDate:'';
      P.combo($('[data-combo]',R),$('[data-subj]',R));
      R.onclick=async e=>{
        const dc=e.target.closest('[data-disc]');if(dc){const f=$('[data-fold]',R),o=!f.classList.contains('open');f.classList.toggle('open',o);dc.setAttribute('aria-expanded',o);dc.classList.toggle('open',o);hap('light');return}
        if(e.target.closest('[data-back]')){hap('light');DZ.editTask=null;go('Tasks');return}
        const due=e.target.closest('[data-due] .chip');
        if(due){const tx=due.textContent.trim();
          if(tx==='Pick date'||/^\d{4}-\d{2}-\d{2}$/.test(tx)){const di=$('[data-date]',R);if(/^\d{4}-/.test(tx))di.value=tx;try{di.showPicker()}catch(_){di.click()}di.onchange=()=>{if(!di.value)return;picked=di.value;due.textContent=picked;$$('[data-chip]',due.parentNode).forEach(x=>x.classList.remove('on'));due.classList.add('on')};return}
          picked=''}
        const s=e.target.closest('[data-save]');
        if(s){const title=$('[data-f=title]',R).value.trim();if(!title){toast('Write a task first');return}
          const subj=pick('[data-subj]')||SUBJR()[0],pr=pick('[data-prio]')||'Medium',dueTxt=picked||pick('[data-due]')||'Today';
          const base=new Date();let dueDate=isoDay(base);
          if(dueTxt==='Tomorrow'){base.setDate(base.getDate()+1);dueDate=isoDay(base)}else if(/^\d{4}-\d{2}-\d{2}$/.test(dueTxt))dueDate=dueTxt;
          s.disabled=true;hap('press');
          const cur=editing();
          const ok=cur?(CB.updateTask?await CB.updateTask({id:cur.id,title,subject:subj,priority:pr.toLowerCase(),dueDate}):false)
                      :(CB.addTask?await CB.addTask({title,subject:subj,priority:pr.toLowerCase(),dueDate}):false);
          s.disabled=false;
          if(ok){hap('success');if(cur)toast('Task updated');DZ.editTask=null;go('Tasks')}else toast(cur?'Could not save the changes. Try again.':'Could not add the task. Try again.');return}
        old(e)};
    };
    return p;
  };
  const addNotePage=()=>{
    const p=mk('Add note','note','Save what you learn, in your own words.','','Save note','note');
    p.html=()=>wrapD(`<div class="pg"><div class="qh"><button class="qback" type="button" data-back aria-label="Back">${DZ.BACK}</button><div class="qhi">${DZ.QI.note}</div></div><div class="qpt">Add note</div><div class="qps">Save what you learn, in your own words.</div>${DZ.lb('Title')}<input class="input dz-in" data-f="title" maxlength="120" placeholder="Note title" style="width:100%;border:0;outline:0;color:#1b1e25;font-weight:500">${DZ.lb('Subject')}<div class="chips" data-subj>${DZ.ch(SUBJR())}</div><div class="card" style="min-height:150px;margin-top:16px;font:600 15px/1.5 var(--body)"><textarea data-f="body" placeholder="Start typing…" style="width:100%;min-height:130px;border:0;outline:0;background:transparent;resize:none;font:600 15px/1.5 var(--body);color:inherit"></textarea></div></div><button class="btn2 qcta" type="button" data-save="note">Save note</button>`);
    const op=p.play;
    p.play=function(){op.call(this);const old=R.onclick;
      R.onclick=async e=>{
        if(e.target.closest('[data-back]')){hap('light');go('Quick add');return}
        const s=e.target.closest('[data-save]');
        if(s){const title=$('[data-f=title]',R).value.trim(),body=$('[data-f=body]',R).value.trim();if(!title&&!body){toast('Write something first');return}
          s.disabled=true;hap('press');const ok=CB.addNote?await CB.addNote({title:title||body.slice(0,40),subject:pick('[data-subj]')||SUBJR()[0],content:body}):false;s.disabled=false;
          if(ok){hap('success');toast('Note saved');go('Home')}else toast('Could not save the note. Try again.');return}
        old(e)};
    };
    p.t='Add note';return p;
  };
  ['Add note','Add task'].forEach(n=>{const ai=IDX(n);if(ai>=0)SCREENS.splice(ai,1)});
  SCREENS.push(addNotePage(),addTaskPage());
  /* pages the app does not support yet keep the design, with an honest message on their button */
  ['Planner','Add subject','Quiz','Progress','Achievement','Reminder','Upload file'].forEach(n=>{
    const s=SCREENS[IDX(n)];if(!s)return;const op=s.play;
    s.play=function(){op.call(this);const old=R.onclick;R.onclick=e=>{const sv=e.target.closest('[data-save]');if(sv){hap('light');toast('This is coming soon');return}old(e)}};
  });
}

/* ---- Focus timer + Study hub (real data) ---- */
{
const F={mode:'focus',len:25,round:1,total:1500,left:1500,running:false,end:0};
F.subj='';F.edit=false;F.plusEdit=false;F.sndEdit=false;
let tickId=0;
/* ---- Focus Plus: your own break lengths and rounds (kept on this phone) ----
   Without Focus Plus the timer always uses the original 5 min short break, 15 min long break and 4 rounds. */
const FP_KEY='studyos-focusplus',FP_DEF={sb:5,lb:15,rounds:4},FP_RANGE={sb:[1,30],lb:[5,60],rounds:[2,8]};
const FP=(()=>{const r=Object.assign({},FP_DEF);try{const o=JSON.parse(localStorage.getItem(FP_KEY)||'{}')||{};for(const k in FP_DEF){const v=Math.round(+o[k]);if(v>=FP_RANGE[k][0]&&v<=FP_RANGE[k][1])r[k]=v}}catch(_){}return r})();
const fpSave=()=>{try{localStorage.setItem(FP_KEY,JSON.stringify(FP))}catch(_){}};
// Which shop features this account owns. The list is saved on the phone each time the shop loads,
// so Soundscapes and Focus Plus still work when you open the app with no connection.
let ownSaved='';
const ownKey=()=>'studyos-owned:'+(D.email||D.handle||D.name||'');
const owns=k=>{
  try{
    if(D.shop&&Array.isArray(D.shop.owned)){
      const j=JSON.stringify(D.shop.owned);
      if(j!==ownSaved&&!D.guest){ownSaved=j;localStorage.setItem(ownKey(),j)}
      return D.shop.owned.indexOf(k)>=0;
    }
    if(D.guest)return false;
    const c=JSON.parse(localStorage.getItem(ownKey())||'[]');
    return Array.isArray(c)&&c.indexOf(k)>=0;
  }catch(_){return false}
};
DZ.owns=owns;
const plusOn=()=>owns('focusplus')&&!D.guest;
const shortMin=()=>plusOn()?FP.sb:5, longMin=()=>plusOn()?FP.lb:15, roundsN=()=>plusOn()?FP.rounds:4;
/* ---- Focus Soundscapes: rain, library or cafe sound while a focus round runs ---- */
const SND=createSoundscape();DZ.stopSound=()=>SND.stop(0.1);
const SND_KEY='studyos-soundscape',SND_VOL='studyos-soundscape-vol';
F.snd='';F.vol=0.6;
try{const k=localStorage.getItem(SND_KEY);if(SCENES.some(x=>x.k===k))F.snd=k;const v=parseFloat(localStorage.getItem(SND_VOL));if(v>=0.05&&v<=1)F.vol=v}catch(_){}
const soundOn=()=>owns('sound')&&!D.guest;
const sceneName=k=>{const x=SCENES.find(y=>y.k===k);return x?x.t:'Sound off'};
// Plays only while a focus round is running. Pause, Stop, a break or the end of the round silence it.
let LASTFOC=null;
function emitFocus(){const r=!!F.running;if(r===LASTFOC)return;LASTFOC=r;try{window.dispatchEvent(new CustomEvent('studyos-focus',{detail:{running:r}}))}catch(_){}}
function syncSound(){emitFocus();
  if(F.running&&F.mode==='focus'&&F.snd&&soundOn())SND.play(F.snd,F.vol,Math.max(0,(F.end-Date.now())/1000));
  else SND.stop(0.6);
}
const MODES={focus:'Focus',short:'Short break',long:'Long break'};
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const fmtM=m=>{m=Math.round(m||0);return m>=60?Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m':m+'m'};
const isIdle=()=>!F.running&&F.left===F.total;
const nextText=()=>F.mode==='focus'?(F.round>=roundsN()?longMin()+' min break next':shortMin()+' min break next'):'Back to focus next';
function setMode(m,mins){F.mode=m;F.total=mins*60;F.left=F.total;F.running=false}
function paintTimer(){const e=$('#fct',R);if(!e)return;e.textContent=fmtT(F.left);const c=$('.rp',R);if(c){const L=+c.dataset.c;c.style.strokeDashoffset=L*(1-Math.max(0,Math.min(1,F.left/F.total)))}}
function onFocusScreen(){return SCREENS[CUR]&&SCREENS[CUR].t==='Focus'}
function tick(){
  if(!F.running)return;
  F.left=Math.max(0,(F.end-Date.now())/1000);
  if(F.left<=0){finish();return}
  if(onFocusScreen())paintTimer();
}
function start(){if(F.running)return;F.running=true;F.end=Date.now()+F.left*1000;clearInterval(tickId);tickId=setInterval(tick,250);
  if(CB.timerAlert){const foc=F.mode==='focus';CB.timerAlert({at:F.end,title:tr(foc?'Focus round complete':'Break over'),body:tr(foc?'Great work! Take a '+(F.round>=roundsN()?longMin():shortMin())+' minute break.':'Ready for your next focus round?')})}
  syncSound()}
function pause(){F.left=Math.max(0,(F.end-Date.now())/1000);F.running=false;clearInterval(tickId);if(CB.timerCancel)CB.timerCancel();syncSound()}
function stop(){clearInterval(tickId);F.running=false;setMode('focus',F.len);if(CB.timerCancel)CB.timerCancel();syncSound()}
function finish(){
  clearInterval(tickId);F.running=false;if(CB.timerCancel)CB.timerCancel();emitFocus();
  const was=F.mode;
  hap('success');
  if(was==='focus'){
    if(CB.saveSession)CB.saveSession({minutes:F.len,subject:F.subj});
    if(F.round>=roundsN())setMode('long',longMin());else setMode('short',shortMin());
  }else{
    if(was==='long')F.round=1;else F.round++;
    setMode('focus',F.len);
  }
  syncSound();
  if(onFocusScreen()){go('Focus',true);toast(was==='focus'?'Session complete! Take a break.':'Break over. Ready to focus?')}
}
/* ---- the two shop features on the Focus page: a sound chip, a Breaks chip and the Focus Plus panel ---- */
const fxSvg=d=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const FXI={sound:fxSvg('<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'),plus:fxSvg('<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/>'),check:fxSvg('<path d="M5 12.5l4.500 4.500L19 7.500"/>'),lock:fxSvg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>')};
// Round icon buttons at the two top corners: Focus Plus (left, only before a round starts) and Soundscapes (right).
function fxBtn(which,show){
  if(!show||F.mode!=='focus')return '';
  const sound=which==='sound',owned=sound?soundOn():plusOn();
  const on=owned&&(sound?!!F.snd:F.plusEdit||F.sndEdit);
  const label=sound?(owned?'Focus Soundscapes: '+sceneName(F.snd):'Focus Soundscapes (locked)'):(owned?'Focus Plus: breaks '+shortMin()+' and '+longMin()+' minutes':'Focus Plus (locked)');
  return `<span class="fx-btn${on?' on':''}" data-${sound?'fsound':'fplus'} role="button" aria-label="${esc(label)}" style="${sound?'right':'left'}:8px">${sound?FXI.sound:FXI.plus}${owned?'':'<i class="fx-lk">'+FXI.lock+'</i>'}</span>`;
}
const fxStep=(k,label,unit)=>{const r=FP_RANGE[k];return `<div class="fx-st"><span>${label}</span><div><button type="button" data-fpstep="${k}:-1" aria-label="Less ${label}"${FP[k]<=r[0]?' disabled':''}>−</button><b>${FP[k]} ${unit}</b><button type="button" data-fpstep="${k}:1" aria-label="More ${label}"${FP[k]>=r[1]?' disabled':''}>+</button></div></div>`};
// Soundscapes and Focus Plus settings open as a sheet over the page, so nothing on the timer is covered by mistake.
function fxSheet(){
  if(F.sndEdit&&soundOn()){
    const opts=[{k:'',t:'Sound off'}].concat(SCENES);
    return `<div class="fx-sheet" data-fpclose role="dialog" aria-label="Focus Soundscapes"><div class="fx-panel"><div class="fx-hd"><b>Focus Soundscapes</b><span><button type="button" class="fx-done" data-fpclose>Done</button></span></div>${opts.map(o=>`<button type="button" class="fx-opt${F.snd===o.k?' on':''}" data-fsel="${o.k}" aria-pressed="${F.snd===o.k}"><span>${o.t}</span>${F.snd===o.k?'<i>'+FXI.check+'</i>':''}</button>`).join('')}<div class="fx-vol${F.snd?'':' off'}"><span>${FXI.sound}</span><input type="range" data-fvol min="5" max="100" step="5" value="${Math.round(F.vol*100)}" aria-label="Sound volume"${F.snd?'':' disabled'}></div><p class="fx-note">Plays while a focus round is running.</p></div></div>`;
  }
  if(!(plusOn()&&isIdle()&&F.mode==='focus'&&F.plusEdit))return '';
  return `<div class="fx-sheet" data-fpclose role="dialog" aria-label="Focus Plus settings"><div class="fx-panel"><div class="fx-hd"><b>Focus Plus</b><span><button type="button" class="fx-link" data-fpreset>Reset</button><button type="button" class="fx-done" data-fpclose>Done</button></span></div>${fxStep('sb','Short break','min')}${fxStep('lb','Long break','min')}${fxStep('rounds','Long break after','rounds')}</div></div>`;
}
// A locked chip takes you to the shop (never while a round is running).
function fxLocked(name){
  if(D.guest){hap('light');toast('Create your profile to use the shop.');return}
  if(F.running){hap('light');toast(name+' is in the Gem Shop.');return}
  DZ.openShop('Focus');toast('Unlock '+name+' under Focus and study.');
}
const focusHtml=()=>{if(DZ.preFocusSubj&&!F.running){F.subj=DZ.preFocusSubj;DZ.preFocusSubj=''}return focusHtml0()};
const focusHtml0=()=>{
  const run=F.running,idleFocus=isIdle()&&F.mode==='focus',pct=F.left/F.total;
  return wrap(`<div class="pg" style="padding-bottom:0"><div style="position:relative;height:40px">${run?`<span data-fstop style="position:absolute;left:8px;top:6px;color:#c9c9cc">${ICO.x}</span>`:fxBtn('plus',idleFocus)}${fxBtn('sound',true)}<span class="tag" data-fsubj style="position:absolute;left:50%;transform:translateX(-50%);top:2px;padding:9px 18px;border-radius:16px;font-size:14px;font-weight:700;white-space:nowrap;max-width:calc(100% - 128px);overflow:hidden;text-overflow:ellipsis">${esc(F.subj||'No subject')}</span></div>
<div style="text-align:center;font:700 13px var(--body);letter-spacing:.1em;color:#bfc4c9;margin-top:22px">${MODES[F.mode].toUpperCase()}</div>
<div class="ring2" style="margin:20px auto 0;width:250px;height:250px">${ring(250,24,pct,D.dark?'#c9b8c3':'var(--mv)',D.dark?'#2d3740':'var(--chip)')}<div class="c" style="font-size:62px" id="fct">${fmtT(F.left)}</div></div>
<div style="text-align:center;font:700 15px var(--body);color:#cfd2d6;margin-top:30px">Round ${F.round} of ${roundsN()} · ${nextText()}</div>
${idleFocus?(F.edit?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:20px"><input data-fin type="number" inputmode="numeric" min="1" max="180" value="${F.len}" aria-label="Minutes" style="width:96px;height:44px;border-radius:18px;border:2px solid var(--mv);background:#161b21;color:#ebe8ea;font:700 20px var(--body);text-align:center;outline:0"><span style="font:700 15px var(--body);color:#cfd2d6">min</span><span class="chip" data-fset style="border-radius:18px;height:44px;padding:0 18px;font-size:15px;background:var(--mv);color:#1b1e25">Set</span></div><div style="text-align:center;font:600 12.5px var(--body);color:#9aa3ab;margin-top:8px">Choose 1 to 180 minutes</div>`:`<div style="display:flex;justify-content:center;gap:8px;margin-top:20px;flex-wrap:wrap">${[15,25,45,60].map(m=>`<span class="chip" data-flen="${m}" style="border-radius:18px;height:40px;gap:8px;padding:0 14px;font-size:14px;color:#ebe8ea${F.len===m?';background:var(--mv);color:#1b1e25':''}">${m} min</span>`).join('')}<span class="chip" data-fcustom style="border-radius:18px;height:40px;gap:8px;padding:0 14px;font-size:14px;color:#ebe8ea${[15,25,45,60].includes(F.len)?'':';background:var(--mv);color:#1b1e25'}">${[15,25,45,60].includes(F.len)?'Custom':F.len+' min'}</span></div>`):''}</div>
<div class="fbtns" style="position:absolute;left:22px;right:22px;bottom:${run?22:104}px;display:flex;gap:10px">${isIdle()?'':`<div class="btn2 dk2" data-fstop style="flex:0 0 104px;height:54px;border-radius:26px">Stop</div>`}<div class="btn2 mv" data-fgo style="flex:1;height:54px;border-radius:26px">${run?'Pause':(isIdle()?'Start':'Resume')}</div></div>${run?'':nav('focus')}${fxSheet()}`,true);
};
const focusPlay=()=>{
  enter();
  R.oninput=e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-fvol]')){F.vol=Math.max(0.05,Math.min(1,(+t.value)/100));SND.setVolume(F.vol);try{localStorage.setItem(SND_VOL,String(F.vol))}catch(_){}}};
  R.onclick=e=>{
    if(e.target.closest('[data-fsound]')){
      if(!soundOn()){fxLocked('Focus Soundscapes');return}
      F.sndEdit=true;F.plusEdit=false;hap('light');go('Focus',true);return}
    const so=e.target.closest('[data-fsel]');
    if(so){
      if(!soundOn())return;
      F.snd=so.dataset.fsel;
      try{localStorage.setItem(SND_KEY,F.snd)}catch(_){}
      hap('tick');syncSound();go('Focus',true);return}
    if(e.target.closest('[data-fplus]')){
      if(!plusOn()){fxLocked('Focus Plus');return}
      F.plusEdit=!F.plusEdit;F.sndEdit=false;F.edit=false;hap('light');go('Focus',true);return}
    if(e.target.closest('[data-fpreset]')){Object.assign(FP,FP_DEF);fpSave();if(F.round>FP.rounds)F.round=FP.rounds;hap('tick');go('Focus',true);return}
    if(e.target.closest('button[data-fpclose]')||e.target.classList.contains('fx-sheet')){F.plusEdit=false;F.sndEdit=false;hap('light');go('Focus',true);return}
    const fs=e.target.closest('[data-fpstep]');
    if(fs){
      if(plusOn()&&isIdle()&&F.mode==='focus'){
        const [k,d]=fs.dataset.fpstep.split(':'),r=FP_RANGE[k];
        if(r){const v=Math.max(r[0],Math.min(r[1],FP[k]+(+d)));if(v!==FP[k]){FP[k]=v;fpSave();if(k==='rounds'&&F.round>v)F.round=v;hap('tick')}}
        go('Focus',true)}
      return}
    if(e.target.closest('[data-fgo]')){hap('press');if(F.running)pause();else start();go('Focus',true);return}
    if(e.target.closest('[data-fstop]')){hap('light');stop();go('Focus',true);return}
    if(e.target.closest('[data-fcustom]')&&isIdle()&&F.mode==='focus'){hap('light');F.edit=true;F.plusEdit=false;go('Focus',true);const i=$('[data-fin]',R);if(i){i.focus();i.select()}return}
    if(e.target.closest('[data-fset]')){const i=$('[data-fin]',R),v=Math.round(+(i&&i.value));if(!(v>=1&&v<=180)){hap('error');toast('Enter 1 to 180 minutes');return}F.edit=false;F.len=v;setMode('focus',v);hap('success');go('Focus',true);return}
    const ln=e.target.closest('[data-flen]');
    if(ln&&isIdle()&&F.mode==='focus'){F.edit=false;F.len=+ln.dataset.flen;setMode('focus',F.len);hap('tick');go('Focus',true);return}
    if(e.target.closest('[data-fsubj]')&&!F.running){const l=['',...(D.subjects||[])];F.subj=l[(l.indexOf(F.subj)+1)%l.length];hap('tick');go('Focus',true);return}
  };
};
SCREENS.push({t:'Focus',d:'Real focus timer',spec:{m:'',h:'',s:NS},html:focusHtml,play:focusPlay});

/* badges from real numbers */
const BSVG=import.meta.glob('./badges/*.svg',{query:'?raw',import:'default',eager:true});
const badgeArt=k=>BSVG['./badges/'+k+'.svg']||'';
const LOCKI='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
// Badge Showcase (shop item "badges"): up to three unlocked badges pinned to the profile. Stored as a comma list in prefs.showcase.
const pinList=()=>String(D.showcase||'').split(',').filter(Boolean).slice(0,3);
const showcaseOn=()=>!!(DZ.owns&&DZ.owns('badges'))&&!D.guest;
const pinnedBadges=()=>{const L=DZ.badgeList?DZ.badgeList():[];return pinList().map(k=>L.find(b=>b[2]===k)).filter(b=>b&&b[1])};
const showcaseHtml=()=>{if(!showcaseOn())return '';const p=pinnedBadges();return `<div class="sec">Showcase</div><div class="pshow">${p.length?p.map(b=>`<div class="pbd"><div class="bimg">${badgeArt(b[2])}</div><span>${esc(b[0])}</span></div>`).join(''):'<div class="pempty">Pin your favourite badges from the Badges page</div>'}</div>`};
DZ.showcaseHtml=showcaseHtml;
const bdg2=(b,showProg)=>`<div class="badge${b[1]?'':' lk'}"><div class="bimg">${badgeArt(b[2])}${b[1]?'':`<i class="lkc">${LOCKI}</i>`}</div><span>${b[0]}</span>${!b[1]&&showProg?`<small class="bprog">${Math.min(b[3],b[4])>=1?Math.floor(Math.min(b[3],b[4])):0} / ${b[4]}</small>`:''}</div>`;
/* When each badge was first earned (kept on this phone). Badges already earned when the app first sees them get an older estimated date, so only new ones show NEW. */
const BAT_BOOT=Date.now();let BAT=null,BATK='';
const batGet=()=>{const k='studyos.badgeAt.v1:'+(D.email||'me');if(BAT&&BATK===k)return BAT;BATK=k;try{BAT=JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){BAT={}}return BAT};
const batNote=list=>{const m=batGet();let ch=0;const boot=Date.now()-BAT_BOOT<25000;
  list.forEach((b,i)=>{if(!b[1]||m[b[2]])return;m[b[2]]=boot?{t:Date.now()-30*864e5+i*6e4,e:1}:{t:Date.now()};ch=1});
  if(ch)try{localStorage.setItem(BATK,JSON.stringify(m))}catch(_){}};
const recentBadges=n=>{const m=batGet();return badgeList().filter(b=>b[1]).sort((x,y)=>((m[y[2]]||{}).t||0)-((m[x[2]]||{}).t||0)).slice(0,n)};
const badgeIsNew=k=>{const m=(batGet()||{})[k];return !!m&&!m.e&&Date.now()-m.t<3*864e5};
const badgeList=()=>{
  const t=D.tasksDone||0,s=Math.max(D.streak||0,D.bestStreak||0),h=D.hours||0,n=D.notesCount||0,ss=D.sessionsCount||0;
  const L=(label,key,cur,need)=>[label,cur>=need,key,cur,need];
  const out=[
    L('First task','first-task',t,1),L('10 tasks','10-tasks',t,10),L('50 tasks','50-tasks',t,50),L('100 tasks','100-tasks',t,100),
    L('3 day streak','3-day-streak',s,3),L('7 day streak','7-day-streak',s,7),L('14 day streak','14-day-streak',s,14),L('30 day streak','30-day-streak',s,30),L('100 day streak','100-day-streak',s,100),
    L('First session','first-session',ss,1),L('10 sessions','10-sessions',ss,10),
    L('5 hours','5-hours',h,5),L('20 hours','20-hours',h,20),L('50 hours','50-hours',h,50),
    L('First note','first-note',n,1),L('10 notes','10-notes',n,10)
  ];
  batNote(out);
  return out;
};
DZ.badgeList=badgeList;DZ.recentBadges=recentBadges;DZ.badgeIsNew=badgeIsNew;
DZ.bdg2=bdg2;DZ.badgeArt=badgeArt;DZ.LOCKI=LOCKI;DZ.pinList=pinList;
const badgesHtml=()=>{
  const xp=Math.round((D.hours||0)*60+(D.tasksDone||0)*10),lv=1+Math.floor(xp/1000),cur=xp%1000;
  const list=badgeList(),on=list.filter(b=>b[1]),off=list.filter(b=>!b[1]);
  const own=showcaseOn(),pins=pinList();
  const one=b=>{const h=bdg2(b,true);if(!own||!b[1])return h;return h.replace('<div class="badge','<div data-pin="'+b[2]+'" class="badge pinnable'+(pins.indexOf(b[2])>=0?' pinned':''))};
  const pinBox=own?`<div class="pinhint">Tap an unlocked badge to pin it to your profile <b>${pins.length}/3</b></div>`:`<div class="card pinlock" data-prolock><div><b>Badge Showcase</b><small>Pin your 3 favourite badges to your profile</small></div><span>Unlock</span></div>`;
  return wrapD(`<div class="pg pgs" style="padding-top:38px">${head('Badges',ICO.back)}
<div class="card dkc" style="border-radius:26px;padding:16px 18px"><div class="rw" style="align-items:baseline"><b style="font:700 34px var(--display);color:#c9b8c3">Level ${lv}</b><span style="font:700 14px var(--body);color:#cfd2d6">${cur} / 1000 XP</span></div><div class="bar2" style="background:#3c4450;margin:10px 0 8px;height:10px;border-radius:5px"><i style="width:${cur/10}%;background:#c9b8c3;border-radius:5px"></i></div><div style="font:600 13px var(--body);color:#cfd2d6">${1000-cur} XP to Level ${lv+1}</div></div>
${pinBox}<div class="rw" style="margin-top:16px"><b style="font:700 22px var(--display)">Unlocked</b><span class="mut" style="font:700 13px var(--body)">${on.length} of ${list.length}</span></div>
${on.length?`<div style="display:grid;grid-template-columns:repeat(3,1fr);margin-top:14px;row-gap:12px">${on.map(one).join('')}</div>`:`<div class="mut" style="font:600 14px var(--body);margin-top:12px">Finish tasks and keep your streak to unlock badges.</div>`}
<div style="font:700 22px var(--display);margin-top:16px">Locked</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px;row-gap:12px">${off.map(one).join('')}</div></div>`);
};
/* ---- Weekly Report Plus (shop item 'report'): best study hour, subject breakdown, month by month ---- */
const hourName=h=>(h%12||12)+(h<12?' AM':' PM');
const hrsTxt=m=>m>=60?(Math.round(m/6)/10)+'h':m+'m';
const weekPlusBlock=()=>{
  const head2=`<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Weekly Report Plus</b><span class="pl-tag">PLUS</span></div>`;
  if(!hasPro('report'))return proLock('report','Weekly Report Plus','Your best study hour, subject breakdown and month-by-month trends.');
  const p=D.weekPlus||{},hrs=Array.isArray(p.hours)&&p.hours.length===24?p.hours:new Array(24).fill(0);
  const hm=Math.max(1,...hrs),okHour=(p.sessions||0)>=3&&p.bestHour>=0;
  const hourCard=`<div class="card"><div class="pl-h">Best study hour</div>${okHour?`<div class="pl-big">${hourName(p.bestHour)} – ${hourName((p.bestHour+1)%24)}</div><div class="pl-hours" aria-hidden="true">${hrs.map((m,h)=>`<i${h===p.bestHour?' class="on"':''} style="height:${Math.max(5,Math.round(m/hm*100))}%"></i>`).join('')}</div><div class="pl-ax"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span></div><div class="mut pl-note">Based on your last ${p.sessions} focus sessions.</div>`:`<div class="mut pl-note" style="margin-top:6px">Finish 3 focus sessions and your best study hour shows up here.</div>`}</div>`;
  const sb=Array.isArray(p.subjects)?p.subjects:[];
  const subCard=`<div class="card"><div class="pl-h">Subjects this week</div>${sb.length?`<div style="display:grid;gap:10px;margin-top:10px">${sb.map(x=>`<div><div class="rw" style="font:700 13px var(--body);margin-bottom:5px"><span>${esc(x.name)}</span><span class="mut">${fmtM(x.minutes)} · ${x.pct}%</span></div><div class="bar2"><i style="width:${x.pct}%"></i></div></div>`).join('')}</div>`:`<div class="mut pl-note" style="margin-top:6px">No focus sessions this week yet.</div>`}</div>`;
  const mo=Array.isArray(p.months)?p.months:[],mm=Math.max(1,...mo.map(x=>x.minutes));
  const best=mo.reduce((b,x)=>x.minutes>(b?b.minutes:0)?x:b,null);
  const moCard=`<div class="card"><div class="pl-h">Month by month</div>${mo.length>=2?`<div class="pl-months">${mo.map(x=>`<div><span class="pl-mv">${hrsTxt(x.minutes)}</span><i${x.current?' class="on"':''} style="height:${Math.max(4,Math.round(x.minutes/mm*70))}px"></i><span class="pl-ml">${esc(x.label)}</span></div>`).join('')}</div><div class="mut pl-note">${best&&best.minutes>0?'Best month: '+esc(best.label)+' · '+fmtM(best.minutes)+'. ':''}This month is still in progress.</div>`:`<div class="mut pl-note" style="margin-top:6px">Your monthly trend appears once you have studied in two different months.</div>`}</div>`;
  return head2+hourCard+subCard+moCard;
};
const weekHtml=()=>{
  const w=D.week||{minutes:0,bars:[0,0,0,0,0,0,0],labels:['M','T','W','T','F','S','S'],range:'',change:null,sessions:0,best:'',tasks:0};
  const mx=Math.max(1,...w.bars),ch=w.change;
  const chText=ch===null||ch===undefined?(w.minutes>0?'Great start this week':'No study time yet'):ch>0?ch+'% more than last week':ch<0?Math.abs(ch)+'% less than last week':'Same as last week';
  const streak=D.streak||0;
  return wrapD(`<div class="pg pgs" style="padding-top:38px">${head('Weekly report',ICO.x,ICO.share)}
<div class="card dkc" style="border-radius:26px;padding:16px 16px 12px"><div style="font:700 12px var(--body);letter-spacing:.08em;color:#bfc4c9">${esc((w.range||'').toUpperCase())}</div><div style="font:700 44px/1.1 var(--display);color:#c9b8c3;margin-top:4px">${fmtM(w.minutes)}</div><div style="font:700 14px var(--body);color:#cfd2d6;margin-top:4px">${chText}</div>
<div class="bars" style="display:flex;align-items:flex-end;gap:8px;height:96px;margin-top:14px">${w.bars.map((m,i)=>`<i style="flex:1;height:${Math.max(6,Math.round(m/mx*96))}px;border-radius:9px;background:${i===6?'#ede9ea':'#c9b8c3'}"></i>`).join('')}</div>
<div style="display:flex;gap:8px;margin-top:8px">${w.labels.map(l=>`<span style="flex:1;text-align:center;font:700 12px var(--body);color:#bfc4c9">${l}</span>`).join('')}</div></div>
<div class="sw2"><div class="card"><b>${w.sessions||0}</b><small>Sessions</small></div><div class="card"><b style="font-size:19px;line-height:1.35">${esc(w.best||'—')}</b><small>Best subject</small></div><div class="card"><b>${streak} ${streak===1?'day':'days'}</b><small>Streak</small></div><div class="card"><b>${w.tasks||0}</b><small>Tasks done</small></div></div>
${(()=>{const bs=Math.max(streak,D.bestStreak||0),nx=[3,7,14,30,100].find(n=>n>bs);const k=nx?nx+'-day-streak':'100-day-streak';return `<div class="card rw" style="justify-content:flex-start;gap:14px;border-radius:24px"><div class="badge${nx?' lk':''}" style="flex:none"><div class="bimg" style="width:44px;height:52px">${badgeArt(k)}</div></div><div><div style="font:700 16px var(--body)">${nx?'Next badge: '+nx+' day streak':'All streak badges unlocked'}</div><div class="mut" style="font:600 13px var(--body)">${nx?'Study '+nx+' days in a row to earn it':'Amazing consistency'}</div></div></div>`})()}
${weekPlusBlock()}
<div class="btn2" data-share style="margin-top:12px;border-radius:24px">Share my week</div></div>`);
};
/* ---- Exam Mode Pro (shop item 'exam'): every exam with a countdown and a daily study target ---- */
const examPlusBlock=()=>{
  if(!hasPro('exam'))return proLock('exam','Exam Mode Pro','A countdown on Home and a daily study target for each exam.');
  const L=D.exams||[];
  const head2=`<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Daily targets</b><span class="pl-tag">PRO</span></div>`;
  if(!L.length)return head2+`<div class="card" style="border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:16px">Add an exam date in Notes and subjects to get a daily target.</div>`;
  return head2+L.map(x=>{
    const done=Math.min(x.today,x.target),pct=Math.round(done/x.target*100);
    return `<div class="card"><div class="rw"><b style="font:700 16px var(--body)">${esc(x.subject)}</b><span class="pl-chip">${dayWord(x.days)}</span></div><div class="mut pl-note">${esc(x.dateLabel)} · ${x.openTasks} open ${x.openTasks===1?'task':'tasks'}${x.openMin?' · '+x.openMin+' min of work':''}</div><div class="rw" style="margin-top:10px"><span style="font:700 13px var(--body)">Study today</span><b style="font:700 15px var(--display)">${x.target} min</b></div><div class="bar2" style="margin-top:6px"><i style="width:${pct}%"></i></div><div class="mut pl-note">${x.today>=x.target?'Target reached for today.':done+' of '+x.target+' min studied today.'}</div></div>`;
  }).join('')+`<div class="mut" style="font:600 13px var(--body);margin-top:10px">The target spreads the minutes of your open tasks for the subject over the days left, with at least 20 minutes a day.</div>`;
};
const examHtml=()=>{
  const ex=D.exam,rd=ex?ex.ready:0;
  const plan=(D.tasks||[]).filter(t=>!t.done&&(t.when==='today'||t.when==='overdue')).slice(0,3);
  const sp=(D.subjectProgress||[]).slice(0,3);
  return wrapD(`<div class="pg" style="padding-top:38px">${head('Exam mode',ICO.back)}
<div class="card dkc rw" style="justify-content:flex-start;gap:14px;border-radius:26px;height:114px"><div class="ring2">${ring(74,8,rd/100,'#c9b8c3','#3c4450')}<div class="c" style="font-size:17px">${rd}%</div></div><div><div style="font:700 ${ex?34:26}px/1 var(--display);color:#c9b8c3">${ex?(ex.days===0?'Today':ex.days+(ex.days===1?' day':' days')):'No exam set'}</div><div style="font:700 15px var(--body);color:#ebe8ea;margin-top:6px">${ex?esc(ex.subject)+(ex.dateLabel?' · '+esc(ex.dateLabel):''):'Add a date in Notes and subjects'}</div><div style="font:600 13px var(--body);color:#cfd2d6">${ex?'Readiness '+rd+'%':''}</div></div></div>
${examPlusBlock()}
<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Today's plan</b><span class="mut" style="font:700 13px var(--body)">${plan.length} ${plan.length===1?'task':'tasks'}</span></div>
${plan.length?plan.map(t=>`<div class="trow" style="height:46px;margin-top:10px"><div class="cb"></div><div class="tt">${esc(t.title)}</div></div>`).join(''):`<div class="card" style="margin-top:10px;border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:16px">${mascotHtml('think','inline','','display:block;margin:0 auto 6px')}Nothing planned for today.</div>`}
<b style="display:block;font:700 20px var(--display);margin-top:18px">Subjects</b>
${sp.length?`<div class="card" style="border-radius:22px;display:grid;gap:10px">${sp.map(s=>`<div><div class="rw" style="font:700 13px var(--body);margin-bottom:5px"><span>${esc(s.name)}</span><span class="mut">${s.pct}%</span></div><div class="bar2"><i style="width:${s.pct}%"></i></div></div>`).join('')}</div>`:`<div class="card" style="border-radius:22px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:16px">Add tasks with a subject to see progress.</div>`}
<div class="mut" style="font:600 13px var(--body);margin-top:10px">Readiness is the share of finished tasks for the exam subject.</div>
<div class="btn2" data-fstart style="margin-top:12px;border-radius:24px">Start a focus session</div></div>`);
};
const studyHtml=()=>{
  const w=D.week||{minutes:0},ex=D.exam,nb=badgeList().filter(b=>b[1]).length;
  const row=(attr,t,m)=>`<div class="trow" ${attr} style="height:auto;min-height:62px;margin-top:8px;cursor:pointer"><div style="flex:1"><div class="tt" data-tr>${t}</div><div class="meta"><span class="mt">${m}</span></div></div><span style="color:var(--mut);font:700 20px var(--body)">›</span></div>`;
  return wrapD(`<div class="pg">${tb()}<div class="ttl" style="margin-top:12px">Study</div><div class="sub2">Reports, exams and your study tools.</div>
<div style="margin-top:8px">${row('data-sgo="Weekly report"','Weekly report',fmtM(w.minutes)+' studied this week')}
${row('data-sgo="Exam mode"','Exam mode',ex?esc(ex.subject)+' · '+(ex.days===0?'today':ex.days+(ex.days===1?' day':' days'))+' · '+ex.ready+'% ready':'No exam set')}
${row('data-sgo="Badges"','Badges',nb+' of '+badgeList().length+' unlocked')}
${row('data-open="flashcards"','Flashcards','Review and create cards')}
${row('data-open="subjects"','Notes and subjects',(D.subjectCount||0)+' '+((D.subjectCount||0)===1?'subject':'subjects'))}
${row('data-open="grades"','Grades','Track your marks')}</div>
</div>${nav('study')}`);
};
const backTo=(e)=>{if(e.target.closest('.hd span:first-child')&&e.target.closest('.hd span:first-child').innerHTML.trim()){hap('light');const to=(SCREENS[CUR]&&SCREENS[CUR].t==='Badges'&&DZ.badgesFrom==='Profile')?'Profile':'Study';DZ.badgesFrom=null;go(to);return true}return false};
SCREENS.push({t:'Study',d:'Study hub',spec:{m:'',h:'',s:NS},html:studyHtml,play:()=>{enter();R.onclick=e=>{
  const g=e.target.closest('[data-sgo]');if(g){hap('light');DZ.badgesFrom=null;go(g.dataset.sgo);return}
  const o=e.target.closest('[data-open]');if(o){hap('light');if(CB.open)CB.open(o.dataset.open);return}
}}});
const wire=(name,html,extra)=>{const k=IDX(name);if(k>=0)SCREENS.splice(k,1);SCREENS.push({t:name,d:name,spec:{m:'',h:'',s:NS},html,play:()=>{enter();R.onclick=e=>{
  if(backTo(e))return;
  const pn=e.target.closest('[data-pin]');
  if(pn&&name==='Badges'){hap('light');const k=pn.dataset.pin,a=pinList(),i=a.indexOf(k);if(i>=0)a.splice(i,1);else{if(a.length>=3){toast('Showcase is full. Tap a pinned badge to remove it.');return}a.push(k)}
    D.showcase=a.join(',');if(CB.savePref)CB.savePref('showcase',D.showcase);const sp=$('.pgs',R),y=sp?sp.scrollTop:0;go('Badges',true);const n2=$('.pgs',R);if(n2)n2.scrollTop=y;return}
  if(e.target.closest('[data-prolock]')){hap('light');if(D.guest){toast('Create your profile to use the shop.');return}DZ.openShop(SCREENS[CUR].t);return}
  if(e.target.closest('[data-share]')||(name==='Weekly report'&&e.target.closest('.hd span:last-child'))){hap('light');if(CB.share){const w=D.week||{};CB.share('I studied '+fmtM(w.minutes)+' this week on StudyOS with a '+(D.streak||0)+' day streak!')}return}
  if(e.target.closest('[data-fstart]')){hap('press');go('Focus');return}
}}})};
wire('Weekly report',weekHtml);wire('Badges',badgesHtml);wire('Exam mode',examHtml);
}

/* ---- Real Search, Planner, Add subject, Quiz, Progress, Achievement, Reminder, Upload ---- */
{
const SUBJ2=()=>(D.subjects&&D.subjects.length?D.subjects:['Biology','Maths','Physics','Chemistry']);
const pickOn=(sel)=>{const el=$(sel+' .on',R);return el?en0(el).trim():''};
const fld=(attr,ph,ml=120)=>`<input class="input dz-in" ${attr} maxlength="${ml}" placeholder="${ph}" style="width:100%;border:0;outline:0;color:#1b1e25;font-weight:500">`;
const qhead=(icon,title,sub)=>`<div class="qh"><button class="qback" type="button" data-back aria-label="Back">${DZ.BACK}</button><div class="qhi">${DZ.QI[icon]}</div></div><div class="qpt">${title}</div><div class="qps">${sub}</div>`;
const replace=(name,obj)=>{const k=IDX(name);if(k>=0)SCREENS.splice(k,1);SCREENS.push(Object.assign({t:name,d:name,g:'Quick add pages',spec:{m:'',h:'',s:NS}},obj))};
const toQuick=()=>go('Quick add');
const busy=async(btn,fn)=>{btn.disabled=true;hap('press');let ok=false;try{ok=await fn()}catch(_){}btn.disabled=false;return ok};

/* Planner -> /api/planner */
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
replace('Planner',{
  html:()=>{const today=(new Date().getDay()+6)%7;
    return wrapD(`<div class="pg">${qhead('plan','Planner','Place a study block on your week.')}${DZ.lb('Day')}<div class="chips" data-day style="flex-wrap:wrap">${DAYS.map((d,i)=>`<span class="chip${i===today?' on':''}" data-chip>${d.slice(0,3)}</span>`).join('')}</div>${DZ.lb('What will you study?')}${fld('data-f="title"','e.g. Chapter 5 problem set')}${DZ.lb('Subject')}<div class="chips" data-subj>${DZ.ch(SUBJ2())}</div></div><button class="btn2 qcta" type="button" data-save="plan">Add to planner</button>`)},
  play(){S.mute=false;enter();R.onclick=async e=>{
    if(e.target.closest('[data-back]')){hap('light');toQuick();return}
    const c=e.target.closest('[data-chip]');if(c){$$('[data-chip]',c.parentNode).forEach(x=>x.classList.remove('on'));c.classList.add('on');hap('light');return}
    const s=e.target.closest('[data-save]');if(!s)return;
    const title=$('[data-f=title]',R).value.trim();if(!title){toast('Write what you will study');return}
    const dayShort=pickOn('[data-day]'),day=DAYS.find(d=>d.startsWith(dayShort))||'Monday';
    const ok=await busy(s,()=>CB.addPlan?CB.addPlan({title,subject:pickOn('[data-subj]')||SUBJ2()[0],day}):false);
    if(ok){hap('success');toast('Added to your planner');toQuick()}else toast('Could not save. Try again.')}}
});

/* Add subject -> account preferences */
const SCOL=['#c7b9c4','#5a707a','#6a58d0','#3d9d5f','#f2a62c','#e0674f'];
replace('Add subject',{
  html:()=>wrapD(`<div class="pg">${qhead('subject','Add subject','Every subject gets its own colour.')}${DZ.lb('Name')}${fld('data-f="name"','e.g. Biology',60)}${DZ.lb('Colour')}<div class="qdots" data-col>${SCOL.map((c,i)=>`<i data-chip class="${i===2?'on':''}" data-c="${c}" style="background:${c}"></i>`).join('')}</div></div><button class="btn2 qcta" type="button" data-save="subject">Add subject</button>`),
  play(){S.mute=false;enter();R.onclick=async e=>{
    if(e.target.closest('[data-back]')){hap('light');toQuick();return}
    const c=e.target.closest('[data-chip]');if(c){$$('[data-chip]',c.parentNode).forEach(x=>x.classList.remove('on'));c.classList.add('on');hap('light');return}
    const s=e.target.closest('[data-save]');if(!s)return;
    const name=$('[data-f=name]',R).value.trim();if(!name){toast('Give the subject a name');return}
    if((D.subjects||[]).some(x=>x.toLowerCase()===name.toLowerCase())){toast('You already have that subject');return}
    const col=($('[data-col] .on',R)||{}).dataset;
    const ok=await busy(s,()=>CB.addSubject?CB.addSubject({name,color:col&&col.c||''}):false);
    if(ok){hap('success');toast('Subject added');toQuick()}else toast('Could not save. Try again.')}}
});

/* Quiz -> your flashcards */
replace('Quiz',{
  html:()=>wrapD(`<div class="pg">${qhead('quiz','Quiz','Test yourself with your flashcards.')}<div class="card" style="margin-top:16px;border-radius:22px;font:600 15px/1.5 var(--body)">Your flashcards come back at growing intervals, so what you answer correctly is shown less often. Cards you miss return sooner.</div></div><button class="btn2 qcta" type="button" data-save="quiz">Open flashcards</button>`),
  play(){S.mute=false;enter();R.onclick=e=>{
    if(e.target.closest('[data-back]')){hap('light');toQuick();return}
    if(e.target.closest('[data-save]')){hap('press');if(CB.open)CB.open('flashcards')}}}
});

/* Progress + Achievement = the real report and badges, back goes to Quick add */
const reuse=(name,fromName)=>{const src=SCREENS[IDX(fromName)];if(!src)return;replace(name,{html:src.html,play(){src.play.call(this);const old=R.onclick;R.onclick=e=>{if(e.target.closest('.hd span:first-child')){hap('light');toQuick();return}old(e)}}})};
reuse('Progress','Weekly report');reuse('Achievement','Badges');

/* Reminder = everything saved, in one place (real notes + tasks) */
let RF='All';
replace('Reminder',{
  html:()=>{
    const notes=(D.notes||[]).map(n=>({k:'Note',t:n.title,s:n.subject}));
    const tasks=(D.tasks||[]).map(n=>({k:'Task',t:n.title,s:n.subject,done:n.done}));
    const plans=(D.plans||[]).map(n=>({k:'Plan',t:n.title,s:n.subject,done:n.done,x:n.day}));
    const all=(RF==='Notes'?notes:RF==='Tasks'?tasks:RF==='Plans'?plans:[...tasks,...plans,...notes]);
    const rows=all.length?all.slice(0,80).map(x=>`<div class="trow" data-rk="${x.k}" style="height:auto;min-height:56px;margin-top:8px"><div style="flex:1"><div class="tt"${x.done?' style="text-decoration:line-through;opacity:.6"':''}>${esc(x.t)}</div><div class="meta"><span class="tag">${esc(x.s||'Personal')}</span><span class="mt">${x.x?esc(x.x)+' · Plan':x.k}</span></div></div></div>`).join(''):`<div class="card" style="margin-top:14px;border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:18px">${mascotHtml('curious','inline','','display:block;margin:0 auto 6px')}Nothing saved yet.</div>`;
    return wrapD(`<div class="pg">${qhead('remind','Reminder','Everything you saved, in one place.')}<div class="chips" style="margin-top:14px">${['All','Notes','Tasks','Plans'].map(x=>`<span class="chip${x===RF?' on':''}" data-chip data-rf="${x}">${x}</span>`).join('')}</div>${rows}</div>`)},
  play(){S.mute=false;enter();R.onclick=e=>{
    if(e.target.closest('[data-back]')){hap('light');toQuick();return}
    const c=e.target.closest('[data-rf]');if(c){RF=c.dataset.rf;hap('light');go('Reminder',true);return}
    const r=e.target.closest('[data-rk]');if(r){hap('light');if(r.dataset.rk==='Task')go('Tasks');else if(r.dataset.rk==='Plan'){}else if(CB.open)CB.open('subjects')}}}
});

/* Upload file -> text files become notes */
replace('Upload file',{
  html:()=>wrapD(`<div class="pg">${qhead('upload','Upload file','Import a text file as a note.')}<div class="qdrop" data-pick style="cursor:pointer">${DZ.QI.upload}<b data-pt>Tap to choose a file</b><small>.txt or .md · up to 1 MB</small></div>${DZ.lb('Subject')}<div class="chips" data-subj>${DZ.ch(SUBJ2())}</div><input type="file" data-file accept=".txt,.md,text/plain,text/markdown" style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px"></div>`),
  play(){S.mute=false;enter();R.onclick=async e=>{
    if(e.target.closest('[data-back]')){hap('light');toQuick();return}
    const c=e.target.closest('[data-chip]');if(c){$$('[data-chip]',c.parentNode).forEach(x=>x.classList.remove('on'));c.classList.add('on');hap('light');return}
    if(e.target.closest('[data-pick]')){hap('light');const fi=$('[data-file]',R);fi.value='';fi.onchange=async()=>{
      const f=fi.files&&fi.files[0];if(!f)return;
      if(!/\.(txt|md)$/i.test(f.name)&&!/^text\//.test(f.type)){toast('Only text files (.txt, .md) can be imported for now');return}
      if(f.size>1048576){toast('That file is over 1 MB');return}
      let text='';try{text=await f.text()}catch(_){toast('Could not read that file');return}
      if(!text.trim()){toast('That file is empty');return}
      $('[data-pt]',R).textContent='Saving…';
      const ok=CB.addNote?await CB.addNote({title:f.name.replace(/\.[^.]+$/,'').slice(0,120),subject:pickOn('[data-subj]')||SUBJ2()[0],content:text.slice(0,20000)}):false;
      if(ok){hap('success');toast('Imported as a note');toQuick()}else{$('[data-pt]',R).textContent='Tap to choose a file';toast('Could not save. Try again.')}};fi.click()}}}
});

/* Search v106: suggestions, recent searches, filters, quick actions, highlighted matches */
let SQ='',SFROM='Home',SF='All',SSEL=-1;DZ.openSearch=q=>{SQ=String(q||'');SF='Tasks';SFROM=SCREENS[CUR]?SCREENS[CUR].t:'Home';go('Search')};
const SRK='studyos_recent_search';
const sRecent=()=>{try{const a=JSON.parse(localStorage.getItem(SRK)||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string').slice(0,8):[]}catch(_){return []}};
const sRemember=q=>{q=String(q||'').trim();if(q.length<2)return;const a=[q,...sRecent().filter(x=>x.toLowerCase()!==q.toLowerCase())].slice(0,8);try{localStorage.setItem(SRK,JSON.stringify(a))}catch(_){}};
const sForget=q=>{try{localStorage.setItem(SRK,JSON.stringify(q==null?[]:sRecent().filter(x=>x!==q)))}catch(_){}};
const sNorm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
// score: exact > starts with > word starts with > contains > all letters in order (typo friendly)
const sScore=(text,q)=>{const t=sNorm(text);if(!q||!t)return 0;if(t===q)return 100;if(t.startsWith(q))return 80;if(t.split(/[\s\-_.]+/).some(w=>w.startsWith(q)))return 65;if(t.includes(q))return 50;
  let i=0;for(const ch of t){if(ch===q[i])i++;if(i===q.length)break}return i===q.length&&q.length>2?20:0};
const sMark=(text,q)=>{const s=String(text||'');if(!q)return esc(s);const t=sNorm(s),k=t.indexOf(q);if(k<0)return esc(s);return esc(s.slice(0,k))+'<mark>'+esc(s.slice(k,k+q.length))+'</mark>'+esc(s.slice(k+q.length))};
const SICO={
 task:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
 note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/></svg>',
 subject:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5"/></svg>',
 friend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.4 6.5-5.4s5.9 1.8 6.5 5.4M16 4.8a3.2 3.2 0 010 6.2M18.5 14.8c1.8.7 2.8 2.3 3 5.2"/></svg>',
 page:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 fire:flameIconHtml(18)
};
// App pages you can jump to by typing their name
const SPAGES=[['Tasks','Your to-do list','task'],['Focus','Start a focus timer','clock'],['Study','Reports, exams and tools','subject'],['Weekly report','Minutes studied this week','page'],['Exam mode','Countdown and daily target','page'],['Badges','Your achievements','page'],['Friends','Leaderboard and requests','friend'],['My subjects','Progress for each subject','subject'],['Planner','Plan your week','page'],['Gem Shop','Themes, freezes and more','page'],['Streak','Your streak calendar','page'],['Settings','Theme, sound and account','page'],['Edit profile','Name, picture and avatar','page']];
const sData=()=>{
  const q=sNorm(SQ.trim());
  const T=(D.tasks||[]).map(x=>({k:'task',id:x.id,t:x.title,s:x.subject,m:x.meta||'',done:x.done,sc:Math.max(sScore(x.title,q),sScore(x.subject,q)*.6)}));
  const N=(D.notes||[]).map(x=>({k:'note',id:x.id,t:x.title,s:x.subject,sc:Math.max(sScore(x.title,q),sScore(x.subject,q)*.6)}));
  const S2=(D.subjects||[]).map(n=>({k:'subject',t:n,sc:sScore(n,q)}));
  const F=(D.friends||[]).map(f=>({k:'friend',id:f.id,t:f.name,f,sc:sScore(f.name,q)}));
  const P=SPAGES.map(([t,s,ic])=>({k:'page',t,s,ic,sc:Math.max(sScore(t,q),sScore(s,q)*.5)}));
  const keep=a=>a.filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc);
  return {q,T:keep(T),N:keep(N),S:keep(S2),F:keep(F),P:keep(P)};
};
const sRow=(x,q,i)=>{
  const ic=x.k==='page'?SICO[x.ic]||SICO.page:x.k==='friend'?`<span class="sx-fa">${DZ.pfFace?DZ.pfFace(x.id,x.f.avatar,x.f.picture):''}</span>`:SICO[x.k];
  const sub=x.k==='task'?`${esc(x.s||'Personal')}${x.m?' · '+esc(x.m):''}`:x.k==='note'?esc(x.s||'Personal')+' · Note':x.k==='subject'?'Subject':x.k==='friend'?`${(x.f.gems||0).toLocaleString()} gems${x.f.streak?' · '+x.f.streak+' day streak':''}`:esc(x.s||'');
  return `<button type="button" class="sx-r${i===SSEL?' sel':''}${x.done?' done':''}" data-sx="${x.k}" data-id="${esc(x.id||x.t)}" style="--k:${i}"><span class="sx-i sx-${x.k}">${ic}</span><span class="sx-t"><b>${sMark(x.t,q)}</b><small>${sub}</small></span>${x.k==='task'?`<span class="sx-tag${x.done?' ok':''}">${x.done?'Done':'Open'}</span>`:`<span class="sx-go">${SICO.page}</span>`}</button>`;
};
const sTabs=c=>`<div class="sx-tabs" role="tablist">${[['All',c.all],['Tasks',c.T],['Notes',c.N],['Subjects',c.S],['Friends',c.F]].map(([n,v])=>`<button type="button" role="tab" class="sx-tab${SF===n?' on':''}" data-sf="${n}" aria-selected="${SF===n}">${n}${v?`<i>${v}</i>`:''}</button>`).join('')}</div>`;
const searchRes=()=>{
  const r=sData(),q=r.q;
  if(!q){
    const rec=sRecent(),open=(D.tasks||[]).filter(t=>!t.done).slice(0,3),subs=(D.subjects||[]).slice(0,8);
    const tips=['math','due today','notes','friends','focus','shop'];
    return `${rec.length?`<div class="sx-sec">Recent searches<button type="button" class="sx-clr" data-sclear>Clear</button></div><div class="sx-rec">${rec.map(x=>`<span class="sx-rc"><button type="button" data-srec="${esc(x)}">${SICO.clock}<span>${esc(x)}</span></button><button type="button" class="sx-rx" data-srm="${esc(x)}" aria-label="Remove ${esc(x)}">${SICO.x}</button></span>`).join('')}</div>`:''}
<div class="sx-sec">Quick actions</div><div class="sx-qa"><button type="button" data-sqa="Add task">${SICO.plus}<span>New task</span></button><button type="button" data-sqa="Add note">${SICO.note}<span>New note</span></button><button type="button" data-sqa="Focus">${SICO.clock}<span>Focus</span></button><button type="button" data-sqa="Friends">${SICO.friend}<span>Friends</span></button></div>
${subs.length?`<div class="sx-sec">Your subjects</div><div class="sx-chips">${subs.map(s=>`<button type="button" class="sx-chip" data-stry="${esc(s)}">${esc(s)}</button>`).join('')}</div>`:''}
${open.length?`<div class="sx-sec">Open tasks</div><div class="sx-list">${open.map((t,i)=>sRow({k:'task',id:t.id,t:t.title,s:t.subject,m:t.meta,done:t.done},'',i)).join('')}</div>`:''}
<div class="sx-sec">Try searching</div><div class="sx-chips">${tips.map(s=>`<button type="button" class="sx-chip ghost" data-stry="${s}">${s}</button>`).join('')}</div>`;
  }
  // smart words: "done", "open", "today", "overdue"
  let T=r.T;const all=(D.tasks||[]);
  if(/^(done|completed|finished)$/.test(q))T=all.filter(t=>t.done).map(x=>({k:'task',id:x.id,t:x.title,s:x.subject,m:x.meta,done:true,sc:1}));
  else if(/^(open|todo|to do|pending)$/.test(q))T=all.filter(t=>!t.done).map(x=>({k:'task',id:x.id,t:x.title,s:x.subject,m:x.meta,done:false,sc:1}));
  else if(/today/.test(q))T=all.filter(t=>t.when==='today'||t.when==='overdue').map(x=>({k:'task',id:x.id,t:x.title,s:x.subject,m:x.meta,done:x.done,sc:1}));
  else if(/overdue|late/.test(q))T=all.filter(t=>t.when==='overdue').map(x=>({k:'task',id:x.id,t:x.title,s:x.subject,m:x.meta,done:x.done,sc:1}));
  const c={T:T.length,N:r.N.length,S:r.S.length,F:r.F.length};c.all=c.T+c.N+c.S+c.F;
  let i=0;const sec=(h,items,lim)=>items.length?`<div class="sx-sec">${h}<span class="sx-n">${items.length}</span></div><div class="sx-list">${items.slice(0,lim).map(x=>sRow(x,q,i++)).join('')}</div>`:'';
  const pages=SF==='All'?r.P.slice(0,3):[];
  let body='';
  if(SF==='All')body=(pages.length?`<div class="sx-sec">Go to</div><div class="sx-list">${pages.map(x=>sRow(x,q,i++)).join('')}</div>`:'')+sec('Tasks',T,5)+sec('Notes',r.N,5)+sec('Subjects',r.S,5)+sec('Friends',r.F,5);
  else body=sec(SF,SF==='Tasks'?T:SF==='Notes'?r.N:SF==='Subjects'?r.S:r.F,50);
  if(!body)body=`<div class="sx-empty"><div class="sx-ei sx-fm">${mascotHtml('confused','inline')}</div><b>No results for “${esc(SQ.trim())}”</b><p>Check the spelling or try a shorter word.</p><button type="button" class="sx-make" data-smake>${SICO.plus}<span>Create task “${esc(SQ.trim().slice(0,40))}”</span></button></div>`;
  return sTabs(c)+body;
};
replace('Search',{
  html:()=>wrapD(`<div class="pg sx" style="padding-top:40px"><div class="sx-top"><button type="button" class="sx-bk" data-sback aria-label="Back">${ICO.back}</button><div class="card rw dz-srch sx-box"><span class="sx-si">${ICO.search.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><input data-sq type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(SQ)}" maxlength="60" placeholder="Search tasks, notes, subjects, friends" aria-label="Search"><button type="button" class="sx-cl${SQ?'':' hide'}" data-scl aria-label="Clear">${SICO.x}</button></div></div><div class="sx-res" data-sres aria-live="polite">${searchRes()}</div></div>`),
  play(){S.mute=false;enter();SSEL=-1;
    const inp=$('[data-sq]',R),res=()=>$('[data-sres]',R),cl=()=>$('[data-scl]',R);
    let tmr=0;
    const draw=()=>{const r=res();if(!r)return;r.innerHTML=searchRes();const c=cl();if(c)c.classList.toggle('hide',!SQ);
      if(!SOFT)$$('.sx-r,.sx-chip,.sx-qa button,.sx-rc',r).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:180,delay:Math.min(i,12)*18,easing:'ease-out',fill:'backwards'}))};
    const setQ=v=>{SQ=v;inp.value=v;SSEL=-1;draw()};
    if(inp){setTimeout(()=>{try{inp.focus();const n=inp.value.length;inp.setSelectionRange(n,n)}catch(_){}},180);
      inp.oninput=()=>{SQ=inp.value;SSEL=-1;clearTimeout(tmr);tmr=setTimeout(draw,90)};
      inp.onkeydown=e=>{const rows=$$('.sx-r',R);
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!rows.length)return;SSEL=(SSEL+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;rows.forEach((r,i)=>r.classList.toggle('sel',i===SSEL));rows[SSEL].scrollIntoView({block:'nearest'});return}
        if(e.key==='Enter'){e.preventDefault();sRemember(SQ);const r=rows[SSEL>=0?SSEL:0];if(r)r.click();else{try{inp.blur()}catch(_){}}return}
        if(e.key==='Escape'){if(SQ)setQ('');else{hap('light');go(SFROM)}}};}
    const openRow=r=>{const k=r.dataset.sx,id=r.dataset.id;sRemember(SQ);hap('light');
      if(k==='task'){if(DZ.editTask!==undefined){DZ.editTask=id;go('Add task')}else go('Tasks');return}
      if(k==='friend'){if(DZ.openFriend)DZ.openFriend(id,'Search');return}
      if(k==='page'){const n=r.querySelector('.sx-t b').textContent;if(IDX(n)>=0)go(n);return}
      if(k==='subject'){setQ(id);SF='All';return}
      if(CB.open)CB.open('subjects')};
    R.onclick=async e=>{const t=e.target;
      if(t.closest('[data-sback]')){hap('light');go(SFROM);return}
      if(t.closest('[data-scl]')){hap('light');setQ('');inp&&inp.focus();return}
      const tab=t.closest('[data-sf]');if(tab){SF=tab.dataset.sf;hap('tick');draw();return}
      const rm=t.closest('[data-srm]');if(rm){e.stopPropagation();sForget(rm.dataset.srm);hap('light');draw();return}
      if(t.closest('[data-sclear]')){sForget(null);hap('light');draw();return}
      const rc=t.closest('[data-srec]');if(rc){hap('tick');setQ(rc.dataset.srec);return}
      const tr=t.closest('[data-stry]');if(tr){hap('tick');setQ(tr.dataset.stry);return}
      const qa=t.closest('[data-sqa]');if(qa){hap('light');const n=qa.dataset.sqa;if(n==='Add task')DZ.editTask=null;go(n);return}
      if(t.closest('[data-smake]')){const title=SQ.trim().slice(0,120);if(!title)return;hap('press');const ok=CB.addTask?await CB.addTask({title,subject:(D.subjects||[])[0]||'Personal',priority:'medium',dueDate:new Date().toISOString().slice(0,10)}):false;if(ok){hap('success');toast('Task added');sRemember(title);setQ('')}else toast('Could not add the task.');return}
      const r=t.closest('[data-sx]');if(r)openRow(r)}}
});
/* ---- My subjects: every subject with its completion, opened from the Subjects count on Profile ---- */
{
const BK='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const UP='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.500 8.500L12 4l4.500 4.500M5 13v5.500A1.500 1.500 0 006.500 20h11a1.500 1.500 0 001.500-1.500V13"/></svg>';
const SC=['#58cc02','#1cb0f6','#ff9600','#ce82ff','#ff4b4b','#00cd9c','#ffc800','#2b70c9'];

/* Subject icons: flat colour with a thick dark outline, one per kind of subject */
const SJO='stroke="#1d1d21" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"';
const SJI={
chem:`<g ${SJO}><circle cx="42" cy="38" r="15" fill="#ccfff3"/><path d="M29.500 38a14.500 14.500 0 0029 0z" fill="#f7d060"/><rect x="36" y="14" width="12" height="12" fill="#ccfff3"/><rect x="34" y="9" width="16" height="6" rx="3" fill="#7fd6c8"/><path d="M17 20v12L7 52a3 3 0 003 4h22a3 3 0 003-4L25 32V20z" fill="#e6e6e6"/><path d="M11 44h22l3 8a3 3 0 01-3 4H10a3 3 0 01-3-4z" fill="#ff6b6b"/><rect x="14" y="15" width="14" height="6" rx="3" fill="#cfcfcf"/></g><g fill="#1d1d21"><circle cx="19" cy="49" r="1.800"/><circle cx="26" cy="47" r="1.800"/><circle cx="42" cy="44" r="1.800"/><circle cx="49" cy="40" r="1.800"/><circle cx="14" cy="6" r="1.600"/><circle cx="21" cy="3.500" r="1.600"/></g>`,
phys:`<g fill="none" ${SJO}><ellipse cx="32" cy="32" rx="26" ry="10"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(120 32 32)"/></g><g ${SJO}><circle cx="32" cy="32" r="7" fill="#ff6b6b"/><circle cx="57" cy="32" r="4" fill="#ffd34d"/><circle cx="19.500" cy="10.400" r="4" fill="#ffd34d"/><circle cx="19.500" cy="53.600" r="4" fill="#ffd34d"/></g>`,
bio:`<g fill="none" stroke-linecap="round"><path d="M20 6c0 14 24 14 24 26S20 46 20 58" stroke="#1d1d21" stroke-width="9"/><path d="M44 6c0 14-24 14-24 26s24 14 24 26" stroke="#1d1d21" stroke-width="9"/><path d="M20 6c0 14 24 14 24 26S20 46 20 58" stroke="#5b8def" stroke-width="3.600"/><path d="M44 6c0 14-24 14-24 26s24 14 24 26" stroke="#ff6b6b" stroke-width="3.600"/></g><g ${SJO}><path d="M26 17h12M23 32h18M26 47h12" fill="none"/><circle cx="14" cy="26" r="0"/></g><g ${SJO}><path d="M50 30c8-1 12-6 12-12-7 0-12 4-12 12z" fill="#7ed957"/><path d="M14 52c-8-1-12-6-12-12 7 0 12 4 12 12z" fill="#7ed957"/></g>`,
math:`<g ${SJO}><rect x="12" y="5" width="40" height="54" rx="7" fill="#cdd7ff"/><rect x="18" y="11" width="28" height="13" rx="3" fill="#fff"/><circle cx="23" cy="34" r="3.500" fill="#ff6b6b"/><circle cx="32" cy="34" r="3.500" fill="#ffd34d"/><circle cx="41" cy="34" r="3.500" fill="#7ed957"/><circle cx="23" cy="44" r="3.500" fill="#ffd34d"/><circle cx="32" cy="44" r="3.500" fill="#7ed957"/><circle cx="41" cy="44" r="3.500" fill="#ff6b6b"/><path d="M22 52h20" /></g>`,
hist:`<g ${SJO}><path d="M6 24L32 8l26 16z" fill="#ffd34d"/><rect x="9" y="24" width="46" height="5" fill="#f6e7c1"/><rect x="13" y="29" width="7" height="22" fill="#f6e7c1"/><rect x="28.500" y="29" width="7" height="22" fill="#f6e7c1"/><rect x="44" y="29" width="7" height="22" fill="#f6e7c1"/><rect x="7" y="51" width="50" height="6" rx="2" fill="#e3c88f"/></g>`,
geo:`<g ${SJO}><circle cx="32" cy="29" r="23" fill="#8be0ff"/><path d="M17 17c6-4 10-2 12 3s-6 6-4 12-8 4-9-3-5-7 1-12zM38 14c6 0 11 4 12 10-5 1-6 6-10 6s-5-8-2-16zM36 38c5-2 10 1 9 7s-7 7-9 3-3-8 0-10z" fill="#7ed957"/><path d="M20 55h24M32 52v5" fill="none"/></g>`,
eng:`<g ${SJO}><path d="M5 14c9-3 18-2 27 4v38c-9-6-18-7-27-4z" fill="#ff8a8a"/><path d="M59 14c-9-3-18-2-27 4v38c9-6 18-7 27-4z" fill="#ff6b6b"/><path d="M9 16c7-2 14-1 20 3v32c-7-4-13-4-20-3z" fill="#fff"/><path d="M55 16c-7-2-14-1-20 3v32c7-4 13-4 20-3z" fill="#fff"/><path d="M14 25c4-1 8 0 11 2M14 33c4-1 8 0 11 2M39 27c3-2 7-3 11-2M39 35c3-2 7-3 11-2" fill="none"/></g>`,
lang:`<g ${SJO}><path d="M6 10h34a4 4 0 014 4v18a4 4 0 01-4 4H22l-10 9v-9H6a4 4 0 01-4-4V14a4 4 0 014-4z" fill="#ffd34d"/><path d="M24 30h34a4 4 0 014 4v18a4 4 0 01-4 4h-6v8l-10-8H24a4 4 0 01-4-4V34a4 4 0 014-4z" fill="#7fd6c8" transform="translate(0 -4)"/><path d="M10 20h26M10 27h16M30 40h26M30 47h16" fill="none"/></g>`,
cs:`<g ${SJO}><rect x="9" y="10" width="46" height="31" rx="4" fill="#5b8def"/><path d="M3 49h58l-4 6H7z" fill="#d9dde6"/><path d="M27 21l-6 5 6 5M37 21l6 5-6 5M34 19l-4 14" fill="none" stroke="#fff"/></g>`,
art:`<g ${SJO}><path d="M32 6C16 6 4 17 4 31c0 12 9 21 20 21 5 0 6-3 4-6-2-4 0-7 5-7h8c9 0 15-4 15-11C56 15 46 6 32 6z" fill="#ffe0b2"/><circle cx="18" cy="26" r="4" fill="#ff6b6b"/><circle cx="29" cy="17" r="4" fill="#ffd34d"/><circle cx="42" cy="19" r="4" fill="#7ed957"/><circle cx="48" cy="31" r="4" fill="#5b8def"/></g>`,
music:`<g ${SJO}><path d="M24 44V12l30-6v32" fill="none"/><path d="M24 20l30-6" fill="none"/><circle cx="16" cy="46" r="8" fill="#ff6b6b"/><circle cx="46" cy="40" r="8" fill="#5b8def"/></g>`,
isl:`<g ${SJO}><path d="M40 7a25 25 0 100 50 20 20 0 01 0-50z" fill="#ffd34d"/><path d="M47 18l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#7fd6c8"/></g>`,
econ:`<g ${SJO}><rect x="8" y="34" width="12" height="22" rx="2" fill="#7ed957"/><rect x="26" y="22" width="12" height="34" rx="2" fill="#ffd34d"/><rect x="44" y="8" width="12" height="48" rx="2" fill="#ff6b6b"/><path d="M5 59h54" fill="none"/></g>`,
def:`<g ${SJO}><rect x="8" y="36" width="48" height="13" rx="3" fill="#7fd6c8"/><rect x="12" y="23" width="42" height="13" rx="3" fill="#ffd34d"/><rect x="6" y="10" width="40" height="13" rx="3" fill="#ff6b6b" transform="rotate(-6 26 16)"/><path d="M13 42h10M18 29h10" fill="none"/></g>`
};
const sjKind=n=>{const t=String(n||'').toLowerCase();
  const T=[['chem',/chem/],['cs',/comput|program|coding|\bcode\b|\bit\b|software|informatic|robot|\bai\b/],['phys',/phys|mechanic|astronom/],['bio',/bio|science|nature|environment|health|medic|anatomy/],['math',/math|algebra|calcul|geometr|statist|trigon|arithm/],['geo',/geo|earth/],['hist',/hist|civic|social|pak.?stud|politic|law|ancient/],['isl',/islam|quran|religio|deen|theolog/],['econ',/econ|business|account|commerce|financ|market/],['art',/\bart\b|draw|design|paint|sketch/],['music',/music|piano|guitar|sing/],['eng',/engl|literat|writing|grammar|essay|reading|novel/],['lang',/urdu|hindi|arab|french|german|spanish|chinese|language|persian|punjabi|pashto|sindhi|turkish|japanese|korean/]];
  for(const [k,r] of T)if(r.test(t))return k;return 'def'};
const subIcon=n=>`<svg viewBox="0 0 64 64" aria-hidden="true">${SJI[sjKind(n)]}</svg>`;DZ.subIcon=subIcon;
const subCol=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return SC[h%SC.length]};
const subList=()=>(D.subjectProgress&&D.subjectProgress.length)?D.subjectProgress:(D.subjects||[]).map(n=>({name:n,pct:0,done:0,total:0,min:0}));
const subMin=m=>{m=Math.round(m||0);return m>=60?Math.floor(m/60)+'h '+(m%60)+'m':m+'m'};
const subTitle=()=>D.fullName?D.fullName+'’s Subjects':'My Subjects';
const subRows=()=>{
  const L=subList();
  if(!L.length)return `<div class="smy-e"><div class="smy-ei">${BK.replace('M19 12H5M11 6l-6 6 6 6','M4 5.500A2 2 0 016 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM8 9h8M8 13h5')}</div><b>No subjects yet</b><span>Add a subject and your progress shows up here.</span><button type="button" class="smy-add" data-sadd>ADD A SUBJECT</button></div>`;
  return L.map((x,i)=>{
    const nm=String(x.name||'?'),pc=Math.max(0,Math.min(100,x.pct|0)),sub=(x.total?x.done+'/'+x.total+' tasks':'No tasks yet')+(x.min?' · '+subMin(x.min):'');
    return `<div class="smy-r" style="--i:${i}"><span class="smy-i">${subIcon(nm)}</span><div class="smy-t"><b>${esc(nm)}</b><div class="smy-b"><i style="width:${pc}%"></i></div><small>${esc(sub)}</small></div><span class="smy-p">${pc}%</span></div>`;
  }).join('');
};
replace('My subjects',{
  html:()=>`<div class="scr n nd" style="--pg:#181b22"><div class="smy-pg"><div class="smy-h"><button type="button" class="smy-x" data-sback aria-label="Back">${BK}</button><h1>${esc(subTitle())}</h1><button type="button" class="smy-x" data-sshare aria-label="Share">${UP}</button></div><div class="smy-l" data-sc>${subRows()}</div></div></div>`,
  play(){S.mute=false;enter();
    R.onclick=e=>{
      if(e.target.closest('[data-sback]')){hap('light');go('Profile');return}
      if(e.target.closest('[data-sadd]')){hap('light');if(CB.open)CB.open('subjects');return}
      if(e.target.closest('[data-sshare]')){hap('light');
        const L=subList(),txt=subTitle()+' on StudyOS\n'+(L.length?L.map(x=>'• '+x.name+': '+(x.pct|0)+'%').join('\n'):'No subjects yet');
        if(navigator.share){navigator.share({text:txt}).catch(()=>{})}
        else if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>toast('Copied to clipboard')).catch(()=>{})}
        return}
    }}
});
}
/* ---- Edit avatar: pick face, hair, glasses, facial hair, clothes, caps and background ---- */
{
const BK=DZ.BKX;
const AVI=t=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${t.d}"/></svg>`;
let AVC=avDecode(''),AVT='face',AV0='';
const avSw=(k,i,on,kind)=>`<button type="button" class="avs${on?' on':''}" data-avk="${k}" data-avi="${i}" aria-label="${AVD[k].t} ${i+1}" aria-pressed="${on}" style="--c:${AVD[k].c[i]}"><i></i></button>`;
const avBody=()=>{
  const tab=AVTABS.find(x=>x.k===AVT)||AVTABS[0];
  return tab.secs.map(([k,kind])=>{
    const d=AVD[k];let h=`<div class="avh">${d.t}</div>`;
    if(kind==='s')h+=`<div class="avr">${d.c.map((_,i)=>avSw(k,i,AVC[k]===i)).join('')}</div>`;
    else if(kind==='c')h+=`<div class="avg chr">${d.o.map((_,i)=>{const v=Object.assign({},AVC,{chr:i});
        return `<button type="button" class="avc${AVC.chr===i?' on':''}" data-avk="chr" data-avi="${i}" aria-label="${i?AVD.chr.o[i]:'My own avatar'}" aria-pressed="${AVC.chr===i}">${avatarSvg(v,{view:i?'full':'face'})}</button>`}).join('')}</div>`;
    else if(kind==='k')h+=`<div class="avr skg">${(d.ord||d.c.map((_,i)=>i)).map(i=>avSw(k,i,AVC[k]===i)).join('')}</div>`;
    else if(kind==='b')h+=`<div class="avr bgr">${d.c.map((_,i)=>avSw(k,i,AVC[k]===i)).join('')}</div>`;
    else{
      const n=d.o.length,view=k==='top'?'bust':k==='body'?'both':'face';
      h+=`<div class="avg${k==='top'||k==='body'?' w2':''}">${d.o.map((_,i)=>{const v=Object.assign({},AVC,{[k]:i,chr:0});if(k!=='hat'&&k!=='body')v.hat=0;
        return `<button type="button" class="avc${AVC[k]===i?' on':''}" data-avk="${k}" data-avi="${i}" aria-label="${d.t} ${i+1} of ${n}" aria-pressed="${AVC[k]===i}">${avatarSvg(v,{view,blank:k==='body'})}</button>`}).join('')}</div>`;
    }
    return h}).join('');
};
const avTabs=()=>AVTABS.map(t=>`<button type="button" class="${t.k===AVT?'on':''}" data-avtab="${t.k}" aria-label="${t.t}" aria-selected="${t.k===AVT}" role="tab">${AVI(t)}</button>`).join('');
const avPrev=()=>avatarSvg(AVC,{view:'full'});
replace('Edit avatar',{
  g:'Settings pages',d:'Make your avatar: face, hair, glasses, clothes, caps',
  html:()=>`<div class="scr n nd" style="--pg:#181b22"><div class="ss"><div class="shd"><button class="sbk" type="button" data-avback aria-label="Close">${BK}</button><b>Edit avatar</b><button type="button" data-avdone>DONE</button></div><div class="avx"><div class="avp" style="background:${avPb(AVC)}">${avPrev()}</div><div class="avt" role="tablist">${avTabs()}</div><div class="avb" data-avb>${avBody()}</div></div></div></div>`,
  play(){
    // start from the saved avatar each time the screen opens (not on a soft refresh)
    S.mute=false;
    const paint=(bounce)=>{
      const pv=$('.avp',R);pv.style.background=avPb(AVC);pv.innerHTML=avPrev();
      if(bounce)pv.firstElementChild.animate([{transform:'scale(.94)'},{transform:'scale(1.03)',offset:.55},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.9,.3,1)'});
    };
    const body=(st)=>{const b=$('[data-avb]',R);const y=st?b.scrollTop:0;b.innerHTML=avBody();b.scrollTop=y};
    $('.avp svg',R).animate([{transform:'translateY(36px) scale(.9)',opacity:0},{transform:'none',opacity:1}],{duration:480,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
    R.onclick=e=>{
      if(e.target.closest('[data-avback]')){hap('light');go('Edit profile');return}
      if(e.target.closest('[data-avdone]')){
        const enc=avEncode(AVC);hap('success');
        if(enc!==AV0){D.avatar=enc;if(CB.savePref)CB.savePref('avatar',enc);toast('Avatar saved')}
        go('Edit profile');return}
      const tb=e.target.closest('[data-avtab]');
      if(tb){if(tb.dataset.avtab===AVT)return;hap('light');AVT=tb.dataset.avtab;
        $$('[data-avtab]',R).forEach(x=>{const on=x.dataset.avtab===AVT;x.classList.toggle('on',on);x.setAttribute('aria-selected',on)});body(false);
        rise('.avb .avh,.avb .avs,.avb .avc',0,14);return}
      const pk=e.target.closest('[data-avk]');
      if(pk){const k=pk.dataset.avk,i=+pk.dataset.avi;if(AVC[k]===i)return;hap('light');if(k!=='chr')AVC.chr=0;AVC[k]=i;paint(true);body(true)}
    };
  }
});
// every time the editor is opened from Edit profile it starts from the saved avatar
DZ.openAvatar=()=>{AVC=avDecode(D.avatar);AV0=avEncode(AVC);AVT='face';go('Edit avatar')};
}
/* ---- Gem Shop (purchases are checked and stored on the server) ---- */
{
const SHI={
 gem:'<svg viewBox="40 0 385 466" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet"><path d="M175 5L275 35L395 130L415 335L385 425L215 462L50 250Z" fill="#ff4a6d"/><path d="M275 35L205 205L210 232L285 350L412 335L275 35Z" fill="#ff617f"/><path d="M275 35L395 130L415 335L412 335Z" fill="#f993ac"/><path d="M50 250L210 232L285 350L215 462Z" fill="#ff335f"/><path d="M285 350L412 335L385 425L215 462Z" fill="#ff4a6d"/></svg>',
 freeze:'<svg viewBox="0 0 334 486" aria-hidden="true"><image width="334" height="486" href="data:image/png;base64,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"/></svg>',
 bolt:'<svg viewBox="0 0 64 64"><path d="M38 3 12 35h15l-4 26 29-35H36z" fill="#a95cf2"/><path d="M38 3 36 26h16L23 61l4-26z" fill="#c28dff"/></svg>',
 gift:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="22" width="54" height="13" rx="5" fill="#9b6bf5"/><rect x="9" y="33" width="46" height="26" rx="6" fill="#7c4df0"/><rect x="27.500" y="22" width="9" height="37" fill="#bba2ff"/><path d="M32 22C21 22 13 17 16 10c4-6 13-1 16 12zM32 22c11 0 19-5 16-12-4-6-13-1-16 12z" fill="#b28cff"/></svg>',
 clock:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="14" cy="14" r="9.500" fill="#a08cf8"/><circle cx="50" cy="14" r="9.500" fill="#a08cf8"/><circle cx="17" cy="56" r="4.500" fill="#7468e8"/><circle cx="47" cy="56" r="4.500" fill="#7468e8"/><circle cx="32" cy="34" r="24" fill="#7468e8"/><circle cx="32" cy="34" r="18" fill="#bdb4fb"/><path d="M32 23v12h10" fill="none" stroke="#5b4bd4" stroke-width="5.500" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 sand:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 10h30c0 12-9 16-9 22s9 10 9 22H17c0-12 9-16 9-22s-9-10-9-22z" fill="#fbe8bf"/><path d="M23 13h18c-1 7-9 9-9 12s-8-5-9-12z" fill="#f5b53a"/><path d="M21 51c2-7 6-10 11-10s9 3 11 10z" fill="#f5b53a"/><rect x="12" y="3" width="40" height="9" rx="4.500" fill="#f7c548"/><rect x="12" y="52" width="40" height="9" rx="4.500" fill="#f7c548"/></svg>',
 heart:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 58C9 42 4 30 4 21 4 12 11 6 19 6c6 0 10 3 13 8 3-5 7-8 13-8 8 0 15 6 15 15 0 9-5 21-28 37z" fill="#ff5c85"/><path d="M45 6c8 0 15 6 15 15 0 9-5 21-28 37 14-14 20-26 18-38-1-6-3-10-5-14z" fill="#ff3d6b"/><path d="M12 17c1-4 4-6 8-6" fill="none" stroke="#ff9db5" stroke-width="3.500" stroke-linecap="round"/></svg>'
};
const PR=()=>Object.assign({freeze:100,repair:150,double:120,sound:180,focusplus:220,report:200,exam:300,widgets:160,frames:140,badges:120,theme_ocean:250,theme_forest:250,theme_sunset:250,theme_mono:250,gift:25},(D.shop&&D.shop.prices)||{});
let SLT=0,SHEET=null,SMSG=null,SHY=0,GHY=0,SBUSY=false,STXT='',STUNTIL=0,SARM='',SARMT=0,SBT=0,SBST=0;
let DBG=[];
const tn=el=>{try{return (el.tagName||'?')+'.'+String((el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className)||'').split(' ')[0]}catch(_){return '?'}};
const dbg=m=>{DBG.push(new Date().toTimeString().slice(3,8)+' '+m);if(DBG.length>6)DBG.shift();try{const el=R&&R.querySelector('.sh-dbg');if(el)el.textContent=DBG.join('\n')}catch(_){}};
const isArm=k=>SARM===k&&Date.now()<SARMT;
const ntxt=n=>(n||0).toLocaleString();
const gmI='<span class="sh-gi">'+SHI.gem+'</span>';DZ.gemSvg=SHI.gem;
const leftTxt=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h>0?h+'h '+(m%60)+'m left':m+'m left'};
// Why the shop has no data: still loading, no connection, or the server refused.
function shopWait(){
  if(D.shopStatus==='offline')return 'The shop is offline. Check your connection.';
  if(D.shopStatus==='error')return 'The shop is not available right now'+(D.shopCode?' (code '+D.shopCode+')':'')+'. Try again later.';
  return 'The shop is still loading. One moment.';
}
// Why a button cannot be used right now (empty text = it can).
function blocked(price,extra){
  if(D.guest)return 'Create your profile to use the shop.';
  if(!D.shop)return shopWait();
  if(extra)return extra;
  if((D.gems||0)<price)return 'You need '+ntxt(price-(D.gems||0))+' more gems. Study to earn them.';
  return '';
}
// Items the server has finished. An older server sends no list, so only the original items count.
const LIVE0={freeze:1,double:1};
const isLive=k=>{const lv=D.shop&&D.shop.live;return lv?!!lv[k]:!!LIVE0[k]};
const hasItem=k=>!!(D.shop&&(D.shop.owned||[]).indexOf(k)>=0);
const msgHtml=()=>SMSG?`<div class="sh-msg${SMSG.ok?' ok':''}" role="status">${esc(SMSG.text)}</div>`:'';

/* ---- the Gem Shop page ---- */
const LI=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const SI={
 freeze:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 26 19 10l11 5 9-9 12 11 2 19-5 15-5-5-6 9-6-8-9 6-4-12-6-6z" fill="#3fa9f5"/><path d="M19 10l11 5 9-9 12 11-8 5-12-3-14 8z" fill="#8fd4ff"/><path d="M11 26l9-3 6 14-5 18-4-12-6-6z" fill="#2f8fe6" opacity=".55"/><path d="M24 24l4 4-4 4-4-4zM44 34l3.500 3.500-3.500 3.500-3.500-3.500z" fill="#fff"/><path d="M33 33c3 4 6 6 6 9a6 6 0 0 1-12 0c0-3 3-5 6-9z" fill="#1f7fe0"/></svg>',
 repair:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 36A21 21 0 1 0 17 20" fill="none" stroke="#ff8a1f" stroke-width="7" stroke-linecap="round"/><path d="M4 16l15-9 2 18z" fill="#ff8a1f" stroke="#ff8a1f" stroke-width="3" stroke-linejoin="round"/><path d="M33 20v14l9 6" fill="none" stroke="#ff8a1f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 double:SHI.gem,
 sound:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 38V31a21 21 0 0 1 42 0v7" fill="none" stroke="#8b5cf6" stroke-width="7" stroke-linecap="round"/><rect x="6" y="34" width="15" height="24" rx="7.500" fill="#7c4de8"/><rect x="43" y="34" width="15" height="24" rx="7.500" fill="#7c4de8"/><rect x="9" y="37" width="6" height="16" rx="3" fill="#a98bf7"/><rect x="46" y="37" width="6" height="16" rx="3" fill="#a98bf7"/></svg>',
 focusplus:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="25" y="3" width="14" height="8" rx="3.500" fill="#6a4be0"/><rect x="29" y="9" width="6" height="7" fill="#6a4be0"/><circle cx="32" cy="37" r="24" fill="#7b5cf0"/><circle cx="32" cy="37" r="16.500" fill="#2d1f6e"/><path d="M32 37l9-9" stroke="#a78bfa" stroke-width="5.500" stroke-linecap="round"/><path d="M13 20l-4-4" stroke="#6a4be0" stroke-width="5" stroke-linecap="round"/></svg>',
 report:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="53" width="56" height="6" rx="3" fill="#4aa3f2"/><rect x="9" y="33" width="8" height="18" rx="4" fill="#4aa8f7"/><rect x="21" y="11" width="8" height="40" rx="4" fill="#5bb4ff"/><rect x="33" y="37" width="6" height="14" rx="3" fill="#3f93ec"/><rect x="43" y="24" width="8" height="27" rx="4" fill="#4aa8f7"/><rect x="54" y="42" width="4" height="9" rx="2" fill="#3f93ec"/></svg>',
 exam:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="11" width="54" height="48" rx="10" fill="#ffc233"/><rect x="11" y="25" width="42" height="28" rx="6" fill="#5b3a1e"/><path d="M23 39l6 6 12-13" fill="none" stroke="#ffc233" stroke-width="5.500" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="3" width="7" height="14" rx="3.500" fill="#e69a00"/><rect x="40" y="3" width="7" height="14" rx="3.500" fill="#e69a00"/></svg>',
 widgets:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="5" width="24" height="24" rx="8" fill="#2fd08a"/><rect x="11" y="11" width="12" height="12" rx="4.500" fill="#0f6e49"/><rect x="35" y="5" width="24" height="24" rx="8" fill="#2fd08a"/><rect x="41" y="11" width="12" height="12" rx="4.500" fill="#0f6e49"/><rect x="5" y="35" width="24" height="24" rx="8" fill="#2fd08a"/><rect x="11" y="41" width="12" height="12" rx="4.500" fill="#0f6e49"/><rect x="35" y="35" width="24" height="24" rx="8" fill="#2fd08a"/><rect x="41" y="41" width="12" height="12" rx="4.500" fill="#0f6e49"/></svg>',
 frames:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#ff5c8a"/><circle cx="32" cy="32" r="20" fill="#6e1b38"/><circle cx="32" cy="27" r="7" fill="#ff7aa0"/><path d="M18 47c1-9 6-12 14-12s13 3 14 12c-4 3-8 4-14 4s-10-1-14-4z" fill="#ff7aa0"/></svg>',
 badges:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 36 10 60l11-4 6 6 5-20z" fill="#f59e0b"/><path d="M47 36l7 24-11-4-6 6-5-20z" fill="#f59e0b"/><circle cx="32" cy="26" r="22" fill="#fbbf24"/><circle cx="32" cy="26" r="15" fill="#f5a623"/><path d="M32 15l3.200 6.800 7.400 1-5.400 5.200 1.400 7.400L32 31.800 25.400 35.400l1.400-7.400-5.400-5.200 7.400-1z" fill="#ffe27a"/></svg>',
 gift:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="22" width="54" height="13" rx="5" fill="#9b6bf5"/><rect x="9" y="33" width="46" height="26" rx="6" fill="#7c4df0"/><rect x="27.500" y="22" width="9" height="37" fill="#bba2ff"/><path d="M32 22C21 22 13 17 16 10c4-6 13-1 16 12zM32 22c11 0 19-5 16-12-4-6-13-1-16 12z" fill="#b28cff"/></svg>',
 back:LI('<path d="M6 6l12 12M18 6L6 18"/>')
};
// What each row says. Prices come from the server; the words and colours live here.
const SHOP_SECTIONS=[
 {h:'Streak boosts',s:'Never lose your flame',items:[
  {k:'freeze',t:'Streak Freeze',d:'Miss a day and your streak stays safe. Holds up to 2.',c:'#4fb3e8'},
  {k:'repair',t:'Streak Repair',d:'Broke your streak? Bring it back within 24 hours.',c:'#ee8a4a'},
  {k:'double',t:'Double Gems',tag:'Popular',d:'Earn 2x gems from focus sessions for 24 hours.',c:'#e0508a'}]},
 {h:'Focus and study',s:'Upgrade how you work',items:[
  {k:'sound',t:'Focus Soundscapes',d:'Rain, library and cafe sounds that play during Focus sessions.',c:'#3fbf8f'},
  {k:'focusplus',t:'Focus Plus',d:'Set your own short and long break lengths, and how many rounds come before a long break.',c:'#8b7bf0'},
  {k:'report',t:'Weekly Report Plus',d:'See your best study hour, subject breakdown and month-by-month trends.',c:'#4f9ae8'},
  {k:'exam',t:'Exam Mode Pro',d:'Countdown on your Home screen and a daily study target for each exam.',c:'#e3a53c'},
  {k:'widgets',t:'Widget Pack',d:'New Home widgets: streak flame, today\'s tasks and focus minutes.',c:'#3fbf8f'}]},
 {h:'Profile and friends',s:'Stand on the leaderboard',items:[
  {k:'frames',t:'Avatar Frames',d:'Gold, ruby and aurora frames your friends see.',c:'#e0508a'},
  {k:'badges',t:'Badge Showcase',d:'Pin your three favourite badges to the top of your profile.',c:'#e3a53c'},
  {k:'gift',t:'Gift Gems',d:'Send 25 gems to a friend to cheer them on before an exam.',c:'#8b7bf0'}]}
];
// Free themes switch light and dark. Paid themes unlock in a later update (Soon until then).
const SHOP_THEMES=[['light','Calm Mauve','#dfe0e3','#1b1e25','#edebec',0],['dark','Midnight','#12161a','#c9b8c3','#1f252d',0],['theme_ocean','Ocean','#d6e8f1','#2b6082','#eaf3fb',1],['theme_forest','Forest','#dde8df','#2f6b4a','#eaf4ec',1],['theme_sunset','Sunset','#f1ddd5','#b4532f','#f9ece6',1],['theme_mono','Mono','#e6e6e6','#1e1e1e','#f5f5f5',1]];
// Why a paid item cannot be bought right now (empty text = it can).
function whyNot(k,price){
  const sh=D.shop||{};
  if(D.guest)return 'Create your profile to use the shop.';
  if(!D.shop)return shopWait();
  if(k==='freeze'&&(sh.freezes||0)>=2)return 'You already hold the most Streak Freezes (2).';
  if(k==='double'&&(sh.doubleUntil||0)>Date.now())return 'Double Gems is already running.';
  if(k==='repair'&&!D.repair)return 'Your streak is safe. There is no missed day to repair.';
  if((D.gems||0)<price)return 'You need '+ntxt(price-(D.gems||0))+' more gems. Study to earn them.';
  return '';
}
/* ---- the buy sheet: tap a price and a half page rises from the bottom with the pack choices ---- */
const shopDef=k=>{for(const sc of SHOP_SECTIONS)for(const it of sc.items)if(it.k===k)return it;const th=SHOP_THEMES.find(x=>x[0]===k);return {k,t:th?th[1]+' theme':k,c:th?th[3]:'#8b7bf0'}};
// Paid colour themes show their own little preview instead of an item icon, and are bought one at a time.
const isTh=k=>String(k).indexOf('theme_')===0;
const themePv=k=>{const th=SHOP_THEMES.find(x=>x[0]===k);return th?`<span class="sh2-tpv" style="background:${th[2]}"><i style="background:${th[3]}"></i><u style="background:${th[4]}"></u></span>`:''};
const packsOf=k=>{if(isTh(k))return [{n:1,price:PR()[k]}];const p=D.shop&&D.shop.packs&&D.shop.packs[k];return Array.isArray(p)&&p.length?p:[{n:1,price:PR()[k]}]};
const packName=n=>n===1?'Single':n+' pack';
// A pack that would go past what you can hold (Streak Freeze holds 2) cannot be picked.
const packOff=(k,n)=>k==='freeze'&&((D.shop&&D.shop.freezes)||0)+n>2;
function sheetPick(){
  const pk=packsOf(SHEET.k),ok=pk.filter(p=>!packOff(SHEET.k,p.n));
  return pk.find(p=>p.n===SHEET.n&&!packOff(SHEET.k,p.n))||ok[0]||pk[0];
}
// Items that are bought once and kept (everything except Streak Freeze, Streak Repair and Double Gems).
const ITEMS_ONCE=['sound','focusplus','report','exam','widgets','frames','badges','theme_ocean','theme_forest','theme_sunset','theme_mono'];
/* ---- Widget Pack and Badge Showcase: tapping the price shows how they will look once they are yours (no pack picker) ---- */
const PV_KEYS=['widgets','badges'];
const isPv=k=>PV_KEYS.indexOf(k)>=0;
const pvMix=(a,b,t)=>{const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=h(a),B=h(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
// The same colours the real Android widgets get from the active theme (see widgets/widgetSync.js).
const pvTheme=()=>{
  const de=document.documentElement,dark=de.dataset.theme==='dark',pal=String(de.dataset.palette||'').replace(/^theme_/,'');
  const MV={ocean:'#8fb9d3',forest:'#93bda1',sunset:'#e0a78f',mono:'#a8a8a8'},ON={ocean:'#10202a',forest:'#0f2216',sunset:'#2b140c',mono:'#141414'};
  const mv=MV[pal]||'#c9b8c3',on=ON[pal]||'#1b1e25';
  return `--wm:${mv};--wo:${on};--ws:${pvMix(mv,'#ffffff',.42)}`;
};
const PV_FLAME=flameIconHtml(36);
const PV_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 12.5l4.5 4.5L18.5 7.5"/></svg>';
const pvSparks=()=>[[8,'4.6s','0s'],[22,'5.4s','1.1s'],[41,'4.2s','2.3s'],[63,'5.8s','.6s'],[80,'4.8s','1.8s'],[92,'5.2s','2.9s']].map(a=>`<i class="pv-sp" style="left:${a[0]}%;animation-duration:${a[1]};animation-delay:${a[2]}"></i>`).join('');
const pvMin=m=>{m=Math.round(m||0);return m>=60?Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m':m+'m'};
const pvWidgets=()=>{
  const st=D.streak||0,dow=new Date().getDay(),todayDone=(D.todayMin||0)>0,L='SMTWTFS';
  const days=L.split('').map((ch,i)=>{
    const off=i-dow,done=off<=0&&(off===0?todayDone:(-off<=st-(todayDone?1:0)&&st>0));
    return `<div><div class="pv-d${off===0?' t':''}">${ch}</div><div class="pv-c${done?' on':''}${off===0?' tdy':''}${off>0?' fut':''}" style="--k:${i}">${done?PV_CHECK:''}</div></div>`;
  }).join('');
  const g=Math.max(1,D.goalMin||60),tm=Math.max(0,Math.round(D.todayMin||0)),len=Math.round(113*Math.min(1,tm/g)*100)/100;
  const all=D.tasks||[],open=all.filter(t=>!t.done),sample=['Read chapter 4','Practice quiz'];
  const tt=(open.length?open.slice(0,2).map(t=>String(t.title||'')):sample).map((x,i)=>`<div class="pv-t" style="--k:${i}">&#9675;&nbsp; ${esc(x)}</div>`).join('');
  const w=D.week||{},bars=Array.isArray(w.bars)&&w.bars.length===7?w.bars:[0,0,0,0,0,0,0],lab=Array.isArray(w.labels)&&w.labels.length===7?w.labels:['M','T','W','T','F','S','S'];
  const mx=Math.max(...bars),h=mx>0?bars.map(v=>Math.max(16,Math.round(v/mx*100))):[35,60,45,80,55,25,12],td=(dow+6)%7;
  const wk=h.map((v,i)=>`<div class="pv-bw"><i class="${i===td?'t':''}" style="--h:${v};--k:${i}"></i><span>${esc(String(lab[i]).slice(0,1))}</span></div>`).join('');
  return `<div class="pv-w pv-streak" style="--d:.2s"><div class="pv-sh"><div class="pv-fl">${PV_FLAME}</div><div><div class="pv-n">${st}</div><span class="pv-u">day streak</span></div><div class="pv-mas"><i></i><i></i><b></b></div></div><div class="pv-days">${days}</div></div>
<div class="pv-row"><div class="pv-w pv-focus" style="--d:.42s"><div class="pv-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" class="tr"/><circle cx="22" cy="22" r="18" class="ar" style="--len:${len}"/></svg><b>${tm}</b></div><div class="pv-btn">START FOCUS</div></div>
<div class="pv-w pv-tasks" style="--d:.64s"><div class="pv-th"><b>Today</b><span>${all.filter(t=>t.done).length}/${all.length||open.length||2}</span></div>${tt}</div></div>
<div class="pv-w pv-week" style="--d:.86s"><div class="pv-th"><b>This week</b><span>${pvMin(w.minutes||0)}</span></div><div class="pv-bars">${wk}</div></div>`;
};
const pvBadgePick=()=>{
  const L=(DZ.badgeList?DZ.badgeList():[]),pins=(DZ.pinList?DZ.pinList():[]).map(k=>L.find(b=>b[2]===k)).filter(b=>b&&b[1]);
  const rest=L.filter(b=>b[1]&&pins.indexOf(b)<0),lock=L.filter(b=>!b[1]);
  return pins.concat(rest).concat(lock).slice(0,3);
};
const pvBadges=()=>{
  const pick=pvBadgePick(),nm=esc(D.first||D.name||'You'),ini=esc(String(D.first||D.name||'S').trim().charAt(0).toUpperCase()||'S');
  const fx=['-70px','0px','70px'],fr=['-28deg','14deg','26deg'];
  const slots=[0,1,2].map(i=>{const b=pick[i];
    return `<div class="pv-slot" style="--k:${i}"><div class="pv-ph"></div>${b?`<div class="pv-bd${b[1]?'':' lk'}" style="--fx:${fx[i]};--fr:${fr[i]}">${DZ.badgeArt?DZ.badgeArt(b[2]):''}${b[1]?'':`<i class="pv-lk">${DZ.LOCKI||''}</i>`}</div><span class="pv-bl">${esc(b[0])}</span>`:'<span class="pv-bl">&nbsp;</span>'}</div>`}).join('');
  const have=pick.filter(b=>b&&b[1]).length;
  const note=have>=3?'Your pinned badges sit right on your profile.':have>0?'Earn more badges to fill every slot.':'Earn badges, then pin your favourites here.';
  return `<div class="pv-card" style="--d:.2s"><div class="pv-hero"><span class="pv-av">${ini}</span><div><b>${nm}</b><small>${D.handle?'@'+esc(D.handle):'Your profile'}</small></div></div><div class="pv-sech">Showcase</div><div class="pv-slots">${slots}</div></div><p class="pv-note">${note}</p>`;
};
function previewHtml(fx){
  const k=SHEET.k,def=shopDef(k),sel=sheetPick(),need=sel.price-(D.gems||0),left=(D.gems||0)-sel.price;
  const isW=k==='widgets';
  const head=isW?'Your home screen':'Your profile',sub=isW?'This is how your 4 widgets will sit on your phone once you get the Widget Pack.':'This is how your 3 favourite badges will sit on your profile once you get Badge Showcase.';
  const btn=SHEET.buying?`<button type="button" class="sh2-go busy" data-sheetbuy>...</button>`:need>0?`<button type="button" class="sh2-go off" data-sheetwhy>NEED ${ntxt(need)} MORE GEMS</button>`:`<button type="button" class="sh2-go" data-sheetbuy>GET ${esc(def.t.toUpperCase())}</button>`;
  const cost=need>0?`${gmI}<b>${ntxt(sel.price)}</b><span>&middot; you have ${ntxt(D.gems||0)}</span>`:`${gmI}<b>${ntxt(sel.price)}</b><span>&middot; ${ntxt(left)} left after</span>`;
  return `<div class="sh2-sheet${fx==='in'?' in':''}" data-sheetbg role="dialog" aria-label="${esc(head)}"><div class="sh2-sp pv${isW?' pvw':' pvb'}"><div class="sh2-grab"></div><h2 class="pvh">${head}</h2><p class="pvs">${sub}</p><div class="pv-stage" style="${pvTheme()}">${pvSparks()}${isW?'<div class="pv-phone"><div class="pv-bar"><span>9:41</span><span class="pv-bat"></span></div>'+pvWidgets()+'</div>':pvBadges()}</div><div class="pv-cost">${cost}</div>${btn}<button type="button" class="sh2-no" data-sheetclose>NO THANKS</button></div></div>`;
}
function sheetHtml(){
  if(!SHEET)return '';
  const fx=SHEET.fx||'';SHEET.fx='';   // entrance effects play once, never again on a redraw
  const k=SHEET.k,def=shopDef(k),ic=isTh(k)?themePv(k):(SI[k]||SHI.gem);
  if(SHEET.done&&isTh(k)){
    return `<div class="sh2-sheet" data-sheetbg role="dialog" aria-label="Theme unlocked"><div class="sh2-sp done${fx==='done'?' pop':''}"><div class="sh2-big sh2-bigth" style="--c:${def.c}">${ic}</div><b class="sh2-bt">${esc(def.t)}</b><span class="sh2-bx">Unlocked</span><p class="sh2-sn" style="margin:-10px 10px 16px">You can always find it in Settings &gt; Appearance.</p><button type="button" class="sh2-go" data-sheetapply>APPLY THEME</button><button type="button" class="sh2-no" data-sheetclose>NOT NOW</button></div></div>`;
  }
  if(SHEET.done){
    return `<div class="sh2-sheet" data-sheetbg role="dialog" aria-label="Purchase complete"><div class="sh2-sp done${fx==='done'?' pop':''}"><div class="sh2-big" style="--c:${def.c}">${ic}</div><b class="sh2-bt">${esc(def.t)}</b><span class="sh2-bx">${isPv(k)?'Unlocked':'x'+SHEET.done}</span>${isPv(k)?`<p class="sh2-sn" style="margin:-10px 10px 16px">${k==='widgets'?'Touch and hold an empty spot on your home screen, tap Widgets, then pick StudyOS.':'Open Badges and tap up to 3 unlocked badges to pin them.'}</p>`:''}<button type="button" class="sh2-go" data-sheetclose>BACK TO SHOP</button></div></div>`;
  }
  if(isPv(k)){SHEET.n=1;return previewHtml(fx)}
  const pk=packsOf(k),sel=sheetPick(),need=sel.price-(D.gems||0);
  const cards=pk.map(p=>{
    const on=p.n===sel.n,off=packOff(k,p.n);
    return `<button type="button" class="sh2-pk${on?' on':''}${off?' off':''}" data-pack="${p.n}"${off?' disabled':''} aria-pressed="${on}" aria-label="${packName(p.n)}, ${p.price} gems">${p.n===3?'<small class="sh2-pop">POPULAR</small>':''}<i class="sh2-ck">${LI('<path d="M5 12.5l4.500 4.500L19 7.500"/>')}</i><span class="sh2-pi" style="--c:${def.c}">${ic}</span><b>${packName(p.n)}</b><span class="sh2-pp">${gmI}${ntxt(p.price)}</span></button>`;
  }).join('');
  const again=ITEMS_ONCE.indexOf(k)>=0&&hasItem(k)?'<p class="sh2-sn">You already have this. Buying it again does not add anything more.</p>':'';
  const btn=SHEET.buying?`<button type="button" class="sh2-go busy" data-sheetbuy>...</button>`:need>0?`<button type="button" class="sh2-go off" data-sheetwhy>NEED ${ntxt(need)} MORE GEMS</button>`:`<button type="button" class="sh2-go" data-sheetbuy>GET ${esc(def.t.toUpperCase())}</button>`;
  return `<div class="sh2-sheet${fx==='in'?' in':''}" data-sheetbg role="dialog" aria-label="How many would you like?"><div class="sh2-sp"><div class="sh2-grab"></div><h2 class="sh2-q">How many would you like?</h2><div class="sh2-pks" style="--n:${pk.length}">${cards}</div>${again}${btn}<button type="button" class="sh2-no" data-sheetclose>NO THANKS</button></div></div>`;
}
const sheetEl=()=>R&&R.querySelector?R.querySelector('.sh2-sheet:not(.out)'):null;
function sheetOpen(){const pg=R&&R.querySelector?R.querySelector('.sh2'):null;if(!pg||!pg.parentElement)return false;pg.parentElement.insertAdjacentHTML('beforeend',sheetHtml());return true}
function sheetRepaint(){const old=sheetEl();if(!old)return;const t=document.createElement('div');t.innerHTML=sheetHtml();if(t.firstElementChild)old.replaceWith(t.firstElementChild)}
function sheetClose(){const el=sheetEl(),had=!!SHEET;SHEET=null;if(el){el.classList.add('out');setTimeout(()=>{if(el.parentNode)el.remove()},260)}return had||!!el}
// Picking a pack only switches highlights and the button text in place (so it can animate).
function sheetPickUpdate(){
  const el=sheetEl();if(!el||!SHEET||SHEET.done)return;
  const sel=sheetPick(),need=sel.price-(D.gems||0),b=el.querySelector('.sh2-go');
  el.querySelectorAll('[data-pack]').forEach(c=>{const on=+c.dataset.pack===sel.n;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)});
  if(!b)return;
  if(need>0){b.className='sh2-go off';b.removeAttribute('data-sheetbuy');b.setAttribute('data-sheetwhy','');b.textContent='NEED '+ntxt(need)+' MORE GEMS'}
  else{b.className='sh2-go';b.removeAttribute('data-sheetwhy');b.setAttribute('data-sheetbuy','');b.textContent='GET '+shopDef(SHEET.k).t.toUpperCase()}
}
DZ.closeSheet=()=>sheetClose();

/* ---- Special Offers: Early Bird Chest and Night Owl Chest ---- */
const CHI={early:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI4AAACMCAYAAACqNZEDAAAs2ElEQVR42u2dW4wkWXrXf9+JiLxnVVffZ6anZ3Zm9uK1jS8IL4vXgAQSslYGIWHzgIyEBIInXkBIiBd4RiDxzpvfzAsCDA+2kMBGi2xkhDHSejRrz/Rcu7u6bp33iHM+Hs6JzIjIyFtVdXXPbqU0u51VWZER53zn+/7f/7vJrbfeBSAiJWZEzMjEOooiMFzSSwEHLpOOTek4SwdHwvVr95VUACS8FwwzGjw3iY6iiKkxgAioXs43WsTNpG8zOs7SxBEDSiwiqCoxI3p6GH3rm7L3S3/hKw9v9bIOOFO8TZ3f7nbvEUEVFOOenkWjf/9f/+TR738wOhtw2zr2a26zeqXrV/36LASpKQPZc8fd7/5C7+3v/MwbvV5zZlCHiOy8X+X3gmLch4/t6Nd+49NHHx4NzsbctV5wBLn91tvETOnq59Ff//P9m//wV3/u23v64a80OXkTNDrvJsr8RgQkshNufHzG27/+L//tf//ef/7d6dGQ162jgRJdC845XoaUiDF9fdr8x3/7vW/+0nfu/v0On32jwVl8OesnKMaO5c7HHw/e+PV/9q9+63v/99Pm0Zi7VomJE5nRdIfyF36mv/ePfvUnvr2vf/B3YkbfNqT7fif1QudD/SXUMP56wln3n/7dP8OT0//12//zj45PphyopV0xatevbV4RY3r6NPoHf/PrN/7aL/S/2dc/+tmY8Y8ZsuRy1lJQUKOzr7/XG3T/9T/5Dn/vX/zOb39wNDzJ6GosOqVJ2vgbv/jn3unx0a+0efpthduqRCKXo1gVMMyShMG3MzrDv/qXf/LT//393/vDVHrTXHB0g1K+flUFZyr9mL3v/sWvfqujv/8rLZ69C3S4RGzqv2eWNHTw7Xvt3uAv/fx7Hz36D4+GTpozY0ilAb0377W+hqbfULgBFxeaXBi0eA9ww2j6jR/7ys2vNaAXkV7Lx85H0S+Z0TR56zXe7MaDXzak3wL2i0JzGeA4XCMCt4dO33r3wf5eg1lkyDCCSyJ40O+Y7wr2LaDxAp+8YbBvtZPsuzE8EOy1a3VujGOlldCNmLwpuL1wMOcCcxkHP7+GCJFIttduuIcRdAQrBlQEOuAeAF1A9NLQhuS2cg6TjUhX4KHAXgUZX7920+EmHPIGqKlu9qXsXriYKgnoA9BfBB4ASZzfhKBx8QYu70HLIizORi073evNeFt5/sGUxnw1JHxcrw3YfC3mK1leE2kzu9HLeNhwadfIi1kxXdg7ATqq+iDgKIkXe2rmd2fmkqaXo+50cSOJy5K7zB7+87/13i9n2VfUuYNHgK0ngq5fqzCriZ4+vHnz0S/30smbUWwTzAsXZSNi4hxHzQXHOa2TtMsCWIsnVisdne399IM735HZwUOxeyMUd83ibPJLyxBHk6wT9U8fNtzzPdSJu0RsU7+R5QvH+T0ZY/Db94KWQArmS10Uqd03LvumcZmrU83Xr/VHybnMiGYRWAP64gRmhe2M67RMHoa4XHtZoJVQBGcinDFquSDP+EMtOLJKB6sF3OUFpbYR4oLwmDo8cV6hkQ3wRPMPNBKcFj0E3fIKP9JeVK0uehH7VD3sWgiqFl26K0EWKuAEaDSg2/F+3NV89ZdfdCT8d9X6TlYLabyLUy1bfq7+d4I0GtDowcR4IZqbqGtYvBHm5P/Wi6+U7iQ8PkdDNHy9+vswW9+8rCeJ1t2kE8E0GkSdLhhT8bauTdOL2vTL5XIU1QUIN5d34WU1582TIM0m0l0IzULgrjHNzpIiV3HcyvtSt8Nm65vfUdRd+M80GphOB0wUjKZspamuXy9RzdRYFBUQcfMbireVv12FRgFptipCs7iac+5aIHYVni0xzqYMv10kVVXRoF8ObvTCNrrtBGcX6XQoihA1m8hcaAj20azROHpttjYJg169SlIEJ0LSavL6g/tzXslc9BAUb9mp4giYpiA0IEFQqn8R3ueQ/dqrumI2aLOToyLErTZJu43O94lL0DhBHlTAIRVMEz5Qk3a/CInXEAfX7nm9TinYHkU8r3xJSrrq5HjeyBA1W9BpY2VRY7E1xtmkPnNyTxoNTKdbFprge3tTtRCMXAU6BAmKT+fmqiA4oosAWzXv4kf1PYLOzX7ZA9olXCSVQ1x8b1WIO23odCmKTP7aKDibbiQXGlMRGtVypLakChU+f/yYxiQmSic1eTjXGmejhoiPaKRH9F5vXgSU1liCHNO0od0pfI4S/xZv1ii6GgjnmKZG05RMZhXeS54ZaDzPI15qrhO4dhAcEZ+7WfF7d4kzlgLbBaGJ2kFopOzJyXyvLoBxHDpnhJfNk86lUwqJq6s0iNb6/NfaZmutcUmC6PBA2AtNGT+pFpjjTYKja3ka7z3NgXAogin+VfFAaKguXOg7RXAY1WtB2Yn9W2Rniup8LRcH9Xzf4BBMVdMUvlLy/PFwyuNdhTsn95Z5GlkgkxIQrsE4Aq/du0djco8427sGuxvfL4MIlyTI3hhkuARZRLYXIhUPhJOKptnEqu3EHKv65OB6nmbxaQ9hZC1hJShGNWic6gJdv68VmDlWVK/BUSgw8EWTv05o5sIFOIz3nnKhWdTfrtF+O7jjYatJkia09kBjsCErTBxgg4pTtsnok/zmri3UTq7znKWYk6fbX0HUAAZRCQUtQtxuQrNVvPBWr3jhyizzi7krroFkNnEXpMuzD44YDWeoKu1+izsPbkG7AVF6LQkvHf2sAqYC2mQ8zDg7njGbeUh6cDehdz+GJiAZ2yaex+u+2AuNd/uiqM3ozPLRDz7HWDDhrkenE549/ZQ33tmj/1rf/8JwhbmwP5pCsouuEhWQJk8/G3HyzBuIXE0MB2eYz89455v3iPdiMG4rrWNKxqOiqTS4aSbqkM1iHn0wJM4gcsFCqf+3mcBnPziDkfMq8Drw/eqYOBXQBqdPx5wcgli/b8b5Mx45YAQf/r/HMAsioTsKTtHzcYAag4mbSGefLz4/IVIwbpEAK7r4cp3CZ4++ABdxHeW+XGxzsZQ3Ay7m8EmAn4551YCoIA4iC3YCR18chV5am8MWpsy7GM+uaGAmkwTp9oGE02NQV0DuFfxrBE6P1IPmawr46gHzKhPnIJ1YnA3Yt6Ac1BfzzwOog7Ox76VVUSL1glP4vVPFqaLGM8JxtztPwtoGsrjsGhu/ci9jsLrGsS5srLVBHFU2kkCm7POrVx1JgukWwgjiaHXD9QoOWBUPdfeBSK+l5yUAZpGKMcsRhSitvS4ZZUNQt4/tbuKRs+hG58b4GEQhsTxJiHu9gtAoGMvB3TbOgDMe3EhB3fmfw617fSC7rue9ZOFQNidjVTGJA6wIpt2CvTYH9yO/T6I+IStULSC+iNhGcO+NO4GT27x/Ju9O6QAaDUy/H2JPuVw6MBm33rxD75aQRWXJ1fDFN+7F9O8fgMkWN3X9uhqMM8ebi/91YjDtDnTaEGfcf/c14p73Xeb5N+HAZzE8/NoNpG1AbN4DYguNI2CSBs1uF6rlnsFUYVLe/PG3ufOwg2tCGvv/XBPuvt3hta8/AEmDqruuYrgSwalZY58aYUiabaJ2x7s/xkFTefdPPWT/fkIWQxr5/ZMOvPPjt+nd3/MEoOhWexcjBgUa7TZqTAhyGUKD4sJdOogm3H7nJre/cpt0MCKKY0wrt4tTTxLMZf5acF64Gcv3SFfk0xQNnsmgpdz/sXvc/4YhHYxI2k2IowAvZjtBjDg3NyaKQ/RoVVvunLCxoEKyHwV7OF1opmvz9NLs1cZ8miA8Ejbc718KpLUCKdt4VVpA3CVsUmWf5r1KNERotSRXi/fX2uZqoXMhn6bT2cwWGiraZTlveSt3fK3drLuAVGqj5u/NhYXmokzpxZnWy9nIq1Q5Nmga0/ZdQCi046+mh4YfbmMHN5uqnS9Q/dmqLyk2FvgS5FAsUl11J7U9f9hi4tKFO9hsWi8J594QdTrQCRxc5Qpb3/uOr/hqDsVyvrHmbWxl+RHqu4/KVg9brT/a7TYVNRNc9DzYfwOugbE9RBtbbPY5G/FprW9dWbfyNX0dm/XpLO02yPhyx8a8VMGRBR21sq4qb2uRY6dCPEXn7oLUX3xN3dHcE4RFF97K573zGNhPcSAZWfyM7v2nxPsZuJjnXwj27E1MdrOIRGuvV/teiw3Zqs8TiNTq81K8ntQ+vxXo3+lDbzRPhVDnXigNUjR7V6NxWF9XtfTZC2ic8unfRvXk3TMnuPiYW2/OiG8PIT4GTei/dps//uz7ZIPbiOuAa+ysyhZJkYv7kZpbWB8bLv8yazyh3zvkwYPe4hPG/JBonLWma1FXtWp5yu3LZHs1pxWNtPHl0HhA++4zbn+1BdGJV/1mBq2Ih9884I//8DPc6A1EmxQSN7e6s3lxR+EeZZtHWCM4Towv/XcGItke9F6SxjFX9UW72P1632TbqE3Ro9qgacSiZoxLDmneOOGtbzQheQrRJGSrzSAeEt844ys/0YbWE1x8hJoJiFvkTW/w5rTmM6Wn2coFLD+/1InfFbL18YtVLIXcD7eprqrGp6hG4IMGWd+BXue/11ohyxsFWZAZGh9y440Br71roHkMZuyp9/l9TSE6ITlwfPVP93n0/U+ZHN/GZAcICWi1cWt9g9nqT3VLB23doRStBCSvkIB9ORinUFcVZXuLjc6j7ivApgawKyvA7hIYLdYlifrgnVjUzHBmhGkqrRstkttDr2nMJCRsF2/cQTQFc4Lpp7z907eZPWkwOrYY20JcG3ENREO3+qL6WAJrVfB+/rqrrBER76f4gqWrpzleDsZZUVe1aL9SX2e0aLLt6n/v8io0N7+eCWSYqkVMiosGuOQZzRsjWgcjaA8gGoZYmyu71aWuGTZ8ztJ4fUjjoMv4qMnsrINJbyJZD9EmQlS6f5994JYsipZigZvqqtySAApaGPMjK03jD5ngLOqqtioZr3rb8zcOJEXN1JuePFdWfCmyiMXiQkOgFImnNHspycEE2meQPINotLzUtWWQLmifDMwQuh3ajVu09w3Z6RGz4XNcmiAuQUPd0qJ9iyscjgSxHYTGSle7/NxacruKhMaLF4+XLjhrmFDdQJSu6PObC42Lz5DOEaYxw1nIZi5smKPRBokzokZG0lZop94cmakHvmbGcoewohvkagQoqEUz8eYtPiXuNoi1CTODnRrcLAJtYGe+12GjZQBLFEVkozazo1vE9ia6lNgva0COlBdBt3Xcf8g0zrkY75LGsWg8oXMjQ+5ZiEeB6TX4YXEh1cNMA0aZLIDvWsKlItOiCwWkRYFSr30YLRzUJCHqNIhcA7RB4sIAQJPOzU2jf5sos0xPpgit1Y5tlU1+xV7xqyUZaxaw0oFdJcOaM2RvBskTSE5qHF4XcoTC/xu3upO7aClLIGfvtaTp8gaYK27UpD7tRKbkcSQPzApFbq6Bad5ATQNxia8KqVmnRWhPKHfE0ldCll6C4FTHorMG2C1A4nIZvENN6rVINIJoUKOrK7EbXVABuQNU5FFMDCZepBRIbqqcohayGRhxcxAvmluzAjMjayohVSGa4WSKShb6s+5i6sspohc+lK+s4GjRXusaqk7XCJuuwECCaDQvIKuX05rrBoGx4p8+aoFpRJCYmvuUwndBgsA0Q2eKneBLoeflzluIwFyNScFtlx03v7CeL7Fb66uBcXa2WwXfLHPbnVrRRZPLBOJ2BK0olPPYAvZZLaioQjtCmoa4DYwz7FhDRUmFg6qSdTuyuq96LuUVRMelsuFVYl7X/HG1ZYpsoOOl3okLAmNjSLpAOwmn1S5ObvUP6nKOco7IqJ+/mxiijsAoIxuFKEWJ8s6j8OVglZa6kOnui6qFqHkdj7OjoJ7HsX/BgpO3hqqL2ip1bVDLD7N50JHEG8JtBiwKCST7McS+3GclgbQqp0VYFrCQbUc/IW6APUuJnIJbB0MUMboofNuR0KjnKNaw9F9aU1W7EZehiBVHVqiskJojpFiBqAP0kpC3UsQFRd4kxx+6ukhDa8Cu4M1cKyIyEdlzi5mB0ZrNDW68iTWYRt1RbLR+fS+oQWSX77sacFxwHecAMgMzIzMDouQUlYzNYyuW32s0xCXPoRGERyvknSjWQNQG+nFBy6xQBU4r7XS3FfTQDwgLDUO8n2BPUlyqvodQqe5WQDKkNSWNj4gwSDTZ8LzFWH+upYUsPgu8VMTqvjIvjl2OX6zcaCVr1JcTEz+ncXOEyQ4R+3yBZ0pBPamJhhcSocwEE59A23kGWMon3In6LlP7jVBotkEASvkOUsPibtM0xkEsRP2Y9CzL69vKf2um0DsluY2v8netnQ+OIJh4iHRHYJJFpmMdlVHrVFwcml+BV1UJGoqFaMTBOx1wcRjUmf+OguBQkwFVPL2RL3ienYb84MJji8NFEPdjFrun6yVGDbjEX1NjsueeEY77nWDi0nAtu3y9ojkWB01D0jNkp45ItJwGIinEp/Qe3oSoUk+9tLlr3puGXwMzXYB8ro5pvqJ8nOLCWZ8oRQqMLtBLx8L41KtrbEFoFBtB3I8g1nqhKR3gIDS2RfZUefzRgNOnReU3Y/8O3HurR3w7gSh8n6zIg8mbabYj4gyyoSNyufDkntwE3BG0LT48cp7Fdaib+HiuFB0NCSat0Kh8Q1rbq+dV1e2UaOXksprAkxU/UE/ZWjckqtp3A6YJtEICutZnRc0ZXxeDbXP4g1O++ACSDJJCj0MLDL6Ak8MBNx7AGz9+ENIrahplzr3IALbbMW4y86JhF4w3kuF0hDGJ9zhFzrGFimqGSLQl53W5r3Onju7WjWJNL+MKkV7t+KWlzhe64FPSdNmbFcUCphstmiCK1Aqm5NUVtsnx+wOevA9J6iFY8dOREYz1vzt7BJ//wTHYZn2+pxYTxxzEjrhdhK7FPsKKTiaFZ7qI15knkkptZs6mzNTzFC+ai5uhHYQnxInSyWRpbXSX73IWO50UclLCCRSImkAim/u8qIAmzI6mfPYDSxKaYhqt0CvOu9bGQpzB8WcwO5r5aoc8E3HV0huLaUcVDmhxvzadgs2Wzd25KOarrV01V/ZN6u1DNhpgp/lJo2SDV52j8oFWmIwRZ5fKn304QQru6Zo5EWoga/HFRzMiXXRRXXsqg1P46P0pZJ15v7x6ULogCaOWCSRvIfqtSqQOnYwX8asl3uc8lNcasB0m/rxcwRHZ/jOBWNPxGDeZYnYqLlnQ7AKQZdjZrNzKn0WDJzqNYg7qGm/DgDY5PQytW6kfHFbcvbzL6uQMGGtB46w5LaKQiBfq6j6iaJYF4XGXGKBaoX1UMZv2TWSr/TXnFpp1klsRGC80I+x4Mj/ddY+5ZKW1ooqdxY5HmJzTl+IWeEoDshVKpuLhqSE7GmJckXPaTtUbB3aUBS1R9aiWcRcNg6vLElX8s8wmkE6WNeULtj6qNSXLqluZzu29Ki3wHWrKmffiFpgiNB70QyoEnFfH2XhCrIUMFN2iBiRnnDXgmuGg1kTlVi9KwlGQbTRY6POrmwG/hK6rHlD7zc0yS7TtJL/IR+R1Wk/vizqYhNrvpOEfQi7DKypcw4Ub0TzBLPwmZ70lTIrfepbDFrhrzgLYhOnJmOMvTknHGSJC3Iq4/9ZdH3GOUjQkP3lX16GTEdl4vGAr5rkk2wSDFmBYxyPEWUwulNURfKGR2Gqh1CU2WEOqxXYnU/ys9PAgcWwKcbLN8mPMKgFe8ANuNMS0HDRaWwmPbHLXcwQpIZ3WJkwOBzx7fIpL/UFvdZvcefsONE3o3+guQXBUMSa02Hcxz78446P3T4ltSGNBccbx7OmnPPzqPv3X+j7yG/CHjkdkkwlRwalwum1Hh5xISclGI0wQGr8QUm9aIlNvLmp31hEf9CAeounyrruQ/Lc0V1TUV932m8Bw65NvosKW1FVRKBhR7HiEWPUD5HSXKb91QqY+cd8Z0ITP3/+Eky/svB2/KgyPJzw7/Jj3fvKeJ02jnWc51Pwyn2zmYqbHEx59/5QkLc9yyDmOj98/ZXYy9W0tncIoxzRaMgflas4N62At6XBYEprSdZa8jh3QpfEM9v7dMsbNb8uYMlQrWuz9O0DLLmuc9ZaxxrHQsvYNdWAum0GW7hBRqvce54llNubww8ecfGH9oQ/7Z/DkupnCB//nMaTCOWY5rLo7Axrx5JNDYoVYBTPHB/7fkRNiC48/eepd1NGEbDzBVIRm55ezPuUFnWOL3V3SlReHaMqD93rQ8CEqx+oGZD6UoWQx3HurEao+3eWg13UgdZPnJBtAhgq4iMNPJ56nKhz6vDQtCgmQx4+Pg3bafAjNVpvgIs6O1/McRmFyAgwmuMkEo+7iS2qikO2woSedbKlril5KHvrowJtfb5DFIX15xZ5m+H7Ab38zoXErCRH5y05byCstogCSVz2ALKe1Fj2FysFPT0ZoWr9/ReV3cjTyB182g36z0wmuTS/QuVujGTCZLPJvL0pFGEPS6eQFvZuX3e2a9O2AlO7rN7j7wNQe+DmtYeDem4bu6/u+DKbETG+gJlTqMWdpIIfvGkqckPR7K7SJVu3QarqhcKJkI8TefbfMdgtsaXbWJCaE1qi9fsAOl8JkBS0TJ5i9fWwUFeZs19xi8Co9YbKOva47E8p06tbzmwJpVpcTusWzivjpLWue1U9VbmG6vRD4hPriIUd5CIOuFwYDca9VS0BWX+1uVMFtcgHBCQj4zut9nPFlJSrl0hUXqqP3DyKvdi5tlkNuxw1Rt4eaXHiWCUjRML0GU/DLt/yOmXLyrLCJWl78POB9+BifDaI7XF8VnGDTOgUS3HwRJGkgrfb83nVtB7JNmq6SiNaAG/eisHdloO9EsUYXsxyMY5vI+hYr4JO791+7wY37ETam0B05yL6BvZvQ3W+gJS5ALiYw86MvYCJMt481sReeonCEo+TS85DhEaOnAx8Vn3tUhqrnLOpB5OjJcHvBybXGzK6MufpYa4x02iVzI1vFoArCvUq1hnEKr7/zGnHXh2UKs+oqsxyirUlAs90eeuF57Wtv8vo7faQ1T5Sj0YH7D2LuP+iG4+gu0N9nwwkyEXG357EAZUAyH0Y8zXYY7ehH35w8mXjPQpcZ5EIKM5GFkyeTULa7BTbIC++m1oda6kyYiJ+5MM/L2SEBYpt1zucoNpV3f+ohd9/ulWZxtA7gvZ+862c5GLu1tdg+5BAaDO0/3GP/wR6MJuhkEnrVZCCTReMjWf1kq+NBa9RvsT7LGKJmEzsZExViZhJiSEydL7Sri6kVc79VvAcxdpwcQsOtgyiCohgHJ4fw+kwhNoupqLIGo6lgpxrGeBWIIWNwCFGr41NAxVwIGkotKC9CCj/L4eCdGxx85YCl3j9mVshd3myqdhAcDU6porMRWTYhMtuBw5zpnZ/mrVhjWb08zRZkGWrTQhBcEFWysRJ3fGBxZQeswukdDkbz7FJZIbiuWK3hYDoc0+xIjQWpCKoVGKeFOZiLzylhnlSScL5SYMq1jlVBqdu/aqcO3eShXQjjFIx9HuWejInUVRKpNsV6djkzMgeItY69GKJWe+l3gngqfWwDkbWC79AFDohigysufsUdd1qxEAZMbOo9qqIPH4i3bFRT6RCeK5mbqAVQXgvsdQsSkWJ0W7fntVZW2l5E4xSEJpsshxG2+fPtMha2LdwHohjEoM7N41d5zk42hqQl0JBSm/o689s66NG9fcb4mU+uWrlfQRbaNyHZa4EMSlpoqTO6GhjOCiUyy+43cTJXGfPY2w4AUUTOmXK6irjc3pnZbpaDAqMxbjr1mqbSomXT7Rqp+dwWaRXCwryVZk6GGzCNBm7qFnEs8eYqcqEc91biQxVGyiewuEHRhLd/7gZHj05wmVfBxZQUKTRTj9tw4/V9MCPm80uXTGBwVVKwo5CTL+UT7VNAkoKJyf0o3elcaYForW+ZsikDYduS1V0FJ0/EGo3JJmPf7DEAxXODODWIa4LtgW2wtjwk7NzSaAsNqXgyQdyxj9K52dxEGMBmij5PkX7smx2ZOpNCqPAccPPtZiEVtKbqILTsxwwWJJzWe2lkhuwsDZmFVXNpQpPtPqTd8PznoC3EYnQUPF71zTFFzqU9zvOKt8U0Jkh01UnZRveUez4mRFkfjvtg90CbZc2pKwBg6d8SevgNfSeI+DC0S1sIls/Sgzhy0I0CrVz5gmIRnQne4boFN+uCrTL31OzpLNSP19FiiX/u2Q1w+0AryKEuq+a6qpn839HIlwD1U5ApRrZNxxUuozQ43oxpxkTopZHB4iJIOzz9ZEiUdUKP4IU5kEp7mvxnGhZW5nM0HC5O6d9tkBwkZY0STFHkIHvuiMX3tfFup9SHDc47nUcLsShnyM5mXqaLwLxk82KYdTn8eIpJLcYW86YXuc1aEKS69cnilMa9jH63EWJnlou0Gdj1z+JVmEaHI+x0sqXQ7IKUI7Atkiwhmt3E2N7Ody8KaqZY10Qmp6AnFY9igRk83lGiWQZ7SQAdW9xzHVAtlfoWu2sZyMCeZUgaNI2uCHxpDJMWyaxFNLuNsZ3zFbOqwdhp0FZmw05f/NRX53jF5b0Ptns0xk6nPp/m0q2jgMYY1yCybSTrnkPoFdXQiDqbLRowFjdVFpHhyPnWa2pT4r3Ik3cmPO+qunLVGgKxmMNbyL8eZ6RD9S2Qq0TfUqZfBK6JyZpEtoPY7lo/Z9WWm2jsm0/iuIpXlVKJix5MDAHThCSsV7KhWDFJKSKbKTE1JR1a5k2MU3QG2TNL3PbluSRRoXRTl2HAKtfY+eQ2phY3StFZXmJDJd1T1oL+i6ej13fkusiSbmur4vxthJCOxuh0QoR7ZcexVtdJc89vg5kRJDQEVdxIsZOUuA3SEGhEFSp0TaduqzB12KlFp17DRJU+t8vJ9NVrOzTMYNALWxR54ZrGz8Eq318swVmYjUY0JxOaL8Q8XbapyxOeM0/0ia7HJqrz8pa8ckusokNwI0/FRwnehEUmJByzcLmtBau41KduzKs6leWGkRqqClZpK9GQ6GtrEusvD5PsdB3ZgG1qOqrFBPCbFszTFY52PL/w5EEJWUW9LyuhhakJGqjQ8k0tOHHzQG3RZOWCIloY1L5xv0J1yKJmZw5qiZu+1a4uc3DKl2HdZWGqirroyzF33mMc0Th4FXX5tmzIVV54RiI+gr1SURTd7yXtFjTTXKVHgUw0hT7MIQrtGjBNAg0Rlbvc7Sg2etkbtRbr+AoIKQpOkd7/0rzUIK7B9HlE++BO8KzyQKEswO28UjEL/6WB98goNmSaD3jd1iWXPCMq9qSeNkAT/59LcOMUkbgwCE09MJh1GT+V4E3FC8V2bnyj29MJ5xYm30n1s08f+6BvUXC+fC8DtoGODxj9SUTcvIlzymyaNxvyoZE4AZOkNNoW055CbwrRsW/hb6aLaXhS40IXgXcVIDrxwmJ7MLsJz1vMRk2ycYydBU1YKqjKyb0YcR2Ma1bmOJzXRV7jue2iYWQNbW8ds9GIk2MN2tF8iQUnnwdlIxi3sBO/iLGTUpcqnaY4M2E0GOGiATQczf4+zf0utMZ+9tS8tVwN71Kqyss1TBNsB7Ie6UnM7LSFm/SJ3D5kbSKbLJ3Jen5Gg18l59Q258jhWS2FNTfowDnccIBL+4j0yhjny/3yZII6H0E3xhRmias/+a6N2IQ46qFpSjpKmT57TudgSnxzBK3HEJ/VNGGsW+A2pHfR4x7DwzbM+ogL86pchLrIC+42bLvUEIsvAevWd+rw2f9uMETTdB6rXGaO4RV3w1etf7HqoVihQKnDhiHxGa65obN9Jocn6MDSu3sT2Wt64ZlXaFa7NjXAdWF6wORJh/SkTzS7M2d+S2uoy5vxSiLIPIepUIDnUzV8Sxk3GKB5yzwpd8KPd4Bbr6a+WdWAoHAURJa9EHENTHYDHTUZfvyc9q0B0b0EGocok9A8ARZdSftw9hrDx210vE+U9X16CMundvl+6viZIniVF8TjbKJ3Kq3w8rWyFjcY4mZpqWuMFsjqL72p2sYlrX7GC1uEWD/BF9tlfHhIwpjmPZDGM9BxsPGJB8CDGww+ayOTu0S26zVQlSi7VNb3as3XvJm502CeZkuthvJnFKnBOMoP00u3ECTjg67ZPukzJeKU+DULySykhbZh9Dqjz1vI5LaP5mu0UQueb1V1wS5vjX3OUcJbl8aNzDUN2aw+2zvkIqmzZcH5MgpNsYLi/BjJIK5NNIsZH1p6zQlyI/Kcj91j8riDjg4wtuc1VHFO3aXbdr36w6V472kwxKUzD4S1fq1FV2gcNljm836ymOB21aZqO+/Gt6+NspsMPxN6o7vQVCaDjOz5Hibr+dHPVaG5dOGpwz6bBE2Xid9SqfQaktAp2Aw3HOLSlCgk39dmhBT6McZXpxmW1asi25Y/XAG4Dm6862JmDYaHM5xJgQhjO6CN5fGeL8wl3aIzBxu6g248ULokNIZF29xNnfbiXZTm6nOgm62BFmypKtM0xaQpYtOrFpWlQrSyucvDFgkaEsm92i53cteXJu/+/jMyEqelDu/LyGrNuDgFsgw3GqJptoj0c9klwBchJEskp7epz46OMdMuYt3LWfw5jfFqIjstgWRZKj3MGsd09wcc0N8R/+WpIhk6GkKahn6AWi3HX2sM4stVoCs4ppoLOWReK6XycjeoRNQVOJjS+KydVkgv684KSqYyj6uwfivDD3W5VUFo3DAwwuEz1X3ahCDM1R2fRQm1GrNcnVuPHK4E42zPx1zl/W1TI7Xj8DL1mMYGRtised5NvFR8kUfaZaKkc15MJYphfw8np8xbCGl1Ql61slGWVDcv4v2Sii9O6Fvcn2h+T7rofAGLbg+6PHx11/uXtaYr7wNe071UVwylLWgasmxe7qzn9Favjjk24ifCtXowi+j0OjSijq+tWgJzstTPegnTclnvdf59GgQmz6BxuJBuurg/YTHqUZdusw6Myvnuv/b5F+uTJW2ajWQZuyx5VbpknurIvXkDqS15sXgXle7WtqzXJeu8GHHphSbq9Xxagij7vS7NqEtUKo95ccNHt/MdTQVe1PuVstL/eNHjDbUAjieYZl4e4wqCW9ZDUiM0VbksYlHdMud8a8HxoDvMAnDGJ2Tnsw3EIuT5umUVqAgaRUTdnm/Bmsp8wp2gKzpEvEAcUXvU8n8X2k6s7fVbp1n0Bccoy2kYmzu7BvbX2SA0GcZFiIb2/ItjDWJ91YXkw3cvU+MQgW0wHlpODqcMzvzPe304uN2k1UsQM0XFFlPJg6bp+7YkBfu7Lpr9QgWnagKWGlHq+SVSX6TGrFxfloPcS5N3spRsMECs9ULjWjw/nnB0OGM28Y3A+ntw+16XqOn8lJLLmOWwuAkfCDx6MuLZk3mDBACGZzAYTLn/RkT/ZjwHiE4AE8xTFAcD+qqQJKvSGc5vOl6IwCydI1nNeVR77DgXhMZh1CAu4eM/GTAZhMYbofPt2REMzoa89iCmsx+jdbNGz+WOq0E0YXiW8uxxZXpy3trdwhefWsaDDDTGqXe5o34P5n1gKs+qL8vdLXaMPt/sy4tf55K88QrpMheazJKdnXlNo4K4BkdPxguhYTEfzCiQwhcfZ6iNgynbXLpgNt+/b0n29LGdS2m12UPe8fPomfXgN24Q9/q+45Ssj0dd7STJF4iVXjbNnFd1WEs2eI5Y73KLCriE48PC/IZiFw0VBIPN4Ox4tBCJixCAiyrFmNl0PaOowGgEmBZRdy+0KStm4legpFxiH+2dsQI14e1tet9pmW+Cy6nd3uTsbbtOWUb2/AyxBZdbDZPhzHd213LhhgSsmSdxnZ4yby61aW/i8xytVVkEDpBuF+K8jkmW65Qkg2hEmhwjrZjInr2wtd9+g2S1B7MVtrkitqAoI8kZcXwGpgFYcI70+XOMy+qHDi9btprMyAWM2BRm2RAd9xWOSOY7xA5XC40KdPaBpiwM6dyFKczjjqbQfMr9n22CGwUk/6rZnVco8KlSZwZ8khkW4udgp2TDUz/Xq+oliqPVbYFMNsp5t4u/Jro+yKmbErnmaizj9t2Izz+0i0JJt3guDa3v7r15y3/xunE8YiEeASOuX7sKT5nL0SxFHKTB5ZY8RWRJe6bcuOWbe1dL2ZFAG0Zw81YHZLp6DFbhp2a91+qHtKrJ6O4l9G6GAXiVZ8oiuPNWh8ZBO3Rh2Gqi6vVrC/PkUZWrHRkpqtjBIGiavEdjeZyAigMz49a9Fo12YFaKcC80mL/7uoE48/u9aujEbhgnAEJjuf9Gl/5eyuEXM6ahi1i7D2+9c4/GQatm+JdeC8FlGNI8pJNjxuA92eHQa5pV/ZkD+61iMbHw1lf3OHp8xunRYnJjbw9u32uTtACZLUbAXk4+jnhK2szo7Bse7nXQKMb0+6GfjPouoOL4EvRI+VK5+nn+8OIYBqEZDKAiNOsgu2f0R9y81+Tm/dxsaKFVf7nFi9TNTy/8O95O2nPJzULA0hJ1G6GEpFKtqNdG6vJNV5h+7DwjbAeDUmrEtvZP844dMG8vvW00vDpWIN6YL1zI21ARNDLE3d6cp3lVObEvJabZRCE5WxIaqciWrOlZuWl/t1CAeSNoVzRVpR/WaR0HaOTnRZFPPLmWlKvTOLYgNDX5NCKsNjOXI9oj4BNgpB5jS/GHwzpE6wCiiLiXCw2lIqnlCNMi6Hb92uJl1hzCEHvKhaZ2LsYLfjklFZFPgP+i8ImqpkaJUgufZNr8DcV8BMxKfySFfJoQe9IFZF+v4oy5FoqLHPIQ5bbDAqZxeuXOqgjWIWdOmo+cMEIiNUqsU2Xw/odH7zuJ3wee50pmkbnXn0e5q1UBC/1SgmHerVOt1Z/W2pdeiPfSsIzW4AtdnqiZp3va52eQpUhhjvsVB4YtcOZIPvrBx8dnMxWrxMSWBjOJZr/5Pz748Ge+8vA/Nnj+XsS4JZImRIa4213k01wE7emKoWA/4vxM3bpJaJHrzVNax/1dgYwLSqSW5mlG93sDvf/vfut3fvtRKvup84LTYsId/U//7YvBT3314Pt/5Vtf+/2ufDJqmNO40Wv63r91ntNKvqYI3Ja7LWRZRhzHP6KSsnysFnVcBe2TOexw6IVmB+1ymaFXJcLStmO58/EZ7/z6v/m13/veB5/L2Ux6qpIgt996F4A2x7Lnjnq/+J3m27/ws3d6P/9nv27ilgmk0Hm0TXm1rPUdPqMoukYvtRusuR1nOhyjsxlRzSih7btz6IXIEkfMk2cj93t/+Hj0m7/77NHvv8/ZQG7bGfv+arffeje0r5iSMDAxwyhm5scfmcIsjC1vY+vP6Y8mzCmtUd0a6GKsu9QD1Sux8vmUAQsuo2MzOi6jgyNBVfn/pa/JbaGAf2MAAAAASUVORK5CYII=',night:'data:image/png;base64,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'};
const CHS={early:'<svg class="cho-ch" viewBox="0 0 200 190" aria-hidden="true"><ellipse cx="100" cy="177" rx="74" ry="8" fill="rgba(0,0,0,.28)"/><g class="c-body"><rect class="c-in" x="34" y="86" width="132" height="22" rx="4"/><rect class="c-p" x="30" y="96" width="140" height="74" rx="9"/><rect class="c-pd" x="56" y="112" width="88" height="5" rx="2"/><rect class="c-pd" x="56" y="132" width="88" height="5" rx="2"/><rect class="c-pd" x="56" y="152" width="88" height="5" rx="2"/><rect class="c-s" x="30" y="96" width="28" height="74" rx="8"/><rect class="c-s" x="142" y="96" width="28" height="74" rx="8"/><rect class="c-sd" x="50" y="100" width="8" height="66" rx="3"/><rect class="c-sd" x="142" y="100" width="8" height="66" rx="3"/><circle class="c-sd" cx="42" cy="112" r="3.2"/><circle class="c-sd" cx="42" cy="133" r="3.2"/><circle class="c-sd" cx="42" cy="154" r="3.2"/><circle class="c-sd" cx="158" cy="112" r="3.2"/><circle class="c-sd" cx="158" cy="133" r="3.2"/><circle class="c-sd" cx="158" cy="154" r="3.2"/><polygon class="c-l" points="100.0,101.0 105.6,106.9 113.5,105.4 114.6,113.4 121.9,116.9 118.0,124.0 121.9,131.1 114.6,134.6 113.5,142.6 105.6,141.1 100.0,147.0 94.4,141.1 86.5,142.6 85.4,134.6 78.1,131.1 82.0,124.0 78.1,116.9 85.4,113.4 86.5,105.4 94.4,106.9" stroke-linejoin="round" stroke-width="3"/><circle class="c-ld" cx="100" cy="122" r="5.5"/><path class="c-ld" d="M97 124h6l2.600 14h-11.200z"/></g><ellipse class="cho-flash" cx="100" cy="94" rx="58" ry="12"/><g class="c-lid" style="transform-origin:30px 98px"><path class="c-p" d="M30 100V64Q30 44 52 44H148Q170 44 170 64V100Z"/><rect class="c-pd" x="58" y="62" width="84" height="5" rx="2"/><rect class="c-pd" x="58" y="78" width="84" height="5" rx="2"/><rect class="c-s" x="30" y="44" width="28" height="58" rx="8"/><rect class="c-s" x="142" y="44" width="28" height="58" rx="8"/><rect class="c-sd" x="50" y="50" width="8" height="44" rx="3"/><rect class="c-sd" x="142" y="50" width="8" height="44" rx="3"/><rect class="c-s" x="30" y="92" width="140" height="11" rx="5"/><circle class="c-sd" cx="42" cy="62" r="3.200"/><circle class="c-sd" cx="158" cy="62" r="3.200"/><circle class="c-sd" cx="42" cy="80" r="3.200"/><circle class="c-sd" cx="158" cy="80" r="3.200"/></g></svg>',night:'<svg class="cho-ch" viewBox="0 0 200 190" aria-hidden="true"><ellipse cx="100" cy="177" rx="74" ry="8" fill="rgba(0,0,0,.28)"/><g class="c-body"><rect class="c-in" x="34" y="86" width="132" height="22" rx="4"/><rect class="c-p" x="30" y="96" width="140" height="74" rx="9"/><rect class="c-pd" x="56" y="112" width="88" height="5" rx="2"/><rect class="c-pd" x="56" y="132" width="88" height="5" rx="2"/><rect class="c-pd" x="56" y="152" width="88" height="5" rx="2"/><rect class="c-s" x="30" y="96" width="28" height="74" rx="8"/><rect class="c-s" x="142" y="96" width="28" height="74" rx="8"/><rect class="c-sd" x="50" y="100" width="8" height="66" rx="3"/><rect class="c-sd" x="142" y="100" width="8" height="66" rx="3"/><circle class="c-sd" cx="42" cy="112" r="3.2"/><circle class="c-sd" cx="42" cy="133" r="3.2"/><circle class="c-sd" cx="42" cy="154" r="3.2"/><circle class="c-sd" cx="158" cy="112" r="3.2"/><circle class="c-sd" cx="158" cy="133" r="3.2"/><circle class="c-sd" cx="158" cy="154" r="3.2"/><polygon class="c-l" points="100.0,100.0 106.5,115.1 122.8,116.6 110.5,127.4 114.1,143.4 100.0,135.0 85.9,143.4 89.5,127.4 77.2,116.6 93.5,115.1" stroke-linejoin="round" stroke-width="3"/><circle class="c-ld" cx="100" cy="122" r="5.5"/><path class="c-ld" d="M97 124h6l2.600 14h-11.200z"/></g><ellipse class="cho-flash" cx="100" cy="94" rx="58" ry="12"/><g class="c-lid" style="transform-origin:30px 98px"><path class="c-p" d="M30 100V64Q30 44 52 44H148Q170 44 170 64V100Z"/><rect class="c-pd" x="58" y="62" width="84" height="5" rx="2"/><rect class="c-pd" x="58" y="78" width="84" height="5" rx="2"/><rect class="c-s" x="30" y="44" width="28" height="58" rx="8"/><rect class="c-s" x="142" y="44" width="28" height="58" rx="8"/><rect class="c-sd" x="50" y="50" width="8" height="44" rx="3"/><rect class="c-sd" x="142" y="50" width="8" height="44" rx="3"/><rect class="c-s" x="30" y="92" width="140" height="11" rx="5"/><circle class="c-sd" cx="42" cy="62" r="3.200"/><circle class="c-sd" cx="158" cy="62" r="3.200"/><circle class="c-sd" cx="42" cy="80" r="3.200"/><circle class="c-sd" cx="158" cy="80" r="3.200"/></g></svg>'};
DZ.CHI=CHI;
const CHD={early:{t:'Early Bird Chest',tip:'Morning focus sticks best. Great start to the day!'},night:{t:'Night Owl Chest',tip:'Late-night study done. Now get some rest!'}};
const chLocalKey=()=>'studyos.chest.v1:'+(D.email||'me');
const chLocal=()=>{try{return JSON.parse(localStorage.getItem(chLocalKey())||'{}')||{}}catch(_){return {}}};
const chSetLocal=k=>{const m=chLocal();m[k]=Date.now();try{localStorage.setItem(chLocalKey(),JSON.stringify(m))}catch(_){}};
const chClaimed=k=>Math.max(((D.shop&&D.shop.chestAt)||{})[k]||0,chLocal()[k]||0);
const chLeft=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h?h+'h '+(m%60)+'m':m+' min'};
// A chest is earned by a focus session at the right time of day. Early Bird: 6:00am to noon. Night Owl: 8:00pm to 5:00am, and it opens 3 hours later.
const chState=k=>{
  const now=Date.now(),H=36e5,cl=chClaimed(k);
  const okH=h=>k==='early'?(h>=6&&h<12):(h>=20||h<5);
  const L=(D.sessionTimes||[]).map(t=>new Date(t).getTime()).filter(t=>Number.isFinite(t)&&t>cl&&t<=now+3e5&&now-t<24*H&&okH(new Date(t).getHours())).sort((x,y)=>x-y);
  const d0=new Date();d0.setHours(0,0,0,0);const done=cl>=d0.getTime()-(k==='night'?6*H:0);
  if(!L.length)return {s:'locked',done};
  const ready=L[0]+(k==='night'?3*H:0);
  if(ready>now)return {s:'wait',ms:ready-now,at:ready};
  return {s:'open'};
};
const chCard=k=>{
  const d=CHD[k],st=chState(k);let txt,act='';
  if(k==='early'){
    txt=st.s==='open'?'Your morning chest is ready!':st.done?"You opened today's chest. Do another morning session tomorrow.":'Do a focus session between 6:00am and noon to unlock this chest.';
  }else{
    txt=st.s==='open'?'Your reward chest is ready!':st.s==='wait'?'<span class="ch-t" data-chleft="'+st.at+'">Your reward chest unlocks in '+chLeft(st.ms)+'.</span>':st.done?"You opened last night's chest. A new one starts with your next night session.":'Do a focus session between 8:00pm and 5:00am to start this chest\'s 3 hour timer.';
  }
  if(st.s==='open')act=`<button type="button" class="ch-go" data-chest="${k}" aria-label="Open the ${d.t}">OPEN CHEST</button>`;
  else if(st.s==='locked')act=`<span class="ch-lk">${st.done?'OPENED':'LOCKED'}</span>`;
  return `<div class="ch-card ${st.s}"><span class="ch-ic"><img src="${CHI[k]}" alt="" draggable="false"></span><div class="ch-tx"><b class="ch-n">${d.t}</b><p>${txt}</p>${act}</div></div>`;
};
const chSection=()=>D.guest?'':`<section class="sh2-sec ch-sec"><div class="sh2-h"><b>Special Offers</b><span>Chests for study time</span></div>${chCard('early')}${chCard('night')}</section>`;
let CHT=0,CHBUSY=false;
const chTick=()=>{
  if(!R||!SCREENS[CUR]||SCREENS[CUR].t!=='Gem Shop'){clearInterval(CHT);return}
  let due=false;
  $$('[data-chleft]',R).forEach(n=>{const l=+n.dataset.chleft-Date.now();if(l<=0)due=true;else n.textContent='Your reward chest unlocks in '+chLeft(l)+'.'});
  if(due&&!CHBUSY)go('Gem Shop',true);
};
const chWait=ms=>new Promise(r=>setTimeout(r,ms));
const chOpenFx=async k=>{
  if(CHBUSY||D.guest)return;
  CHBUSY=true;hap('light');
  const def=CHD[k],calm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ov=document.createElement('div');ov.className='cho '+k;
  ov.innerHTML=`<div class="cho-bg"></div><div class="cho-in"><div class="cho-t">${def.t}</div><div class="cho-s">Tap to open</div><div class="cho-stage"><div class="cho-rays"></div><div class="cho-glow"></div>${CHS[k]}</div><div class="cho-rw"></div><button type="button" class="cho-btn">COLLECT</button></div>`;
  host.appendChild(ov);
  const q=s=>ov.querySelector(s);
  const ch=q('.cho-ch'),lid=q('.c-lid'),flash=q('.cho-flash'),rays=q('.cho-rays'),glow=q('.cho-glow'),sub=q('.cho-s'),rw=q('.cho-rw'),btn=q('.cho-btn'),stage=q('.cho-stage');
  let ready=false;
  const close=()=>{if(!ov.isConnected)return;DZ.chestClose=null;ov.classList.remove('on');setTimeout(()=>ov.remove(),280);CHBUSY=false;if(CB.shopRefresh)CB.shopRefresh();if(SCREENS[CUR]&&SCREENS[CUR].t==='Gem Shop')go('Gem Shop',true)};
  DZ.chestClose=()=>{if(!ov.isConnected)return false;if(ready)close();return true};
  btn.onclick=close;q('.cho-bg').onclick=()=>{if(ready)close()};
  requestAnimationFrame(()=>ov.classList.add('on'));
  if(!calm)ch.animate([{transform:'translateY(46px) scale(.3)',opacity:0},{transform:'translateY(-8px) scale(1.07)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.9,.3,1)',fill:'both'});
  await chWait(calm?60:540);
  let wob=null;
  if(!calm)wob=ch.animate([{transform:'rotate(0)'},{transform:'rotate(-6deg) translateY(-3px)'},{transform:'rotate(5deg)'},{transform:'rotate(-4deg) translateY(-2px)'},{transform:'rotate(0)'}],{duration:640,iterations:Infinity});
  sub.textContent='Opening...';hap('medium');
  let r=null;const t0=Date.now();
  try{r=CB.chestOpen?await CB.chestOpen(k):{ok:false,message:'Chests are not available right now.'}}catch(_){r={ok:false,message:'Could not open the chest. Try again.'}}
  const rest=1100-(Date.now()-t0);if(rest>0)await chWait(rest);
  if(wob)wob.cancel();
  if(!r||!r.ok){
    toast((r&&r.message)||'Could not open the chest.');
    if(r&&/already|just opened/i.test(r.message||''))chSetLocal(k);
    ready=true;ov.classList.remove('on');setTimeout(()=>ov.remove(),280);DZ.chestClose=null;CHBUSY=false;if(CB.shopRefresh)CB.shopRefresh();
    if(SCREENS[CUR]&&SCREENS[CUR].t==='Gem Shop')go('Gem Shop',true);return;
  }
  chSetLocal(k);hap('success');
  const rd=r.reward||{gems:0};
  if(!calm){
    lid.animate([{transform:'none'},{transform:'translate(-3px,6px) rotate(2deg)',offset:.18},{transform:'translate(-12px,-58px) rotate(-26deg)'}],{duration:620,easing:'cubic-bezier(.2,.9,.3,1)',fill:'forwards'});
    flash.animate([{opacity:0},{opacity:1,offset:.3},{opacity:.9}],{duration:520,fill:'forwards'});
    glow.animate([{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1)'}],{duration:700,fill:'forwards'});
    rays.animate([{opacity:0},{opacity:.95}],{duration:800,fill:'forwards'});
    ch.animate([{transform:'scale(1)'},{transform:'scale(1.1)',offset:.35},{transform:'scale(1)'}],{duration:480});
    const cols=['#ffd23f','#ff7a45','#4fb3e8','#ff4a6d','#6bdc9a','#ffffff','#b18cff'];
    for(let i=0;i<34;i++){
      const p=document.createElement('i');p.className='cho-p'+(i%4===0?' st':'');p.style.background=cols[i%cols.length];stage.appendChild(p);
      const an=Math.random()*Math.PI*2,di=90+Math.random()*150,dx=Math.cos(an)*di,dy=Math.sin(an)*di-70,sp=Math.random()*720-360;
      const an2=p.animate([{transform:'translate(-50%,-50%) scale(.3) rotate(0deg)',opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1) rotate(${sp/2}deg)`,opacity:1,offset:.55},{transform:`translate(calc(-50% + ${dx*1.12}px),calc(-50% + ${dy+150}px)) scale(.7) rotate(${sp}deg)`,opacity:0}],{duration:1200+Math.random()*800,delay:Math.random()*140,easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'});
      an2.onfinish=()=>p.remove();
    }
  }else{lid.style.transform='translate(-12px,-58px) rotate(-26deg)';flash.style.opacity='.9';glow.style.opacity='1';rays.style.opacity='.9'}
  sub.textContent=def.t+' opened!';
  const items=[{ic:SHI.gem,big:'+'+(rd.gems||0),lab:'Gems',n:rd.gems||0}];
  if(rd.freeze)items.push({ic:SI.freeze,big:'+'+rd.freeze,lab:'Streak Freeze'});
  if(rd.doubleMin)items.push({ic:SHI.gem,big:'2x',lab:'Double Gems · '+(rd.doubleMin>=60?(rd.doubleMin/60)+'h':rd.doubleMin+'m'),x2:1});
  rw.innerHTML=items.map(it=>`<div class="cho-r"><span class="cho-ri">${it.ic}</span><b>${it.big}</b><small>${esc(it.lab)}</small></div>`).join('')+`<p class="cho-tip">${def.tip}</p>`;
  const cards=[...rw.querySelectorAll('.cho-r')];
  cards.forEach((c,i)=>{
    c.style.opacity=calm?1:0;
    if(!calm)c.animate([{opacity:0,transform:'translateY(34px) scale(.6)'},{opacity:1,transform:'translateY(-6px) scale(1.07)',offset:.7},{opacity:1,transform:'none'}],{duration:520,delay:520+i*190,easing:'cubic-bezier(.2,.9,.3,1)',fill:'forwards'});
  });
  const tip=rw.querySelector('.cho-tip');if(tip&&!calm)tip.animate([{opacity:0},{opacity:1}],{duration:400,delay:700+items.length*190,fill:'backwards'});
  if(items[0].n&&!calm){const nb=cards[0].querySelector('b'),n=items[0].n,s=Date.now()+520;const tk=()=>{const k2=Math.min(1,(Date.now()-s)/800);if(k2>0)nb.textContent='+'+Math.round(n*(1-Math.pow(1-k2,3)));if(k2<1&&ov.isConnected)requestAnimationFrame(tk)};requestAnimationFrame(tk)}
  setTimeout(()=>{ready=true;btn.classList.add('on');hap('light')},calm?200:900+items.length*190);
};
DZ.openChest=chOpenFx;

const shopHtml=()=>{
  const pr=PR(),sh=D.shop||{},fr=sh.freezes||0,until=sh.doubleUntil||0,on=until>Date.now();
  const row=def=>{
    const k=def.k,price=pr[k];
    let status='',act='';
    if(k==='gift'){
      const why=blocked(pr.gift);
      act=`<button type="button" class="sh2-pill${why?' off':''}"${why?` data-why="${esc(why)}"`:' data-giftpage'} aria-label="Choose a friend to gift">${gmI}${ntxt(pr.gift)}</button>`;
    }else if(!isLive(k)){
      act=`<button type="button" class="sh2-pill soon" data-why="${esc(def.t+' is coming soon. Your gems stay safe until it is ready.')}" aria-label="${esc(def.t)}, coming soon">Soon</button>`;
    }else{
      const why=whyNot(k,price);
      let text=gmI+ntxt(price);
      if(k==='freeze'&&fr>=2)text='Full';else if(k==='double'&&on)text='Active';
      act=`<button type="button" class="sh2-pill${why?' off':''}" data-buy="${k}" data-price="${price}" data-why="${esc(why)}"${k==='repair'&&D.repair?` data-date="${esc(D.repair)}"`:''} aria-label="Buy ${esc(def.t)} for ${price} gems">${text}</button>`;
    }
    if(k==='freeze'&&fr>0)status=`<em class="sh2-st on">You have ${fr} of 2</em>`;
    else if(k==='double'&&on)status=`<em class="sh2-st on">Active · ${leftTxt(until-Date.now())}</em>`;
    else if(k==='repair'&&isLive('repair')&&D.shop&&D.repair)status='<em class="sh2-st on">You missed yesterday. Repair it now.</em>';
    return `<div class="sh2-it"><div class="sh2-ico" style="--c:${def.c}">${SI[k]||''}</div><div class="sh2-t">${def.tag?`<small class="sh2-tag">${def.tag}</small>`:''}<b>${def.t}</b><p>${def.d.replace('Send 25 gems','Send '+pr.gift+' gems')}</p>${status}</div>${act}</div>`;
  };
  const theme=([k,n,bg,bar,cd,paid])=>{
    let sub,cls='',attr='';
    if(!paid){const cur=!D.palette&&(k==='dark')===!!D.dark;sub=cur?'In use':'Free';cls=cur?' sel':'';attr=` data-theme="${k}" role="button" aria-label="Use the ${n} theme"`}
    else if(isLive(k)&&hasItem(k)){const cur=D.palette===k&&!D.dark;sub=cur?'In use':'Use';cls=cur?' sel':'';attr=` data-theme="${k}" role="button" aria-label="Use the ${n} theme"`}
    else if(!isLive(k))sub='Soon',attr=` data-why="${esc(n+' is coming soon. Your gems stay safe until it is ready.')}" role="button" aria-label="${n} theme, coming soon"`;
    else{const why=whyNot(k,pr[k]);sub=`<button type="button" class="sh2-pill sm${why?' off':''}" data-buy="${k}" data-price="${pr[k]}" data-why="${esc(why)}" aria-label="Buy the ${n} theme for ${pr[k]} gems">${gmI+ntxt(pr[k])}</button>`}
    return `<div class="sh2-th${cls}"${attr}><div class="sh2-pv" style="background:${bg}"><i style="background:${bar}"></i><u style="background:${cd}"></u></div><b>${n}</b><small>${sub}</small></div>`;
  };
  const banner=D.guest?'<div class="sh2-off"><span>Create your profile to use the shop.</span></div>'
    :D.shop?'':`<div class="sh2-off"><span>${esc(shopWait())}</span>${D.shopStatus==='loading'||!D.shopStatus?'':'<button type="button" class="sh2-retry" data-retry>Try again</button>'}</div>`;
  // Colour themes you already own live in Settings > Appearance. The shop only lists the ones still to unlock.
  const themeList=D.guest?SHOP_THEMES.filter(t=>t[5]):(D.shop?SHOP_THEMES.filter(t=>t[5]&&!hasItem(t[0])):[]);
  const themeSec=themeList.length?`<section class="sh2-sec"><div class="sh2-h"><b>Themes</b><span>${themeList.length} to unlock</span></div><div class="sh2-thg">${themeList.map(theme).join('')}</div><p class="sh2-sn" style="margin:10px 4px 0">Themes you buy move to Settings &gt; Appearance.</p></section>`:'';
  const body=SHOP_SECTIONS.map(sec=>`<section class="sh2-sec"><div class="sh2-h"><b>${sec.h}</b><span>${sec.s}</span></div>${sec.items.map(row).join('')}</section>`).join('');
  return wrapD(`<div class="sh2" data-sc>
<div class="sh2-top"><button type="button" class="sh2-back" data-shback aria-label="Back">${SI.back}</button><div class="sh2-bal" aria-label="You have ${ntxt(D.gems)} gems">${gmI}<span>${ntxt(D.gems)}</span></div></div>
<h1 class="sh2-title">Gem Shop</h1><p class="sh2-sub">Turn the gems you earn into real study power. <span style="opacity:.45">· build 12f</span></p>
<div class="sh-hero"><span class="sh-hg">${SHI.gem}</span><div><small>Your gems</small><b>${ntxt(D.gems)}</b><span>Earn 1 gem for every 5 minutes you focus.</span></div></div>
${chSection()}
${banner}
${body}
${themeSec}
<section class="sh2-sec"><div class="sh2-h"><b>Ways to earn gems</b></div>
<div class="sh-earn"><span class="sh-ei">${SHI.clock}</span><div><b>Focus sessions</b><p>1 gem for every 5 minutes, up to 10 per session.</p></div></div>
<div class="sh-earn"><span class="sh-ei">${SHI.sand}</span><div><b>Daily limit</b><p>Up to 80 gems a day, or 160 with Double Gems.</p></div></div>
<div class="sh-earn"><span class="sh-ei">${SHI.heart}</span><div><b>Friends</b><p>You both earn 10 gems when a friend joins you.</p></div></div>
</section></div>${sheetHtml()}`);
};
const armBtn=(b,label,key)=>{SARM=key||'';SARMT=Date.now()+4000;b.classList.add('armed');b.dataset.html=b.innerHTML;b.textContent=label;clearTimeout(b._t);b._t=setTimeout(()=>{if(SARM===key&&Date.now()>=SARMT-50)SARM='';if(b.isConnected&&b.classList.contains('armed')){b.classList.remove('armed');b.innerHTML=b.dataset.html}},4000)};
const shopPlay=()=>{
  if(!SOFT){SHEET=null;SMSG=null;STXT='';SARM='';SBUSY=false;rise('.sh2-top,.sh2-title,.sh2-sub,.sh-hero,.sh2-off,.sh2-sec',0,45);hap('light')}
  const sb=$('.sh2',R);if(sb){sb.scrollTop=SHY;sb.onscroll=()=>{SHY=sb.scrollTop}}
  clearInterval(CHT);CHT=setInterval(chTick,15000);
  if(!SOFT&&CB.shopRefresh)CB.shopRefresh();
  // Messages show as a toast, so they stay visible wherever the page is scrolled to.
  // The page redraws when new shop data arrives, so a fresh toast is put back for a moment.
  const say=text=>{STXT=text;STUNTIL=Date.now()+1800;go('Gem Shop',true)};
  if(STXT&&Date.now()<STUNTIL)toast(STXT);
  const handle=async e=>{
   try{
    const cho=!SHEET&&e.target.closest('[data-chest]');
    if(cho&&R.contains(cho)){chOpenFx(cho.dataset.chest);return}
    if(SHEET){
      // While the sheet is open, taps only go to the sheet.
      const t=e.target;
      if(SBUSY&&Date.now()-SBST<20000)return;
      if(Date.now()-(SHEET.at||0)<450)return;
      if(t.closest('[data-sheetapply]')){
        const ak=SHEET.k;hap('success');if(CB.setPalette)CB.setPalette(ak,true);sheetClose();toast(shopDef(ak).t+' applied');return}
      if(t.closest('[data-sheetclose]')||(t.classList&&t.classList.contains('sh2-sheet'))){hap('light');sheetClose();return}
      const pk=t.closest('[data-pack]');
      if(pk){if(!pk.disabled){hap('tick');SHEET.n=+pk.dataset.pack;sheetPickUpdate()}return}
      if(t.closest('[data-sheetwhy]')){hap('light');say('You need more gems for this. Study to earn them.');return}
      if(t.closest('[data-sheetbuy]')){
        // Never buy from a tap in the first moments (quick repeated taps on a price can land here).
        if(Date.now()-(SHEET.at||0)<800)return;
        const k=SHEET.k,n=sheetPick().n;
        SBUSY=true;SBST=Date.now();clearTimeout(SBT);SBT=setTimeout(()=>{SBUSY=false},20000);
        const bt=t.closest('[data-sheetbuy]');SHEET.buying=true;bt.classList.add('busy');bt.textContent='...';
        let r=null;try{r=CB.shopBuy?await CB.shopBuy(k,{date:SHEET.date||'',qty:n}):null}catch(_){r=null}
        clearTimeout(SBT);SBUSY=false;if(SHEET)SHEET.buying=false;
        if(r&&r.ok){hap('success');if(SHEET&&SHEET.k===k){SHEET.done=n;SHEET.at=Date.now();SHEET.fx='done';sheetRepaint()}}
        else{hap('light');sheetPickUpdate();say((r&&r.message)||'Could not reach the server. Try again.')}
      }
      return;
    }
    if(e.target.closest('[data-shback]')){back();return}
    if(e.target.closest('[data-retry]')){hap('light');if(CB.shopRefresh)CB.shopRefresh();return}
    if(e.target.closest('[data-giftpage]')){hap('light');GHY=0;SMSG=null;go('Gift gems');return}
    const th=e.target.closest('[data-theme]');
    if(th&&th!==R&&R.contains(th)){hap('light');const tk=th.dataset.theme;if(tk.indexOf('theme_')===0){if(CB.setPalette)CB.setPalette(tk)}else{if(CB.setTheme)CB.setTheme(tk)}return}
    const b=e.target.closest('[data-buy],[data-why]');if(!b){dbg('tap missed a button: '+tn(e.target));return}
    dbg('button '+(b.dataset.buy||'info')+(b.classList.contains('armed')?' (armed)':'')+(SBUSY?' BUSY':''));
    if(SBUSY&&Date.now()-SBST<20000){toast('Working on your last request...');return}
    if(b.dataset.why){hap('light');say(b.dataset.why);return}
    if(!b.dataset.buy)return;
    // Open the pack sheet (the first pack you can pick is selected).
    hap('light');SHEET={k:b.dataset.buy,n:1,date:b.dataset.date||'',at:Date.now(),fx:'in'};
    if(!sheetOpen())go('Gem Shop',true);
   }catch(err){SBUSY=false;clearTimeout(SBT);toast('Shop error: '+((err&&err.message)||err))}
  };
  // Listen to the finger lifting as well as to click, so a tap still counts if the WebView drops the click.
  let PD=null;
  R.onpointerdown=e=>{PD={x:e.clientX,y:e.clientY}};
  R.onpointerup=e=>{if(!PD)return;const m=Math.hypot(e.clientX-PD.x,e.clientY-PD.y);PD=null;if(m>10)return;SLT=Date.now();handle(e)};
  R.onclick=e=>{if(Date.now()-SLT<700)return;SLT=Date.now();handle(e)};
};
const giftHtml=()=>{
  const pr=PR(),fr=(D.friends||[]),why=blocked(pr.gift);
  const rows=fr.map(f=>`<div class="sh-fr"><span class="ava">${esc((f.name||'?').charAt(0).toUpperCase())}</span><span class="sh-fn">${esc(f.name)}</span><button type="button" class="sh-btn sm${why?' off':''}${!why&&isArm('g:'+f.id)?' armed':''}" data-gift="${esc(f.id)}" data-why="${esc(why)}" aria-label="Send ${pr.gift} gems to ${esc(f.name)}">${!why&&isArm('g:'+f.id)?'Confirm':gmI+pr.gift}</button></div>`).join('');
  return wrapD(`<div class="pg shp" style="padding-top:38px">${head('Gift gems',ICO.back)}<div class="shb">
<div class="sh-hero"><span class="sh-hg">${SHI.gift}</span><div><small>Your gems</small><b>${ntxt(D.gems)}</b><span>Send ${pr.gift} gems to a friend. Gifts cannot be taken back.</span></div></div>
${msgHtml()}
<div class="sh-h">Your friends</div>
${rows||`<div class="mut" style="font:600 14px/1.5 var(--body);margin:8px 4px;text-align:center">No friends yet. Add a friend first and you both earn 10 gems.</div>`}
</div></div>`);
};
const giftPlay=()=>{
  if(!SOFT){SMSG=null;SARM='';SBUSY=false}
  enter();
  const sb=$('.shb',R);if(sb){sb.scrollTop=GHY;sb.onscroll=()=>{GHY=sb.scrollTop}}
  if(!SOFT&&CB.shopRefresh)CB.shopRefresh();
  R.onclick=async e=>{
    if(e.target.closest('.hd span:first-child')){back();return}
    const b=e.target.closest('[data-gift]');if(!b||SBUSY)return;
    if(b.dataset.why){hap('light');SMSG={text:b.dataset.why};go('Gift gems',true);return}
    if(!b.classList.contains('armed')){hap('light');armBtn(b,'Confirm','g:'+b.dataset.gift);return}
    SARM='';SBUSY=true;clearTimeout(SBT);SBT=setTimeout(()=>{SBUSY=false},20000);b.classList.remove('armed');b.classList.add('busy');b.textContent='…';
    let r=null;try{r=CB.shopGift?await CB.shopGift(b.dataset.gift):null}catch(_){r=null}
    clearTimeout(SBT);SBUSY=false;
    SMSG=r&&r.ok?{ok:1,text:r.message||'Gift sent!'}:{text:(r&&r.message)||'Could not reach the server. Try again.'};
    hap(r&&r.ok?'success':'light');
    if(SCREENS[CUR]&&SCREENS[CUR].t==='Gift gems')go('Gift gems',true);
  };
};
SCREENS.push({t:'Gem Shop',d:'Spend gems on streak boosts, premium features, themes and gifts',spec:{m:'Balance, boosts, premium features and themes with a two-tap confirm, gifting and how gems are earned.',h:'Light tap on each press, success on a purchase.',s:NS},html:shopHtml,play:shopPlay});
SCREENS.push({t:'Gift gems',d:'Send gems to a friend',spec:{m:'Friend list with a two-tap send.',h:'Light tap, success when sent.',s:NS},html:giftHtml,play:giftPlay});
DZ.openShop=from=>{DZ.shopFrom=from;SHY=0;SMSG=null;hap('light');go('Gem Shop')};
['pointerdown','pointerup','click'].forEach(ev=>host.addEventListener(ev,e=>{if(SCREENS[CUR]&&SCREENS[CUR].t==='Gem Shop')dbg(ev+' on '+tn(e.target))},true));
host.addEventListener('click',e=>{
  const g=e.target.closest('[data-shopgo]');if(!g||!SCREENS[CUR]||!['Home','Tasks','Study'].includes(SCREENS[CUR].t))return;
  e.stopPropagation();DZ.openShop(SCREENS[CUR].t);
},true);
}
host.addEventListener('click',e=>{
  const pg2=e.target.closest('[data-pfgo]');
  if(pg2&&SCREENS[CUR]&&['Home','Tasks','Study'].includes(SCREENS[CUR].t)){e.stopPropagation();hap('light');P.share(pg2,'dz-ava','.pf .hero');go('Profile');return}
  const ic=e.target.closest('.tb > svg');
  if(ic&&SCREENS[CUR]&&['Home','Tasks','Study'].includes(SCREENS[CUR].t)){SFROM=SCREENS[CUR].t;DZ.searchFrom=SFROM;SQ='';hap('light');go('Search')}
},true);
}


/* ---- League: weekly trophies, and your friends' XP, gems, tasks and subjects ---- */
{
  const DEM=200;
  const LG={data:null,loading:false,err:'',at:0,user:'',note:null,noteAt:0};
  const lgKey=()=>'studyos.league.v1:'+(D.email||'me');
  const seenKey=()=>'studyos.league.seen:'+(D.email||'me');
  const lgCache=()=>{const u=D.email||'me';if(LG.user===u)return;LG.user=u;LG.data=null;LG.at=0;try{const j=JSON.parse(localStorage.getItem(lgKey())||'null');if(j&&Array.isArray(j.rows))LG.data=j}catch(_){}};
  const CLK2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const ADN='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.500 3h5v8H19l-7 9-7-9h4.500z"/></svg>';
  const TSKI='<svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="8" fill="#6a58d0"/><path d="M10 16.500l4 4 8-9" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SUBI='<svg viewBox="0 0 24 24"><path d="M4 5.500A2.500 2.500 0 016.500 3H20v15H6.500A2.500 2.500 0 004 20.500z" fill="#ffb020"/><path d="M4 20.500A2.500 2.500 0 016.500 18H20v3H6.500A2.500 2.500 0 014 20.500z" fill="#e08a00"/></svg>';
  const XCL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const MED={1:['#ffc533','#d99a00'],2:['#c3ccd6','#8f9daa'],3:['#e0a266','#b4743a']};
  const medal=n=>{const c=MED[n];return `<svg viewBox="0 0 32 40" class="lg-md" role="img" aria-label="${n}"><path d="M9 22 5 38l7-3 4 5 4-5 7 3-4-16z" fill="${c[1]}"/><circle cx="16" cy="14" r="12" fill="${c[0]}"/><circle cx="16" cy="14" r="9" fill="none" stroke="${c[1]}" stroke-width="1.600" opacity=".5"/><text x="16" y="19.500" text-anchor="middle" font-size="14" font-weight="800" font-family="Nunito,system-ui,sans-serif" fill="#fff">${n}</text></svg>`};
  const leftTxt=ms=>{const H=36e5,D1=864e5;if(ms>=D1){const n=Math.ceil(ms/D1);return n+(n===1?' DAY':' DAYS')}if(ms>=H){const n=Math.ceil(ms/H);return n+(n===1?' HOUR':' HOURS')}return Math.max(1,Math.ceil(ms/6e4))+' MIN'};
  const nm=n=>Number(n||0).toLocaleString();
  const tierName=i=>(TROPHIES[Math.max(0,Math.min(9,i))]||TROPHIES[0]).n;
  const row=(r,i,zone)=>{
    const col=DZ.fxCol?DZ.fxCol(r.name||'?'):'#c9b8c3';
    const face=DZ.pfFace?DZ.pfFace(r.me?'me':r.id,r.me?(D.avatar||r.avatar):r.avatar,r.me?(D.picture||r.picture||''):r.picture):'';
    return `<div class="lg-r${r.me?' me':''}${zone?' zn':''}"${r.me?'':` data-fid="${esc(r.id)}" role="button"`} style="--k:${Math.min(i,12)}"><span class="lg-rk${zone?' red':''}">${i<3?medal(i+1):i+1}</span><span class="lg-av" style="background:${col}">${face}</span><span class="lg-nm"><b>${esc(r.name)}${r.me?'<em class="lg-you">You</em>':''}</b><small><span><i>${CUBE}</i>${nm(r.gems)}</span><span><i>${TSKI}</i>${nm(r.tasks)}</span><span><i>${SUBI}</i>${nm(r.subjects)}</span></small></span><span class="lg-xp">${nm(r.xp)} XP</span></div>`;
  };
  const skel=()=>[0,1,2,3,4].map(i=>`<div class="lg-r sk" style="--k:${i}"><span class="lg-rk"></span><span class="lg-av"></span><span class="lg-nm"><b></b><small></small></span></div>`).join('');
  const lgHtml=()=>{
    lgCache();
    const d=LG.data,tier=d?Math.max(0,Math.min(9,d.tier|0)):0;
    const rows=d?d.rows:[];
    const zoneAt=rows.findIndex(r=>r.xp<(d&&d.demotionXp||DEM)),showZone=zoneAt>=0&&rows.length>1;
    let list='';
    if(D.guest)list='<div class="lg-msg">Create your profile to join the league.</div>';
    else if(!d&&LG.err)list=`<div class="lg-msg">${esc(LG.err)}<button type="button" class="lg-btn" data-lgretry>TRY AGAIN</button></div>`;
    else if(!d)list=skel();
    else list=rows.map((r,i)=>(showZone&&i===zoneAt?`<div class="lg-dz"><i>${ADN}</i><b>DEMOTION ZONE</b><i>${ADN}</i></div>`:'')+row(r,i,r.xp<(d.demotionXp||DEM))).join('');
    const trophies=TROPHIES.map((t,i)=>`<div class="lg-t ${i<tier?'done':i===tier?'cur':'fut'}" data-lgt="${i}" role="img" aria-label="${t.n}"><img src="${t.src}" width="${t.w}" height="${t.h}" alt="" draggable="false"></div>`).join('');
    const info=d?(tier<9?`<p class="lg-info">Finish in the top ${d.top||3} with at least ${d.minXp||50} XP to reach the ${tierName(tier+1)} League.</p>`:'<p class="lg-info">You are in the highest league. Keep studying to stay on top!</p>'):'';
    const nt=LG.note&&Date.now()-LG.noteAt<6e5?LG.note:null;
    const note=nt?`<div class="lg-note${nt.up?' up':''}" role="status"><span>${nt.up?`You moved up to the ${tierName(nt.to)} League!`:`You stayed in the ${tierName(nt.to)} League. Finish in the top 3 this week to move up.`}</span><button type="button" data-lgx aria-label="Close">${XCL}</button></div>`:'';
    const cta=d&&rows.length<2&&!D.guest?`<div class="lg-add"><p>Add friends to compete in your league.</p><button type="button" class="lg-btn" data-lgfind>FIND FRIENDS</button></div>`:'';
    return wrapD(`<div class="pg pgs lg" data-lgsc><div class="lg-h"><h1>${tierName(tier)} League</h1><div class="lg-sub"><i>${CLK2}</i><span data-lgleft>${d?leftTxt(Math.max(0,d.end-Date.now())):'7 DAYS'}</span></div></div><div class="lg-ts" data-lgts>${trophies}</div>${info}${note}<div class="lg-l">${list}</div>${cta}<div class="lg-pad"></div></div>${nav('league')}`);
  };
  const lgRedraw=()=>{if(!SCREENS[CUR]||SCREENS[CUR].t!=='League')return;const sc=R&&R.querySelector('[data-lgsc]'),ts=R&&R.querySelector('[data-lgts]'),y=sc?sc.scrollTop:0,x=ts?ts.scrollLeft:0;go('League',true);const n=R&&R.querySelector('[data-lgsc]'),t2=R&&R.querySelector('[data-lgts]');if(n)n.scrollTop=y;if(t2)t2.scrollLeft=x};
  const lgCenter=(smooth)=>{const ts=R&&R.querySelector('[data-lgts]'),c=ts&&ts.querySelector('.lg-t.cur');if(!c)return;const x=c.offsetLeft-(ts.clientWidth-c.offsetWidth)/2;if(smooth&&ts.scrollTo)ts.scrollTo({left:x,behavior:'smooth'});else ts.scrollLeft=x};
  const lgConfetti=()=>{const ts=R&&R.querySelector('[data-lgts]'),c=ts&&ts.querySelector('.lg-t.cur');if(!c)return;const cols=['#ffd23f','#ff7a45','#4fb3e8','#ff4a6d','#6bdc9a','#ffffff','#b18cff'];
    const box=document.createElement('div');box.className='lg-cf';c.appendChild(box);
    for(let i=0;i<16;i++){const p=document.createElement('i');p.style.background=cols[i%cols.length];box.appendChild(p);const a=Math.random()*Math.PI*2,r=50+Math.random()*60;
      p.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r-30}px)) scale(1)`,opacity:0}],{duration:900+Math.random()*500,easing:'cubic-bezier(.1,.8,.3,1)',fill:'forwards'})}
    c.animate([{transform:'scale(.6)'},{transform:'scale(1.12)',offset:.6},{transform:'scale(1)'}],{duration:620,easing:'cubic-bezier(.2,.9,.3,1)'});setTimeout(()=>box.remove(),1500)};
  const lgLoad=async(force)=>{
    lgCache();if(D.guest||LG.loading||!CB.leagueLoad)return;
    if(!force&&LG.data&&Date.now()-LG.at<20000)return;
    LG.loading=true;LG.err='';let r=null;try{r=await CB.leagueLoad()}catch(_){r=null}LG.loading=false;
    if(r&&r.ok&&r.data&&Array.isArray(r.data.rows)){
      LG.data=r.data;LG.at=Date.now();try{localStorage.setItem(lgKey(),JSON.stringify(r.data))}catch(_){}
      const L=r.data.last;let seen='';try{seen=localStorage.getItem(seenKey())||''}catch(_){}
      if(L&&String(L.at)!==seen){try{localStorage.setItem(seenKey(),String(L.at))}catch(_){}LG.note=L;LG.noteAt=Date.now();
        if(SCREENS[CUR]&&SCREENS[CUR].t==='League'){hap(L.up?'success':'light')}}
    }else LG.err=(r&&r.message)||'Could not load the league. Try again.';
    lgRedraw();
    if(LG.note&&LG.note.up&&SCREENS[CUR]&&SCREENS[CUR].t==='League'&&Date.now()-LG.noteAt<2e3)setTimeout(lgConfetti,450);
  };
  const lgPlay=()=>{
    enter();lgCache();
    if(!SOFT)setTimeout(()=>lgCenter(false),0);else lgCenter(false);
    const run=RUN;
    const tm=setInterval(()=>{if(run!==RUN||!R||!R.isConnected||!SCREENS[CUR]||SCREENS[CUR].t!=='League'){clearInterval(tm);return}
      const d=LG.data;if(!d)return;const ms=d.end-Date.now();const s=R.querySelector('[data-lgleft]');if(s)s.textContent=leftTxt(Math.max(0,ms));if(ms<=0&&!LG.loading)lgLoad(true)},30000);
    R.onclick=e=>{
      if(e.target.closest('[data-lgretry]')){hap('light');LG.err='';lgLoad(true);lgRedraw();return}
      if(e.target.closest('[data-lgfind]')){hap('light');if(DZ.openFindFriends)DZ.openFindFriends();return}
      if(e.target.closest('[data-lgx]')){hap('light');LG.note=null;lgRedraw();return}
      const f=e.target.closest('[data-fid]');if(f){hap('light');DZ.openFriend(f.dataset.fid,'League');return}
      const t=e.target.closest('[data-lgt]');if(t){hap('tick');const im=t.querySelector('img');im&&im.animate([{transform:'scale(1)'},{transform:'scale(1.14)',offset:.4},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.2,.9,.3,1)'});const ts=t.parentNode;if(ts&&ts.scrollTo)ts.scrollTo({left:t.offsetLeft-(ts.clientWidth-t.offsetWidth)/2,behavior:'smooth'})}
    };
    lgLoad(false);
    if(LG.data&&LG.note&&LG.note.up&&Date.now()-LG.noteAt<2e3)setTimeout(lgConfetti,450);
  };
  SCREENS.push({t:'League',d:'Weekly league with trophies',spec:{m:'Ten trophies from Bronze to Diamond. Your friends are ranked by XP for 7 days. Finish in the top 3 to move up a trophy.',h:'Light tap on each press, success when you move up.',s:'No sound on this page.'},html:lgHtml,play:lgPlay});
}

/* Profile: most recent achievements (with the arrow) and friend suggestions */
{
  const k=IDX('Profile'),ph=SCREENS[k].html,pp=SCREENS[k].play;
  const CHV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const XX2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  /* ---- friend suggestions: cached 6 hours, a dismissed person stays hidden for 14 days, new ones fade in when they arrive ---- */
  const SK='studyos.psg.v1',HK='studyos.psg.hide.v1',TTL=6*3600e3,HIDE=14*864e5;
  const PS={list:null,at:0,busy:false,sent:{},user:null};
  const psLoad=()=>{const u=D.email||'me';if(PS.user===u)return;PS.user=u;PS.list=null;PS.at=0;try{const j=JSON.parse(localStorage.getItem(SK)||'null');if(j&&j.u===u&&Array.isArray(j.list)){PS.list=j.list;PS.at=+j.t||0}}catch(_){}};
  const psSave=()=>{try{localStorage.setItem(SK,JSON.stringify({u:PS.user,t:PS.at,list:(PS.list||[]).slice(0,30)}))}catch(_){}};
  const hideMap=()=>{let m={};try{m=JSON.parse(localStorage.getItem(HK)||'{}')||{}}catch(_){m={}}const now=Date.now();let ch=0;for(const id in m){if(now-m[id]>HIDE){delete m[id];ch=1}}if(ch)try{localStorage.setItem(HK,JSON.stringify(m))}catch(_){}return m};
  const hideId=id=>{const m=hideMap();m[id]=Date.now();try{localStorage.setItem(HK,JSON.stringify(m))}catch(_){}};
  const isFr=id=>(D.friends||[]).some(f=>String(f.id)===String(id));
  const visible=()=>{const h=hideMap();return (PS.list||[]).filter(p=>p&&p.id&&!h[p.id]&&!isFr(p.id)&&p.relation!=='friends').slice(0,10)};
  const via=p=>p.via?`Followed by ${esc(String(p.via).split(' ')[0])}${p.mutualCount>1?' and '+(p.mutualCount-1)+' other'+(p.mutualCount>2?'s':''):''}`:(p.mutualCount?`${p.mutualCount} friends in common`:'New on StudyOS');
  const face=p=>`<span class="ff-av" style="--c:${DZ.fxCol?DZ.fxCol(p.name||'?'):'#c9b8c3'}">${DZ.pfFace?DZ.pfFace(p.id,p.avatar,p.picture):''}</span>`;
  const card=(p,i)=>{const on=!!PS.sent[p.id]||p.relation==='sent';return `<div class="ff-card" style="--k:${i}" data-psgid="${esc(p.id)}"><button type="button" class="ff-x" data-psgx="${esc(p.id)}" aria-label="Hide this suggestion">${XX2}</button>${face(p)}<b>${esc(p.name)}</b><small>${via(p)}</small><button type="button" class="ff-fol${on?' on':''}" data-psgf="${esc(p.id)}"${on?' disabled':''}>${on?'REQUESTED':'ADD FRIEND'}</button></div>`};
  const block=fresh=>{if(D.guest)return '';const L=visible();if(!L.length)return '';
    return `<div class="psg${fresh?' a':''}"><div class="sec" style="display:flex;align-items:center;justify-content:space-between">Friend suggestions<button type="button" class="ff-all" data-psgall>VIEW ALL</button></div><div class="ff-scroll">${L.map(card).join('')}</div></div>`};
  const psFetch=async()=>{psLoad();if(PS.busy||D.guest||!CB.friendSuggestions)return;if(PS.list&&Date.now()-PS.at<TTL)return;
    PS.busy=true;let r=null;try{r=await CB.friendSuggestions()}catch(_){r=null}PS.busy=false;
    if(r&&r.ok){PS.list=r.suggestions||[];PS.at=Date.now();psSave();
      const box=SCREENS[CUR]&&SCREENS[CUR].t==='Profile'&&R?R.querySelector('[data-psgbox]'):null;
      if(box&&!box.querySelector('.psg'))box.innerHTML=block(true)}};
  SCREENS[k].html=()=>{
    let h=ph();
    psLoad();
    const rec=DZ.recentBadges?DZ.recentBadges(3):[];
    const z=h.indexOf('</div></div><div class="pfbar"');
    if(z>0){
      const grid=rec.length?`<div class="ach-grid" data-achgo>${rec.map(b=>{const x=DZ.bdg2(b,false);return DZ.badgeIsNew&&DZ.badgeIsNew(b[2])?x.replace('<div class="bimg">','<span class="ach-new">NEW</span><div class="bimg">'):x}).join('')}</div>`:`<div style="font:700 14px var(--body);color:#8b98a2" data-achgo>Finish tasks and keep your streak to earn badges.</div>`;
      h=h.slice(0,z)+'<div class="sec ach-h" data-achgo role="button" aria-label="Open all achievements"><span>Achievements</span><span class="ach-ch">'+CHV+'</span></div>'+grid+h.slice(z);
    }
    // friend suggestions go right under the Add friends buttons
    const q=h.indexOf('data-qr');
    if(q>0){const c2=h.indexOf('</button></div>',q);if(c2>0){const at=c2+'</button></div>'.length;h=h.slice(0,at)+'<div data-psgbox>'+block(false)+'</div>'+h.slice(at)}}
    return h;
  };
  SCREENS[k].play=()=>{
    pp();const old=R.onclick;
    R.onclick=async e=>{
      if(e.target.closest('[data-achgo]')){hap('light');DZ.badgesFrom='Profile';go('Badges');return}
      if(e.target.closest('[data-psgall]')){hap('light');go('Friend suggestions');return}
      const x=e.target.closest('[data-psgx]');
      if(x){e.stopPropagation();hap('light');const id=x.dataset.psgx;hideId(id);const el=x.closest('.ff-card');
        if(el){el.classList.add('gone');setTimeout(()=>{if(el.parentNode)el.remove();const box=R&&R.querySelector('[data-psgbox]');if(box&&!box.querySelector('.ff-card'))box.innerHTML=''},200)}return}
      const f=e.target.closest('[data-psgf]');
      if(f){e.stopPropagation();if(f.disabled)return;const id=f.dataset.psgf;f.disabled=true;hap('press');PS.sent[id]=1;f.classList.add('on');f.textContent='REQUESTED';
        let r=null;try{r=CB.sendRequest?await CB.sendRequest(id):null}catch(_){r=null}
        if(r&&r.ok){hap('success');toast(r.status==='friends'?'You are now friends!':'Friend request sent')}
        else{delete PS.sent[id];f.disabled=false;f.classList.remove('on');f.textContent='ADD FRIEND';toast((r&&(r.error||r.message))||'Could not send the request.')}
        return}
      if(e.target.closest('[data-psgid]'))return;
      old(e);
    };
    psFetch();
  };
}

/* keyboard: bottom buttons and the tab bar step aside while typing; Enter submits */
{
  let kbT=0;
  const FIELD='input:not([type=file]):not([type=date]):not([type=checkbox]),textarea';
  host.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches(FIELD)){clearTimeout(kbT);host.classList.add('dz-kb');const t=e.target;setTimeout(()=>{try{t.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){}},260)}});
  host.addEventListener('focusout',()=>{clearTimeout(kbT);kbT=setTimeout(()=>{const a=document.activeElement;if(!(a&&host.contains(a)&&a.matches&&a.matches(FIELD)))host.classList.remove('dz-kb')},150)});
  host.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||!e.target.matches||!e.target.matches('input'))return;
    const b=R&&R.querySelector('[data-save],[data-savep],[data-send],[data-fset]');
    if(b){e.preventDefault();e.target.blur();b.click()}
  });
}
/* ---- v39: real Sync, Storage, Export, Privacy, Language, Themes, QR, skeleton ---- */
{
  const BKI='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LC='fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const I={
    cloud:`<svg viewBox="0 0 24 24" ${LC}><path d="M7 18a4.500 4.500 0 01-.5-9A6 6 0 0118 10a4 4 0 01-1 8z"/></svg>`,
    wifi:`<svg viewBox="0 0 24 24" ${LC}><path d="M2 9a15 15 0 0120 0M5.500 12.500a10 10 0 0113 0M9 16a5 5 0 016 0"/><circle cx="12" cy="19.500" r="1" fill="currentColor"/></svg>`,
    refresh:`<svg viewBox="0 0 24 24" ${LC}><path d="M20 11a8 8 0 00-14-4.500L4 9M4 4v5h5M4 13a8 8 0 0014 4.500L20 15M20 20v-5h-5"/></svg>`,
    note:`<svg viewBox="0 0 24 24" ${LC}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5M9 13h6M9 17h6"/></svg>`,
    task:`<svg viewBox="0 0 24 24" ${LC}><path d="M5 12l4 4 10-10"/></svg>`,
    card:`<svg viewBox="0 0 24 24" ${LC}><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10h10"/></svg>`,
    clock:`<svg viewBox="0 0 24 24" ${LC}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    dl:`<svg viewBox="0 0 24 24" ${LC}><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>`,
    trash:`<svg viewBox="0 0 24 24" ${LC}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>`,
    lock:`<svg viewBox="0 0 24 24" ${LC}><rect x="5" y="11" width="14" height="10" rx="2.500"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>`,
    eye:`<svg viewBox="0 0 24 24" ${LC}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
    people:`<svg viewBox="0 0 24 24" ${LC}><circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.500 3-5.500 6.500-5.500M16 11a3 3 0 100-6M17 14.500c2.500.5 4.500 2.300 4.500 5.500"/></svg>`,
    book:`<svg viewBox="0 0 24 24" ${LC}><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11"/></svg>`
  };
  const hdr=t=>`<div class="shd"><button class="sbk" type="button" data-back aria-label="Back">${BKI}</button><b>${t}</b></div>`;
  const scr=(t,body)=>`<div class="scr n nd" style="--pg:#181b22"><div class="ss">${hdr(t)}<div class="ssc">${body}</div></div></div>`;
  const ci=(svg,extra)=>`<div class="ci"${extra?` style="${extra}"`:''}><span style="width:24px;height:24px;display:block">${svg}</span></div>`;
  const info=t=>`<div class="spill"><div class="pi">i</div><div>${t}</div></div>`;
  const grab=(t,re)=>{try{const h=SCREENS[IDX(t)].origHtml();const m=h.match(re);return m?m[0]:''}catch(_){return ''}};
  const ago=ts=>{if(!ts)return'Not yet';const m=Math.round((Date.now()-ts)/60000);if(m<1)return'Just now';if(m<60)return m+' min ago';const h=Math.round(m/60);if(h<24)return h+' h ago';return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric'})};
  const bytes=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';
  const stInfo=()=>{try{return CB.storageInfo?CB.storageInfo():{bytes:0,entries:0,pending:D.pending||0,lastSyncAt:0,tasks:0,notes:0,flashcards:0}}catch(_){return {bytes:0,entries:0,pending:0,lastSyncAt:0,tasks:0,notes:0,flashcards:0}}};
  ['Sync and offline','Export my data','Storage and downloads','Privacy settings','Language'].forEach(t=>{const k=IDX(t);if(k>=0)SCREENS[k].origHtml=SCREENS[k].html});
  const ILLRE=/<div class="sill"[^>]*>[\s\S]*?<\/svg><\/div>/;
  const baseBack=()=>{R.onclick=e=>{if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'))}}};
  const rise=()=>{$$('.ss .ssc > *',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:360,delay:i*45,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));hap('light')};
  const set=(t,o)=>{const k=IDX(t);if(k>=0)Object.assign(SCREENS[k],o)};

  /* Sync and offline */
  const syncState=()=>{const i=stInfo(),on=D.online!==false,p=D.pending||i.pending||0;
    return {on,p,title:D.syncing?'Syncing now...':!on?'You are offline':p?p+(p===1?' change is':' changes are')+' waiting':'Everything is synced',
      sub:!on?'Your changes are saved on this phone and will sync when you are back online.':p?'They will be sent to your account automatically.':'Your account and this phone match.',last:'Last synced: '+ago(i.lastSyncAt)}};
  set('Sync and offline',{d:'Real sync status, waiting changes and Sync now',
    html:()=>{const s=syncState();return scr('Sync and offline',`<div class="sill">${grab('Sync and offline',ILLRE).replace(/^<div class="sill"[^>]*>|<\/div>$/g,'')}</div><div class="sh1">Keep your data in sync</div><div class="sh2">Your study data is saved on this phone, so StudyOS works without internet. It syncs to your account by itself when you are online.</div>
<div class="scd"><div class="ci" data-ic style="color:${s.on?'#3d9d5f':'#d49a3a'}"><span style="width:26px;height:26px;display:block">${s.on?I.cloud:I.wifi}</span></div><div class="tx"><b data-st>${s.title}</b><small data-ss>${s.sub}</small></div></div>
<div class="scd" style="margin-top:8px">${ci(I.clock)}<div class="tx"><small style="margin:0;font-size:14px;color:#cfd2d6" data-last>${s.last}</small></div><button class="sref" type="button" data-ref aria-label="Sync now">${I.refresh}</button></div>
${info('Tasks, notes, flashcards, grades and focus sessions you add offline are saved here and sent when your connection returns.')}`)},
    play(){S.mute=false;rise();
      const fill=()=>{const s=syncState();const a=$('[data-st]',R),b=$('[data-ss]',R),c=$('[data-last]',R),d=$('[data-ic]',R);if(a)a.textContent=s.title;if(b)b.textContent=s.sub;if(c)c.textContent=s.last;if(d){d.style.color=s.on?'#3d9d5f':'#d49a3a';d.firstElementChild.innerHTML=s.on?I.cloud:I.wifi}};
      R.onclick=async e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const r=e.target.closest('[data-ref]');if(!r||r.dataset.busy)return;
        if(D.online===false){hap('light');toast('You are offline. Changes will sync when you are back online.');return}
        r.dataset.busy=1;hap('light');const an=r.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:800,iterations:Infinity,easing:'linear'});
        try{if(CB.syncNow)await CB.syncNow()}catch(_){}
        an.cancel();delete r.dataset.busy;if(R&&R.isConnected){fill();hap('success');toast('Synced')}}}});

  /* Storage */
  set('Storage and downloads',{d:'What this phone holds for offline use',
    html:()=>{const i=stInfo();const art=grab('Storage and downloads',/<div style="width:96px;flex:none">[\s\S]*?<\/svg><\/div>/);
      const rows=[[I.task,'Tasks',i.tasks],[I.note,'Notes',i.notes],[I.card,'Flashcards',i.flashcards],[I.clock,'Changes waiting to sync',i.pending]];
      return scr('Storage',`<div class="scd" style="gap:16px;padding:16px">${art}<div class="tx"><b style="font:700 28px var(--display)">${bytes(i.bytes)}</b><small style="font-size:15px;color:#cfd2d6">Saved on this phone for offline use</small></div></div>
${info('This copy lets StudyOS open your tasks, notes and flashcards without internet. It refreshes itself whenever you are online.')}
<div class="sgt">On this phone</div><div class="sgrp">${rows.map(([ic,t,n])=>`<div class="sit rd"><div style="flex-direction:row;align-items:center;gap:14px"><span class="ci" style="width:26px;height:26px;display:grid;place-items:center"><span style="width:24px;height:24px;display:block">${ic}</span></span><div style="gap:0"><span>${t}</span></div></div><b style="font:700 16px var(--body);color:#f4f2f3">${n}</b></div>`).join('')}</div>
<button class="sbtn" type="button" data-clr style="display:flex;align-items:center;justify-content:center;gap:10px;border-radius:30px;margin-top:16px"><span style="width:22px;height:22px;display:block">${I.trash}</span><span>Clear saved copy</span></button><div class="snote" data-cn>Removes only the copy on this phone. Your account keeps everything.</div>`)},
    play(){S.mute=false;rise();
      R.onclick=e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const b=e.target.closest('[data-clr]');if(!b)return;
        const i=stInfo(),n=$('[data-cn]',R);
        if(D.online===false){hap('light');n.textContent='Go online first so your data can be saved again after clearing.';return}
        if(i.pending>0){hap('light');n.textContent='Wait until your waiting changes finish syncing, then clear.';return}
        hap('success');if(CB.clearSaved)CB.clearSaved();toast('Saved copy cleared. It refreshes in a moment.');setTimeout(()=>{if(R&&R.isConnected&&SCREENS[CUR].t==='Storage and downloads')go(CUR,true)},900)}}});

  /* Export */
  set('Export my data',{d:'Share a copy of your tasks, notes and progress',
    html:()=>scr('Export my data',`<div class="sill">${grab('Export my data',ILLRE).replace(/^<div class="sill"[^>]*>|<\/div>$/g,'')}</div><div class="sh1">Export your StudyOS data</div><div class="sh2">Get a copy of your data as a file you can save, send or keep as a backup.</div>
<div class="scd" style="flex-direction:column;align-items:stretch;gap:2px;padding:10px 12px;margin-top:14px">${['Tasks ('+(D.tasks||[]).length+')','Notes ('+(D.notesCount||0)+')','Total focus time and streak','Account name and email'].map(t=>`<div class="sck"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"/></svg></i>${t}</div>`).join('')}</div>
<button class="sbtn fill" type="button" data-exp style="margin-top:14px;display:flex;align-items:center;justify-content:center;gap:10px"><span style="width:22px;height:22px;display:block">${I.dl}</span><span data-et>Export data</span></button><div class="snote" style="display:flex;justify-content:center;align-items:center;gap:6px"><span style="width:14px;height:14px;display:block">${I.lock}</span>You choose where the file goes.</div>`),
    play(){S.mute=false;rise();
      R.onclick=async e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const b=e.target.closest('[data-exp]');if(!b||b.dataset.busy)return;
        if(D.guest){hap('light');toast('Create your profile first to export your data.');return}
        b.dataset.busy=1;hap('light');const t=$('[data-et]',R);t.textContent='Preparing your data...';
        let ok=false;try{ok=CB.exportData?await CB.exportData():false}catch(_){ok=false}
        delete b.dataset.busy;if(!R||!R.isConnected)return;
        t.textContent='Export data';if(ok){hap('success');toast(ok==='copied'?'Copied to your clipboard':'Your data is ready')}else toast('Could not export. Try again.')}}});

  /* Privacy */
  set('Privacy settings',{d:'What StudyOS keeps and who can see it',
    html:()=>{const row=(ic,t,s)=>`<div class="scd" style="margin-top:8px;align-items:flex-start">${ci(ic)}<div class="tx"><b>${t}</b><small style="line-height:1.4">${s}</small></div></div>`;
      const L=D.links||{};const lk=[L.terms&&['TERMS',L.terms],L.privacy&&['PRIVACY POLICY',L.privacy]].filter(Boolean);
      return scr('Privacy',`<div class="sill">${I.lock?`<div style="width:120px;height:120px;margin:0 auto;border-radius:34px;background:#2a2740;color:#a99be2;display:grid;place-items:center"><span style="width:64px;height:64px;display:block">${I.lock}</span></div>`:''}</div><div class="sh1">Your privacy</div><div class="sh2">What StudyOS keeps, and who can see it.</div>
${row(I.book,'Your study data','Tasks, notes, flashcards, grades and focus time belong to your account. Only you can see them.')}
${row(I.people,'What friends see','Friends can see your name, picture, gems and focus minutes on the leaderboard. Nothing else.')}
${row(I.eye,'Contacts','If you choose Find friends from contacts, email addresses are only used once to find people who already use StudyOS.')}
<button class="sbtn" type="button" data-go="Export my data" style="margin-top:16px">EXPORT MY DATA</button><button class="sbtn red" type="button" data-del>DELETE MY ACCOUNT</button>
<div class="slk"><span data-legal="Terms of Service">TERMS</span><span data-legal="Privacy Policy">PRIVACY POLICY</span></div>`)},
    play(){S.mute=false;rise();
      R.onclick=e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const g=e.target.closest('[data-go]');if(g){hap('light');go(IDX(g.dataset.go));return}
        if(e.target.closest('[data-del]')){hap('light');toast('To delete your account, contact support.');return}
        const u=e.target.closest('[data-url]');if(u){hap('light');try{window.open(u.dataset.url,'_blank')}catch(_){}}}}});

  /* Language */
  {const GLOBE='<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="46" fill="#e3dbfa" stroke="#a99be2" stroke-width="5"/><path d="M14 60h92M60 14c-16 14-16 78 0 92M60 14c16 14 16 78 0 92M22 38c24 8 52 8 76 0M22 82c24-8 52-8 76 0" fill="none" stroke="#a99be2" stroke-width="4.500" stroke-linecap="round"/></svg>';
  set('Language',{d:'App language',
    html:()=>{const cur=getLanguage();const C=LANGS.find(l=>l.code===cur)||LANGS[0];
      const tile=l=>`<button type="button" class="lg-t${l.code===cur?' on':''}" data-lang="${l.code}" data-q="${(l.native+' '+l.name+' '+l.code).toLowerCase()}" aria-pressed="${l.code===cur}"><span class="lg-b" data-notr>${l.short}</span><span class="lg-n"><bdi data-notr>${l.native}</bdi><small>${l.name}</small></span><span class="lg-c" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg></span></button>`;
      return scr('Language',`<div class="lg">
<div class="lg-hero"><div class="lg-globe">${GLOBE}<span class="lg-bub" data-notr><bdi>${C.hello}</bdi></span></div>
<div class="sh1">App language</div><div class="sh2">Every menu, button and message in StudyOS uses this language. Your tasks and notes stay as you wrote them.</div></div>
<div class="lg-now"><span class="lg-b big" data-notr>${C.short}</span><div class="lg-n"><small>Current language</small><bdi data-notr>${C.native}</bdi></div></div>
<label class="lg-s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" data-lgq placeholder="Search languages" aria-label="Search languages" autocomplete="off" spellcheck="false"></label>
<div class="lg-h">All languages <span>${LANGS.length}</span></div>
<div class="lg-g" role="list">${LANGS.map(tile).join('')}</div>
<div class="lg-none" hidden>No language found.</div>
<p class="lg-note">Changes apply straight away. Right-to-left languages flip the layout.</p></div>`)},
    play(){S.mute=false;rise();
      $$('.lg-t',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(10px) scale(.97)'},{opacity:1,transform:'none'}],{duration:300,delay:100+i*30,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
      const q=$('[data-lgq]',R);
      if(q)q.oninput=()=>{const v=q.value.trim().toLowerCase();let n=0;$$('.lg-t',R).forEach(t=>{const ok=!v||t.dataset.q.includes(v);t.hidden=!ok;if(ok)n++});const no=$('.lg-none',R);if(no)no.hidden=n>0};
      R.onclick=e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const r=e.target.closest('[data-lang]');if(!r)return;
        const code=r.dataset.lang;if(code===getLanguage())return;
        hap('medium');setLanguage(code);if(CB.savePref)CB.savePref('lang',code);
        go(IDX('Language'),true);
        setTimeout(()=>{const b=$('.lg-bub',R);if(b)b.animate([{transform:'scale(.6)',opacity:0},{transform:'scale(1.08)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1)'});toast('Language changed')},30)}}});}

  /* Themes */
  set('Themes',{d:'Light or dark',
    html:()=>{
      const cur=D.palette?D.palette:(D.dark?'dark':'light');
      const owned=(D.shop&&D.shop.owned)||[];
      const price=k=>(D.shop&&D.shop.prices&&D.shop.prices[k])||250;
      const PAID=[['theme_ocean','Ocean','#d6e8f1','#2b6082'],['theme_forest','Forest','#dde8df','#2f6b4a'],['theme_sunset','Sunset','#f1ddd5','#b4532f'],['theme_mono','Mono','#e6e6e6','#1e1e1e']];
      const sw=(bg,ac)=>`<span class="thsw" style="background:${bg}"><i style="background:${ac}"></i></span>`;
      const free=[['light','Light','Bright and clean','#e1e0e2','#1b1e25'],['dark','Dark','Easy on the eyes at night','#11161b','#c9b8c3']].map(([k,n,t,bg,ac])=>`<div class="sit rd${k===cur?' on':''}" data-theme="${k}" role="button">${sw(bg,ac)}<div><span class="thn">${n}</span><small>${t}</small></div><span class="rad"></span></div>`).join('');
      // Only the themes this account has bought show here. Each purchase adds one more.
      const mine=PAID.filter(([k])=>owned.includes(k));
      const paid=mine.map(([k,n,bg,ac])=>`<div class="sit rd${k===cur?' on':''}" data-theme="${k}" role="button">${sw(bg,ac)}<div><span class="thn">${n}</span><small>Bought · tap to use</small></div><span class="rad"></span></div>`).join('');
      const more=mine.length<PAID.length&&!D.guest?`<div class="sgrp" style="margin-top:14px"><div class="sit" data-lock="more" role="button">Get more themes in the Gem Shop${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'}</div></div>`:'';
      return scr('Themes',`<div class="sh1" style="margin-top:6px">Choose your look</div><div class="sh2">Your choice is saved to your account.</div>
<div class="sgrp" style="margin-top:14px">${free}</div>
${mine.length?`<div class="sh2" style="margin-top:18px;text-align:left;font-weight:700;letter-spacing:.08em;font-size:12.5px">YOUR COLOUR THEMES</div>
<div class="sgrp" style="margin-top:8px">${paid}</div>`:''}
${more}`)},
    play(){S.mute=false;rise();
      R.onclick=e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const lk=e.target.closest('[data-lock]');
        if(lk&&R.contains(lk)){hap('light');if(DZ.openShop)DZ.openShop('Themes');return}
        const t=e.target.closest('[data-theme]');if(!t||t===R||!R.contains(t))return;
        const tk=t.dataset.theme;
        $$('[data-theme]',R).forEach(x=>x.classList.toggle('on',x===t));hap('medium');
        if(tk.indexOf('theme_')===0){if(CB.setPalette)CB.setPalette(tk,true)}else{if(CB.setTheme)CB.setTheme(tk)}}}});

  /* Delete account + in-app Terms and Privacy Policy */
  {
    const contact=()=>D.supportEmail?`<b>${esc(D.supportEmail)}</b>`:'the support contact on the StudyOS store page';
    const sec=(h,p)=>`<h5>${h}</h5><p>${p}</p>`;
    const NOTE=()=>getLanguage()!=='en'?'<p style="color:#9aa6b0;margin-bottom:6px">The full text of this page is shown in English.</p>':'';
    const TERMS=()=>`<p style="color:#9aa6b0">Last updated: November 15, 2026</p>${NOTE()}<div class="lgl" data-notr>`+
      sec('Using StudyOS','StudyOS is a study planner for tasks, notes, flashcards, grades, focus timers and friends. By creating an account or using the app you agree to these terms. If you do not agree, please do not use the app.')+
      sec('Your account','You are responsible for what happens under your account and for keeping your password safe. Give us true information and tell us if you think someone else is using your account. You must be old enough to use online services where you live, or have a parent or guardian agree for you.')+
      sec('Your content','Tasks, notes and other things you add stay yours. You let StudyOS store and show them to you, and to friends only where the app says so (for example your name and focus minutes on a leaderboard). Do not add anything illegal, harmful or that belongs to someone else.')+
      sec('Friends and gems','Be kind to other students. Do not harass people, send spam, or try to cheat gems or leaderboards. We may limit or close accounts that do.')+
      sec('Keeping the app working','We work to keep StudyOS available and your data safe, but an app can have bugs or downtime. Offline changes are saved on your phone and sent later, so please keep your phone online now and then. Do not try to break, copy or misuse the app or its servers.')+
      sec('Ending your account','You can delete your account any time in Settings, Privacy, Delete my account. This removes your data permanently. We may suspend accounts that break these terms.')+
      sec('Changes and contact','We may update these terms and will change the date above when we do. Questions: '+contact()+'.')+`</div>`;
    const PRIV=()=>`<p style="color:#9aa6b0">Last updated: November 15, 2026</p>${NOTE()}<div class="lgl" data-notr>`+
      sec('What we collect','Your name, email and profile picture if you sign in with Google. Your password is stored only as a one way scrambled value, never as plain text. The study data you create: tasks, notes, flashcards, grades, exams, planner items, focus sessions, subjects and your settings. Friends, requests and gems. Sign in device details (a device label and IP address) so we can warn you about a new device.')+
      sec('How we use it','To run the app, sync your data between your devices, show your streak and progress, and send emails you need: verification, welcome, new device alerts, and reminders or reports you leave switched on. We do not show ads and we do not sell your data.')+
      sec('What friends can see','Friends can see your name, picture, gems and focus minutes. They cannot see your tasks, notes, grades or email.')+
      sec('Contacts','Only if you tap Find friends from contacts, the email addresses in your contacts are sent once to check which people already use StudyOS. They are not saved.')+
      sec('On your phone','So StudyOS works offline, a copy of your data is kept on your phone. You can remove it in Settings, Storage and downloads, or with Forget saved accounts on the sign in screen.')+
      sec('Sharing','We use services that host the app and send email for us, and Google when you choose Google sign in. They only handle data to provide those services.')+
      sec('Your choices','Export your data in Settings, Export my data. Change what we email you in your notification settings. Delete your account and all of your data in Settings, Privacy, Delete my account. Deleting is permanent.')+
      sec('Contact','Privacy questions: '+contact()+'. We will update this page and its date if our practices change.')+`</div>`;
    const legal=(t,d,fn)=>({t,d,g:'Settings pages',spec:{m:'Plain text page that scrolls.',h:'Light tap on Back.',s:'No sounds.'},
      html:()=>scr(t,fn()),play(){S.mute=false;rise();baseBack()}});
    const DEL=()=>`<div class="sh1" style="margin-top:6px">Delete your account</div><div class="sh2">This permanently removes your account and everything in it. It cannot be undone.</div>
<div class="scd" style="flex-direction:column;align-items:stretch;gap:2px;padding:10px 12px;margin-top:14px">${['Tasks, notes, flashcards, grades and exams','Focus sessions, streak, gems and settings','Friendships and notifications','Your saved copy on this phone'].map(t=>`<div class="sck"><i style="background:#c8553d;border-color:#c8553d"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></i>${t}</div>`).join('')}</div>
<div class="sfl">Password (leave empty if you use Google sign in)</div><input class="sin" type="password" data-dpw autocomplete="current-password" maxlength="100">
<div class="sfl">Type DELETE to confirm</div><input class="sin" data-dcf autocapitalize="characters" autocomplete="off" maxlength="10">
<button class="sbtn red" type="button" data-send style="margin-top:18px">DELETE MY ACCOUNT</button><div class="snote" data-dnote>You need an internet connection to delete your account.</div>`;
    SCREENS.push(legal('Terms of Service','Terms of using StudyOS',TERMS),legal('Privacy Policy','How StudyOS handles your data',PRIV),
      {t:'Delete account',d:'Permanently delete your account and data',g:'Settings pages',spec:{m:'Warning list and two fields.',h:'Light tap, success pattern when done.',s:'No sounds.'},html:()=>scr('Delete account',DEL()),
       play(){S.mute=false;rise();
         R.onclick=async e=>{
          if(e.target.closest('[data-back]')){hap('light');go(IDX('Privacy settings'));return}
          const b=e.target.closest('[data-send]');if(!b||b.dataset.busy)return;
          if(D.guest){hap('light');toast('You have no account to delete.');return}
          if(D.online===false){hap('light');toast('Connect to the internet to delete your account.');return}
          if($('[data-dcf]',R).value.trim().toUpperCase()!=='DELETE'){hap('light');toast('Type DELETE to confirm.');return}
          b.dataset.busy=1;hap('press');const t0=b.textContent;b.textContent='DELETING...';
          let r={ok:false,message:'Could not delete your account.'};try{if(CB.deleteAccount)r=await CB.deleteAccount($('[data-dpw]',R).value)}catch(_){}
          if(!r.ok&&R&&R.isConnected){delete b.dataset.busy;b.textContent=t0;hap('light');toast(r.message||'Could not delete your account.')}}}});
    /* point the existing buttons and links at them */
    const hook=(t,fn)=>{const k=IDX(t),p=SCREENS[k].play;SCREENS[k].play=()=>{p();const old=R.onclick;R.onclick=e=>fn(e)||old(e)}};
    hook('Privacy settings',e=>{if(e.target.closest('[data-del]')){hap('light');go(IDX('Delete account'));return true}});
    hook('Edit profile',e=>{if(e.target.closest('[data-del]')){hap('light');go(IDX('Delete account'));return true}});
    {const k=IDX('Settings');
      const sp=SCREENS[k].play;SCREENS[k].play=()=>{sp();const old=R.onclick;R.onclick=e=>{const l=e.target.closest('[data-legal]');if(l){hap('light');go(IDX(l.dataset.legal));return}old(e)}}}
    hook('Privacy settings',e=>{const l=e.target.closest('[data-legal]');if(l){hap('light');go(IDX(l.dataset.legal));return true}});
  }

  /* demo-only screens that nothing in the app opens */
  ['Widgets','Daily goal reached','Focus timer'].forEach(t=>{const k=IDX(t);if(k>=0)SCREENS.splice(k,1)});

  /* Settings > Appearance > App icon (dynamic launcher icon) */
  {let AIC_SUP=false;appIconSupported().then(v=>{AIC_SUP=v}).catch(e=>console.warn('[AppIcon] support check failed',e));
   SCREENS.push({t:'App icon',d:'Dynamic app icon: automatic, choose, reset',g:'Settings pages',spec:{m:'The current icon and the list rise in.',h:'Light tap on every control.',s:NS},
     html:()=>`<div class="scr n nd" style="--pg:#181b22"><div class="ss"><div class="shd"><button class="sbk" type="button" data-back aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg></button><b>App icon</b></div><div class="ssc">${appIconPageBody(AIC_SUP)}</div></div></div>`,
     play(){S.mute=false;$$('.ss .ssc .aic > *',R).forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:340,delay:i*40,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
       const rer=()=>{const c=$('.ssc',R);if(c)c.innerHTML=appIconPageBody(AIC_SUP)};
       const own=bindAppIconPage(R,rer,hap);const mine=R.onclick;
       R.onclick=e=>{if(e.target.closest('[data-back]')){sfx.tick();hap('light');go(IDX('Settings'));return}if(mine(e))return};}});
   const k=IDX('Settings'),sh=SCREENS[k].html;SCREENS[k].html=()=>sh().replace(/(<div class="sit" data-it="Appearance">[\s\S]*?<\/div>)/,'$1'+appIconRowHtml());
   const sp=SCREENS[k].play;SCREENS[k].play=()=>{sp();const old=R.onclick;R.onclick=e=>{if(e.target.closest('[data-it="App icon"]')){hap('light');go(IDX('App icon'));return}old(e)}}}

  /* Settings list: no dead rows */
  {const k=IDX('Settings'),sh=SCREENS[k].html;SCREENS[k].html=()=>{let h=sh();
    h=h.replace(/<div class="sit" data-it="Accessibility">[\s\S]*?<\/svg><\/div>/,'');
    const L=D.links||{};const lk=[L.terms&&['TERMS',L.terms],L.privacy&&['PRIVACY POLICY',L.privacy]].filter(Boolean);
    h=h.replace(/<div class="slk">[\s\S]*?<\/div>(?=<\/div><\/div><\/div>$)/,'<div class="slk"><span data-legal="Terms of Service">TERMS</span><span data-legal="Privacy Policy">PRIVACY POLICY</span></div>');
    return h};
    const sp=SCREENS[k].play;SCREENS[k].play=()=>{sp();const old=R.onclick;R.onclick=e=>{const u=e.target.closest('[data-url]');if(u){hap('light');try{window.open(u.dataset.url,'_blank')}catch(_){}return}old(e)}}}

  /* Profile QR: a real code for the invite link */
  {const k=IDX('Profile QR'),qh=SCREENS[k].html,qp=SCREENS[k].play;
    const realQr=()=>{try{const q=qrcode(0,'H');q.addData(D.inviteUrl||'https://studyos.app');q.make();const n=q.getModuleCount(),m=1,s=n+m*2;let d='';
      const fin=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7),mid=(r,c)=>Math.abs(r-n/2+.5)<n*.12&&Math.abs(c-n/2+.5)<n*.12;
      for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!q.isDark(r,c)||fin(r,c)||mid(r,c))continue;d+=`<rect x="${c+m+.06}" y="${r+m+.06}" width=".88" height=".88" rx=".4"/>`}
      let f='';[[0,0],[0,n-7],[n-7,0]].forEach(([r,c])=>{const x=c+m,y=r+m;f+=`<rect x="${x+.5}" y="${y+.5}" width="6" height="6" rx="1.9" fill="none" style="stroke:var(--qm,#181b22)" stroke-width="1"/><rect x="${x+2}" y="${y+2}" width="3" height="3" rx="1" style="fill:var(--qm,#181b22)"/>`});
      return `<svg viewBox="0 0 ${s} ${s}"><g style="fill:var(--qm,#181b22)">${d}</g>${f}</svg>`}catch(_){return ''}};
    const overlay=()=>{const h=qh();const i=h.indexOf('<div class="ov"');return h.slice(i)};
    SCREENS[k].html=()=>(SCREENS[IDX('Profile')].html().replace(/<\/div><\/div>$/,'')+overlay()).replace(/(<div class="qimg">)[\s\S]*?<\/svg>/,'$1'+realQr()).replace('Friends scan this to add you on StudyOS.','Friends scan this to get StudyOS.').replace(/(<button type="button") data-sh>(<svg(?:(?!<\/button>)[\s\S])*?)Save<\/button>/,'$1 data-qrsave>$2Save</button>');

    // Save: draws only the card (QR code, logo, name, @username, StudyOS) into a PNG for the gallery.
    const qrCardSave=async()=>{
      const inner=s=>{const m=String(s||'').match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/);return m?{vb:m[1],body:m[2]}:null};
      const q=inner(realQr()),lg=inner(LOGO),W=640,H=820,nm=esc(D.fullName||'Student'),hn=esc('@'+(D.username||'student'));
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232b33"/><stop offset="1" stop-color="#181b22"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="48" fill="url(#g)"/><rect x="60" y="60" width="520" height="520" rx="40" fill="#ffffff"/>
${q?`<svg x="90" y="90" width="460" height="460" viewBox="${q.vb}">${q.body}</svg>`:''}
<rect x="272" y="272" width="96" height="96" rx="22" fill="#1b1e25"/>${lg?`<svg x="290" y="290" width="60" height="60" viewBox="${lg.vb}">${lg.body}</svg>`:''}
<text x="320" y="652" text-anchor="middle" font-family="Fredoka,Nunito,Arial,sans-serif" font-size="46" font-weight="700" fill="#ebe8ea">${nm}</text>
<text x="320" y="700" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="28" font-weight="700" fill="#c9b8c3">${hn}</text>
<text x="320" y="770" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="22" font-weight="700" fill="#76838d">Scan to study with me on StudyOS</text></svg>`;
      const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
      try{const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});
        const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);g.drawImage(img,0,0);
        const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw 0;
        const file=new File([blob],'studyos-'+(D.username||'profile')+'-qr.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'My StudyOS QR code'});return 'shared'}catch(e){if(/abort|cancel/i.test(String(e&&e.name||e)))return 'cancel'}}
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);return 'saved'
      }catch(_){return 'fail'}finally{URL.revokeObjectURL(url)}};
    SCREENS[k].play=()=>{qp();const old=R.onclick;R.onclick=e=>{
      const sv=e.target.closest('[data-qrsave]');if(sv){if(sv.dataset.busy)return;sv.dataset.busy=1;hap('medium');sv.animate([{transform:'scale(.93)'},{transform:'none'}],{duration:200});
        qrCardSave().then(r=>{delete sv.dataset.busy;if(r==='saved')toast('QR card saved');else if(r==='shared')toast('Choose "Save to gallery" to keep it');else if(r==='fail')toast('Could not save the card')});return}
      const b=e.target.closest('[data-sh]');
      if(b){const txt=en0(b).trim();
        if(/Copy/.test(txt)){try{navigator.clipboard.writeText(D.inviteUrl||'').then(()=>toast('Link copied')).catch(()=>toast('Could not copy'))}catch(_){toast('Could not copy')}hap('medium');return}
        if(/Share/.test(txt)){hap('medium');if(CB.invite)CB.invite();return}}
      old(e)}}}

  /* Skeleton loading in the app's own look */
  {const bar=(w,h,x)=>`<div class="sk" style="width:${w};height:${h}px;${x||''}"></div>`;
    const rowsS=n=>Array.from({length:n},(_,i)=>`<div class="skc" style="margin-top:${i?10:0}px;display:flex;align-items:center;gap:12px"><div class="sk" style="width:26px;height:26px;border-radius:9px;flex:none"></div><div style="flex:1;display:grid;gap:8px">${bar(i%2?'64%':'78%',13)}${bar('38%',10)}</div></div>`).join('');
    const SK={
      Home:()=>`<div class="pg">${tb()}${bar('46%',26,'margin-top:14px')}${bar('34%',14,'margin-top:10px')}
<div class="skc" style="margin-top:18px;display:flex;align-items:center;gap:18px;padding:20px"><div class="sk" style="width:92px;height:92px;border-radius:50%;flex:none"></div><div style="flex:1;display:grid;gap:10px">${bar('70%',16)}${bar('50%',12)}${bar('62%',12)}</div></div>
<div style="margin-top:20px">${bar('30%',18)}</div><div style="margin-top:12px">${rowsS(3)}</div></div>${nav('home')}`,
      Tasks:()=>`<div class="pg">${tb()}${bar('32%',26,'margin-top:14px')}${bar('62%',13,'margin-top:10px')}${bar('100%',40,'margin-top:16px;border-radius:20px')}<div style="margin-top:16px">${rowsS(5)}</div></div>${nav('tasks')}`,
      Study:()=>`<div class="pg">${tb()}${bar('32%',26,'margin-top:14px')}${bar('58%',13,'margin-top:10px')}<div style="margin-top:16px;display:grid;gap:10px">${[0,1,2,3].map(()=>`<div class="skc" style="padding:18px;display:grid;gap:10px">${bar('46%',16)}${bar('72%',12)}</div>`).join('')}</div></div>${nav('study')}`,
      Friends:()=>`<div class="pg">${tb()}${bar('38%',26,'margin-top:14px')}<div style="margin-top:18px">${Array.from({length:5},(_,i)=>`<div class="skc" style="margin-top:${i?10:0}px;display:flex;align-items:center;gap:12px"><div class="sk" style="width:40px;height:40px;border-radius:50%;flex:none"></div><div style="flex:1;display:grid;gap:8px">${bar('50%',14)}${bar('28%',10)}</div>${bar('34px',14)}</div>`).join('')}</div></div>${nav('profile')}`
    };
    Object.keys(SK).forEach(t=>{const k=IDX(t);if(k<0)return;const oh=SCREENS[k].html,op=SCREENS[k].play;
      SCREENS[k].html=()=>D.loading?wrapD(`<div role="status" aria-label="Loading your data" style="display:contents">${SK[t]()}</div>`):oh();
      SCREENS[k].play=()=>{if(D.loading){S.mute=false;return}op()}})}
}
/* ---- tab bar ---- */
/* ---- More menu: a small sheet above the tab bar with Shop and Profile ---- */
let MOREON=false,MOREPREV=null,MOREADDED=false;
const MORE_ICONS={
  shop:'',
  profile:'<svg viewBox="0 0 24 24"><circle cx="12" cy="7.500" r="4.500" fill="#a98fa0"/><path d="M3.500 21c0-4.500 3.800-7 8.500-7s8.500 2.500 8.500 7z" fill="#a98fa0"/></svg>'
};
function openMore(still){
  const nv=R&&R.querySelector?R.querySelector('.nv[data-k="more"]'):null;
  if(!nv)return false;
  R.querySelectorAll('.more-menu.out,.more-sc.out').forEach(x=>x.remove());
  if(R.querySelector('.more-menu'))return false;
  R.insertAdjacentHTML('beforeend',`<div class="more-sc${still?' still':''}" data-moresc></div><div class="more-menu${still?' still':''}" role="menu" aria-label="More"><button type="button" class="more-row" role="menuitem" data-more="shop"><span class="mi">${DZ.gemSvg||MORE_ICONS.shop}</span>Shop</button><button type="button" class="more-row" role="menuitem" data-more="profile"><span class="mi">${MORE_ICONS.profile}</span>Profile</button></div>`);
  if(!MOREON){const cur=R.querySelector('.nv.on');MOREADDED=!nv.classList.contains('on');MOREPREV=cur&&cur!==nv?cur:null}
  MOREON=true;
  if(MOREPREV)MOREPREV.classList.remove('on');
  nv.classList.add('on');
  placeLamp(!still);
  return true;
}
// instant=true when the screen is about to change anyway.
function closeMore(instant){
  const was=MOREON;MOREON=false;
  if(!R||!R.querySelectorAll){MOREPREV=null;return was}
  const els=R.querySelectorAll('.more-sc:not(.out),.more-menu:not(.out)');
  els.forEach(el=>{if(instant)el.remove();else{el.classList.add('out');setTimeout(()=>{if(el.parentNode)el.remove()},240)}});
  const nv=R.querySelector('.nv[data-k="more"]');
  if(nv&&MOREADDED)nv.classList.remove('on');
  if(MOREPREV&&MOREPREV.isConnected)MOREPREV.classList.add('on');
  placeLamp(!instant);
  MOREPREV=null;MOREADDED=false;
  return was||els.length>0;
}
DZ.closeMore=()=>closeMore();
host.addEventListener('click',e=>{
  const mi=e.target.closest('[data-more]');
  if(mi){
    e.stopPropagation();hap('tick');
    const which=mi.dataset.more,from=SCREENS[CUR]&&SCREENS[CUR].t;
    closeMore(true);
    if(which==='shop'){if(DZ.openShop)DZ.openShop(from||'Home')}
    else{if(opts.onTab)opts.onTab('profile');if(from!=='Profile')go('Profile')}
    return;
  }
  if(e.target.closest('[data-moresc]')){e.stopPropagation();hap('light');closeMore();return}
  const n=e.target.closest('.nv[data-k]');if(!n)return;
  const k=n.dataset.k;hap('tick');
  if(k==='more'){e.stopPropagation();if(MOREON)closeMore();else openMore();return}
  if(k==='league'){if(MOREON)closeMore();if(SCREENS[CUR]&&SCREENS[CUR].t!=='League')go('League');return}
  if(MOREON)closeMore();
  if(opts.onTab)opts.onTab(k);
  const m={home:'Home',tasks:'Tasks',focus:'Focus',study:'Study'}[k];
  if(m&&SCREENS[CUR].t!==m)go(m);
},true);
/* ---- Friend profile: a friend's real study numbers, opened from Profile or Friends ---- */
{
  let FP={id:'',from:'Profile',loading:false,data:null,err:'',rm:false,gift:false,busy:false,msg:'',sheet:null,reason:''};
  const fpCol=s=>{const A=['#e85a5a','#c7b9c4','#9fb6c3','#c9c4a6','#b4c7b0','#d0b09f'];let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return A[h%A.length]};
  const X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const flameFor=n=>flameIconHtml(30,(+n||0)>0?'red':'grey');
  const PPL='<svg viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c.6-3.600 3.200-5.400 6.500-5.400s5.900 1.800 6.500 5.400M16 4.800a3.200 3.200 0 0 1 0 6.200M18.500 14.800c1.800.7 2.800 2.300 3 5.200"/></svg>';
  const CLK='<svg viewBox="0 0 24 24" fill="none" stroke="#7dd3a8" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.500 1.500M9 3h6"/></svg>';
  const TSK='<svg viewBox="0 0 24 24" fill="none" stroke="#b9a7ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.500 12.500l2.500 2.500 4.500-5"/></svg>';
  const FCS='<svg viewBox="0 0 24 24" fill="none" stroke="#ffd166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/></svg>';
  const num=n=>(Number(n)||0).toLocaleString();
  const mins=m=>{m=Math.max(0,Math.round(Number(m)||0));if(m<60)return m+'m';const h=Math.floor(m/60),r=m%60;return r?h+'h '+r+'m':h+'h'};
  const first=n=>String(n||'Friend').split(' ')[0];
  const sum=a=>(a||[]).reduce((t,x)=>t+(x.minutes||0),0);

  function chart(fr,me){
    const W=320,H=150,L=34,R=8,T=10,B=24,iw=W-L-R,ih=H-T-B;
    const top=Math.max(30,...fr.map(x=>x.minutes),...me.map(x=>x.minutes));
    const step=Math.ceil(top/3/10)*10,max=step*3;
    const X=i=>L+(iw*i)/Math.max(1,fr.length-1),Y=v=>T+ih-(ih*v)/max;
    let g='';for(let k=0;k<=3;k++){const y=Y(step*k);g+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="#2a323a" stroke-width="2"/><text x="${L-6}" y="${y+4}" text-anchor="end" font-size="11" font-weight="600" fill="#76838d">${step*k}</text>`}
    const line=(a,c,w)=>`<polyline fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" points="${a.map((p,i)=>X(i)+','+Y(p.minutes)).join(' ')}"/>`+a.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.minutes)}" r="${w+1.5}" fill="${c}"/>`).join('');
    const lab=fr.map((p,i)=>`<text x="${X(i)}" y="${H-6}" text-anchor="middle" font-size="12" font-weight="600" fill="#76838d">${p.label}</text>`).join('');
    return `<svg class="fp-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutes studied in the last 7 days">${g}${line(me,'#8b98a2',2.5)}${line(fr,'#4fc3f7',3)}${lab}</svg>`;
  }

  const avatar=(name,pic)=>(!pic&&DZ.fxNoPic)?DZ.fxNoPic:pic?`<img class="fp-img" src="${esc(pic)}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${esc((name||'?').charAt(0).toUpperCase())}'}))">`:`<span>${esc((name||'?').charAt(0).toUpperCase())}</span>`;

  const BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>';
  const QRI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><path d="M14 14h3v3h-3zM19 14h2M14 19h2M18 18h3v3h-3z" stroke-linecap="round"/></svg>';
  const PFR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.6" fill="currentColor" stroke="none"/><path d="M2.5 20.5c.6-3.800 3.200-5.800 6.500-5.800s5.900 2 6.500 5.800z" fill="currentColor" stroke="none"/><path d="M16 11.500l2.600 2.600 4.400-5"/></svg>';
  const FUSR='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3.600"/><path d="M2.500 20.500c.6-3.800 3.200-5.800 6.500-5.800s5.900 2 6.500 5.800z"/><path d="M19 8v8M15 12h8" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/></svg>';
  const FLG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4.500h12.500l-2.300 3.800 2.300 3.800H5"/></svg>';
  const NOP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M5.600 5.600l12.800 12.800"/></svg>';
  const REASONS=[['spam','Spam or advertising'],['harassment','Harassment or bullying'],['inappropriate','Inappropriate name or picture'],['fake','Fake or impersonating account'],['other','Something else']];
  // Achievements are worked out from the friend's real numbers: the highest step reached in each group.
  const STEPS={streak:[3,7,14,30,60,100,200,365],hours:[1,5,10,25,50,100,250,500],tasks:[5,10,25,50,100,250,500,1000],sessions:[3,5,10,25,50,100,250]};
  const BCOL={streak:['#ff7a45','#a8431c'],hours:['#4fc3f7','#1f7aa3'],tasks:['#b9a7ff','#6a54c9'],sessions:['#ffd166','#b8861b']};
  const BICO={
    streak:'<path d="M32 17c1.800 6 8.500 9 8.500 17a8.500 8.500 0 0 1-17 0c0-3.400 1.700-5.800 3.700-8 .4 2.700 1.700 4 3 4.400-1-4.800-.2-9.400 1.800-13.400z" fill="#fff"/>',
    hours:'<circle cx="32" cy="32" r="12" fill="none" stroke="#fff" stroke-width="3.400"/><path d="M32 25v7.500l5 3" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/>',
    tasks:'<rect x="21" y="21" width="22" height="22" rx="6" fill="none" stroke="#fff" stroke-width="3.400"/><path d="M26.500 32.500l4 4 7.500-8.500" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/>',
    sessions:'<circle cx="32" cy="32" r="12.500" fill="none" stroke="#fff" stroke-width="3.400"/><circle cx="32" cy="32" r="4.500" fill="#fff"/>'
  };
  const badge=(kind,value)=>{
    const st=STEPS[kind];let hit=0;for(const x of st)if(value>=x)hit=x;
    const on=hit>0,n=on?hit:st[0],[c1,c2]=on?BCOL[kind]:['#4a5963','#2b363d'];
    return `<div class="fp-bdg${on?'':' off'}"><svg viewBox="0 0 64 78" aria-label="${kind} ${n}${on?'':' locked'}"><path d="M32 3 57 14v24c0 14-10.500 24-25 31C17.500 62 7 52 7 38V14z" fill="${c2}"/><path d="M32 7 53 16.500V38c0 11.500-8.500 20-21 26C19.500 58 11 49.500 11 38V16.500z" fill="${c1}"/>${BICO[kind]}<g><rect x="9" y="58" width="46" height="17" rx="8.500" fill="#131f24" stroke="${c1}" stroke-width="2.200"/><text x="32" y="71" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-size="12.500" font-weight="800" fill="#fff">${n}</text></g></svg></div>`;
  };
  // The friend's own avatar character (made in Edit avatar), or '' when they have none.
  const fpChr=(code,view)=>{if(!code||typeof code!=='string')return '';try{return avatarSvg(avDecode(code),{view:view||'full'})}catch(_){return ''}};
  // "Followed by" row: friends you both have.
  const mutualRow=(d,name,col,pic)=>{
    const m=Array.isArray(d.mutual)?d.mutual.filter(x=>x&&x.name):[],more=Math.max(0,(Number(d.mutualCount)||m.length)-m.length);
    if(!m.length){const fa=DZ.pfFace?DZ.pfFace(FP.id,d.avatar,pic):esc(name.charAt(0).toUpperCase()),me=DZ.pfFace?DZ.pfFace('me',D.avatar,''):myInitial();
      return `<div class="fp-tog"><span class="fp-pp"><span class="fp-pa" style="background:${col}">${fa}</span><span class="fp-pa me" style="background:${DZ.fxCol?DZ.fxCol(D.first||'You'):'#4fc3f7'}">${me}</span></span><span>You and <b>${esc(first(name))}</b> are study friends</span></div>`}
    const faces=m.slice(0,3).map(x=>{const a=DZ.fxChr?DZ.fxChr(x.id,x.avatar,'face'):fpChr(x.avatar,'face');return `<span class="fp-pa" style="background:${fpCol(x.name)}">${a||(x.picture?`<img src="${esc(x.picture)}" alt="" referrerpolicy="no-referrer">`:(DZ.fxNoPic||esc(String(x.name).charAt(0).toUpperCase())))}</span>`}).join('');
    const names=m.slice(0,3).map(x=>`<b>${esc(first(x.name))}</b>`);
    const list=names.length===1?names[0]:names.slice(0,-1).join(', ')+(more?', '+names[names.length-1]:' and '+names[names.length-1]);
    return `<div class="fp-tog"><span class="fp-pp">${faces}</span><span>Followed by ${list}${more?` and <b>${more} other${more===1?'':'s'}</b>`:''}</span></div>`;
  };
  // The same badges as the Badges page, worked out from the friend's numbers.
  const fxList=d=>{
    const t=d.tasksDone||0,s=d.streak||0,h=d.hours||0,n=d.notesCount||0,ss=d.sessions||0;
    const L=(label,key,cur,need)=>[label,cur>=need,key,cur,need];
    return [L('First task','first-task',t,1),L('10 tasks','10-tasks',t,10),L('50 tasks','50-tasks',t,50),L('100 tasks','100-tasks',t,100),
      L('3 day streak','3-day-streak',s,3),L('7 day streak','7-day-streak',s,7),L('14 day streak','14-day-streak',s,14),L('30 day streak','30-day-streak',s,30),L('100 day streak','100-day-streak',s,100),
      L('First session','first-session',ss,1),L('10 sessions','10-sessions',ss,10),L('5 hours','5-hours',h,5),L('20 hours','20-hours',h,20),L('50 hours','50-hours',h,50),
      L('First note','first-note',n,1),L('10 notes','10-notes',n,10)];
  };
  const fxOne=(b,prog)=>`<div class="badge${b[1]?'':' lk'}"><div class="bimg">${DZ.badgeArt(b[2])}${b[1]?'':`<i class="lkc">${DZ.LOCKI||''}</i>`}</div><span>${b[0]}</span>${!b[1]&&prog?`<small class="bprog">${Math.min(b[3],b[4])>=1?Math.floor(Math.min(b[3],b[4])):0} / ${b[4]}</small>`:''}</div>`;
  // Newest first: a badge whose number was only just passed was earned most recently (the server keeps no dates for friends).
  const fxRec=b=>b[4]/Math.max(1,b[3]);
  const fxBadges=d=>{
    if(!DZ.badgeArt)return '';
    const all=fxList(d),on=all.filter(b=>b[1]).sort((x,y)=>fxRec(y)-fxRec(x)),off=all.filter(b=>!b[1]);
    return on.slice(0,4).concat(off).slice(0,4).map(b=>fxOne(b)).join('');
  };
  const FCHV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const myInitial=()=>esc(String(D.fullName||D.name||'Y').trim().charAt(0).toUpperCase()||'Y');
  const handleOf=(name,d)=>d&&d.username?d.username:String(name||'friend').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,18)||'friend';
  FP.handle=handleOf;

  const sheetHtml=name=>{
    if(FP.sheet==='report')return `<div class="fp-ov" data-fpsx></div><div class="fp-sh" role="dialog" aria-label="Report ${esc(name)}"><i class="fp-grab"></i><h2>Report ${esc(name)}</h2><p>Why are you reporting this person? Your report is private.</p>${REASONS.map(([k,l])=>`<button type="button" class="fp-rs${FP.reason===k?' on':''}" data-fpr="${k}"><span class="fp-rd"></span>${l}</button>`).join('')}<button type="button" class="fp-sbtn${FP.reason?'':' off'}" data-fpsend>SEND REPORT</button><button type="button" class="fp-scn" data-fpsx>CANCEL</button></div>`;
    if(FP.sheet==='block')return `<div class="fp-ov" data-fpsx></div><div class="fp-sh" role="dialog" aria-label="Block ${esc(name)}"><i class="fp-grab"></i><h2>Block ${esc(name)}?</h2><p>They will be removed from your friends. They will not be able to find you or send you a friend request.</p><button type="button" class="fp-sbtn red" data-fpdoblock>BLOCK</button><button type="button" class="fp-scn" data-fpsx>CANCEL</button></div>`;
    return '';
  };

  const html=()=>{
    const list=(D.friends||[]).find(f=>f.id===FP.id)||{};
    const d=FP.data||{};
    const name=d.name||list.name||'Friend',pic=d.picture||list.picture||'';
    const col=fpCol(name),ready=!!FP.data;
    if(d.avatar)DZ.avCache[FP.id]=d.avatar;
    const chr=(DZ.fxChr?DZ.fxChr(FP.id,d.avatar,'full'):fpChr(d.avatar,'full'));
    const price=(D.shop&&D.shop.prices&&D.shop.prices.gift)||25;
    const sk=t=>ready?t:'<i class="fp-sk"></i>';
    const body=FP.err&&!ready
      ?`<div class="fp-err"><p>${esc(FP.err)}</p><button type="button" class="fp-btn" data-fpretry>TRY AGAIN</button></div>`
      :`<div class="fp-handle">@${esc(handleOf(name,d)).toUpperCase()}${d.joinedYear?' · JOINED '+esc(d.joinedYear):''}</div>
<div class="fp-3 fx-3s"><div><b><i>${flameFor(d.streak)}</i>${sk(num(d.streak))}</b><small>Day streak</small></div><div><b><i>${PPL}</i>${sk(num(d.friendsCount))}</b><small>Friends</small></div><div><b><i>${CUBE}</i>${sk(num(d.gems!=null?d.gems:list.gems))}</b><small>Gems</small></div></div>
${mutualRow(d,name,col,pic)}
<div class="fp-act2">${FP.unf?`<button type="button" class="fp-fb fp-follow" data-fpfollow aria-label="Follow ${esc(first(name))}">${FUSR}<span>${FP.req?'REQUESTED':'FOLLOW'}</span></button>`:`<button type="button" class="fp-fb${FP.unc?' armed':''}" data-fpunf aria-label="${FP.unc?'Tap again to unfollow':'Following. Tap to unfollow'}">${PFR}<span>${FP.unc?'UNFOLLOW?':'FOLLOWING'}</span></button>`}<button type="button" class="fp-qb" data-fpqr aria-label="Share ${esc(first(name))}'s profile">${QRI}</button></div>
${FP.msg?`<div class="fp-msg${FP.msgOk?' ok':''}" role="status">${esc(FP.msg)}</div>`:''}
<div class="fp-sec">WEEKLY PROGRESS</div>
${ready?chart(d.week||[],d.meWeek||[]):'<div class="fp-chart fp-sk" style="height:150px"></div>'}
<div class="fp-leg"><span class="fp-dot" style="background:#4fc3f7"></span><b>${esc(name)}</b><em>${ready?mins(sum(d.week)):'…'}</em></div>
<div class="fp-leg"><span class="fp-dot" style="background:#8b98a2"></span><b>You</b><em>${ready?mins(sum(d.meWeek)):'…'}</em></div>
<div class="fp-sec">OVERVIEW</div>
<div class="fp-grid">
  <div><span class="fp-ico">${flameFor(d.streak)}</span><b>${sk(num(d.streak)+(d.streak===1?' day':' days'))}</b></div>
  <div><span class="fp-ico">${CUBE}</span><b>${sk(num(d.gems!=null?d.gems:list.gems)+' gems')}</b></div>
  <div><span class="fp-ico">${CLK}</span><b>${sk(num(d.hours)+' hours')}</b></div>
  <div><span class="fp-ico">${TSK}</span><b>${sk(num(d.tasksDone)+(d.tasksDone===1?' task':' tasks'))}</b></div></div>
<div class="fp-sec fp-ach" data-fpbdg role="button" aria-label="Open all achievements"><span>ACHIEVEMENTS</span><i class="fp-ch">${FCHV}</i></div>
<div class="fp-bds fx-bds"${ready?' data-fpbdg':''}>${ready?fxBadges(d):'<i class="fp-sk" style="width:100%;height:84px;border-radius:16px"></i>'}</div>
${FP.unf?'':`<button type="button" class="fp-rm${FP.rm?' armed':''}" data-fprm>${FP.rm?'TAP AGAIN TO REMOVE '+esc(first(name)).toUpperCase():'REMOVE FRIEND'}</button>`}
<div class="fp-dgs"><button type="button" class="fp-dg" data-fpreport>${FLG}<span>REPORT USER</span></button><button type="button" class="fp-dg" data-fpblock>${NOP}<span>BLOCK USER</span></button></div>`;
    return `<div class="scr n nd fx3" style="--pg:#181b22"><div class="fp" data-fpscroll>
<div class="fp-hero has-chr fx-hero"><i class="fx-hb1"></i><i class="fx-hb2"></i>${chr?`<div class="fp-chr" aria-hidden="true">${chr}</div>`:`<div class="fp-av" style="--c:${col}">${avatar(name,pic)}</div>`}</div>
<div class="fp-body">${body}</div></div>
<div class="fp-bar"><button type="button" class="fp-bk" data-fpback aria-label="Back">${BACK}</button><h1>${esc(name)}</h1><span class="fp-bsp"></span></div>${sheetHtml(name)}</div>`;
  };

  const load=async()=>{
    const id=FP.id;FP.loading=true;FP.err='';
    let r=null;try{r=CB.friendProfile?await CB.friendProfile(id):null}catch(_){r=null}
    if(FP.id!==id)return;
    FP.loading=false;
    if(r&&r.ok)FP.data=r.data;else FP.err=(r&&r.message)||'Could not load this profile. Try again.';
    if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')go('Friend profile',true);
  };

  // Repaint without losing the scroll position.
  const redraw=()=>{const sc=R&&R.querySelector('[data-fpscroll]'),y=sc?sc.scrollTop:0;go('Friend profile',true);const n=R&&R.querySelector('[data-fpscroll]');if(n)n.scrollTop=y};
  const sheet=(kind)=>{
    FP.sheet=kind;if(!kind)FP.reason='';
    const old=R.querySelectorAll('.fp-ov,.fp-sh');old.forEach(x=>x.remove());
    if(!kind)return;
    const name=(FP.data&&FP.data.name)||((D.friends||[]).find(f=>f.id===FP.id)||{}).name||'Friend';
    R.insertAdjacentHTML('beforeend',sheetHtml(name));
    const sh=R.querySelector('.fp-sh'),ov=R.querySelector('.fp-ov');
    if(ov)ov.animate([{opacity:0},{opacity:1}],{duration:140,fill:'backwards'});
    if(sh)sh.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:220,easing:'cubic-bezier(.22,.9,.28,1)',fill:'backwards'});
  };
  const play=()=>{
    const sc=R.querySelector('[data-fpscroll]'),bar=R.querySelector('.fp-bar');
    if(sc&&bar){const hero=sc.querySelector('.fp-hero');const sw=()=>bar.classList.toggle('sc',sc.scrollTop>12);sc.addEventListener('scroll',sw,{passive:true});sw()}
    R.onclick=async e=>{
      const t=e.target;
      if(t.closest('[data-fpsx]')){hap('light');sheet(null);return}
      if(t.closest('[data-fpr]')){const b=t.closest('[data-fpr]');FP.reason=b.dataset.fpr;hap('light');R.querySelectorAll('[data-fpr]').forEach(x=>x.classList.toggle('on',x===b));const sb=R.querySelector('[data-fpsend]');if(sb)sb.classList.remove('off');return}
      if(t.closest('[data-fpsend]')){
        if(!FP.reason){hap('buzz');toast('Choose a reason first.');return}
        const sb=t.closest('[data-fpsend]');if(sb.classList.contains('busy'))return;sb.classList.add('busy');sb.textContent='SENDING…';
        let r=null;try{r=CB.reportFriend?await CB.reportFriend(FP.id,FP.reason):null}catch(_){r=null}
        if(SCREENS[CUR]&&SCREENS[CUR].t!=='Friend profile')return;
        sheet(null);
        if(r&&r.ok){hap('success');toast('Report sent. Thank you for keeping StudyOS safe.')}else{hap('buzz');toast((r&&r.message)||'Could not send your report. Try again.')}
        return}
      if(t.closest('[data-fpdoblock]')){
        const bb=t.closest('[data-fpdoblock]');if(bb.classList.contains('busy'))return;bb.classList.add('busy');bb.textContent='BLOCKING…';
        const nm=(FP.data&&FP.data.name)||((D.friends||[]).find(f=>f.id===FP.id)||{}).name||'This person';
        let r=null;try{r=CB.blockFriend?await CB.blockFriend(FP.id):null}catch(_){r=null}
        if(SCREENS[CUR]&&SCREENS[CUR].t!=='Friend profile')return;
        if(r&&r.ok){
          D.friends=(D.friends||[]).filter(f=>String(f.id)!==String(FP.id));
          hap('press');sheet(null);
          go(DZ.fpFrom&&DZ.fpFrom!=='Friend profile'?DZ.fpFrom:'Profile');toast(nm+' is blocked.');
        }else{hap('buzz');sheet(null);toast((r&&r.message)||'Could not block this person. Try again.')}
        return}
      if(t.closest('[data-fpbdg]')){if(!FP.data)return;hap('light');go('Friend badges');return}
      if(t.closest('[data-fpback]')){back();return}
      if(t.closest('[data-fpreport]')){hap('light');sheet('report');return}
      if(t.closest('[data-fpblock]')){hap('light');sheet('block');return}
      if(t.closest('[data-fpqr]')){hap('medium');const d=FP.data||{},l=(D.friends||[]).find(f=>f.id===FP.id)||{};const nm=d.name||l.name||'Friend';DZ.fsBack='';DZ.fsData={id:FP.id,name:nm,pic:d.picture||l.picture||'',handle:handleOf(nm,d),col:fpCol(nm),avatar:d.avatar||''};go('Friend share');return}
      if(t.closest('[data-fpretry]')){hap('light');FP.err='';FP.data=null;go('Friend profile',true);load();return}
      if(t.closest('[data-fpunf]')){
        if(!FP.unc){hap('light');FP.unc=true;redraw();setTimeout(()=>{if(FP.unc){FP.unc=false;if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')redraw()}},3500);return}
        FP.unc=false;hap('press');const id=FP.id;
        let r=null;try{r=CB.removeFriend?await CB.removeFriend(id):null}catch(_){r=null}
        if(r&&r.ok!==false){FP.unf=true;FP.req=false;D.friends=(D.friends||[]).filter(f=>String(f.id)!==String(id));toast('Unfollowed '+((FP.data&&FP.data.name)||'friend').split(' ')[0])}else toast((r&&r.message)||'Could not unfollow. Try again.');
        if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')redraw();return}
      if(t.closest('[data-fpfollow]')){
        if(FP.req)return;hap('press');FP.req=true;redraw();
        let r=null;try{r=CB.sendRequest?await CB.sendRequest(FP.id):null}catch(_){r=null}
        if(r&&r.ok){if(r.status==='friends'){FP.unf=false;FP.req=false;toast('You follow each other again!')}else toast('Follow request sent')}else{FP.req=false;toast((r&&r.error)||'Could not follow. Try again.')}
        if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')redraw();return}
      if(t.closest('[data-fpgift]')){
        if(FP.busy)return;
        if(!FP.gift){hap('light');FP.gift=true;FP.msg='';redraw();return}
        FP.gift=false;FP.busy=true;FP.msg='';redraw();
        let r=null;try{r=CB.shopGift?await CB.shopGift(FP.id):null}catch(_){r=null}
        FP.busy=false;FP.msg=(r&&r.message)||'Could not send the gift. Try again.';FP.msgOk=!!(r&&r.ok);
        hap(FP.msgOk?'success':'light');
        if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')redraw();return}
      if(t.closest('[data-fprm]')){
        if(!FP.rm){hap('light');FP.rm=true;redraw();return}
        FP.rm=false;hap('press');
        optRemoveFriend(FP.id,()=>{if(SCREENS[CUR]&&/^(Profile|Friends|Streak friends)$/.test(SCREENS[CUR].t))go(SCREENS[CUR].t,true)});
        go(DZ.fpFrom&&DZ.fpFrom!=='Friend profile'?DZ.fpFrom:'Profile');toast('Friend removed.')
        return}
      if(FP.rm||FP.gift){FP.rm=false;FP.gift=false;redraw()}
    };
  };
  const FARW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>';
  const fbHtml=()=>{
    const d=FP.data||{},list=(D.friends||[]).find(f=>f.id===FP.id)||{},name=d.name||list.name||'Friend';
    const all=DZ.badgeArt?fxList(d):[],on=all.filter(b=>b[1]).sort((x,y)=>fxRec(y)-fxRec(x)),off=all.filter(b=>!b[1]);
    return `<div class="scr n nd fx3" style="--pg:#181b22"><div class="fp fb" data-fbsc><div class="fb-top"><button type="button" class="fp-bk" data-fbback aria-label="Back">${FARW}</button><h1>${esc(name)}</h1></div>
<div class="fb-body"><p class="fb-sum">${on.length} of ${all.length} achievements unlocked</p>
${on.length?`<div class="fp-sec">UNLOCKED</div><div class="fb-grid">${on.map(b=>fxOne(b)).join('')}</div>`:`<p class="fb-none">${esc(first(name))} has no achievements yet.</p>`}
${off.length?`<div class="fp-sec">LOCKED</div><div class="fb-grid">${off.map(b=>fxOne(b,true)).join('')}</div>`:''}</div></div></div>`;
  };
  const fbPlay=()=>{enter();R.onclick=e=>{if(e.target.closest('[data-fbback]')){back();return}}};
  SCREENS.push({t:'Friend badges',d:'All of a friend\'s achievements',spec:{m:'Every achievement a friend has, unlocked first, then the locked ones with their progress.',h:'Light tap on the back arrow.',s:'No sound on this page.'},html:fbHtml,play:fbPlay});
  SCREENS.push({t:'Friend profile',d:'A friend\'s real study numbers',spec:{m:'Friend streak, friends, gems, weekly minutes compared with yours, overview, achievements, gift, remove, report and block.',h:'Light tap on each press, success when a gift is sent.',s:'No sound on this page.'},html,play});

  /* ---- Friend share: a small page with a profile card, a QR code and ways to send it ---- */
  const fsQr=()=>{try{const q=qrcode(0,'M');q.addData(D.inviteUrl||'https://studyos.app');q.make();const n=q.getModuleCount(),m=1,sz=n+m*2;let d='';
    const fin=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
    for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!q.isDark(r,c)||fin(r,c))continue;d+=`<rect x="${c+m+.05}" y="${r+m+.05}" width=".9" height=".9" rx=".38"/>`}
    let f='';[[0,0],[0,n-7],[n-7,0]].forEach(([r,c])=>{const x=c+m,y=r+m;f+=`<rect x="${x+.5}" y="${y+.5}" width="6" height="6" rx="1.9" fill="none" stroke="#2b2b2e" stroke-width="1"/><rect x="${x+2}" y="${y+2}" width="3" height="3" rx="1" fill="#2b2b2e"/>`});
    return `<svg viewBox="0 0 ${sz} ${sz}" aria-label="QR code"><g fill="#2b2b2e">${d}</g>${f}</svg>`}catch(_){return ''}};
  const IWA='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#25d366"/><path d="M24 11.500a12.300 12.300 0 0 0-10.600 18.500L12 36.500l6.700-1.700A12.300 12.300 0 1 0 24 11.500z" fill="none" stroke="#fff" stroke-width="2.600" stroke-linejoin="round"/><path d="M19.500 18.500c.5-1 1.300-.9 1.800-.2l1 1.800c.3.600 0 1.200-.5 1.700-.3.300-.5.600-.2 1.200 1 1.800 2.400 3 4.300 3.800.6.200.9 0 1.300-.5.500-.6 1.100-.8 1.700-.5l1.800 1c.6.400.6 1-.1 1.800-1.200 1.400-3 1.700-5 .9-3.400-1.300-6.200-4.100-7.100-7.400-.2-.8-.2-1.700.1-2.200z" fill="#fff"/></svg>';
  const IIG='<svg viewBox="0 0 48 48"><defs><linearGradient id="fsig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><circle cx="24" cy="24" r="24" fill="url(#fsig)"/><rect x="13" y="13" width="22" height="22" rx="6.500" fill="none" stroke="#fff" stroke-width="2.800"/><circle cx="24" cy="24" r="5.200" fill="none" stroke="#fff" stroke-width="2.800"/><circle cx="31" cy="17" r="1.700" fill="#fff"/></svg>';
  const IMS='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#e8ebf0"/><path d="M13 20a7 7 0 0 1 7-7h8a7 7 0 0 1 7 7v5a7 7 0 0 1-7 7h-6l-5 4.500V32a7 7 0 0 1-4-7z" fill="#2f6df6"/></svg>';
  const ICP='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#e8ebf0"/><g fill="none" stroke="#2b2f36" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"><rect x="17" y="15" width="16" height="19" rx="3.500"/><path d="M14 30V14.500A2.500 2.500 0 0 1 16.500 12H29"/></g></svg>';
  const IMR='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#e8ebf0"/><g fill="#2b2f36"><circle cx="14.500" cy="24" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="33.500" cy="24" r="3"/></g></svg>';
  const FSLOGO='<svg width="28" height="28" viewBox="0 0 48 48"><path d="M24 8L4 18l20 10 20-10z" fill="#c9b8c3"/><path d="M12 24v9c0 4 6 8 12 8s12-4 12-8v-9l-12 6z" fill="#9d8c98"/><path d="M42 20v14" stroke="#c9b8c3" stroke-width="3" stroke-linecap="round"/></svg>';
  const fsHtml=()=>{const f=DZ.fsData||{name:'Friend',handle:'friend',col:'#c9b8c3',pic:''};
    const ch=DZ.fxChr?DZ.fxChr(f.id,f.avatar,'full'):fpChr(f.avatar,'full');
    const av=ch?`<div class="fs-chr">${ch}</div>`:f.pic?`<img src="${esc(f.pic)}" alt="" referrerpolicy="no-referrer">`:`<span class="fs-np">${DZ.fxNoPic||esc((f.name||'?').charAt(0).toUpperCase())}</span>`;
    return `<div class="scr n nd fx3" style="--pg:#181b22"><div class="fs-dim" data-fsx></div><div class="fs-card"><div class="fs-pic${ch?' chr':''}" style="--c:${f.col}">${av}</div><div class="fs-row"><div class="fs-who"><b>${esc(f.name)}</b><small>${esc(f.handle)}</small><div class="fs-logo">${FSLOGO}<span>StudyOS</span></div></div><div class="fs-qr">${fsQr()}</div></div></div><div class="fs-sheet"><button type="button" class="fs-x" data-fsx aria-label="Close">${X}</button><div class="fs-opts"><button type="button" data-fsi><i>${IIG}</i><span>Instagram</span></button><button type="button" data-fsw><i>${IWA}</i><span>WhatsApp</span></button><button type="button" data-fsm><i>${IMS}</i><span>Messages</span></button><button type="button" data-fss><i><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#e8ebf0"/><g fill="none" stroke="#2b2f36" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"><path d="M24 13v15M18 22.500l6 6 6-6"/><path d="M14 30v3.500a2.500 2.500 0 0 0 2.500 2.500h15a2.500 2.500 0 0 0 2.500-2.500V30"/></g></svg></i><span>Save</span></button><button type="button" data-fso><i>${IMR}</i><span>More</span></button></div></div></div>`};
  // Save: draws the card (picture, name, handle, StudyOS, QR code) into a PNG and saves or shares it.
  const fsSave=async()=>{
    const f=DZ.fsData||{name:'Friend',handle:'friend',col:'#c9b8c3'};
    const W=600,H=560,ch=fpChr(f.avatar,'full');
    const inner=s=>{const m=String(s||'').match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/);return m?{vb:m[1],body:m[2]}:null};
    const a=ch?inner(ch):null,q=inner(fsQr());
    const pic=a?`<svg x="40" y="40" width="520" height="340" viewBox="${a.vb}" preserveAspectRatio="xMidYMax meet">${a.body}</svg>`
      :`<circle cx="300" cy="210" r="120" fill="${f.col}"/><text x="300" y="250" text-anchor="middle" font-family="Arial,sans-serif" font-size="120" font-weight="700" fill="#2a1d1d">${esc(String(f.name||'?').charAt(0).toUpperCase())}</text>`;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" rx="36" fill="#f7f7f7"/><rect x="24" y="24" width="552" height="372" rx="26" fill="#e5e5e7"/>${pic}
<text x="44" y="458" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#3c3c43">${esc(String(f.name||'Friend').split(' ')[0])}</text>
<text x="44" y="490" font-family="Arial,sans-serif" font-size="20" fill="#777">${esc(f.handle||'')}</text>
<text x="44" y="532" font-family="Arial,sans-serif" font-size="28" font-weight="800" fill="#9d8c98">StudyOS</text>
${q?`<svg x="420" y="410" width="136" height="136" viewBox="${q.vb}">${q.body}</svg>`:''}</svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
    try{
      const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});
      const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);g.drawImage(img,0,0);
      const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw new Error('no image');
      const file=new File([blob],'studyos-'+(f.handle||'friend')+'.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:f.name+' on StudyOS'});return true}catch(e){if(/abort|cancel/i.test(String(e&&e.name||e)))return true}}
      const a2=document.createElement('a');a2.href=URL.createObjectURL(blob);a2.download=file.name;document.body.appendChild(a2);a2.click();a2.remove();setTimeout(()=>URL.revokeObjectURL(a2.href),4000);
      return true;
    }catch(_){return false}finally{URL.revokeObjectURL(url)}
  };
  const fsPlay=()=>{
    const f=DZ.fsData||{name:'Friend',handle:'friend'};
    const text=f.id==='me'?`Follow me on StudyOS (@${f.handle}) and let's keep a study streak together: ${D.inviteUrl||'https://studyos.app'}`:`Meet ${f.name} (@${f.handle}) on StudyOS. Study together: ${D.inviteUrl||'https://studyos.app'}`;
    R.querySelector('.fs-sheet').animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:230,easing:'cubic-bezier(.22,.9,.28,1)',fill:'backwards'});
    R.querySelector('.fs-card').animate([{transform:'translateY(-14px) scale(.96)',opacity:0},{transform:'none',opacity:1}],{duration:230,easing:'cubic-bezier(.22,.9,.28,1)',fill:'backwards'});
    const sys=()=>{try{if(CB.share)CB.share(text);else if(navigator.share)navigator.share({text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast('Link copied')).catch(()=>toast('Could not copy'));else toast('Sharing is not available here.')}catch(_){toast('Could not open sharing.')}};
    R.onclick=e=>{
      const t=e.target;
      if(t.closest('[data-fsx]')){hap('light');go(DZ.fsBack||'Friend profile');return}
      if(t.closest('[data-fsw]')){hap('medium');try{window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank')}catch(_){sys()}return}
      if(t.closest('[data-fsm]')){hap('medium');try{window.location.href='sms:?body='+encodeURIComponent(text)}catch(_){sys()}return}
      if(t.closest('[data-fsi]')||t.closest('[data-fso]')){hap('medium');sys();return}
      if(t.closest('[data-fss]')){const b=t.closest('[data-fss]');if(b.dataset.busy)return;b.dataset.busy=1;hap('medium');fsSave().then(ok=>{delete b.dataset.busy;toast(ok?'Profile card saved':'Could not save the card')});return}
      if(t.closest('[data-fsc]')){hap('medium');try{navigator.clipboard.writeText(text).then(()=>toast('Link copied')).catch(()=>toast('Could not copy'))}catch(_){toast('Could not copy')}return}
    };
  };
  SCREENS.push({t:'Friend share',d:'Share a friend\'s profile card',spec:{m:'A card with the friend\'s picture, name and a QR code, and buttons to send it with WhatsApp, Messages, any app or copy the link.',h:'Medium tap on each share button.',s:'No sound on this page.'},html:fsHtml,play:fsPlay});
  DZ.fpFrom='Profile';
  DZ.openFriend=(id,from)=>{
    if(!id)return;
    FP={unf:false,unc:false,req:false,id:String(id),from:from||'Profile',loading:false,data:null,err:'',rm:false,gift:false,busy:false,msg:'',sheet:null,reason:''};
    DZ.fpFrom=from||'Profile';hap('light');go('Friend profile');load();
  };
}
// Swipe left/right on Home, Tasks, Focus and Study to move to the next/previous tab.
(function(){
  const TABS=['home','tasks','focus','study'],TITLE={home:'Home',tasks:'Tasks',focus:'Focus',study:'Study'};
  let sw=null;
  const SVPAIR={'Streak':{l:'Streak friends'},'Streak friends':{r:'Streak'}};
  const blocked=t=>{
    if(!t||!t.closest)return true;
    if(t.closest('input,textarea,select,[contenteditable],.swipe,[data-noswipe],.sh2-sheet,.qsheet,.pk-ov,.dz-layer,.more,[data-moresc]'))return true;
    for(let el=t;el&&el!==host;el=el.parentElement){
      if(el.scrollWidth>el.clientWidth+4){const o=getComputedStyle(el).overflowX;if(o==='auto'||o==='scroll')return true}
    }
    return false;
  };
  host.addEventListener('pointerdown',e=>{
    const cur=SCREENS[CUR]&&SCREENS[CUR].t;
    sw=(!MOREON&&cur&&(TABS.some(k=>TITLE[k]===cur)||SVPAIR[cur])&&e.isPrimary!==false&&!blocked(e.target))?{x:e.clientX,y:e.clientY,t:Date.now(),cur}:null;
  },true);
  host.addEventListener('pointercancel',()=>{sw=null},true);
  host.addEventListener('pointerup',e=>{
    const s=sw;sw=null;if(!s||(SCREENS[CUR]&&SCREENS[CUR].t)!==s.cur)return;
    const dx=e.clientX-s.x,dy=e.clientY-s.y,ms=Date.now()-s.t;
    if(Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*0.6||ms>900)return;
    if(SVPAIR[s.cur]){const nt=dx<0?SVPAIR[s.cur].l:SVPAIR[s.cur].r;if(!nt)return;hap('tick');go(nt);DZ.slide(dx<0?1:-1);const st=ev=>{ev.stopPropagation();ev.preventDefault()};host.addEventListener('click',st,{capture:true,once:true});setTimeout(()=>host.removeEventListener('click',st,true),350);return}
    const from=TABS.findIndex(k=>TITLE[k]===s.cur),to=from+(dx<0?1:-1);
    if(to<0||to>=TABS.length)return;
    const k=TABS[to];hap('tick');
    if(opts.onTab)opts.onTab(k);
    go(TITLE[k]);
    try{if(R&&R.animate)R.animate([{transform:`translateX(${dx<0?28:-28}px)`},{transform:'none'}],{duration:170,easing:'cubic-bezier(.22,.9,.28,1)'})}catch(_){}
    // the tap that ends a swipe must not press a button
    const stop=ev=>{ev.stopPropagation();ev.preventDefault()};
    host.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>host.removeEventListener('click',stop,true),350);
  },true);
})();
function navOnly(active){
  RUN++;timers.forEach(clearTimeout);timers.length=0;
  stage.innerHTML='<div class="scr n'+(D.dark?' nd':'')+' dz-navonly">'+nav(active)+'</div>';R=stage.firstElementChild;CUR=-1;placeLamp(false);
}


// The lit pill ("lamp") behind the active tab. It glides from the old tab to the new one in the same
// moment the page changes, so the two always agree. Colour comes from the theme (--mv) with a soft glow.
const TABT=new Set(['Home','Tasks','Focus','Study','Profile','League']);
function placeLamp(glide){
  const nav=R&&R.querySelector?R.querySelector('.nav'):null,lamp=nav&&nav.querySelector('.lamp'),on=nav&&nav.querySelector('.nv.on');
  if(!lamp||!on){LAMPX=null;return}
  const x=on.offsetLeft,w=on.offsetWidth;
  lamp.style.width=w+'px';lamp.style.transform='translateX('+x+'px)';
  if(glide&&LAMPX!==null&&LAMPX!==x&&lamp.animate){
    try{lamp.animate([{transform:'translateX('+LAMPX+'px)'},{transform:'translateX('+x+'px)'}],{duration:190,easing:'cubic-bezier(.22,.9,.28,1)'})}catch(_){}
  }
  LAMPX=x;
}
const HINTS={'Home':'Tap your picture to open your profile.','Tasks':'Swipe a task right to finish it, left to delete it.','Streak':'Swipe left to see your friends.'};
/* Quick add pages: put the title in the middle of the header row, between the back button and the icon. */
function qhFix(h){
  if(typeof h!=='string'||h.indexOf('class="qh"')<0)return h;
  return h.replace(/<div class="qh"><button class="qback"([^>]*)>([\s\S]*?)<\/button><div class="qhi">([\s\S]*?)<\/div><\/div><div class="qpt">([\s\S]*?)<\/div>/,
    (m,a,b,ic,t)=>`<div class="qh qhc"><button class="qback"${a}>${b}</button><div class="qpt">${t}</div><div class="qhi">${ic}</div></div>`);
}
function go(i,soft){
  if(typeof i==='string')i=IDX(i);
  if(i<0)return;
  P.run(()=>go0(i,soft),()=>R);
}
function go0(i,soft){
  RUN++;timers.forEach(clearTimeout);timers.length=0;
  const keepMore=!!soft&&MOREON;MOREON=false;MOREPREV=null;MOREADDED=false;
  const prevT=CUR>=0&&SCREENS[CUR]?SCREENS[CUR].t:'';TABSW=!soft&&prevT!==SCREENS[i].t&&TABT.has(prevT)&&TABT.has(SCREENS[i].t);
  CUR=i;const H0=ltFix(qhFix(SCREENS[i].html()));stage.innerHTML=H0;LASTH=H0;LASTI=i;R=stage.firstElementChild;
  placeLamp(!soft&&TABSW);
  S.mute=false;SOFT=!!soft;
  SCREENS[i].play();SOFT=false;
  if(!soft&&!TABSW){P.stagger(R);const h=HINTS[SCREENS[i].t];if(h){const run=RUN;setTimeout(()=>{if(run===RUN&&R&&R.isConnected)P.hint(SCREENS[i].t,h,toast)},1100)}}
  if(keepMore)openMore(true);
  restoreToggles();
  TABSW=false;
  if(opts.onScreen)opts.onScreen(SCREENS[i].t);
}
function layout(){
  const w=host.clientWidth||360,h=host.clientHeight||760,K=w/360;
  stage.style.width='360px';stage.style.height=(h/K)+'px';
  stage.style.transform='scale('+K+')';stage.style.transformOrigin='0 0';
}
const ro=new ResizeObserver(layout);ro.observe(host);layout();
const KEEP=['Home','Tasks','Friends','Study','My subjects','Sync and offline','Gem Shop','Gift gems'];
let LASTH='',LASTI=-1;
function refresh(){if(CUR>=0&&KEEP.includes(SCREENS[CUR].t)){
  // On the shop pages, only redraw when something on screen really changed. A redraw while a finger is
  // down replaces the button under it, and the tap is lost.
  if(/^(Gem Shop|Gift gems)$/.test(SCREENS[CUR].t)){let h='';try{h=SCREENS[CUR].html()}catch(_){}if(h&&LASTI===CUR&&h===LASTH)return;LASTH=h;LASTI=CUR}
  else LASTI=-1;
  go(CUR,true)}}
function togKey(el,i){return 'dz_tg_'+(SCREENS[CUR]?SCREENS[CUR].t:'')+'_'+i}
const TSEEN={};
const sKey=k=>k.replace(/[^A-Za-z0-9_-]/g,'').slice(0,64);
function restoreToggles(){try{$$('.ptg,.rtg',R).forEach((el,i)=>{const k=togKey(el,i),sk=sKey(k);let v=D.prefs&&D.prefs[sk];if(typeof v!=='boolean'){const l=localStorage.getItem(k);v=l===null?undefined:l==='1'}
  if(v===false)el.classList.add('off');else if(v===true)el.classList.remove('off');TSEEN[sk]=!el.classList.contains('off')})}catch(_){}}
host.addEventListener('click',()=>{setTimeout(()=>{try{if(!R)return;$$('.ptg,.rtg',R).forEach((el,i)=>{const k=togKey(el,i),sk=sKey(k),on=!el.classList.contains('off');localStorage.setItem(k,on?'1':'0');if(TSEEN[sk]!==on){TSEEN[sk]=on;if(CB.savePref)CB.savePref(sk,on)}})}catch(_){}},60)},true);

/* ---- Streak page: flame ignites, the number rolls up, this week fills in ---- */
{
const STK_CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.500 12.500l4.500 4.500L18.500 7.500"/></svg>';
const STK_SH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.500 7.500L12 3l4.500 4.500M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>';
const stkInfo=()=>{
  const n=Math.max(0,D.streak||0),dow=(new Date().getDay()+6)%7,today=(D.todayMin||0)>0;
  const days=[];let lo=-1,hi=-1;
  for(let i=0;i<7;i++){const off=i-dow;const done=n>0&&(off===0?today:off<0&&(-off<=n-(today?1:0)));days.push(done);if(done){if(lo<0)lo=i;hi=i}}
  return {n,dow,today,days,lo,hi};
};
const stkRoll=(txt)=>[...txt].map(c=>`<span class="stkd"><span class="stkc">${'0123456789'.split('').map(x=>`<b>${x}</b>`).join('')}</span></span>`).join('');
const stkEmb=()=>{let h='',r=7;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280};
  for(let i=0;i<18;i++){const sz=3+rnd()*5;h+=`<i style="left:${34+rnd()*32}%;width:${sz}px;height:${sz}px;animation-delay:${(rnd()*3.2).toFixed(2)}s;animation-duration:${(2.4+rnd()*2.2).toFixed(2)}s;--dx:${Math.round((rnd()-.5)*90)}px;background:${['#ffb02e','#ff6a3d','#ffe680','#ff8f5a'][i%4]}"></i>`}
  return h};
const stkHtml=()=>{
  const I=stkInfo(),L='MTWTFSS';
  const msg=I.n===0?'Study today to light your first flame.':I.today?`Come back tomorrow to make it ${I.n+1}.`:`Study today to keep your ${I.n} day streak alive.`;
  const bar=I.lo>=0&&I.hi>I.lo?`<i class="stkbar" style="left:calc(${I.lo}/7*100% + 100%/14);width:calc(${I.hi-I.lo}/7*100%)"></i>`:'';
  return wrapD(`<div class="stkp"><button class="stkx" type="button" data-stkback aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
<div class="stkhero"><div class="stkrays"></div><div class="flh stkfh"></div>${mascotHtml(I.n===0?'curious':I.today?'cheer':'point','celebrate','stkfm')}</div>
<div class="stknum" aria-label="${I.n} day streak">${stkRoll(String(I.n))}</div><div class="stklb">day streak</div>
<div class="stkwk"><div class="stktr">${bar}</div>${L.split('').map((ch,i)=>`<div class="stkdy${i===I.dow?' t':''}"><span>${ch}</span><div class="stkdot${I.days[i]?' on':''}${i>I.dow?' fut':''}" style="--k:${i}">${I.days[i]?STK_CHK:''}</div></div>`).join('')}</div>
<div class="stkmsg">${msg}</div>
<div class="stkbt"><button class="stksh2" type="button" data-stkshare aria-label="Share my streak">${STK_SH}</button><button class="stkgo" type="button" data-stkgo>${I.today?'Keep it going':'Start studying'}</button></div></div>`);
};
const stkPlay=()=>{
  const I=stkInfo(),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from=I.today&&I.n>0?String(I.n-1).padStart(String(I.n).length,'0'):String(I.n),to=String(I.n);
  if(DZ.flame){DZ.flame.destroy();DZ.flame=null}
  const MS=[7,10,25,50,100,200,300,365,500,1000],mile=I.today&&I.n>0&&(MS.includes(I.n)||I.n%100===0||I.n%7===0);
  const flame=DZ.flame=createFlame($('.stkfh',R),{state:I.n===0?'inactive':'idle'});
  const fh=$('.stkfh',R);if(fh)fh.onclick=()=>{hap('streakIgnite');flame.increase();playStreakClip(.8)};
  const cols=$$('.stkc',R);
  const setCol=(c,d)=>{c.style.transform=`translateY(${-d*10}%)`};
  cols.forEach((c,i)=>setCol(c,+to[i]));
  R.onclick=e=>{
    if(e.target.closest('[data-stkback]')){back();return}
    if(e.target.closest('[data-stkshare]')){hap('light');if(CB.share)CB.share(I.n+' day study streak on StudyOS! Join me.');return}
    if(e.target.closest('[data-stkgo]')){hap('light');if(I.today)back();else go('Focus');return}
  };
  if(SOFT||reduce)return;
  const E='cubic-bezier(.2,.9,.3,1)',A=(el,k,o)=>el&&el.animate(k,Object.assign({fill:'backwards',easing:E},o));
  const fl=$('.stkfh',R),hero=$('.stkhero',R);
  if(I.today&&I.n>0)at(700,()=>{if(DZ.flame===flame){mile?flame.milestone():flame.increase()}});
  at(0,()=>hap('streakBuild'));at(420,()=>hap('streakIgnite'));at(mile?950:930,()=>hap(mile?'celebrate':'streakRoll'));
  if(I.today&&I.n>0)playStreakClip();
  A(fl,[{transform:'translateY(40px) scale(.15)',opacity:0},{transform:'translateY(-14px) scale(1.12)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:820});
  A($('.stkrays',R),[{opacity:0,transform:'scale(.4) rotate(0)'},{opacity:1,transform:'scale(1) rotate(30deg)'}],{duration:1100});
  A($('.stksh',R),[{opacity:0},{opacity:.22}],{duration:700,delay:300});
  // ignition: a ring and spark lines burst out from the flame
  const ring=document.createElement('div');ring.className='stkring';hero.appendChild(ring);
  ring.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:.7},{transform:'translate(-50%,-50%) scale(2.6)',opacity:0}],{duration:900,delay:420,easing:'ease-out',fill:'both'}).onfinish=()=>ring.remove();
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,sp=document.createElement('i');sp.className='stkspk';sp.style.background=['#ffb02e','#ff6a3d','#ffe680'][i%3];hero.appendChild(sp);
    const d=96+(i%3)*22;sp.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(.2)`,opacity:0}],{duration:760+(i%4)*70,delay:460,easing:'cubic-bezier(.1,.8,.3,1)',fill:'both'}).onfinish=()=>sp.remove()}
  // number rolls from yesterday to today, digit by digit
  A($('.stknum',R),[{opacity:0,transform:'translateY(26px) scale(.8)'},{opacity:1,transform:'none'}],{duration:520,delay:500});
  if(from!==to)cols.forEach((c,i)=>{if(from[i]===to[i])return;
    c.animate([{transform:`translateY(${-from[i]*10}%)`},{transform:`translateY(${-to[i]*10}%)`}],{duration:900,delay:900+i*120,easing:'cubic-bezier(.3,1.3,.4,1)',fill:'backwards'})});
  A($('.stklb',R),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:420,delay:760});
  A($('.stkwk',R),[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],{duration:420,delay:1000});
  A($('.stkbar',R),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:760,delay:1250,easing:'cubic-bezier(.5,0,.2,1)'});
  $$('.stkdot.on',R).forEach((d,i)=>{const k=+d.style.getPropertyValue('--k');A(d,[{transform:'scale(.4)',opacity:0},{transform:'scale(1.25)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],{duration:380,delay:1250+k*90});at(1250+k*90,()=>hap('tick'))});
  const td=$('.stkdy.t .stkdot',R);if(td&&I.today){A(td,[{transform:'scale(1)'},{transform:'scale(1.5)',offset:.4},{transform:'scale(1)'}],{duration:560,delay:1900,easing:'ease-out'});at(1900,()=>hap('streakLand'))}
  A($('.stkmsg',R),[{opacity:0},{opacity:1}],{duration:420,delay:1500});
  A($('.stkbt',R),[{opacity:0,transform:'translateY(40px)'},{opacity:1,transform:'none'}],{duration:480,delay:1500});
  A($('.stkx',R),[{opacity:0},{opacity:1}],{duration:300,delay:300});
};
SCREENS.push({t:'Streak celebration',d:'Shown once a day when your streak goes up',spec:{m:'The flame ignites with a burst, the day count rolls up, and this week fills in one day at a time.',h:'Success when the flame lights, light tap when today is marked.',s:NS},html:stkHtml,play:stkPlay});
DZ.openStreak=from=>{DZ.streakFrom=from;hap('light');go('Streak')};
DZ.celebrate=()=>{const t=SCREENS[CUR]&&SCREENS[CUR].t;if(!t||t==='Streak celebration'||D.guest||!(D.streak>0))return;DZ.celFrom=t;go('Streak celebration')};
host.addEventListener('click',e=>{
  const g=e.target.closest('[data-stkopen]');if(!g||!SCREENS[CUR]||!['Home','Tasks','Study'].includes(SCREENS[CUR].t))return;
  e.stopPropagation();DZ.openStreak(SCREENS[CUR].t);
},true);
}
/* ---- Streak hub: Personal tab (count, calendar, goal, perks) and Friends tab (friend streaks) ---- */
{
const SV_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const SV_SH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.500 7.500L12 3l4.500 4.500M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>';
const SV_CH=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d?'M9 5l7 7-7 7':'M15 5l-7 7 7 7'}"/></svg>`;
const SV_FL=(c,w)=>`<svg viewBox="0 0 100 120" width="${Math.round(w*1.0)}" height="${Math.round(w*1.2)}" aria-hidden="true" style="display:block;flex:none">${flameInner(c==='currentColor'?FLAME_PAL.grey:FLAME_PAL.red)}</svg>`;
const GOALS=[3,7,14,30,50,100,150,200,250,365,500,730,1000];
const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const svKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
let SVM=0;
DZ.slide=dir=>{try{if(R&&R.animate){const s=R.querySelector('.svs');R.animate([{opacity:.0,transform:`translateX(${dir*56}px)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.85,.25,1)'})}}catch(_){}};
const svTier=n=>n>=365?'Streak legend':n>=100?'Streak society':n>=30?'Blazing':n>=7?'On fire':n>0?'Warming up':'Start today';
const svHead=(tab)=>`<div class="svh"><button class="svx" type="button" data-svx aria-label="Close">${SV_X}</button><b>Streak</b><button class="svx" type="button" data-svsh aria-label="Share my streak">${SV_SH}</button></div>
<div class="svtabs" role="tablist"><button type="button" role="tab" aria-selected="${tab==='p'}" class="${tab==='p'?'on':''}" data-svtab="p">Personal</button><button type="button" role="tab" aria-selected="${tab==='f'}" class="${tab==='f'?'on':''}" data-svtab="f">Friends</button></div>`;
const svCal=()=>{
  const keys=new Set(D.streakDays||[]),ice=new Set((D.shop&&D.shop.protectedDays)||[]);
  const now=new Date(),base=new Date(now.getFullYear(),now.getMonth()+SVM,1),y=base.getFullYear(),m=base.getMonth();
  const lead=base.getDay(),dim=new Date(y,m+1,0).getDate(),today=svKey(now);
  const cells=[];for(let i=0;i<lead;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7)cells.push(null);
  let rows='';
  for(let r=0;r<cells.length/7;r++){
    const row=cells.slice(r*7,r*7+7);let caps='',run=null;const flush=()=>{if(run){caps+=`<i class="svcap${run.ice?' ice':''}" style="left:calc(${run.s}*100%/7 + 2px);width:calc(${run.e-run.s+1}*100%/7 - 4px)"></i>`;run=null}};
    const nums=row.map((d,c)=>{
      if(!d){flush();return '<span></span>'}
      const k=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),ic=ice.has(k),st=keys.has(k)&&!ic,on=st||ic;
      if(on){if(run&&run.ice!==ic)flush();if(run)run.e=c;else run={s:c,e:c,ice:ic}}else flush();
      const cls=(st?'on':'')+(ic?' ice':'')+(k===today?' td':'')+(!on&&k>today?' fu':'');
      return `<span class="${cls.trim()}">${d}</span>`;
    }).join('');flush();
    rows+=`<div class="svrow simple">${nums}</div>`;
  }
  return `<div class="svcm"><button type="button" data-svmo="-1" aria-label="Previous month">${SV_CH(0)}</button><b>${MN[m]} ${y}</b><button type="button" data-svmo="1" aria-label="Next month"${SVM>=0?' disabled':''}>${SV_CH(1)}</button></div>
<div class="svwd">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(x=>`<span>${x}</span>`).join('')}</div>${rows}`;
};
const svPersonal=()=>{
  const n=Math.max(0,D.streak||0),nx=GOALS.find(g=>g>n)||(Math.ceil((n+1)/100)*100),pct=Math.min(100,n/nx*100);
  const fz=(D.shop&&D.shop.freezes)||0,lock=nx;
  return wrapD(`<div class="svp">${svHead('p')}<div class="svs">
<div class="svhero"><div class="svhl"><span class="svchip">${svTier(n)}</span><div class="svbig${n?'':' z'}">${n}</div><div class="svdl">day streak${n?'!':''}</div></div><div class="svfl" data-svfl></div></div>
<h3 class="svt">Streak Calendar</h3><div class="svcard svcal">${svCal()}</div>
<h3 class="svt">Streak Goal</h3><div class="svcard svgoal"><div class="svgb"><span class="svgi">${SV_FL('#fff',26)}</span><div class="svtr"><i style="width:${pct.toFixed(1)}%"></i></div><span class="svgn"><b>${nx}</b><small>days</small></span></div><div class="svgt">${n} / ${nx} days</div></div>
<h3 class="svt">Streak Perks</h3>
<div class="svcard svperk"><svg viewBox="0 0 64 72" width="72" height="80" aria-hidden="true"><defs><linearGradient id="svice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#4fb3e8"/></linearGradient></defs><path d="M32 4l24 10v20c0 16-10 28-24 34C18 62 8 50 8 34V14z" fill="url(#svice)"/><path d="M32 12l16 7v15c0 11-7 19-16 24-9-5-16-13-16-24V19z" fill="#fff" opacity=".35"/><path d="M32 22c4 6 8 9 8 14a8 8 0 01-16 0c0-5 4-8 8-14z" fill="#2f8fd0"/></svg>
<div><b>${fz} Streak Freeze${fz===1?'':'s'}</b><p>Protects your streak on a day you miss. You can hold up to 2.</p><button type="button" class="svlink" data-svshop>${fz>=2?'FULL':'GET MORE'}</button></div></div>
<div class="svcard svperk lock"><svg viewBox="0 0 64 72" width="72" height="80" aria-hidden="true"><path d="M20 30v-8a12 12 0 0124 0v8" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><rect x="10" y="30" width="44" height="34" rx="9" fill="currentColor"/><circle cx="32" cy="45" r="5" fill="var(--card)"/><rect x="29.500" y="46" width="5" height="10" rx="2.500" fill="var(--card)"/></svg>
<div><b>${lock} days</b><p>Reach a streak of ${lock} days to earn this reward.</p><span class="svlk">${Math.max(0,lock-n)} day${lock-n===1?'':'s'} to go</span></div></div>
<div class="svpad"></div></div></div>`);
};
const svFriends=()=>{
  const fr=(D.friends||[]).map(f=>({id:f.id,n:f.name||'Friend',s:f.streak||0,p:f.picture||''})).sort((a,b)=>b.s-a.s);
  const me={n:(D.first||'You')+' (You)',s:Math.max(0,D.streak||0),me:1};
  const rows=[...fr,me].sort((a,b)=>b.s-a.s);
  const ava=r=>`<span class="svav" style="background:${colOf(r.n)}">${DZ.pfFace?DZ.pfFace(r.me?'me':r.id,r.me?D.avatar:'',r.p||''):esc((r.n||'?').charAt(0).toUpperCase())}</span>`;
  return wrapD(`<div class="svp svf">${svHead('f')}<div class="svs">
<div class="svban"><div class="svsp"><i></i><i></i><i></i><i></i></div><div class="svsc"><span class="svch a">${AVSC(1)}</span><span class="svfl2" data-svfl2></span><span class="svch b">${AVSC(10)}</span></div></div>
<div class="svfh"><h3 class="svt" style="margin:0">Friend Streaks</h3><button type="button" class="svlink" data-svedit aria-pressed="false">EDIT</button></div>
<div class="svcard svlist" data-svlist>${rows.map(r=>`<div class="svfr${r.me?' me':''}"${r.me?'':` data-fid="${esc(r.id)}" role="button" aria-label="Open ${esc(r.n)}'s profile"`}>${r.me?'':`<button type="button" class="svmi" data-svrm="${esc(r.id)}" aria-label="Remove ${esc(r.n)}"><i></i></button>`}${ava(r)}<div class="svfn"><b>${esc(r.n)}</b><span class="svfs${r.s?'':' off'}">${SV_FL(r.s?'#ff8a2a':'currentColor',18)}<em>${r.s}</em></span></div></div>`).join('')}</div>
${fr.length?'':`<p class="svem">No friends yet. Add a friend and you can keep each other's streaks going.</p>`}<button type="button" class="svgo" data-svadd>Add a friend</button>
<div class="svpad"></div></div></div>`);
};
const AVSC=i=>avatarSvg(Object.assign(avDecode(''),{chr:i}),{view:'full',style:'width:100%;height:100%;display:block'});
const svSheet=(row,id)=>{
  if($('.svsheet',R))return;
  const f=(D.friends||[]).find(x=>String(x.id)===String(id));if(!f)return;
  const nm=f.name||'your friend',st=f.streak||0,av=row.querySelector('.svav').outerHTML.replace('class="svav"','class="svav big"');
  const sh=document.createElement('div');sh.className='svsheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-label','Remove friend');
  sh.innerHTML=`<div class="svbk"></div><div class="svsh"><i class="svgrab"></i>${av}<b class="svsn">${esc(nm)}</b><span class="svfs${st?'':' off'}">${SV_FL(st?'#ff8a2a':'currentColor',22)}<em>${st}</em></span>
<h4>Remove ${esc(nm)}?</h4><p>If you remove ${esc(nm)} as a friend, your friend streak with them will be lost and cannot be brought back.</p><div class="svmsg" role="status"></div>
<button type="button" class="svdan" data-svyes>Remove friend</button><button type="button" class="svgo" data-svno>Keep friend</button></div>`;
  R.appendChild(sh);
  const close=()=>{const b=$('.svbk',sh),c=$('.svsh',sh);b.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'});c.animate([{transform:'none'},{transform:'translateY(100%)'}],{duration:220,easing:'ease-in',fill:'forwards'}).onfinish=()=>sh.remove()};
  sh.querySelector('.svbk').animate([{opacity:0},{opacity:1}],{duration:200,fill:'backwards'});
  sh.querySelector('.svsh').animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
  let busy=false;
  sh.onclick=async e=>{
    e.stopPropagation();
    if(e.target.closest('.svbk')||e.target.closest('[data-svno]')){if(!busy){hap('light');close()}return}
    if(e.target.closest('[data-svyes]')){
      if(busy)return;busy=true;hap('press');
      // Optimistic: the friend leaves the list at once. If the server refuses, the friend comes back with a message.
      optRemoveFriend(id,()=>{if(SCREENS[CUR]&&SCREENS[CUR].t==='Streak friends')go('Streak friends',true)});
      close();go('Streak friends',true);toast('Friend removed.')
    }
  };
};
const svPlay=tab=>()=>{
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(DZ.flame){DZ.flame.destroy();DZ.flame=null}
  const n=Math.max(0,D.streak||0);
  const hostEl=tab==='p'?$('[data-svfl]',R):$('[data-svfl2]',R);
  if(hostEl){DZ.flame=createFlame(hostEl,{state:n===0?'inactive':'idle'});hostEl.onclick=()=>{hap('streakIgnite');DZ.flame&&DZ.flame.increase();playStreakClip(.8)}}
  const swapCal=()=>{const c=$('.svcal',R);if(c){c.innerHTML=svCal();c.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'})}};
  const svEnsure=async()=>{
    const now=new Date(),fk=svKey(new Date(now.getFullYear(),now.getMonth()+SVM,1));let tries=0;
    while(D.streakMore&&CB.loadOlderSessions&&(D.streakDays||[])[0]>fk&&tries<8&&SCREENS[CUR]&&SCREENS[CUR].t==='Streak'){
      tries++;try{await CB.loadOlderSessions()}catch(_){break}
      await new Promise(r=>setTimeout(r,650));const c=$('.svcal',R);if(c&&SCREENS[CUR].t==='Streak')c.innerHTML=svCal();
    }
  };
  R.onclick=e=>{
    if(e.target.closest('[data-svx]')){back();return}
    if(e.target.closest('[data-svsh]')){hap('light');if(CB.share)CB.share(n+' day study streak on StudyOS! Join me.');return}
    const tb=e.target.closest('[data-svtab]');if(tb){const to=tb.dataset.svtab==='p'?'Streak':'Streak friends';if(SCREENS[CUR].t!==to){hap('light');go(to);DZ.slide(to==='Streak'?-1:1)}return}
    const mo=e.target.closest('[data-svmo]');if(mo&&!mo.disabled){hap('light');SVM=Math.max(-60,Math.min(0,SVM+(+mo.dataset.svmo)));swapCal();svEnsure();return}
    if(e.target.closest('[data-svshop]')){if(D.guest){toast('Create your profile to use the shop.');return}DZ.openShop('Streak');return}
    const ed=e.target.closest('[data-svedit]');
    if(ed){const l=$('[data-svlist]',R),on=!l.classList.contains('ed');l.classList.toggle('ed',on);ed.textContent=on?'DONE':'EDIT';ed.setAttribute('aria-pressed',String(on));hap(on?'medium':'light');return}
    const rm=e.target.closest('[data-svrm]');if(rm){e.stopPropagation();hap('medium');svSheet(rm.closest('.svfr'),rm.dataset.svrm);return}
    if(e.target.closest('[data-svadd]')){FADD=true;FMSG='';hap('light');DZ.fpFrom='Streak friends';go('Friends');return}
    const fp=e.target.closest('[data-fid]');if(fp){hap('light');DZ.openFriend(fp.dataset.fid,'Streak friends');return}
  };
  if(SOFT||reduce)return;
  const A=(sel,k,o)=>$$(sel,R).forEach((el,i)=>el.animate(k,Object.assign({fill:'backwards',easing:'cubic-bezier(.2,.9,.3,1)'},typeof o==='function'?o(i):o)));
  A('.svhl',[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:480});
  A('.svbig',[{transform:'scale(.6)'},{transform:'scale(1.08)',offset:.65},{transform:'scale(1)'}],{duration:620,delay:120});
  A('.svfl,.svban',[{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'none'}],{duration:560,delay:80});
  A('.svt,.svcard,.svfh',[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],i=>({duration:420,delay:260+i*70}));
  A('.svcap',[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],i=>({duration:420,delay:500+i*80,easing:'ease-out'}));
  A('.svtr i',[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:900,delay:700,easing:'cubic-bezier(.3,1,.4,1)'});
  A('.svfr',[{opacity:0,transform:'translateX(-18px)'},{opacity:1,transform:'none'}],i=>({duration:360,delay:420+i*60}));
  hap('light');
};
SCREENS.push({t:'Streak',d:'Your streak count, calendar, goal and perks',spec:{m:'The count pops in beside a live flame, then the calendar, goal bar and perks rise one after another. The bar and day capsules fill in.',h:'Light tap on arrival and on every control.',s:NS},html:svPersonal,play:svPlay('p')});
SCREENS.push({t:'Streak friends',d:'Your friends and their streaks',spec:{m:'An orange banner with Zip, a friend and a flame, then your friends slide in, longest streak first.',h:'Light tap on arrival and on every row.',s:NS},html:svFriends,play:svPlay('f')});
}

/* ---- Undo bar: shown after a task or subject is deleted, on any page, for 7 seconds ---- */
{
  let bar=null,tmr=0,cur=null;
  const UNDO_MS=7000;
  const hide=()=>{clearTimeout(tmr);tmr=0;cur=null;if(bar){bar.classList.remove('on');}};
  const ensure=()=>{
    if(bar&&bar.isConnected)return bar;
    bar=document.createElement('div');bar.className='dz-undo';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');
    bar.innerHTML='<span class="dz-undo-t"></span><button type="button" class="dz-undo-b" aria-label="Undo"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.600\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 14L4 9l5-5\"/><path d=\"M4 9h10.500a5.500 5.500 0 010 11H11\"/></svg><span>UNDO</span></button><i class="dz-undo-p"></i>';
    bar.querySelector('.dz-undo-b').addEventListener('click',async ev=>{
      ev.stopPropagation();const c=cur;if(!c)return;hide();hap('light');
      try{if(c.pending)await c.pending}catch(_){}
      let ok=false;
      try{
        if(c.kind==='task')ok=CB.restoreTask?await CB.restoreTask(c.item):(CB.undoDelete?(await CB.undoDelete(c.item),true):false);
        else if(c.kind==='subject')ok=CB.restoreSubject?await CB.restoreSubject(c.item):false;
      }catch(_){ok=false}
      toast(ok!==false?(c.kind==='task'?'Task restored':'Subject restored'):'Could not undo. Try again.');
    });
    host.appendChild(bar);return bar;
  };
  DZ.undoOffer=(kind,item,pending)=>{
    if(!item)return;
    const b=ensure();cur={kind,item,pending};
    b.querySelector('.dz-undo-t').textContent=(kind==='task'?'Task deleted':'Subject removed')+(item.title||item.name?': '+String(item.title||item.name).slice(0,28):'');
    const p=b.querySelector('.dz-undo-p');p.style.animation='none';void p.offsetWidth;p.style.animation='';
    b.classList.add('on');clearTimeout(tmr);tmr=setTimeout(hide,UNDO_MS);
  };
  DZ.undoHide=hide;
}

/* ---- My subjects: remove a subject you added yourself (no tasks yet), with Undo ---- */
{
  const k=IDX('My subjects');
  if(k>=0){
    const s=SCREENS[k],oh=s.html,op=s.play;
    const XI='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    s.html=()=>{
      let h=oh();
      const L=(D.subjectProgress||[]);
      L.forEach(x=>{
        if(!x||!x.custom||x.total)return;
        const nm=esc(String(x.name||''));
        h=h.replace(`<b>${nm}</b>`,`<b>${nm}</b><button type="button" class="smy-del" data-sdel="${nm}" aria-label="Remove ${nm}">${XI}</button>`);
      });
      return h;
    };
    s.play=function(){op.call(this);const old=R.onclick;
      R.onclick=async e=>{
        const d=e.target.closest('[data-sdel]');
        if(d){e.stopPropagation();hap('press');const name=d.dataset.sdel;const row=d.closest('.smy-r');if(row)row.style.opacity='.4';
          const removed=CB.removeSubject?await CB.removeSubject(name):null;
          if(removed&&DZ.undoOffer)DZ.undoOffer('subject',removed);else{if(row)row.style.opacity='';toast('Could not remove the subject.')}
          return}
        if(old)old(e)};
    };
  }
}


/* ==== v108: My subjects redesign: summary, filters, sort, actions, add subject ==== */
{
  const k=IDX('My subjects');
  if(k>=0){
    let SF2='All',SS2='progress',OPEN='';
    const BK2=DZ.BKX||'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>';
    const I={
      up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>',
      plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
      clk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"><circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/></svg>',
      list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.500 12.500l2.500 2.500 4.500-5"/></svg>',
      note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/></svg>',
      del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
      chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
      ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>'
    };
    const COLS=['#7fa8ff','#6fcf97','#e8a83a','#ff8a9a','#b9a7ff','#4fc3f7','#f0a868','#9ad0c2'];
    const colOf2=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return COLS[h%COLS.length]};
    const mins=m=>{m=Math.round(m||0);return m>=60?Math.floor(m/60)+'h '+(m%60?m%60+'m':''):m+'m'};
    const list=()=>(D.subjectProgress&&D.subjectProgress.length)?D.subjectProgress:(D.subjects||[]).map(n=>({name:n,pct:0,done:0,total:0,min:0}));
    const notesOf=n=>(D.notes||[]).filter(x=>String(x.subject||'').toLowerCase()===String(n).toLowerCase()).length;
    const status=x=>x.total&&x.done>=x.total?'done':x.done>0||x.min>0?'going':'new';
    const ring=(p,c)=>{const C=2*Math.PI*42;return `<svg viewBox="0 0 100 100" class="sj-ring"><circle cx="50" cy="50" r="42" class="sj-rt"/><circle cx="50" cy="50" r="42" class="sj-rp" style="stroke:${c};stroke-dasharray:${C.toFixed(1)};--off:${(C*(1-p/100)).toFixed(1)};--c0:${C.toFixed(1)}"/></svg>`};
    const html=()=>{
      const L=list(),tot=L.reduce((a,x)=>a+(x.total||0),0),dn=L.reduce((a,x)=>a+(x.done||0),0),mn=L.reduce((a,x)=>a+(x.min||0),0);
      const pct=tot?Math.round(dn/tot*100):0,comp=L.filter(x=>status(x)==='done').length;
      let V=L.filter(x=>SF2==='All'||(SF2==='In progress'?status(x)!=='done':status(x)==='done'));
      V=V.slice().sort(SS2==='name'?(a,b)=>String(a.name).localeCompare(b.name):SS2==='time'?(a,b)=>(b.min||0)-(a.min||0):(a,b)=>(b.pct|0)-(a.pct|0));
      const title=D.fullName?esc(D.fullName)+'’s Subjects':'My Subjects';
      const cnt={All:L.length,'In progress':L.filter(x=>status(x)!=='done').length,Completed:comp};
      const rows=V.map((x,i)=>{const nm=String(x.name||'?'),p=Math.max(0,Math.min(100,x.pct|0)),c=colOf2(nm),st=status(x),op=OPEN===nm,nn=notesOf(nm);
        return `<div class="sj-c${op?' open':''}" style="--i:${i};--sc:${c}">
<button type="button" class="sj-hd" data-sjo="${esc(nm)}" aria-expanded="${op}"><span class="sj-ic">${DZ.subIcon?DZ.subIcon(nm):''}</span>
<span class="sj-tx"><b>${esc(nm)}</b><small>${x.total?x.done+'/'+x.total+' tasks':'No tasks yet'}${x.min?' · '+mins(x.min):''}${nn?' · '+nn+' '+(nn===1?'note':'notes'):''}</small><span class="sj-bar"><i style="width:${p}%"></i></span></span>
<span class="sj-pc">${st==='done'?`<em class="sj-ok">${I.ok}</em>`:''}<b>${p}%</b><span class="sj-chev">${I.chev}</span></span></button>
<div class="sj-act"><div>
<button type="button" data-sja="task" data-n="${esc(nm)}">${I.plus}<span>Add task</span></button>
<button type="button" data-sja="focus" data-n="${esc(nm)}">${I.clk}<span>Focus</span></button>
<button type="button" data-sja="tasks" data-n="${esc(nm)}">${I.list}<span>Tasks</span></button>
<button type="button" data-sja="notes" data-n="${esc(nm)}">${I.note}<span>Notes</span></button>
${x.custom&&!x.total?`<button type="button" class="sj-rm" data-sja="del" data-n="${esc(nm)}">${I.del}<span>Remove</span></button>`:''}
</div></div></div>`}).join('');
      const empty=`<div class="sj-empty"><b>${L.length?'Nothing here':'No subjects yet'}</b><p>${L.length?'Try another filter.':'Add a subject to start tracking your progress.'}</p></div>`;
      return `<div class="scr n nd sjx" style="--pg:#181b22"><div class="sj-pg">
<div class="sj-h"><button type="button" class="sj-x" data-sback aria-label="Back">${BK2}</button><h1>${title}</h1><button type="button" class="sj-x" data-sshare aria-label="Share">${I.up}</button></div>
<div class="sj-l" data-sc>
<div class="sj-sum"><div class="sj-rw">${ring(pct,'var(--mv)')}<div class="sj-rc"><b>${pct}%</b><small>overall</small></div></div>
<div class="sj-st"><div><b>${comp}<em>/${L.length}</em></b><small>Completed</small></div><div><b>${dn}<em>/${tot}</em></b><small>Tasks done</small></div><div><b>${mins(mn)}</b><small>Focus time</small></div></div></div>
<div class="sj-ctl"><div class="sj-tabs">${['All','In progress','Completed'].map(n=>`<button type="button" class="sj-tab${SF2===n?' on':''}" data-sjf="${n}">${n}<i>${cnt[n]}</i></button>`).join('')}</div>
<label class="sj-sort"><span>Sort</span><select data-sjs aria-label="Sort subjects"><option value="progress"${SS2==='progress'?' selected':''}>Progress</option><option value="name"${SS2==='name'?' selected':''}>Name</option><option value="time"${SS2==='time'?' selected':''}>Focus time</option></select></label></div>
<div class="sj-list">${rows||empty}</div>
<button type="button" class="sj-add" data-sjadd>${I.plus}<span>Add a subject</span></button>
</div></div></div>`};
    const play=()=>{S.mute=false;enter();
      if(!SOFT){const rp=R.querySelector('.sj-rp');if(rp)rp.animate([{strokeDashoffset:rp.style.getPropertyValue('--c0')},{strokeDashoffset:rp.style.getPropertyValue('--off')}],{duration:900,delay:150,easing:'cubic-bezier(.3,.8,.25,1)',fill:'forwards'});else{}}
      else{const rp=R.querySelector('.sj-rp');if(rp)rp.style.strokeDashoffset=rp.style.getPropertyValue('--off')}
      const sel=R.querySelector('[data-sjs]');if(sel)sel.onchange=()=>{SS2=sel.value;hap('tick');go('My subjects',true)};
      R.onclick=async e=>{const t=e.target;
        if(t.closest('[data-sback]')){hap('light');go('Profile');return}
        if(t.closest('[data-sshare]')){hap('light');const L=list(),txt=(D.fullName?D.fullName+'’s Subjects':'My Subjects')+' on StudyOS\n'+(L.length?L.map(x=>'• '+x.name+': '+(x.pct|0)+'%').join('\n'):'No subjects yet');
          if(CB.share)CB.share(txt);else if(navigator.share)navigator.share({text:txt}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>toast('Copied to clipboard')).catch(()=>{});return}
        const f=t.closest('[data-sjf]');if(f){SF2=f.dataset.sjf;OPEN='';hap('tick');go('My subjects',true);return}
        if(t.closest('[data-sjadd]')){hap('light');if(IDX('Add subject')>=0)go('Add subject');else if(CB.open)CB.open('subjects');return}
        const o=t.closest('[data-sjo]');if(o){const n=o.dataset.sjo;OPEN=OPEN===n?'':n;hap('light');const c=o.closest('.sj-c');R.querySelectorAll('.sj-c.open').forEach(x=>{if(x!==c){x.classList.remove('open');x.querySelector('[data-sjo]').setAttribute('aria-expanded','false')}});if(c){c.classList.toggle('open',OPEN===n);o.setAttribute('aria-expanded',String(OPEN===n))}return}
        const a=t.closest('[data-sja]');if(!a)return;const n=a.dataset.n,kind=a.dataset.sja;hap('light');
        if(kind==='task'){DZ.editTask=null;DZ.preSubj=n;go('Add task');return}
        if(kind==='focus'){DZ.preFocusSubj=n;go('Focus');return}
        if(kind==='tasks'){if(typeof SQ!=='undefined'){}DZ.searchQ=n;if(DZ.openSearch)DZ.openSearch(n);else go('Tasks');return}
        if(kind==='notes'){if(CB.open)CB.open('subjects');return}
        if(kind==='del'){a.disabled=true;hap('press');const removed=CB.removeSubject?await CB.removeSubject(n):null;
          if(removed){OPEN='';if(DZ.undoOffer)DZ.undoOffer('subject',removed)}else{a.disabled=false;toast('Could not remove the subject.')}return}
      }};
    SCREENS[k].html=html;SCREENS[k].play=play;
  }
}

/* ==== v101: Friends list, friend profile and share card redesign (theme colours, responsive) ==== */
{
  const fxHash=s=>{let h=2166136261;for(const ch of String(s||'x')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h>>>0};
  const fxCount=k=>{const d=AVD&&AVD[k];return d?((d.c||d.o||[]).length):0};
  // A friendly character made from the person's id, used until they make their own avatar.
  const fxGen=seed=>{let h=fxHash(seed)||1;const nx=n=>{h=(Math.imul(h,1103515245)+12345)>>>0;return n?(h>>>8)%n:0};
    const v={};(AVK||[]).forEach(k=>{v[k]=nx(fxCount(k))});
    v.chr=0;v.body=0;if(fxCount('beard'))v.beard=nx(3)===0?nx(fxCount('beard')):0;if(fxCount('glasses'))v.glasses=nx(3)===0?nx(fxCount('glasses')):0;if(fxCount('hat'))v.hat=nx(2)===0?nx(fxCount('hat')):0;
    return v};
  DZ.avCache=DZ.avCache||{};
  // Avatar code for a person: given code, then their friend list entry, then the last profile we loaded.
  const fxCode=(id,code)=>{if(typeof code==='string'&&code)return code;if(id==='me')return D.avatar||'';const f=(D.friends||[]).find(x=>String(x.id)===String(id))||(D.incoming||[]).find(x=>String(x.id)===String(id));return (f&&f.avatar)||DZ.avCache[id]||''};
  // Their own avatar character, or '' when they have not made one (no made-up characters).
  DZ.fxChr=(id,code,view)=>{const c=fxCode(id,code);if(!c)return '';try{return view==='face'?avatarSvg(avDecode(c),{view:'head',bg:true,style:'width:100%;height:100%;display:block'}):avatarSvg(avDecode(c),{view:view||'full'})}catch(_){return ''}};
  DZ.fxNoPic='<svg class="fx-none" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="var(--chip,#2a323a)"/><circle cx="32" cy="25" r="11" fill="var(--mut,#9aa6b0)"/><path d="M12 54c2.500-10 10.500-15 20-15s17.500 5 20 15a30 30 0 0 1-40 0z" fill="var(--mut,#9aa6b0)"/></svg>';
  // Face for any person: avatar character > profile photo > default person icon.
  DZ.pfFace=(id,code,pic)=>{const a=DZ.fxChr(id,code,'face');if(a)return a;let p=pic||(id==='me'?D.picture:'');if(!p){const f=id==='me'?null:(D.friends||[]).find(x=>String(x.id)===String(id));p=f&&f.picture}
    return p?`<img src="${esc(p)}" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML=DZ_NOPIC()">`:DZ.fxNoPic};
  window.DZ_NOPIC=()=>DZ.fxNoPic;
  DZ.fxCol=colOf;
  const BK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>';
  const PL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const XX='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const CHV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  const GEM=CUBE;
  const FLG=flameIconHtml(14);
  const CRN='<svg viewBox="0 0 24 24"><path d="M3 8l4.500 3.500L12 5l4.500 6.500L21 8l-2 11H5z" fill="#ffcc4d" stroke="#c9952a" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  const face=(r,cls)=>{const id=r.me?'me':r.id,has=!!DZ.fxChr(id,r.me?D.avatar:'','face');return `<span class="fx-av${cls?' '+cls:''}${has?'':' nopic'}" style="--c:${colOf(r.n)}">${DZ.pfFace(id,r.me?D.avatar:'',r.pic||'')}</span>`};
  const frHtml=()=>{
    const fr=(D.friends||[]);
    const rows=[...fr.map(f=>({n:f.name||'Friend',m:f.gems||0,id:f.id,st:f.streak||0,pic:f.picture||''})),{n:(D.first||'You'),m:D.gems||0,me:1,st:D.streak||0}].sort((a,b)=>b.m-a.m);
    const rank=rows.findIndex(r=>r.me)+1;
    const inc=(D.incoming||[]);
    const pod=rows.length>=2?[rows[1],rows[0],rows[2]].map((r,i)=>r?`<div class="fx-pd p${[2,1,3][i]}${r.me?' me':''}"${r.me?'':` data-fid="${esc(r.id)}" role="button" aria-label="Open ${esc(r.n)}'s profile"`} style="--k:${i}">${[2,1,3][i]===1?`<i class="fx-crown">${CRN}</i>`:''}${face(r,'lg')}<b>${esc(String(r.n).split(' ')[0])}${r.me?' (You)':''}</b><small><i>${GEM}</i>${r.m.toLocaleString()}</small><div class="fx-st"><span class="fx-rn">${[2,1,3][i]}</span></div></div>`:'<div class="fx-pd empty"></div>').join(''):'';
    const list=rows.map((r,i)=>`<div class="fx-row${r.me?' me':''}"${r.me?'':` data-fid="${esc(r.id)}" role="button" aria-label="Open ${esc(r.n)}'s profile"`} style="--k:${i}"><span class="fx-rk${i<3?' t'+(i+1):''}">${i+1}</span>${face(r)}<span class="fx-nm"><b>${esc(r.n)}${r.me?' <em>You</em>':''}</b><small>${r.st?`<i>${FLG}</i>${r.st} day streak`:'Study friend'}</small></span><span class="fx-gm"><i>${GEM}</i>${r.m.toLocaleString()}</span>${r.me?'':`<span class="fx-chev">${CHV}</span>`}</div>`).join('');
    const req=inc.map(u=>`<div class="fx-req" data-req="${esc(u.id)}">${face({n:u.name||'?',id:u.id,pic:u.picture||''})}<span class="fx-nm"><b>${esc(u.name||'Someone')}</b><small>Wants to be your study friend</small></span><span class="fx-rb"><button type="button" class="fx-ok" data-acc aria-label="Accept">Accept</button><button type="button" class="fx-no" data-dec aria-label="Decline">${XX}</button></span></div>`).join('');
    return `<div class="scr n nd fx3"><div class="fx-pg">
<div class="fx-hd"><button type="button" class="fx-ib" data-frback aria-label="Back">${BK}</button><h1>Friends</h1><button type="button" class="fx-ib${FADD?' on':''}" data-fradd aria-label="${FADD?'Close':'Add a friend'}">${FADD?XX:PL}</button></div>
<div class="fx-sum"><div><b>${fr.length}</b><small>${fr.length===1?'Friend':'Friends'}</small></div><div><b>#${rank}</b><small>Your rank</small></div><div><b>${(D.gems||0).toLocaleString()}</b><small>Your gems</small></div></div>
${FADD?`<div class="fx-add"><label for="fxmail">Add a friend by email</label><div class="fx-addr"><input id="fxmail" class="dz-in" data-femail type="email" inputmode="email" autocomplete="off" placeholder="friend@email.com"><button type="button" data-send>Send</button></div>${FMSG?`<p role="status">${esc(FMSG)}</p>`:''}</div>`:''}
${req?`<div class="fx-sec">Requests <span>${inc.length}</span></div>${req}`:''}
${fr.length?`<div class="fx-sec">Leaderboard · gems</div><div class="fx-pod">${pod}</div><div class="fx-list">${list}</div>`:`<div class="fx-empty"><div class="fx-ei">${face({n:D.first||'You',me:1},'lg')}<span>${PL}</span></div><b>No friends yet</b><p>Invite a friend and you both earn 10 gems. Study together and climb the leaderboard.</p></div>`}
<button type="button" class="fx-inv" data-invite>Invite a friend</button>
</div></div>`;
  };
  const frPlay=()=>{
    enter();hap('light');
    if(!SOFT){$$('.fx-pd',R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(26px) scale(.9)'},{opacity:1,transform:'none'}],{duration:460,delay:120+i*90,easing:'cubic-bezier(.2,.9,.3,1.2)',fill:'backwards'}));
      $$('.fx-pd .fx-st',R).forEach((el,i)=>el.animate([{transform:'scaleY(0)'},{transform:'none'}],{duration:520,delay:260+i*90,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
      $$('.fx-row,.fx-req',R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateX(18px)'},{opacity:1,transform:'none'}],{duration:360,delay:200+i*45,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}))}
    R.onclick=async e=>{
      if(e.target.closest('[data-frback]')){hap('light');go('Profile');return}
      if(e.target.closest('[data-fradd]')){hap('light');FADD=!FADD;FMSG='';go('Friends');if(FADD){const i=$('[data-femail]',R);if(i)setTimeout(()=>i.focus(),60)}return}
      const rq=e.target.closest('[data-req]');
      if(rq&&e.target.closest('[data-acc]')){hap('success');rq.classList.add('done');if(CB.respond)CB.respond(rq.dataset.req,true);return}
      if(rq&&e.target.closest('[data-dec]')){hap('tick');rq.classList.add('done');if(CB.respond)CB.respond(rq.dataset.req,false);return}
      const fpr=e.target.closest('[data-fid]');if(fpr&&!rq){DZ.openFriend(fpr.dataset.fid,'Friends');return}
      if(e.target.closest('[data-invite]')){hap('light');if(CB.invite)CB.invite();return}
      const send=e.target.closest('[data-send]');
      if(send){const v=($('[data-femail]',R).value||'').trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){FMSG='Enter your friend\'s email address.';hap('buzz');go('Friends');return}send.textContent='…';send.disabled=true;const r=CB.addFriend?await CB.addFriend(v):{message:''};FMSG=(r&&r.message)||'Request sent.';go('Friends');return}
    };
    const inp=$('[data-femail]',R);if(inp)inp.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();const b=$('[data-send]',R);if(b)b.click()}});
  };
  const k=IDX('Friends');if(k>=0){SCREENS[k].html=frHtml;SCREENS[k].play=frPlay}
}

/* ==== v107: Find friends (contacts, search, suggestions, share link) + Friend Streak invites ==== */
{
  const FF={sugg:null,loadingS:false,errS:'',sent:{},hide:{},contacts:null,cLoading:false,cErr:'',q:'',res:null,sLoading:false,sErr:'',inv:null,invLoading:false};
  try{FF.hide=JSON.parse(localStorage.getItem('studyos_sugg_hide')||'{}')||{}}catch(_){FF.hide={}}
  const saveHide=()=>{try{localStorage.setItem('studyos_sugg_hide',JSON.stringify(FF.hide))}catch(_){}};
  const BK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>';
  const XX='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ADDU='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="4"/><path d="M1.5 20.5c.6-4 3.700-6.300 7.500-6.300s6.900 2.300 7.500 6.300z"/><path d="M19 7v8M15 11h8" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" fill="none"/></svg>';
  const OKU='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="4"/><path d="M1.5 20.5c.6-4 3.700-6.300 7.500-6.300s6.900 2.300 7.500 6.300z"/><path d="M15.500 11.500l2.300 2.300 4.200-4.800" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  const BOOK='<svg viewBox="0 0 48 48"><rect x="9" y="5" width="30" height="38" rx="4" fill="#ffb020"/><rect x="9" y="5" width="7" height="38" rx="3" fill="#e08a00"/><circle cx="27.500" cy="20" r="5" fill="#fff4dc"/><path d="M19.500 33c.9-4.300 4.200-6.500 8-6.500s7.100 2.200 8 6.500z" fill="#fff4dc"/><rect x="38" y="10" width="4" height="7" rx="1.500" fill="#e08a00"/><rect x="38" y="20" width="4" height="7" rx="1.500" fill="#e08a00"/><rect x="38" y="30" width="4" height="7" rx="1.500" fill="#e08a00"/></svg>';
  const MAG='<svg viewBox="0 0 48 48"><circle cx="20" cy="20" r="12" fill="none" stroke="#1cb0f6" stroke-width="5.500"/><path d="M29.500 29.500l11 11" stroke="#1cb0f6" stroke-width="6" stroke-linecap="round"/><path d="M14 16a7 7 0 0 1 6-4" stroke="#bfeaff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
  const LNK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.500 4.500 0 0 0 6.400 0l3-3a4.500 4.500 0 0 0-6.400-6.400l-1 1"/><path d="M14 10a4.500 4.500 0 0 0-6.400 0l-3 3a4.500 4.500 0 0 0 6.400 6.400l1-1"/></svg>';
  const face=(p)=>`<span class="ff-av" style="--c:${DZ.fxCol?DZ.fxCol(p.name||'?'):'#c9b8c3'}">${DZ.pfFace?DZ.pfFace(p.id,p.avatar,p.picture):''}</span>`;
  const via=p=>p.via?`Followed by ${esc(String(p.via).split(' ')[0])}${p.mutualCount>1?' and '+(p.mutualCount-1)+' other'+(p.mutualCount>2?'s':''):''}`:(p.mutualCount?`${p.mutualCount} friends in common`:'New on StudyOS');
  const rel=p=>FF.sent[p.id]||p.relation||'none';
  const isFriend=id=>(D.friends||[]).some(f=>String(f.id)===String(id));
  const loadSugg=async(force)=>{if(FF.loadingS||(FF.sugg&&!force))return;FF.loadingS=true;FF.errS='';
    let r=null;try{r=CB.friendSuggestions?await CB.friendSuggestions():null}catch(_){r=null}
    FF.loadingS=false;if(r&&r.ok)FF.sugg=r.suggestions;else{FF.sugg=FF.sugg||[];FF.errS=(r&&r.message)||'Could not load suggestions.'}
    const t=SCREENS[CUR]&&SCREENS[CUR].t;if(/^(Find friends|Friend suggestions|Search friends|Contacts on StudyOS)$/.test(t))go(t,true)};
  const suggList=()=>(FF.sugg||[]).filter(p=>!FF.hide[p.id]&&!isFriend(p.id));
  const head=(title,big)=>`<div class="ff-hd${big?' big':''}"><button type="button" class="ff-bk" data-ffback aria-label="Back">${BK}</button>${big?'':`<h1>${title}</h1>`}<span></span></div>${big?`<h1 class="ff-h1">${title}</h1>`:''}`;
  const followBtn=(p,small)=>{const r=rel(p);const on=r==='sent'||r==='friends'||isFriend(p.id);
    return small?`<button type="button" class="ff-add${on?' on':''}" data-fffollow="${esc(p.id)}" aria-label="${on?'Request sent':'Add '+esc(p.name)}"${on?' disabled':''}>${on?OKU:ADDU}</button>`
      :`<button type="button" class="ff-fol${on?' on':''}" data-fffollow="${esc(p.id)}"${on?' disabled':''}>${r==='friends'||isFriend(p.id)?'FRIENDS':r==='sent'?'REQUESTED':r==='incoming'?'ACCEPT':'ADD FRIEND'}</button>`};
  const card=(p,i)=>`<div class="ff-card" style="--k:${i}" data-ffopen="${esc(p.id)}"><button type="button" class="ff-x" data-ffhide="${esc(p.id)}" aria-label="Hide">${XX}</button>${face(p)}<b>${esc(p.name)}</b><small>${via(p)}</small>${followBtn(p)}</div>`;
  const row=(p,i,withX)=>`<div class="ff-row" style="--k:${i}">${face(p)}<span class="ff-nm"><b>${esc(p.name)}</b><small>${p.username&&!p.via&&!p.mutualCount?'@'+esc(p.username):via(p)}</small></span>${followBtn(p,true)}${withX?`<button type="button" class="ff-rx" data-ffhide="${esc(p.id)}" aria-label="Hide">${XX}</button>`:''}</div>`;
  const dots='<div class="ff-dots" role="status" aria-label="Loading"><i></i><i></i><i></i></div>';
  const suggBlock=(lim)=>{const L=suggList();
    if(FF.sugg===null||FF.loadingS&&!L.length)return `<div class="ff-sec">Friend suggestions</div>${dots}`;
    if(!L.length)return FF.errS?`<div class="ff-sec">Friend suggestions</div><p class="ff-note">${esc(FF.errS)}</p>`:'';
    return `<div class="ff-sec">Friend suggestions<button type="button" class="ff-all" data-ffall>VIEW ALL</button></div><div class="ff-scroll">${L.slice(0,lim||12).map(card).join('')}</div>`};
  const scr=(body,cls)=>`<div class="scr n nd fx3 ff ${cls||''}"><div class="ff-pg">${body}</div></div>`;

  // 1) Find your friends
  const hub=()=>scr(`${head('Find your friends',true)}
<div class="ff-opts"><button type="button" class="ff-opt" data-ffgo="contacts"><i>${BOOK}</i><span>Choose from contacts</span></button>
<button type="button" class="ff-opt" data-ffgo="search"><i>${MAG}</i><span>Search by name</span></button>
<button type="button" class="ff-opt" data-ffgo="share"><i class="ff-me">${DZ.pfFace?DZ.pfFace('me',D.avatar,''):''}<em>${LNK}</em></i><span>Share follow link</span></button></div>
${suggBlock(12)}`);
  // 2) Contacts on StudyOS
  const contacts=()=>{const L=FF.contacts||[];
    let body;
    if(FF.cLoading)body=dots;
    else if(FF.cErr)body=`<div class="ff-empty"><i>${BOOK}</i><b>${FF.cErr==='denied'?'Allow access to contacts':'Could not check contacts'}</b><p>${FF.cErr==='denied'?'StudyOS needs permission to see which of your contacts already study here. Contacts are only compared, never saved.':esc(FF.cErr)}</p><button type="button" class="ff-btn" data-ffretry>TRY AGAIN</button></div>`;
    else if(!L.length)body=`<div class="ff-empty"><i>${BOOK}</i><b>None of your contacts are on StudyOS yet</b><p>Invite them and you both get 10 gems.</p><button type="button" class="ff-btn" data-ffinvite>INVITE FRIENDS</button></div>`;
    else{const left=L.filter(p=>rel(p)==='none'&&!isFriend(p.id));
      body=`<div class="ff-sec big">${L.length} ${L.length===1?'contact':'contacts'}${left.length?'<button type="button" class="ff-all" data-fffollowall>ADD ALL</button>':''}</div><div class="ff-list">${L.map((p,i)=>row(p,i)).join('')}</div>`}
    return scr(`${head('Contacts on StudyOS')}${body}${FF.cLoading?'':suggBlock(12)}`)};
  // 3) Search for friends
  const search=()=>{
    let body;const q=FF.q.trim();
    if(!q)body=`${FF.sugg===null?dots:`<div class="ff-sec">Friend suggestions</div><div class="ff-list">${suggList().slice(0,20).map((p,i)=>row(p,i,true)).join('')||'<p class="ff-note">Type a name or @username.</p>'}</div>`}`;
    else if(q.length<2)body='<p class="ff-note">Keep typing…</p>';
    else if(FF.sLoading&&!FF.res)body=dots;
    else if(FF.sErr)body=`<p class="ff-note">${esc(FF.sErr)}</p>`;
    else if(FF.res&&!FF.res.length)body=`<div class="ff-empty"><i>${MAG}</i><b>No one found for “${esc(q)}”</b><p>Check the spelling, or invite them to StudyOS.</p><button type="button" class="ff-btn" data-ffinvite>INVITE A FRIEND</button></div>`;
    else body=`<div class="ff-list">${(FF.res||[]).map((p,i)=>row(p,i)).join('')}</div>`;
    return scr(`${head('Search for friends')}<label class="ff-in"><span>${MAG}</span><input data-ffq type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="Name or username" value="${esc(FF.q)}"></label><div data-ffres>${body}</div>`)};
  // 4) All suggestions
  const all=()=>scr(`${head('Friend suggestions')}${FF.sugg===null?dots:`<div class="ff-list">${suggList().map((p,i)=>row(p,i,true)).join('')||'<p class="ff-note">No more suggestions right now.</p>'}</div>`}`);

  const follow=async(btn)=>{const id=btn.dataset.fffollow;if(btn.disabled)return;btn.disabled=true;hap('press');
    FF.sent[id]='sent';btn.classList.add('on');btn.innerHTML=btn.classList.contains('ff-add')?OKU:'REQUESTED';
    let r=null;try{r=CB.sendRequest?await CB.sendRequest(id):null}catch(_){r=null}
    if(r&&r.ok){FF.sent[id]=r.status==='friends'?'friends':'sent';hap('success');toast(r.status==='friends'?'You are now friends!':'Friend request sent')}
    else{delete FF.sent[id];btn.disabled=false;btn.classList.remove('on');btn.innerHTML=btn.classList.contains('ff-add')?ADDU:'ADD FRIEND';toast((r&&r.error)||'Could not send the request.')}};
  const loadContacts=async()=>{FF.cLoading=true;FF.cErr='';go('Contacts on StudyOS',true);
    let r=null;try{r=CB.findContacts?await CB.findContacts():null}catch(_){r=null}
    FF.cLoading=false;if(r&&r.ok)FF.contacts=r.matches||[];else FF.cErr=r&&r.denied?'denied':((r&&r.error)||'Could not read your contacts.');
    if(SCREENS[CUR]&&SCREENS[CUR].t==='Contacts on StudyOS')go('Contacts on StudyOS',true)};
  let sT=0,sTok=0;
  const runSearch=()=>{clearTimeout(sT);const q=FF.q.trim();if(q.length<2){FF.res=null;FF.sErr='';paintRes();return}
    FF.sLoading=true;paintRes();const tok=++sTok;
    sT=setTimeout(async()=>{let r=null;try{r=CB.searchUsers?await CB.searchUsers(q):null}catch(_){r=null}
      if(tok!==sTok)return;FF.sLoading=false;if(r&&r.ok){FF.res=r.results;FF.sErr=''}else{FF.res=[];FF.sErr=(r&&r.message)||'Could not search right now.'}paintRes()},280)};
  const paintRes=()=>{const box=R&&R.querySelector('[data-ffres]');if(!box)return;const tmp=document.createElement('div');tmp.innerHTML=search();const nb=tmp.querySelector('[data-ffres]');if(nb)box.innerHTML=nb.innerHTML};
  const anim=()=>{if(SOFT)return;$$('.ff-opt,.ff-card,.ff-row',R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260,delay:Math.min(i,14)*35,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}))};
  const common=e=>{const t=e.target;
    if(t.closest('[data-ffback]')){back();return true}
    const h=t.closest('[data-ffhide]');if(h){e.stopPropagation();FF.hide[h.dataset.ffhide]=1;saveHide();hap('light');const el=h.closest('.ff-card,.ff-row');if(el){el.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.9)'}],{duration:180,fill:'forwards'});setTimeout(()=>go(SCREENS[CUR].t,true),170)}return true}
    const f=t.closest('[data-fffollow]');if(f){e.stopPropagation();follow(f);return true}
    if(t.closest('[data-ffall]')){hap('light');go('Friend suggestions');return true}
    if(t.closest('[data-ffinvite]')){hap('light');if(CB.invite)CB.invite();return true}
    const o=t.closest('[data-ffopen]');if(o&&isFriend(o.dataset.ffopen)){DZ.openFriend&&DZ.openFriend(o.dataset.ffopen,SCREENS[CUR].t);return true}
    return false};
  const reg=(t,html,play)=>{const k=IDX(t);if(k>=0)SCREENS.splice(k,1);SCREENS.push({t,d:t,g:'Friends pages',spec:{m:'',h:'',s:''},html,play})};
  reg('Find friends',hub,()=>{enter();anim();loadSugg();R.onclick=e=>{if(common(e))return;const g=e.target.closest('[data-ffgo]');if(!g)return;hap('light');
    if(g.dataset.ffgo==='contacts'){go('Contacts on StudyOS');if(!FF.contacts)loadContacts()}else if(g.dataset.ffgo==='search'){go('Search friends')}else{DZ.fsBack='Find friends';DZ.fsData={id:'me',name:D.fullName||D.first||'Me',pic:D.picture||'',handle:D.username||'student',col:DZ.fxCol?DZ.fxCol(D.first||'Me'):'#c9b8c3',avatar:D.avatar||''};go('Friend share')}}});
  reg('Contacts on StudyOS',contacts,()=>{enter();anim();loadSugg();R.onclick=async e=>{if(common(e))return;
    if(e.target.closest('[data-ffretry]')){hap('light');loadContacts();return}
    const fa=e.target.closest('[data-fffollowall]');if(fa){fa.disabled=true;hap('press');const L=(FF.contacts||[]).filter(p=>rel(p)==='none'&&!isFriend(p.id));let n=0;for(const p of L){FF.sent[p.id]='sent';try{const r=CB.sendRequest?await CB.sendRequest(p.id):null;if(r&&r.ok)n++;else delete FF.sent[p.id]}catch(_){delete FF.sent[p.id]}}hap('success');toast(n?`Sent ${n} friend ${n===1?'request':'requests'}`:'Could not send requests.');go('Contacts on StudyOS',true)}}});
  reg('Search friends',search,()=>{enter();loadSugg();const inp=R.querySelector('[data-ffq]');
    if(inp){setTimeout(()=>{try{inp.focus()}catch(_){}},200);inp.oninput=()=>{FF.q=inp.value;runSearch()};inp.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();try{inp.blur()}catch(_){}}}}
    R.onclick=e=>{common(e)}});
  reg('Friend suggestions',all,()=>{enter();anim();loadSugg();R.onclick=e=>{common(e)}});
  DZ.openFindFriends=()=>{FF.q='';FF.res=null;go('Find friends')};

  // 5) Invite friends to start new Friend Streaks
  const loadInv=async()=>{if(FF.invLoading)return;FF.invLoading=true;let r=null;try{r=CB.streakInvites?await CB.streakInvites():null}catch(_){r=null}
    FF.invLoading=false;FF.inv=r&&r.ok?r:{invited:[],remaining:3,perDay:3,err:true};if(SCREENS[CUR]&&SCREENS[CUR].t==='Streak invite')go('Streak invite',true)};
  const inv=()=>{const fr=(D.friends||[]),I=FF.inv,left=I?I.remaining:null,done=new Set((I&&I.invited)||[]);
    const list=fr.length?`<div class="ff-list ff-inv">${fr.map((f,i)=>{const on=done.has(String(f.id));return `<div class="ff-row" style="--k:${i}">${face({id:f.id,name:f.name,avatar:f.avatar,picture:f.picture})}<span class="ff-nm"><b>${esc(f.name)}</b>${f.streak?`<small>${f.streak} day streak</small>`:''}</span><button type="button" class="ff-invb${on?' on':''}" data-ffinv="${esc(f.id)}"${on||left===0?' disabled':''}>${on?'INVITED':'INVITE'}</button></div>`}).join('')}</div>`
      :`<div class="ff-empty"><i>${ADDU}</i><b>No friends yet</b><p>Add friends first, then invite them to a Friend Streak.</p><button type="button" class="ff-btn" data-ffadd>FIND FRIENDS</button></div>`;
    return scr(`<div class="ff-hd"><button type="button" class="ff-bk" data-ffback aria-label="Close">${XX}</button><span></span><span></span></div><h1 class="ff-h1 sm">Invite friends to start new Friend Streaks!</h1><p class="ff-left">${I===null?'Checking your invites…':left+' '+(left===1?'invite':'invites')+' remaining'}</p>${list}`,'ff-invp')};
  reg('Streak invite',inv,()=>{enter();anim();if(!FF.inv)loadInv();R.onclick=async e=>{if(common(e))return;
    if(e.target.closest('[data-ffadd]')){hap('light');go('Find friends');return}
    const b=e.target.closest('[data-ffinv]');if(!b||b.disabled)return;b.disabled=true;b.textContent='…';hap('press');
    let r=null;try{r=CB.streakInvite?await CB.streakInvite(b.dataset.ffinv):null}catch(_){r=null}
    if(r&&r.ok){FF.inv=FF.inv||{invited:[],remaining:3};FF.inv.invited=[...(FF.inv.invited||[]),b.dataset.ffinv];FF.inv.remaining=r.remaining;toast('Friend Streak invite sent!');go('Streak invite',true)}
    else{b.disabled=false;b.textContent='INVITE';toast((r&&r.message)||'Could not send the invite.')}}});
  DZ.openStreakInvite=()=>{FF.inv=null;go('Streak invite')};

  // Profile: ADD FRIENDS opens Find friends; a dashed "+" circle after Friend streaks opens the invite page
  {const k=IDX('Profile');if(k>=0){const ph=SCREENS[k].html,pp=SCREENS[k].play;
    SCREENS[k].html=()=>{let h=ph();const a=h.search(/<div class="sec[^"]*">(<span>)?Friend streaks/);
      if(a>0){const plus=`<div class="pf-add" data-ffstreak role="button" aria-label="Invite friends to a Friend Streak"><span class="pf-plus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg></span><span class="pf-fn">Invite</span></div>`;
        const fs=h.indexOf('<div class="fs"',a);
        if(fs>0){const end=h.indexOf('</div></div></div>',fs);const close=(()=>{let d=0,i=fs;const re=/<div\b|<\/div>/g;re.lastIndex=fs;let m;while((m=re.exec(h))){d+=m[0]==='</div>'?-1:1;if(d===0)return m.index}return -1})();
          if(close>0){const open=h.indexOf('>',fs)+1;h=h.slice(0,open)+plus+h.slice(open)}}
        else{const t=h.indexOf('Add friends to see them here.</div>',a);if(t>0){const e2=t+'Add friends to see them here.</div>'.length;h=h.slice(0,e2)+`<div class="fs fsx">${plus}</div>`+h.slice(e2)}}}
      return h};
    SCREENS[k].play=()=>{pp();const old=R.onclick;R.onclick=e=>{
      if(e.target.closest('[data-ffstreak]')){hap('light');DZ.openStreakInvite();return}
      if(e.target.closest('[data-friends]')){hap('light');DZ.openFindFriends();return}
      if(old)old(e)}}}}
}

/* ==== v109: Streak celebration (ignite → spin jump → slam → count up → week fills) + real Streak hub ==== */
{
  const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  // the real streak data: studied days from the app (focus sessions, finished tasks, freezes)
  const studied=()=>new Set(Array.isArray(D.streakDays)?D.streakDays:[]);
  const iced=()=>new Set((D.shop&&D.shop.protectedDays)||[]);
  // ---- tiny synth for the celebration (separate from the tap sounds, which stay silent) ----
  let AC=null;const ac=()=>{try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(_){return null}};
  const tone=(f,d,o={})=>{const c=ac();if(!c)return;const t=c.currentTime+(o.t||0),os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.g||.2,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g);g.connect(c.destination);os.start(t);os.stop(t+d+.05)};
  const noise=(d,o={})=>{const c=ac();if(!c)return;const t=c.currentTime+(o.t||0),n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,o.p||2);
    const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type=o.type||'lowpass';f.frequency.setValueAtTime(o.f1||1200,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);g.gain.value=o.g||.3;s.connect(f);f.connect(g);g.connect(c.destination);s.start(t)};
  const SND={
    ignite(){noise(.35,{f1:600,f2:4000,type:'bandpass',g:.35});tone(220,.3,{f2:660,type:'triangle',g:.12})},
    whoosh(){noise(.45,{f1:400,f2:2600,type:'bandpass',g:.3,p:1.2});tone(330,.4,{f2:990,g:.08})},
    slam(){tone(110,.45,{f2:38,g:.7});noise(.25,{f1:900,f2:120,g:.45});tone(660,.12,{t:.02,type:'square',g:.04})},
    count(i){tone(740+i*60,.08,{type:'triangle',g:.12})},
    day(i){tone(880+i*70,.1,{type:'triangle',g:.13});tone(1760+i*140,.06,{t:.03,g:.05})},
    win(){[784,988,1175,1568].forEach((f,i)=>{tone(f,.28,{t:i*.09,type:'triangle',g:.14});tone(f*2,.16,{t:i*.09,g:.03})})}
  };
  // ---- the flame (same shape as the reference: rounded red flame, orange body, white drop) ----
  const FLAME=(id,grey)=>`<svg viewBox="0 0 100 120" class="sc-fl${grey?' grey':''}" aria-hidden="true">${flameInner(grey?FLAME_PAL.grey:FLAME_PAL.red,id,{shadow:false,cls:true})}</svg>`;
  const CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"><path d="M5.500 12.500l4.500 4.500L18.500 7.500"/></svg>';
  const CHEST=()=>`<img class="sc-chest" src="${(DZ.CHI||{}).early||''}" alt="" draggable="false">`;
  const SH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.500 7.500L12 3l4.500 4.500M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>';
  const info=()=>{const n=Math.max(0,D.streak||0),now=new Date(),dow=(now.getDay()+6)%7,S0=studied(),tk=dayKey(now),today=S0.has(tk)||(D.todayMin||0)>0;
    const days=[];for(let i=0;i<7;i++){const d=new Date(now);d.setDate(now.getDate()+i-dow);const k=dayKey(d);days.push(i<dow?S0.has(k):i===dow?today:false)}
    const dates=[];for(let i=0;i<7;i++){const d=new Date(now);d.setDate(now.getDate()+i-dow);dates.push(d.getDate())}
    return {n,dow,today,days,dates}};
  const digits=(s)=>[...s].map(()=>`<span class="sc-d"><span class="sc-c">${'0123456789'.split('').map(x=>`<b>${x}</b>`).join('')}</span></span>`).join('');
  const html=()=>{const I=info(),L=['Mo','Tu','We','Th','Fr','Sa','Su'],first=String(D.first||'').split(' ')[0];
    const lo=I.days.indexOf(true),hi=I.days.lastIndexOf(true);
    return wrapD(`<div class="scx"><button class="sc-x" type="button" data-scback aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
<div class="sc-stage"><div class="sc-arc"></div><div class="sc-sh"></div><div class="sc-fw">${FLAME('scg',true)}${FLAME('scf',false)}</div><div class="sc-pill"></div><div class="sc-emb"></div></div>
<div class="sc-num" aria-label="${I.n} day streak">${digits(String(I.n))}</div><div class="sc-lb">day streak</div>
<div class="sc-wk"><div class="sc-wl">${L.map((d,i)=>`<span class="${i===I.dow?'t':''}">${d}</span>`).join('')}</div>
<div class="sc-wr"><i class="sc-cap" style="--lo:${lo<0?0:lo};--hi:${hi<0?0:hi}"></i>${L.map((d,i)=>`<span class="sc-dot${I.days[i]?' on':''}${i===I.dow?' t':''}${i>I.dow?' fu':''}" style="--k:${i}">${i===6&&!I.days[i]?CHEST():I.days[i]?CHK:''}</span>`).join('')}</div>
<div class="sc-wn">${I.dates.map((d,i)=>`<span class="${I.days[i]?'on':''}${i===I.dow?' t':''}${i>I.dow?' fu':''}">${d}</span>`).join('')}</div></div>
<p class="sc-msg">${I.n===0?'Study today to light your first flame!':I.today?`Keep learning tomorrow to make it ${I.n+1}!`:`Study today to keep your ${I.n} day streak!`}</p>
<div class="sc-bt"><button class="sc-shb" type="button" data-scshare aria-label="Share my streak">${SH}</button><button class="sc-go" type="button" data-scgo>${I.n} ${I.n===1?'DAY':'DAYS'}. GO ${esc(first.toUpperCase()||'YOU')}</button></div></div>`)};
  const play=()=>{const TK=.7,atk=(ms,fn)=>at(Math.round(ms*TK),fn);const I=info(),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    const to=String(I.n),from=I.today&&I.n>0?String(I.n-1).padStart(to.length,' '):to;
    const cols=$$('.sc-c',R),set=(c,ch)=>{c.style.transform=`translateY(${-(ch===' '?0:+ch)*10}%)`;c.parentNode.classList.toggle('blank',ch===' ')};
    R.onclick=e=>{if(e.target.closest('[data-scback]')){back();return}
      if(e.target.closest('[data-scshare]')){hap('light');if(CB.share)CB.share(I.n+' day study streak on StudyOS! Can you beat it?');return}
      if(e.target.closest('[data-scgo]')){hap('success');back();return}
      if(e.target.closest('.sc-fw')){hap('streakIgnite');SND.ignite();const w=$('.sc-fw',R);w&&w.animate([{transform:'none'},{transform:'translateY(-30px) rotate(-12deg) scale(1.08)'},{transform:'none'}],{duration:460,easing:'cubic-bezier(.3,1.4,.5,1)'});embers(10)}};
    const root=$('.scx',R),stage=$('.sc-stage',R),fw=$('.sc-fw',R),grey=$('.sc-fl.grey',R),fl=$$('.sc-fl',R)[1],pill=$('.sc-pill',R),arc=$('.sc-arc',R),num=$('.sc-num',R);
    if(!fw||!fl||!grey||!num){cols.forEach((c,i)=>set(c,to[i]));return}
    const embers=(n)=>{const box=$('.sc-emb',R);if(!box||reduce)return;for(let i=0;i<n;i++){const p=document.createElement('i'),c=['#ffb02e','#ff6a3d','#ffe680','#ff3b3b'][i%4],x=(Math.random()-.5)*120,y=-90-Math.random()*120,s=3+Math.random()*5;p.style.cssText=`width:${s}px;height:${s}px;background:${c}`;box.appendChild(p);
      p.animate([{transform:'translate(-50%,0) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${x}px),${y}px) scale(.2)`,opacity:0}],{duration:900+Math.random()*900,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>p.remove()}};
    const finalState=()=>{cols.forEach((c,i)=>set(c,to[i]));root.classList.add('lit');grey.style.opacity=0;fl.style.opacity=1};
    if(SOFT||reduce||!(I.today&&I.n>0)){finalState();root.classList.add('done');if(!SOFT&&!reduce){$$('.sc-num,.sc-lb,.sc-wk,.sc-msg,.sc-bt',R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:420,delay:200+i*90,fill:'backwards'}))}
      if(!reduce&&I.n>0){const t=setInterval(()=>{if(!R||!R.isConnected||SCREENS[CUR].t!=='Streak celebration'){clearInterval(t);return}embers(2)},420)}return}
    // 0 — yesterday: grey flame, grey number
    cols.forEach((c,i)=>set(c,from[i]));fl.style.opacity=0;
    const A=(el,k,o)=>{o=Object.assign({},o);if(o.duration)o.duration*=TK;if(o.delay)o.delay*=TK;return el&&el.animate(k,Object.assign({fill:'both',easing:'cubic-bezier(.2,.9,.3,1)'},o))};
    A(fw,[{transform:'scale(.6)',opacity:0},{transform:'none',opacity:1}],{duration:380});
    A(num,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:380,delay:120});
    atk(80,()=>hap('streakBuild'));
    // 1 — the grey flame squashes into a glowing pill and ignites
    atk(620,()=>{A(fw,[{transform:'none'},{transform:'scaleY(.35) scaleX(1.25) translateY(40px)'}],{duration:180,easing:'ease-in'});A(pill,[{opacity:0,transform:'translate(-50%,-50%) scale(.5)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:180,delay:120})});
    atk(900,()=>{SND.ignite();hap('streakIgnite');grey.style.opacity=0;fl.style.opacity=1;A(pill,[{opacity:1},{opacity:0,transform:'translate(-50%,-50%) scale(1.6)'}],{duration:260});
      // sparks swirl out
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2,sp=document.createElement('i');sp.className='sc-spk';sp.style.background=['#ffb02e','#ff6a3d','#ffe680'][i%3];stage.appendChild(sp);const r=70+(i%4)*26;
        sp.animate([{transform:'translate(-50%,-50%) rotate(0) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r-40}px)) rotate(${200+i*20}deg) scale(.2)`,opacity:0}],{duration:800+(i%5)*80,easing:'cubic-bezier(.1,.8,.3,1)',fill:'both'}).onfinish=()=>sp.remove()}});
    // 2 — the flame leaps up, spins a full turn
    atk(980,()=>{SND.whoosh();A(fw,[{transform:'scaleY(.35) scaleX(1.25) translateY(40px)'},{transform:'translateY(-150px) rotate(180deg) scale(.9)',offset:.55},{transform:'translateY(-170px) rotate(360deg) scale(1)'}],{duration:560,easing:'cubic-bezier(.2,.8,.3,1)'});embers(5)});
    // 3 — and slams down onto the ground: shock arc, screen shake, heavy haptic, thud
    atk(1540,()=>{A(fw,[{transform:'translateY(-170px) rotate(360deg)'},{transform:'translateY(6px) rotate(360deg) scaleY(.78) scaleX(1.18)',offset:.55},{transform:'translateY(-8px) rotate(360deg) scaleY(1.06) scaleX(.96)',offset:.8},{transform:'rotate(360deg)'}],{duration:420,easing:'cubic-bezier(.55,0,.6,1)'})});
    atk(1770,()=>{SND.slam();hap('streakLand');setTimeout(()=>hap('heavy'),60);
      A(arc,[{opacity:.9,transform:'translate(-50%,0) scale(.4)'},{opacity:0,transform:'translate(-50%,0) scale(1.5)'}],{duration:700,easing:'ease-out'});
      A(stage,[{transform:'translateY(0)'},{transform:'translateY(7px)'},{transform:'translateY(-4px)'},{transform:'translateY(2px)'},{transform:'none'}],{duration:340,fill:'none'});
      A($('.sc-sh',R),[{transform:'translateX(-50%) scale(1.5)',opacity:.6},{transform:'translateX(-50%) scale(1)',opacity:.35}],{duration:420});
      embers(8);root.classList.add('lit')});
    // 4 — the number rolls up and turns orange
    atk(1860,()=>{cols.forEach((c,i)=>{if(from[i]===to[i])return;const f0=from[i]===' '?0:+from[i];c.parentNode.classList.remove('blank');
        c.animate([{transform:`translateY(${-f0*10}%)`},{transform:`translateY(${-to[i]*10}%)`}],{duration:700,delay:i*90,easing:'cubic-bezier(.3,1.5,.45,1)',fill:'forwards'});setTimeout(()=>SND.count(i),i*90+300)});
      A(num,[{transform:'scale(1)'},{transform:'scale(1.16)',offset:.45},{transform:'scale(1)'}],{duration:620,delay:200,fill:'none'});hap('streakRoll')});
    A($('.sc-lb',R),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:400,delay:2100});
    // 5 — this week fills in with the gradient, one day after another
    A($('.sc-wk',R),[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:400,delay:2300});
    const cap=$('.sc-cap',R),dots=$$('.sc-dot.on',R);
    if(cap&&dots.length)A(cap,[{clipPath:'inset(0 100% 0 0 round 99px)'},{clipPath:'inset(0 0 0 0 round 99px)'}],{duration:220*Math.max(1,dots.length),delay:2550,easing:'cubic-bezier(.5,0,.3,1)'});
    dots.forEach((d,i)=>{A(d,[{transform:'scale(.3)',opacity:0},{transform:'scale(1.3)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],{duration:360,delay:2550+i*220});atk(2550+i*220,()=>{SND.day(i);hap('tick')})});
    const td=$('.sc-dot.t',R);if(td)atk(2600+dots.length*220,()=>{A(td,[{transform:'scale(1)'},{transform:'scale(1.45)',offset:.4},{transform:'scale(1)'}],{duration:520,easing:'ease-out',fill:'none'});SND.win();hap('celebrate');embers(10)});
    A($('.sc-msg',R),[{opacity:0},{opacity:1}],{duration:420,delay:2800+dots.length*220});
    A($('.sc-bt',R),[{opacity:0,transform:'translateY(40px)'},{opacity:1,transform:'none'}],{duration:480,delay:2900+dots.length*220});
    atk(3100+dots.length*220,()=>{root.classList.add('done');const t=setInterval(()=>{if(!R||!R.isConnected||SCREENS[CUR].t!=='Streak celebration'){clearInterval(t);return}embers(2)},420)});
  };
  const k=IDX('Streak celebration');if(k>=0){SCREENS[k].html=html;SCREENS[k].play=play}
}

/* ==== v111: Friend Streaks banner — characters around the fire having real conversations ==== */
{
  const FL='<svg viewBox="0 0 100 120" aria-hidden="true">'+flameInner(FLAME_PAL.red,'bnf',{shadow:false,cls:true})+'</svg>';
  // Conversations about the app. w = who speaks (0,1,2 → seat), g = hand gesture, r = how the others react, a = body action.
  const BIC={"heart": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ff5a7a\"/><path d=\"M12 20s-7-4.4-7-9.5A3.900 3.900 0 0112 8a3.900 3.900 0 017 2.500C19 15.600 12 20 12 20z\" fill=\"#fff\"/></svg>", "star": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ffb020\"/><path d=\"M12 4l2.400 5 5.400.6-4 3.700 1.100 5.300L12 16l-4.900 2.600L8.200 13.300l-4-3.700 5.400-.6z\" fill=\"#fff\"/></svg>", "spark": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#b38bff\"/><path d=\"M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z\" fill=\"#fff\"/><circle cx=\"18\" cy=\"17\" r=\"1.600\" fill=\"#fff\"/></svg>", "bulb": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ffc83d\"/><path d=\"M12 4a5.500 5.500 0 00-3.300 9.900c.6.5 1 1.200 1 2V17h4.600v-1.100c0-.8.4-1.500 1-2A5.500 5.500 0 0012 4z\" fill=\"#fff\"/><rect x=\"9.800\" y=\"18\" width=\"4.400\" height=\"2\" rx=\"1\" fill=\"#fff\"/></svg>", "fire": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ff6a2a\"/><path d=\"M12 3c.8 3 4.500 4.600 4.500 8.700A4.500 4.500 0 0112 16.300a4.500 4.500 0 01-4.500-4.700c0-1.800.9-3 2-4.200.2 1.400.9 2.100 1.600 2.300C10.700 7 11 4.800 12 3z\" fill=\"#fff\"/><path d=\"M12 21a3 3 0 01-3-3c0-1.300 1.200-2.200 3-3.700 1.800 1.500 3 2.400 3 3.700a3 3 0 01-3 3z\" fill=\"#ffe0c8\"/></svg>", "check": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#2e9e5b\"/><path d=\"M6.500 12.500l3.500 3.500 7.500-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.800\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "ask": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#4f8df0\"/><path d=\"M9.300 9.200a2.800 2.800 0 115.200 1.400c-.7 1-2.200 1.500-2.500 2.900\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.400\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"17.300\" r=\"1.400\" fill=\"#fff\"/></svg>", "wow": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ff8a3d\"/><rect x=\"10.700\" y=\"5\" width=\"2.600\" height=\"9\" rx=\"1.300\" fill=\"#fff\"/><circle cx=\"12\" cy=\"17.500\" r=\"1.500\" fill=\"#fff\"/></svg>", "ha": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ffb020\"/><circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#fff\"/><path d=\"M8.500 12.500a3.500 3.500 0 007 0z\" fill=\"#ffb020\"/><circle cx=\"9.500\" cy=\"9.800\" r=\"1\" fill=\"#ffb020\"/><circle cx=\"14.500\" cy=\"9.800\" r=\"1\" fill=\"#ffb020\"/></svg>", "clock": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#3fa7e8\"/><circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.400\"/><path d=\"M12 8.500V12l2.500 1.500\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.400\" stroke-linecap=\"round\"/></svg>", "target": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#e8465a\"/><circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.200\"/><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"#fff\"/></svg>", "card": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#7a6cf0\"/><rect x=\"6\" y=\"5\" width=\"12\" height=\"14\" rx=\"2.500\" fill=\"#fff\"/><path d=\"M9 10h6M9 13.500h4\" stroke=\"#7a6cf0\" stroke-width=\"1.800\" stroke-linecap=\"round\"/></svg>", "gem": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ff4a6d\"/><path d=\"M8 5h8l3.500 5L12 19 4.500 10z\" fill=\"#fff\"/><path d=\"M4.500 10h15\" stroke=\"#ff4a6d\" stroke-width=\"1.400\"/></svg>", "shield": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#3fa7e8\"/><path d=\"M12 4l6.500 2.600v5c0 4-2.800 6.800-6.500 8.400-3.700-1.600-6.500-4.400-6.500-8.400v-5z\" fill=\"#fff\"/><path d=\"M9 12l2 2 4-4\" fill=\"none\" stroke=\"#3fa7e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "snow": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#5cc4f0\"/><path d=\"M12 4v16M5 8l14 8M19 8L5 16\" stroke=\"#fff\" stroke-width=\"2.200\" stroke-linecap=\"round\"/></svg>", "crown": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ffb020\"/><path d=\"M5 9l3.500 3L12 6l3.500 6L19 9l-1.500 9h-11z\" fill=\"#fff\"/></svg>", "flag": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#2e9e5b\"/><path d=\"M7 20V5\" stroke=\"#fff\" stroke-width=\"2.200\" stroke-linecap=\"round\"/><path d=\"M7 5.500h10l-2.200 3.500L17 12.500H7z\" fill=\"#fff\"/></svg>", "up": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#7a6cf0\"/><path d=\"M12 5l6 7h-4v7h-4v-7H6z\" fill=\"#fff\"/></svg>", "hand": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#ff8a3d\"/><path d=\"M9 12V6.500a1.300 1.300 0 012.600 0V11M11.600 10.500v-5a1.300 1.300 0 012.600 0v5.500M14.200 11V7a1.300 1.300 0 012.600 0v7c0 3.300-2.200 5.500-5 5.500-2.300 0-3.600-1.200-4.700-3.200L5.500 13.200a1.300 1.300 0 012.200-1.300L9 13.500\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.700\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "sad": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#8b98a2\"/><circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#fff\"/><path d=\"M9 15.500a4 4 0 016 0\" fill=\"none\" stroke=\"#8b98a2\" stroke-width=\"1.800\" stroke-linecap=\"round\"/><circle cx=\"9.500\" cy=\"10\" r=\"1\" fill=\"#8b98a2\"/><circle cx=\"14.500\" cy=\"10\" r=\"1\" fill=\"#8b98a2\"/></svg>", "cool": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#3fa7e8\"/><circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#fff\"/><path d=\"M6.500 10h11\" stroke=\"#3fa7e8\" stroke-width=\"2.600\" stroke-linecap=\"round\"/><path d=\"M9.500 14.500a3.500 3.500 0 005 0\" fill=\"none\" stroke=\"#3fa7e8\" stroke-width=\"1.800\" stroke-linecap=\"round\"/></svg>"};
  const STORIES=[
   [{w:0,t:'I finished my focus session!',g:'spark',a:'jump',r:'spark'},{w:1,t:'How long did you go?',g:'ask',r:'wow'},{w:0,t:'25 minutes. No phone!',g:'hand',a:'proud',r:'wow'},{w:1,t:'Okay, my turn next!',g:'fire',a:'jump',r:'fire'}],
   [{w:1,t:'My streak is almost 7 days.',g:'up',a:'proud',r:'heart'},{w:0,t:'One more day for the badge!',g:'star',r:'spark'},{w:1,t:'Don\u2019t let me skip tomorrow.',g:'heart',a:'lean',r:'heart'},{w:0,t:'Deal. Streak buddies!',g:'heart',a:'jump',r:'fire'}],
   [{w:0,t:'Physics test on Friday...',g:'sad',a:'sad',r:'heart'},{w:1,t:'Add it in Exam mode!',g:'bulb',a:'lean',r:'bulb'},{w:0,t:'It makes a daily plan?',g:'ask',r:'check'},{w:1,t:'Yes! Small tasks each day.',g:'check',a:'proud',r:'heart'}],
   [{w:1,t:'Quiz me on my flashcards?',g:'card',a:'lean',r:'ha'},{w:0,t:'What is the powerhouse of the cell?',g:'bulb',r:'ask'},{w:1,t:'Mitochondria!',g:'hand',a:'jump',r:'hand'},{w:0,t:'Correct! +10 XP',g:'star',a:'proud',r:'spark'}],
   [{w:0,t:'I bought a Streak Freeze.',g:'snow',a:'proud',r:'wow'},{w:1,t:'Smart. For busy days?',g:'ask',r:'snow'},{w:0,t:'Exactly. My streak is safe.',g:'shield',r:'cool'},{w:1,t:'I\u2019m saving gems for one!',g:'gem',a:'jump',r:'fire'}],
   [{w:1,t:'Look, I\u2019m #1 in gems!',g:'crown',a:'proud',r:'wow'},{w:0,t:'Not for long!',g:'fire',a:'lean',r:'ha'},{w:1,t:'Race you this week?',g:'flag',r:'fire'},{w:0,t:'You\u2019re on!',g:'hand',a:'jump',r:'hand'}],
   [{w:0,t:'Notes or flashcards first?',g:'ask',r:'ask'},{w:1,t:'Notes, then make cards.',g:'card',a:'lean',r:'bulb'},{w:0,t:'One tap from a note?',g:'up',r:'wow'},{w:1,t:'Yep, the brain button!',g:'bulb',a:'proud',r:'spark'}],
   [{w:0,t:'Good morning, team!',g:'hand',a:'jump',r:'hand'},{w:1,t:'Today\u2019s goal: 60 minutes.',g:'target',a:'proud',r:'fire'},{w:2,t:'I\u2019m in. Let\u2019s go!',g:'up',a:'jump',r:'fire'},{w:0,t:'Fire\u2019s lit. Start the timer!',g:'clock',a:'lean',r:'spark'}]
  ];
  const crew=()=>{const out=[];
    if(typeof D.avatar==='string'&&D.avatar)out.push({id:'me',name:D.first||'You',code:D.avatar,me:1});
    (D.friends||[]).forEach(f=>{if(typeof f.avatar==='string'&&f.avatar)out.push({id:f.id,name:f.name||'Friend',code:f.avatar})});
    return out.slice(0,4)};
  // seats: two at the front beside the fire, then two behind, all standing on the same ground line
  const SEATS=[{x:27,s:1,b:0,f:1},{x:73,s:1,b:0,f:-1},{x:9,s:.86,b:10,f:1},{x:91,s:.86,b:10,f:-1}];
  const html=()=>{const L=crew();const ppl=L.length>=2?L:L.length===1?[L[0],{dflt:1,chr:1,name:'Zip'}]:[{dflt:1,chr:1,name:'Zip'},{dflt:1,chr:10,name:'Mia'}];
    const figs=ppl.map((p,i)=>{const st=SEATS[i];const v=p.dflt?Object.assign(avDecode(''),{chr:p.chr}):avDecode(p.code);const chr=v.chr>0;
      const svg=avatarSvg(v,{view:chr?'full':'both',style:'width:100%;height:100%;display:block'});
      return `<div class="bn-p${p.me?' me':''}${chr?' chr':' bust'}" data-seat="${i}" style="--x:${st.x}%;--s:${st.s};--b:${st.b}px;--f:${st.f};--i:${i};z-index:${i<2?12:8}"${p.dflt||p.me?'':` data-fid="${esc(p.id)}" role="button" aria-label="Open ${esc(p.name)}'s profile"`}>
<span class="bn-say" data-say><b></b></span><span class="bn-think" data-think><i></i><i></i><i></i></span><span class="bn-react" data-react></span>
<span class="bn-rig"><span class="bn-body">${svg}</span><span class="bn-hand l" data-hl></span><span class="bn-hand r" data-hr></span></span>
<span class="bn-nm">${esc(String(p.name).split(' ')[0])}</span><i class="bn-sh"></i></div>`}).join('');
    return `<div class="bn-wrap"><div class="bn-sky"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="bn-ground"></div>${figs}<div class="bn-fire" data-bnfire><span class="bn-glow"></span><span class="bn-fl">${FL}</span><span class="bn-emb"></span><i class="bn-fsh"></i></div></div>`};
  const play=()=>{const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    const box=R.querySelector('.svban');if(!box)return;box.innerHTML=html();
    const ppl=[...box.querySelectorAll('.bn-p')],fire=box.querySelector('.bn-fire'),fl=box.querySelector('.bn-fl'),emb=box.querySelector('.bn-emb');
    if(reduce){const s=ppl[0]&&ppl[0].querySelector('[data-say] b');if(s){s.textContent=STORIES[0][0].t;ppl[0].querySelector('[data-say]').style.opacity=1}return}
    const run=RUN;const alive=()=>run===RUN&&box.isConnected;const T=(ms,fn)=>setTimeout(()=>{if(alive())fn()},ms);
    ppl.forEach((p,i)=>p.animate([{opacity:0,transform:'translateX(-50%) translateY(40px) scale(calc(var(--s)*.8))'},{opacity:1,transform:'translateX(-50%) translateY(0) scale(var(--s))'}],{duration:560,delay:120+i*120,easing:'cubic-bezier(.3,1.4,.5,1)',fill:'backwards'}));
    fire.animate([{opacity:0,transform:'translateX(-50%) scale(.3)'},{opacity:1,transform:'translateX(-50%) scale(1)'}],{duration:500,delay:80,easing:'cubic-bezier(.3,1.5,.5,1)',fill:'backwards'});
    const sparks=n=>{for(let k=0;k<n;k++){const e=document.createElement('i'),c=['#ffd23f','#ff8a2a','#fff3d6','#ff4a3b'][k%4],x=(Math.random()-.5)*60,y=-40-Math.random()*70,s=2+Math.random()*4;e.style.cssText=`width:${s}px;height:${s}px;background:${c}`;emb.appendChild(e);
      e.animate([{transform:'translate(-50%,0)',opacity:1},{transform:`translate(calc(-50% + ${x}px),${y}px)`,opacity:0}],{duration:800+Math.random()*700,easing:'ease-out'}).onfinish=()=>e.remove()}};
    const tE=setInterval(()=>{if(!alive()){clearInterval(tE);return}sparks(2)},260);
    const hop=()=>{fl.animate([{transform:'none'},{transform:'scaleY(.7) scaleX(1.15) translateY(6px)',offset:.15},{transform:'translateY(-40px) rotate(180deg)',offset:.5},{transform:'translateY(-46px) rotate(360deg)',offset:.62},{transform:'translateY(3px) rotate(360deg) scaleY(.8) scaleX(1.15)',offset:.82},{transform:'rotate(360deg)'}],{duration:1100,easing:'cubic-bezier(.3,.7,.3,1)'});
      T(900,()=>{sparks(10);box.animate([{transform:'none'},{transform:'translateY(3px)'},{transform:'none'}],{duration:220})})};
    fire.onclick=e=>{e.stopPropagation();hap('streakLand');hop()};
    // ---- body language ----
    const rig=p=>p.querySelector('.bn-rig'),body=p=>p.querySelector('.bn-body');
    const ACT={
      talk:p=>body(p).animate([{transform:'none'},{transform:'rotate(calc(var(--f)*-3deg)) translateY(-3px)'},{transform:'rotate(calc(var(--f)*2deg))'},{transform:'rotate(calc(var(--f)*-2deg)) translateY(-2px)'},{transform:'none'}],{duration:1400,easing:'ease-in-out'}),
      jump:p=>rig(p).animate([{transform:'none'},{transform:'scaleY(.88) scaleX(1.06)',offset:.18},{transform:'translateY(-26px) scaleY(1.05)',offset:.5},{transform:'translateY(2px) scaleY(.92) scaleX(1.05)',offset:.82},{transform:'none'}],{duration:820,easing:'cubic-bezier(.3,.7,.3,1)'}),
      proud:p=>rig(p).animate([{transform:'none'},{transform:'scale(1.07) translateY(-4px)',offset:.35},{transform:'scale(1.07) translateY(-4px)',offset:.7},{transform:'none'}],{duration:1100,easing:'cubic-bezier(.3,1.4,.5,1)'}),
      lean:p=>rig(p).animate([{transform:'none'},{transform:'translateX(calc(var(--f)*10px)) rotate(calc(var(--f)*6deg))',offset:.35},{transform:'translateX(calc(var(--f)*10px)) rotate(calc(var(--f)*6deg))',offset:.75},{transform:'none'}],{duration:1300,easing:'ease-in-out'}),
      sad:p=>rig(p).animate([{transform:'none'},{transform:'translateY(5px) rotate(calc(var(--f)*-4deg)) scaleY(.96)',offset:.3},{transform:'translateY(5px) rotate(calc(var(--f)*-4deg)) scaleY(.96)',offset:.8},{transform:'none'}],{duration:1500,easing:'ease-in-out'}),
      nod:p=>body(p).animate([{transform:'none'},{transform:'translateY(3px) rotate(calc(var(--f)*2deg))'},{transform:'none'},{transform:'translateY(3px)'},{transform:'none'}],{duration:900,easing:'ease-in-out'}),
      turn:(p,dir)=>rig(p).animate([{transform:'none'},{transform:`rotate(${dir*4}deg)`}],{duration:300,fill:'forwards',easing:'ease-out'})
    };
    // a hand gesture pops up beside the speaker and waves
    const gesture=(p,g,side)=>{const h=p.querySelector(side>0?'[data-hr]':'[data-hl]');h.innerHTML=BIC[g]||'';
      h.animate([{opacity:0,transform:'translateY(14px) scale(.3) rotate(-30deg)'},{opacity:1,transform:'translateY(-4px) scale(1.15) rotate(12deg)',offset:.18},{transform:'translateY(-2px) scale(1) rotate(-14deg)',offset:.36},{transform:'translateY(-3px) rotate(14deg)',offset:.54},{transform:'translateY(-2px) rotate(-8deg)',offset:.72,opacity:1},{opacity:0,transform:'translateY(6px) scale(.6)'}],{duration:2600,easing:'ease-in-out'})};
    const react=(p,e)=>{const r=p.querySelector('[data-react]');r.innerHTML=BIC[e]||'';r.animate([{opacity:0,transform:'translate(-50%,10px) scale(.3)'},{opacity:1,transform:'translate(-50%,-6px) scale(1.25)',offset:.25},{opacity:1,transform:'translate(-50%,-10px) scale(1)',offset:.75},{opacity:0,transform:'translate(-50%,-22px) scale(.8)'}],{duration:2000,easing:'cubic-bezier(.3,1.4,.5,1)'})};
    const think=(p,ms)=>{const t=p.querySelector('[data-think]');t.animate([{opacity:0,transform:'translateX(-50%) scale(.5)'},{opacity:1,transform:'translateX(-50%) scale(1)',offset:.15},{opacity:1,offset:.85},{opacity:0,transform:'translateX(-50%) scale(.8)'}],{duration:ms,easing:'ease-out'})};
    const say=(p,txt,ms)=>{const s=p.querySelector('[data-say]'),b=s.querySelector('b');b.textContent='';s.style.setProperty('--w',Math.min(170,Math.max(70,txt.length*6.6))+'px');
      s.animate([{opacity:0,transform:'translateX(-50%) translateY(10px) scale(.5)'},{opacity:1,transform:'translateX(-50%) scale(1.06)',offset:.08},{opacity:1,transform:'translateX(-50%) scale(1)',offset:.14},{opacity:1,offset:.9},{opacity:0,transform:'translateX(-50%) translateY(-6px) scale(.9)'}],{duration:ms,easing:'ease-out'});
      // typewriter so the line feels spoken
      let i=0;const tw=setInterval(()=>{if(!alive()){clearInterval(tw);return}i++;b.textContent=txt.slice(0,i);if(i>=txt.length)clearInterval(tw)},Math.max(38,Math.min(70,1500/txt.length)))};
    let si=Math.floor(Math.random()*STORIES.length);
    const runStory=()=>{if(!alive())return;
      let st=STORIES[si%STORIES.length];si++;if(ppl.length<3)st=st.filter(l=>l.w<2);
      let t=0;
      // someone thinks of a topic first
      think(ppl[st[0].w]||ppl[0],1600);t+=1600;
      st.forEach((ln,idx)=>{const sp=ppl[ln.w]||ppl[0],ms=Math.max(3400,ln.t.length*110+2100);
        T(t,()=>{ppl.forEach(q=>{if(q!==sp){const d=(+sp.dataset.seat%2===0)?-1:1;ACT.turn(q,(+q.dataset.seat%2===0)?1:-1)}else ACT.turn(q,0)});
          say(sp,ln.t,ms);ACT.talk(sp);if(ln.a&&ACT[ln.a])T(250,()=>ACT[ln.a](sp));
          if(ln.g)T(350,()=>gesture(sp,ln.g,(+sp.dataset.seat%2===0)?1:-1));
          if(ln.r)T(Math.min(ms-700,2200),()=>{ppl.filter(q=>q!==sp).forEach((q,j)=>T(j*180,()=>{react(q,ln.r);ACT.nod(q)}))});
          if(idx===st.length-1)T(ms-300,()=>{hop();ppl.forEach((q,j)=>T(j*90,()=>ACT.jump(q)))})});
        t+=ms+700});
      T(t+3600,runStory)};
    T(1100,runStory);
  };
  const k=IDX('Streak friends');if(k>=0){const op=SCREENS[k].play;SCREENS[k].play=function(){op.call(this);play()}}
}
const RUN_DEAD=()=>!host.isConnected;
function back(){
  const t=SCREENS[CUR]&&SCREENS[CUR].t;if(!t)return false;
  if(DZ.chestClose&&DZ.chestClose())return true;
  if(closeMore())return true;
  if(t==='Home')return false;
  if(host.classList.contains('dz-kb')&&document.activeElement&&document.activeElement.blur){document.activeElement.blur();return true}
  const Q=['Add note','Planner','Add subject','Quiz','Progress','Achievement','Reminder','Upload file'];
  let to='Settings';
  if(['Tasks','Focus','Study','Profile','Quick add','League'].includes(t))to='Home';
  else if(t==='Friend badges')to='Friend profile';
  else if(t==='Add task')to='Tasks';
  else if(Q.includes(t))to='Quick add';
  else if(t==='Delete account')to='Privacy settings';
  else if(t==='Edit avatar')to='Edit profile';
  else if(['Weekly report','Badges','Exam mode'].includes(t)){to=(t==='Badges'&&DZ.badgesFrom==='Profile')?'Profile':'Study';DZ.badgesFrom=null}
  else if(['Friends','Edit profile','Settings'].includes(t))to='Profile';
  else if(t==='Friend share')to=DZ.fsBack||'Friend profile';
  else if(t==='Friend profile')to=(DZ.fpFrom&&DZ.fpFrom!=='Friend profile')?DZ.fpFrom:'Profile';
  else if(t==='Search')to=DZ.searchFrom||'Home';
  else if(t==='Find friends'||t==='Streak invite')to='Profile';
  else if(['Contacts on StudyOS','Search friends','Friend suggestions'].includes(t))to='Find friends';
  else if(t==='Gem Shop'){if(DZ.closeSheet&&DZ.closeSheet())return true;to=DZ.shopFrom||'Home'}
  else if(t==='Gift gems')to='Gem Shop';
  else if(t==='Streak'||t==='Streak friends')to=DZ.streakFrom||'Home';
  else if(t==='Streak celebration')to=DZ.celFrom||'Home';
  hap('light');go(to);return true;
}
const api={openShop(){DZ.openShop('Study')},startFocus(){go('Focus');if(!F.running&&F.mode==='focus'&&F.left>0){start();go('Focus',true)}},navOnly,refresh,go,back,screen:()=>SCREENS[CUR]&&SCREENS[CUR].t,names:()=>SCREENS.map(s=>s.t),
  update(d){const was=D.streakPop||0;Object.assign(D,d);refresh();if((D.streakPop||0)>was&&DZ.celebrate)setTimeout(()=>{if(!RUN_DEAD())DZ.celebrate()},650)},
  destroy(){if(DZ.undoHide)DZ.undoHide();if(DZ.stopSound)DZ.stopSound();RUN++;timers.forEach(clearTimeout);ro.disconnect();host.innerHTML='';host.classList.remove('dz')}};
go(opts.start||'Home');
return api;
}
