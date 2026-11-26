// StudyOS languages. English is the source text in the app; every other language is a lookup table
// (rows*.js) applied to what is on screen. Anything without a translation simply stays in English.
import { ROWS1 } from "./rows1";
import { ROWS2 } from "./rows2";
import { ROWS3 } from "./rows3";
import { ROWS4 } from "./rows4";
import { ROWS5 } from "./rows5";
import { ROWS6 } from "./rows6";
import { DENL } from "./rowsDeNl";

export const LANGS = [
  { code: "en", native: "English", name: "English", short: "EN", hello: "Hello!", rtl: false },
  { code: "hi", native: "हिन्दी", name: "Hindi", short: "HI", hello: "नमस्ते!", rtl: false },
  { code: "ur", native: "اردو", name: "Urdu", short: "UR", hello: "السلام علیکم!", rtl: true },
  { code: "ar", native: "العربية", name: "Arabic", short: "AR", hello: "مرحبًا!", rtl: true },
  { code: "es", native: "Español", name: "Spanish", short: "ES", hello: "¡Hola!", rtl: false },
  { code: "fr", native: "Français", name: "French", short: "FR", hello: "Bonjour !", rtl: false },
  { code: "de", native: "Deutsch", name: "German", short: "DE", hello: "Hallo!", rtl: false },
  { code: "nl", native: "Nederlands", name: "Dutch", short: "NL", hello: "Hallo!", rtl: false },
];

const COLUMN = { hi: 1, ur: 2, ar: 3, es: 4, fr: 5, de: 6, nl: 7 };
// Older rows have 6 columns; their German and Dutch live in DENL ({ English: [German, Dutch] }).
const ALL = [...ROWS1, ...ROWS2, ...ROWS3, ...ROWS4, ...ROWS5, ...ROWS6];
const KEY = "studyos-lang";
const ATTRS = ["placeholder", "aria-label", "title"];
const SKIP = "script,style,textarea,input,select,[data-notr],.tt:not([data-tr])";
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let lang = "en";
let exact = new Map();
let templates = [];
let cache = new Map();
let observer = null;
const textRecord = new WeakMap(); // text node -> { en, out }
const attrRecord = new WeakMap(); // element -> { attr: { en, out } }

function build(code) {
  exact = new Map();
  templates = [];
  cache = new Map();
  const col = COLUMN[code];
  if (!col) return;
  for (const row of ALL) {
    const en = row[0];
    const out = row[col] || (col >= 6 && DENL[en] ? DENL[en][col - 6] : "");
    if (!out) continue;
    if (/\{\d\}/.test(en)) {
      const order = [];
      const source = escapeRe(en).replace(/\\\{(\d)\\\}/g, (_m, n) => {
        order.push(Number(n));
        return "([^·]+?)";
      });
      templates.push({ re: new RegExp("^" + source + "$"), order, out, weight: en.replace(/\{\d\}/g, "").length });
    } else {
      exact.set(en, out);
    }
  }
  templates.sort((a, b) => b.weight - a.weight);
}

function translateCore(text) {
  if (exact.has(text)) return exact.get(text);
  for (const t of templates) {
    const m = t.re.exec(text);
    if (!m) continue;
    const parts = [];
    let ok = true;
    t.order.forEach((n, i) => {
      const raw = m[i + 1].trim();
      const tr = translateCore(raw);
      // a gap filled with English words that have no translation means this template does not fit
      if (tr === raw && /(^|\s)[a-z]{3,}(\s|$)/.test(raw)) ok = false;
      parts[n] = tr;
    });
    if (!ok) continue;
    return t.out.replace(/\{(\d)\}/g, (_x, n) => (parts[n] === undefined ? "" : parts[n]));
  }
  if (text.includes(" · ")) {
    const pieces = text.split(" · ");
    const done = pieces.map((p) => translateCore(p));
    return done.join(" · ");
  }
  return text;
}

export function translate(text) {
  if (lang === "en" || typeof text !== "string" || !text) return text;
  const lead = text.match(/^\s*/)[0];
  const tail = text.match(/\s*$/)[0];
  const core = text.trim();
  if (!core || !/[A-Za-z]/.test(core)) return text;
  let out = cache.get(core);
  if (out === undefined) {
    out = translateCore(core);
    if (cache.size > 4000) cache.clear();
    cache.set(core, out);
  }
  return lead + out + tail;
}

// The English text behind an element, for code that reads labels (chips, buttons) as values.
export function englishText(el) {
  if (!el) return "";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let out = "";
  let node;
  while ((node = walker.nextNode())) {
    const rec = textRecord.get(node);
    out += rec && node.nodeValue === rec.out ? rec.en : node.nodeValue;
  }
  return out;
}

function skipped(node) {
  const el = node.nodeType === 1 ? node : node.parentElement;
  return !el || Boolean(el.closest && el.closest(SKIP));
}

function applyText(node) {
  if (skipped(node)) return;
  const current = node.nodeValue;
  const rec = textRecord.get(node);
  const en = rec && current === rec.out ? rec.en : current;
  const out = translate(en);
  if (out !== current) {
    textRecord.set(node, { en, out });
    node.nodeValue = out;
  } else if (rec && out === en) {
    textRecord.delete(node);
  }
}

function applyAttrs(el) {
  if (el.nodeType !== 1 || (el.closest && el.closest("script,style,[data-notr]"))) return;
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    const current = el.getAttribute(attr);
    const recs = attrRecord.get(el) || {};
    const rec = recs[attr];
    const en = rec && current === rec.out ? rec.en : current;
    const out = translate(en);
    if (out !== current) {
      recs[attr] = { en, out };
      attrRecord.set(el, recs);
      el.setAttribute(attr, out);
    }
  }
}

function applyTree(root) {
  if (!root) return;
  if (root.nodeType === 3) {
    applyText(root);
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 11) return;
  if (root.nodeType === 1) applyAttrs(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) applyText(node);
  if (root.querySelectorAll) root.querySelectorAll("[placeholder],[aria-label],[title]").forEach(applyAttrs);
}

// Put every translated node back to its English (or newly chosen language) text.
function retranslateAll() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const rec = textRecord.get(node);
    if (rec && node.nodeValue === rec.out) {
      const out = translate(rec.en);
      node.nodeValue = out;
      if (out === rec.en) textRecord.delete(node);
      else textRecord.set(node, { en: rec.en, out });
    } else if (lang !== "en") {
      applyText(node);
    }
  }
  document.body.querySelectorAll("[placeholder],[aria-label],[title]").forEach((el) => {
    const recs = attrRecord.get(el);
    if (recs) {
      for (const attr of Object.keys(recs)) {
        const rec = recs[attr];
        if (el.getAttribute(attr) === rec.out) el.setAttribute(attr, translate(rec.en));
      }
    }
    if (lang !== "en") applyAttrs(el);
  });
}

function startObserver() {
  if (observer || typeof MutationObserver === "undefined") return;
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "characterData") applyText(r.target);
      else if (r.type === "attributes") applyAttrs(r.target);
      else r.addedNodes.forEach((n) => applyTree(n));
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function paintDocument() {
  const meta = LANGS.find((l) => l.code === lang) || LANGS[0];
  const root = document.documentElement;
  root.lang = lang;
  root.classList.toggle("i18n-rtl", Boolean(meta.rtl));
}

export function getLanguage() {
  return lang;
}

export function setLanguage(code, { save = true } = {}) {
  if (!LANGS.some((l) => l.code === code)) code = "en";
  if (code === lang && (code === "en") === (observer === null)) return code;
  lang = code;
  build(code);
  if (save) {
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* ignore */
    }
  }
  paintDocument();
  if (typeof document !== "undefined" && document.body) {
    if (code === "en") stopObserver();
    else startObserver();
    retranslateAll();
  }
  return code;
}

export function initLanguage() {
  let saved = "en";
  try {
    saved = localStorage.getItem(KEY) || "en";
  } catch {
    saved = "en";
  }
  if (!LANGS.some((l) => l.code === saved)) saved = "en";
  lang = "en"; // force the first setLanguage to do the work
  setLanguage(saved, { save: false });
}
