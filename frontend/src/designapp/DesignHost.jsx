import React, { useEffect, useRef } from "react";
import cssText from "./design.css?raw";
import { haptic } from "../haptics";

// Runs the approved StudyOS v14 design (its own CSS and code) inside a Shadow DOM, so nothing in
// the app's stylesheets can change how it looks. The app only provides data and handles navigation.
// The design's virtual phone is 360 wide; it is scaled to the real screen width.

const DESIGN_W = 360;
const HAP = { tick: "tap", light: "tap", medium: "press", heavy: "press", success: "success", hard: "press", thud: "press" };

export default function DesignHost({ screen, app }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const appRef = useRef(app);
  appRef.current = app;
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let dead = false;
    let ro = null;
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    root.innerHTML = "";
    const style = document.createElement("style");
    style.textContent = `${cssText}
:host{display:block;position:absolute;inset:0;overflow:hidden;background:#181b22}
.dh-wrap{position:absolute;left:0;top:0;width:${DESIGN_W}px;transform-origin:top left}
.dh-wrap .stage{width:${DESIGN_W}px;height:100%;border-radius:0;background:var(--surface)}
.dh-hid{display:none!important}`;
    root.appendChild(style);
    const wrap = document.createElement("div");
    wrap.className = "dh-wrap";
    wrap.innerHTML = `<div class="stage" id="stage"></div>
<div class="dh-hid"><i id="hdot"></i><i id="htxt"></i><div id="spec"></div><div id="tabs"></div><div id="acts"></div><i id="replay"></i><i id="snd"></i><i id="hpt"></i><div id="fit"></div><div id="phone"></div></div>`;
    root.appendChild(wrap);

    let fullH = 0;
    let lastW = 0;
    const fit = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      if (w !== lastW) { lastW = w; fullH = h; }
      fullH = Math.max(fullH, h);
      const k = w / DESIGN_W;
      wrap.style.transform = `scale(${k})`;
      wrap.style.height = `${h / k}px`;
    };
    fit();
    ro = new ResizeObserver(fit);
    ro.observe(host);

    const bridge = {
      haptic: (k) => {
        const fn = haptic[HAP[k] || "tap"];
        try { fn && fn(); } catch { /* ignore */ }
      },
      navigate: (k) => appRef.current?.navigate?.(k),
      onScreen: (t) => appRef.current?.onScreen?.(t),
      get data() { return appRef.current?.data || {}; },
      call: (name, ...args) => appRef.current?.[name]?.(...args),
    };

    import("./designRuntime.js").then(({ createDesign }) => {
      if (dead) return;
      try {
        apiRef.current = createDesign(root, bridge);
        apiRef.current.go(screenRef.current);
      } catch (error) {
        console.error("StudyOS design failed to start:", error);
        appRef.current?.onError?.(error);
      }
    });

    return () => {
      dead = true;
      try { ro && ro.disconnect(); } catch { /* ignore */ }
      try { apiRef.current?.destroy(); } catch { /* ignore */ }
      apiRef.current = null;
      root.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (api && api.title() !== screen) {
      try { api.go(screen); } catch (error) { console.error(error); }
    }
  }, [screen]);

  return <div ref={hostRef} className="design-host" style={{ position: "fixed", inset: 0, zIndex: 60 }} />;
}
