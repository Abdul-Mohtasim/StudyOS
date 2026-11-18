// Helpers copied from StudyOS_Final_Design_v14 so markup matches the design exactly.
const CUBE='<svg viewBox="40 0 385 466"><path d="M175 5L275 35L395 130L415 335L385 425L215 462L50 250Z" fill="#ff4a6d"/><path d="M275 35L205 205L210 232L285 350L412 335L275 35Z" fill="#ff617f"/><path d="M275 35L395 130L415 335L412 335Z" fill="#f993ac"/><path d="M50 250L210 232L285 350L215 462Z" fill="#ff335f"/><path d="M285 350L412 335L385 425L215 462Z" fill="#ff4a6d"/></svg>';
const BOLT='<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="#e8a83a"/></svg>';
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="#ebe8ea" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>';
const FO='M50 3C54 22 90 38 90 78c0 24-18 40-40 40S10 102 10 78c0-18 9-28 17-38 3 10 9 15 15 15-3-20 0-38 8-52z';
const FI='M50 66c7 10 14 18 14 27 0 9-6 15-14 15s-14-6-14-15c0-9 7-17 14-27z';
const flameSvg=(o,i)=>`<svg viewBox="0 0 100 120"><path d="${FO}" fill="${o}"/><path d="${FI}" fill="${i}"/></svg>`;
const hexPts='50,2 96,28 96,84 50,110 4,84 4,28';

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
 profile:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.500" r="4.500"/><path d="M3.500 21c0-4.500 3.800-7 8.500-7s8.500 2.500 8.500 7z"/></svg>'
};
const nav=a=>`<div class="nav">${[['home','Home'],['tasks','Tasks'],['focus','Focus'],['study','Study'],['profile','Profile']].map(([k,l])=>`<div class="nv${k===a?' on':''}" data-k="${k}">${NAVI[k]}${l}</div>`).join('')}</div>`;
const tb=(sc=78,st=6,gm='1,240')=>`<div class="tb"><div style="width:24px;height:24px;display:block"><svg viewBox="0 0 24 24"><path d="M12 1L19.5 4.5L23 12L19.5 19.5L12 23L4.5 19.5L1 12L4.5 4.5Z" fill="#3aa0ff"/><path d="M12 1L19.5 4.5L23 12L12 12Z" fill="#6cbcff"/><path d="M12 12L23 12L19.5 19.5L12 23Z" fill="#2b86e6"/><path d="M12 12L12 23L4.5 19.5L1 12Z" fill="#1f6fcc"/><path d="M12 6.2L17.8 12L12 17.8L6.2 12Z" fill="#eaf5ff"/><path d="M12 9.2L14.8 12L12 14.8L9.2 12Z" fill="#2b86e6"/></svg></div><span>${sc}</span>${FLM('currentColor','var(--pg)',20,24)}<span>${st}</span><div style="width:22px;height:22px">${CUBE}</div><span>${gm}</span><div class="sp"></div>${ICO.search}</div>`;
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
export { CUBE, BOLT, CHECK, SHARE, FO, FI, flameSvg, hexPts, ic, ICO, FLM, NAVI, nav, tb, ring, hdr, head, tg, trow, hex, STAR, CKB, SUN, MOON, BOOK, CLKH, CALH, bdg };
