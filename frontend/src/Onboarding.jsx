import React, { useEffect, useRef, useState } from "react";
import { LANGS, getLanguage, setLanguage } from "./i18n";
import { mountIntro } from "./intro/introCore.js";
import LangPopup from "./LangPopup.js";
import "./onboarding.css";

// The intro pages (4 pages, shown before sign in on phones). The pages themselves are drawn by
// intro/introCore.js: scenery, cards and a live flame mascot on every page. Get started / Next / Skip
// slide the pages to the left (swipe also works). On the last page "Get started" opens the mascot's
// question pages (onGetStarted) and "I already have an account" opens the sign-in screen (onLogin).
// The language button (page 1) opens a popup: the chosen language is shown first, the rest scroll.
export default function Onboarding({ onLogin, onRegister, onGetStarted }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const backRef = useRef(null);
  const cb = useRef({});
  cb.current = { onLogin, onRegister, onGetStarted };
  const [page, setPage] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [curLang, setCurLang] = useState(getLanguage());
  const curNative = (LANGS.find((l) => l.code === curLang) || LANGS[0]).native;

  function pickLang(code) {
    setLangOpen(false);
    setLanguage(code);
    setCurLang(code);
  }

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.background;
    root.style.background = "#0d0a10";
    const api = mountIntro(hostRef.current, {
      onLogin: () => cb.current.onLogin && cb.current.onLogin(),
      onStart: () => {
        const f = cb.current.onGetStarted || cb.current.onRegister;
        if (f) f();
      },
      onPage: (i) => setPage(i),
    });
    apiRef.current = api;
    // The Android back button closes the language popup first, then goes back one intro page, then leaves the app.
    window.__introBack = () => {
      if (backRef.current) { backRef.current(); return true; }
      return api.back();
    };
    return () => {
      api.destroy();
      apiRef.current = null;
      delete window.__introBack;
      root.style.background = previous;
    };
  }, []);

  // the pages hold still while the popup is open
  useEffect(() => {
    if (apiRef.current) apiRef.current.pause(langOpen);
  }, [langOpen]);

  return (
    <main className="ob ix-wrap" aria-label="Welcome to StudyOS">
      <div className="ix-frame">
        <div className="ix" ref={hostRef} />
        {page === 0 && (
          <button type="button" className="ob-lang ix-lang" data-notr aria-haspopup="dialog" aria-expanded={langOpen} aria-label="Select language" onClick={() => setLangOpen(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" /></svg>
            <span>{curNative}</span>
            <svg className="ix-chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        )}
      </div>
      {langOpen && (
        <LangPopup
          langs={LANGS}
          current={curLang}
          onPick={pickLang}
          onClose={() => setLangOpen(false)}
          registerBack={(fn) => { backRef.current = fn; }}
        />
      )}
    </main>
  );
}
