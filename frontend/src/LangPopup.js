// Language popup for the intro pages.
// A centred frosted box: the chosen language is always the first row, the other languages follow and scroll
// when they do not fit. Picking a language moves it to the top with a smooth slide, then the popup fades out,
// and only then is the language switched (switching re-translates every text on screen, so it is done after
// the animation, never during it).
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const h = React.createElement;

/* the selected language first, the others in their normal order */
export function orderLangs(langs, selected) {
  const sel = langs.find((l) => l.code === selected);
  return sel ? [sel].concat(langs.filter((l) => l.code !== selected)) : langs.slice();
}

const EXIT_MS = 240, HOLD_MS = 620;
const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeIcon = h("svg", { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", "aria-hidden": "true" }, h("path", { d: "M6 6l12 12M18 6L6 18" }));
const checkIcon = h("svg", { className: "ob-lck", viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 2.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, h("path", { d: "M5 12.5l4.5 4.5L19 7.5" }));

export default function LangPopup({ langs, current, onPick, onClose, registerBack }) {
  const [shown, setShown] = useState(current);
  const [closing, setClosing] = useState(false);
  const busy = useRef(false);
  const listRef = useRef(null);
  const before = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };
  const order = orderLangs(langs, shown);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const close = () => {
    if (busy.current) return;
    busy.current = true;
    setClosing(true);
    later(onClose, reducedMotion() ? 0 : EXIT_MS);
  };

  // the Android back button and the Escape key close the popup first
  useEffect(() => {
    if (registerBack) registerBack(close);
    const key = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", key);
    return () => { if (registerBack) registerBack(null); document.removeEventListener("keydown", key); };
  }, []);

  // keyboard / screen reader focus starts on the current language
  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector(".on");
    if (el && el.focus) el.focus({ preventScroll: true });
  }, []);

  // slide every row from where it was to where it is now (FLIP): only transforms, so it runs on the GPU
  useLayoutEffect(() => {
    const prev = before.current; if (!prev) return;
    before.current = null;
    const list = listRef.current; if (!list) return;
    list.scrollTop = 0;
    if (reducedMotion()) return;
    list.querySelectorAll("[data-code]").forEach((el) => {
      const was = prev.get(el.getAttribute("data-code"));
      if (was === undefined || !el.animate) return;
      const dy = was - el.getBoundingClientRect().top;
      if (!dy) return;
      el.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "translateY(0)" }], { duration: 480, easing: "cubic-bezier(.22,.8,.2,1)" });
    });
  }, [shown]);

  const pick = (code) => {
    if (busy.current) return;
    if (code === shown) { close(); return; }
    busy.current = true;
    const m = new Map();
    listRef.current.querySelectorAll("[data-code]").forEach((el) => m.set(el.getAttribute("data-code"), el.getBoundingClientRect().top));
    before.current = m;
    setShown(code);
    const rm = reducedMotion();
    later(() => { setClosing(true); later(() => onPick(code), rm ? 0 : EXIT_MS); }, rm ? 0 : HOLD_MS);
  };

  return h("div", { className: "ob-lsheet" + (closing ? " out" : ""), role: "dialog", "aria-modal": "true", "aria-label": "Select language", onClick: close },
    h("div", { className: "ob-lcard", onClick: (e) => e.stopPropagation() },
      h("div", { className: "ob-lhead" },
        h("h3", null, "Select language"),
        h("button", { type: "button", className: "ob-lx", "aria-label": "Close", onClick: close }, closeIcon)),
      h("div", { className: "ob-llist", ref: listRef, role: "listbox" },
        order.map((l) => h("button", {
          key: l.code, type: "button", role: "option", "data-code": l.code, "data-notr": "", "aria-selected": l.code === shown,
          className: "ob-lopt" + (l.code === shown ? " on" : ""), onClick: () => pick(l.code)
        }, h("span", { className: "ob-ln" }, l.native), l.code === shown ? checkIcon : null)))));
}
