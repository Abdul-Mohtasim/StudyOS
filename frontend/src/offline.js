// StudyOS offline layer.
//
// Wraps window.fetch for /api/* calls so the existing screens keep working
// without a connection:
//   * successful GETs are cached on the device (per signed-in student)
//   * a GET that fails because the network is down is answered from the cache
//   * add / edit / delete calls made offline are applied to the cached data,
//     answered with a believable response, and queued
//   * when the connection returns the queue is replayed in order and the app
//     is told to reload (event "studyos:synced")
import { useSyncExternalStore } from "react";
import { nextSchedule } from "./srs";

const CACHE_PREFIX = "studyos-cache:";
const QUEUE_KEY = "studyos-offline-queue";
const MAX_QUEUE = 500;

// collection path -> [key in list response, key in item response]
const COLLECTIONS = {
  tasks: ["tasks", "task"],
  notes: ["notes", "note"],
  planner: ["tasks", "task"],
  "focus-sessions": ["sessions", "session"],
  flashcards: ["flashcards", "flashcard"],
  grades: ["grades", "grade"],
  exams: ["exams", "exam"],
};

let realFetch = null;
let apiBase = "";
let queue = loadQueue();
let status = { online: typeof navigator === "undefined" ? true : navigator.onLine !== false, pending: queue.length, syncing: false };
const listeners = new Set();
let flushPromise = null;

function setStatus(patch) {
  status = { ...status, ...patch };
  listeners.forEach((fn) => fn());
}

export function subscribeOffline(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function getOfflineStatus() {
  return status;
}
export function useOfflineStatus() {
  return useSyncExternalStore(subscribeOffline, getOfflineStatus, getOfflineStatus);
}

// ---------- storage helpers ----------
function loadQueue() {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveQueue() {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* storage full or blocked: the queue still lives in memory */
  }
  setStatus({ pending: queue.length });
}

function tokenFrom(init) {
  const h = init && init.headers;
  if (!h) return "";
  const v = typeof h.get === "function" ? h.get("Authorization") : h.Authorization || h.authorization;
  return typeof v === "string" ? v.replace(/^Bearer\s+/i, "") : "";
}
function uidFromToken(token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part)).sub || "";
  } catch {
    return "";
  }
}
function currentUid() {
  try {
    return uidFromToken(localStorage.getItem("studyos_auth_token") || "");
  } catch {
    return "";
  }
}

function cacheKey(uid, pathAndQuery) {
  return `${CACHE_PREFIX}${uid}:${pathAndQuery}`;
}
function readCache(uid, pathAndQuery) {
  try {
    const raw = localStorage.getItem(cacheKey(uid, pathAndQuery));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeCache(uid, pathAndQuery, data) {
  const key = cacheKey(uid, pathAndQuery);
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(key, json);
  } catch {
    try {
      // Make room by dropping paginated history pages, then retry once.
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX) && k.includes("before="))
        .forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key, json);
    } catch {
      /* give up quietly */
    }
  }
}
function cacheKeysFor(uid, pathPrefix) {
  const start = cacheKey(uid, pathPrefix);
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith(start));
  } catch {
    return [];
  }
}

// Remove cached account data (called when the student signs out).
export function clearOfflineCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// ---------- request parsing ----------
function parseApi(input) {
  const raw = typeof input === "string" ? input : input && input.url;
  if (!raw || typeof raw !== "string") return null;
  let url;
  try {
    url = new URL(raw, window.location.origin);
  } catch {
    return null;
  }
  const base = apiBase ? new URL(apiBase, window.location.origin) : new URL(window.location.origin);
  if (url.origin !== base.origin) return null;
  const idx = url.pathname.indexOf("/api/");
  if (idx === -1) return null;
  const path = url.pathname.slice(idx);
  const segs = path.slice(5).split("/").filter(Boolean).map(decodeURIComponent);
  return { path, search: url.search, segs, key: path + url.search };
}

function jsonResponse(body, status = 200, offline = true) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...(offline ? { "X-StudyOS-Offline": "1" } : {}) },
  });
}

const isTemp = (id) => typeof id === "string" && id.startsWith("local_");
const newTempId = () => "local_" + Math.random().toString(16).slice(2) + Date.now().toString(16);

function isNetworkError(err) {
  return err instanceof TypeError || (err && err.name === "TypeError");
}

// ---------- applying changes to cached lists ----------
function updateLists(uid, collection, fn) {
  const [listKey] = COLLECTIONS[collection];
  const path = `/api/${collection}`;
  const data = readCache(uid, path);
  if (data && Array.isArray(data[listKey])) {
    const next = fn(data[listKey].slice(), data);
    if (next) {
      data[listKey] = next;
      writeCache(uid, path, data);
    }
  }
}
const idOf = (item) => item && (item._id || item.id);

function addSessionToTotals(uid, session) {
  const data = readCache(uid, "/api/focus-sessions");
  if (data && typeof data.totalFocusMinutes === "number") {
    data.totalFocusMinutes += Number(session.durationMinutes) || 0;
    data.totalFocusSessionCount = (data.totalFocusSessionCount || 0) + 1;
    writeCache(uid, "/api/focus-sessions", data);
  }
  cacheKeysFor(uid, "/api/focus-sessions/by-subject").forEach((k) => {
    try {
      const d = JSON.parse(localStorage.getItem(k));
      const name = session.subject || "";
      const row = d.subjects.find((r) => r.subject === name);
      if (row) {
        row.minutes += Number(session.durationMinutes) || 0;
        row.sessions += 1;
      } else {
        d.subjects.push({ subject: name, minutes: Number(session.durationMinutes) || 0, sessions: 1 });
      }
      localStorage.setItem(k, JSON.stringify(d));
    } catch {
      /* ignore */
    }
  });
}

function defaultsFor(collection, body) {
  const now = new Date().toISOString();
  const base = { ...body, createdAt: now, updatedAt: now };
  if (collection === "tasks") return { completed: false, priority: "medium", ...base };
  if (collection === "notes") return { pinned: false, tags: [], ...base };
  if (collection === "planner") return { completed: false, ...base };
  if (collection === "flashcards") {
    return { ease: 2.5, interval: 0, reps: 0, lapses: 0, dueAt: now, lastReviewedAt: null, ...base };
  }
  return base;
}

function enqueue(entry) {
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push(entry);
  saveQueue();
}

// Handle a mutation while offline. Returns a Response.
function handleOfflineMutation(parsed, method, body, uid) {
  const collection = parsed.segs[0];
  const [, itemKey] = COLLECTIONS[collection];
  const id = parsed.segs[1];
  const action = parsed.segs[2];
  const ts = new Date().toISOString();
  const tag = { uid, method, path: parsed.path, body, ts };

  // --- flashcard review: apply SM-2 locally, queue the grade ---
  if (collection === "flashcards" && action === "review" && method === "POST") {
    let updated = null;
    updateLists(uid, "flashcards", (list) => {
      const i = list.findIndex((c) => idOf(c) === id);
      if (i === -1) return null;
      updated = { ...list[i], ...nextSchedule(list[i], body.grade, ts), lastReviewedAt: ts };
      list[i] = updated;
      return list;
    });
    enqueue({ ...tag, id: newTempId(), body: { ...body, reviewedAt: body.reviewedAt || ts } });
    return jsonResponse({ message: "Review saved offline.", flashcard: updated });
  }

  // --- task restore: cancel the queued delete ---
  if (collection === "tasks" && action === "restore" && method === "POST") {
    const at = queue.findIndex((q) => q.method === "DELETE" && q.path === `/api/tasks/${encodeURIComponent(id)}`);
    const snap = at !== -1 ? queue[at].snapshot : null;
    if (at !== -1) {
      queue.splice(at, 1);
      saveQueue();
    }
    if (snap) updateLists(uid, "tasks", (list) => [snap, ...list]);
    return snap
      ? jsonResponse({ message: "Task restored.", task: snap })
      : jsonResponse({ message: "You need to be online to restore this task." }, 503);
  }
  if (action) return null; // other sub-routes are not supported offline

  // --- bulk flashcards ---
  if (collection === "flashcards" && id === "bulk" && method === "POST") {
    const cards = (Array.isArray(body.cards) ? body.cards : []).map((c) => ({
      ...defaultsFor("flashcards", c),
      _id: newTempId(),
    }));
    updateLists(uid, "flashcards", (list) => [...cards, ...list]);
    enqueue({ ...tag, id: newTempId(), tempIds: cards.map((c) => c._id) });
    return jsonResponse({ message: "Flashcards saved offline.", flashcards: cards }, 201);
  }

  // --- create ---
  if (method === "POST" && !id) {
    const item = { ...defaultsFor(collection, body), _id: newTempId() };
    updateLists(uid, collection, (list) => [item, ...list]);
    if (collection === "focus-sessions") addSessionToTotals(uid, item);
    enqueue({ ...tag, id: newTempId(), tempId: item._id });
    return jsonResponse({ message: "Saved offline.", [itemKey]: item }, 201);
  }

  // --- exams: PUT upserts by subject ---
  if (collection === "exams" && method === "PUT" && !id) {
    const key = String(body.subject || "").trim().toLowerCase();
    let saved = null;
    updateLists(uid, "exams", (list) => {
      const i = list.findIndex((e) => String(e.subject).trim().toLowerCase() === key);
      saved = { ...(i === -1 ? { _id: newTempId() } : list[i]), subject: String(body.subject).trim(), date: body.date };
      if (i === -1) list.push(saved);
      else list[i] = saved;
      return list.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    });
    enqueue({ ...tag, id: newTempId() });
    return jsonResponse({ message: "Exam date saved offline.", exam: saved });
  }

  if (!id) return null;

  // --- edit ---
  if (method === "PATCH" || method === "PUT") {
    let updated = null;
    updateLists(uid, collection, (list) => {
      const i = list.findIndex((x) => idOf(x) === id);
      if (i === -1) return null;
      updated = { ...list[i], ...body, updatedAt: ts };
      if (collection === "tasks" && "completed" in body) {
        updated.completedAt = body.completed ? ts : null;
      }
      list[i] = updated;
      return list;
    });
    if (!updated) return null;
    if (isTemp(id)) {
      // Still only exists locally: fold the edit into the queued create.
      const create = queue.find((q) => q.tempId === id);
      if (create) {
        create.body = { ...create.body, ...body };
        saveQueue();
        return jsonResponse({ message: "Updated offline.", [itemKey]: updated });
      }
    }
    enqueue({ ...tag, id: newTempId() });
    return jsonResponse({ message: "Updated offline.", [itemKey]: updated });
  }

  // --- delete ---
  if (method === "DELETE") {
    let removed = null;
    updateLists(uid, collection, (list) => {
      const i = list.findIndex((x) => idOf(x) === id);
      if (i === -1) return null;
      [removed] = list.splice(i, 1);
      return list;
    });
    if (isTemp(id)) {
      queue = queue.filter((q) => q.tempId !== id && !(q.path || "").includes(`/${id}`));
      saveQueue();
    } else {
      enqueue({ ...tag, id: newTempId(), snapshot: removed });
    }
    return jsonResponse({ message: "Deleted offline.", ...(removed ? { [itemKey]: removed } : {}) });
  }
  return null;
}

// ---------- replay the queue ----------
const idMap = new Map();
const mapIds = (text) => {
  let out = text;
  idMap.forEach((real, temp) => {
    out = out.split(temp).join(real);
  });
  return out;
};

export function flushOfflineQueue() {
  if (flushPromise) return flushPromise;
  const uid = currentUid();
  if (!uid || !queue.some((q) => q.uid === uid) || navigator.onLine === false) return Promise.resolve(false);

  flushPromise = (async () => {
    setStatus({ syncing: true });
    const token = localStorage.getItem("studyos_auth_token") || "";
    let changed = false;
    let stop = false;

    for (const entry of [...queue]) {
      if (stop) break;
      if (entry.uid !== uid) continue;

      const url = apiBase + mapIds(entry.path);
      const body = entry.body === undefined ? undefined : JSON.parse(mapIds(JSON.stringify(entry.body)));
      let res;
      try {
        res = await realFetch(url, {
          method: entry.method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
      } catch {
        stop = true; // still offline
        break;
      }

      if (!status.online) setStatus({ online: true });
      if (res.status === 401 || res.status === 429 || res.status >= 500) {
        stop = true;
        break;
      }

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const collection = (entry.path.split("/")[2] || "");
        const itemKey = COLLECTIONS[collection] && COLLECTIONS[collection][1];
        if (entry.tempId && itemKey && data[itemKey]) idMap.set(entry.tempId, idOf(data[itemKey]));
        if (entry.tempIds && Array.isArray(data.flashcards)) {
          entry.tempIds.forEach((t, i) => data.flashcards[i] && idMap.set(t, idOf(data.flashcards[i])));
        }
      }
      // 2xx done; 4xx means the server rejected it for good, so drop it either way.
      queue = queue.filter((q) => q !== entry && q.id !== entry.id);
      saveQueue();
      changed = true;
    }

    setStatus({ syncing: false });
    if (changed) window.dispatchEvent(new CustomEvent("studyos:synced"));
    return changed;
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
}

// ---------- the fetch wrapper ----------
export function installOfflineLayer(base = "") {
  if (realFetch || typeof window === "undefined") return;
  apiBase = base;
  realFetch = window.fetch.bind(window);

  window.fetch = async function studyosFetch(input, init = {}) {
    const parsed = parseApi(input);
    if (!parsed) return realFetch(input, init);

    const method = String((init && init.method) || (typeof input !== "string" && input.method) || "GET").toUpperCase();
    const token = tokenFrom(init);
    const uid = uidFromToken(token);
    const collection = parsed.segs[0];
    const supported = parsed.segs[0] === "auth" || Boolean(COLLECTIONS[collection]) || collection === "settings";
    if (!uid || !supported) return realFetch(input, init);

    // ----- reads -----
    if (method === "GET") {
      const offlineNow = navigator.onLine === false;
      if (!offlineNow && queue.length && parsed.segs[0] !== "auth") {
        await Promise.race([flushOfflineQueue(), new Promise((r) => setTimeout(r, 4000))]);
      }
      if (!offlineNow) {
        try {
          const res = await realFetch(input, init);
          if (res.ok && (res.headers.get("content-type") || "").includes("application/json")) {
            res.clone().json().then((data) => writeCache(uid, parsed.key, data)).catch(() => {});
          }
          if (!status.online) setStatus({ online: true });
          return res;
        } catch (err) {
          if (!isNetworkError(err)) throw err;
          if (init && init.signal && init.signal.aborted) throw err;
          setStatus({ online: false });
        }
      }
      const cached = readCache(uid, parsed.key);
      if (cached) return jsonResponse(cached);
      return realFetch(input, init); // nothing cached: fail the normal way
    }

    // ----- writes -----
    if (!COLLECTIONS[collection] || !["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return realFetch(input, init);
    }

    if (navigator.onLine !== false) {
      try {
        const res = await realFetch(input, init);
        if (!status.online) setStatus({ online: true });
        // Keep the cached copy in step with changes that succeeded online.
        if (res.ok) {
          const data = await res.clone().json().catch(() => null);
          if (data) mirrorOnlineWrite(uid, collection, method, parsed, data);
        }
        return res;
      } catch (err) {
        if (!isNetworkError(err)) throw err;
        setStatus({ online: false });
      }
    }

    let body = {};
    try {
      body = init && init.body ? JSON.parse(init.body) : {};
    } catch {
      body = {};
    }
    const res = handleOfflineMutation(parsed, method, body, uid);
    return res || jsonResponse({ message: "This action needs an internet connection." }, 503);
  };

  window.addEventListener("online", () => {
    setStatus({ online: true });
    flushOfflineQueue();
  });
  window.addEventListener("offline", () => setStatus({ online: false }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushOfflineQueue();
  });
  setInterval(() => {
    if (queue.length) flushOfflineQueue();
  }, 60000);
  setTimeout(() => queue.length && flushOfflineQueue(), 1500);
}

// After a normal online write, patch the cached list so a later offline reload is current.
function mirrorOnlineWrite(uid, collection, method, parsed, data) {
  const [, itemKey] = COLLECTIONS[collection];
  const id = parsed.segs[1];
  if (parsed.segs[2] === "restore" && data[itemKey]) {
    updateLists(uid, collection, (list) => [data[itemKey], ...list.filter((x) => idOf(x) !== idOf(data[itemKey]))]);
    return;
  }
  if (id === "bulk" && Array.isArray(data.flashcards)) {
    updateLists(uid, "flashcards", (list) => [...data.flashcards, ...list]);
    return;
  }
  if (method === "POST" && !id && data[itemKey]) {
    updateLists(uid, collection, (list) => [data[itemKey], ...list]);
    if (collection === "focus-sessions") addSessionToTotals(uid, data[itemKey]);
  } else if ((method === "PATCH" || method === "PUT" || (method === "POST" && parsed.segs[2] === "review")) && data[itemKey]) {
    updateLists(uid, collection, (list) => {
      const target = idOf(data[itemKey]);
      const i = list.findIndex((x) => idOf(x) === target);
      if (i === -1) list.unshift(data[itemKey]);
      else list[i] = data[itemKey];
      return list;
    });
  } else if (method === "DELETE" && id) {
    updateLists(uid, collection, (list) => list.filter((x) => idOf(x) !== id));
  }
}
