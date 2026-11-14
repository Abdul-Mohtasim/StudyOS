/* ---------- app glue (added by tools/build_design.py; the design itself is untouched) ---------- */
let SUPPRESS=false;
const goT=t=>{const i=SCREENS.findIndex(s=>s.t===t);if(i>=0)go(i)};
const call=(n,...a)=>{try{return APP.call&&APP.call(n,...a)}catch(e){console.error(e)}};
const stateOf=el=>!el.classList.contains('off');

function postRender(title){
  const saved=(APPD().toggles||{});
  $$('[data-tg]',R).forEach((el,i)=>{const v=saved[title+'#'+i];if(v!==undefined)el.classList.toggle('off',!v)});
  if(title==='Language'&&Number.isInteger(APPD().language)&&APPD().language>0){
    const el=$('[data-lang="'+APPD().language+'"]',R);if(el){SUPPRESS=true;el.click();SUPPRESS=false}
  }
  if(title==='Themes'){
    const m=APPD().themeMode||'light';
    $$('.seg span',R).forEach(sp=>sp.classList.toggle('on',sp.textContent.trim().toLowerCase()===m));
  }
  if(title==='Edit profile'){
    $$('.ss .sin',R).forEach((inp,i)=>{if(i>=2){inp.readOnly=true;inp.style.opacity='.75'}});
  }
}

/* Add a friend sheet (same sheet style as the QR sheet) */
function openAdd(){
  if(!R||$('.addsh',R))return;
  const ov=document.createElement('div');ov.className='ov addov';ov.style.zIndex='5';
  const sh=document.createElement('div');sh.className='qsh addsh';sh.style.zIndex='6';sh.style.textAlign='left';
  sh.innerHTML='<div class="qhd"></div><h2 style="text-align:center">Add a friend</h2><p style="text-align:center">Enter the email they use on StudyOS.</p>'+
   '<input class="addin" type="email" inputmode="email" autocomplete="off" placeholder="friend@email.com" maxlength="254" style="display:block;width:100%;box-sizing:border-box;height:52px;margin-top:16px;border-radius:16px;border:2px solid #cfcdce;background:#e7e6e7;padding:0 16px;font:500 16px var(--body);color:#1b1e25;outline:0">'+
   '<div class="addmsg" style="min-height:20px;margin-top:8px;font:500 13px var(--body);color:#5a707a;text-align:center"></div>'+
   '<div class="btn2 addgo" role="button" style="margin-top:6px">Add friend</div>';
  R.appendChild(ov);R.appendChild(sh);
  ov.animate([{opacity:0},{opacity:1}],{duration:240,fill:'backwards'});
  sh.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:400,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'});
  hap('light');
  const close=()=>{const a=sh.animate([{transform:'none'},{transform:'translateY(100%)'}],{duration:260,fill:'forwards'});ov.remove();a.onfinish=()=>sh.remove()};
  ov.addEventListener('click',close);
  const inp=$('.addin',sh),msg=$('.addmsg',sh),go2=$('.addgo',sh);
  let busy=false;
  const submit=async()=>{
    const v=inp.value.trim();if(busy)return;
    if(!v||!v.includes('@')){msg.textContent='Enter your friend\'s email address.';return}
    busy=true;go2.style.opacity='.6';msg.textContent='';
    const r=await call('addFriend',v);
    busy=false;go2.style.opacity='';
    msg.style.color=r&&r.ok?'#2f8f5b':'#c0443c';msg.textContent=(r&&r.message)||'Could not add that friend.';
    if(r&&r.ok){hap('success');inp.value='';setTimeout(()=>{if(sh.isConnected){close();call('refreshFriends');setTimeout(()=>{if(cur()==='Friends')goT('Friends')},400)}},900)}
  };
  go2.addEventListener('click',submit);
  inp.addEventListener('keydown',ev=>{if(ev.key==='Enter')submit()});
}
const cur=()=>SCREENS[CUR]&&SCREENS[CUR].t;

ROOT.addEventListener('click',e=>{
  const T=e.target,t=cur();
  if(!T||!T.closest)return;
  if(t==='Friends'){
    const hd=T.closest('.hd>span');
    if(hd){if(hd===hd.parentElement.firstElementChild){hap('light');goT('Profile')}else{openAdd()}return}
    const inv=T.closest('.btn2');if(inv&&/Invite/.test(inv.textContent)){hap('medium');call('invite')}
    return;
  }
  if(t==='Themes'){
    const hd=T.closest('.hd>span');
    if(hd&&hd===hd.parentElement.firstElementChild){hap('light');goT('Settings');return}
    const sp=T.closest('.seg span');
    if(sp){const m=sp.textContent.trim().toLowerCase();$$('.seg span',R).forEach(x=>x.classList.toggle('on',x===sp));hap('medium');call('setThemeMode',m)}
    return;
  }
  if(t==='Settings'){
    if(T.closest('[data-out]')){hap('medium');call('signOut');return}
    const lk=T.closest('.slk span');if(lk){hap('light');call('openLink',lk.textContent.trim())}
    const it=T.closest('[data-it]');if(it&&(it.dataset.it==='Help Center'||it.dataset.it==='Feedback')){call('openLink',it.dataset.it)}
    return;
  }
  if(t==='Profile QR'){
    const b=T.closest('[data-sh]');
    if(b){const all=$$('[data-sh]',R),i=all.indexOf(b);call(i===0?'shareProfile':i===1?'copyProfile':'saveProfile')}
    return;
  }
  if(t==='Edit profile'){
    const del=T.closest('[data-del]');
    if(del){
      if(del.dataset.armed){hap('heavy');call('deleteAccount')}
      else{del.dataset.armed='1';del.textContent='TAP AGAIN TO DELETE FOREVER';hap('medium');setTimeout(()=>{if(del.isConnected){delete del.dataset.armed;del.textContent='DELETE ACCOUNT'}},4000)}
    }
    return;
  }
  if(t==='Export my data'){
    if(T.closest('[data-exp]')){call('exportData')}
    return;
  }
  // persist switches and choices the design toggles in place
  if(!T.isConnected)return;
  if(t&&t.indexOf('Notifications')===0){call('saveNotifState',Object.assign({},DESIGN_NS));return}
  if(T.closest('[data-tg],.sit.tgl')){const st=$$('[data-tg]',R).map(stateOf);call('setToggles',t,st);return}
  const lg=T.closest('[data-lang]');if(lg&&!SUPPRESS){call('setLanguage',+lg.dataset.lang)}
});

ROOT.addEventListener('change',e=>{
  if(cur()!=='Edit profile'||!e.target.matches||!e.target.matches('[data-fn],[data-ln]'))return;
  call('saveName',$('[data-fn]',R).value.trim(),$('[data-ln]',R).value.trim());
});
