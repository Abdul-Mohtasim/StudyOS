/* eslint-disable */
/* StudyOS flame mascot — skeletal rig.
   Legs: hip → knee → ankle → foot (2-bone IK, feet planted on the ground).
   Arms: shoulder → elbow → hand (2-bone IK, spring follow-through).
   Body: squash/stretch around the hips, full rotation (lie down), head tilt.
   Fire hair: 11 flickering tongues that always rise upward, spring-lagged.
   Gaits (walk, run, tiptoe, skip) plant each foot exactly while the body travels. */
(function(G){
const C={footHi:'#ff8a3a',wingHi:'#ff9d4d',body:'#ff7a1a',dark:'#e5560f',limb:'#d9480f',belly:'#ffc25a',mask:'#ffd98a',eye:'#ffffff',pupil:'#3a2418',foot:'#c93d0a',mouth:'#7a2410',tongue:'#ff6b6b',cheek:'#ff8f6b',
  h1:'#e5450c',h2:'#ff7a1a',h3:'#ffb22e',h4:'#fff0b0'};
let GROUND=190,Y0=180,TH=19,SH=19,UA=21,FA=20,HIPY=-7,D2R=Math.PI/180,OL='#b23c0a',OW=2.600,LIMB='#f26d12',FOOT='#d9470c',FOOTL='#ff8a3a';
const NUM=['lidT','lidA','lidB','pup','shine','asym','x','y','rot','sx','sy','tilt','look','lookY','squint','hair','heat','blush','shake','lfx','lfy','rfx','rfy','lfa','rfa','fa','lhx','lhy','rhx','rhy','ballX','ballY','ball','fh','mir'];
const DEF={lidT:0,lidA:0,lidB:0,pup:1,shine:1,asym:0,view:'front',flip:1,eyes:'open',mouth:'smile',brows:'',extra:'',prop:'',scene:'',gait:'',talk:0,
  x:0,y:0,rot:0,sx:1,sy:1,tilt:0,look:0,lookY:0,squint:0,hair:1,heat:0,blush:0,shake:0,
  lfx:0,lfy:0,rfx:0,rfy:0,lfa:0,rfa:0,fa:0,lhx:-74,lhy:-8,rhx:74,rhy:-8,ballX:0,ballY:108,ball:0,fh:0,mir:0};
const VIEW={front:{hip:[-20,20],sh:[-46,46],fx:0,bw:1},q:{hip:[-13,19],sh:[-40,47],fx:14,bw:.94},side:{hip:[-2,8],sh:[0,6],fx:22,bw:.72},back:{hip:[-20,20],sh:[-46,46],fx:0,bw:1}};
const GAIT={walk:{L:22,H:9,bob:3,sway:2.5,arm:12,lean:2,ang:-10},run:{L:36,H:18,bob:8,sway:1.5,arm:24,lean:10,ang:-18},
  tiptoe:{L:11,H:6,bob:1.5,sway:4,arm:2,lean:-2,toe:30,raise:5,ang:0},skip:{L:26,H:15,bob:2,sway:3,arm:22,lean:3,hop:15,ang:-12}};
const TONG={back:[[-30,20,44,5.1,0],[0,26,64,4.3,1.7],[30,20,46,5.6,3.1],[-14,16,38,6.2,4.4],[16,16,40,5.8,.9]],
  mid:[[-24,17,38,6.1,.6],[0,22,54,5.2,2.2],[24,17,40,6.6,3.8]],front:[[-10,12,30,7.2,1.1],[10,12,32,6.9,2.9]],core:[[0,8,20,8.4,.4]]};
const lerp=(a,b,k)=>a+(b-a)*k,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),f1=n=>(+n).toFixed(1);
const E={inout:k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,out:k=>1-Math.pow(1-k,3),in:k=>k*k*k,lin:k=>k,
  back:k=>{const c=1.6;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2)},soft:k=>k*k*(3-2*k)};
function ik(ax,ay,tx,ty,l1,l2,pref){let dx=tx-ax,dy=ty-ay,d=Math.hypot(dx,dy)||1e-3;const mx=l1+l2-.4;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx}
  const a=Math.atan2(dy,dx),b=Math.acos(cl((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));
  const j1=[ax+Math.cos(a+b)*l1,ay+Math.sin(a+b)*l1],j2=[ax+Math.cos(a-b)*l1,ay+Math.sin(a-b)*l1];
  const j=pref(j1)>=pref(j2)?j1:j2;return [j[0],j[1],ax+dx,ay+dy]}
function L2W(s,lx,ly){const c=Math.cos(s.rot*D2R),n=Math.sin(s.rot*D2R),px=lx*s.sx*s.flip,py=ly*s.sy;return [s.X+px*c-py*n,s.Y+px*n+py*c]}
const LAY={
 back:{ck:'h1',base:86,x0:52,x1:148,vh:14,tips:[[62,40,1.9],[86,60,1.1],[114,62,2.6],[138,42,4.2]]},
 mid:{ck:'h2',base:86,x0:56,x1:144,vh:11,tips:[[72,38,3.3],[100,56,.7],[128,40,5.1]]},
 front:{ck:'h3',base:86,x0:74,x1:126,vh:6,tips:[[89,30,2.2],[111,34,4.6]]},
 core:{ck:'h4',base:86,x0:88,x1:112,vh:0,tips:[[100,22,1.4]]}};
const HAIRK=Object.keys(LAY);
function hairInit(){const o={};for(const k of HAIRK)o[k]=LAY[k].tips.map(()=>({x:0,y:0,vx:0,vy:0}));return o}
function hairStep(s,st,dt,T){const k0=cl(st.hair,.35,2.2);
  const dragX=cl(-s.vx*.05-(s.rv||0)*.04,-16,16)*st.flip,dragY=cl(-s.vy*.035,-9,8);
  for(const L of HAIRK)LAY[L].tips.forEach(([x,h,ph],i)=>{const sp=s.hairSp[L][i],hh=h*k0/60;
    const K=130-h*.8,Cd=2*Math.sqrt(K)*.5,tx=dragX*hh,ty=(dragY>0?dragY*.6:dragY)*hh;
    sp.vx+=(K*(tx-sp.x)-Cd*sp.vx)*dt;sp.vy+=(K*(ty-sp.y)-Cd*sp.vy)*dt;sp.x+=sp.vx*dt;sp.y+=sp.vy*dt})}
function hairLayer(s,t,L,wx){const D=LAY[L],H=s.hairS,k=cl(s.hair,.35,2.2)*(1+s.heat*.28),a=cl(s.rot,-90,90)*.82*D2R,
  ux=-Math.sin(a)*s.flip,uy=-Math.cos(a),X=x=>100+(x-100)*wx,n=D.tips.length;
  const tips=D.tips.map(([x,h,ph],i)=>{const sp=H[L][i];
    const fl=Math.sin(t*2.1+ph)*.06+Math.sin(t*3.4+ph*1.7)*.04;              // slow height breathing
    const sw=(Math.sin(t*1.7+ph)*2.6+Math.sin(t*2.9+ph*2.3)*1.4)*(h/50);      // soft sway
    const hh=h*k*(1+fl);const bx=X(x),by=D.base;
    return {x:bx+ux*hh+sw+sp.x,y:by+uy*hh+sp.y,h:hh,w:(D.x1-D.x0)/n/2*wx,curl:sw*.6+sp.x*.25}});
  const val=[];for(let i=0;i<=n;i++){const vx=i===0?X(D.x0):i===n?X(D.x1):(X(D.tips[i-1][0])+X(D.tips[i][0]))/2;
    const vh=(i===0||i===n)?0:D.vh*Math.min(1.4,k);val.push({x:vx+ux*vh,y:D.base+uy*vh})}
  let d=`M${f1(val[0].x)} ${f1(val[0].y)}`;
  tips.forEach((T,i)=>{const A=val[i],B=val[i+1],h=T.h;
    d+=`C${f1(A.x+(T.x-A.x)*.05+ux*h*.42-T.w*.15)} ${f1(A.y+uy*h*.5)} ${f1(T.x-T.w*.85+T.curl)} ${f1(T.y-uy*h*.3)} ${f1(T.x)} ${f1(T.y)}`;
    d+=`C${f1(T.x+T.w*.7+T.curl*.3)} ${f1(T.y-uy*h*.42)} ${f1(B.x-(B.x-T.x)*.05+ux*h*.36+T.w*.1)} ${f1(B.y+uy*h*.5)} ${f1(B.x)} ${f1(B.y)}`});
  const mx=(val[0].x+val[n].x)/2,dip=L==='back'?14:L==='mid'?12:10;
  d+=`Q${f1(mx-ux*dip*2)} ${f1(D.base-uy*dip*2)} ${f1(val[0].x)} ${f1(val[0].y)}Z`;
  return `<path d="${d}" fill="${C[D.ck]}"${L==='back'?` stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round"`:''}/>`}
/* ---------- body (local coords; old 200×200 art, bottom-centre at 0,0) ---------- */
function bodyLocal(s,t){
  const V=VIEW[s.view],side=s.view==='side',back=s.view==='back',q=s.view==='q',fx=V.fx,bw=V.bw,wx=side?.75:q?.92:1;
  const shp='M42 96Q42 62 100 62Q158 62 158 96V112C160 158 138 188 100 188C62 188 40 158 42 112Z';
    let g=`<g transform="translate(-100 -182)">`+hairLayer(s,t,'back',wx);
  if(back){g+=`<path d="${shp}" fill="${C.body}" stroke="${OL}" stroke-width="${OW}"/><path d="M62 76Q100 66 138 76V124C138 160 122 178 100 178C78 178 62 160 62 124Z" fill="${C.dark}" opacity=".16"/>`+hairLayer(s,t,'mid',wx)+`</g>`;return g}
  g+=`<g transform="translate(100 0) scale(${bw} 1) translate(-100 0)"><path d="${shp}" fill="${C.body}" stroke="${OL}" stroke-width="${OW}"/><ellipse cx="${100+fx*.4}" cy="150" rx="${side?30:40}" ry="25" fill="${C.belly}"/>`
    +`<path d="M${88+fx*.4} 146q6 5 12 0M${100+fx*.4} 158q6 5 12 0" stroke="${C.body}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/></g>`;
  g+=hairLayer(s,t,'mid',wx)+hairLayer(s,t,'front',wx)+hairLayer(s,t,'core',wx);
  // face (tilts on its own)
  let f='';const ex2=side?[null,100+fx]:q?[86+fx*.6,124+fx*.6]:[78,122],R=q?[20,24]:[24,24],pl=s.look*5+(side?4:0),pv=s.lookY*5;
  ex2.forEach((ex,i)=>{if(ex===null)return;const rr=R[i],E2=s.eyes;
    f+=`<circle cx="${ex}" cy="102" r="${rr+4}" fill="${C.mask}"/>`;
    if(E2==='open'||E2==='wide'||E2==='love'||E2==='star'||E2==='teary'||(E2==='wink'&&i===0)){const er=E2==='wide'?rr:rr-2.500;
      f+=`<circle cx="${ex}" cy="102" r="${er}" fill="${C.eye}"/>`;
      if(E2==='love')f+=`<path d="M${ex} 111c-9-6-11-10-11-13a5 5 0 0111-2 5 5 0 0111 2c0 3-2 7-11 13z" fill="#ff4a6d"/>`;
      else if(E2==='star'){const sp=.88+.12*Math.sin(t*8+i);f+=`<path transform="translate(${f1(ex+pl*.5)} ${f1(103+pv*.5)}) scale(${f1(sp*er/19)}) rotate(${f1(Math.sin(t*3+i)*10)})" d="M0-11L3.200-3.600L11-3.400L4.900 1.600L7 9.400L0 5L-7 9.400L-4.900 1.600L-11-3.400L-3.200-3.600Z" fill="#ffc83d" stroke="#e09a10" stroke-width="1.500" stroke-linejoin="round"/>`}
      else{const pr=(E2==='wide'?8:11)*s.pup,px=ex+pl*1.1,py=103+pv*1.1,ty=E2==='teary';
        f+=`<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(pr*.86)}" ry="${f1(pr*1.08)}" fill="${ty?'#2d6fd8':C.pupil}"/>`;
        if(ty)f+=`<ellipse cx="${f1(px)}" cy="${f1(py+pr*.35)}" rx="${f1(pr*.7)}" ry="${f1(pr*.55)}" fill="#5fb0ff"/>`;
        const sh=s.shine*(ty?1.3:1)*Math.min(1,s.pup*1.2);
        f+=`<ellipse cx="${f1(px+pr*.3)}" cy="${f1(py-pr*.42)}" rx="${f1(3.400*sh)}" ry="${f1(4*sh)}" fill="#fff"/>`;
        if(sh>1.1||ty)f+=`<circle cx="${f1(px-pr*.36)}" cy="${f1(py+pr*.42)}" r="${f1(1.900*sh)}" fill="#fff" opacity=".95"/>`;
        if(ty){const w=Math.sin(t*4)*.8;f+=`<path d="M${ex-er+1} ${f1(110+w)}Q${ex} ${f1(118+w)} ${ex+er-1} ${f1(110+w)}L${ex+er} ${f1(117)}Q${ex} ${f1(128)} ${ex-er} 117Z" fill="#7cc4ff" opacity=".85"/>`}}
      { // eyelids: upper (sleepy / angry / sad / smug) + lower (happy cheeks), blended smoothly
        const lt=cl(Math.max(s.lidT+(i===0?s.asym:0),s.squint),0,1),lb=cl(s.lidB,0,1);
        if(lt>.02||lb>.02){const id=`ec${s.uid||0}_${i}_${E2[0]}`,Rm=er+1,ang=s.lidA*(i?-1:1);
          f+=`<clipPath id="${id}"><circle cx="${ex}" cy="102" r="${f1(er+.6)}"/></clipPath><g clip-path="url(#${id})">`;
          if(lt>.02){const yT=102-Rm+2*Rm*lt*.94,cv=.6;f+=`<g transform="rotate(${f1(ang)} ${ex} 102)"><path d="M${ex-40} 60H${ex+40}V${f1(yT)}Q${ex} ${f1(yT+cv)} ${ex-40} ${f1(yT)}Z" fill="${C.mask}"/></g>`}
          if(lb>.02){const yB=102+Rm-2*Rm*lb*.62;f+=`<path d="M${ex-40} 144H${ex+40}V${f1(yB)}Q${ex} ${f1(yB-3*lb)} ${ex-40} ${f1(yB)}Z" fill="${C.mask}"/>`}
          f+=`</g>`}}
    }else if(E2==='squeeze')f+=`<path d="M${ex+(i?10:-10)} 93L${ex+(i?-8:8)} 102L${ex+(i?10:-10)} 111" stroke="${C.pupil}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if(E2==='closed')f+=`<path d="M${ex-12} 104q12 8 24 0" stroke="${C.pupil}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    else if(E2==='happy'||E2==='wink')f+=`<path d="M${ex-12} 106q12-14 24 0" stroke="${C.pupil}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    else if(E2==='x')f+=`<path d="M${ex-9} 93l18 18M${ex+9} 93l-18 18" stroke="${C.pupil}" stroke-width="5" stroke-linecap="round"/>`;
    else if(E2==='spiral')f+=`<path d="M${ex} 102m-3 0a3 3 0 106 0a6 6 0 10-12 0a9 9 0 1018 0" stroke="${C.pupil}" stroke-width="3" fill="none" transform="rotate(${f1((t*240)%360)} ${ex} 102)"/>`;
    if(s.brows&&s.lidT<.15&&s.eyes!=='teary'){const up=s.brows==='sad'?(i?-1:1):s.brows==='angry'?(i?1:-1):0,yb=s.brows==='up'?70:75;f+=`<path d="M${ex-12} ${yb+up*4}L${ex+12} ${yb-up*4}" stroke="${C.pupil}" stroke-width="5" stroke-linecap="round"/>`}});
  const mx=side?122+fx*.2:100+fx*.6,mo={smile:`<path d="M${mx-8} 130q8 8 16 0" stroke="${C.mouth}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    open:`<path d="M${mx-11} 128h22q0 15-11 15t-11-15z" fill="${C.mouth}"/><path d="M${mx-6} 138q6-4 12 0q-2 5-6 5t-6-5z" fill="${C.tongue}"/>`,
    big:`<path d="M${mx-15} 126h30q0 22-15 22t-15-22z" fill="${C.mouth}"/><path d="M${mx-9} 141q9-6 18 0q-3 7-9 7t-9-7z" fill="${C.tongue}"/>`,
    o:`<ellipse cx="${mx}" cy="134" rx="6" ry="8" fill="${C.mouth}"/>`,yawn:`<ellipse cx="${mx}" cy="136" rx="11" ry="14" fill="${C.mouth}"/><ellipse cx="${mx}" cy="143" rx="7" ry="4" fill="${C.tongue}"/>`,
    flat:`<path d="M${mx-7} 132h14" stroke="${C.mouth}" stroke-width="4" stroke-linecap="round"/>`,frown:`<path d="M${mx-8} 136q8-8 16 0" stroke="${C.mouth}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    wobble:`<path d="M${mx-10} 134q2.500-4 5 0t5 0t5 0t5 0" stroke="${C.mouth}" stroke-width="3.500" fill="none" stroke-linecap="round"/>`,
    talk:`<ellipse cx="${mx}" cy="133" rx="8" ry="5" fill="${C.mouth}"/>`,grin:`<path d="M${mx-13} 128q13 14 26 0z" fill="${C.mouth}"/><path d="M${mx-11} 129h22" stroke="#fff" stroke-width="3"/>`};
  f+=mo[s.mouth]||'';
  const bl=Math.max(s.blush,(s.eyes==='happy'||s.mouth==='big'||s.eyes==='love'||s.mouth==='grin')?.7:0);
  if(!side&&bl>.02)f+=`<ellipse cx="${62+fx*.5}" cy="126" rx="${7+s.blush*3}" ry="${4+s.blush*1.5}" fill="${s.blush>.3?'#ff6b7a':C.cheek}" opacity="${f1(bl)}"/><ellipse cx="${138+fx*.5}" cy="126" rx="${7+s.blush*3}" ry="${4+s.blush*1.5}" fill="${s.blush>.3?'#ff6b7a':C.cheek}" opacity="${f1(bl)}"/>`;
  if(s.extra==='tears')f+=[78,122].map((x,i)=>{const p=((t*1.1+i*.5)%1);return `<path d="M${x+(i?14:-14)} ${f1(110+p*42)}q4 6 0 9q-4-3 0-9z" fill="#7ac7ff" opacity="${f1(1-p)}"/>`}).join('');
  g+=`<g transform="rotate(${f1(s.tilt)} ${100+fx*.6} 110)">${f}</g></g>`;return g}

/* ---------- limb construction: tapered capsules merged by a shared outline pass ---------- */
function cap(ax,ay,ar,bx,by,br){const dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);if(d<.5)return `M${f1(ax+ar)} ${f1(ay)}A${f1(ar)} ${f1(ar)} 0 1 0 ${f1(ax-ar)} ${f1(ay)}A${f1(ar)} ${f1(ar)} 0 1 0 ${f1(ax+ar)} ${f1(ay)}Z`;
  const th=Math.atan2(dy,dx),ph=Math.acos(cl((ar-br)/d,-1,1)),P=(x,y,r,a)=>[x+r*Math.cos(a),y+r*Math.sin(a)];
  const a1=P(ax,ay,ar,th+ph),b1=P(bx,by,br,th+ph),b2=P(bx,by,br,th-ph),a2=P(ax,ay,ar,th-ph);
  // slightly bulged sides (organic muscle curve) instead of straight lines
  const mx=(ax+bx)/2,my=(ay+by)/2,bul=(ar+br)*.09,n1=P(mx,my,(ar+br)/2+bul,th+Math.PI/2),n2=P(mx,my,(ar+br)/2+bul,th-Math.PI/2);
  return `M${f1(a1[0])} ${f1(a1[1])}Q${f1(n1[0]*2-(a1[0]+b1[0])/2)} ${f1(n1[1]*2-(a1[1]+b1[1])/2)} ${f1(b1[0])} ${f1(b1[1])}A${f1(br)} ${f1(br)} 0 ${ph>Math.PI/2?1:0} 0 ${f1(b2[0])} ${f1(b2[1])}Q${f1(n2[0]*2-(a2[0]+b2[0])/2)} ${f1(n2[1]*2-(a2[1]+b2[1])/2)} ${f1(a2[0])} ${f1(a2[1])}A${f1(ar)} ${f1(ar)} 0 ${ph>Math.PI/2?0:1} 0 ${f1(a1[0])} ${f1(a1[1])}Z`}
function merged(paths,fill,extra){return `<g>${paths.map(d=>`<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${OW*2}" stroke-linejoin="round"/>`).join('')}${paths.map(d=>`<path d="${d}" fill="${fill}"/>`).join('')}${extra||''}</g>`}
/* hand: wrist at origin, +x points along the forearm. sg flips thumb side. */
const HP={relax:{f:[[-.28,6.5,.5],[0,7.2,.45],[.3,6.4,.5]],th:[-1.05,6]},open:{f:[[-.5,8.5,0],[-.05,9.5,0],[.42,8.4,0]],th:[-1.3,7.5]},
  fist:{f:[[-.35,3.6,0],[0,3.8,0],[.35,3.6,0]],th:[-.55,5]},flat:{f:[[-.12,8.6,0],[0,9.2,0],[.12,8.6,0]],th:[-.6,7]},
  point:{f:[[-.1,10.5,0],[.25,3.6,0],[.55,3.2,0]],th:[-.75,5.5]},thumb:{f:[[-.3,3.6,0],[0,3.8,0],[.32,3.6,0]],th:[-1.57,9.5]},
  hold:{f:[[-.3,5.2,.9],[0,5.6,.85],[.3,5.2,.9]],th:[-.9,6.5]}};
function hand(x,y,ang,sg,pose,wig){const P=HP[pose]||HP.relax;let o=`<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang/D2R)}) scale(1.320 ${1.320*sg}) translate(-2.500 0)">`;
  const palm=`M1 -5.800C5 -8 11.500-7.500 13.500-3C15.200 1 13.500 6.500 9 7.200C4.500 7.800 1 6 .2 2.500C-.4 0-.4-3.600 1-5.800Z`;
  const fp=([a,L,c],i)=>{const by=-4.2+i*4.2,bx=11.200,aa=a+wig*(1+i*.3),ex=bx+Math.cos(aa)*L,ey=by+Math.sin(aa)*L;
    if(c>0){const mx=bx+Math.cos(aa)*L*.55,my=by+Math.sin(aa)*L*.55,ex2=mx+Math.cos(aa+c*1.6)*L*.55,ey2=my+Math.sin(aa+c*1.6)*L*.55;return [cap(bx,by,3,mx,my,2.900),cap(mx,my,2.900,ex2,ey2,2.700)]}
    return [cap(bx,by,3,ex,ey,2.700)]};
  const [ta,tl]=P.th,tb=[5.500,-4.500],te=[tb[0]+Math.cos(ta)*tl,tb[1]+Math.sin(ta)*tl];
  const st=d=>`<path d="${d}" fill="${C.body}" stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round"/>`;
  o+=st(cap(tb[0],tb[1],3.200,te[0],te[1],2.800));
  o+=st(palm);
  P.f.forEach((f,i)=>fp(f,i).forEach(d=>{o+=`<path d="${d}" fill="${C.body}" stroke="${OL}" stroke-width="${OW*.85}" stroke-linejoin="round"/>`}));
  o+=`<path d="M2.400-4.300C5.500-6.200 10.500-5.800 11.800-2.500C12.600 0 11.400 4.800 8.500 5.500C5 6.200 2.200 4.800 1.600 2C1.200-.4 1.300-2.800 2.400-4.300Z" fill="${C.body}"/>`;
  o+=`<path d="M4-2.500Q7-4.200 9.500-3" stroke="#ffb066" stroke-width="1.600" fill="none" stroke-linecap="round" opacity=".8"/></g>`;return o}
/* ---------- wings (local) : slim Duo-style leaf wing hinged at the body side ---------- */
function arm(s,i,hnd){const V=VIEW[s.view],out=i?1:-1,sx0=V.sh[i]*1.12-out*6,sy0=-52;
  const dx=hnd[0]-sx0,dy=hnd[1]-sy0,a=Math.atan2(dy,dx),L=cl(Math.hypot(dx,dy),30,42);
  const pr=-Math.sin(a)*out,sg=pr>=0?1:-1;
  const vel=i?s.hrv:s.hlv,wg0=cl(((vel&&vel[1])||0)*.01,-3.500,3.500);
  const pose=(i?s.handR:s.handL)||'relax',open=pose==='open'||pose==='point'||pose==='thumb'?1.08:pose==='fist'?.9:1;
  const wg=wg0;const W=L*open,P=(x,y)=>`${f1(x*W)} ${f1(y)}`;
  // slim leaf: rounded root, gently curved top edge, one soft feather notch near the tip
  const d=`M${P(-.1,-7.500)}C${P(.3,-10.500)} ${P(.75,-7.500+wg*.3)} ${P(1,-1.500+wg)}Q${P(1.03,3+wg)} ${P(.86,4.200+wg*.8)}Q${P(.8,7.200+wg*.6)} ${P(.62,5.800+wg*.5)}C${P(.4,7.500)} ${P(.12,8)} ${P(-.1,6.500)}Z`;
  const tr=`translate(${f1(sx0)} ${f1(sy0)}) rotate(${f1(a/D2R)}) scale(1 ${sg})`;
  return `<g transform="${tr}"><defs><linearGradient id="wg${i}${s.uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.body}"/><stop offset=".45" stop-color="${C.dark}"/></linearGradient></defs><path d="${d}" fill="url(#wg${i}${s.uid})"/>`
    +`<path d="M${P(.1,-3.500)}Q${P(.5,-6.500)} ${P(.84,-1.500)}" stroke="${C.wingHi}" stroke-width="2.400" fill="none" stroke-linecap="round" opacity=".7"/></g>`}
function propLocal(s,t){const L=s.hl,Rh=s.hr;
  if(s.prop==='book'){const cx=(L[0]+Rh[0])/2,cy=(L[1]+Rh[1])/2;return `<g transform="translate(${f1(cx)} ${f1(cy)})"><path d="M-34-20h32v36h-32z" fill="#4f8df0"/><path d="M2-20h32v36H2z" fill="#3f7ae0"/><path d="M-30-16h26v28h-26zM6-16h26v28H6z" fill="#f6f8ff"/><path d="M-26-8h18M-26-2h14M-26 4h16M10-8h18M10-2h14M10 4h12" stroke="#b8c6e6" stroke-width="2.200" stroke-linecap="round"/></g>`}
  if(s.prop==='notebook')return `<g transform="translate(${f1(L[0]+10)} ${f1(L[1]-6)}) rotate(-8)"><rect x="-16" y="-22" width="34" height="40" rx="4" fill="#7a6cf0"/><rect x="-12" y="-18" width="28" height="32" rx="2" fill="#fffdf6"/><path d="M-8-10h20M-8-4h16M-8 2h${f1(8+((t*10)%10))}" stroke="#9aa0c8" stroke-width="2" stroke-linecap="round"/></g>`;
  return ''}
function propHand(s){const Rh=s.hr;if(s.prop==='notebook'||s.prop==='pencil')return `<g transform="translate(${f1(Rh[0])} ${f1(Rh[1])}) rotate(-35)"><rect x="-3.500" y="-30" width="7" height="30" rx="2" fill="#ffc83d"/><path d="M-3.500 0h7l-3.500 8z" fill="#f4d7b0"/><rect x="-3.500" y="-33" width="7" height="5" rx="2" fill="#ff8a9a"/></g>`;return ''}

/* ---------- whole character in world coords ---------- */
function charSVG(s,t){
  const V=VIEW[s.view];let legs='',feet='';
  for(const i of [0,1]){const F=s.feet[i],out=i?1:-1,front=s.view==='front'||s.view==='back';
    const side=!front,sc=side?.92:.8;
    feet+=`<g transform="translate(${f1(F[0])} ${f1(F[1])}) rotate(${f1(F[2]*s.flip)}) translate(${f1(side?5*s.flip:0)} 0) scale(${f1(sc*(side?s.flip:out))} .78)">`
      +`<path d="M-12 5C-15 5-15.800 1-14.400-2.600C-12.800-6.600-8-9-1.500-9C6-9 11.600-6.800 13.800-2.400C15.400.8 14.400 5 11.200 5Q8.800 6.400 6.200 5Q3.400 6.400.6 5Q-2.200 6.400-4.900 5Q-8 6.400-12 5Z" fill="${C.foot}" stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round"/>`
      +`<path d="M6.200 5Q6.500 2.400 5.800.4M.6 5Q.7 2.300.2.1M-4.900 5Q-5.100 2.400-5.600.4" stroke="${OL}" stroke-width="1.500" fill="none" stroke-linecap="round" opacity=".6"/>`
      +`<path d="M-7.500-4.600Q-2-7.200 4.500-5.800" stroke="${C.footHi}" stroke-width="2.400" fill="none" stroke-linecap="round" opacity=".85"/></g>`}
  const tf=`translate(${f1(s.X)} ${f1(s.Y)}) rotate(${f1(s.rot)}) scale(${f1(s.sx*s.flip)} ${f1(s.sy)})`;
  const side=s.view==='side',back=s.view==='back';
  const armsBack=side||back?arm(s,0,s.hl):'',armsFront=side?arm(s,1,s.hr):back?arm(s,1,s.hr):arm(s,0,s.hl)+arm(s,1,s.hr);
  const sitF=false;return legs+(sitF?'':feet)+`<g transform="${tf}">${back?armsBack+armsFront+bodyLocal(s,t):armsBack+bodyLocal(s,t)+propLocal(s,t)+armsFront+propHand(s)}</g>`+(sitF?feet:'')}
let UID=0;
const PALETTES={
 ember:{name:'Ember',body:'#ff7a1a',dark:'#e5560f',belly:'#ffc25a',mask:'#ffd98a',foot:'#d9470c',footHi:'#ff8a3a',wingHi:'#ff9d4d',ol:'#b23c0a',cheek:'#ff8f6b',h1:'#e5450c',h2:'#ff7a1a',h3:'#ffb22e',h4:'#fff0b0'},
 mauve:{name:'Mauve spark',body:'#b48fb0',dark:'#97709a',belly:'#efdfe9',mask:'#f6ebf2',foot:'#7b5580',footHi:'#a983ad',wingHi:'#cfb1cb',ol:'#5e3d63',cheek:'#e7a0b8',h1:'#8d5fa6',h2:'#c9b8c3',h3:'#f2b6d0',h4:'#fff2f8'},
 ocean:{name:'Blue flame',body:'#3d8bff',dark:'#2a6fe0',belly:'#bfe3ff',mask:'#dff1ff',foot:'#1f56b8',footHi:'#5ea2ff',wingHi:'#78b2ff',ol:'#173f8a',cheek:'#ff9fb5',h1:'#1f5fd6',h2:'#3da0ff',h3:'#7fd8ff',h4:'#eafcff'},
 forest:{name:'Mint flame',body:'#2fbf71',dark:'#22a05c',belly:'#c8f5d8',mask:'#e3fbe9',foot:'#178048',footHi:'#4fd88b',wingHi:'#5fe09a',ol:'#0f5c33',cheek:'#ff9f8a',h1:'#169a55',h2:'#3fd27f',h3:'#a6f07a',h4:'#f2ffd8'},
 sunset:{name:'Sunset',body:'#ff5f6d',dark:'#e8465a',belly:'#ffd1a6',mask:'#ffe4cc',foot:'#c9334a',footHi:'#ff8494',wingHi:'#ff8d98',ol:'#8f1f36',cheek:'#ffb36b',h1:'#d93a62',h2:'#ff7a59',h3:'#ffc15e',h4:'#fff1c9'},
 night:{name:'Midnight',body:'#5a54d6',dark:'#4640b8',belly:'#c9c6ff',mask:'#e4e2ff',foot:'#332e94',footHi:'#7b75ee',wingHi:'#8681f0',ol:'#221e6b',cheek:'#ff9fc8',h1:'#3b2fa8',h2:'#7d5cff',h3:'#c08bff',h4:'#f4e9ff'}};
setTimeout(()=>{},0);function setPalette(k){const P=PALETTES[k];if(!P)return;Object.assign(C,P);OL=P.ol}
const HANDS={run:['fist','fist'],jump:['open','open'],hop:['open','open'],cry:['open','open'],laugh:['open','open'],embarrassed:['open','open'],angry:['fist','fist'],
 excited:['open','open'],scared:['open','open'],proud:['fist','fist'],read:['hold','hold'],write:['hold','hold'],laptop:['flat','flat'],ball:['open','open'],
 clap:['flat','flat'],highFive:['relax','open'],dance:['open','open'],stretch:['open','open'],mirror:['relax','open'],waveBye:['relax','open'],wave:['relax','open'],
 talk:['open','open'],think:['relax','point'],cheer:['fist','fist'],flameUp:['open','open'],point:['relax','point'],thumbsUp:['relax','thumb'],tiptoe:['relax','relax'],curious:['relax','hold']};
function render(s,t,uid){s.uid=uid;
  const head=L2W(s,30,-118);let pre='',post='';
  const lying=Math.abs(s.rot)>45,air=Math.max(0,GROUND-6-Math.max(s.feet[0][1],s.feet[1][1]));
  pre+=`<ellipse cx="${f1(lying?s.X-50:s.X)}" cy="197" rx="${f1((lying?78:48)*Math.max(.5,1-air/120))}" ry="6" fill="rgba(0,0,0,.12)"/>`;
  if(s.scene==='mirror'&&s.mir>.01){const o=f1(s.mir);
    pre+=`<g opacity="${o}"><rect x="96" y="40" width="92" height="156" rx="40" fill="#8a5a3a"/><rect x="102" y="46" width="80" height="144" rx="34" fill="#cfe8f5"/><clipPath id="mc${uid}"><rect x="102" y="46" width="80" height="144" rx="34"/></clipPath><g clip-path="url(#mc${uid})" opacity=".85"><g transform="translate(142 196) scale(-.62 .62) translate(${f1(-s.X)} -196)">${charSVG(s,t)}</g></g><path d="M112 70l20-18M114 92l34-30" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/><rect x="128" y="190" width="28" height="8" rx="3" fill="#6a4228"/></g>`}
  if(s.ball>.01){const bx=s.X+s.ballX,by=s.ballY;pre+=''; post+=`<g transform="translate(${f1(bx)} ${f1(by)}) rotate(${f1((t*220)%360)})" opacity="${f1(s.ball)}"><circle r="11" fill="#4f8df0"/><path d="M-11 0h22M0-11v22" stroke="#fff" stroke-width="3"/><circle r="11" fill="none" stroke="#2f6dd0" stroke-width="2"/></g>`}
  if(s.scene==='laptop')post+=`<g transform="translate(${f1(s.X)} ${GROUND+6})"><path d="M-44-4h88l-8 6h-72z" fill="#3a404b"/><path d="M-36-40h72v36h-72z" fill="#2a2f38"/><circle cx="0" cy="-22" r="5" fill="#7ac7ff" opacity=".8"/></g>`;
  if(s.fh>.01){const hx=lerp(210,s.X+86,s.fh);post+=`<g><path d="M${f1(hx+60)} 52L${f1(hx)} 64" stroke="#7a6cf0" stroke-width="16" stroke-linecap="round"/><circle cx="${f1(hx)}" cy="64" r="11" fill="#f2b38a"/></g>`}
  const X=s.extra;
  if(X==='z')post+=[0,1,2].map(i=>{const p=(t*.4+i/3)%1;return `<text x="${f1(head[0]+10+p*30+Math.sin(p*6)*4)}" y="${f1(head[1]-10-p*60)}" font-family="Arial,sans-serif" font-weight="700" font-size="${f1(14+p*10)}" fill="#8fa3b5" opacity="${f1(1-p)}">z</text>`}).join('');
  if(X==='sweat')post+=`<path d="M${f1(head[0]+24)} ${f1(head[1]+40+((t*30)%14))}q6 10 0 14q-6-4 0-14z" fill="#7ac7ff"/>`;
  if(X==='spark')post+=[[-80,40],[80,50],[-90,110],[90,120],[0,-50]].map(([x,y],i)=>{const k=.6+.4*Math.sin(t*6+i*1.7);return `<path transform="translate(${f1(s.X+x)} ${y}) scale(${f1(k)}) rotate(${f1((t*90+i*40)%360)})" d="M0-9L2-2L9 0L2 2L0 9L-2 2L-9 0L-2-2Z" fill="#ffc83d"/>`}).join('');
  if(X==='q')post+=`<text x="${f1(head[0]+26)}" y="${f1(head[1]+Math.sin(t*3)*3)}" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#4f8df0">?</text>`;
  if(X==='bang')post+=`<text x="${f1(head[0]+26)}" y="${f1(head[1])}" font-family="Arial,sans-serif" font-weight="800" font-size="38" fill="#ff4a3b">!</text>`;
  if(X==='hearts')post+=[0,1,2].map(i=>{const p=(t*.5+i/3)%1;return `<path transform="translate(${f1(s.X-40+i*40+Math.sin(p*7+i)*8)} ${f1(30-p*70)}) scale(${f1(.6+p*.5)})" d="M0 8c-9-6-11-10-11-13a5 5 0 0111-2 5 5 0 0111 2c0 3-2 7-11 13z" fill="#ff4a6d" opacity="${f1(1-p)}"/>`}).join('');
  if(X==='dizzy')post+=[0,1,2].map(i=>{const a=t*3+i*2.09;return `<path transform="translate(${f1(head[0]-30+Math.cos(a)*40)} ${f1(head[1]-6+Math.sin(a)*9)})" d="M0-7L2-2L7 0L2 2L0 7L-2 2L-7 0L-2-2Z" fill="#ffc83d"/>`}).join('');
  if(X==='notes')post+=[0,1].map(i=>{const p=(t*.5+i*.5)%1;return `<text x="${f1(s.X+50+p*20)}" y="${f1(40-p*60)}" font-family="Arial,sans-serif" font-size="24" fill="#7a6cf0" opacity="${f1(1-p)}">\u266A</text>`}).join('');
  if(X==='steam')post+=[0,1].map(i=>{const p=(t*1.2+i*.5)%1;return `<circle cx="${f1(s.X+(i?66:-66))}" cy="${f1(50-p*40)}" r="${f1(4+p*8)}" fill="#c9ced6" opacity="${f1(1-p)}"/>`}).join('');
  const emb=s.emb.map(p=>`<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(p.r)}" fill="${p.c}" opacity="${f1(p.a)}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-170 -120 340 330" width="100%" height="100%" aria-hidden="true">${pre}${charSVG(s,t)}${emb}${post}</svg>`}

/* ---------- simulation: tweening, gait, IK targets, springs ---------- */
function Sim(actions,start){
  const A=actions;let act=start||'idle',ki=0,kt=0,T=0;const cur=Object.assign({},DEF),disc={};let from={},to={};
  const s={hl:[-58,-32],hlv:[0,0],hr:[58,-32],hrv:[0,0],hs:0,hsv:0,px:0,py:0,vx:0,vy:0,dist:0,gw:0,dir:1,emb:[],blinkAt:1.8,blink:0,uid:++UID,hairSp:hairInit()};
  function key(i){const K=A[act].k[i],EM=(G.FLAME_EYES||{})[act]||{};ki=i;kt=T;from=Object.assign({},cur);to=Object.assign({},DEF,EM,K.p);for(const k in DEF)if(!NUM.includes(k))disc[k]=K.p[k]!==undefined?K.p[k]:EM[k]!==undefined?EM[k]:DEF[k]}
  function play(n){if(!A[n])return;act=n;key(0)}
  key(0);
  function step(dt){T+=dt;const K=A[act].k[ki],k=Math.min(1,(T-kt)/((K.d||1)/1000)),e=(E[K.e]||E.inout)(k);
    for(const n of NUM)cur[n]=lerp(from[n],to[n],e);
    if(k>=1){if(ki+1<A[act].k.length)key(ki+1);else if(A[act].loop!==0)key(0)}
    const st=Object.assign({},cur,disc);
    // velocity (for gait, hair follow-through)
    const vx=(st.x-s.px)/dt,vy=(st.y-s.py)/dt;s.vx+=(vx-s.vx)*Math.min(1,dt*14);s.vy+=(vy-s.vy)*Math.min(1,dt*14);s.px=st.x;s.py=st.y;
    const g=GAIT[st.gait],mv=g&&Math.abs(s.vx)>4;s.gw+=((mv?1:0)-s.gw)*Math.min(1,dt*7);if(Math.abs(s.vx)>4)s.dir=s.vx>0?1:-1;
    const gg=g||GAIT.walk;if(g)s.dist+=Math.abs(s.vx)*dt;const p=(s.dist/(2*gg.L))%1,w=s.gw;
    st.y+=-w*gg.bob*(.5-.5*Math.cos(4*Math.PI*p))-w*(gg.hop||0)*Math.max(0,Math.sin(4*Math.PI*p))-w*(gg.raise||0);
    st.rot+=w*(gg.lean*s.dir+gg.sway*Math.sin(2*Math.PI*p));
    st.sy+=Math.sin(T*2.3)*(st.eyes==='closed'&&Math.abs(st.rot)>45?.03:.012);st.sx-=Math.sin(T*2.3)*.006;
    st.X=st.x+Math.sin(T*47)*st.shake*2.2;st.Y=Y0+(st.y>0?st.y*.18:st.y);
    // feet: keyframe target ← blended with hang (in air) ← blended with planted gait
    const V=VIEW[st.view];st.feet=[0,1].map(i=>{const ox=i?st.rfx:st.lfx,oy=i?st.rfy:st.lfy;
      let fx=st.X+(V.hip[i]*st.sx+ox)*st.flip,fy=GROUND-oy;const hg=L2W(st,V.hip[i],6);fx=lerp(fx,hg[0],st.fa);fy=lerp(fy,hg[1],st.fa);
      let ang=i?st.rfa:st.lfa;
      if(w>.001){const q=(p+(i?.5:0))%1;let rel,lift=0,ga=gg.toe||0;
        if(q<.5)rel=gg.L/2-2*gg.L*q;else{const u=(q-.5)/.5,es=u*u*(3-2*u);rel=-gg.L/2+gg.L*es;lift=Math.sin(Math.PI*u)*gg.H;ga+=gg.ang*Math.sin(Math.PI*u)}
        const gx=st.X+V.hip[i]*st.flip*st.sx+s.dir*rel,gy=GROUND-lift-(gg.toe?3:0);fx=lerp(fx,gx,w);fy=lerp(fy,gy,w);ang=lerp(ang,ga,w)}
      const hb=L2W(st,V.hip[i],-2);const dxh=fx-hb[0],dyh=fy-hb[1],dd=Math.hypot(dxh,dyh),mx=9;if(dd>mx){fx=hb[0]+dxh/dd*mx;fy=hb[1]+dyh/dd*mx}
      return [fx,Math.min(fy,GROUND),ang]});
    // hands: target + gait arm swing → spring (follow-through)
    const sw=w*gg.arm*Math.sin(2*Math.PI*p)*s.dir*st.flip;const dsh=V.sh[0]-VIEW.front.sh[0],dsh2=V.sh[1]-VIEW.front.sh[1];
    const tg=[[st.lhx+dsh+sw,st.lhy-Math.abs(sw)*.2],[st.rhx+dsh2-sw,st.rhy-Math.abs(sw)*.2]];
    [['hl','hlv'],['hr','hrv']].forEach(([h,v],i)=>{for(const a of [0,1]){const kk=260,cc=2*Math.sqrt(kk)*.62,acc=kk*(tg[i][a]-s[h][a])-cc*s[v][a];s[v][a]+=acc*dt;s[h][a]+=s[v][a]*dt}});
    st.hl=s.hl;st.hr=s.hr;
    // hair: every flame tip is its own spring (follow-through, overlapping action)
    const rv=(st.rot-(s.pr===undefined?st.rot:s.pr))/dt;s.pr=st.rot;s.rv=(s.rv||0)+(rv-(s.rv||0))*Math.min(1,dt*10);
    s.hk=(s.hk===undefined?st.hair:s.hk)+(st.hair-(s.hk===undefined?st.hair:s.hk))*Math.min(1,dt*6);st.hair=s.hk;   // no sudden size jumps
    hairStep(s,st,dt,T);st.hairS=s.hairSp;st.hs=0;st.hairK=1;
    st.hlv=s.hlv;st.hrv=s.hrv;
    const HM=HANDS[act]||['relax','relax'],ov=A[act].k[ki].p.hands;st.handL=(ov&&ov[0])||HM[0];st.handR=(ov&&ov[1])||HM[1];
    // blink
    if(T>s.blinkAt){s.blink=Math.min(1,s.blink+dt*14);if(s.blink>=1){s.blinkAt=T+2.2+Math.random()*2.8;s.blink=-1}}else if(s.blink<0)s.blink=Math.min(0,s.blink+dt*12);
    if(st.eyes==='open'&&s.blink)st.squint=Math.max(st.squint,Math.abs(s.blink));
    if(st.talk||s.ft){const m=Math.sin(T*16)+Math.sin(T*7.3);st.mouth=m>1?'open':m>0?'talk':m>-1?'smile':'o'}
    // embers
    const top=L2W(st,0,-130);if(!s.noEmb&&Math.random()<dt*(9*st.hair+st.heat*14))s.emb.push({x:top[0]+(Math.random()-.5)*50,y:top[1]-st.hair*12,vx:(Math.random()-.5)*18-s.vx*.2,vy:-30-Math.random()*40,r:1.2+Math.random()*2.6,life:0,max:.8+Math.random()*.9,c:['#ffc83d','#ff8a2a','#fff0b0','#ff5a2a'][Math.floor(Math.random()*4)]});
    s.emb=s.emb.filter(q=>(q.life+=dt)<q.max).map(q=>{q.x+=q.vx*dt+Math.sin(q.life*8)*.3;q.y+=q.vy*dt;q.a=1-q.life/q.max;return q});st.emb=s.emb;
    s.last=st;return st}
  return {play,step,talk:b=>{s.ft=!!b},opts:o=>Object.assign(s,o),svg:()=>render(s.last,T,s.uid),get action(){return act}}}
function Mascot(el,opt){opt=opt||{};const sim=Sim(opt.actions||G.FLAME_ACTIONS,opt.action);let raf=0,last=0;
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fr=now=>{const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;let r=dt;while(r>0){const d=Math.min(r,1/60);sim.step(d);r-=d}el.innerHTML=sim.svg();if(!reduce)raf=requestAnimationFrame(fr)};
  raf=requestAnimationFrame(fr);return {play:n=>sim.play(n),stop(){cancelAnimationFrame(raf)}}}
G.FlameRig={Sim,Mascot,render,DEF,GAIT,PALETTES,setPalette};
})(typeof window!=='undefined'?window:globalThis);
