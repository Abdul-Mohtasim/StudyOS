// Offline sign-in.
//
// After a successful online sign-in this device remembers the account:
//   * email/password accounts: a salted PBKDF2 hash of the password (never the password itself),
//     so the same email + password can be checked later without internet;
//   * Google accounts: no password exists, so the account is offered as "Continue offline".
// The saved data of the account stays on the device (see offline.js), so signing in offline
// shows the previous tasks, notes, planner and so on.

import { clearOfflineCache } from "./offline";

const KEY = "studyos_offline_accounts_v1";
const ITERATIONS = 150000;
const MAX_FAILS = 5;
const LOCK_MS = 30000;

const encoder = new TextEncoder();
let fails = 0;
let lockedUntil = 0;

function readAll() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeAll(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function toBase64(bytes) {
  let text = "";
  for (let i = 0; i < bytes.length; i += 1) text += String.fromCharCode(bytes[i]);
  return btoa(text);
}

function fromBase64(text) {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function cryptoReady() {
  return typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.deriveBits === "function";
}

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return toBase64(new Uint8Array(bits));
}

function sameText(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const normalize = (email) => String(email || "").trim().toLowerCase();

// Call after every successful online sign-in / sign-up. Never throws.
export async function rememberAccount({ email, password, student, token, viaGoogle = false }) {
  try {
    const key = normalize(email || (student && student.email));
    if (!key || !student || !token) return false;

    const accounts = readAll();
    const record = { email: key, name: student.displayName || student.name || "", student, token, viaGoogle, savedAt: Date.now() };

    if (!viaGoogle) {
      if (!password || !cryptoReady()) return false;
      const salt = crypto.getRandomValues(new Uint8Array(16));
      record.salt = toBase64(salt);
      record.iterations = ITERATIONS;
      record.hash = await derive(password, salt, ITERATIONS);
    } else if (accounts[key] && accounts[key].hash) {
      // The same person also has a password on this device: keep it, only refresh the session.
      Object.assign(record, { salt: accounts[key].salt, iterations: accounts[key].iterations, hash: accounts[key].hash, viaGoogle: false });
    }

    accounts[key] = record;
    return writeAll(accounts);
  } catch {
    return false;
  }
}

// Accounts this device can open without internet (for the "Continue offline" buttons).
export function offlineAccounts() {
  return Object.values(readAll())
    .filter((record) => record && record.token && record.student)
    .map((record) => ({ email: record.email, name: record.name || record.email, viaGoogle: Boolean(record.viaGoogle && !record.hash) }));
}

export function hasOfflineAccounts() {
  return offlineAccounts().length > 0;
}

// Check an email + password without internet.
// -> { status: "ok", account } | { status: "none" | "wrong" | "locked" | "unsupported", message }
export async function offlineSignIn(email, password) {
  const now = Date.now();
  if (now < lockedUntil) {
    const seconds = Math.ceil((lockedUntil - now) / 1000);
    return { status: "locked", message: `Too many wrong tries. Please wait ${seconds} seconds and try again.` };
  }

  const record = readAll()[normalize(email)];
  if (!record || !record.token || !record.student) {
    return {
      status: "none",
      message: "No internet connection. To sign in offline, you must have signed in once on this device with internet.",
    };
  }
  if (!record.hash) {
    return { status: "none", message: "This account uses Google. Tap \"Continue offline\" below." };
  }
  if (!cryptoReady()) {
    return { status: "unsupported", message: "Offline sign-in is not available on this device. Please connect to the internet." };
  }

  let hash = "";
  try {
    hash = await derive(password, fromBase64(record.salt), record.iterations || ITERATIONS);
  } catch {
    return { status: "unsupported", message: "Offline sign-in is not available on this device. Please connect to the internet." };
  }

  if (!sameText(hash, record.hash)) {
    fails += 1;
    if (fails >= MAX_FAILS) {
      fails = 0;
      lockedUntil = Date.now() + LOCK_MS;
    }
    return { status: "wrong", message: "Incorrect email or password." };
  }

  fails = 0;
  return { status: "ok", account: { email: record.email, student: record.student, token: record.token } };
}

// "Continue offline" for a Google account saved on this device.
export function offlineGoogleSignIn(email) {
  const record = readAll()[normalize(email)];
  if (!record || !record.token || !record.student || record.hash) return null;
  return { email: record.email, student: record.student, token: record.token };
}

// Remove every saved account and its saved data from this device.
export function forgetOfflineAccounts() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  clearOfflineCache();
}

// True when a login token has passed its expiry time (no network needed).
export function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}
