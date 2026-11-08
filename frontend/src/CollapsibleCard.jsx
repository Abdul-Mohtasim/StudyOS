import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import "./collapsible.css";

// A settings card that shows only its title and a one-line summary.
// Tapping it slides the details down (and up again).
export default function CollapsibleCard({ icon, title, summary, className = "", children }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <article className={`settings-card cc-card ${className}${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="cc-head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="settings-card-icon">{icon}</span>
        <span className="cc-titles">
          <span className="cc-title">{title}</span>
          {summary ? <span className="cc-summary">{summary}</span> : null}
        </span>
        <ChevronDown size={20} className="cc-chevron" aria-hidden="true" />
      </button>

      <div className="cc-body" id={bodyId} role="region" aria-label={title}>
        <div className="cc-inner">
          <div className="cc-content">{children}</div>
        </div>
      </div>
    </article>
  );
}
