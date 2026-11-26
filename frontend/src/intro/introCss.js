/* eslint-disable */
/* Styles for the intro pages. Everything is scoped under .ix and every class and animation name starts with ix- / ix_, so nothing here can touch the rest of the app. Sizes use container units (cqw/cqh), so one layout fits every screen. */
export const INTRO_CSS = `.ix{position:absolute;inset:0;overflow:hidden;background:#0d0a10;font-family:'Nunito',system-ui,sans-serif;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;color:#2B2230}
.ix *{box-sizing:border-box;margin:0;padding:0}
.ix .oi{display:block;flex:none;overflow:visible}
.ix .ix-row{position:absolute;inset:0;overflow:hidden;touch-action:pan-y}
.ix .ix-ph{--mx:5.8cqw;--sat:0px;--sab:0px;position:relative;width:100%;height:100%;overflow:hidden;isolation:isolate;transform:translateZ(0);container-type:size;text-align:left}
.ix .ix-flow .ix-col{position:absolute;inset:0;width:100%;height:100%;background:#0d0a10;transform:translate3d(calc((var(--pi) - var(--cur,0)) * 100% + var(--dx,0px)),0,0);transition:transform .56s cubic-bezier(.25,.82,.25,1);will-change:transform;backface-visibility:hidden}
.ix .ix-flow .ix-col .ix-ph{border-radius:0;box-shadow:none}
.ix .ix-cta:focus-visible,.ix .ix-skip:focus-visible,.ix [data-login]:focus-visible{outline:2px solid #fff;outline-offset:3px}
.ix [data-login],.ix [data-start]{cursor:pointer}
.ix u[data-login]{text-decoration:underline}
.ix .ix-bg{position:absolute;inset:0;z-index:0}
.ix .ix-bg svg{width:100%;height:100%;display:block}
.ix .ix-flow .ix-ph{--sat:env(safe-area-inset-top,0px);--sab:env(safe-area-inset-bottom,0px)}
.ix .ix-ct{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;padding:calc(var(--sat,0px) + clamp(8cqw,4.2cqh,12cqw)) var(--mx,5.8cqw) calc(var(--sab,0px) + clamp(5cqw,2.6cqh,8cqw))}
.ix .ix-trow{flex:none;display:flex;align-items:center;justify-content:space-between;height:8cqw}
.ix .ix-dots{display:flex;align-items:center;gap:1.6cqw}
.ix .ix-dots i{width:2cqw;height:2cqw;border-radius:50%;background:var(--dot)}
.ix .ix-dots i.ix-on{width:6.4cqw;border-radius:1.4cqw;background:var(--ink)}
.ix .ix-skip{font:600 clamp(11.5px,3.5cqw,18.2px)/1 'Fredoka','Nunito',system-ui,sans-serif;color:var(--ink);padding:2.2cqw 3.6cqw;border-radius:99px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.7)}
.ix .ix-hb{flex:none;margin-top:clamp(5cqw,2.6cqh,10cqw)}
.ix h2{font:700 clamp(21.1px,6.4cqw,33.3px)/1.2 'Fredoka','Nunito',system-ui,sans-serif;color:var(--ink);letter-spacing:-.01em;text-wrap:balance;overflow-wrap:break-word}
.ix .ix-lead{font:500 clamp(11.2px,3.4cqw,17.7px)/1.5 'Fredoka','Nunito',system-ui,sans-serif;color:var(--ink2);margin-top:1.8cqw;text-wrap:pretty}
.ix .ix-glass{background:linear-gradient(180deg,rgba(255,255,255,.70),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.82);box-shadow:0 2cqw 5.4cqw rgba(40,25,20,.12),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(255,255,255,.35);border-radius:5cqw}
.ix .ix-cbody{flex:none;margin-top:clamp(3.6cqw,1.9cqh,6.4cqw);display:flex;flex-direction:column;gap:clamp(2.4cqw,1.2cqh,3.4cqw)}
.ix .ix-card{flex:none;width:100%;height:10.8cqw;display:flex;align-items:center;gap:3.2cqw;padding:0 3.4cqw;border-radius:4.4cqw}
.ix .ix-card .oi{width:7.8cqw;height:7.8cqw;flex:none}
.ix .ix-card>div{flex:1;min-width:0}
.ix .ix-card b{display:block;font:600 clamp(12.2px,3.7cqw,19.2px)/1.2 'Fredoka','Nunito',system-ui,sans-serif;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ix .ix-card small{display:block;font:600 clamp(9.9px,3cqw,15.6px)/1.25 'Nunito',system-ui,sans-serif;color:var(--ink2);margin-top:.3cqw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ix .ix-sub{flex:none;width:100%;padding:2.6cqw 3cqw;border-radius:4.4cqw}
.ix .ix-sub .ix-t{font:600 clamp(10.9px,3.3cqw,17.2px)/1.3 'Fredoka','Nunito',system-ui,sans-serif;margin-bottom:2cqw;color:var(--ink)}
.ix .ix-sub .ix-g{display:grid;grid-template-columns:repeat(4,1fr);gap:2cqw 1.4cqw}
.ix .ix-sub .ix-c{display:flex;flex-direction:column;align-items:center;gap:.5cqw;font:700 clamp(9.2px,2.8cqw,14.6px)/1.2 'Nunito',system-ui,sans-serif;color:var(--ink);text-align:center;min-width:0}
.ix .ix-sub .ix-c span{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ix .ix-sub .ix-c .oi{width:7cqw;height:7cqw}
.ix .ix-tiles{flex:none;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:20cqw;gap:clamp(2.6cqw,1.3cqh,3.6cqw)}
.ix .ix-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7cqw;text-align:center;padding:0 2cqw;min-width:0}
.ix .ix-tile .oi{width:8cqw;height:8cqw}
.ix .ix-tile b{font:600 clamp(11.9px,3.6cqw,18.7px)/1.2 'Fredoka','Nunito',system-ui,sans-serif;color:var(--ink);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ix .ix-tile small{font:600 clamp(9.9px,3cqw,15.6px)/1.25 'Nunito',system-ui,sans-serif;color:var(--ink2);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ix .ix-mz{flex:1 1 0;min-height:0}
.ix .ix-bot{flex:none;display:flex;flex-direction:column;gap:2.2cqw;width:100%}
.ix .ix-arrow{width:12cqw;height:12cqw;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 2cqw 4.4cqw rgba(0,0,0,.28)}
.ix .ix-arrow svg{width:5.4cqw;height:5.4cqw}
.ix .ix-cta{display:flex;align-items:center;justify-content:center;gap:2.4cqw;height:12.6cqw;border-radius:4.6cqw;font:600 clamp(13.2px,4cqw,20.8px)/1 'Fredoka','Nunito',system-ui,sans-serif;width:100%}
.ix .ix-cta svg{width:5.4cqw;height:5.4cqw}
.ix .ix-cta.ix-w{background:rgba(255,255,255,.93);color:#25202b;box-shadow:0 2cqw 5cqw rgba(0,0,0,.25)}
.ix .ix-cta.ix-a{background:var(--accg);color:#fff;box-shadow:0 2cqw 5cqw rgba(0,0,0,.28)}
.ix .ix-cta.ix-big{height:13.6cqw;justify-content:space-between;padding:0 1.6cqw 0 6cqw}
.ix .ix-cta.ix-big .ix-arrow{width:10cqw;height:10cqw;box-shadow:none}
.ix .ix-cta.ix-big .ix-arrow svg{width:4.8cqw;height:4.8cqw}
.ix .ix-sign{text-align:center;font:500 clamp(11.2px,3.4cqw,17.7px)/1.2 'Fredoka','Nunito',system-ui,sans-serif;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5)}
.ix .ix-sign u{font-weight:700}
.ix .ix-mk{pointer-events:none}
.ix .ix-p1{--dot:rgba(74,36,18,.24);--ink:#4A2412;--ink2:#6B4630;--acc:#D2561A;--accg:linear-gradient(135deg,#F2873A,#D2481F)}
.ix .ix-p2{--dot:rgba(47,36,87,.24);--ink:#2F2457;--ink2:#54487E;--acc:#6E52A3;--accg:linear-gradient(135deg,#8E6FC0,#5C3FA0)}
.ix .ix-p3{--dot:rgba(19,58,34,.24);--ink:#133A22;--ink2:#365C45;--acc:#2F7A33;--accg:linear-gradient(135deg,#55B04A,#2C7A33)}
.ix .ix-p4{--dot:rgba(74,26,42,.24);--ink:#4A1A2A;--ink2:#703A4C;--acc:#C8344F;--accg:linear-gradient(135deg,#F0647D,#C42A4E)}
.ix .ix-rv{opacity:0;transform:translateY(3cqw)}
.ix .ix-go .ix-rv{animation:ix_rv .65s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(.2s + var(--i,0) * .07s)}
@keyframes ix_rv{from{opacity:0;transform:translateY(3cqw)}to{opacity:1;transform:none}}
.ix .ix-mw{opacity:0;transform-box:fill-box;transform-origin:50% 100%}
.ix .ix-go.ix-ent-drop .ix-mw{animation:ix_mDrop 1.1s cubic-bezier(.3,.7,.3,1) .45s both}
.ix .ix-go.ix-ent-fade .ix-mw{animation:ix_mFade 1.2s ease-out .4s both}
.ix .ix-go.ix-ent-slide .ix-mw{animation:ix_mSlide 1.1s cubic-bezier(.2,.8,.2,1) .4s both}
.ix .ix-go.ix-ent-pop .ix-mw{animation:ix_mPop .9s cubic-bezier(.3,1.4,.4,1) .45s both}
@keyframes ix_mDrop{0%{opacity:0;transform:translateY(-80px) scale(.92)}45%{opacity:1}62%{transform:translateY(7px) scale(1.03,.97)}80%{transform:translateY(-3px)}100%{opacity:1;transform:none}}
@keyframes ix_mFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ix_mSlide{from{opacity:0;transform:translateX(-130px)}to{opacity:1;transform:none}}
@keyframes ix_mPop{0%{opacity:0;transform:scale(.55)}100%{opacity:1;transform:none}}
.ix .ix-z{font:700 13px 'Fredoka','Nunito',system-ui,sans-serif;fill:#6E52A3;opacity:0;stroke:#fff;stroke-width:.6;paint-order:stroke;animation:none}
@keyframes ix_zz{0%{opacity:0;transform:translate(0,6px) scale(.55) rotate(-8deg)}16%{opacity:1}60%{opacity:.95}100%{opacity:0;transform:translate(58px,-72px) scale(1.3) rotate(10deg)}}
.ix .ix-cl{animation:ix_drift 40s ease-in-out infinite alternate}
@keyframes ix_drift{from{transform:translateX(-18px)}to{transform:translateX(24px)}}
.ix .ix-tw{animation:ix_tw 3s ease-in-out infinite alternate}
@keyframes ix_tw{from{opacity:.25}to{opacity:1}}
.ix .ix-pu{transform-box:fill-box;transform-origin:center;animation:ix_pu 7s ease-in-out infinite alternate}
@keyframes ix_pu{from{transform:scale(1);opacity:.85}to{transform:scale(1.07);opacity:1}}
.ix .ix-sw{transform-box:fill-box;transform-origin:50% 0;animation:ix_sw 3.6s ease-in-out infinite alternate}
@keyframes ix_sw{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}
.ix .ix-lf{transform-box:fill-box;transform-origin:center;animation:ix_lf 14s linear infinite;opacity:0}
@keyframes ix_lf{0%{transform:translate(0,-20px) rotate(0);opacity:0}8%{opacity:1}50%{transform:translate(-40px,300px) rotate(220deg)}100%{transform:translate(-80px,640px) rotate(430deg);opacity:0}}
.ix .ix-fz{animation:ix_fz 12s ease-in-out infinite alternate}
@keyframes ix_fz{from{transform:translate(0,0)}to{transform:translate(20px,-44px)}}
.ix .ix-ff0,.ix .ix-ff1,.ix .ix-ff2{animation:ix_ff 9s ease-in-out infinite}
.ix .ix-ff1{animation-duration:11s}
.ix .ix-ff2{animation-duration:13s}
@keyframes ix_ff{0%{transform:translate(0,0);opacity:.2}25%{transform:translate(14px,-18px);opacity:1}50%{transform:translate(-8px,-32px);opacity:.4}75%{transform:translate(10px,-14px);opacity:1}100%{transform:translate(0,0);opacity:.2}}
.ix .ix-dr{animation:ix_dr 12s ease-in-out infinite alternate}
@keyframes ix_dr{from{transform:translateX(-22px)}to{transform:translateX(22px)}}
.ix .ix-rp{transform-box:fill-box;transform-origin:center;animation:ix_rp 3.6s ease-in-out infinite alternate}
@keyframes ix_rp{from{transform:scaleX(.88);opacity:.35}to{transform:scaleX(1.1);opacity:.7}}
.ix .ix-fa{animation:ix_fa 1.1s linear infinite}
@keyframes ix_fa{to{stroke-dashoffset:-36}}
.ix .ix-bf{animation:ix_bfx 22s linear infinite}
@keyframes ix_bfx{from{transform:translateX(-30px)}to{transform:translateX(340px)}}
.ix .ix-bfy{animation:ix_bfy 3s ease-in-out infinite alternate}
@keyframes ix_bfy{from{transform:translateY(-16px)}to{transform:translateY(16px)}}
.ix .ix-wg{transform-box:fill-box;transform-origin:center;animation:ix_wg .24s ease-in-out infinite alternate}
@keyframes ix_wg{from{transform:scaleX(.25)}to{transform:scaleX(1)}}
.ix .ix-bd{animation:ix_bdx 30s linear infinite}
@keyframes ix_bdx{from{transform:translateX(-140px)}to{transform:translateX(340px)}}
.ix .ix-wg2{transform-box:fill-box;transform-origin:center;animation:ix_wg2 .7s ease-in-out infinite alternate}
@keyframes ix_wg2{from{transform:scaleY(1)}to{transform:scaleY(.35)}}
.ix .ix-bb{transform-box:fill-box;transform-origin:50% 100%;animation:ix_bb 3.4s ease-in-out infinite alternate}
@keyframes ix_bb{from{transform:translateY(-2px) rotate(-2deg)}to{transform:translateY(2px) rotate(2deg)}}
.ix .ix-bm{animation:ix_bm 3s ease-in-out infinite alternate}
@keyframes ix_bm{from{opacity:.12}to{opacity:.5}}
@media (prefers-reduced-motion:reduce){.ix .ix-ph *{animation:none!important}
.ix .ix-rv{opacity:1;transform:none}
.ix .ix-mw{opacity:1}
.ix .ix-lf{opacity:0}}
.ix .ix-brand{flex:none;display:flex;align-items:center;justify-content:flex-start;gap:2.8cqw}
.ix .ix-appicon{display:block;flex:none;width:15cqw;height:auto;aspect-ratio:190/136;border:0;outline:0;box-shadow:none;background:none;overflow:visible}
.ix .ix-brand span{font:700 clamp(19.8px,6cqw,31.2px)/1 'Fredoka','Nunito',system-ui,sans-serif;color:var(--ink);letter-spacing:-.01em}
.ix .ix-brand em{font-style:normal;color:var(--acc)}
.ix .ix-p1 .ix-trow{justify-content:center;margin-top:clamp(3cqw,1.6cqh,5cqw)}
.ix .ix-eyebrow{font:700 clamp(9.6px,2.9cqw,15.1px)/1 'Fredoka','Nunito',system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin-bottom:2cqw}
.ix .ix-flow.ix-nt .ix-col,.ix .ix-flow.ix-drag .ix-col{transition:none}
.ix .ix-flow .ix-col .ix-ct{transition:opacity .34s ease}
.ix .ix-flow .ix-col:not(.ix-cur) .ix-ct{opacity:0}
.ix .ix-flow .ix-col.ix-cur .ix-ct{opacity:1;transition:opacity .5s ease .12s}
.ix .ix-ph .ix-cta,.ix .ix-ph .ix-skip{cursor:pointer}
@media (prefers-reduced-motion:reduce){.ix .ix-flow .ix-col{transition-duration:.01s}}
.ix .ix-brow{flex:none;display:flex;align-items:center;justify-content:space-between;gap:3cqw;min-height:9cqw}
.ix .ix-brow .ix-dots{flex:none}
.ix .ix-brand{min-width:0}
.ix .ix-p1 .ix-hb{margin-top:clamp(9cqw,5cqh,17cqw);max-width:70cqw}
.ix .ix-mini{width:100%;display:flex;align-items:center;gap:3.6cqw;padding:3cqw 4cqw 3cqw 3cqw;border-radius:6cqw;background:#FFEEDB;box-shadow:0 .8cqw 3cqw rgba(74,36,18,.08)}
.ix .ix-mini .ix-mi{flex:none;width:15cqw;height:15cqw;border-radius:4.4cqw;background:#FFDDBB;display:grid;place-items:center}
.ix .ix-mini .ix-mi svg{width:9.6cqw;height:9.6cqw;display:block}
.ix .ix-mini .ix-mt{flex:1;min-width:0}
.ix .ix-mini .ix-mt b{display:block;font:700 clamp(14.5px,4.4cqw,22.9px)/1.2 'Fredoka','Nunito',system-ui,sans-serif;color:#5A1A0A}
.ix .ix-mini .ix-mt small{display:block;margin-top:1cqw;font:500 clamp(9.9px,3cqw,15.6px)/1.4 'Fredoka','Nunito',system-ui,sans-serif;color:#6B2A14}
/* ---------- device shapes: the layout reads the shape of the screen (height / width), not the model of the phone ---------- */
/* short screens (16:9 and 18:9 phones, small phones): tighter spacing, same content */
@container (min-aspect-ratio: 1/2){
  .ix .ix-ct{padding-top:calc(var(--sat,0px) + clamp(6cqw,3.2cqh,9cqw));padding-bottom:calc(var(--sab,0px) + clamp(4cqw,2.2cqh,6cqw))}
  .ix .ix-hb{margin-top:clamp(3cqw,1.8cqh,6cqw)}
  .ix .ix-p1 .ix-hb{margin-top:clamp(6cqw,3.4cqh,11cqw)}
  .ix h2{font-size:clamp(20px,6cqw,31px)}
  .ix .ix-lead{margin-top:1.4cqw}
  .ix .ix-eyebrow{margin-bottom:1.4cqw}
  .ix .ix-cbody{margin-top:clamp(2.6cqw,1.4cqh,4.4cqw);gap:1.8cqw}
  .ix .ix-card{height:9.8cqw;gap:3cqw}
  .ix .ix-card .oi{width:6.8cqw;height:6.8cqw}
  .ix .ix-sub{padding:2cqw 3cqw}
  .ix .ix-sub .ix-t{margin-bottom:1.2cqw}
  .ix .ix-sub .ix-g{gap:1.2cqw 1.2cqw}
  .ix .ix-sub .ix-c .oi{width:6cqw;height:6cqw}
  .ix .ix-tiles{grid-auto-rows:17cqw;gap:2cqw}
  .ix .ix-tile .oi{width:7cqw;height:7cqw}
  .ix .ix-mini{padding:2.2cqw 3.4cqw 2.2cqw 2.4cqw;gap:3cqw}
  .ix .ix-mini .ix-mi{width:12cqw;height:12cqw}
  .ix .ix-mini .ix-mi svg{width:8cqw;height:8cqw}
  .ix .ix-bot{gap:1.6cqw}
  .ix .ix-cta{height:11.4cqw}
  .ix .ix-cta.ix-big{height:12.4cqw}
  .ix .ix-cta.ix-big .ix-arrow{width:9cqw;height:9cqw}
  .ix .ix-trow{height:7cqw}
}
/* very short screens (16:9 and shorter): the one-line card descriptions and page-3 labels make room */
@container (min-aspect-ratio: 8/15){
  .ix .ix-card{height:8.6cqw}
  .ix .ix-card small{display:none}
  .ix .ix-card .oi{width:6cqw;height:6cqw}
  .ix .ix-lead{display:none}
  .ix .ix-p1 .ix-lead{display:block}
  .ix .ix-sub .ix-c span{display:none}
  .ix .ix-sub .ix-c .oi{width:6.4cqw;height:6.4cqw}
  .ix .ix-tiles{grid-auto-rows:15cqw}
  .ix .ix-tile small{display:none}
}
/* tall screens (20:9 and taller): more air */
@container (max-aspect-ratio: 4/9){
  .ix .ix-cbody{margin-top:clamp(4cqw,2.2cqh,7cqw);gap:clamp(2.8cqw,1.3cqh,3.8cqw)}
  .ix .ix-card{height:11.6cqw}
  .ix .ix-tiles{grid-auto-rows:22cqw;gap:3cqw}
  .ix .ix-bot{gap:2.6cqw}
}
/* wide frames (tablets, foldables): the page stays phone-shaped and centred, text is capped so it never gets huge */
@container (min-width: 480px){
  .ix h2{font-size:34px}
  .ix .ix-lead{font-size:17px}
}

/* ---------- life in the background: only the visible page runs, and it pauses when you leave it ---------- */
.ix .ix-flow:not(.ix-moving) .ix-col:not(.ix-cur) .ix-bg *{animation-play-state:paused!important}
.ix .ix-fx{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;transition:opacity .9s ease .3s}
.ix .ix-flow .ix-col.ix-cur .ix-fx{opacity:1}
/* grass, flowers and tree tops sway in the wind */
.ix .ix-gs{transform-box:fill-box;transform-origin:50% 100%;animation:ix_gs 3.4s ease-in-out infinite alternate}
@keyframes ix_gs{from{transform:rotate(-5deg) skewX(-4deg)}to{transform:rotate(5deg) skewX(4deg)}}
.ix .ix-cn{transform-box:fill-box;transform-origin:50% 100%;animation:ix_cn 5.2s ease-in-out infinite alternate}
@keyframes ix_cn{from{transform:rotate(-1.3deg) translateX(-1px)}to{transform:rotate(1.5deg) translateX(1.5px)}}
/* a shooting star now and then (night page) */
.ix .ix-ss{opacity:0;animation:ix_ss 11s linear infinite}
@keyframes ix_ss{0%,86%{opacity:0;transform:translate(0,0)}88%{opacity:1}100%{opacity:0;transform:translate(-120px,46px)}}
/* sea waves slide sideways, one wave length per loop so it never jumps (sunset page) */
.ix .ix-wv{animation:ix_wv 9s linear infinite}
@keyframes ix_wv{from{transform:translateX(0)}to{transform:translateX(-48px)}}
.ix .ix-wv.ix-wv2{animation-duration:13s;animation-direction:reverse}
@media (prefers-reduced-motion:reduce){.ix .ix-fx{display:none}.ix .ix-gs,.ix .ix-cn,.ix .ix-ss,.ix .ix-wv{animation:none!important}}

/* ---------- steady glass: no live blur. A blur over moving scenery has to be recomputed every frame and made cards flicker on phones ---------- */
.ix .ix-ph .ix-bg{contain:strict}
/* while the language popup is open (or the app is in the background) the whole intro holds still */
.ix.ix-paused *{animation-play-state:paused!important}
/* page 4 buttons: one-colour vector icon + label, centred together */
.ix .ix-cta{gap:clamp(8px,2.4cqw,12px)}
.ix .ix-cta span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ix .ix-cta .ix-bi{width:clamp(18px,5.6cqw,27px);height:clamp(18px,5.6cqw,27px);flex:none;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}

/* ---------- smoothness ---------- */
/* when nothing is sliding, the pages you are not on are not drawn at all (less memory, less work for the phone) */
.ix .ix-flow:not(.ix-moving) .ix-col:not(.ix-cur){visibility:hidden}
/* page-1 dots: centred, a little above Get started */
.ix .ix-bot .ix-dots{justify-content:center;margin-bottom:.6cqw}
.ix .ix-dots i{transition:width .3s cubic-bezier(.25,.82,.25,1),background-color .3s}
/* press feedback on every button: quick, springy, and the shadow follows */
.ix .ix-ph .ix-cta,.ix .ix-ph .ix-skip{transition:transform .16s cubic-bezier(.3,1.3,.5,1),box-shadow .16s ease,filter .16s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.ix .ix-ph .ix-cta:active{transform:scale(.97);filter:brightness(.97)}
.ix .ix-ph .ix-skip:active{transform:scale(.94)}
/* text rendering */
.ix{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
`;
