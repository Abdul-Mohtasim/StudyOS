/* Motion and behaviour polish: origin-aware taps, flood ripple, stagger, shared element moves, one-time hints.
   Everything here is optional. If a browser feature is missing, the app behaves as before. */
const reduced=()=>{try{return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
const store={get(k){try{return localStorage.getItem(k)}catch(_){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(_){}}};

export function createPolish(host,stage){
  let vt=null,pending=null;
  const K=()=>(host.clientWidth||360)/360;

  /* Origin-aware: remember where the finger landed so menus and sheets can grow from there (stage pixels). */
  function onDown(e){
    const r=host.getBoundingClientRect(),k=K();
    host.style.setProperty('--ox',Math.round((e.clientX-r.left)/k)+'px');
    host.style.setProperty('--oy',Math.round((e.clientY-r.top)/k)+'px');
    flood(e);
  }
  host.addEventListener('pointerdown',onDown,true);

  /* Flooding: a colour wash that spreads from the tap point inside the main action buttons. */
  const FLOOD='.btn2.mv,[data-fgo],[data-save],.qcta,.sh2-go:not(.off):not(.busy)';
  function flood(e){
    if(reduced())return;
    const b=e.target&&e.target.closest?e.target.closest(FLOOD):null;
    if(!b||b.disabled||!b.animate)return;
    const r=b.getBoundingClientRect(),k=K();
    if(r.width<20)return;
    if(getComputedStyle(b).position==='static')b.style.position='relative';
    const w=document.createElement('i');
    w.setAttribute('aria-hidden','true');
    w.style.cssText='position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none';
    const c=document.createElement('b');
    const x=(e.clientX-r.left)/k,y=(e.clientY-r.top)/k,rad=Math.hypot(Math.max(x,r.width/k-x),Math.max(y,r.height/k-y))+4;
    c.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px;width:'+rad*2+'px;height:'+rad*2+'px;margin:'+(-rad)+'px 0 0 '+(-rad)+'px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.42),rgba(255,255,255,.12) 70%,transparent);transform:scale(0);';
    w.appendChild(c);b.appendChild(w);
    const a=c.animate([{transform:'scale(0)',opacity:1},{transform:'scale(1)',opacity:.9,offset:.55},{transform:'scale(1)',opacity:0}],{duration:560,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
    const done=()=>{if(w.parentNode)w.remove()};a.onfinish=done;a.oncancel=done;
  }

  /* Stagger: rows without their own entrance animation rise in one after another. */
  const STG='.sit,.fu,.sh2-it,.badge,.svfr,.svrow,.trow,.fr,.nr,.gc';
  function stagger(root){
    if(!root||reduced()||!root.querySelectorAll)return;
    let i=0;
    root.querySelectorAll(STG).forEach(el=>{
      if(!el.animate||i>9)return;
      try{if(el.getAnimations().length)return}catch(_){}
      const r=el.getBoundingClientRect();if(!r.height||r.top>innerHeight+40)return;
      el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:300,delay:i*38,easing:'cubic-bezier(.2,.85,.25,1)',fill:'backwards'});
      i++;
    });
  }

  /* Shared element: the tapped picture grows into the next page's header. */
  function share(el,name,toSel){pending=el&&document.startViewTransition&&!reduced()?{el,name,toSel}:null}
  function run(change,getRoot){
    const p=pending;pending=null;
    if(!p||!document.startViewTransition){change();return}
    try{
      if(vt){try{vt.skipTransition()}catch(_){}}
      p.el.style.viewTransitionName=p.name;
      const t=document.startViewTransition(()=>{
        p.el.style.viewTransitionName='';
        change();
        const d=getRoot&&getRoot()?getRoot().querySelector(p.toSel):null;
        if(d)d.style.viewTransitionName=p.name;
      });
      vt=t;
      const clear=()=>{if(vt===t)vt=null;const d=getRoot&&getRoot()?getRoot().querySelector(p.toSel):null;if(d)d.style.viewTransitionName=''};
      t.finished.then(clear,clear);
    }catch(_){p.el.style.viewTransitionName='';change()}
  }

  /* Learning: each hint shows once, then never again. */
  function hint(key,text,show){
    const k='dz_hint_'+key;
    if(store.get(k))return false;
    store.set(k,'1');show(text);return true;
  }

  /* Combo box: type to filter a row of chips, or type a new name to create one. */
  function combo(input,chipBox,onPick){
    if(!input||!chipBox)return;
    const chips=()=>[...chipBox.querySelectorAll('[data-chip]:not(.cbnew)')];
    const norm=s=>String(s||'').trim().toLowerCase();
    const apply=()=>{
      const q=norm(input.value);let shown=0,exact=null;
      chips().forEach(c=>{const t=norm(c.textContent),hit=!q||t.includes(q);c.style.display=hit?'':'none';if(hit)shown++;if(t===q)exact=c});
      let nw=chipBox.querySelector('.cbnew');
      if(q&&!exact){
        if(!nw){nw=document.createElement('span');nw.className='chip cbnew';nw.setAttribute('data-chip','');nw.setAttribute('role','option');chipBox.appendChild(nw)}
        nw.textContent=input.value.trim();nw.style.display='';
      }else if(nw)nw.remove();
      input.setAttribute('aria-expanded',q?'true':'false');
      chipBox.classList.toggle('cbempty',!shown&&!q);
    };
    input.addEventListener('input',apply);
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();e.stopPropagation();
        const first=[...chipBox.querySelectorAll('[data-chip]')].find(c=>c.style.display!=='none');
        if(first){first.click();onPick&&onPick(first);input.blur()}
      }else if(e.key==='Escape'){input.value='';apply()}
    });
    chipBox.addEventListener('click',e=>{const c=e.target.closest('[data-chip]');if(c&&input.value){c.classList.remove('cbnew');onPick&&onPick(c);input.value='';setTimeout(apply,0)}});
  }

  return {stagger,share,run,hint,combo,flood,reduced,destroy(){host.removeEventListener('pointerdown',onDown,true)}};
}
