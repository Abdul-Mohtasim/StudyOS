import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import App from "./App.jsx";
import { EmailLinkScreen } from "./EmailFeatures";
import { installGlobalHaptics } from "./haptics";
import "./fonts.css";
import "./perf.css";
import { installOfflineLayer } from "./offline";
import { initLanguage } from "./i18n";
import "./inputs-theme.css";
import "./native-shell.css";

// Offline mode: cache API reads and queue edits made without a connection.
installOfflineLayer(import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""));

// Phones and the Android app get the lighter, smoother animation mode.
const root = document.documentElement;
const isNative = Capacitor.isNativePlatform();
const isTouchPhone = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;
if (isNative) root.classList.add("native-app");
if (isNative || isTouchPhone) root.classList.add("perf-lite");

installGlobalHaptics();

// Wake the API up (cold start + database) and open its connection while the app paints,
// so sign-in and the first data load do not wait for it.
(() => {
  const api = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  try {
    if (api) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = api;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
    fetch(`${api}/api/health`, { cache: "no-store" }).catch(() => {});
  } catch {
    /* warm-up only */
  }
})();

// Links from emails open this page as /?reset=TOKEN or /?verify=TOKEN.
const linkParams = new URLSearchParams(window.location.search);
const emailLinkKind = linkParams.get("reset") ? "reset" : linkParams.get("verify") ? "verify" : "";
const emailLinkToken = emailLinkKind ? linkParams.get(emailLinkKind) : "";
if (emailLinkKind) {
  // Keep the one-time token out of the address bar and browser history.
  window.history.replaceState(null, "", window.location.pathname);
}

initLanguage();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {emailLinkKind ? (
      <EmailLinkScreen kind={emailLinkKind} token={emailLinkToken} />
    ) : (
      isNative ? (
        // The phone app signs in with the native Google plugin, so it skips loading Google's web script.
        <App />
      ) : (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      )
    )}
  </StrictMode>
);

// PWA: register the service worker in the browser build only
// (the native Android app already bundles everything).
if ("serviceWorker" in navigator && !Capacitor.isNativePlatform() && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Launch screen (phone app): flame face, then the StudyOS wordmark, then the app.
// It only fades once React has drawn the real app (the static fallback page is never seen).
const BOOT_T0 = performance.now();
function hideBootSplash() {
  const splash = document.getElementById("boot-splash");
  if (!splash || splash.classList.contains("hide")) return;
  splash.classList.add("hide");
  document.getElementById("static-site")?.remove();
  document.documentElement.classList.remove("booting");
  setTimeout(() => splash.remove(), 600);
}
function appReady() {
  const r = document.getElementById("root");
  return !!r && !document.getElementById("static-site") && r.childElementCount > 0;
}
(function bootSequence() {
  const splash = document.getElementById("boot-splash");
  if (!splash) return;
  if (!isNative) { requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(hideBootSplash, Math.max(0, 300 - performance.now())))); return; }
  // One after the other, never on screen together: face shows, face fades out fully, then the wordmark fades in.
  const FACE_MS = 700, GAP_MS = 240, MIN_MS = 1500;
  const left = Math.max(0, FACE_MS - (performance.now() - BOOT_T0));
  setTimeout(() => splash.classList.add("out"), left);
  setTimeout(() => requestAnimationFrame(() => splash.classList.add("w")), left + GAP_MS);
  const tick = () => {
    if (performance.now() - BOOT_T0 >= MIN_MS && appReady()) { requestAnimationFrame(hideBootSplash); return; }
    setTimeout(tick, 60);
  };
  tick();
})();
setTimeout(hideBootSplash, 6000);
