// StudyOS service worker: caches the app shell so the app opens instantly/offline.
// API calls (/api/* and other origins) are never cached.
const CACHE = "studyos-shell-v3";
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Pages: open the saved app shell at once (instant start), and fetch a fresh copy in the
  // background for the next visit. First visit / nothing saved yet: use the network.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("/").then((cached) => {
        const refresh = fetch(req)
          .then((res) => {
            if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("/", copy)); }
            return res;
          })
          .catch(() => cached);
        if (cached) { e.waitUntil(refresh); return cached; }
        return refresh;
      })
    );
    return;
  }
  // Static assets (hashed by Vite): cache first, then network.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});

// Tapping a reminder opens (or focuses) StudyOS.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => "focus" in c);
      return open ? open.focus() : self.clients.openWindow("/");
    })
  );
});
