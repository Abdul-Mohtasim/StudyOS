// Spotlight tab bar: a lamp slides along the bottom bar, swings as it moves, and lights the active tab.
// It watches the bar from outside, so every screen keeps building its bar exactly as before.
import "./spotlight.css";

const LW = 64;                 // lamp width (matches .nlamp in spotlight.css)
const MOVE_MS = 560;
const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function startSpotlight(host) {
  if (!host) return () => {};
  let last = -1;               // which tab the lamp lit last (survives the bar being rebuilt on each screen)

  const tabs = (nav) => Array.from(nav.children).filter((n) => n.classList && n.classList.contains("nv"));
  const xOf = (nv) => nv.offsetLeft + nv.offsetWidth / 2 - LW / 2;

  function lampOf(nav) {
    let l = nav.querySelector(":scope > .nlamp");
    if (!l) {
      l = document.createElement("div");
      l.className = "nlamp";
      l.setAttribute("aria-hidden", "true");
      l.innerHTML = "<i></i>";
      nav.insertBefore(l, nav.firstChild);
    }
    return l;
  }

  function sync(nav) {
    const list = tabs(nav);
    const i = list.findIndex((n) => n.classList.contains("on"));
    if (i < 0 || !list[i].offsetWidth) return;
    if (nav.dataset.li === String(i)) return;           // already showing this tab
    const lamp = lampOf(nav);
    const x = xOf(list[i]);
    nav.dataset.li = String(i);
    const from = last;
    last = i;
    lamp.style.transform = `translateX(${x}px)`;
    if (reduce()) return;
    if (from < 0) {                                       // first time: the lamp flickers on
      lamp.classList.add("warm");
      return;
    }
    if (from === i) return;                               // same tab, screen was just redrawn: no animation
    const fromTab = list[from];
    if (!fromTab) return;
    const x0 = xOf(fromTab), dir = x > x0 ? 1 : -1, dist = Math.abs(x - x0);
    const tilt = Math.min(22, 9 + dist / 14);
    try {
      lamp.animate(
        [
          { transform: `translateX(${x0}px) rotate(0deg)`, offset: 0 },
          { transform: `translateX(${x0 + (x - x0) * 0.5}px) rotate(${dir * tilt}deg)`, offset: 0.42, easing: "ease-out" },
          { transform: `translateX(${x}px) rotate(${-dir * tilt * 0.45}deg)`, offset: 0.78, easing: "ease-in-out" },
          { transform: `translateX(${x}px) rotate(0deg)`, offset: 1 },
        ],
        { duration: MOVE_MS, easing: "cubic-bezier(.3,.7,.3,1)" }
      );
    } catch (_) { /* old webview: the lamp just jumps */ }
    fromTab.classList.add("lit-out");
    list[i].classList.add("lit-in");
    setTimeout(() => { fromTab.classList.remove("lit-out"); list[i].classList.remove("lit-in"); }, 620);
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && root.matches(".nav")) sync(root);
    root.querySelectorAll(".nav").forEach(sync);
  }

  const mo = new MutationObserver((muts) => {
    const navs = new Set();
    for (const m of muts) {
      if (m.type === "attributes") {
        const p = m.target.parentElement;
        if (p && p.classList.contains("nav") && m.target.classList.contains("nv")) navs.add(p);
      } else {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1 || n.classList.contains("nlamp")) return;
          if (n.matches(".nav")) navs.add(n);
          n.querySelectorAll && n.querySelectorAll(".nav").forEach((x) => navs.add(x));
        });
      }
    }
    navs.forEach(sync);
  });
  mo.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  scan(host);

  // keep the lamp centred if the screen size changes (rotation, split screen)
  const onResize = () => host.querySelectorAll(".nav").forEach((nav) => {
    const list = tabs(nav), i = list.findIndex((n) => n.classList.contains("on")), l = nav.querySelector(":scope > .nlamp");
    if (i >= 0 && l) l.style.transform = `translateX(${xOf(list[i])}px)`;
  });
  window.addEventListener("resize", onResize);

  return () => { mo.disconnect(); window.removeEventListener("resize", onResize); };
}
