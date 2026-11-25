/* eslint-disable */
// StudyOS new-user flow (app only). Intro with the flame guide, placement exam, streak, gems, profile.
// Ported from the approved design file StudyOS_Final_Design_v14.html.
import { haptic } from "../haptics";
import { translate as tr } from "../i18n";
import zunoUrl from "./assets/alien/p0.webp";
import introUrl from "./assets/intro.mp3";
import clip0Url from "./assets/clip0.mp3";
import lessonUrl from "./assets/lesson.mp3";
import "./flow.css";
import { znHtml, znInit, znStopAll, znSet, znTalk, znFace } from "./zuno";

export function mountNewUserFlow(host, opts = {}) {
host.classList.add('nuf');host.setAttribute('data-own-haptics','');
const stage=document.createElement('div');stage.className='nuf-stage';host.appendChild(stage);
let R=null,RUN=0,CUR=0;const MASC=[zunoUrl];
const SCREENS=[];
const IDX=t=>SCREENS.findIndex(s=>s.t===t);
const HMAP={tick:'tap',light:'tap',medium:'press',heavy:'confirm',success:'success',hard:'welcome',thud:'press',buzz:'error',tap:'tap'};
function hap(k){if(!S.haptics)return;const n=HMAP[k];if(n&&haptic[n])haptic[n]()}
const S={sound:true,haptics:true,unlocked:true};

const timers=[];
const at=(ms,fn)=>{const my=RUN;timers.push(setTimeout(()=>{if(my===RUN)fn()},ms))};
const $=(s,r=document)=>r.querySelector(s);
const rv=(el,a='a-pop')=>{if(typeof el==='string')el=$(el,R);if(!el)return;el.classList.remove('hid');el.classList.add(a);return el};
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const rnd=(a,b)=>a+Math.random()*(b-a);
const FO='M50 3C54 22 90 38 90 78c0 24-18 40-40 40S10 102 10 78c0-18 9-28 17-38 3 10 9 15 15 15-3-20 0-38 8-52z';
const FI='M50 66c7 10 14 18 14 27 0 9-6 15-14 15s-14-6-14-15c0-9 7-17 14-27z';
let AC=null,master=null,NB=null;
function ctx(force){
  if(!S.sound||!S.unlocked||(S.mute&&!force))return null;
  try{
    if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.75;master.connect(AC.destination);
      NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    if(AC.state==='suspended')AC.resume();return AC;
  }catch(e){return null}
}
function tone(f,d,o={}){const c=ctx();if(!c)return;const{t=0,type='sine',g=.25,f2,a=.008}=o;const s=c.currentTime+t;
  const os=c.createOscillator(),v=c.createGain();os.type=type;os.frequency.setValueAtTime(f,s);if(f2)os.frequency.exponentialRampToValueAtTime(f2,s+d);
  v.gain.setValueAtTime(.0001,s);v.gain.exponentialRampToValueAtTime(g,s+a);v.gain.exponentialRampToValueAtTime(.0001,s+d);
  os.connect(v);v.connect(master);os.start(s);os.stop(s+d+.05)}
function noise(d,o={}){const c=ctx();if(!c)return;const{t=0,f1=300,f2=3000,g=.2,type='bandpass',q=1,rise=false}=o;const s=c.currentTime+t;
  const src=c.createBufferSource();src.buffer=NB;const fl=c.createBiquadFilter();fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f1,s);fl.frequency.exponentialRampToValueAtTime(f2,s+d);
  const v=c.createGain();v.gain.setValueAtTime(.0001,s);
  if(rise){v.gain.linearRampToValueAtTime(g,s+d*.9);v.gain.linearRampToValueAtTime(.0001,s+d)}else{v.gain.linearRampToValueAtTime(g,s+.01);v.gain.exponentialRampToValueAtTime(.0001,s+d)}
  src.connect(fl);fl.connect(v);v.connect(master);src.start(s);src.stop(s+d+.05)}
const sfx={
  tick(i=0){tone(520+i*70,.1,{type:'triangle',g:.2})},
  pop(){tone(280,.14,{f2:780,g:.25})},
  thump(){tone(150,.35,{f2:42,g:.7});noise(.14,{f1:900,f2:200,g:.15,type:'lowpass'})},
  whoosh(d=1){noise(d,{f1:250,f2:5200,g:.3,q:.9,rise:true})},
  whoomp(){tone(110,.6,{f2:36,g:.8});noise(.5,{f1:3200,f2:300,g:.28,type:'lowpass'})},
  sparkle(){[1568,1976,2349,3136].forEach((f,i)=>tone(f,.28,{t:i*.07,g:.1}))},
  chime(){[523,659,784,1047].forEach((f,i)=>tone(f,.55,{t:i*.09,type:'triangle',g:.22}))},
  coin(){tone(988,.08,{type:'square',g:.07});tone(1319,.25,{t:.07,type:'square',g:.07})},
  check(i=0){tone(660+i*60,.15,{g:.24});tone(990+i*90,.1,{t:.05,g:.1})},
  crack(){noise(.16,{f1:2500,f2:7000,g:.3,type:'highpass'})},
  rumble(){tone(70,.5,{f2:55,g:.35,type:'triangle'})}
};

async function loadBuf(url){const c=ctx(true);if(!c)return null;const r=await fetch(url);const ab=await r.arrayBuffer();return await new Promise((ok,no)=>c.decodeAudioData(ab,ok,no))}
let BUF=[],CS=null,CLIPP=null;
function preload(){return CLIPP||(CLIPP=(async()=>{try{BUF=[await loadBuf(clip0Url)]}catch(e){CLIPP=null}})())}
async function playClip(k){const my=RUN;await preload();if(my!==RUN)return;const c=ctx(true);if(!c||!BUF[k])return;try{CS=c.createBufferSource();CS.buffer=BUF[k];CS.connect(master);CS.start(0)}catch(e){}}
const E=(ms,s,h,fn)=>at(ms,()=>{if(s)s();if(h)hap(h);if(fn)fn()});

let IB=null,IS=null,IGN=null,IBP=null;
function introLoad(){const c=ctx(true);if(!c)return Promise.resolve();return IBP||(IBP=(async()=>{try{IB=await loadBuf(introUrl)}catch(e){IBP=null}})())}
function introStop(ms){if(!IS||!AC)return;const g=IGN,s=IS,n=AC.currentTime;IS=null;try{g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(g.gain.value,n);g.gain.linearRampToValueAtTime(0,n+ms/1000);s.stop(n+ms/1000+.05)}catch(e){}}
let IBUSY=false;
async function introPlay(off){if(IS||IBUSY)return;IBUSY=true;const my=RUN;try{await introLoad()}catch(e){}IBUSY=false;if(my!==RUN||!IB||IS)return;const c=ctx(true);if(!c)return;IGN=c.createGain();IGN.gain.value=0;IGN.connect(master);IS=c.createBufferSource();IS.buffer=IB;IS.loop=true;IS.connect(IGN);IS.start(0,off%IB.duration);IGN.gain.linearRampToValueAtTime(.6,c.currentTime+.3)}
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
const FLM=(c,h,w=20,hh=24)=>`<svg viewBox="0 0 100 120" style="width:${w}px;height:${hh}px;display:block"><path d="${FO}" fill="${c}"/><path d="${FI}" fill="${h}"/></svg>`;
const ring=(sz,sw,pct,col,tr)=>{const r=(sz-sw)/2,c=2*Math.PI*r;return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${tr}" stroke-width="${sw}"/><circle class="rp" data-c="${c}" data-p="${pct}" cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c} ${c}" stroke-dashoffset="${c*(1-pct)}"/></svg>`};

const SP={'Lesson complete':{r:-4,f:0,a:'bob'},'Starting score':{r:5,f:1,a:'sway'},'Streak: day 1':{r:0,f:0,a:'bob'},'Streak goal':{r:-5,f:1,a:'sway'},'Gems reward':{r:4,f:0,a:'bob'},'Save progress':{r:-6,f:0,a:'sway'},'Create profile':{r:0,f:1,a:'bob'},'Find friends':{r:5,f:0,a:'sway'},'Profile created':{r:0,f:0,a:'bob'}};
function poseAll(){const t=SCREENS[CUR]&&SCREENS[CUR].t,ps=SP[t];if(!ps)return;[...R.querySelectorAll('img')].forEach(im=>{if(im.closest('.ipm')&&t==='Intro flow')return;if((im.getAttribute('src')||'')!==MASC[0])return;im.style.setProperty('--r',ps.r+'deg');im.style.setProperty('--fx',ps.f?-1:1);im.classList.add('zp',ps.a)})}
const ZS={'Placement exam':'greet','Lesson complete':'success','Gems reward':'success','Find friends':'greet','Profile created':'success','Save progress':'greet'};
function go(i){znStopAll();introStop(600);RUN++;timers.forEach(clearTimeout);timers.length=0;CUR=i;stage.innerHTML=SCREENS[i].html();R=stage.firstElementChild;try{CS&&CS.stop()}catch(e){}S.mute=true;znInit(R);if(SCREENS[i].t!=='Intro flow'&&SCREENS[i].t!=='Starting score'){U.tok++;const tk=U.tok;$$('.xbub',R).forEach(b=>{const zz=(b.closest('.xz')||R).querySelector('.zn')||R.querySelector('.zn');typeIn(b,b.innerHTML,tk,zz)})}
 try{const bg=getComputedStyle(R).backgroundColor;if(bg&&bg!=='rgba(0, 0, 0, 0)')host.style.background=bg}catch(e){}SCREENS[i].play();{const zz=R.querySelector('.zn'),g=ZS[SCREENS[i].t];if(zz&&g)at(500,()=>znSet(zz,g))}}
let K=1,FULLH=0,LASTW=0;
function fit(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;if(w!==LASTW){LASTW=w;FULLH=h}FULLH=Math.max(FULLH,h);
 K=Math.min(w/380,FULLH/700);const sh=h/K;stage.style.height=sh+'px';stage.style.transform='scale('+K+')'}
const ro=new ResizeObserver(fit);ro.observe(host);fit();
host.addEventListener('pointerdown',()=>{ctx(true)},{passive:true});
function finish(){opts.onFinish&&opts.onFinish({x:X,score:X.score,gems:X.gems,friends:(X.addedFriends||[]).map(f=>f.id),intro:{name:U.name,answers:U.sel,examDate:(U.examDate||(()=>{const j=(U.sel[IPG.findIndex(x=>x.id==='exam')]||[])[0];return j!==undefined&&j<4?isoOf(EXD[j]):''})()),ipg:IPG}})}


let LCB=null;
async function playLC(){const my=RUN;const c=ctx(true);if(!c)return;try{if(!LCB)LCB=await loadBuf(lessonUrl);if(my!==RUN)return;CS=c.createBufferSource();CS.buffer=LCB;CS.connect(master);CS.start(0)}catch(e){}}

const U={i:0,sel:{},name:'',streak:6,done:false,tok:0,dlg:0};
const HOMEI=()=>SCREENS.findIndex(s=>s.t==='Home'),STRKI=()=>SCREENS.findIndex(s=>s.t==='Streak extended');
const MON=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
const EXD=[14,30,60,90].map(n=>{const t=new Date();t.setHours(12,0,0,0);t.setDate(t.getDate()+n);return t});
const EXOPTS=EXD.map(MON).concat(['Not sure yet']);
const isoOf=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const CALIC='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;flex:none"><rect x="3.500" y="5" width="17" height="15.500" rx="3"/><path d="M3.500 10h17M8 3v4M16 3v4"/></svg>';
const IPG=[
{k:'say',m:0,at:0,say:"Hi there! I'm Flame!"},
{k:'say',m:1,at:4,say:'Just 8 quick questions before we plan your first day!'},
{k:'name',m:3,at:8.5,say:'First, what should I call you?',id:'name'},
{k:'list',m:4,at:12.5,say:'What are you studying for?',id:'why',opts:[['School exams','Class 9 to 12'],['College','Degree courses'],['Entrance exams','Competitive tests'],['Self learning','At my own pace']]},
{k:'load',m:2,at:18.5,say:'Getting your study space ready...'},
{k:'list',m:5,at:21.5,say:'How did you hear about StudyOS?',id:'heard',opts:[['Friends or family'],['Instagram or TikTok'],['YouTube'],['Google search'],['App store'],['School or teacher'],['Other']]},
{k:'multi',m:1,at:31,say:'Which subjects do you study?',id:'subj',opts:[['Mathematics'],['Physics'],['Chemistry'],['Biology'],['English'],['Computer Science'],['History'],['Other']]},
{k:'say',m:0,at:38.5,say:"Great, we'll plan every one of them!"},
{k:'multi',m:4,at:46,say:'What do you want from StudyOS?',id:'want',opts:[['Better grades'],['A daily study habit'],['Exam preparation'],['Stay organised'],['Focus without distractions'],['Track my progress']]},
{k:'say',m:5,at:51.5,say:"Let's set up your study routine!"},
{k:'chips',m:2,at:56,say:'When is your next exam?',id:'exam',opts:EXOPTS,date:1},
{k:'list',m:3,at:61,say:"What's your daily study goal?",id:'goal',right:1,cta:"I'M COMMITTED",opts:[['30 min / day','Casual'],['60 min / day','Regular'],['90 min / day','Serious'],['2 hours / day','Intense']]},
{k:'say',m:1,at:66,id:'week',say:"That's 7 hours in your first week!",hl:'7 hours'},
{k:'chips',m:5,at:68,say:'When do you study best?',id:'time',opts:['Morning','Afternoon','Evening','Night']},
{k:'remind',m:2,at:72,say:"I'll remind you to study from your home screen!",cta:"I'M IN"},
{k:'gain',m:0,at:82,say:"Here's what you can achieve in 3 months!"},
{k:'ready',m:1,at:94,say:'Okay! Your study plan is ready.',cta:"LET'S TEST YOU"}
];
const iq=s=>$(s,R);
function iData(id){const k=IPG.findIndex(p=>p.id===id),p=IPG[k];if(id==='name')return U.name.trim();return (U.sel[k]||[]).map(j=>Array.isArray(p.opts[j])?p.opts[j][0]:p.opts[j]).join(', ')}
function iOK(){const p=IPG[U.i],s=U.sel[U.i]||[];if(p.k==='name')return U.name.trim().length>0;if(p.k==='list'||p.k==='multi'||p.k==='chips')return s.length>0;return p.k!=='load'}
function iCTA(){const b=iq('[data-a=cta]'),p=IPG[U.i];b.disabled=!iOK();b.textContent=p.cta||'CONTINUE';iq('.bar').style.display=p.k==='load'?'none':'flex'}
const GI=(c,svg)=>`<i style="background:${c}"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">${svg}</svg></i>`;
function iBody(p){
  const s=U.sel[U.i]||[];
  if(p.k==='list'||p.k==='multi')return '<div class="ipl">'+p.opts.map((o,j)=>{const d=o[1]||'';return `<button class="ipo${s.includes(j)?' on':''}" type="button" data-a="opt" data-j="${j}"><span class="ipx">${o[0]}${d&&!p.right?`<small>${d}</small>`:''}</span>${p.right&&d?`<em>${d}</em>`:''}${p.k==='multi'?'<i class="ipc"></i>':''}</button>`}).join('')+'</div>';
  if(p.k==='chips')return '<div class="ipch">'+p.opts.map((o,j)=>`<button class="ipo chip${s.includes(j)?' on':''}" type="button" data-a="opt" data-j="${j}">${o}</button>`).join('')+(p.date?`<button class="ipo chip cal${s.includes(99)?' on':''}" type="button" data-a="cal" data-j="99" style="display:inline-flex;align-items:center">${CALIC}${U.examDate?MON(new Date(U.examDate+'T12:00:00')):'Pick a date'}</button><input class="ipdate" type="date" min="${isoOf(new Date())}" value="${U.examDate||''}" tabindex="-1" aria-hidden="true">`:'')+'</div>';
  if(p.k==='name')return `<input class="ipi" placeholder="Your first name" maxlength="20" autocomplete="off" value="${U.name.replace(/"/g,'')}">`;
  if(p.k==='load')return '<div class="ipld ipld2"><div class="ipor" aria-hidden="true"><span></span><span></span><span></span><b></b></div>'
    +'<ul class="ipsteps">'+[['Saving your answers',0],['Picking your subjects',1],['Planning your first day',2],['Setting up reminders',3]].map(([t,k])=>`<li style="--k:${k}"><i><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"/></svg></i><span>${t}</span></li>`).join('')+'</ul>'
    +'<div class="ipbar"><i><em>0%</em></i></div><div class="ipcap">BUILDING YOUR STUDY SPACE<span class="ipdots"><b>.</b><b>.</b><b>.</b></span></div></div>';
  if(p.k==='remind')return `<div class="ipph"><div class="ipwg">${FLM('#c9b8c3','#1b1e25',30,36)}<b>${U.streak}</b><small>day streak</small></div><div class="ipwg g">${ring(66,7,.6,'#1b1e25','#c8c6c8')}<small>Daily goal</small></div></div>`;
  if(p.k==='gain')return '<div class="ipg">'+[['<svg viewBox="0 0 48 48" width="52" height="52"><path d="M5 9a5 5 0 015-5h18a5 5 0 015 5v12a5 5 0 01-5 5H17l-7 6v-6.4A5 5 0 015 21z" fill="#e2c4fb"/><path d="M17 19a5 5 0 015-5h17a5 5 0 015 5v13a5 5 0 01-5 5h-4v6l-8-6h-5a5 5 0 01-5-5z" fill="#b66dff" stroke="#2a1850" stroke-width="2.4" stroke-linejoin="round"/></svg>','Study with confidence','A plan for every subject and exam.'],['<svg viewBox="0 0 48 48" width="52" height="52"><defs><clipPath id="fcc"><rect x="5" y="7" width="26" height="32" rx="5.5"/></clipPath></defs><path d="M30 12.5l9.5-2.2a3.5 3.5 0 014.2 2.6l3 13.800a3.500 3.500 0 01-2.600 4.200L31 37.500z" fill="#1fa4f5" transform="translate(-2 3)"/><rect x="5" y="7" width="26" height="32" rx="5.5" fill="#7fd0f6"/><g clip-path="url(#fcc)"><path d="M3 27L21 5h6L3 34z" fill="#fff" opacity=".38"/><path d="M12 42L34 15v8L18 42z" fill="#fff" opacity=".26"/></g><rect x="5" y="7" width="26" height="32" rx="5.5" fill="none" stroke="#173f66" stroke-width="2.4"/><text x="18" y="30.500" font-size="17" font-weight="800" text-anchor="middle" fill="#14283a" font-family="Space Grotesk,Inter,Arial,sans-serif">A</text></svg>','Remember more','Notes, flashcards and spaced repetition.'],['<svg viewBox="0 0 48 48" width="52" height="52"><rect x="15" y="2.500" width="18" height="10" rx="3.500" fill="#ffb300"/><rect x="15" y="35.500" width="18" height="10" rx="3.500" fill="#ffb300"/><rect x="38" y="20" width="4.500" height="8" rx="2.200" fill="#ffa000"/><rect x="7" y="8" width="33" height="32" rx="10" fill="#ffb800"/><rect x="11.500" y="12.500" width="24" height="23" rx="6.500" fill="#fff0cc"/><path d="M22 17.500v7.500h5.500" fill="none" stroke="#c46f00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>','Build a daily habit','Streaks, reminders and focus sessions.']].map(([ico,t,d])=>`<div class="igr"><div class="igi">${ico}</div><div><b>${t}</b><span>${d}</span></div></div>`).join('')+'</div>';
  if(p.k==='score')return `<div class="ipsc"><svg viewBox="0 0 300 270" width="100%"><path d="M79.3 210.7A100 100 0 1 1 220.7 210.7" fill="none" stroke="#37434c" stroke-width="26" stroke-linecap="round"/><path class="scarc" pathLength="100" d="M79.3 210.7A100 100 0 1 1 220.7 210.7" fill="none" stroke="#c9b8c3" stroke-width="26" stroke-linecap="round" stroke-dasharray="0 100"/><path d="M42 130l23-10 23 10-23 10z" transform="translate(0 0)" fill="none"/><g transform="translate(95 124)"><path d="M20 2L2 10l18 8 18-8z" fill="#c9b8c3"/><path d="M9 15v8c0 3 5 6 11 6s11-3 11-6v-8l-11 5z" fill="#9d8c98"/><path d="M37 11v11" stroke="#c9b8c3" stroke-width="2.400" stroke-linecap="round"/></g><text class="scn" x="188" y="160" text-anchor="middle" font-size="58" font-weight="700" fill="#f4f2f3" font-family="Space Grotesk,Inter,Arial,sans-serif">0</text><text x="79" y="262" text-anchor="middle" font-size="22" font-weight="700" fill="#5d6b75" font-family="Space Grotesk,Inter,Arial,sans-serif">0</text><text x="221" y="262" text-anchor="middle" font-size="22" font-weight="700" fill="#5d6b75" font-family="Space Grotesk,Inter,Arial,sans-serif">160</text></svg></div>`;
  if(p.k==='ready')return '<div class="ipsum">'+[['Name',iData('name')||'Aisha'],['Studying for',iData('why')],['Subjects',iData('subj')],['Next exam',iData('exam')],['Daily goal',iData('goal')],['Best time',iData('time')]].map(([a,b])=>`<div><span>${a}</span><b>${b||'Not set'}</b></div>`).join('')+'</div>';
  return '';
}
const POSE=[{r:0,f:0,a:'bob'},{r:-6,f:0,a:'sway'},{r:6,f:1,a:'bob'},{r:-4,f:0,a:'sway'},{r:0,f:0,a:'load'},{r:5,f:1,a:'sway'},{r:-6,f:0,a:'bob'},{r:0,f:1,a:'sway'},{r:6,f:0,a:'bob'},{r:-5,f:1,a:'sway'},{r:0,f:0,a:'bob'},{r:-6,f:1,a:'sway'},{r:5,f:0,a:'bob'},{r:0,f:0,a:'bob'},{r:-4,f:1,a:'sway'},{r:0,f:0,a:'bob'},{r:6,f:0,a:'sway'},{r:0,f:1,a:'bob'}];
const BIG=p=>p.k==='load'||(p.k==='say'&&p.at<=4);
function sayOf(p){
 if(p.id==='week'){const gk=IPG.findIndex(x=>x.id==='goal'),j=(U.sel[gk]||[1])[0],mins=[30,60,90,120][j]||60,h=mins*7/60,t=(Math.round(h*10)/10).toString().replace(/\.0$/,'')+(h===1?' hour':' hours');return {say:"That's "+t+" in your first week!",hl:t}}
 return {say:p.say,hl:p.hl}}
// type the text in letter by letter (the space is reserved so nothing jumps)
function typeIn(el,html,tok,z){
 el.innerHTML=html;const chars=[];
 (function wrap(node){[...node.childNodes].forEach(n=>{if(n.nodeType===3){const f=document.createDocumentFragment();[...n.nodeValue].forEach(c=>{const sp=document.createElement('span');sp.textContent=c;sp.style.opacity='0';f.appendChild(sp);chars.push(sp)});n.replaceWith(f)}else wrap(n)})})(el);
 znTalk(z,false);setTimeout(()=>{if(U.tok===tok)znTalk(z,true)},260);
 const t0=performance.now()+260,per=Math.max(16,Math.min(30,900/Math.max(chars.length,1)));let n=0;
 (function step(){if(U.tok!==tok||!el.isConnected){znTalk(z,false);return}const k=Math.floor((performance.now()-t0)/per);while(n<=k&&n<chars.length){chars[n].style.opacity='1';n++}if(n<chars.length)requestAnimationFrame(step);else{setTimeout(()=>znTalk(z,false),180)}})();
}
function iRender(){
  const p=IPG[U.i];U.dlg=0;const tok=++U.tok,big=BIG(p),first=!U.shown;U.shown=1;
  [iq('.ibub'),iq('.ipbody'),iq('.ipz')].forEach(e=>e&&e.getAnimations().forEach(x=>x.cancel()));
  const m=iq('.ipz'),z=iq('.ipm .zn'),r0=m.getBoundingClientRect();znInit(R);
  iq('.ipp i').style.width=(U.i/(IPG.length-1)*100)+'%';iq('.ipp').style.opacity=big&&U.i<2?0:1;iq('.ipb').style.visibility='visible';
  const wasBig=R.classList.contains('big');R.classList.toggle('big',big);R.classList.toggle('ld',p.k==='load');
  const sy0=sayOf(p);const sy={say:tr(sy0.say),hl:sy0.hl?tr(sy0.hl):sy0.hl};
  const html=sy.hl?sy.say.replace(sy.hl,'<span style="color:#e8a83a">'+sy.hl+'</span>'):sy.say;
  iq('.ipbody').innerHTML=iBody(p);iCTA();
  // mascot: slide from where it was to where it is now, with a little hop at the end
  const r1=m.getBoundingClientRect();
  if(first){m.animate([{transform:'translateY(-90px) scale(.7)',opacity:0},{transform:'translateY(8px) scale(1.04)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:620,easing:'cubic-bezier(.3,.9,.4,1)'})}
  else{const dx=(r0.left-r1.left)/K,dy=(r0.top-r1.top)/K,sc=r0.width/r1.width||1;
   if(wasBig!==big||Math.abs(dx)+Math.abs(dy)>4)m.animate([{transform:`translate(${dx}px,${dy}px) scale(${sc})`},{transform:`translate(${dx*.25}px,${dy*.25-22}px) scale(${1+(sc-1)*.25})`,offset:.55},{transform:'none'}],{duration:640,easing:'cubic-bezier(.3,.8,.35,1)'});
   else m.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-14px) scale(1.06)',offset:.4},{transform:'none'}],{duration:420,easing:'ease-out'})}
  const bub=iq('.ibub');typeIn(bub,html,tok,z);
  at(first?900:700,()=>{if(p.k==='ready')znSet(z,'success');else if(p.k==='load')znSet(z,'think');else if(first)znSet(z,'greet');else if(/\?/.test(sy.say))znSet(z,'think');else znSet(z,'explain')});
  bub.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1.03)',offset:.6},{opacity:1,transform:'none'}],{duration:380,delay:first?500:120,easing:'ease-out',fill:'backwards'});
  const body=iq('.ipbody');
  if($$('.ipo',R).length)$$('.ipo',R).forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(54px)'},{opacity:1,transform:'translateY(-4px)',offset:.75},{opacity:1,transform:'none'}],{duration:460,delay:(first?500:240)+k*60,easing:'cubic-bezier(.2,.85,.3,1)',fill:'backwards'}));
  else body.animate([{opacity:0,transform:'translateY(40px)'},{opacity:1,transform:'none'}],{duration:440,delay:(first?500:300),easing:'cubic-bezier(.2,.85,.3,1)',fill:'backwards'});
  hap('tick');
  if(S.sound&&!IS)introPlay(0);
  if(p.k==='load'){at(2900,()=>znSet(z,'think'));(function pc(){const i=iq('.ipbar i');if(!i||U.tok!==tok)return;const e=i.querySelector('em'),w=i.getBoundingClientRect().width/(i.parentNode.getBoundingClientRect().width||1);if(e){const v=Math.min(100,Math.round(w*100));e.textContent=v+'%';e.style.opacity=v>16?1:0}requestAnimationFrame(pc)})();iq('.ipbar i').animate([{width:'0%'},{width:'100%'}],{duration:3000,delay:300,easing:'cubic-bezier(.4,.1,.3,1)',fill:'forwards'});[0,1,2,3].forEach(k=>at(700+k*650,()=>{if(U.tok!==tok)return;tone(700+k*120,.09,{type:'triangle',g:.1});hap('tick')}));at(3300,()=>{if(U.tok===tok){tone(1047,.16,{g:.12});tone(1568,.22,{t:.07,g:.1})}});at(3500,()=>{if(U.tok===tok&&IPG[U.i].k==='load'){hap('success');iNext()}})}
  if(p.k==='ready')at(500,()=>{hap('success');burst(190,330,26,{})});
}
// leave the current page (text fades, options drop away), then show the next one
function iGoTo(n){
  if(U.busy||n<0||n>=IPG.length)return;U.busy=1;U.tok++;
  const b=iq('.ibub'),body=iq('.ipbody');
  b&&b.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.92)'}],{duration:170,fill:'forwards'});
  body&&body.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(36px)'}],{duration:210,easing:'ease-in',fill:'forwards'});
  at(220,()=>{U.busy=0;U.i=n;iRender()});
}
function iNext(){iGoTo(U.i+1)}
function iDlg(){U.dlg=1;const d=document.createElement('div');d.className='ipdlg';d.innerHTML=`<div><b>Add to Home screen</b><p>StudyOS streak widget</p><div class="ipw2">${FLM('#c9b8c3','#1b1e25',34,40)}<b>${U.streak}</b></div><div class="ipdb"><button data-a="dno" type="button">CANCEL</button><button data-a="dyes" type="button">ADD</button></div></div>`;R.appendChild(d);d.animate([{opacity:0},{opacity:1}],{duration:200});sfx.pop();hap('light')}
SCREENS.push({t:'Intro flow',d:'After sign in: questions, then Home',next:'Placement exam',
 spec:{m:'After onboarding and sign in, the new user meets Zip, the study guide. Each page slides in with Zip bouncing and a speech bubble popping, options stagger in, the progress bar grows and a building screen fills before the questions continue. The page after the plan summary is a score page: Zip says where the user starts while a gauge fills to 80 and the number counts up, then Continue opens Home. On the first page the top left shows a Back arrow with the word Back, so a user who tapped Get started by mistake can return to the last onboarding page.',h:'A light tick on every page and every option, a light tap on Continue, a success pattern when the building screen finishes and on the final page.',s:'Your intro track plays from the first tap and keeps going until the user reaches Home. On every page it jumps to that page\'s moment in the track (the same order as your video) and crossfades. Small tones play on top: a pop for the speech bubble, a tick for every option, a check on Continue, a whoosh and sparkle for the building screen and a chime on the last page. The music fades out as Home opens.'},
 html:()=>'<div class="scr ip"><div class="ipt"><button class="ipb" type="button" data-a="back" aria-label="Back"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="ipbt">Back</span></button><div class="ipp"><i></i></div></div><div class="ipm"><div class="ipz">'+znHtml(92)+'</div><div class="ibub"></div></div><div class="ipbody"></div><div class="bar"><button class="btn" type="button" data-a="cta">CONTINUE</button></div></div>',
 play(){
  S.mute=false;U.i=0;U.sel={};U.name='';U.tok=0;U.busy=0;U.shown=0;iRender();
  R.onclick=e=>{
    if(!IS&&S.sound&&S.unlocked)introPlay(0);
    const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,p=IPG[U.i];
    if(a==='opt'){const j=+b.dataset.j;let s=U.sel[U.i]||[];s=p.k==='multi'?(s.includes(j)?s.filter(x=>x!==j):s.concat(j)):[j];U.sel[U.i]=s;if(p.date){U.examDate='';const cb=$('.chip.cal',R);if(cb)cb.innerHTML=CALIC+'Pick a date'}$$('.ipo',R).forEach((el,k)=>el.classList.toggle('on',s.includes(el.dataset.j==='99'?99:k)));b.animate([{transform:'scale(.96)'},{transform:'none'}],{duration:200});hap('light');iCTA();znSet(iq('.ipm .zn'),'nod')}
    else if(a==='cal'){const d=$('.ipdate',R);if(d){try{d.showPicker?d.showPicker():d.click()}catch(e){d.click()}}hap('light')}
    else if(a==='cta'){if(!iOK())return;sfx.check();hap('light');if(U.i===IPG.length-1){introStop(900);hap('success');at(260,()=>go(IDX('Placement exam')));return}iNext()}
    else if(a==='back'&&U.i>0){hap('tick');iGoTo(U.i-1)}
    else if(a==='back'){sfx.tick();hap('light');opts.onBack&&opts.onBack()}
    else if(a==='dno'||a==='dyes'){const d=iq('.ipdlg');if(d)d.remove();sfx.check();hap('light');iNext()}
  };
  R.oninput=e=>{if(e.target.classList.contains('ipi')){U.name=e.target.value;iCTA()}};
  R.onchange=e=>{if(e.target.classList.contains('ipdate')&&e.target.value){U.examDate=e.target.value;U.sel[U.i]=[99];const b=$('.chip.cal',R);if(b){b.lastChild&&0;b.innerHTML=CALIC+MON(new Date(U.examDate+'T12:00:00'))}$$('.ipo',R).forEach(el=>el.classList.toggle('on',el.dataset.j==='99'));hap('success');iCTA();znSet(iq('.ipm .zn'),'nod')}};
 }});



Object.assign(sfx,{
 tick(){},pop(){},check(){},whoosh(){},coin(){},slam(){},
 right(){tone(1047,.1,{g:.2});tone(1568,.32,{t:.09,g:.2});tone(2093,.22,{t:.09,g:.04})},
 wrong(){tone(233,.16,{f2:175,g:.32,type:'triangle'});tone(175,.3,{t:.13,f2:123,g:.32,type:'triangle'})},
 cel(){[1047,1319,1568,2093].forEach((f,i)=>{tone(f,.42,{t:i*.11,g:.15});tone(f*2,.2,{t:i*.11,g:.025})})},
 gem(){tone(1760,.08,{g:.14});tone(2349,.24,{t:.06,g:.14})},
 level(){sfx.cel()}
});
const X={q:-1,queue:[],sel:null,res:{},combo:0,best:0,xp:0,t0:0,ok:0,tot:0,goal:7,age:'',email:'',pw:'',first:'',last:'',st:0,fr:0,friends:2,sheet:null,tries:{}};

const nm=()=>(U.name.trim()||X.first.trim()||'Aisha');
const IC={
 x:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 back:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 ok:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0d2a1c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 no:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2a0d12" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 tk:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 g:'<svg viewBox="0 0 24 24" width="20" height="20"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285f4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.600-4.100H3.100v2.600A10 10 0 0012 22z" fill="#34a853"/><path d="M6.400 14c-.2-.6-.3-1.300-.3-2s.1-1.400.3-2V7.400H3.100a10 10 0 000 9.200z" fill="#fbbc05"/><path d="M12 5.900c1.500 0 2.800.5 3.800 1.500l2.800-2.800A10 10 0 003.100 7.400L6.400 10c.8-2.300 3-4.100 5.600-4.100z" fill="#ea4335"/></svg>',
 mail:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c9b8c3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
 sub:{
  English:'<svg viewBox="0 0 24 24" fill="none" stroke="#c9b8c3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h6a3 3 0 013 3v11a2 2 0 00-2-2H4zM20 5h-6a3 3 0 00-3 3v11a2 2 0 012-2h7z"/></svg>',
  Physics:'<svg viewBox="0 0 24 24" fill="none" stroke="#c9b8c3" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="#c9b8c3"/></svg>',
  Chemistry:'<svg viewBox="0 0 24 24" fill="none" stroke="#c9b8c3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5.500 9.500A2 2 0 006.200 21h11.600a2 2 0 001.700-2.500L14 9V3"/><path d="M7.500 15h9"/></svg>',
  Maths:'<svg viewBox="0 0 24 24" fill="none" stroke="#c9b8c3" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M12 5v14" transform="rotate(0)"/><path d="M5 19l14-14" opacity=".0"/></svg>',
  Biology:'<svg viewBox="0 0 24 24" fill="none" stroke="#c9b8c3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4c0 6 10 10 10 16M17 4c0 6-10 10-10 16M8.500 8h7M8.500 16h7"/></svg>'
 }
};
/* Placement exam: a big question pool for each subject. Every time the exam starts (each new account,
   each retry) one question per subject is picked at random, and answer options are shuffled. The last
   questions shown on this phone are skipped, so users see different questions. */
const QPOOL={
 English:[
  {k:'blank',h:'Complete the sentence',pre:'Neither of the students',post:'ready for the test.',bank:['were','was','are','be'],a:'was',why:'"Neither" is singular, so it takes "was".'},
  {k:'blank',h:'Complete the sentence',pre:'She has lived here',post:'2019.',bank:['for','since','from','during'],a:'since',why:'Use "since" with a starting point in time.'},
  {k:'blank',h:'Complete the sentence',pre:'If I',post:'you, I would study harder.',bank:['was','am','were','be'],a:'were',why:'The second conditional uses "were" for every person.'},
  {k:'blank',h:'Complete the sentence',pre:'Each of the boys',post:'his own book.',bank:['have','has','having','are'],a:'has',why:'"Each" is singular, so it takes "has".'},
  {k:'mc',h:'Which word is a synonym of "rapid"?',opts:['Slow','Quick','Heavy','Quiet'],a:1,why:'"Rapid" means fast, so "quick" is the synonym.'},
  {k:'mc',h:'Which sentence is correct?',opts:['He don\u2019t like tea.','He doesn\u2019t likes tea.','He doesn\u2019t like tea.','He not like tea.'],a:2,why:'After "doesn\u2019t" the verb stays in its base form: like.'},
  {k:'grid',h:'Choose the antonym of "ancient"',opts:['Old','Modern','Huge','Famous'],a:1,why:'Ancient means very old; the opposite is modern.'},
  {k:'pairs',h:'Match each word to its opposite',L:['Brave','Early','Rich','Wide'],Rt:['Late','Narrow','Poor','Cowardly'],map:{Brave:'Cowardly',Early:'Late',Rich:'Poor',Wide:'Narrow'},why:'Brave–cowardly, early–late, rich–poor, wide–narrow.'},
  {k:'mc',h:'Choose the correctly punctuated sentence',opts:['Its raining, so bring you\u2019re coat.','It\u2019s raining, so bring your coat.','Its\u2019 raining so bring your coat.','It\u2019s raining so, bring you\u2019re coat.'],a:1,why:'\u201cIt\u2019s\u201d = it is; \u201cyour\u201d shows ownership; the comma goes before \u201cso\u201d.'},
  {k:'blank',h:'Complete the sentence',pre:'By the time we arrived, the film',post:'.',bank:['started','has started','had started','was start'],a:'had started',why:'The past perfect shows an action finished before another past action.'},
  {k:'grid',h:'Which word means \u201cto make something less severe\u201d?',opts:['Aggravate','Mitigate','Exaggerate','Fabricate'],a:1,why:'To mitigate is to reduce how bad something is.'}
 ],
 Physics:[
  {k:'mc',h:'A 2 kg trolley accelerates at 3 m/s\u00b2. What net force acts on it?',opts:['1.5 N','5 N','6 N','9 N'],a:2,why:'F = m \u00d7 a = 2 kg \u00d7 3 m/s\u00b2 = 6 N.'},
  {k:'mc',h:'A car travels 120 m in 6 s. What is its average speed?',opts:['20 m/s','18 m/s','72 m/s','26 m/s'],a:0,why:'Speed = distance \u00f7 time = 120 \u00f7 6 = 20 m/s.'},
  {k:'grid',h:'What is the SI unit of power?',opts:['Joule','Newton','Watt','Pascal'],a:2,why:'Power is measured in watts (1 W = 1 J/s).'},
  {k:'mc',h:'A 12 V battery drives 3 A through a resistor. What is its resistance?',opts:['36 \u03a9','4 \u03a9','15 \u03a9','0.25 \u03a9'],a:1,why:'R = V \u00f7 I = 12 \u00f7 3 = 4 \u03a9.'},
  {k:'grid',h:'Which wave needs a medium to travel?',opts:['Light','Radio','Sound','X-ray'],a:2,why:'Sound is a mechanical wave and cannot travel through a vacuum.'},
  {k:'mc',h:'A 5 kg box is lifted 2 m (g = 10 m/s\u00b2). How much energy does it gain?',opts:['10 J','50 J','100 J','25 J'],a:2,why:'Ep = m \u00d7 g \u00d7 h = 5 \u00d7 10 \u00d7 2 = 100 J.'},
  {k:'pairs',h:'Match each quantity to its unit',L:['Force','Energy','Current','Pressure'],Rt:['Ampere','Pascal','Newton','Joule'],map:{Force:'Newton',Energy:'Joule',Current:'Ampere',Pressure:'Pascal'},why:'Force N, energy J, current A, pressure Pa.'},
  {k:'blank',h:'Complete the sentence',pre:'Every action has an equal and opposite',post:'.',bank:['force','reaction','motion','mass'],a:'reaction',why:'This is Newton\u2019s third law.'},
  {k:'mc',h:'A ball is dropped from rest. What is its speed after 3 s? (g = 10 m/s\u00b2)',opts:['3 m/s','10 m/s','30 m/s','45 m/s'],a:2,why:'v = u + gt = 0 + 10 \u00d7 3 = 30 m/s.'},
  {k:'mc',h:'Two 6 \u03a9 resistors are connected in parallel. What is the total resistance?',opts:['12 \u03a9','6 \u03a9','3 \u03a9','0.5 \u03a9'],a:2,why:'1/R = 1/6 + 1/6 = 1/3, so R = 3 \u03a9.'},
  {k:'grid',h:'A wave has frequency 50 Hz and wavelength 4 m. What is its speed?',opts:['12.5 m/s','54 m/s','200 m/s','46 m/s'],a:2,why:'v = f \u00d7 \u03bb = 50 \u00d7 4 = 200 m/s.'}
 ],
 Chemistry:[
  {k:'pairs',h:'Tap the matching pairs',L:['Na','Fe','K','Au'],Rt:['Gold','Sodium','Iron','Potassium'],map:{Na:'Sodium',Fe:'Iron',K:'Potassium',Au:'Gold'},why:'Na is sodium, Fe is iron, K is potassium and Au is gold.'},
  {k:'pairs',h:'Match each formula to its name',L:['H\u2082O','CO\u2082','NaCl','CH\u2084'],Rt:['Methane','Salt','Water','Carbon dioxide'],map:{'H\u2082O':'Water','CO\u2082':'Carbon dioxide','NaCl':'Salt','CH\u2084':'Methane'},why:'H\u2082O water, CO\u2082 carbon dioxide, NaCl salt, CH\u2084 methane.'},
  {k:'mc',h:'What is the pH of pure water at 25 \u00b0C?',opts:['0','7','10','14'],a:1,why:'Pure water is neutral, pH 7.'},
  {k:'grid',h:'Which gas do plants take in for photosynthesis?',opts:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'],a:2,why:'Plants use carbon dioxide and water to make glucose.'},
  {k:'mc',h:'How many protons does a carbon atom have?',opts:['4','6','8','12'],a:1,why:'Carbon\u2019s atomic number is 6, so it has 6 protons.'},
  {k:'grid',h:'Which of these is a noble gas?',opts:['Chlorine','Neon','Oxygen','Sodium'],a:1,why:'Neon is in group 18, the noble gases.'},
  {k:'blank',h:'Complete the sentence',pre:'An acid reacts with a base to form a salt and',post:'.',bank:['oxygen','water','hydrogen','carbon'],a:'water',why:'Neutralisation: acid + base \u2192 salt + water.'},
  {k:'mc',h:'Which particle has a negative charge?',opts:['Proton','Neutron','Electron','Nucleus'],a:2,why:'Electrons carry a negative charge.'},
  {k:'mc',h:'How many moles are in 22 g of CO\u2082? (C = 12, O = 16)',opts:['0.5 mol','1 mol','2 mol','22 mol'],a:0,why:'Mr of CO\u2082 = 44, so 22 \u00f7 44 = 0.5 mol.'},
  {k:'grid',h:'What type of bond holds the atoms in a water molecule together?',opts:['Ionic','Covalent','Metallic','Hydrogen'],a:1,why:'O and H share electrons: covalent bonds. Hydrogen bonds are between molecules.'},
  {k:'mc',h:'Balance: _H\u2082 + O\u2082 \u2192 _H\u2082O. What are the missing numbers?',opts:['1 and 1','2 and 2','2 and 1','1 and 2'],a:1,why:'2H\u2082 + O\u2082 \u2192 2H\u2082O gives 4 H and 2 O on each side.'}
 ],
 Maths:[
  {k:'grid',h:'Solve for x:  3x + 5 = 20',opts:['x = 3','x = 5','x = 6','x = 15'],a:1,why:'3x = 20 \u2212 5 = 15, so x = 5.'},
  {k:'grid',h:'Solve for x:  2x \u2212 7 = 9',opts:['x = 1','x = 8','x = 6','x = 16'],a:1,why:'2x = 9 + 7 = 16, so x = 8.'},
  {k:'mc',h:'What is 15% of 80?',opts:['8','12','15','20'],a:1,why:'0.15 \u00d7 80 = 12.'},
  {k:'mc',h:'The angles of a triangle are 50\u00b0 and 60\u00b0. What is the third angle?',opts:['70\u00b0','80\u00b0','90\u00b0','110\u00b0'],a:0,why:'180 \u2212 50 \u2212 60 = 70\u00b0.'},
  {k:'grid',h:'What is \u221a144?',opts:['11','12','14','72'],a:1,why:'12 \u00d7 12 = 144.'},
  {k:'mc',h:'Area of a rectangle 7 cm by 4 cm?',opts:['11 cm\u00b2','22 cm\u00b2','28 cm\u00b2','47 cm\u00b2'],a:2,why:'Area = 7 \u00d7 4 = 28 cm\u00b2.'},
  {k:'grid',h:'Simplify:  2\u00b3 \u00d7 2\u00b2',opts:['2\u2075','2\u2076','4\u2075','2\u00b9'],a:0,why:'Add the powers: 3 + 2 = 5.'},
  {k:'mc',h:'What is the mean of 4, 8, 10 and 6?',opts:['6','7','8','28'],a:1,why:'(4 + 8 + 10 + 6) \u00f7 4 = 28 \u00f7 4 = 7.'},
  {k:'grid',h:'Solve:  x\u00b2 \u2212 5x + 6 = 0',opts:['x = 1 or 6','x = 2 or 3','x = \u22122 or \u22123','x = 5 or 6'],a:1,why:'(x \u2212 2)(x \u2212 3) = 0, so x = 2 or 3.'},
  {k:'mc',h:'A price of 200 rises by 10% and then falls by 10%. What is the new price?',opts:['200','198','202','180'],a:1,why:'200 \u00d7 1.1 = 220, then 220 \u00d7 0.9 = 198.'},
  {k:'mc',h:'What is the gradient of the line through (1, 2) and (3, 8)?',opts:['2','3','4','6'],a:1,why:'(8 \u2212 2) \u00f7 (3 \u2212 1) = 6 \u00f7 2 = 3.'}
 ],
 Biology:[
  {k:'mc',h:'Which part of a cell makes most of its ATP?',opts:['Ribosome','Nucleus','Mitochondria','Golgi body'],a:2,why:'Mitochondria release energy from glucose and store it as ATP.'},
  {k:'grid',h:'Which blood cells fight infection?',opts:['Red cells','White cells','Platelets','Plasma'],a:1,why:'White blood cells are part of the immune system.'},
  {k:'mc',h:'Where does photosynthesis take place in a plant cell?',opts:['Chloroplast','Vacuole','Cell wall','Nucleus'],a:0,why:'Chloroplasts contain chlorophyll, which captures light.'},
  {k:'pairs',h:'Match each organ to its job',L:['Heart','Lungs','Kidneys','Stomach'],Rt:['Filter blood','Pump blood','Digest food','Exchange gases'],map:{Heart:'Pump blood',Lungs:'Exchange gases',Kidneys:'Filter blood',Stomach:'Digest food'},why:'Heart pumps, lungs exchange gases, kidneys filter, stomach digests.'},
  {k:'grid',h:'Which molecule carries genetic information?',opts:['ATP','DNA','Glucose','Protein'],a:1,why:'DNA stores the genetic code.'},
  {k:'mc',h:'How many chambers does a human heart have?',opts:['2','3','4','6'],a:2,why:'Two atria and two ventricles.'},
  {k:'blank',h:'Complete the sentence',pre:'Plants release',post:'during photosynthesis.',bank:['carbon dioxide','oxygen','nitrogen','water'],a:'oxygen',why:'Oxygen is the by-product of photosynthesis.'},
  {k:'mc',h:'Which enzyme in saliva starts digesting starch?',opts:['Pepsin','Lipase','Amylase','Trypsin'],a:2,why:'Salivary amylase breaks starch into sugars.'},
  {k:'mc',h:'Two Bb parents have a child. What is the chance it is bb?',opts:['0%','25%','50%','75%'],a:1,why:'Bb \u00d7 Bb gives BB, Bb, Bb, bb: 1 in 4 is bb.'},
  {k:'grid',h:'In which part of the cell does the Krebs cycle happen?',opts:['Cytoplasm','Nucleus','Mitochondrial matrix','Ribosome'],a:2,why:'The Krebs cycle takes place in the matrix of the mitochondria.'},
  {k:'mc',h:'Which hormone lowers blood glucose?',opts:['Glucagon','Adrenaline','Insulin','Thyroxine'],a:2,why:'Insulin makes cells take up glucose and the liver store it as glycogen.'}
 ]
};
const QTOPIC={"English": ["Grammar", "Grammar", "Grammar", "Grammar", "Vocabulary", "Grammar", "Vocabulary", "Vocabulary", "Punctuation", "Tenses", "Vocabulary"], "Physics": ["Forces", "Motion", "Units", "Electricity", "Waves", "Energy", "Units", "Forces", "Motion", "Electricity", "Waves"], "Chemistry": ["Elements", "Compounds", "Acids", "Reactions", "Atoms", "Periodic table", "Acids", "Atoms", "Moles", "Bonding", "Equations"], "Maths": ["Algebra", "Algebra", "Percentages", "Geometry", "Numbers", "Geometry", "Powers", "Statistics", "Quadratics", "Percentages", "Graphs"], "Biology": ["Cells", "Blood", "Plants", "Organs", "Genetics", "Heart", "Plants", "Digestion", "Genetics", "Respiration", "Hormones"]};
const QLEVEL={"English": ["m", "e", "m", "m", "e", "e", "e", "m", "h", "h", "h"], "Physics": ["m", "e", "e", "m", "e", "m", "m", "e", "h", "h", "h"], "Chemistry": ["e", "m", "e", "e", "m", "m", "m", "e", "h", "h", "h"], "Maths": ["e", "m", "m", "e", "e", "e", "m", "m", "h", "h", "h"], "Biology": ["m", "e", "e", "m", "e", "e", "m", "m", "h", "h", "h"]};
const QSUBJ=['English','Physics','Chemistry','Maths','Biology'];
const qRnd=n=>{try{const u=new Uint32Array(1);crypto.getRandomValues(u);return u[0]%n}catch(_){return Math.floor(Math.random()*n)}};
const qShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const k=qRnd(i+1);[a[i],a[k]]=[a[k],a[i]]}return a};
const QSEEN='studyos_exam_seen';
const Q=[];
const QLVNAME={e:'Easy',m:'Medium',h:'Hard'};
let QMODE=(()=>{try{const v=localStorage.getItem('studyos_exam_mode');return /^[emh]$/.test(v||'')?v:'m'}catch(_){return 'm'}})();
function setExamMode(m){if(!/^[emh]$/.test(m))return;QMODE=m;try{localStorage.setItem('studyos_exam_mode',m)}catch(_){}newExam()}
function newExam(){
  let seen={};try{seen=JSON.parse(localStorage.getItem(QSEEN)||'{}')||{}}catch(_){seen={}}
  Q.length=0;
  QSUBJ.forEach(s=>{
    const pool=QPOOL[s],lv=QLEVEL[s]||[],key=s+':'+QMODE;
    // only questions of the chosen level (falls back to the whole pool if a level is empty)
    let cand=pool.map((_,i)=>i).filter(i=>(lv[i]||'m')===QMODE);if(!cand.length)cand=pool.map((_,i)=>i);
    const last=Array.isArray(seen[key])?seen[key]:[];
    let pick=cand.filter(i=>!last.includes(i));if(!pick.length)pick=cand.slice();
    const i=pick[qRnd(pick.length)];seen[key]=[i,...last.filter(x=>x!==i)].slice(0,Math.max(1,cand.length-1));
    const q=Object.assign({s,topic:(QTOPIC[s]&&QTOPIC[s][i])||s,lv:lv[i]||'m'},JSON.parse(JSON.stringify(pool[i])));
    if(q.k==='mc'||q.k==='grid'){const right=q.opts[q.a];q.opts=qShuf(q.opts);q.a=q.opts.indexOf(right)}
    else if(q.k==='blank')q.bank=qShuf(q.bank);
    else if(q.k==='pairs'){q.L=qShuf(q.L);q.Rt=qShuf(q.Rt)}
    Q.push(q);
  });
  try{localStorage.setItem(QSEEN,JSON.stringify(seen))}catch(_){}
}
newExam();
const BKB=(a='back')=>`<button class="xi bk" data-a="${a}" type="button" aria-label="Back">${IC.back}Back</button>`;
const GEM=w=>`<svg viewBox="40 0 385 466" shape-rendering="geometricPrecision" style="width:${w*385/466}px;height:${w}px;display:block"><path d="M175 5L275 35L395 130L415 335L385 425L215 462L50 250Z" fill="#ff4a6d"/><path d="M275 35L205 205L210 232L285 350L412 335L275 35Z" fill="#ff617f"/><path d="M275 35L395 130L415 335L412 335Z" fill="#f993ac"/><path d="M50 250L210 232L285 350L215 462Z" fill="#ff335f"/><path d="M285 350L412 335L385 425L215 462Z" fill="#ff4a6d"/></svg>`;
const FLAME=(w,h)=>FLM('#f0243a','#ff9a3a',w,h);
const dots='<div class="xdots"><i></i><i></i><i></i></div>';
const MZ=()=>znHtml(92);
const nx=h=>`<div class="scr nx">${h}</div>`;
const btn=(t,a,o='')=>`<button class="xbtn ${o}" type="button" data-a="${a}">${t}</button>`;
const goT=(t,d=0)=>at(d,()=>go(IDX(t)));
const fx=(el,kf,o)=>el&&el.animate(kf,Object.assign({duration:350,easing:'cubic-bezier(.2,.9,.3,1)',fill:'both'},o));
const rise=(sel,d=0,st=60)=>$$(sel,R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:380,delay:d+i*st,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));

/* ================= 1. PLACEMENT EXAM ================= */
function qCur(){return Q[X.queue[X.q]]}
function xTop(){const n=Q.length+Object.keys(X.tries).filter(k=>X.tries[k]>0).length;return `<div class="xt">${BKB('quit')}<div class="xp"><i style="width:${Math.max(4,Math.min(100,X.done/Math.max(n,1)*100))}%"></i></div><div class="xcm">${X.combo>1?FLM('#e8a83a','#ffd37a',16,20)+X.combo:''}</div></div>`}
function exHtml(){
 return nx(`<div id="xtop"></div><div class="xb" id="xb"></div><div class="xbar" id="xbar"></div>`);
}
function exModeHtml(){
 const D=[['e','Easy','Warm up','#6fcf97'],['m','Medium','Balanced','#e8a83a'],['h','Hard','Challenge','#ff7a85']];
 return `<div class="xmode" role="radiogroup" aria-label="Exam difficulty">${D.map(([k,l,s,c])=>`<button type="button" class="xmd${QMODE===k?' on':''}" data-a="lvl" data-l="${k}" role="radio" aria-checked="${QMODE===k}" style="--c:${c}"><i>${k==='e'?'\u25CF':k==='m'?'\u25CF\u25CF':'\u25CF\u25CF\u25CF'}</i><b>${l}</b><small>${s}</small></button>`).join('')}</div>`;
}
function exListHtml(){
 return Q.map(q=>`<div class="xo xrow" style="border-bottom-width:2px;cursor:default"><span style="width:26px;height:26px;display:grid;place-items:center">${IC.sub[q.s]}</span><span style="flex:1">${q.s}</span><small class="xlv xlv-${q.lv}">${q.topic} · ${QLVNAME[q.lv]||'Medium'}</small></div>`).join('');
}
function exIntro(){
 $('#xtop').innerHTML=`<div class="xt">${BKB()}</div>`;$('#xbar').style.visibility='visible';
 $('#xb').innerHTML=`<div class="xz" style="margin-top:18px">${MZ()}<div class="xbub">Pick your level, then one quick question from each subject.</div></div>
 <div class="xmlab">Choose your level</div>${exModeHtml()}
 <div class="xl" id="xlist" style="margin-top:16px">${exListHtml()}</div>`;
 $('#xbar').innerHTML=btn('Start exam','start')+'<div style="text-align:center;font:600 12.5px var(--body);color:#6f7b86;margin-top:10px">Takes about 2 minutes. No pressure.</div>';
 rise('#xb .xz,#xb .xmlab,#xb .xmd,#xb .xo',60,60);fx($('#xbar'),[{transform:'translateY(40px)',opacity:0},{transform:'none',opacity:1}],{delay:380});
 hap('tick');
}
function exPickMode(b){
 const m=b.dataset.l;if(!m||m===QMODE)return;setExamMode(m);
 $$('.xmd',R).forEach(el=>{const on=el.dataset.l===m;el.classList.toggle('on',on);el.setAttribute('aria-checked',on)});
 b.animate([{transform:'scale(.92)'},{transform:'scale(1.05)'},{transform:'none'}],{duration:280,easing:'ease-out'});
 sfx.tick(m==='e'?0:m==='m'?2:4);hap('tick');
 const L=$('#xlist');if(L){L.innerHTML=exListHtml();$$('#xlist .xo',R).forEach((el,i)=>el.animate([{opacity:0,transform:'translateX(18px)'},{opacity:1,transform:'none'}],{duration:300,delay:i*45,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}))}
}
function exQ(){
 const q=qCur();X.sel=null;X.sheet=null;X.m=0;X.pm={};X.sl=null;X.sr=null;
 X.done=X.q;$('#xtop').innerHTML=xTop();
 let b=`<div class="xsub">${IC.sub[q.s]}${q.s} · ${q.topic}${X.tries[X.queue[X.q]]?' · Second try':''}</div>`;
 if(q.k==='mc')b+=`<h2 class="xh">${q.h}</h2><div class="xl">${q.opts.map((o,i)=>`<button class="xo" type="button" data-a="pick" data-j="${i}"><span class="xk">${i+1}</span>${o}</button>`).join('')}</div>`;
 if(q.k==='grid')b+=`<h2 class="xh">${q.h}</h2><div class="xg">${q.opts.map((o,i)=>`<button class="xo" type="button" data-a="pick" data-j="${i}">${o}</button>`).join('')}</div>`;
 if(q.k==='blank')b+=`<h2 class="xh">${q.h}</h2><div class="xs">${q.pre} <span class="xslot" id="xslot" data-a="unslot"></span> ${q.post}</div><div class="xbank">${q.bank.map((w,i)=>`<button class="xo" type="button" data-a="word" data-j="${i}">${w}</button>`).join('')}</div>`;
 if(q.k==='pairs')b+=`<h2 class="xh">${q.h}</h2><div class="xpr">${[0,1,2,3].map(i=>`<button class="xo" type="button" data-a="pl" data-v="${q.L[i]}">${q.L[i]}</button><button class="xo" type="button" data-a="pr" data-v="${q.Rt[i]}">${q.Rt[i]}</button>`).join('')}</div>`;
 $('#xb').innerHTML=b;
 $('#xbar').innerHTML=q.k==='pairs'?'':btn('Check','check').replace('<button','<button disabled');
 rise('#xb > *, #xb .xo',0,50);
}
function exCheck(){
 const q=qCur(),qi=X.queue[X.q];let ok,ans;
 if(q.k==='blank'){ok=X.sel===q.a;ans=q.pre+' '+q.a+' '+q.post}
 else if(q.k==='pairs'){ok=X.m<=1;ans=''}
 else{ok=X.sel===q.a;ans=q.opts[q.a]}
 X.tries[qi]=X.tries[qi]||0;
 if(q.k==='mc'||q.k==='grid'){$$('.xo',R).forEach((el,i)=>{el.style.pointerEvents='none';el.classList.remove('on');if(i===q.a)el.classList.add('ok');else if(i===X.sel)el.classList.add('bad')})}
 if(q.k==='blank'){$('#xslot').style.borderColor=ok?'#6fcf97':'#f0707a';$('#xslot').style.color=ok?'#8fe3b2':'#ff9aa2'}
 if(ok){X.combo++;X.best=Math.max(X.best,X.combo);X.xp+=10;if(X.res[q.s]===undefined)X.res[q.s]=1;X.ok++;sfx.right();hap(X.combo>=3?'hard':'success');if(X.combo>=3)at(180,()=>{sfx.cel();hap('heavy')})}
 else{X.combo=0;if(X.res[q.s]===undefined)X.res[q.s]=0;sfx.wrong();hap('buzz');
  if(!X.tries[qi]){X.tries[qi]=1;X.queue.push(qi)}}
 X.tot++;
 const P=['Great job!','Excellent!','Nice work!','Perfect!'];
 const ttl=ok?(X.combo>=3?X.combo+' in a row!':P[X.q%P.length]):'Not quite';
 const sh=document.createElement('div');sh.className='xsh '+(ok?'ok':'bad');
 sh.innerHTML=`<h3><span class="xc" style="background:${ok?'#6fcf97':'#f0707a'}">${ok?IC.ok:IC.no}</span>${ttl}</h3><p>${ok?q.why:(ans?'Correct answer: <b>'+ans+'</b><br>':'')+q.why}</p>${btn(X.q>=X.queue.length-1?'Finish':'Continue','next',ok?'g':'r')}`;
 R.appendChild(sh);$('#xbar').style.visibility='hidden';
 sh.animate([{transform:'translateY(100%)'},{transform:'translateY(-6px)',offset:.7},{transform:'none'}],{duration:380,easing:'ease-out'});
 X.done=X.q+1;$('#xtop').innerHTML=xTop();
 if(ok)burst(190,690,X.combo>=3?26:12,{up:true,colors:['#6fcf97','#c9b8c3','#e8a83a'],speed:300,fall:200,life:1000});
}
function exPlay(){
 Object.assign(X,{q:-1,queue:[0,1,2,3,4],sel:null,res:{},combo:0,best:0,xp:0,ok:0,tot:0,done:0,tries:{},t0:0});
 S.mute=false;exIntro();
 R.onclick=e=>{
  const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='back'){sfx.tick();hap('light');go(IDX('Intro flow'));return}
  if(a==='quit'){hap('medium');newExam();Object.assign(X,{q:-1,queue:[0,1,2,3,4],sel:null,res:{},combo:0,best:0,xp:0,ok:0,tot:0,done:0,tries:{}});const o=$('.xsh',R);if(o)o.remove();exIntro();return}
  if(a==='lvl'){exPickMode(b);return}
  if(a==='start'){X.q=0;X.t0=performance.now();sfx.whoosh(.4);hap('medium');exQ();return}
  const q=X.q>=0&&qCur();
  if(a==='pick'){const j=+b.dataset.j;X.sel=j;$$('.xo',R).forEach((el,i)=>el.classList.toggle('on',i===j));const c=$('[data-a=check]');c.disabled=false;sfx.tick(j);hap('tick');b.animate([{transform:'scale(.97)'},{transform:'none'}],{duration:160})}
  else if(a==='word'){const w=q.bank[+b.dataset.j];if(b.classList.contains('gh'))return;$$('.xbank .xo',R).forEach(el=>el.classList.remove('gh'));b.classList.add('gh');X.sel=w;const s=$('#xslot');s.textContent=w;s.classList.add('f');s.animate([{transform:'scale(.7)'},{transform:'scale(1.1)'},{transform:'none'}],{duration:240});$('[data-a=check]').disabled=false;sfx.pop();hap('light')}
  else if(a==='unslot'){if(X.sel==null)return;X.sel=null;const s=$('#xslot');s.textContent='';s.classList.remove('f');$$('.xbank .xo',R).forEach(el=>el.classList.remove('gh'));$('[data-a=check]').disabled=true;sfx.tick();hap('tick')}
  else if(a==='pl'){X.sl=b.dataset.v;$$('[data-a=pl]',R).forEach(el=>el.classList.toggle('on',el===b));sfx.tick();hap('tick')}
  else if(a==='pr'){if(!X.sl){sfx.tick(2);hap('tick');return}
   const l=$(`[data-a=pl][data-v="${X.sl}"]`,R);
   if(q.map[X.sl]===b.dataset.v){[l,b].forEach(el=>{el.classList.remove('on');el.classList.add('ok');at(380,()=>el.classList.add('dn'))});X.pm.n=(X.pm.n||0)+1;sfx.check(X.pm.n);hap('medium');X.sl=null;if(X.pm.n===4)at(520,exCheck)}
   else{X.m++;[l,b].forEach(el=>{el.classList.add('bad');at(420,()=>el.classList.remove('bad','on'))});X.sl=null;sfx.wrong();hap('buzz');b.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:240})}}
  else if(a==='check'){hap('medium');exCheck()}
  else if(a==='next'){
   const sh=$('.xsh',R);sh.animate([{transform:'none'},{transform:'translateY(100%)'}],{duration:240,fill:'forwards'});sfx.tick();hap('medium');
   if(X.q>=X.queue.length-1){at(220,()=>{sfx.whoosh(.5);go(IDX('Lesson complete'))});return}
   at(220,()=>{sh.remove();$('#xbar').style.visibility='visible';X.q++;exQ()})}
 };
}

/* ================= 2. LESSON COMPLETE ================= */
const SC={English:'#e8a83a',Physics:'#7fa8ff',Chemistry:'#6fcf97',Maths:'#c9b8c3',Biology:'#ff9aa2'};
function lcStats(){
 const acc=X.tot?Math.round(X.ok/X.tot*100):0,sec=Math.max(1,Math.round((performance.now()-X.t0)/1000)),tm=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
 const first=Object.values(X.res).filter(v=>v===1).length,miss=Math.max(0,X.tot-X.ok);
 const lab=acc>=90?'AMAZING':acc>=70?'GREAT':acc>=50?'GOOD':'KEEP GOING';
 const lvl=first>=5?'an Expert':first===4?'an Achiever':first===3?'a Learner':first===2?'an Explorer':'a Beginner';
 const head=acc>=90?'Perfect run!':acc>=70?'Great exam!':acc>=50?'Good start!':'Nice try!';
 return {acc,sec,tm,first,miss,lab,lvl,head,xp:X.xp,ok:X.ok}}
function lcHtml(){
 const R0=lcStats(),tm=R0.tm,acc=R0.acc;
 const md=QLVNAME[QMODE]||'Medium',mc=QMODE==='e'?'#6fcf97':QMODE==='h'?'#ff7a85':'#e8a83a';
 const C=2*Math.PI*52,tot=Math.max(1,R0.ok+R0.miss),okp=Math.round(R0.ok/tot*100);
 const stars=acc>=90?3:acc>=60?2:acc>0?1:0;
 const ST='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1 6.3 20.2l1.2-6.3L2.8 9.5l6.4-.8z"/></svg>';
 const rows=Q.map((q,i)=>{const v=X.res[q.s]===1;return `<div class="xsr${v?' ok':' bad'}" style="--i:${i};--sc:${SC[q.s]}"><span class="xsr-i">${IC.sub[q.s]}</span><div class="xsr-t"><b>${q.s}</b><small>${esc0(q.topic)} · ${QLVNAME[q.lv]||'Medium'}</small><div class="xsl"><div class="t"><i style="width:0;background:${SC[q.s]}" data-w="${v?100:40}"></i></div></div></div><em class="xsr-p">${v?'\u2713 Solid':'\u21BB Review'}</em></div>`}).join('');
 return nx(`<div class="xt">${BKB()}</div><div class="lc-glow"></div>
 <div class="xb lcb" style="top:64px;bottom:104px">
  <div class="lc-hero">${znHtml(104,'lcz')}
   <div class="lc-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="lc-tr"/><circle cx="60" cy="60" r="52" class="lc-pr" id="lcr" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${C.toFixed(1)}" data-c="${C.toFixed(1)}" data-p="${acc}"/></svg><div class="lc-rc"><b id="lac">0%</b><small>accuracy</small></div></div>
  </div>
  <div class="lc-stars">${[0,1,2].map(i=>`<span class="lc-st${i<stars?' on':''}" style="--k:${i}">${ST}</span>`).join('')}</div>
  <div id="lct" class="lc-h">${R0.head}</div>
  <div class="lc-s">You're ${R0.lvl}, ${nm()} <span class="lc-md" style="--mc:${mc}">${md} mode</span></div>
  <div class="xstat lc-stat">
   <div style="--c:#e8a83a"><small>TOTAL XP</small><b id="lxp">0</b></div>
   <div style="--c:#7fa8ff"><small>TIME</small><b>${tm}</b></div>
   <div style="--c:#c9b8c3"><small>${R0.lab}</small><b>${R0.first}/${Q.length}</b></div>
  </div>
  <div class="lc-split"><div class="lc-sh"><span><i class="g"></i>${R0.ok} correct</span><span><i class="r"></i>${R0.miss} ${R0.miss===1?'mistake':'mistakes'}</span></div><div class="lc-bar"><i class="g" data-w="${okp}"></i><i class="r" data-w="${100-okp}"></i></div></div>
  <div class="lc-sec">Your starting point</div>
  <div class="lc-rows">${rows}</div>
 </div>
 <div class="xbar">${btn('Claim XP','claim')}</div>`).replace('data-xp','');
}
function esc0(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function lcPlay(){
 S.mute=false;const R0=lcStats(),acc=R0.acc,xp=R0.xp,good=acc>=60;
 fx($('#lcz'),[{transform:'translateY(30px) scale(.6)',opacity:0},{transform:'translateY(-10px) scale(1.1)',offset:.6,opacity:1},{transform:'none',opacity:1}],{duration:600});
 fx($('.lc-ring'),[{transform:'scale(.4) rotate(-90deg)',opacity:0},{transform:'scale(1.06) rotate(8deg)',offset:.7,opacity:1},{transform:'none',opacity:1}],{duration:700,delay:120,easing:'cubic-bezier(.2,.9,.3,1)'});
 fx($('#lct'),[{transform:'translateY(16px) scale(.9)',opacity:0,filter:'blur(6px)'},{transform:'none',opacity:1,filter:'blur(0)'}],{duration:520,delay:380});
 fx($('.lc-s'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:420,delay:520});
 rise('.lc-stat>div',600,110);rise('.lc-split',950,0);rise('.lc-sec',1050,0);rise('.xsr',1150,110);
 E(0,null,'hard',playLC);
 sfx.whoosh(.5);
 // ring fills with the accuracy
 const rc=$('#lcr');if(rc){const C=+rc.dataset.c;rc.animate([{strokeDashoffset:C},{strokeDashoffset:C*(1-acc/100)}],{duration:1100,delay:450,easing:'cubic-bezier(.3,.8,.25,1)',fill:'forwards'})}
 // stars pop one by one with a rising chime
 $$('.lc-st.on',R).forEach((el,i)=>at(900+i*230,()=>{el.animate([{transform:'scale(0) rotate(-40deg)',opacity:0},{transform:'scale(1.35) rotate(8deg)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:460,easing:'ease-out',fill:'forwards'});tone(880+i*220,.22,{type:'triangle',g:.18});tone(1320+i*330,.18,{t:.04,g:.08});hap('light')}));
 at(500,()=>burst(190,150,good?40:18,{up:true,speed:340,fall:300,life:1500,colors:['#c9b8c3','#e8a83a','#7fa8ff','#6fcf97']}));
 if(acc>=90)at(1700,()=>burst(190,320,30,{up:true,speed:300,fall:260,life:1400,colors:['#ffd76a','#ffffff','#e8a83a']}));
 // XP and accuracy count up
 const t0=performance.now()+600;let last=-1;(function c(){const k=Math.min(1,(performance.now()-t0)/1000);if(k<0){requestAnimationFrame(c);return}const ek=1-Math.pow(1-k,3),n=Math.round(xp*ek),a=Math.round(acc*ek);const e=$('#lxp');if(!e)return;e.textContent='+'+n;$('#lac').textContent=a+'%';if(n!==last&&n%10===0){hap('tick');tone(600+n*3,.05,{type:'triangle',g:.06});last=n}if(k<1)requestAnimationFrame(c);else{hap('thud');sfx.slam&&sfx.slam();e.animate([{transform:'scale(1.35)'},{transform:'none'}],{duration:320,easing:'ease-out'})}})();
 // correct / mistakes split bar
 $$('.lc-bar i',R).forEach((el,i)=>el.animate([{width:'0%'},{width:el.dataset.w+'%'}],{duration:800,delay:1000+i*120,easing:'cubic-bezier(.3,.8,.3,1)',fill:'forwards'}));
 // subject rows: bar fills, status stamps in, a soft note for each
 $$('.xsr',R).forEach((row,i)=>{const ok=row.classList.contains('ok'),bar=row.querySelector('.t i'),p=row.querySelector('.xsr-p');
  if(bar)bar.animate([{width:'0%'},{width:bar.dataset.w+'%'}],{duration:700,delay:1250+i*110,easing:'cubic-bezier(.3,.8,.3,1)',fill:'forwards'});
  if(p)p.animate([{transform:'scale(.3)',opacity:0},{transform:'scale(1.15)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:380,delay:1650+i*110,easing:'ease-out',fill:'backwards'});
  at(1650+i*110,()=>{ok?tone(660+i*90,.14,{type:'sine',g:.12}):tone(300,.12,{type:'triangle',g:.08});hap(ok?'tick':'light')})});
 at(1650+Q.length*110+150,()=>{good?(sfx.chime?sfx.chime():sfx.sparkle&&sfx.sparkle()):(sfx.pop&&sfx.pop())});
 R.onclick=e=>{if(e.target.closest('[data-a=back]')){hap('light');go(IDX('Placement exam'));return}if(!e.target.closest('[data-a=claim]'))return;hap('heavy');sfx.coin&&sfx.coin();go(IDX('Starting score'))};
}

/* ================= 3. STREAK DAY 1 ================= */
function sdHtml(){
 const L=['Mo','Tu','We','Th','Fr','Sa','Su'];
 return nx(`<div class="xt">${BKB()}</div><div class="xq">Can you practice everyday?</div><div class="xgl" id="sg"></div><div class="xrg" id="sr1"></div><div class="xrg" id="sr2"></div>
 <div class="xfl" id="sf"><div id="sfg">${FLM('#5a666f','#3f4952',150,180)}</div><div id="sfl" style="opacity:0">${FLAME(150,180)}</div></div>
 <div class="xnum" id="sn">1</div><div class="xday" id="sd">day streak</div>
 <div class="xwk" id="sw">${L.map((l,i)=>`<div class="${i===0?'t':''}">${l}<i id="sk${i}">${i===0?'':''}</i></div>`).join('')}</div>
 <div class="xcap" id="sc">Come back tomorrow to keep your streak alive, ${nm()}.</div>
 <div class="xbar" id="sb" style="opacity:0">${btn("I'm committed",'go')}</div>`);
}
function sdPlay(){
 S.mute=false;const fl=$('#sf'),g=$('#sfg'),l=$('#sfl');
 
 fx(fl,[{opacity:0,transform:'translateY(40px) scale(.8)'},{opacity:1,transform:'none'}],{duration:400});
 E(0,()=>playClip(0),'tick');
 /* squash, ignite, leap */
 at(420,()=>{fx(fl,[{transform:'scale(1,1)'},{transform:'scale(1.4,.55)'}],{duration:180,easing:'ease-in'});hap('medium')});
 at(600,()=>{g.style.opacity=0;l.style.opacity=1;hap('hard');fx($('#sg'),[{opacity:0},{opacity:1}],{duration:500});
  fx(fl,[{transform:'scale(1.4,.55)'},{transform:'translateY(-44px) scale(.8,1.2)',offset:.55},{transform:'translateY(-36px) scale(.85,1.1)'}],{duration:520,easing:'cubic-bezier(.2,.8,.3,1)'});
  burst(190,290,22,{colors:['#ff9a3a','#f0243a','#ffd37a'],round:true,size:[3,6],speed:200,fall:80,life:1100})});
 at(1200,()=>{const n=$('#sn');fx(n,[{opacity:0,transform:'translateY(50px) scale(.5)'},{opacity:1,transform:'translateY(-8px) scale(1.15)',offset:.7},{opacity:1,transform:'none'}],{duration:520});hap('success')});
 /* slam down */
 at(1750,()=>{fx(fl,[{transform:'translateY(-36px) scale(.85,1.1)'},{transform:'translateY(20px) scale(1.5,.5)',offset:.55},{transform:'translateY(-14px) scale(.9,1.2)',offset:.8},{transform:'none'}],{duration:620,easing:'ease-in'});
  at(330,()=>{hap('thud');
   ['sr1','sr2'].forEach((id,i)=>fx($('#'+id),[{opacity:.9,transform:'scale(1)'},{opacity:0,transform:'scale(18)'}],{duration:900,delay:i*160,easing:'ease-out'}));
   burst(190,330,18,{colors:['#ff8a3a','#c9b8c3'],round:true,size:[3,6],speed:260,fall:120,life:900})});
  at(0,()=>{const sr=$('#sr1').style;sr.top='330px'});$('#sr2').style.top='330px'});
 at(2300,()=>{fx($('#sd'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:350});hap('light')});
 at(2600,()=>{fx($('#sw'),[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:400});$$('#sw div',R).forEach((d,i)=>fx(d,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}],{duration:260,delay:i*50}))});
 at(3100,()=>{const k=$('#sk0');k.classList.add('on');k.innerHTML=IC.tk;fx(k,[{transform:'scale(.2)'},{transform:'scale(1.4)',offset:.6},{transform:'scale(1)'}],{duration:380});hap('heavy');burst(60,540,12,{colors:['#ff8a3a','#ffd37a'],round:true,size:[3,5],speed:150,fall:100,life:800})});
 at(3500,()=>{fx($('#sc'),[{opacity:0},{opacity:1}],{duration:400});fx($('#sb'),[{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'none'}],{duration:420});hap('success')});
 R.onclick=e=>{if(e.target.closest('[data-a=back]')){hap('light');go(IDX('Lesson complete'));return}if(!e.target.closest('[data-a=go]'))return;hap('heavy');go(IDX('Streak goal'))};
}

/* ================= 4. STREAK GOAL ================= */
const GOALS=[[3,'Casual','3 days a week'],[7,'Regular','Every day for a week'],[14,'Serious','Two weeks, no breaks'],[30,'Intense','A full month of study']];
const GC={3:{c:'#ffc42e',h:'#fff1a8',s:'#ffc42e',d:'#c4952a',g:'255,196,46'},7:{c:'url(#gf7)',h:'#ff9ac0',s:'#ff4f86',d:'#b8315c',g:'244,63,110'},14:{c:'#ff6fc0',h:'#ffc8ea',s:'#ff6fc0',d:'#b8448c',g:'255,111,192'},30:{c:'#ff8a1f',h:'#ffd27a',s:'#ff8a1f',d:'#c25f0a',g:'255,138,31'}};
const FLC=(n,w,h)=>{const o=GC[n];let t=FLM(o.c,o.h,w,h);if(n===7)t=t.replace('<path','<defs><linearGradient id="gf7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7ab0"/><stop offset=".5" stop-color="#ff4f86"/><stop offset="1" stop-color="#f0334f"/></linearGradient></defs><path');return t};
function sgHtml(){
 return nx(`<div class="xt">${BKB()}</div><div class="xgl2" id="gg"></div>
 <div class="xflw" id="gfw">${[3,7,14,30].map(n=>`<div class="gfl" data-n="${n}" style="opacity:${n===X.goal?1:0}">${FLC(n,130,156)}</div>`).join('')}</div>
 <div class="xgt"><b id="gtt">${X.goal}-day streak goal</b><small>Pick a goal. You can change it any time.</small></div>
 <div class="xl xgls">${GOALS.map(([n,t,d])=>`<button class="xo xgo${n===X.goal?' on':''}" type="button" data-a="goal" data-n="${n}"><span class="xgn">${n}</span><span><b>${t}</b><small>${d}</small></span>${n===7?'<em>Popular</em>':''}</button>`).join('')}</div>
 <div class="xbar">${btn(tr('Commit to '+X.goal+' days'),'go','fc')}</div>`);
}
function setFlame(n,anim){
 const o=GC[n];X.goal=n;
 $$('.gfl',R).forEach(el=>{const on=+el.dataset.n===n;fx(el,[{opacity:on?0:1},{opacity:on?1:0}],{duration:anim?280:0})});
 $('#gg').style.background=`radial-gradient(circle,rgba(${o.g},.32),transparent 65%)`;
 R.style.setProperty('--gc',o.s);R.style.setProperty('--gd',o.d);
 $('#gtt').style.color=o.s;$('#gtt').textContent=n+'-day streak goal';
 if(anim){fx($('#gfw'),[{transform:'scale(1,1)'},{transform:'scale(1.35,.6)',offset:.18},{transform:'translateY(-26px) scale(.82,1.3)',offset:.45},{transform:'scale(1.1,.92)',offset:.72},{transform:'none'}],{duration:640,easing:'ease-out'});
  fx($('#gg'),[{transform:'scale(.7)',opacity:.4},{transform:'scale(1.1)',opacity:1,offset:.5},{transform:'none',opacity:1}],{duration:640});
  burst(190,150,16,{colors:[o.s,o.h],round:true,size:[3,6],speed:200,fall:60,life:900});hap('heavy')}
}
function sgPlay(){
 S.mute=false;setFlame(X.goal,false);rise('.xgt,.xgls .xo',100,70);
 fx($('#gfw'),[{opacity:0,transform:'translateY(30px) scale(.7)'},{opacity:1,transform:'none'}],{duration:480});hap('light');
 R.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='back'){hap('light');go(IDX('Streak: day 1'))}
  else if(a==='goal'){const n=+b.dataset.n;$$('.xgo',R).forEach(el=>el.classList.toggle('on',el===b));$('[data-a=go]').textContent=tr('Commit to '+n+' days');b.animate([{transform:'scale(.96)'},{transform:'none'}],{duration:180});setFlame(n,true)}
  else if(a==='go'){hap('hard');burst(190,700,16,{up:true,colors:[GC[X.goal].s,GC[X.goal].h],speed:300,fall:200});at(260,()=>go(IDX('Gems reward')))}};
}
/* ----- gems reward ----- */
function calcGems(){const c=Object.values(X.res).filter(v=>v===1).length,acc=X.tot?X.ok/X.tot:0;return Math.max(10,Math.round((10+c*4+(acc>=.9?10:acc>=.7?5:0))/5)*5)}
function gmHtml(){
 X.gems=calcGems();
 return nx(`<div class="xt">${BKB()}</div>
 <div class="gmc" id="gmc" style="opacity:0"><small>+${X.gems}</small><span><i id="gmi">${GEM(24)}</i><b id="gmn">0</b></span></div>
 <div class="xbub nob xtl" id="gmb" style="position:absolute;left:34px;right:34px;top:250px;opacity:0;font-size:20px;line-height:1.5">${tr(X.gems>=30?'Great exam! Here are':'Here are')} <b style="color:#ff4a6d">${tr(X.gems+' gems')}</b> ${tr('to start you off!')}</div>
 <div class="gmz"><div class="gmf" id="gmf">${FLC(X.goal,128,154)}</div>${znHtml(158,'gmzu')}</div>`);
}
function rel(el){const r=R.getBoundingClientRect(),t=el.getBoundingClientRect(),k=r.width/R.offsetWidth;return[(t.left-r.left+t.width/2)/k,(t.top-r.top+t.height/2)/k]}
function gmPlay(){
 S.mute=false;const N=8,my=RUN;
 fx($('#gmf'),[{opacity:0,transform:'translateY(40px) scale(.7)'},{opacity:1,transform:'none'}],{duration:520,delay:100});
 fx($('#gmzu'),[{opacity:0,transform:'translateY(50px) scale(.6)'},{opacity:1,transform:'translateY(-14px) scale(1.08)',offset:.65},{opacity:1,transform:'none'}],{duration:620,delay:250});
 fx($('#gmb'),[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.05)',offset:.7},{opacity:1,transform:'none'}],{duration:480,delay:650});
 at(300,()=>hap('light'));at(700,()=>hap('medium'));
 at(1500,()=>{fx($('#gmc'),[{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'none'}],{duration:320});hap('tick');
  const[tx,ty]=rel($('#gmi')),sx=215,sy=480;
  for(let k=0;k<N;k++){const g=document.createElement('i');g.className='gmg';g.innerHTML=GEM(24);R.appendChild(g);
   const ox=sx+(Math.random()*120-60),oy=sy-(70+Math.random()*80);
   const a=g.animate([{transform:`translate(${sx-12}px,${sy-14}px) scale(.3)`,opacity:0},{transform:`translate(${ox-12}px,${oy-14}px) scale(1.15) rotate(${k*30}deg)`,opacity:1,offset:.35},{transform:`translate(${tx-12}px,${ty-14}px) scale(.7)`,opacity:1}],{duration:900,delay:k*120,easing:'cubic-bezier(.4,.1,.3,1)',fill:'both'});
   a.onfinish=()=>{g.remove();if(my!==RUN||!$('#gmn'))return;const v=Math.round((k+1)/N*X.gems);$('#gmn').textContent=v;sfx.gem();hap('light');$('#gmi').animate([{transform:'scale(1.35)'},{transform:'none'}],{duration:200});if(k===N-1){hap('success');at(500,()=>{hap('heavy');fx($('#gmc'),[{opacity:1},{opacity:0,transform:'translateY(-10px)'}],{duration:400});at(1000,()=>go(IDX('Save progress')))})}}}
 });
 R.onclick=e=>{if(e.target.closest('[data-a=back]')){hap('light');go(IDX('Streak goal'))}};
}
/* ----- save progress ----- */
function spHtml(){
 return nx(`<div class="xt">${BKB()}</div><div style="position:absolute;left:0;right:0;top:225px;text-align:center"><div class="xbub nob xtl" id="spb" style="display:inline-block;margin:0 34px;font-size:19px;line-height:1.5;text-align:left">Don't lose your progress! Let's create a profile.</div><div style="height:28px"></div>${znHtml(160,'spz').replace('data-fm="idle"','data-fm="write"').replace('zn|160|spz','zn|160|spz|write')}</div><div class="xbar">${btn('Continue','go')}</div>`);
}
function spPlay(){
 S.mute=false;
 fx($('#spz'),[{opacity:0,transform:'translateY(60px) scale(.5)'},{opacity:1,transform:'translateY(-14px) scale(1.1)',offset:.65},{opacity:1,transform:'none'}],{duration:620});
 fx($('#spb'),[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.05)',offset:.7},{opacity:1,transform:'none'}],{duration:480,delay:300});
 fx($('.xbar',R),[{opacity:0,transform:'translateY(40px)'},{opacity:1,transform:'none'}],{duration:420,delay:600});
 at(250,()=>hap('medium'));at(650,()=>hap('light'));
 R.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='back'){hap('light');go(IDX('Gems reward'))}else{hap('heavy');go(IDX('Create profile'))}};
}

/* ================= 5. CREATE PROFILE ================= */
function cpRender(){
 const s=X.st;$('#cpbar').style.width=((s+1)/5*100)+'%';
 let b='',bar='';
 if(s===0){b=`<h2 class="xh">How old are you?</h2><input class="xin" id="cin" inputmode="numeric" maxlength="2" placeholder="Age" value="${X.age}" style="font:700 28px var(--display);text-align:center;height:68px"><div class="xnote" style="position:static;margin-top:10px">We use your age to keep StudyOS right for you. It never appears on your profile.</div>`;bar=btn('Continue','n').replace('<button','<button id="cnx"')}
 if(s===1){b=`<h2 class="xh">Create your profile to save your progress</h2><button class="xg1" type="button" data-a="goog">${IC.g}CONTINUE WITH GOOGLE</button><button class="xg1" type="button" data-a="mail">${IC.mail}CONTINUE WITH EMAIL</button>${opts.startAt?'':'<div class="xor">OR</div><button class="xbtn sec" type="button" data-a="skip" style="margin:0">Maybe later</button>'}`}
 if(s===2){b=`<h2 class="xh">What's your email?</h2><input class="xin" id="cin" type="email" placeholder="Email" autocomplete="off" value="${X.email}">`;bar=btn('Continue','n').replace('<button','<button id="cnx"')}
 if(s===3){b=`<h2 class="xh">Create a password</h2><input class="xin" id="cin" type="password" placeholder="Password" value="${X.pw}"><div class="xrule" id="r1"><i></i>At least 8 characters</div><div class="xrule" id="r2"><i></i>Contains a number</div>`;bar=btn('Continue','n').replace('<button','<button id="cnx"')}
 if(s===4){b=`<h2 class="xh">What is your name?</h2><input class="xin" id="cin" placeholder="First name" autocomplete="off" value="${X.first||U.name}"><input class="xin" id="cin2" placeholder="Last name (optional)" autocomplete="off" value="${X.last}">`;bar=btn('Create profile','n').replace('<button','<button id="cnx"')}
 const body=$('#cpb');body.innerHTML=b;$('#cpbar2').innerHTML=bar;
 body.animate([{opacity:0,transform:'translateX(24px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});
 cpOK();const i=$('#cin');if(i&&s!==1&&s!==0)setTimeout(()=>i.focus&&i.focus({preventScroll:true}),320);
}
function cpOK(){const b=$('#cnx');if(!b)return;const s=X.st;let ok=false;
 if(s===0){const v=+($('#cin').value);ok=v>=5&&v<=99;X.age=$('#cin').value}
 if(s===2){X.email=$('#cin').value.trim();ok=/^\S+@\S+\.\S+$/.test(X.email)}
 if(s===3){X.pw=$('#cin').value;const a=X.pw.length>=8,c=/\d/.test(X.pw);[['r1',a],['r2',c]].forEach(([id,v])=>{const e=$('#'+id);e.classList.toggle('y',v);e.firstChild.innerHTML=v?IC.tk:''});ok=a&&c}
 if(s===4){X.first=$('#cin').value;X.last=$('#cin2').value;ok=X.first.trim().length>0}
 b.disabled=!ok}
function cpHtml(){return nx(`<div class="xt">${BKB()}<div class="xp"><i id="cpbar" style="width:20%"></i></div></div><div class="xb" id="cpb"></div><div class="xbar" id="cpbar2" style="padding-bottom:54px"></div><div class="xerr" id="cperr"></div><div class="xnote">By continuing, you agree to our Terms and Privacy Policy.</div>`)}
function cpPlay(){
 S.mute=false;X.st=0;cpRender();hap('light');
 R.oninput=e=>{if(e.target.matches('.xin')){cpOK();hap('tick')}};
 R.onclick=e=>{const b=e.target.closest('[data-a],#cnx');if(!b)return;const a=b.dataset.a||'n';
  if(a==='back'){sfx.tick();hap('light');if(X.st===0){if(opts.startAt)opts.onBack&&opts.onBack();else go(IDX('Save progress'))}else{X.st=(X.st===4&&X.google)?1:X.st-1;cpRender()}}
  else if(a==='goog'){hap('medium');if(X.busy)return;X.busy=1;b.style.opacity=.6;Promise.resolve(opts.google&&opts.google()).then(r=>{X.busy=0;b.style.opacity=1;if(r&&r.ok){X.google=1;X.email=r.email||'';if(r.name)X.first=r.name.split(' ')[0];hap('success');go(IDX('Find friends'))}else if(r&&r.error){const e=$('#cperr');if(e)e.textContent=r.error}}).catch(()=>{X.busy=0;b.style.opacity=1})}
  else if(a==='mail'){sfx.pop();hap('medium');X.google=0;X.st=2;cpRender()}
  else if(a==='skip'){hap('light');if(opts.guest)opts.guest({x:X,score:X.score,gems:X.gems,intro:{name:U.name,answers:U.sel,examDate:''}});else{X.google=0;X.st=2;cpRender()}}
  else if(a==='gpick'){sfx.check();hap('heavy');$('.xscr',R).remove();$('.xdlg',R).remove();X.st=4;cpRender()}
  else if(a==='n'){if(b.disabled)return;sfx.check();hap('medium');
   if(X.st===4){const lbl=b.textContent;const ee=$('#cperr');if(ee)ee.textContent='';b.innerHTML='<span class="xdots" style="height:20px;gap:8px"><i style="background:#8d7c88"></i><i style="background:#8d7c88"></i><i style="background:#8d7c88"></i></span>';b.disabled=true;b.style.background='#c9b8c3';hap('light');const t0=performance.now();
    Promise.resolve(opts.register({name:(X.first.trim()+' '+X.last.trim()).trim(),email:X.email,password:X.pw,age:X.age})).then(r=>{const w=Math.max(0,900-(performance.now()-t0));at(w,()=>{if(r&&r.ok){hap('success');go(IDX('Find friends'))}else{hap('buzz');b.disabled=false;b.textContent=lbl;b.style.background='';const e2=$('#cperr');if(e2)e2.textContent=(r&&r.error)||'Could not create your profile. Please try again.';if(r&&/email|account/i.test(r.error||'')){X.st=2;cpRender();const e3=$('#cperr');if(e3)e3.textContent=r.error}}})}).catch(()=>{b.disabled=false;b.textContent=lbl;b.style.background='';const e2=$('#cperr');if(e2)e2.textContent='Network problem. Please try again.'});return}
   X.st++;cpRender()}};
}
function gSheet(){
 const s=document.createElement('div');s.className='xscr';const d=document.createElement('div');d.className='xdlg';d.style.top='290px';
 d.innerHTML=`<h4>Choose an account</h4><p>to continue to StudyOS</p><div class="xfr" style="padding:10px 18px;text-align:left"><span class="av" style="background:#c9b8c3">A</span><span><b>${nm()}</b><small>aisha.study@gmail.com</small></span></div><button type="button" data-a="gpick">Continue as ${nm()}</button>`;
 R.appendChild(s);R.appendChild(d);d.animate([{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'none'}],{duration:240});
}

/* ================= 5b. STARTING SCORE (from the exam) ================= */
function calcScore(){const c=Object.values(X.res).filter(v=>v===1).length,acc=X.tot?X.ok/X.tot:0;return Math.max(20,Math.min(150,Math.round(25+c*18+acc*30+(X.best>=3?5:0))))}
function scTier(sc){return sc>=130?['Expert','#ffcc4d']:sc>=110?['Strong','#6fcf97']:sc>=80?['Rising','#7fa8ff']:sc>=50?['Building','#e8a83a']:['Starter','#c9b8c3']}
function scHtml(){
 const sc=calcScore(),[tier,tc]=scTier(sc),ok=X.ok||0,tot=X.tot||0,acc=tot?Math.round(ok/tot*100):0,md=(typeof QLVNAME!=='undefined'&&QLVNAME[QMODE])||'Medium';
 const goals=[50,80,110,130,160],nxt=goals.find(g=>g>sc)||160,prev=[0,...goals].filter(g=>g<=sc).pop()||0,np=Math.round((sc-prev)/Math.max(1,nxt-prev)*100);
 const ticks=Array.from({length:17},(_,i)=>{const ang=(135+i*270/16)*Math.PI/180,r1=i%4===0?118:122,r2=128;return `<line x1="${(150+r1*Math.cos(ang)).toFixed(1)}" y1="${(150+r1*Math.sin(ang)).toFixed(1)}" x2="${(150+r2*Math.cos(ang)).toFixed(1)}" y2="${(150+r2*Math.sin(ang)).toFixed(1)}" class="sct${i%4===0?' big':''}" style="--k:${i}"/>`}).join('');
 const sp=Array.from({length:10},(_,i)=>`<i style="--k:${i};--a:${i*36}deg"></i>`).join('');
 return `<div class="scr ip scx"><div class="ipt"><button class="ipb" type="button" data-a="back" aria-label="Back" style="visibility:visible"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="ipbt">Back</span></button></div><div class="ipm"><div class="ipz">${znHtml(92)}</div><div class="ibub" id="scb"></div></div>
 <div class="ipbody scb2"><div class="scw" style="--tc:${tc}">
  <div class="sc-halo"></div><div class="sc-sp">${sp}</div>
  <svg class="sc-g" viewBox="0 0 300 300" aria-hidden="true"><defs><linearGradient id="scgr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7fa8ff"/><stop offset=".5" stop-color="var(--mauve,#c9b8c3)"/><stop offset="1" stop-color="${tc}"/></linearGradient></defs>
   <path d="M59.5 240.5A128 128 0 1 1 240.5 240.5" fill="none" class="sc-tr" pathLength="100"/>
   <path d="M66.6 233.4A118 118 0 1 1 233.4 233.4" fill="none" stroke="url(#scgr)" stroke-width="20" stroke-linecap="round" class="scarc" pathLength="100" stroke-dasharray="0 100"/>
   ${ticks}<circle r="10" class="sc-dot" cx="66.6" cy="233.4"/></svg>
  <div class="sc-c"><svg width="30" height="30" viewBox="0 0 40 32" class="sc-cap"><path d="M20 2L2 10l18 8 18-8z" fill="currentColor"/><path d="M9 15v8c0 3 5 6 11 6s11-3 11-6v-8l-11 5z" fill="currentColor" opacity=".7"/></svg><b class="scn">0</b><small>out of 160</small><span class="sc-tier">${tier}</span></div>
 </div>
 <div class="sc-chips"><div style="--c:#6fcf97"><b>${ok}/${tot||5}</b><small>Correct</small></div><div style="--c:#7fa8ff"><b>${acc}%</b><small>Accuracy</small></div><div style="--c:#e8a83a"><b>${md}</b><small>Level</small></div></div>
 <div class="sc-nx"><div class="sc-nxh"><span>Next goal</span><b>Score ${nxt}</b></div><div class="sc-nxb"><i data-w="${Math.max(4,Math.min(100,np))}"></i></div><small>${sc>=160?'Top score! Keep it up every day.':(nxt-sc)+' points to go. Study daily to climb.'}</small></div>
 </div><div class="bar" style="display:flex"><button class="btn" type="button" data-a="cta">CONTINUE</button></div></div>`}
function scPlay(){
 S.mute=false;const sc=calcScore();X.score=sc;const my=RUN;
 const say=sc>=110?`You're starting strong at Score ${sc}!`:sc>=70?`Based on your exam, you start at Score ${sc}!`:`Your exam shows you start at Score ${sc}. Let's grow it together!`;
 U.tok++;typeIn($('#scb',R),tr(say).replace(String(sc),'<b style="color:#fff">'+sc+'</b>'),U.tok,$('.zn',R));at(900,()=>znSet($('.zn',R),sc>=110?'success':sc>=70?'greet':'explain'));
 const m=$('.ipm .zn',R);fx(m,[{transform:'translateY(16px) scale(.8)',opacity:.4},{transform:'translateY(-6px) scale(1.05)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:520});
 fx($('#scb',R),[{opacity:0,transform:'scale(.7)'},{opacity:1,transform:'none'}],{duration:420,delay:120});
 fx($('.scw',R),[{opacity:0,transform:'scale(.6) rotate(-25deg)'},{opacity:1,transform:'scale(1.04) rotate(3deg)',offset:.7},{opacity:1,transform:'none'}],{duration:760,delay:200,easing:'cubic-bezier(.2,.9,.3,1)'});
 $$('.sc-chips>div',R).forEach((el,i)=>fx(el,[{opacity:0,transform:'translateY(24px) scale(.9)'},{opacity:1,transform:'none'}],{duration:460,delay:1500+i*120}));
 fx($('.sc-nx',R),[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:460,delay:1900});
 sfx.whoosh&&sfx.whoosh(.4);
 const arc=$('.scarc',R),n=$('.scn',R),dot=$('.sc-dot',R),k1=sc/160,D0=1600;
 arc.animate([{strokeDasharray:'0 100'},{strokeDasharray:(k1*100)+' 100'}],{duration:D0,delay:450,easing:'cubic-bezier(.3,.1,.2,1)',fill:'forwards'});
 // the glowing dot rides the end of the arc; ticks light up as it passes; a rising tone plays
 const ticks=$$('.sct',R);let lit=-1;
 const t0=performance.now()+450;(function cnt(t){if(my!==RUN||!n.isConnected)return;const k=Math.min(1,Math.max(0,(t-t0)/D0)),e=1-Math.pow(1-k,3),v=e*k1;
  n.textContent=Math.round(sc*e);
  const ang=(135+v*270)*Math.PI/180;if(dot){dot.setAttribute('cx',(150+118*Math.cos(ang)).toFixed(1));dot.setAttribute('cy',(150+118*Math.sin(ang)).toFixed(1));dot.style.opacity=k>0?1:0}
  const want=Math.floor(v*16+.0001);while(lit<want&&lit<16){lit++;const tk=ticks[lit];if(tk)tk.classList.add('on');if(lit%2===0){tone(420+lit*45,.06,{type:'triangle',g:.08});hap('tick')}}
  if(k<1)requestAnimationFrame(cnt);
  else{sfx.chime&&sfx.chime();hap('success');const w=$('.scw',R);if(w)w.classList.add('done');
   n.animate([{transform:'scale(1.3)'},{transform:'scale(.95)'},{transform:'none'}],{duration:480,easing:'ease-out'});
   const tr0=$('.sc-tier',R);if(tr0)tr0.animate([{opacity:0,transform:'translateY(8px) scale(.6)'},{opacity:1,transform:'scale(1.15)',offset:.6},{opacity:1,transform:'none'}],{duration:480,fill:'forwards'});
   try{const bb=$('.scw',R).getBoundingClientRect(),hb=R.getBoundingClientRect(),K=(hb.width||360)/360;burst((bb.left-hb.left+bb.width/2)/K,(bb.top-hb.top+bb.height/2)/K,sc>=110?40:22,{up:true,speed:320,fall:260,life:1400,colors:['#c9b8c3','#e8a83a','#7fa8ff','#6fcf97','#ffcc4d']})}catch(_){}
   if(sc>=110)at(260,()=>{tone(1319,.18,{g:.12});tone(1760,.26,{t:.08,g:.1})});
   const nb=$('.sc-nxb i',R);if(nb)nb.animate([{width:'0%'},{width:nb.dataset.w+'%'}],{duration:900,delay:500,easing:'cubic-bezier(.3,.8,.3,1)',fill:'forwards'});
  }})(performance.now());
 R.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='back'){hap('light');go(IDX('Lesson complete'))}else{hap('heavy');sfx.pop&&sfx.pop();go(IDX('Streak: day 1'))}};
}
SCREENS.push({t:'Starting score',d:'Score from the exam',next:'Streak: day 1',spec:{m:'Gauge fills to the score worked out from the exam.',h:'Success when the number lands.',s:'Chime.'},html:scHtml,play:scPlay});

/* ================= 6. FIND FRIENDS ================= */
const FCOL=['#e8a83a','#7fa8ff','#6fcf97','#ff9aa2','#c9b8c3'];
const esc=t=>String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ffHtml(){return nx(`<div id="ffb" class="xhm"></div>`)}
function ffRender(){
 const el=$('#ffb',R),F=X.ff;
 const bubble=t=>`<div class="xz" style="margin:70px 18px 0">${MZ()}<div class="xbub">${t}</div></div>`;
 const err=F.err?`<div class="xerr" style="bottom:250px;left:20px;right:20px;text-align:center">${esc(F.err)}</div>`:'';
 if(F.st==='home')el.innerHTML=bubble('Study is better with friends! See who you know is already here, or invite someone.')+err+`<div class="xbar"><button class="xbtn" type="button" data-a="contacts">Find friends from contacts</button><button class="xbtn sec" type="button" data-a="invite">Invite friends</button><button class="xbtn sec" type="button" data-a="later">${F.shared?'Continue':'Maybe later'}</button></div>`;
 else if(F.st==='load')el.innerHTML=bubble('Looking through your contacts...')+`<div style="position:absolute;left:0;right:0;top:300px;text-align:center">${dots}</div>`;
 else if(F.st==='none')el.innerHTML=bubble(F.denied?'Contacts access is off. You can turn it on in your phone settings, or invite friends with a link.':'None of your contacts are on StudyOS yet. Invite them and study together!')+err+`<div class="xbar"><button class="xbtn" type="button" data-a="invite">Invite friends</button><button class="xbtn sec" type="button" data-a="later">${F.shared?'Continue':'Maybe later'}</button></div>`;
 else if(F.st==='list'){const sent=F.list.filter(f=>f.relation==='sent'||f.relation==='friends').length;el.innerHTML=`<div class="xb xlist"><h2 class="xh" style="margin-top:56px">These friends are already on StudyOS</h2>${F.list.map((f,i)=>{const rel=F.busyIds&&F.busyIds.has(f.id)?'busy':(f.relation||'none');const lbl=rel==='friends'?'Friends':rel==='sent'?'Requested':rel==='incoming'?'Accept':'+ Send Request';return `<div class="xfr"><span class="av" style="background:${FCOL[i%5]}">${f.picture?`<img src="${esc(f.picture)}" alt="" referrerpolicy="no-referrer">`:esc((f.name||'?')[0].toUpperCase())}</span><span class="xfn"><b>${esc(f.name)}</b><small>${esc(f.email)}</small></span><button type="button" class="xrq${rel==='sent'||rel==='friends'?' done':''}" data-a="req" data-i="${i}" ${rel==='busy'||rel==='sent'||rel==='friends'?'disabled':''}>${rel==='busy'?'<span class="xdots" style="height:14px;gap:5px"><i style="background:currentColor"></i><i style="background:currentColor"></i><i style="background:currentColor"></i></span>':lbl}</button></div>`}).join('')}</div>${err}<div class="xbar"><button class="xbtn" type="button" data-a="add">${sent?'Done':'Skip for now'}</button><button class="xbtn sec" type="button" data-a="invite">Invite more friends</button></div>`}
}
function ffPlay(){
 S.mute=false;X.ff={st:'home',list:[],sel:new Set(),shared:false,err:'',denied:false};ffRender();rise('.xz',100);rise('.xbar',300);
 fx($('.xz img',R),[{transform:'translateY(14px) scale(.8)'},{transform:'none'}],{duration:480});hap('tick');
 const my=RUN,F=X.ff;
 R.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='later'){hap('light');go(IDX('Profile created'))}
  else if(a==='req'){const i=+b.dataset.i,f=F.list[i];if(!f||b.disabled)return;hap('medium');
   F.busyIds=F.busyIds||new Set();F.busyIds.add(f.id);F.err='';ffRender();
   let r;try{r=await (opts.sendRequest&&opts.sendRequest(f.id))}catch(err){r={ok:false,error:'Could not send the request.'}}
   F.busyIds.delete(f.id);if(my!==RUN)return;
   if(r&&r.ok){f.relation=r.status==='friends'?'friends':'sent';hap('success')}else{F.err=(r&&r.error)||'Could not send the request.';hap('buzz')}
   ffRender()}
  else if(a==='add'){hap('heavy');X.addedFriends=[];go(IDX('Profile created'))}
  else if(a==='invite'){hap('medium');if(F.busy)return;F.busy=1;F.err='';
   let r;try{r=await (opts.invite&&opts.invite())}catch(err){r={ok:false,error:'Could not open sharing.'}}
   F.busy=0;if(my!==RUN)return;
   if(r&&r.ok){F.shared=true;hap('success')}else if(r&&r.error){F.err=r.error}
   ffRender()}
  else if(a==='contacts'){hap('medium');if(F.busy)return;F.busy=1;F.err='';F.st='load';ffRender();
   let r;try{r=await (opts.contacts&&opts.contacts())}catch(err){r={ok:false,error:'Could not read your contacts.'}}
   F.busy=0;if(my!==RUN)return;
   if(r&&r.ok&&r.matches&&r.matches.length){F.list=r.matches;F.sel=new Set();F.st='list';hap('success');ffRender();rise('.xfr',0,90)}
   else if(r&&r.ok){F.st='none';ffRender();rise('.xz',0)}
   else{F.denied=!!(r&&r.denied);F.err=(r&&r.error)||'';F.st=(F.denied||!F.err)?'none':'home';ffRender();rise('.xz',0)}}
 };
}

/* ================= 7. WELCOME ================= */
function wcHtml(){return nx(`<div style="position:absolute;left:0;right:0;top:210px;text-align:center"><div class="xbub" id="wb" style="display:inline-block;margin:0 28px;text-align:center;font-size:17px">${tr('Welcome, '+nm()+'! Your profile has been successfully created.')}</div><div style="height:30px"></div>${znHtml(196,'wz')}</div><div class="xbar">${btn('Continue','go')}</div>`).replace('class="xbub"','class="xbub nob"')}
function wcPlay(){
 S.mute=false;const b=$('#wb');b.style.setProperty('--x','0');
 fx($('#wz'),[{transform:'translateY(60px) scale(.5)',opacity:0},{transform:'translateY(-24px) scale(1.12)',offset:.6,opacity:1},{transform:'none',opacity:1}],{duration:700});
 fx(b,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.06)',offset:.7},{opacity:1,transform:'none'}],{duration:480,delay:300});
 E(250,sfx.cel,'hard');
 at(450,()=>{burst(190,330,44,{up:true,speed:380,fall:320,life:1800,colors:['#c9b8c3','#e8a83a','#7fa8ff','#6fcf97','#ff9aa2']});hap('success')});
 at(1000,()=>{burst(70,300,16,{up:true,speed:260,fall:260,life:1500});burst(310,300,16,{up:true,speed:260,fall:260,life:1500});hap('heavy')});
 R.onclick=e=>{if(e.target.closest('[data-a=back]')){hap('light');go(IDX('Find friends'));return}if(!e.target.closest('[data-a=go]'))return;hap('hard');at(120,()=>finish())};
}

const S1=[
 {t:'Placement exam',d:'One medium question each: English, Physics, Chemistry, Maths, Biology',next:'Lesson complete',spec:{m:'Zip introduces five quick questions. A progress bar fills as you go, answers lift on tap, the Check button wakes up, and a feedback sheet springs up in green or red. Wrong answers come back at the end for a second try. Matching pairs fade out one by one as they are matched.',h:'Light tick on every tap, medium on Check, success on correct (hard slam from 3 in a row), error buzz on wrong.',s:'Rising two-note ding for correct, low buzz for wrong, chime on a streak of three.'},html:exHtml,play:exPlay},
 {t:'Lesson complete',d:'XP, accuracy and time, subject strengths',next:'Streak: day 1',spec:{m:'Zip hops in, confetti bursts, XP and accuracy count up, three stat cards rise and subject bars fill to show your starting point.',h:'Hard hit on arrival, light ticks while counting, heavy thud when the numbers land.',s:'Your combined audio file plays once.'},html:lcHtml,play:lcPlay},
 {t:'Streak: day 1',d:'Grey flame lights up, 0 to 1 day',next:'Streak goal',spec:{m:'The grey flame squashes, turns red and leaps with embers. The number 1 pops in, the flame slams back down with a shockwave, the week strip rises and Monday gets its first tick.',h:'Medium on squash, hard on ignite, success on the number, heavy thud on the slam, heavy on the tick.',s:'One streak sound only (the supplied ignite clip).'},html:sdHtml,play:sdPlay},
 {t:'Streak goal',d:'Pick 3, 7, 14 or 30 days',next:'Gems reward',spec:{m:'The streak flame changes colour with the goal you tap: yellow for 3 days, pink with a touch of red for 7, pink for 14 and orange for 30. It squashes, stretches and bounces on every change with embers in the new colour.',h:'Heavy thump on every goal change, hard on commit.',s:'No tap sounds.'},html:sgHtml,play:sgPlay},
 {t:'Gems reward',d:'20 gems fly into the counter, then disappear',next:'Save progress',spec:{m:'Zip and the flame in your goal colour pop up, the bubble says Here are 20 gems to start you off, and eight gems burst out and fly into the counter in the top right, which counts to 20 and then fades away.',h:'Light tap for every gem that lands, success when the count finishes, heavy as the counter leaves.',s:'A soft gem ping for each gem.'},html:gmHtml,play:gmPlay},
 {t:'Save progress',d:"Don't lose your progress, create a profile",next:'Create profile',spec:{m:'Zip bounces up with a pencil, the bubble pops and the Continue button slides in.',h:'Medium on arrival, heavy on Continue.',s:'No tap sounds.'},html:spHtml,play:spPlay},
 {t:'Create profile',d:'Age, sign-up option, email, password, name',next:'Find friends',spec:{m:'Five single-question steps slide in from the right with a progress bar. Google opens an account chooser, email goes through email and password with live rules, and Create profile shows loading dots.',h:'Light tick while typing, medium on Continue, heavy on account pick, success when the profile is created.',s:'Check chime per step, whoosh while creating, sparkle when done.'},html:cpHtml,play:cpPlay},
 {t:'Find friends',d:'Contacts permission, add friends',next:'Profile created',spec:{m:'Zip asks to sync contacts. An iOS-style permission dialog scales in, loading dots follow and a contact list appears with checkboxes and an Add button that counts.',h:'Medium on sync, heavy on Allow, medium on each checkbox.',s:'Ticks, check chime and sparkle when contacts load.'},html:ffHtml,play:ffPlay},
 {t:'Profile created',d:'Profile created, confetti',next:'Finish',spec:{m:'Zip bounces up, the speech bubble pops with the welcome line and confetti bursts from three points.',h:'Hard on arrival, success with the confetti, heavy on the side bursts.',s:'Fanfare with the supplied sound clip.'},html:wcHtml,play:wcPlay},
];
S1.forEach(s=>s.g='New user flow');
SCREENS.push(...S1);


go(opts.startAt&&IDX(opts.startAt)>=0?IDX(opts.startAt):0);
return {jump(t){go(IDX(t))},titles:()=>SCREENS.map(s=>s.t),destroy(){RUN++;timers.forEach(clearTimeout);try{introStop(100)}catch(e){}try{CS&&CS.stop()}catch(e){}ro.disconnect();znStopAll();stage.remove();host.classList.remove('nuf');host.removeAttribute('data-own-haptics')}};
}
