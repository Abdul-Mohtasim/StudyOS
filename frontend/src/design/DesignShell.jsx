import { useEffect, useRef } from "react";
import { mountDesign } from "./engine";

// Thin React wrapper around the imperative design screens (app only).
// `data` and `actions` always point at the newest values; the engine re-renders softly on change.
const SECTION_SCREEN = { dashboard: "Home", tasks: "Tasks", focus: "Focus", study: "Study", profile: "Profile", settings: "Profile" };
const TOP = ["Home", "Tasks", "Focus", "Study", "Profile"];

export default function DesignShell({ data, actions, onTab, section }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const live = useRef({ actions, onTab });
  live.current = { actions, onTab };
  const sectionRef = useRef(section);
  sectionRef.current = section;

  useEffect(() => {
    const proxy = new Proxy({}, {
      get: (_, name) => (...args) => live.current.actions?.[name]?.(...args),
    });
    const api = mountDesign(hostRef.current, {
      data: { ...data },
      actions: proxy,
      onTab: (k) => live.current.onTab?.(k),
      start: SECTION_SCREEN[sectionRef.current] || "Home",
    });
    apiRef.current = api;
    if (import.meta.env.DEV) window.__dz = api;
    return () => { api.destroy(); apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Soft refresh whenever the real data changes.
  const key = JSON.stringify(data);
  useEffect(() => { apiRef.current?.update(data); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // The app changed section (login, logout, old screens) -> show the matching design screen.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const target = SECTION_SCREEN[section];
    if (!target) return; // an old page is on top; the design keeps its place underneath
    const cur = api.screen();
    // Stay on a sub-page (Settings, Weekly report...) unless another main tab is open.
    if (cur !== target && (!cur || TOP.includes(cur))) api.go(target);
  }, [section]);

  // Android back button: DesignShell asks the design screens first.
  useEffect(() => {
    const handler = (event) => {
      if (apiRef.current?.back?.()) event.preventDefault?.();
    };
    window.__studyosDesignBack = () => Boolean(apiRef.current?.back?.());
    return () => { delete window.__studyosDesignBack; };
  }, []);

  const covering = Boolean(SECTION_SCREEN[section]);
  return (
    <div
      ref={hostRef}
      className="dz-shell"
      style={{ position: "fixed", inset: 0, zIndex: 60, display: covering ? "block" : "none" }}
    />
  );
}
