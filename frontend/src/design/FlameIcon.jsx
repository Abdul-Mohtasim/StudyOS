import React, { useMemo } from "react";
import { flameIconHtml } from "./flameicon.js";

/* Drop-in replacement for the old line "Flame" icon: the StudyOS streak flame.
   Same props the old icon took (size, className); strokeWidth and color are ignored. */
export function Flame({ size = 16, className = "", style }) {
  const html = useMemo(() => flameIconHtml(size), [size]);
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        flex: "none",
        width: Math.round(size * 0.84),
        height: size,
        ...style,
      }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default Flame;
