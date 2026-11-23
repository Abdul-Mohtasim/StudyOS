/* eslint-disable */
// StudyOS main app screens (app only). Ported from the approved design file StudyOS_Final_Design_v14.html.
import { haptic } from "../haptics";
import "./design.css";
import qrcode from "qrcode-generator";
import { SCENES, createSoundscape } from "./soundscapes";
import { createPolish } from './polish.js';
import { createFlame } from './flame.js';
import { playStreakClip } from './streaksound.js';
import { avatarSvg, avDecode, avEncode, avBg, CH_BG, AVD, AVK, ZIP_CHR, TABS as AVTABS } from './avatar.js';
import { LANGS, setLanguage, getLanguage, translate as tr, englishText as en0 } from "../i18n";

export function mountDesign(host, opts = {}) {
host.classList.add('dz');host.setAttribute('data-own-haptics','');
const stage=document.createElement('div');stage.className='dz-stage';host.appendChild(stage);
let R=null,RUN=0,CUR=0;
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
const FLAME_IC='<svg viewBox="0 0 24 24"><path d="M12 2c1 3.5 5 5.6 5 10.2A5 5 0 0 1 12 17.5a5 5 0 0 1-5-5.3c0-2 1-3.4 2.2-4.7.2 1.6 1 2.4 1.8 2.6C10.7 7.3 11 4.6 12 2z" fill="#ff7a45"/><path d="M12 22a4 4 0 0 1-4-4c0-1.8 1.6-3 4-5 2.4 2 4 3.2 4 5a4 4 0 0 1-4 4z" fill="#ffb347"/></svg>';
const CUBE='<svg viewBox="40 0 385 466"><path d="M175 5L275 35L395 130L415 335L385 425L215 462L50 250Z" fill="#ff4a6d"/><path d="M275 35L205 205L210 232L285 350L412 335L275 35Z" fill="#ff617f"/><path d="M275 35L395 130L415 335L412 335Z" fill="#f993ac"/><path d="M50 250L210 232L285 350L215 462Z" fill="#ff335f"/><path d="M285 350L412 335L385 425L215 462Z" fill="#ff4a6d"/></svg>';
const BOLT='<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="#e8a83a"/></svg>';
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="#ebe8ea" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>';
const FO='M50 3C54 22 90 38 90 78c0 24-18 40-40 40S10 102 10 78c0-18 9-28 17-38 3 10 9 15 15 15-3-20 0-38 8-52z';
const FI='M50 66c7 10 14 18 14 27 0 9-6 15-14 15s-14-6-14-15c0-9 7-17 14-27z';
const flameSvg=(o,i)=>`<svg viewBox="0 0 100 120"><path d="${FO}" fill="${o}"/><path d="${FI}" fill="${i}"/></svg>`;
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
const FLM=(c,h,w=20,hh=24)=>`<svg viewBox="0 0 100 120" style="width:${w}px;height:${hh}px;display:block"><path d="${FO}" fill="${c}"/><path d="${FI}" fill="${h}"/></svg>`;
const NAVI={
 home:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
 tasks:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor"/><path d="M7.5 12.500l3 3 6-6.500" fill="none" stroke="var(--cut)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 focus:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9.500" y="1.500" width="5" height="3" rx="1"/><circle cx="12" cy="13.500" r="8.500"/><path d="M12 8.500v5l2.800 2" fill="none" stroke="var(--cut)" stroke-width="2.200" stroke-linecap="round"/></svg>',
 study:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="8" y="3" width="13" height="13" rx="2.500"/><path d="M5 7.500v10a2.500 2.500 0 002.500 2.500H17v-2H7.500a.5.5 0 01-.5-.5v-10z"/></svg>',
 profile:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.500" r="4.500"/><path d="M3.500 21c0-4.500 3.800-7 8.500-7s8.500 2.500 8.500 7z"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="7.500" cy="12" r="1.700" fill="var(--cut)"/><circle cx="12" cy="12" r="1.700" fill="var(--cut)"/><circle cx="16.500" cy="12" r="1.700" fill="var(--cut)"/></svg>'
};
// The last tab is "More". It opens a small menu with Shop and Profile, so the Profile page lights up "More" too.
const nav=a=>`<div class="nav">${[['home','Home'],['tasks','Tasks'],['focus','Focus'],['study','Study'],['more','More']].map(([k,l])=>`<div class="nv${k===a||(k==='more'&&a==='profile')?' on':''}" data-k="${k}"${k==='more'?' role="button" aria-haspopup="menu" aria-label="More: Shop and Profile"':''}>${NAVI[k]}${l}</div>`).join('')}</div>`;
const AVH=()=>avatarSvg(hasAv()?avDecode(D.avatar):Object.assign(avDecode(''),{chr:ZIP_CHR}),{view:'head',bg:true,style:'width:100%;height:100%;display:block'});
const tb=()=>`<div class="tb"><div class="tbp" data-pfgo role="button" aria-label="Open my profile">${AVH()}</div><div data-stkopen role="button" aria-label="Open my streak" style="display:flex;align-items:center;gap:7px;cursor:pointer">${FLM('currentColor','var(--pg)',20,24)}<span>${D.streak||0}</span></div><div data-shopgo role="button" aria-label="Open the Gem Shop" style="display:flex;align-items:center;gap:7px;cursor:pointer"><div style="width:22px;height:22px">${CUBE}</div><span>${(D.gems||0).toLocaleString()}</span></div><div class="sp"></div>${ICO.search}</div>`;
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

function enter(){if(SOFT)return;
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
pg('Search','Notes, cards and tasks','Recent searches and suggestions rise in.','Light tap on arrival.',()=>wrap(`<div class="pg" style="padding-top:40px"><div style="display:flex;align-items:center;gap:14px"><span style="color:var(--ink)">${ICO.back}</span><div class="card rw" style="flex:1;margin:0;height:46px;border-radius:23px;padding:0 14px;justify-content:flex-start;gap:10px"><span style="color:var(--ink);display:flex">${ICO.search.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><span class="mut" style="font:600 15px var(--body);flex:1">Search notes, cards, tasks</span><span style="color:var(--ink);display:flex">${ICO.mic.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span></div></div>
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

const qaHtml=()=>wrapD(homeInner()+`<div class="ov"></div><div class="qsheet"><div class="qhd"></div><div class="qtop"><div><div class="qh1">Quick add</div><div class="qh2">What would you like to add?</div></div><button class="qx" type="button" data-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg></button></div>
<div class="qgrid">${TILES.map(([k,l,p])=>`<button class="qt" type="button" data-open="${p}">${QI[k]}${l}</button>`).join('')}</div>
<div class="qban">${CHAR}<div class="qtx"><b>Stay on track!</b><span>Add anything to keep your study journey going.</span></div>${SPARK}</div>
<button class="qcancel" type="button" data-close>Cancel</button></div>`);
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

const profHtml=()=>`<div class="scr n nd" style="--pg:#181b22"><div class="pf${chOn()?' pfc':''}"><div class="pfs" data-sc><div class="hero">${myAva()}<div class="edit" data-edit><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-5L16 4l4 4L9 19z"/></svg></div></div><div class="body"><div class="hdl">@aisha_rahman · Joined 2026</div><div class="pfst"><div data-subj role="button" aria-label="My subjects" style="cursor:pointer"><b>${SB}<span class="plus2">+2</span></b><span>Subjects</span></div><div><b>12</b><span>Following</span></div><div><b>8</b><span>Followers</span></div></div><div class="acts"><button class="btnl" type="button" data-friends>${UADD}ADD FRIENDS</button><button class="btnl sq" type="button" data-qr aria-label="Share QR code">${QRI}</button></div>${DZ.showcaseHtml?DZ.showcaseHtml():''}<div class="sec">Overview</div><div class="pfov"><div><svg viewBox="0 0 32 32"><path d="M16 2c1 6 8 9 8 18a8 8 0 01-16 0c0-4 2-6 3-8 1 2 2 3 3 3 0-5-1-9 2-13z" fill="#ff4b3a"/><path d="M16 14c1 4 5 5 5 9a5 5 0 01-10 0c0-2 1-4 2-5 1 1 2 1 2 1 0-2 0-3 1-5z" fill="#ff9a1f"/><path d="M16 21c1 2 3 2 3 4a3 3 0 01-6 0c0-1 1-2 1-3z" fill="#ffd84a"/></svg>${U.streak} days</div><div><svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="8" fill="#6a58d0"/><path d="M10 16.500l4 4 8-9" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/></svg>${18+(U.done?1:0)} tasks</div><div><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#35a2f0"/><circle cx="16" cy="16" r="9.500" fill="#fff"/><path d="M16 9.500V16l4.500 3" fill="none" stroke="#1f6fc2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>42 hours</div><div><svg viewBox="0 0 32 32"><path d="M19 2L6 18h8l-3 12 15-17h-9z" fill="#ffc800" stroke="#e8a900" stroke-width="1.500" stroke-linejoin="round"/></svg>1,240 XP</div></div><div class="sec">Friend streaks</div><div class="fs"><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc1"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc1)"><rect width="52" height="52" fill="#fff0f6"/><circle cx="9" cy="14" r="9" fill="#ff8ab8"/><circle cx="22" cy="6" r="8" fill="#ffc83d"/><circle cx="38" cy="8" r="9" fill="#7ad04a"/><rect x="36" y="4" width="14" height="10" rx="2" fill="#7a4a2e"/><circle cx="8" cy="30" r="8" fill="#6bd16a"/><circle cx="26" cy="32" r="14" fill="#f7b79b"/><rect x="11" y="26" width="30" height="10" rx="5" fill="#26303a"/><circle cx="43" cy="38" r="6" fill="#ff8ab8"/><path d="M18 44q8 6 16 0" fill="none" stroke="#c0392b" stroke-width="2.500"/></g></svg><div class="cnt"><svg viewBox="0 0 24 20"><path d="M9 2c3 3 6 5 6 9a6 6 0 01-12 0c0-3 2-4 3-6 1 1 2 2 3 2z" fill="#5d6a74"/><path d="M17 5c2 2 4 4 4 7a4.500 4.500 0 01-8.500 2c2-1 3-3 3-5z" fill="#4a5560"/></svg>132</div></div><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc2"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc2)"><rect width="52" height="52" fill="#2f6fd6"/><path d="M4 18l8-6 4 8zM48 18l-8-6-4 8z" fill="#1b4fae"/><ellipse cx="26" cy="32" rx="16" ry="14" fill="#f2a24a"/><circle cx="17" cy="14" r="7" fill="#7ad04a" stroke="#26303a" stroke-width="2"/><circle cx="35" cy="14" r="7" fill="#7ad04a" stroke="#26303a" stroke-width="2"/><circle cx="17" cy="14" r="2.500" fill="#26303a"/><circle cx="35" cy="14" r="2.500" fill="#26303a"/><path d="M14 34h24l-3 8h-18z" fill="#fff"/><path d="M18 24q8 4 16 0" fill="none" stroke="#26303a" stroke-width="2.500" stroke-linecap="round"/></g></svg><div class="cnt"><svg viewBox="0 0 24 20"><path d="M9 2c3 3 6 5 6 9a6 6 0 01-12 0c0-3 2-4 3-6 1 1 2 2 3 2z" fill="#5d6a74"/><path d="M17 5c2 2 4 4 4 7a4.500 4.500 0 01-8.500 2c2-1 3-3 3-5z" fill="#4a5560"/></svg>47</div></div><div><svg class="fa" viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="#e85a5a"/><text x="26" y="36" text-anchor="middle" font-size="30" font-weight="700" fill="#2a1d1d" font-family="Space Grotesk,Inter,Arial,sans-serif">A</text></svg><svg class="ck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2a3139" stroke="#181b22" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#8b98a2" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="#8b98a2" stroke-width="2" stroke-linecap="round"/></svg></div><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc4"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc4)"><rect width="52" height="52" fill="#b43f86"/><circle cx="26" cy="28" r="20" fill="#7a3a22"/><circle cx="26" cy="30" r="14" fill="#f8d2c0"/><path d="M12 24c4-10 24-10 28 0-6-3-9-5-14-5s-9 2-14 5z" fill="#7a3a22"/><circle cx="20" cy="30" r="2" fill="#26303a"/><circle cx="32" cy="30" r="2" fill="#26303a"/><circle cx="17" cy="35" r="3" fill="#f08a8a"/><circle cx="35" cy="35" r="3" fill="#f08a8a"/><path d="M22 38q4 3 8 0" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/></g></svg><svg class="ck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2a3139" stroke="#181b22" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#8b98a2" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="#8b98a2" stroke-width="2" stroke-linecap="round"/></svg></div><div><svg class="fa" viewBox="0 0 52 52"><defs><clipPath id="fc5"><circle cx="26" cy="26" r="26"/></clipPath></defs><g clip-path="url(#fc5)"><rect width="52" height="52" fill="#efe0fb"/><path d="M8 52c0-14 8-20 18-20s18 6 18 20z" fill="#b3345a"/><circle cx="26" cy="26" r="13" fill="#f9d6c4"/><path d="M12 28c-2-16 10-20 16-18 8 2 14 8 12 20-2-6-4-10-6-12-8 4-16 6-22 10z" fill="#1d1a22"/><circle cx="21" cy="28" r="2" fill="#26303a"/><circle cx="31" cy="28" r="2" fill="#26303a"/><path d="M23 34q3 3 6 0" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/></g></svg><svg class="ck" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2a3139" stroke="#181b22" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#8b98a2" stroke-width="2"/><path d="M12 8v4l3 2" fill="none" stroke="#8b98a2" stroke-width="2" stroke-linecap="round"/></svg></div></div><div class="sec">Monthly badges<span style="display:flex"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="bd"><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#8b5ae0"/><circle cx="50" cy="50" r="40" fill="#6a3fc4"/><path d="M50 40C40 34 28 34 20 38v30c8-4 20-4 30 2z" fill="#fff"/><path d="M50 40c10-6 22-6 30-2v30c-8-4-20-4-30 2z" fill="#e6dcff"/><path d="M50 40v30" stroke="#9b7fe6" stroke-width="2.500"/><path d="M26 46h18M26 53h18M26 60h14M56 46h18M56 53h18M56 60h14" stroke="#b8a3f0" stroke-width="2.500" stroke-linecap="round"/><path d="M50 10l3.500 7.500 8 1-6 5.500 1.800 8L50 28l-7.300 4 1.800-8-6-5.500 8-1z" fill="#ffd23f" stroke="#e0a41a" stroke-width="1.500" stroke-linejoin="round" transform="translate(0 6) scale(1)"/></svg><span class="lb">August</span></div><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#28b0ae"/><circle cx="50" cy="50" r="40" fill="#1f8f8d"/><g transform="rotate(40 50 50)"><rect x="41" y="18" width="18" height="46" fill="#ffd23f"/><rect x="41" y="18" width="6" height="46" fill="#ffe680"/><rect x="41" y="26" width="18" height="6" fill="#c9d1d8"/><rect x="41" y="14" width="18" height="12" rx="4" fill="#ff8fab"/><path d="M41 64h18l-9 17z" fill="#f3d2a8"/><path d="M46.500 74h7l-3.500 7z" fill="#2d2d2d"/></g><path d="M22 70l12 0M26 78h12" stroke="#7fe0dd" stroke-width="3" stroke-linecap="round"/><path d="M70 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/></svg><span class="lb">September</span></div><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f6c431"/><circle cx="50" cy="50" r="40" fill="#fff3c4"/><path d="M50 22L14 40l36 17 36-17z" fill="#2d3340"/><path d="M30 52v13c0 7 9 11 20 11s20-4 20-11V52l-20 9z" fill="#434c5e"/><path d="M82 42v22" stroke="#e0a41a" stroke-width="3" stroke-linecap="round"/><circle cx="82" cy="68" r="4.500" fill="#ffb020"/><circle cx="50" cy="40" r="3" fill="#ffd23f"/></svg><span class="lb">October</span></div><div><svg class="b" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#353b42"/><circle cx="50" cy="50" r="40" fill="#2a2f35"/><circle cx="50" cy="50" r="43.500" fill="none" stroke="#c9b8c3" stroke-width="5" stroke-linecap="round" stroke-dasharray="197 274" transform="rotate(-90 50 50)"/><rect x="29" y="24" width="42" height="52" rx="8" fill="#454b53"/><path d="M36 38l4 4 7-8M36 52l4 4 7-8M54 40h10M54 54h10M36 66h8M54 66h10" fill="none" stroke="#6b737c" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="lb">18 of 25</span></div></div><div class="sec">Achievements<span style="display:flex"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="bd"><div><span class=nw>NEW</span><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 14v34c0 20-16 34-38 42C28 86 12 72 12 52V18z" fill="#3fa56a" stroke="#2c8050" stroke-width="3" stroke-linejoin="round"/><path d="M50 16L22 29l28 13 28-13z" fill="#fff"/><path d="M32 38v10c0 5 8 8 18 8s18-3 18-8V38l-18 8z" fill="#d8f0e0"/><path d="M76 31v14" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><circle cx="76" cy="48" r="3.500" fill="#ffd23f"/><text x="50" y="93" text-anchor="middle" font-size="32" font-weight="800" fill="#fff" stroke="#2c8050" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Space Grotesk,Inter,Arial,sans-serif">300</text></svg><span class="lb">Graduate</span></div><div><span class=nw>NEW</span><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 22v44L50 96 12 70V26z" fill="#7a4fd0" stroke="#5b3fb5" stroke-width="3" stroke-linejoin="round"/><path d="M50 14l28 16v36L50 86 22 66V30z" fill="#9468e8"/><path d="M34 26h32v16a16 16 0 01-32 0z" fill="#ffd23f" stroke="#e0a41a" stroke-width="2"/><path d="M34 30h-8c0 10 4 15 10 16M66 30h8c0 10-4 15-10 16" fill="none" stroke="#e0a41a" stroke-width="3.200" stroke-linecap="round"/><rect x="45" y="56" width="10" height="9" fill="#e0a41a"/><rect x="36" y="65" width="28" height="7" rx="3" fill="#ffd23f" stroke="#e0a41a" stroke-width="2"/><path d="M50 31l2.500 5 5.500.8-4 3.800 1 5.400-5-2.700-5 2.700 1-5.400-4-3.800 5.500-.8z" fill="#fff"/></svg><span class="lb">Class Topper</span></div><div><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 14v34c0 20-16 34-38 42C28 86 12 72 12 52V18z" fill="#a8dcf0" stroke="#6bb6d6" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="17" fill="#ffe27a" stroke="#f0b429" stroke-width="3"/><path d="M42 50h16v8a4 4 0 01-4 4h-8a4 4 0 01-4-4z" fill="#b8c2cc" stroke="#8d99a6" stroke-width="2"/><path d="M44 34q6-5 12 0M50 30v14" fill="none" stroke="#f0b429" stroke-width="2.500" stroke-linecap="round"/><path d="M50 12v-5M28 22l-4-4M72 22l4-4M22 40h-5M78 40h5" stroke="#fff" stroke-width="3.500" stroke-linecap="round"/><text x="50" y="93" text-anchor="middle" font-size="32" font-weight="800" fill="#fff" stroke="#4aa3c9" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Space Grotesk,Inter,Arial,sans-serif">100</text></svg><span class="lb">Brainiac</span></div><div><svg class="b" viewBox="0 0 100 100"><path d="M50 4l38 14v34c0 20-16 34-38 42C28 86 12 72 12 52V18z" fill="#ffb020" stroke="#e08a00" stroke-width="3" stroke-linejoin="round"/><rect x="44" y="12" width="12" height="7" rx="2" fill="#7a3a00"/><circle cx="50" cy="40" r="18" fill="#fff" stroke="#c0392b" stroke-width="3.500"/><path d="M50 40V28M50 40l9 6" fill="none" stroke="#c0392b" stroke-width="3.500" stroke-linecap="round"/><circle cx="50" cy="40" r="2.500" fill="#c0392b"/><path d="M50 24v3M66 40h-3M34 40h3" stroke="#e8a090" stroke-width="2.500" stroke-linecap="round"/><path d="M66 24l5-5" stroke="#7a3a00" stroke-width="4" stroke-linecap="round"/><text x="50" y="93" text-anchor="middle" font-size="32" font-weight="800" fill="#fff" stroke="#d97a00" stroke-width="5" paint-order="stroke" stroke-linejoin="round" font-family="Space Grotesk,Inter,Arial,sans-serif">25</text></svg><span class="lb">Deep Focus</span></div></div></div></div><div class="pfbar" data-bar><button class="pfx" type="button" data-pfx aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button><div class="hname">Aisha Rahman</div><button class="gear" type="button" data-gear aria-label="Settings">${GEAR}</button></div><div class="navh">${nav('profile')}</div></div></div>`;

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

const LANGS=[['English','English','Hi! I am Zip. Let us study!','ltr'],['Español','Spanish','¡Hola! Soy Zip. ¡A estudiar!','ltr'],['Français','French','Salut ! Je suis Zip. On révise ?','ltr'],['Deutsch','German','Hallo! Ich bin Zip. Lass uns lernen!','ltr'],['العربية','Arabic','مرحبًا! أنا زيب. هيا نذاكر!','rtl']];
const SP=[
page('Edit profile','Avatar, name, username, password, email',()=>`<div class="pav${hasAv()?' pav2':''}">${AVU()}</div><span class="pcl" data-av>CHANGE AVATAR</span><div class="sfl">First name</div><input class="sin" value="Aisha"><div class="sfl">Last name</div><input class="sin" value="Rahman"><div class="sfl">Username</div><input class="sin" value="aisha_rahman"><div class="sfl">Password</div><input class="sin" type="password" value="studyos8"><div class="sfl">Email</div><input class="sin" value="aisha.rahman@gmail.com"><button class="sbtn" type="button" data-go="Export my data">EXPORT MY DATA</button><button class="sbtn red" type="button" data-del>DELETE ACCOUNT</button>`,'The fields rise in one after another. Change avatar and the export and delete buttons are tappable. Export my data opens the export page.'),
page('Preferences','Study experience toggles',()=>`<h4 style="margin-top:14px">Study experience</h4><div class="sgrp">${[['Sound effects',1],['Haptic feedback',1],['Animations',1],['Motivational messages',1],['Streak celebrations',1],['Friend streaks',1],['Weekly report',0]].map(([t,o])=>row(t,'',o)).join('')}</div>`,'The list rises in. Every row toggles on tap, with a tick sound and a light haptic.'),
page('Language','Five languages, device language, time and week',()=>`<div class="sill" style="margin-top:2px">${'<svg viewBox="0 0 220 120"><circle cx="110" cy="62" r="46" fill="#e3dbfa" stroke="#a99be2" stroke-width="5"/><path d="M64 62h92M110 16c-24 26-24 70 0 92M110 16c24 26 24 70 0 92M72 40c26 10 50 10 76 0M72 84c26-10 50-10 76 0" fill="none" stroke="#a99be2" stroke-width="3.600" stroke-linecap="round"/><rect x="146" y="20" width="44" height="28" rx="10" fill="#6a58d0"/><path d="M158 48l-2 10 10-10" fill="#6a58d0"/><text x="168" y="40" font-size="15" font-weight="800" text-anchor="middle" fill="#fff" font-family="Inter,Arial">Hi!</text><rect x="30" y="58" width="40" height="26" rx="9" fill="#c9b8c3"/><path d="M42 84l2 9 8-9" fill="#c9b8c3"/><text x="50" y="76" font-size="14" font-weight="800" text-anchor="middle" fill="#181b22" font-family="Inter,Arial">أ</text></svg>'}</div><div class="sh1">Choose your language</div><div class="sh2">Everything in StudyOS, including Zip, will speak it.</div>
<div class="scd" style="margin-top:14px"><div class="tx"><b>Use device language</b><small>Follow your phone's language setting</small></div>${tgx(0)}</div>
<div class="sgt">Languages</div><div class="sgrp" data-langs>${LANGS.map(([n,e,,d],i)=>`<div class="sit rd${i===0?' on':''}" data-lang="${i}"><div><span>${n}${d==='rtl'?'<span class="rtl">RTL</span>':''}</span><small>${e}</small></div><span class="rad"></span></div>`).join('')}</div>
<div class="zv"><div class="zc">${AV()}</div><div class="zb" data-zb>${LANGS[0][2]}</div></div><div class="snote" data-dirn>Text reads left to right.</div>
<div class="sgt">Format</div><div class="sgrp">${row('24-hour time','Show 18:30 instead of 6:30 PM',0)}${row('Week starts on Monday','Used by the planner and reports',1)}${row('Right-to-left layout','Switches on automatically for Arabic',0)}</div>`,'The globe and header rise in. Tapping a language selects it, Zip greets you in it, and Arabic flips the preview to right-to-left.'),
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
  const list=(D.tasks||[]).filter(t=>inRange(t,TF)).sort((a,b)=>(a.done-b.done));
  const rows=list.map(t=>`<div class="swipe" data-sw="${esc(t.id)}"><div class="bk dn"><span style="width:20px;height:20px;display:block">${CHECK}</span>Done</div><div class="bk dl"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 7h12l-1 14H7zM4 5h16v2H4zM9 2h6v2H9z"/></svg>Delete</div>${trowR(t)}</div>`).join('');
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
    row.addEventListener('pointerdown',e=>{if(e.target.closest('[data-cb]'))return;x0=e.clientX;y0=e.clientY;dx=0;drag=true;locked=false;row.style.transition='none'});
    row.addEventListener('pointermove',e=>{if(!drag)return;const K=(host.clientWidth||360)/360;const mx=(e.clientX-x0)/K,my=(e.clientY-y0)/K;if(!locked){if(Math.abs(my)>10&&Math.abs(my)>Math.abs(mx)){drag=false;row.style.transform='';return}if(Math.abs(mx)>8){locked=true;try{row.setPointerCapture(e.pointerId)}catch(_){}}}if(locked){dx=Math.max(-130,Math.min(130,mx));row.style.transform='translateX('+dx+'px)'}});
    const end=()=>{if(!drag&&!locked)return;drag=false;row.style.transition='transform .22s cubic-bezier(.2,.9,.3,1)';
      if(dx>80){hap('success');row.style.transform='';if(CB.toggleTask)CB.toggleTask(id,true);return}
      if(dx<-80){hap('press');const t=(D.tasks||[]).find(z=>String(z.id)===String(id));lastDel=t?{...t}:null;sw.animate([{opacity:1},{opacity:0,height:'0px'}],{duration:220,fill:'forwards'});if(CB.deleteTask)CB.deleteTask(id);showSnack();return}
      row.style.transform=''};
    row.addEventListener('pointerup',end);row.addEventListener('pointercancel',end);
  });
  bindRows();
  R.onclick=e=>{
    if(e.target.closest('[data-cb]'))return;
    if(e.target.closest('[data-undo]')){hap('light');if(lastDel&&CB.undoDelete)CB.undoDelete(lastDel);lastDel=null;if(sn)sn.style.display='none';return}
    const sp=e.target.closest('[data-tseg] span');if(sp){TF=en0(sp).trim();hap('tick');go('Tasks');return}
    if(e.target.closest('.fab,[data-addtask]')){hap('light');go('Add task');return}
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
       .replace('1,240 XP',(D.gems||0).toLocaleString()+' gems');
    const a=h.indexOf('<div class="sec">Friend streaks</div>');
    const z=h.indexOf('</div></div><div class="pfbar"');
    if(a>0&&z>a){
      const list=fr.slice(0,5).map(f=>`<div data-fid="${esc(f.id)}" role="button" aria-label="Open ${esc(f.name)}'s profile" style="cursor:pointer"><svg class="fa" viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="${colOf(f.name)}"/><text x="26" y="36" text-anchor="middle" font-size="30" font-weight="700" fill="#2a1d1d" font-family="Space Grotesk,Inter,Arial,sans-serif">${esc((f.name||'?').charAt(0).toUpperCase())}</text></svg><div class="cnt"><span style="width:16px;height:16px;display:block" aria-hidden="true">${FLAME_IC}</span><span aria-label="${f.streak||0} day streak">${f.streak||0}</span></div></div>`).join('');
      h=h.slice(0,a)+'<div class="sec">Friend streaks</div>'+((D.incoming||[]).length?`<div class="chip" data-reqs style="margin-bottom:12px;background:#c9b8c3;color:#1b1e25">${(D.incoming||[]).length} friend ${(D.incoming||[]).length===1?'request':'requests'} · View</div>`:'')+(fr.length?`<div class="fs" style="gap:14px;justify-content:flex-start">${list}</div>`:`<div style="font:700 14px var(--body);color:#8b98a2">Add friends to see them here.</div>`)+h.slice(z);
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
    const oh=p.html;
    p.html=()=>{
      const body=`${DZ.lb('Task')}<input class="input dz-in" data-f="title" maxlength="120" placeholder="What do you need to do?" style="width:100%;border:0;outline:0;color:#1b1e25;font-weight:500">${DZ.lb('Subject')}<input class="dz-combo" data-combo role="combobox" aria-expanded="false" aria-label="Search or type a subject" autocomplete="off" maxlength="40" placeholder="Search or type a subject"><div class="chips" data-subj role="listbox">${DZ.ch(SUBJR())}</div><button type="button" class="dz-disc" data-disc aria-expanded="false"><span>More options</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="dz-fold" data-fold><div>${DZ.lb('Priority')}<div data-prio>${DZ.sg(['Low','Medium','High'],1)}</div>${DZ.lb('Due')}<div class="chips" data-due>${DZ.ch(['Today','Tomorrow','Pick date'])}</div></div></div><input type="date" data-date style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px">`;
      return wrapD(`<div class="pg"><div class="qh"><button class="qback" type="button" data-back aria-label="Back">${DZ.BACK}</button><div class="qhi">${DZ.QI.task}</div></div><div class="qpt">Add task</div><div class="qps">Write it down so you can tick it off.</div>${body}</div><button class="btn2 qcta" type="button" data-save="task">Add task</button>`);
    };
    const op=p.play;
    p.play=function(){op.call(this);const old=R.onclick;let picked='';
      P.combo($('[data-combo]',R),$('[data-subj]',R));
      R.onclick=async e=>{
        const dc=e.target.closest('[data-disc]');if(dc){const f=$('[data-fold]',R),o=!f.classList.contains('open');f.classList.toggle('open',o);dc.setAttribute('aria-expanded',o);dc.classList.toggle('open',o);hap('light');return}
        if(e.target.closest('[data-back]')){hap('light');go(D.tasks&&D.tasks.length?'Tasks':'Tasks');return}
        const due=e.target.closest('[data-due] .chip');
        if(due&&due.textContent.trim()==='Pick date'){const di=$('[data-date]',R);try{di.showPicker()}catch(_){di.click()}di.onchange=()=>{picked=di.value;due.textContent=picked;$$('[data-chip]',due.parentNode).forEach(x=>x.classList.remove('on'));due.classList.add('on')};return}
        const s=e.target.closest('[data-save]');
        if(s){const title=$('[data-f=title]',R).value.trim();if(!title){toast('Write a task first');return}
          const subj=pick('[data-subj]')||SUBJR()[0],pr=pick('[data-prio]')||'Medium',dueTxt=picked||pick('[data-due]')||'Today';
          const base=new Date();const iso=d=>d.toISOString().slice(0,10);let dueDate=iso(base);
          if(dueTxt==='Tomorrow'){base.setDate(base.getDate()+1);dueDate=iso(base)}else if(/^\d{4}-\d{2}-\d{2}$/.test(dueTxt))dueDate=dueTxt;
          s.disabled=true;hap('press');const ok=CB.addTask?await CB.addTask({title,subject:subj,priority:pr.toLowerCase(),dueDate}):false;s.disabled=false;
          if(ok){hap('success');go('Tasks')}else toast('Could not add the task. Try again.');return}
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
const focusHtml=()=>{
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
const badgeList=()=>{
  const t=D.tasksDone||0,s=Math.max(D.streak||0,D.bestStreak||0),h=D.hours||0,n=D.notesCount||0,ss=D.sessionsCount||0;
  const L=(label,key,cur,need)=>[label,cur>=need,key,cur,need];
  return [
    L('First task','first-task',t,1),L('10 tasks','10-tasks',t,10),L('50 tasks','50-tasks',t,50),L('100 tasks','100-tasks',t,100),
    L('3 day streak','3-day-streak',s,3),L('7 day streak','7-day-streak',s,7),L('14 day streak','14-day-streak',s,14),L('30 day streak','30-day-streak',s,30),L('100 day streak','100-day-streak',s,100),
    L('First session','first-session',ss,1),L('10 sessions','10-sessions',ss,10),
    L('5 hours','5-hours',h,5),L('20 hours','20-hours',h,20),L('50 hours','50-hours',h,50),
    L('First note','first-note',n,1),L('10 notes','10-notes',n,10)
  ];
};
DZ.badgeList=badgeList;
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
${plan.length?plan.map(t=>`<div class="trow" style="height:46px;margin-top:10px"><div class="cb"></div><div class="tt">${esc(t.title)}</div></div>`).join(''):`<div class="card" style="margin-top:10px;border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:16px">Nothing planned for today.</div>`}
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
const backTo=(e)=>{if(e.target.closest('.hd span:first-child')&&e.target.closest('.hd span:first-child').innerHTML.trim()){hap('light');go('Study');return true}return false};
SCREENS.push({t:'Study',d:'Study hub',spec:{m:'',h:'',s:NS},html:studyHtml,play:()=>{enter();R.onclick=e=>{
  const g=e.target.closest('[data-sgo]');if(g){hap('light');go(g.dataset.sgo);return}
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
    const rows=all.length?all.slice(0,80).map(x=>`<div class="trow" data-rk="${x.k}" style="height:auto;min-height:56px;margin-top:8px"><div style="flex:1"><div class="tt"${x.done?' style="text-decoration:line-through;opacity:.6"':''}>${esc(x.t)}</div><div class="meta"><span class="tag">${esc(x.s||'Personal')}</span><span class="mt">${x.x?esc(x.x)+' · Plan':x.k}</span></div></div></div>`).join(''):`<div class="card" style="margin-top:14px;border-radius:20px;text-align:center;color:var(--mut);font:700 14px var(--body);padding:18px">Nothing saved yet.</div>`;
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

/* Search: tasks, notes, subjects */
let SQ='',SFROM='Home';
const searchRes=()=>{
  const q=SQ.trim().toLowerCase();
  if(!q)return `<div class="mut" style="font:600 14px var(--body);margin-top:18px">Search your tasks, notes and subjects.</div>`;
  const has=s=>String(s||'').toLowerCase().includes(q);
  const t=(D.tasks||[]).filter(x=>has(x.title)||has(x.subject)).slice(0,20);
  const n=(D.notes||[]).filter(x=>has(x.title)||has(x.subject)).slice(0,20);
  const s=(D.subjects||[]).filter(has).slice(0,10);
  const sec=(h,items)=>items.length?`<div class="sec" style="margin-top:16px">${h}</div>${items.join('')}`:'';
  const row=(k,title,sub)=>`<div class="trow" data-sk="${k}" style="height:auto;min-height:54px;margin-top:8px"><div style="flex:1"><div class="tt">${esc(title)}</div>${sub?`<div class="meta"><span class="mt">${esc(sub)}</span></div>`:''}</div></div>`;
  const out=sec('Tasks',t.map(x=>row('task',x.title,x.subject)))+sec('Notes',n.map(x=>row('note',x.title,x.subject)))+sec('Subjects',s.map(x=>row('subject',x,'')));
  return out||`<div class="mut" style="font:700 14px var(--body);margin-top:18px">No results for “${esc(SQ.trim())}”.</div>`;
};
replace('Search',{
  html:()=>wrapD(`<div class="pg" style="padding-top:40px"><div style="display:flex;align-items:center;gap:14px"><span data-sback style="color:var(--ink)">${ICO.back}</span><div class="card rw" style="flex:1;margin:0;height:46px;border-radius:23px;padding:0 14px;justify-content:flex-start;gap:10px"><span style="color:var(--ink);display:flex">${ICO.search.replace('class="ic"','class="ic" style="width:20px;height:20px"')}</span><input data-sq value="${esc(SQ)}" maxlength="60" placeholder="Search tasks, notes, subjects" style="flex:1;min-width:0;border:0;outline:0;background:transparent;font:600 15px var(--body);color:var(--ink)"></div></div><div data-sres>${searchRes()}</div></div>`),
  play(){S.mute=false;enter();const inp=$('[data-sq]',R);inp.oninput=()=>{SQ=inp.value;$('[data-sres]',R).innerHTML=searchRes()};
    R.onclick=e=>{
      if(e.target.closest('[data-sback]')){hap('light');go(SFROM);return}
      const r=e.target.closest('[data-sk]');if(r){hap('light');if(r.dataset.sk==='task')go('Tasks');else if(CB.open)CB.open('subjects')}}}
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
const subIcon=n=>`<svg viewBox="0 0 64 64" aria-hidden="true">${SJI[sjKind(n)]}</svg>`;
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
 gem:'<svg viewBox="40 0 385 466"><path d="M175 5L275 35L395 130L415 335L385 425L215 462L50 250Z" fill="#ff4a6d"/><path d="M275 35L205 205L210 232L285 350L412 335L275 35Z" fill="#ff617f"/><path d="M275 35L395 130L415 335L412 335Z" fill="#f993ac"/><path d="M50 250L210 232L285 350L215 462Z" fill="#ff335f"/><path d="M285 350L412 335L385 425L215 462Z" fill="#ff4a6d"/></svg>',
 freeze:'<svg viewBox="0 0 64 64"><path d="M32 3 55 11v19c0 15-9.500 25-23 31C18.500 55 9 45 9 30V11z" fill="#f59a3f"/><path d="M32 3 55 11v19c0 15-9.500 25-23 31z" fill="#e8812a"/><path d="M32 19l4.300 8.700 9.600 1.400-7 6.800 1.700 9.600L32 40.800l-8.600 4.500 1.700-9.600-7-6.800 9.600-1.400z" fill="#fff0d2"/></svg>',
 bolt:'<svg viewBox="0 0 64 64"><path d="M38 3 12 35h15l-4 26 29-35H36z" fill="#a95cf2"/><path d="M38 3 36 26h16L23 61l4-26z" fill="#c28dff"/></svg>',
 gift:'<svg viewBox="0 0 64 64"><path d="M32 25C24 25 16 21 19 14c3-6 11-1 13 11z" fill="#5fd49b"/><path d="M32 25c8 0 16-4 13-11-3-6-11-1-13 11z" fill="#5fd49b"/><rect x="9" y="25" width="46" height="12" rx="4" fill="#5fd49b"/><rect x="12" y="35" width="40" height="25" rx="4" fill="#38b878"/><rect x="28" y="25" width="8" height="35" fill="#2a9d65"/></svg>',
 clock:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#43c590"/><rect x="29" y="14" width="6" height="20" rx="3" fill="#fff"/><rect x="29" y="29" width="18" height="6" rx="3" fill="#fff"/></svg>',
 sand:'<svg viewBox="0 0 64 64"><path d="M16 5h32v7c0 10-8 14-10 20 2 6 10 10 10 20v7H16v-7c0-10 8-14 10-20-2-6-10-10-10-20z" fill="#f0d9a8"/><path d="M23 54c2-7 7-10 9-10s7 3 9 10v4H23z" fill="#e1a63b"/></svg>',
 heart:'<svg viewBox="0 0 64 64"><path d="M32 58C9 41 5 29 5 21 5 12 12 7 19 7c6 0 10 3 13 8 3-5 7-8 13-8 7 0 14 5 14 14 0 8-4 20-27 37z" fill="#ff5a7a"/></svg>'
};
const PR=()=>Object.assign({freeze:100,repair:150,double:120,sound:180,focusplus:220,report:200,exam:300,widgets:160,frames:140,badges:120,theme_ocean:250,theme_forest:250,theme_sunset:250,theme_mono:250,gift:25},(D.shop&&D.shop.prices)||{});
let SLT=0,SHEET=null,SMSG=null,SHY=0,GHY=0,SBUSY=false,STXT='',STUNTIL=0,SARM='',SARMT=0,SBT=0,SBST=0;
let DBG=[];
const tn=el=>{try{return (el.tagName||'?')+'.'+String((el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className)||'').split(' ')[0]}catch(_){return '?'}};
const dbg=m=>{DBG.push(new Date().toTimeString().slice(3,8)+' '+m);if(DBG.length>6)DBG.shift();try{const el=R&&R.querySelector('.sh-dbg');if(el)el.textContent=DBG.join('\n')}catch(_){}};
const isArm=k=>SARM===k&&Date.now()<SARMT;
const ntxt=n=>(n||0).toLocaleString();
const gmI='<span class="sh-gi">'+SHI.gem+'</span>';
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
 freeze:LI('<path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5"/><path d="M9.6 4.2 12 6.2l2.4-2M9.6 19.8 12 17.8l2.4 2"/>'),
 repair:LI('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'),
 double:LI('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
 sound:LI('<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'),
 focusplus:LI('<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/>'),
 report:LI('<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>'),
 exam:LI('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>'),
 widgets:LI('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'),
 frames:LI('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66"/>'),
 badges:LI('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),
 gift:LI('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>'),
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
const PV_FLAME='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FF9600" d="M24,3C25.4,9.6 31.6,13 35.2,19.4C37.6,23.6 38.4,28.6 36.4,33.2C34,38.8 29,43 24,43C16,43 9.6,36.6 9.6,28.6C9.6,24.4 11.4,21 14,18.2C14.6,21 16.2,22.8 18.4,23.6C17.4,15.4 19.6,8.6 24,3Z"/><path fill="#FFC800" d="M24,23.4C20.6,26.8 18.8,29.4 18.8,32C18.8,35.2 21,37.4 24,37.4C27,37.4 29.2,35.2 29.2,32C29.2,29.4 27.4,26.8 24,23.4Z"/><path fill="#FFE680" d="M23.6,30.2C22.4,31.6 21.8,32.6 21.8,33.6C21.8,35 22.7,35.8 23.8,35.8C24.9,35.8 25.6,35 25.6,34C25.6,32.8 24.8,31.6 23.6,30.2Z"/></svg>';
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
    return `<div class="sh2-sheet" data-sheetbg role="dialog" aria-label="Theme unlocked"><div class="sh2-sp done${fx==='done'?' pop':''}"><div class="sh2-big sh2-bigth" style="--c:${def.c}">${ic}</div><b class="sh2-bt">${esc(def.t)}</b><span class="sh2-bx">Unlocked</span><button type="button" class="sh2-go" data-sheetapply>APPLY THEME</button><button type="button" class="sh2-no" data-sheetclose>NOT NOW</button></div></div>`;
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
  const body=SHOP_SECTIONS.map(sec=>`<section class="sh2-sec"><div class="sh2-h"><b>${sec.h}</b><span>${sec.s}</span></div>${sec.items.map(row).join('')}</section>`).join('');
  return wrapD(`<div class="sh2" data-sc>
<div class="sh2-top"><button type="button" class="sh2-back" data-shback aria-label="Back">${SI.back}</button><div class="sh2-bal" aria-label="You have ${ntxt(D.gems)} gems">${gmI}<span>${ntxt(D.gems)}</span></div></div>
<h1 class="sh2-title">Gem Shop</h1><p class="sh2-sub">Turn the gems you earn into real study power. <span style="opacity:.45">· build 12f</span></p>
<div class="sh-hero"><span class="sh-hg">${SHI.gem}</span><div><small>Your gems</small><b>${ntxt(D.gems)}</b><span>Earn 1 gem for every 5 minutes you focus.</span></div></div>
${banner}
${body}
<section class="sh2-sec"><div class="sh2-h"><b>Themes</b><span>${SHOP_THEMES.length} available</span></div><div class="sh2-thg">${SHOP_THEMES.map(theme).join('')}</div></section>
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
  if(!SOFT&&CB.shopRefresh)CB.shopRefresh();
  // Messages show as a toast, so they stay visible wherever the page is scrolled to.
  // The page redraws when new shop data arrives, so a fresh toast is put back for a moment.
  const say=text=>{STXT=text;STUNTIL=Date.now()+1800;go('Gem Shop',true)};
  if(STXT&&Date.now()<STUNTIL)toast(STXT);
  const handle=async e=>{
   try{
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


/* Profile: real achievements */
{
  const k=IDX('Profile'),ph=SCREENS[k].html;
  SCREENS[k].html=()=>{
    let h=ph();
    const list=DZ.badgeList?DZ.badgeList():[];
    const on=list.filter(b=>b[1]);
    const z=h.indexOf('</div></div><div class="pfbar"');
    if(z>0){
      const grid=on.length?`<div style="display:grid;grid-template-columns:repeat(3,1fr);row-gap:10px">${on.slice(0,6).map(b=>DZ.bdg2(b,false)).join('')}</div>`:`<div style="font:700 14px var(--body);color:#8b98a2">Finish tasks and keep your streak to earn badges.</div>`;
      h=h.slice(0,z)+'<div class="sec" style="margin-top:18px">Achievements</div>'+grid+h.slice(z);
    }
    return h;
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
  set('Language',{d:'App language',
    html:()=>{const cur=getLanguage();return scr('Language',`<div class="sill">${grab('Language',ILLRE).replace(/^<div class="sill"[^>]*>|<\/div>$/g,'').replace(/<rect x="30" y="58"[^>]*\/><path d="M42 84[^>]*\/><text[^>]*>[^<]*<\/text>/,'')}</div><div class="sh1">App language</div><div class="sh2">Choose the language for menus, buttons and messages.</div>
<div class="sgrp" style="margin-top:14px">${LANGS.map(l=>`<div class="sit rd${l.code===cur?' on':''}" data-lang="${l.code}"><div><span data-notr>${l.native}</span></div><span class="rad"></span></div>`).join('')}</div>`)},
    play(){S.mute=false;rise();
      R.onclick=e=>{
        if(e.target.closest('[data-back]')){hap('light');go(IDX('Settings'));return}
        const r=e.target.closest('[data-lang]');if(!r)return;
        const code=r.dataset.lang;if(code===getLanguage())return;
        $$('[data-lang]',R).forEach(x=>x.classList.toggle('on',x===r));hap('medium');
        setLanguage(code);if(CB.savePref)CB.savePref('lang',code);toast('Language changed')}}});

  /* Themes */
  set('Themes',{d:'Light or dark',
    html:()=>{
      const cur=D.palette?D.palette:(D.dark?'dark':'light');
      const owned=(D.shop&&D.shop.owned)||[];
      const price=k=>(D.shop&&D.shop.prices&&D.shop.prices[k])||250;
      const PAID=[['theme_ocean','Ocean','#d6e8f1','#2b6082'],['theme_forest','Forest','#dde8df','#2f6b4a'],['theme_sunset','Sunset','#f1ddd5','#b4532f'],['theme_mono','Mono','#e6e6e6','#1e1e1e']];
      const sw=(bg,ac)=>`<span class="thsw" style="background:${bg}"><i style="background:${ac}"></i></span>`;
      const LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
      const free=[['light','Light','Bright and clean','#e1e0e2','#1b1e25'],['dark','Dark','Easy on the eyes at night','#11161b','#c9b8c3']].map(([k,n,t,bg,ac])=>`<div class="sit rd${k===cur?' on':''}" data-theme="${k}" role="button">${sw(bg,ac)}<div><span class="thn">${n}</span><small>${t}</small></div><span class="rad"></span></div>`).join('');
      const paid=PAID.map(([k,n,bg,ac])=>owned.includes(k)
        ?`<div class="sit rd${k===cur?' on':''}" data-theme="${k}" role="button">${sw(bg,ac)}<div><span class="thn">${n}</span><small>Bought · tap to use</small></div><span class="rad"></span></div>`
        :`<div class="sit rd lck" data-lock="${k}" role="button" aria-label="${n} theme is locked. Open the Gem Shop to buy it.">${sw(bg,ac)}<div><span class="thn">${n}</span><small>Locked · ${price(k)} gems</small></div><span class="lk">${LOCK}</span></div>`).join('');
      return scr('Themes',`<div class="sh1" style="margin-top:6px">Choose your look</div><div class="sh2">Your choice is saved to your account.</div>
<div class="sgrp" style="margin-top:14px">${free}</div>
<div class="sh2" style="margin-top:18px;text-align:left;font-weight:700;letter-spacing:.08em;font-size:12.5px">COLOUR THEMES</div>
<div class="sgrp" style="margin-top:8px">${paid}</div>
<div class="sh2" style="margin-top:12px">Buy a colour theme in the Gem Shop and it appears here, ready to use.</div>`)},
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
    SCREENS[k].html=()=>(SCREENS[IDX('Profile')].html().replace(/<\/div><\/div>$/,'')+overlay()).replace(/(<div class="qimg">)[\s\S]*?<\/svg>/,'$1'+realQr()).replace('Friends scan this to add you on StudyOS.','Friends scan this to get StudyOS.').replace(/<button type="button" data-sh><svg(?:(?!<\/button>)[\s\S])*?Save<\/button>/,'');
    SCREENS[k].play=()=>{qp();const old=R.onclick;R.onclick=e=>{
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
  shop:'<svg viewBox="0 0 24 24"><path d="M12 2L19.500 5.500L22 12L19.500 18.500L12 22L4.500 18.500L2 12L4.500 5.500Z" fill="#e0446c"/><path d="M12 2L19.500 5.500L22 12L12 12Z" fill="#f2708f"/><path d="M12 12L22 12L19.500 18.500L12 22Z" fill="#b92f55"/><path d="M12 12L12 22L4.500 18.500L2 12Z" fill="#9e2447"/><path d="M12 7L16.500 12L12 17L7.500 12Z" fill="#ffd9e3" opacity=".9"/></svg>',
  profile:'<svg viewBox="0 0 24 24"><circle cx="12" cy="7.500" r="4.500" fill="#a98fa0"/><path d="M3.500 21c0-4.500 3.800-7 8.500-7s8.500 2.500 8.500 7z" fill="#a98fa0"/></svg>'
};
function openMore(still){
  const nv=R&&R.querySelector?R.querySelector('.nv[data-k="more"]'):null;
  if(!nv)return false;
  R.querySelectorAll('.more-menu.out,.more-sc.out').forEach(x=>x.remove());
  if(R.querySelector('.more-menu'))return false;
  R.insertAdjacentHTML('beforeend',`<div class="more-sc${still?' still':''}" data-moresc></div><div class="more-menu${still?' still':''}" role="menu" aria-label="More"><button type="button" class="more-row" role="menuitem" data-more="shop"><span class="mi">${MORE_ICONS.shop}</span>Shop</button><button type="button" class="more-row" role="menuitem" data-more="profile"><span class="mi">${MORE_ICONS.profile}</span>Profile</button></div>`);
  if(!MOREON){const cur=R.querySelector('.nv.on');MOREADDED=!nv.classList.contains('on');MOREPREV=cur&&cur!==nv?cur:null}
  MOREON=true;
  if(MOREPREV)MOREPREV.classList.remove('on');
  nv.classList.add('on');
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
  if(MOREON)closeMore();
  if(opts.onTab)opts.onTab(k);
  const m={home:'Home',tasks:'Tasks',focus:'Focus',study:'Study'}[k];
  if(m&&SCREENS[CUR].t!==m)go(m);
},true);
/* ---- Friend profile: a friend's real study numbers, opened from Profile or Friends ---- */
{
  let FP={id:'',from:'Profile',loading:false,data:null,err:'',rm:false,gift:false,busy:false,msg:''};
  const fpCol=s=>{const A=['#e85a5a','#c7b9c4','#9fb6c3','#c9c4a6','#b4c7b0','#d0b09f'];let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return A[h%A.length]};
  const X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const FLAME='<svg viewBox="0 0 24 24"><path d="M12 2c1 3.5 5 5.6 5 10.2A5 5 0 0 1 12 17.5a5 5 0 0 1-5-5.3c0-2 1-3.4 2.2-4.7.2 1.6 1 2.4 1.8 2.6C10.700 7.300 11 4.600 12 2z" fill="#ff7a45"/><path d="M12 22a4 4 0 0 1-4-4c0-1.800 1.600-3 4-5 2.400 2 4 3.200 4 5a4 4 0 0 1-4 4z" fill="#ffb347"/></svg>';
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

  const avatar=(name,pic)=>pic?`<img class="fp-img" src="${esc(pic)}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${esc((name||'?').charAt(0).toUpperCase())}'}))">`:`<span>${esc((name||'?').charAt(0).toUpperCase())}</span>`;

  const html=()=>{
    const list=(D.friends||[]).find(f=>f.id===FP.id)||{};
    const d=FP.data||{};
    const name=d.name||list.name||'Friend',pic=d.picture||list.picture||'';
    const col=fpCol(name),ready=!!FP.data;
    const price=(D.shop&&D.shop.prices&&D.shop.prices.gift)||25;
    const sk=t=>ready?t:'<i class="fp-sk"></i>';
    const body=FP.err&&!ready
      ?`<div class="fp-err"><p>${esc(FP.err)}</p><button type="button" class="fp-btn" data-fpretry>TRY AGAIN</button></div>`
      :`<div class="fp-stats">
  <div><span class="fp-ico">${FLAME}</span><b>${sk(num(d.streak))}</b><small>Day streak</small></div>
  <div><span class="fp-ico">${CUBE}</span><b>${sk(num(d.gems!=null?d.gems:list.gems))}</b><small>Gems</small></div>
  <div><span class="fp-ico">${PPL}</span><b>${sk(num(d.friendsCount))}</b><small>Friends</small></div></div>
<div class="fp-acts"><button type="button" class="fp-btn fp-isfr" data-fpnone aria-label="You are friends"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>FRIENDS</button><button type="button" class="fp-btn fp-gift${FP.gift?' armed':''}${FP.busy?' busy':''}" data-fpgift aria-label="Send ${price} gems to ${esc(name)}">${FP.busy?'SENDING…':(FP.gift?'CONFIRM '+price+' GEMS':'GIFT '+price+' GEMS')}</button></div>
${FP.msg?`<div class="fp-msg${FP.msgOk?' ok':''}" role="status">${esc(FP.msg)}</div>`:''}
<div class="fp-sec">WEEKLY PROGRESS</div>
${ready?chart(d.week||[],d.meWeek||[]):'<div class="fp-chart fp-sk" style="height:150px"></div>'}
<div class="fp-leg"><span class="fp-dot" style="background:#4fc3f7"></span><b>${esc(first(name))}</b><em>${ready?mins(sum(d.week)):'…'}</em></div>
<div class="fp-leg"><span class="fp-dot" style="background:#8b98a2"></span><b>You</b><em>${ready?mins(sum(d.meWeek)):'…'}</em></div>
<div class="fp-sec">OVERVIEW</div>
<div class="fp-grid">
  <div><span class="fp-ico">${FLAME}</span><b>${sk(num(d.streak)+(d.streak===1?' day':' days'))}</b></div>
  <div><span class="fp-ico">${CLK}</span><b>${sk(num(d.hours)+' hours')}</b></div>
  <div><span class="fp-ico">${TSK}</span><b>${sk(num(d.tasksDone)+(d.tasksDone===1?' task':' tasks'))}</b></div>
  <div><span class="fp-ico">${FCS}</span><b>${sk(num(d.sessions)+(d.sessions===1?' session':' sessions'))}</b></div></div>
<button type="button" class="fp-rm${FP.rm?' armed':''}" data-fprm>${FP.rm?'TAP AGAIN TO REMOVE '+esc(first(name)).toUpperCase():'REMOVE FRIEND'}</button>`;
    return `<div class="scr n nd" style="--pg:#181b22"><div class="fp" data-fpscroll>
<div class="fp-hero" style="--c:${col}"><button type="button" class="fp-x" data-fpback aria-label="Close">${X}</button><div class="fp-av">${avatar(name,pic)}</div></div>
<div class="fp-body"><h1 class="fp-name">${esc(name)}</h1><div class="fp-sub">FRIEND${d.joinedYear?' · JOINED '+esc(d.joinedYear):''}</div>${body}</div></div></div>`;
  };

  const load=async()=>{
    const id=FP.id;FP.loading=true;FP.err='';
    let r=null;try{r=CB.friendProfile?await CB.friendProfile(id):null}catch(_){r=null}
    if(FP.id!==id)return;
    FP.loading=false;
    if(r&&r.ok)FP.data=r.data;else FP.err=(r&&r.message)||'Could not load this profile. Try again.';
    if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')go('Friend profile',true);
  };

  const play=()=>{
    enter();
    R.onclick=async e=>{
      const t=e.target;
      if(t.closest('[data-fpback]')){back();return}
      if(t.closest('[data-fpretry]')){hap('light');FP.err='';FP.data=null;go('Friend profile',true);load();return}
      if(t.closest('[data-fpgift]')){
        if(FP.busy)return;
        if(!FP.gift){hap('light');FP.gift=true;FP.msg='';go('Friend profile',true);return}
        FP.gift=false;FP.busy=true;FP.msg='';go('Friend profile',true);
        let r=null;try{r=CB.shopGift?await CB.shopGift(FP.id):null}catch(_){r=null}
        FP.busy=false;FP.msg=(r&&r.message)||'Could not send the gift. Try again.';FP.msgOk=!!(r&&r.ok);
        hap(FP.msgOk?'success':'light');
        if(SCREENS[CUR]&&SCREENS[CUR].t==='Friend profile')go('Friend profile',true);return}
      if(t.closest('[data-fprm]')){
        if(!FP.rm){hap('light');FP.rm=true;go('Friend profile',true);return}
        FP.rm=false;hap('press');
        optRemoveFriend(FP.id,()=>{if(SCREENS[CUR]&&/^(Profile|Friends|Streak friends)$/.test(SCREENS[CUR].t))go(SCREENS[CUR].t,true)});
        go(DZ.fpFrom&&DZ.fpFrom!=='Friend profile'?DZ.fpFrom:'Profile');toast('Friend removed.')
        return}
      if(FP.rm||FP.gift){FP.rm=false;FP.gift=false;go('Friend profile',true)}
    };
  };
  SCREENS.push({t:'Friend profile',d:'A friend\'s real study numbers',spec:{m:'Friend streak, gems, weekly minutes compared with yours, overview, gift and remove.',h:'Light tap on each press, success when a gift is sent.',s:'No sound on this page.'},html,play});
  DZ.fpFrom='Profile';
  DZ.openFriend=(id,from)=>{
    if(!id)return;
    FP={id:String(id),from:from||'Profile',loading:false,data:null,err:'',rm:false,gift:false,busy:false,msg:''};
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
    try{if(R&&R.animate)R.animate([{transform:`translateX(${dx<0?28:-28}px)`},{transform:'none'}],{duration:180,easing:'cubic-bezier(.2,.8,.3,1)'})}catch(_){}
    // the tap that ends a swipe must not press a button
    const stop=ev=>{ev.stopPropagation();ev.preventDefault()};
    host.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>host.removeEventListener('click',stop,true),350);
  },true);
})();
function navOnly(active){
  RUN++;timers.forEach(clearTimeout);timers.length=0;
  stage.innerHTML='<div class="scr n'+(D.dark?' nd':'')+' dz-navonly">'+nav(active)+'</div>';R=stage.firstElementChild;CUR=-1;
}


const HINTS={'Home':'Tap your picture to open your profile.','Tasks':'Swipe a task right to finish it, left to delete it.','Streak':'Swipe left to see your friends.'};
function go(i,soft){
  if(typeof i==='string')i=IDX(i);
  if(i<0)return;
  P.run(()=>go0(i,soft),()=>R);
}
function go0(i,soft){
  RUN++;timers.forEach(clearTimeout);timers.length=0;
  const keepMore=!!soft&&MOREON;MOREON=false;MOREPREV=null;MOREADDED=false;
  CUR=i;const H0=ltFix(SCREENS[i].html());stage.innerHTML=H0;LASTH=H0;LASTI=i;R=stage.firstElementChild;
  S.mute=false;SOFT=!!soft;
  SCREENS[i].play();SOFT=false;
  if(!soft){P.stagger(R);const h=HINTS[SCREENS[i].t];if(h){const run=RUN;setTimeout(()=>{if(run===RUN&&R&&R.isConnected)P.hint(SCREENS[i].t,h,toast)},1100)}}
  if(keepMore)openMore(true);
  restoreToggles();
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
<div class="stkhero"><div class="stkrays"></div><div class="flh stkfh"></div></div>
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
const SV_FL=(c,w)=>`<svg viewBox="0 0 24 28" width="${w}" height="${w*28/24}" aria-hidden="true"><path d="M12 1.500c1 5 8 8 8 15 0 5.500-3.800 9.500-8 9.500s-8-4-8-9.500c0-3.200 1.800-5.200 3.200-7 .3 2 1.200 3 2.200 3.200C8.600 8 9.800 4.400 12 1.500z" fill="${c}"/></svg>`;
const GOALS=[3,7,14,30,50,100,150,200,250,365,500,730,1000];
const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const svKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
let SVM=0;
DZ.slide=dir=>{try{if(R&&R.animate){const s=R.querySelector('.svs');R.animate([{opacity:.0,transform:`translateX(${dir*56}px)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.85,.25,1)'})}}catch(_){}};
const svTier=n=>n>=100?'Legend':n>=30?'Blazing':n>=7?'On fire':n>0?'Warming up':'Not started';
const svHead=(tab)=>`<div class="svh"><button class="svx" type="button" data-svx aria-label="Close">${SV_X}</button><b>Streak</b><button class="svx" type="button" data-svsh aria-label="Share my streak">${SV_SH}</button></div>
<div class="svtabs" role="tablist"><button type="button" role="tab" aria-selected="${tab==='p'}" class="${tab==='p'?'on':''}" data-svtab="p">Personal</button><button type="button" role="tab" aria-selected="${tab==='f'}" class="${tab==='f'?'on':''}" data-svtab="f">Friends</button></div>`;
const svCal=()=>{
  const keys=new Set(D.streakDays||[]),ice=new Set((D.shop&&D.shop.protectedDays)||[]);
  const now=new Date(),base=new Date(now.getFullYear(),now.getMonth()+SVM,1),y=base.getFullYear(),m=base.getMonth();
  const lead=(base.getDay()+6)%7,dim=new Date(y,m+1,0).getDate(),today=svKey(now);
  const cells=[];for(let i=0;i<lead;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7)cells.push(null);
  let rows='';
  for(let r=0;r<cells.length/7;r++){
    const row=cells.slice(r*7,r*7+7);let caps='',run=null;const flush=()=>{if(run){caps+=`<i class="svcap${run.ice?' ice':''}" style="left:calc(${run.s}*100%/7 + 2px);width:calc(${run.e-run.s+1}*100%/7 - 4px)"></i>`;run=null}};
    const nums=row.map((d,c)=>{
      if(!d){flush();return '<span></span>'}
      const k=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),st=keys.has(k),ic=ice.has(k)&&!st,on=st||ic;
      if(on){if(run&&run.ice!==ic)flush();if(run)run.e=c;else run={s:c,e:c,ice:ic}}else flush();
      const cls=(on?'on':'')+(k===today?' td':'')+(!on&&k>today?' fu':'');
      return `<span class="${cls.trim()}">${d}</span>`;
    }).join('');flush();
    rows+=`<div class="svrow">${caps}${nums}</div>`;
  }
  return `<div class="svcm"><button type="button" data-svmo="-1" aria-label="Previous month">${SV_CH(0)}</button><b>${MN[m]} ${y}</b><button type="button" data-svmo="1" aria-label="Next month"${SVM>=0?' disabled':''}>${SV_CH(1)}</button></div>
<div class="svwd">${['Mo','Tu','We','Th','Fr','Sa','Su'].map(x=>`<span>${x}</span>`).join('')}</div>${rows}`;
};
const svPersonal=()=>{
  const n=Math.max(0,D.streak||0),nx=GOALS.find(g=>g>n)||(Math.ceil((n+1)/100)*100),pct=Math.min(100,n/nx*100);
  const fz=(D.shop&&D.shop.freezes)||0,lock=nx;
  return wrapD(`<div class="svp">${svHead('p')}<div class="svs">
<div class="svhero"><div class="svhl"><span class="svchip">${svTier(n)}</span><div class="svbig${n?'':' z'}">${n}</div><div class="svdl">day streak${n?'!':''}</div></div><div class="svfl" data-svfl></div></div>
<h3 class="svt">Streak Calendar</h3><div class="svcard svcal">${svCal()}</div>
<h3 class="svt">Streak Goal</h3><div class="svcard svgoal"><div class="svgb"><span class="svgi">${SV_FL('#fff',17)}</span><div class="svtr"><i style="width:${pct.toFixed(1)}%"></i></div><span class="svgn"><b>${nx}</b><small>days</small></span></div><div class="svgt">${n} / ${nx} days</div></div>
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
  const ava=r=>r.me?`<span class="svav">${AVU?AVU():''}</span>`:(r.p?`<span class="svav"><img src="${esc(r.p)}" alt="" loading="lazy"></span>`:`<span class="svav" style="background:${colOf(r.n)}">${esc((r.n||'?').charAt(0).toUpperCase())}</span>`);
  return wrapD(`<div class="svp svf">${svHead('f')}<div class="svs">
<div class="svban"><div class="svsp"><i></i><i></i><i></i><i></i></div><div class="svsc"><span class="svch a">${AVSC(1)}</span><span class="svfl2" data-svfl2></span><span class="svch b">${AVSC(10)}</span></div></div>
<div class="svfh"><h3 class="svt" style="margin:0">Friend Streaks</h3><button type="button" class="svlink" data-svedit aria-pressed="false">EDIT</button></div>
<div class="svcard svlist" data-svlist>${rows.map(r=>`<div class="svfr${r.me?' me':''}"${r.me?'':` data-fid="${esc(r.id)}" role="button" aria-label="Open ${esc(r.n)}'s profile"`}>${r.me?'':`<button type="button" class="svmi" data-svrm="${esc(r.id)}" aria-label="Remove ${esc(r.n)}"><i></i></button>`}${ava(r)}<div class="svfn"><b>${esc(r.n)}</b><span class="svfs${r.s?'':' off'}">${SV_FL(r.s?'#ff8a2a':'currentColor',16)}<em>${r.s}</em></span></div></div>`).join('')}</div>
${fr.length?'':`<p class="svem">No friends yet. Add a friend and you can keep each other's streaks going.</p>`}<button type="button" class="svgo" data-svadd>Add a friend</button>
<div class="svpad"></div></div></div>`);
};
const AVSC=i=>avatarSvg(Object.assign(avDecode(''),{chr:i}),{view:'full',style:'width:100%;height:100%;display:block'});
const svSheet=(row,id)=>{
  if($('.svsheet',R))return;
  const f=(D.friends||[]).find(x=>String(x.id)===String(id));if(!f)return;
  const nm=f.name||'your friend',st=f.streak||0,av=row.querySelector('.svav').outerHTML.replace('class="svav"','class="svav big"');
  const sh=document.createElement('div');sh.className='svsheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-label','Remove friend');
  sh.innerHTML=`<div class="svbk"></div><div class="svsh"><i class="svgrab"></i>${av}<b class="svsn">${esc(nm)}</b><span class="svfs${st?'':' off'}">${SV_FL(st?'#ff8a2a':'currentColor',18)}<em>${st}</em></span>
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
  const hostEl=$(tab==='p'?'[data-svfl]':'[data-svfl2]',R);
  if(hostEl){DZ.flame=createFlame(hostEl,{state:n===0?'inactive':'idle'});hostEl.onclick=()=>{hap('streakIgnite');DZ.flame&&DZ.flame.increase();playStreakClip(.8)}}
  const swapCal=()=>{const c=$('.svcal',R);if(c){c.innerHTML=svCal();c.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'})}};
  R.onclick=e=>{
    if(e.target.closest('[data-svx]')){back();return}
    if(e.target.closest('[data-svsh]')){hap('light');if(CB.share)CB.share(n+' day study streak on StudyOS! Join me.');return}
    const tb=e.target.closest('[data-svtab]');if(tb){const to=tb.dataset.svtab==='p'?'Streak':'Streak friends';if(SCREENS[CUR].t!==to){hap('light');go(to);DZ.slide(to==='Streak'?-1:1)}return}
    const mo=e.target.closest('[data-svmo]');if(mo&&!mo.disabled){hap('light');SVM=Math.min(0,SVM+(+mo.dataset.svmo));swapCal();return}
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
const RUN_DEAD=()=>!host.isConnected;
function back(){
  const t=SCREENS[CUR]&&SCREENS[CUR].t;if(!t)return false;
  if(closeMore())return true;
  if(t==='Home')return false;
  if(host.classList.contains('dz-kb')&&document.activeElement&&document.activeElement.blur){document.activeElement.blur();return true}
  const Q=['Add note','Planner','Add subject','Quiz','Progress','Achievement','Reminder','Upload file'];
  let to='Settings';
  if(['Tasks','Focus','Study','Profile','Quick add'].includes(t))to='Home';
  else if(t==='Add task')to='Tasks';
  else if(Q.includes(t))to='Quick add';
  else if(t==='Delete account')to='Privacy settings';
  else if(t==='Edit avatar')to='Edit profile';
  else if(['Weekly report','Badges','Exam mode'].includes(t))to='Study';
  else if(['Friends','Edit profile','Settings'].includes(t))to='Profile';
  else if(t==='Friend profile')to=(DZ.fpFrom&&DZ.fpFrom!=='Friend profile')?DZ.fpFrom:'Profile';
  else if(t==='Search')to=DZ.searchFrom||'Home';
  else if(t==='Gem Shop'){if(DZ.closeSheet&&DZ.closeSheet())return true;to=DZ.shopFrom||'Home'}
  else if(t==='Gift gems')to='Gem Shop';
  else if(t==='Streak'||t==='Streak friends')to=DZ.streakFrom||'Home';
  else if(t==='Streak celebration')to=DZ.celFrom||'Home';
  hap('light');go(to);return true;
}
const api={openShop(){DZ.openShop('Study')},startFocus(){go('Focus');if(!F.running&&F.mode==='focus'&&F.left>0){start();go('Focus',true)}},navOnly,refresh,go,back,screen:()=>SCREENS[CUR]&&SCREENS[CUR].t,names:()=>SCREENS.map(s=>s.t),
  update(d){const was=D.streakPop||0;Object.assign(D,d);refresh();if((D.streakPop||0)>was&&DZ.celebrate)setTimeout(()=>{if(!RUN_DEAD())DZ.celebrate()},650)},
  destroy(){if(DZ.stopSound)DZ.stopSound();RUN++;timers.forEach(clearTimeout);ro.disconnect();host.innerHTML='';host.classList.remove('dz')}};
go(opts.start||'Home');
return api;
}
