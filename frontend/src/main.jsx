import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import App from "./App.jsx";
import { installGlobalHaptics } from "./haptics";
import "./perf.css";
import { installOfflineLayer } from "./offline";

// Offline mode: cache API reads and queue edits made without a connection.
installOfflineLayer(import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""));

// Phones and the Android app get the lighter, smoother animation mode.
const root = document.documentElement;
const isNative = Capacitor.isNativePlatform();
const isTouchPhone = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;
if (isNative) root.classList.add("native-app");
if (isNative || isTouchPhone) root.classList.add("perf-lite");

installGlobalHaptics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);

// PWA: register the service worker in the browser build only
// (the native Android app already bundles everything).
if ("serviceWorker" in navigator && !Capacitor.isNativePlatform() && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Fade the launch splash out once the app has painted its first frame.
function hideBootSplash() {
  const splash = document.getElementById("boot-splash");
  if (!splash) return;
  splash.classList.add("hide");
  setTimeout(() => splash.remove(), 600);
}
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    const wait = Math.max(0, 750 - performance.now());
    setTimeout(hideBootSplash, wait);
  })
);
setTimeout(hideBootSplash, 6000);
