import React, { useEffect, useRef } from "react";
import { mountDesign } from "./runtime";

// Mounts the v14 design screens. All data and actions come from App.jsx through `apiRef`.
export default function DesignApp({ apiRef, handleRef, start }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    // The runtime only ever calls these wrappers, so it always sees the newest data and handlers.
    const api = new Proxy({ start }, {
      get(target, prop) {
        if (prop === "start") return target.start;
        const cur = apiRef.current;
        const v = cur?.[prop];
        return typeof v === "function" ? (...a) => v(...a) : v;
      },
    });
    const handle = mountDesign(host, api);
    handleRef.current = handle;

    // Phone back button / swipe: go back inside the design before leaving the app.
    window.history.pushState({ ds: 1 }, "");
    const onPop = () => {
      if (handle.back()) window.history.pushState({ ds: 1 }, "");
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      handle.destroy();
      handleRef.current = null;
      host.shadowRoot && (host.shadowRoot.innerHTML = "");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="ds-host" />;
}
