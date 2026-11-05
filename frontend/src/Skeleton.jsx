// Loading placeholder shown while StudyOS restores your saved session.
import React from "react";

function Bar({ w = "100%", h = 12, r = 8 }) {
  return <span className="sk-bar" style={{ width: w, height: h, borderRadius: r }} />;
}

export default function AppSkeleton() {
  return (
    <div className="sk-root" role="status" aria-live="polite" aria-busy="true">
      <span className="sk-sr">Restoring your StudyOS...</span>

      <aside className="sk-side" aria-hidden="true">
        <div className="sk-brand"><Bar w={34} h={34} r={10} /><Bar w={96} h={16} /></div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="sk-nav" key={i}><Bar w={22} h={22} r={7} /><Bar w={`${55 + ((i * 13) % 30)}%`} h={13} /></div>
        ))}
        <div className="sk-grow" />
        <div className="sk-nav"><Bar w={22} h={22} r={7} /><Bar w="50%" h={13} /></div>
        <div className="sk-profile"><Bar w={38} h={38} r={19} /><div className="sk-col"><Bar w="70%" h={12} /><Bar w="90%" h={10} /></div></div>
      </aside>

      <main className="sk-main" aria-hidden="true">
        <div className="sk-top">
          <div className="sk-col"><Bar w={120} h={11} /><Bar w="min(320px, 70%)" h={26} r={10} /><Bar w="min(260px, 60%)" h={12} /></div>
          <div className="sk-top-actions"><Bar w={40} h={40} r={20} /><Bar w={40} h={40} r={20} /></div>
        </div>

        <div className="sk-banner"><Bar w="45%" h={22} r={10} /><Bar w="70%" h={12} /><Bar w={130} h={38} r={12} /></div>

        <div className="sk-stats">
          {[0, 1, 2, 3].map((i) => (
            <div className="sk-card" key={i}><Bar w="40%" h={11} /><Bar w="55%" h={26} r={10} /><Bar w="75%" h={10} /></div>
          ))}
        </div>

        <div className="sk-grid">
          <div className="sk-card sk-tall">
            <Bar w="35%" h={16} />
            {[0, 1, 2, 3].map((i) => <div className="sk-row" key={i}><Bar w={22} h={22} r={11} /><Bar w={`${60 + ((i * 11) % 30)}%`} h={13} /></div>)}
          </div>
          <div className="sk-card sk-tall">
            <Bar w="40%" h={16} />
            <Bar w="100%" h={120} r={14} />
            <Bar w="60%" h={12} />
          </div>
        </div>
      </main>
    </div>
  );
}
