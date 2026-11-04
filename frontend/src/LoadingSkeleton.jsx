import React from "react";
import { GraduationCap, Search, Bell, Menu } from "lucide-react";
import "./loading-skeleton.css";

// Shown while StudyOS restores the saved session. The layout mirrors the real app
// (top bar, greeting, hero banner, stat tiles, two lists) so the screen does not jump
// when the real content arrives.
const Block = ({ className = "", style }) => (
  <span className={`sk-block ${className}`} style={style} aria-hidden="true" />
);

export default function LoadingSkeleton() {
  return (
    <main className="sk-screen" role="status" aria-live="polite" aria-busy="true">
      <span className="sk-visually-hidden">Restoring your StudyOS</span>

      <div className="sk-progress" aria-hidden="true"><span /></div>

      <div className="sk-shell">
        {/* Desktop sidebar (hidden on phones) */}
        <aside className="sk-side" aria-hidden="true">
          <div className="sk-brand">
            <GraduationCap size={22} className="sk-cap" />
            <Block className="sk-line" style={{ width: 82, height: 14 }} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="sk-nav-item" key={i} style={{ "--d": `${i * 70}ms` }}>
              <Block className="sk-dot" />
              <Block className="sk-line" style={{ width: `${54 + ((i * 17) % 34)}%`, height: 12 }} />
            </div>
          ))}
        </aside>

        <div className="sk-main">
          {/* Top bar */}
          <header className="sk-topbar" aria-hidden="true">
            <div className="sk-brand sk-brand-mobile">
              <GraduationCap size={24} className="sk-cap" />
              <span className="sk-wordmark">StudyOS</span>
            </div>
            <div className="sk-top-icons">
              <Search size={20} />
              <Bell size={20} />
              <Menu size={22} />
            </div>
          </header>

          {/* Greeting */}
          <section className="sk-greeting" aria-hidden="true">
            <Block className="sk-line" style={{ width: 118, height: 11 }} />
            <Block className="sk-line" style={{ width: "62%", height: 26, marginTop: 12 }} />
            <Block className="sk-line" style={{ width: "46%", height: 12, marginTop: 12 }} />
          </section>

          {/* Hero banner */}
          <section className="sk-hero" aria-hidden="true">
            <Block className="sk-line sk-on-hero" style={{ width: 150, height: 11 }} />
            <Block className="sk-line sk-on-hero" style={{ width: "78%", height: 30, marginTop: 14 }} />
            <Block className="sk-line sk-on-hero" style={{ width: "58%", height: 14, marginTop: 16 }} />
            <div className="sk-hero-actions">
              <Block className="sk-pill sk-on-hero" />
              <Block className="sk-pill sk-on-hero sk-pill-ghost" />
            </div>
          </section>

          {/* Stat tiles */}
          <section className="sk-stats" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div className="sk-card sk-stat" key={i} style={{ "--d": `${i * 90}ms` }}>
                <Block className="sk-dot sk-dot-lg" />
                <Block className="sk-line" style={{ width: "46%", height: 22, marginTop: 14 }} />
                <Block className="sk-line" style={{ width: "72%", height: 10, marginTop: 10 }} />
              </div>
            ))}
          </section>

          {/* Lists */}
          <section className="sk-lists" aria-hidden="true">
            {[0, 1].map((c) => (
              <div className="sk-card sk-list" key={c} style={{ "--d": `${200 + c * 120}ms` }}>
                <Block className="sk-line" style={{ width: c ? 120 : 96, height: 15 }} />
                {[0, 1, 2].map((r) => (
                  <div className="sk-row" key={r}>
                    <Block className="sk-check" />
                    <div className="sk-row-text">
                      <Block className="sk-line" style={{ width: `${82 - r * 14 - c * 6}%`, height: 12 }} />
                      <Block className="sk-line" style={{ width: `${46 - r * 6}%`, height: 9, marginTop: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
