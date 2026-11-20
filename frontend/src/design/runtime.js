// Runs the StudyOS v14 design screens inside the native app.
// Every screen is the design's own markup and CSS (kept in a shadow root so nothing else can restyle it).
// This file only fills the markup with real data and handles taps, swipes and navigation.
import CSS from "./ds.css?inline";
import TPL from "./tpl.js";
import * as K from "./kit.js";
import { PAGES, QI } from "./kit2.js";

const TABS = ["home", "tasks", "focus", "study", "profile"];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (n) => Number(n || 0).toLocaleString("en-US");
const cap = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
const PAGE = Object.fromEntries(PAGES.map((p) => [p.t, p]));
const DS_KEY = "studyos_ds_prefs";

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(DS_KEY) || "{}") || {}; } catch { return {}; }
}
function savePrefs(p) {
  try { localStorage.setItem(DS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function dueText(t) {
  if (!t.dueDate) return cap(t.priority || "medium");
  const d = String(t.dueDate).slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  if (d === today) return "Due today";
  if (d < today) return "Overdue";
  const dt = new Date(`${d}T00:00:00`);
  return `Due ${dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function taskRow(t, extra = "") {
  const row = K.trow(esc(t.title), esc(t.subject || "Personal"), esc(dueText(t)), t.completed)
    .replace('<div class="trow">', `<div class="trow" data-tid="${esc(t.id)}"${extra}>`);
  return row;
}

// ---------- personalising the design's static markup ----------
function person(html, d) {
  const full = d.name || "Student";
  const [first, ...rest] = full.split(/\s+/);
  const last = rest.join(" ");
  return html
    .replaceAll("Aisha Rahman", esc(full))
    .replaceAll("@aisha_rahman", `@${esc(d.handle)}`)
    .replaceAll("aisha_rahman", esc(d.handle))
    .replaceAll("aisha.rahman@gmail.com", esc(d.email || ""))
    .replaceAll('value="Aisha"', `value="${esc(first)}"`)
    .replaceAll('value="Rahman"', `value="${esc(last)}"`)
    .replaceAll("Aisha (You)", `${esc(first)} (You)`)
    .replaceAll("AISHA", esc(first).toUpperCase())
    .replaceAll("Aisha", esc(first));
}

function themed(html, d) {
  return d.dark ? html.replace('<div class="scr n">', '<div class="scr n nd">') : html;
}

// ---------- screen builders ----------
function homeHTML(d, withSheet) {
  const goal = Math.max(1, d.goalMin || 60);
  const pct = Math.min(1, (d.todayMin || 0) / goal);
  const open = d.tasks.filter((t) => !t.completed);
  const today = new Date().toISOString().slice(0, 10);
  const due = open.filter((t) => !t.dueDate || String(t.dueDate).slice(0, 10) <= today);
  const list = (due.length ? due : open).slice(0, 3);
  const exam = d.exam;
  const examCard = exam
    ? `<div class="card" data-go="exam"><div style="font:700 11px var(--body);letter-spacing:.1em;color:var(--mut)">EXAM MODE</div><div class="rw"><b style="font:700 21px var(--display)">${esc(exam.subject)} · ${exam.days === 0 ? "today" : exam.days === 1 ? "1 day" : `${exam.days} days`}</b><b style="font:700 13px var(--body)">${esc(exam.dateLabel)}</b></div><div class="bar2" style="margin-top:10px"><i style="width:${exam.progress}%"></i></div></div>`
    : `<div class="card" data-go="addSubject"><div style="font:700 11px var(--body);letter-spacing:.1em;color:var(--mut)">EXAM MODE</div><div class="rw"><b style="font:700 21px var(--display)">No exam set</b><b style="font:700 13px var(--body)">Add one</b></div><div class="bar2" style="margin-top:10px"><i style="width:0%"></i></div></div>`;
  const rows = list.length
    ? list.map((t) => taskRow(t)).join("")
    : `<div class="mut" style="font:600 14px var(--body);margin-top:12px">${d.tasks.length ? "All done for today. Nice work." : "No tasks yet. Tap + to add your first one."}</div>`;
  const inner = `<div class="pg">${K.tb(d.score ?? "–", d.streak, fmt(d.gems))}
<div class="sync"><i${d.online ? "" : ' style="background:#d49a3a"'}></i>${d.online ? "Synced just now · works offline" : "Offline · saved on this phone"}</div>
<div class="ttl">Hi, ${esc(d.first)}</div><div class="sub2">${d.streak > 0 ? "Make today count." : "Start your streak today."}</div>
<div class="card dkc rw" data-go="focus" style="gap:16px;height:130px;border-radius:26px;justify-content:flex-start;margin-top:14px"><div class="ring2">${K.ring(94, 9, pct, "#c9b8c3", "#3c4450")}<div class="c">${d.todayMin || 0}m</div></div><div><div style="font:700 17px var(--display);color:#ebe8ea">Daily goal</div><div style="font:600 13px var(--body);color:#cfd2d6;margin:4px 0 9px">${d.todayMin || 0} of ${goal} min studied</div><span class="tag" style="display:inline-flex;align-items:center;gap:6px;border-radius:16px;padding:6px 12px;font-size:13px">${K.FLM("#1b1e25", "#c9b8c3", 11, 14)} ${d.streak} day streak</span></div></div>
${examCard}
<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Today</b><span class="mut" data-go="tasks" style="font:700 13px var(--body)">See all</span></div>
${rows}
</div><div class="fab" data-fab>${K.ICO.plus}</div>${K.nav("home")}`;
  let html = `<div class="scr n${d.dark ? " nd" : ""}">${inner}</div>`;
  if (withSheet) html += "";
  return html;
}

function quickAddSheet() {
  const h = TPL.quickAdd;
  const i = h.indexOf('<div class="ov"></div>');
  return h.slice(i);
}

function tasksHTML(d, filter) {
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  let list = d.tasks;
  if (filter === "Today") list = list.filter((t) => !t.completed && (!t.dueDate || String(t.dueDate).slice(0, 10) <= today));
  else if (filter === "Week") list = list.filter((t) => !t.completed && (!t.dueDate || String(t.dueDate).slice(0, 10) <= weekEnd));
  const nd = d.dark ? " nd" : "";
  if (!d.tasks.length) {
    return `<div class="scr n${nd}"><div class="pg">${K.tb(d.score ?? "–", d.streak, fmt(d.gems))}<div class="ttl" style="margin-top:12px">Tasks</div>
<div style="display:flex;justify-content:center;margin-top:78px">${TPL.tasksEmpty.match(/<div style="display:flex;justify-content:center;margin-top:78px">(.*?)<\/div>\s*<div style="text-align:center;font:700 26px/s)?.[1] || ""}</div>
<div style="text-align:center;font:700 26px var(--display);margin-top:22px">Nothing to do yet</div><div style="text-align:center;font:600 14px/1.5 var(--body);color:var(--mut);margin-top:10px">Add your first task and plan your day.<br>Everything works offline.</div>
<div class="btn2" data-add-task style="margin-top:22px;border-radius:24px">Add your first task</div></div>${K.nav("tasks")}</div>`;
  }
  const seg = ["Today", "Week", "All"].map((s) => `<span${s === filter ? ' class="on"' : ""} data-filter="${s}">${s}</span>`).join("");
  const rows = list.length
    ? list.map((t) => `<div class="swipe" data-swipe="${esc(t.id)}"><div class="bk dn"><span style="width:20px;height:20px;display:block">${K.CHECK}</span>${t.completed ? "Undo" : "Done"}</div><div class="bk dl" style="left:auto;right:0;justify-content:flex-end"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 7h12l-1 14H7zM4 5h16v2H4zM9 2h6v2H9z"/></svg>Delete</div>${taskRow(t)}</div>`).join("")
    : `<div class="mut" style="font:600 14px var(--body);margin-top:18px;text-align:center">Nothing here. Try another tab or tap +.</div>`;
  return `<div class="scr n${nd}"><div class="pg">${K.tb(d.score ?? "–", d.streak, fmt(d.gems))}<div class="ttl" style="margin-top:12px">Tasks</div><div class="sub2">Swipe right to finish, left to delete.</div>
<div class="seg" data-segf>${seg}</div>
<div class="tlist" style="overflow:auto;max-height:calc(100% - 210px);padding-bottom:90px">${rows}</div>
</div><div class="fab" data-add-task>${K.ICO.plus}</div>${K.nav("tasks")}</div>`;
}

function profileHTML(d) {
  let h = person(TPL.profile, d);
  // Real numbers in place of the design's sample numbers.
  h = h.replace(/(<div><b>)12(<\/b><span>Following<\/span><\/div>)/, `$1${d.friends.length}$2`)
    .replace(/(<div><b>)8(<\/b><span>Followers<\/span><\/div>)/, `$1${d.friends.length}$2`)
    .replace("Joined 2026", `Joined ${d.joined || new Date().getFullYear()}`)
    .replace(/(<\/svg>)6 days(<\/div>)/, `$1${d.streak} days$2`)
    .replace(/(<\/svg>)18 tasks(<\/div>)/, `$1${d.tasksDone} tasks$2`)
    .replace(/(<\/svg>)42 hours(<\/div>)/, `$1${d.hours} hours$2`)
    .replace(/(<\/svg>)1,240 XP(<\/div>)/, `$1${fmt(d.gems)} gems$2`);
  // No friend-streak data exists yet, so that block of sample numbers is left out.
  h = h.replace(/<div class="sec">Friend streaks<\/div><div class="fs">.*?<\/div><\/div>(?=<div class="sec">Monthly badges)/s, "");
  // Hide the QR sheet until it is opened.
  const i = h.indexOf('<div class="ov" style="z-index:5">');
  const sheet = h.slice(i, h.lastIndexOf("</div></div>"));
  h = h.slice(0, i) + "</div>";
  return { html: h, sheet };
}

function examHTML(d) {
  const ex = d.exam;
  const nd = d.dark ? " nd" : "";
  const head = `<div class="hd"><span style="width:24px">${K.ICO.back}</span><b>Exam mode</b><span style="width:24px"></span></div>`;
  if (!ex) {
    return `<div class="scr n${nd}"><div class="pg" style="padding-top:38px">${head}
<div style="text-align:center;font:700 26px var(--display);margin-top:70px">No exam set</div><div style="text-align:center;font:600 14px/1.5 var(--body);color:var(--mut);margin-top:10px">Add a subject with its exam date and your countdown shows up here.</div>
<div class="btn2" data-go="addSubject" style="margin-top:22px;border-radius:24px">Add a subject</div></div></div>`;
  }
  const plan = d.tasks.filter((t) => !t.completed).slice(0, 4);
  const rows = plan.length ? plan.map((t) => taskRow(t)).join("") : `<div class="mut" style="font:600 14px var(--body);margin-top:10px">No open tasks. Add one to build today's plan.</div>`;
  return `<div class="scr n${nd}"><div class="pg" style="padding-top:38px">${head}
<div class="card dkc rw" style="justify-content:flex-start;gap:14px;border-radius:26px;height:114px"><div class="ring2">${K.ring(74, 8, ex.progress / 100, "#c9b8c3", "#3c4450")}<div class="c" style="font-size:17px">${ex.progress}%</div></div><div><div style="font:700 34px/1 var(--display);color:#c9b8c3">${ex.days === 0 ? "Today" : ex.days === 1 ? "1 day" : `${ex.days} days`}</div><div style="font:700 15px var(--body);color:#ebe8ea;margin-top:6px">${esc(ex.subject)} · ${esc(ex.dateLabel)}</div><div style="font:600 13px var(--body);color:#cfd2d6">Countdown progress</div></div></div>
<div class="rw" style="margin-top:16px"><b style="font:700 20px var(--display)">Today's plan</b><span class="mut" style="font:700 13px var(--body)">${plan.length} task${plan.length === 1 ? "" : "s"}</span></div>
${rows}
<div class="btn2" data-go="focus" style="margin-top:16px;border-radius:24px">Start a focus session</div></div></div>`;
}

function searchHTML(d, q = "") {
  const nd = d.dark ? " nd" : "";
  const term = q.trim().toLowerCase();
  const hits = term ? d.tasks.filter((t) => `${t.title} ${t.subject}`.toLowerCase().includes(term)) : [];
  const body = term
    ? (hits.length ? hits.map((t) => taskRow(t)).join("") : `<div class="mut" style="font:600 14px var(--body);margin-top:18px">No tasks match "${esc(q)}".</div>`)
    : `<div class="mut" style="font:600 14px var(--body);margin-top:18px">Type to search your tasks.</div>`;
  return `<div class="scr n${nd}"><div class="pg" style="padding-top:40px"><div style="display:flex;align-items:center;gap:14px"><span style="color:var(--ink)">${K.ICO.back}</span><div class="card rw" style="flex:1;margin:0;height:46px;border-radius:23px;padding:0 14px;justify-content:flex-start;gap:10px"><span style="color:var(--ink);display:flex">${K.ICO.search}</span><input class="dsq" data-q value="${esc(q)}" placeholder="Search your tasks" autocomplete="off" style="flex:1;min-width:0;border:0;outline:0;background:transparent;font:600 15px var(--body);color:var(--ink)"></div></div>
<div class="sres" style="margin-top:8px">${body}</div></div></div>`;
}

function friendsHTML(d) {
  let h = TPL.friends;
  const rows = [...d.friends.map((f) => ({ n: f.name, g: f.gems, id: f.id })), { n: `${d.first} (You)`, g: d.gems, me: true }]
    .sort((a, b) => b.g - a.g || a.n.localeCompare(b.n));
  const list = rows.map((r, i) => `<div class="lbrow${r.me ? " me" : ""}"><span class="rk">${i + 1}</span><span class="ava">${esc(r.n.charAt(0).toUpperCase())}</span><span>${esc(r.n)}</span><span class="mn">${fmt(r.g)} gems</span></div>`).join("");
  const a = h.indexOf('<div class="lbrow');
  const g = h.indexOf('<b style="display:block;font:700 20px var(--display);margin-top:18px">Study groups</b>');
  const btn = h.indexOf('<div class="btn2"', g);
  h = h.slice(0, a) + list + h.slice(btn);
  h = h.replace("This week · minutes studied", d.friends.length ? "Gems earned · you and your friends" : "Add friends to compete and earn 10 gems each");
  h = h.replace('<div class="btn2"', '<div class="btn2" data-invite');
  return themed(person(h, d), d);
}

// ---------- the runtime ----------
export function mountDesign(host, api) {
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${CSS}</style><style>
:host{display:block;position:absolute;inset:0;overflow:hidden;background:#dfe0e3}
.dsw{position:absolute;left:0;top:0;width:360px;transform-origin:0 0;font-family:var(--body)}
.st{position:relative;width:360px;height:100%;overflow:hidden}
.lyr{position:absolute;inset:0}
.lyr>.scr{position:absolute;inset:0}
input.sin,input.dsin{font:inherit}
.dsin{width:100%;height:46px;border-radius:14px;background:#dfe0e3;border:0;outline:0;padding:0 14px;font:600 16px var(--body);color:#1b1e25;margin:12px 0;box-sizing:border-box}
.dsta{width:100%;min-height:110px;border:0;outline:0;resize:none;background:transparent;font:600 15px/1.5 var(--body);color:inherit}
.swipe{position:relative;overflow:hidden;border-radius:20px;margin-top:8px}
.swipe .trow{position:relative;margin-top:0;touch-action:pan-y}
.swipe .bk.dl{position:absolute;top:0;bottom:0;right:0;left:auto;width:50%;display:flex;align-items:center;justify-content:flex-end;padding-right:18px}
.swipe .bk.dn{position:absolute;top:0;bottom:0;left:0;width:50%;display:flex;align-items:center;padding-left:18px}
.snack{z-index:4}
.dstoast{position:absolute;left:18px;right:18px;bottom:96px;z-index:30;background:#1b1e25;color:#fff;border-radius:16px;padding:13px 16px;font:700 14px var(--body);display:flex;justify-content:space-between;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.dstoast b{color:#c9b8c3;font-weight:700;cursor:pointer}
</style><div class="dsw"><div class="st"></div></div>`;
  const wrap = root.querySelector(".dsw");
  const st = root.querySelector(".st");
  const $ = (s, r = st) => r.querySelector(s);
  const $$ = (s, r = st) => [...r.querySelectorAll(s)];
  const hap = (k) => { try { api.haptic?.[k]?.(); } catch { /* ignore */ } };
  let stack = []; // [{key, arg}]
  let K0 = 1;
  let fullH = 0;
  let busy = false;
  let timer = null; // focus timer
  let tFilter = "Today";
  let destroyed = false;

  function layout() {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    fullH = Math.max(fullH, h);
    K0 = w / 360;
    wrap.style.transform = `scale(${K0})`;
    wrap.style.height = `${fullH / K0}px`;
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(host);

  // ---------- animations from the design (enter) ----------
  function enter(layer, quiet) {
    if (quiet) return;
    const pg = $(".pg", layer);
    if (pg) [...pg.children].forEach((el, i) => el.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 380, delay: i * 45, easing: "cubic-bezier(.2,.9,.3,1)", fill: "backwards" }));
    $$(".rp", layer).forEach((c) => { const L = +c.dataset.c, p = +c.dataset.p; c.animate([{ strokeDashoffset: L }, { strokeDashoffset: L * (1 - p) }], { duration: 900, delay: 200, easing: "cubic-bezier(.3,.8,.3,1)", fill: "backwards" }); });
    $$(".bar2 i", layer).forEach((b) => { b.style.transformOrigin = "left"; b.animate([{ transform: "scaleX(0)" }, { transform: "none" }], { duration: 800, delay: 250, easing: "cubic-bezier(.3,.8,.3,1)", fill: "backwards" }); });
    $$(".nav,.fab,.snack,.qcta", layer).forEach((el) => el.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 300, easing: "ease-out", fill: "backwards" }));
    $$(".sgrp,.ngrp,.sit,.nr", layer).forEach((el, i) => { if (i < 14) el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 340, delay: 80 + i * 35, easing: "cubic-bezier(.2,.9,.3,1)", fill: "backwards" }); });
  }

  // ---------- screens ----------
  const dataNow = () => api.get();

  function qpageHTML(title, d) {
    const p = PAGE[title];
    let h = p ? p.html() : `<div class="scr n"><div class="pg"><div class="qpt">${esc(title)}</div></div></div>`;
    const subj = (d.subjects && d.subjects.length ? d.subjects : ["Biology", "Maths", "Physics", "Chemistry"]).slice(0, 4);
    h = h.replace(/(<div class="chips">)(<span class="chip on" data-chip>Biology<\/span><span class="chip" data-chip>Maths<\/span><span class="chip" data-chip>Physics<\/span><span class="chip" data-chip>Chemistry<\/span>)(<\/div>)/g,
      `$1${subj.map((s, i) => `<span class="chip${i === 0 ? " on" : ""}" data-chip>${esc(s)}</span>`).join("")}$3`);
    // make the design's sample fields real inputs
    h = h.replace(/<div class="input" style="[^"]*">([^<]*)<\/div>/, (m, t) => `<input class="dsin" data-f="title" maxlength="80" placeholder="${esc(t)}" autocomplete="off">`);
    if (title === "Add note") {
      h = h.replace(/<div class="card" style="min-height:150px[^>]*>.*?<\/div><\/div>(?=<div class="chips")/s,
        `<div class="card" style="min-height:150px;margin-top:16px"><textarea class="dsta" data-f="content" maxlength="4000" placeholder="Write your note here..."></textarea></div>`);
      h = h.replace(/<div class="chips" style="margin-top:12px">.*?<\/div>/s, "");
    }
    h = h.replace(/<span class="chip on" data-chip>Today<\/span><span class="chip" data-chip>Tomorrow<\/span><span class="chip" data-chip>Pick date<\/span>/,
      '<span class="chip on" data-chip data-due="today">Today</span><span class="chip" data-chip data-due="tomorrow">Tomorrow</span><span class="chip" data-chip data-due="none">No date</span>');
    h = h.replace(/<span class="chip on" data-chip>Nov 21<\/span><span class="chip" data-chip>Dec 5<\/span><span class="chip" data-chip>Dec 18<\/span><span class="chip" data-chip>Not sure<\/span>/,
      (() => { const ds = [14, 28, 45].map((n) => new Date(Date.now() + n * 864e5)); const lab = (x) => x.toLocaleDateString("en-US", { month: "short", day: "numeric" }); return `<span class="chip" data-chip data-exam="${ds[0].toISOString().slice(0, 10)}">${lab(ds[0])}</span><span class="chip" data-chip data-exam="${ds[1].toISOString().slice(0, 10)}">${lab(ds[1])}</span><span class="chip" data-chip data-exam="${ds[2].toISOString().slice(0, 10)}">${lab(ds[2])}</span><span class="chip on" data-chip data-exam="">Not sure</span>`; })());
    return themed(h, d);
  }

  const STATIC_GEN = {
    settings: "settings", editProfile: "editProfile", prefs: "prefs", language: "language", sync: "sync", export: "export", storage: "storage",
    privacy: "privacy", notif: "notif", notifReminders: "notifReminders", notifFriends: "notifFriends", notifLeaderboards: "notifLeaderboards",
    notifNudges: "notifNudges", notifAnnounce: "notifAnnounce", themes: "themes", search: "search", weekly: "weekly", badges: "badges",
    goals: "goals", goalReached: "goalReached", widgets: "widgets",
  };

  function html(key, arg) {
    const d = dataNow();
    switch (key) {
      case "home": return { h: homeHTML(d) };
      case "tasks": return { h: tasksHTML(d, tFilter) };
      case "profile": { const p = profileHTML(d); return { h: p.html, sheet: p.sheet }; }
      case "friends": return { h: friendsHTML(d) };
      case "exam": return { h: examHTML(d) };
      case "search": return { h: searchHTML(d) };
      case "focusTimer": return { h: person(TPL.focusTimer, d) };
      case "study": return { h: qpageHTML("Quick Study", d) };
      case "focus": return { h: qpageHTML("Focus Session", d) };
      case "page": return { h: qpageHTML(arg, d) };
      default: if (STATIC_GEN[key]) return { h: themed(person(TPL[key], d), d) };
    }
    return { h: homeHTML(d) };
  }

  function renderLayer(key, arg, quiet) {
    const r = html(key, arg);
    const lyr = document.createElement("div");
    lyr.className = "lyr";
    lyr.dataset.key = key;
    lyr.innerHTML = r.h;
    if (r.sheet) lyr._sheet = r.sheet;
    applyPrefs(lyr);
    return lyr;
  }

  function show(key, arg, mode = "tab") {
    if (destroyed) return;
    const cur = $(".lyr:last-child");
    const lyr = renderLayer(key, arg);
    st.appendChild(lyr);
    const isTab = TABS.includes(key);
    if (mode === "tab") stack = [{ key, arg }];
    else if (mode === "push") stack.push({ key, arg });
    else if (mode === "replace") stack[stack.length - 1] = { key, arg };
    if (cur && mode === "push") {
      lyr.animate([{ transform: "translateX(100%)" }, { transform: "none" }], { duration: 300, easing: "cubic-bezier(.2,.9,.3,1)" });
      cur.animate([{ transform: "none" }, { transform: "translateX(-24%)", opacity: 0.6 }], { duration: 300, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" });
      setTimeout(() => { cur.remove(); }, 310);
    } else if (cur && mode === "back") {
      lyr.animate([{ transform: "translateX(-24%)", opacity: 0.6 }, { transform: "none", opacity: 1 }], { duration: 280, easing: "cubic-bezier(.2,.9,.3,1)" });
      cur.style.zIndex = 5;
      cur.animate([{ transform: "none" }, { transform: "translateX(100%)" }], { duration: 280, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" });
      setTimeout(() => cur.remove(), 290);
    } else if (cur) {
      lyr.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      setTimeout(() => cur.remove(), 210);
    }
    if (isTab && mode === "tab") hap("nav"); else hap("tap");
    enter(lyr);
    if (key === "profile") profileScroll(lyr);
  }

  function goBack() {
    if (stack.length > 1) {
      const cur = $(".lyr:last-child");
      stack.pop();
      const t = stack[stack.length - 1];
      const lyr = renderLayer(t.key, t.arg);
      lyr.style.zIndex = 0;
      st.insertBefore(lyr, cur);
      lyr.animate([{ transform: "translateX(-24%)", opacity: 0.6 }, { transform: "none", opacity: 1 }], { duration: 280, easing: "cubic-bezier(.2,.9,.3,1)" });
      if (cur) {
        cur.style.zIndex = 5;
        cur.animate([{ transform: "none" }, { transform: "translateX(100%)" }], { duration: 280, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" });
        setTimeout(() => cur.remove(), 290);
      }
      hap("tap");
      enter(lyr, true);
    } else {
      show("home", null, "tab");
    }
  }

  // The profile page collapses its header when scrolled; the design does this with data-sc / data-bar.
  function profileScroll(lyr) {
    const sc = $("[data-sc]", lyr), bar = $("[data-bar]", lyr), hero = $(".hero", lyr);
    if (!sc || !bar) return;
    const upd = () => {
      const t = sc.scrollTop;
      bar.style.opacity = String(Math.min(1, Math.max(0, (t - 60) / 80)));
    };
    sc.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  // ---------- saved switches ----------
  const switchesOf = (lyr) => $$(".ptg, .rtg, .tg, .tgx, .nib", lyr);
  function savePref(lyr, el) {
    const p = loadPrefs();
    p.sw = p.sw || {};
    const idx = switchesOf(lyr).indexOf(el);
    p.sw[`${lyr.dataset.key}#${idx}`] = el.classList.contains("nib") ? el.classList.contains("on") : !el.classList.contains("off");
    savePrefs(p);
  }
  function applyPrefs(lyr) {
    const p = loadPrefs();
    if (!p.sw) return;
    switchesOf(lyr).forEach((el, i) => {
      const v = p.sw[`${lyr.dataset.key}#${i}`];
      if (v === undefined) return;
      if (el.classList.contains("nib")) el.classList.toggle("on", v); else el.classList.toggle("off", !v);
    });
    if (p.lang !== undefined) $$("[data-lang]", lyr).forEach((x) => x.classList.toggle("on", x.dataset.lang === String(p.lang)));
  }

  // ---------- events ----------
  function toast(msg, action, fn) {
    $$(".dstoast").forEach((t) => t.remove());
    const t = document.createElement("div");
    t.className = "dstoast";
    t.innerHTML = `<span>${esc(msg)}</span>${action ? `<b>${esc(action)}</b>` : ""}`;
    st.appendChild(t);
    t.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "ease-out" });
    if (action) $("b", t).addEventListener("click", () => { fn?.(); t.remove(); });
    setTimeout(() => t.remove(), 4200);
  }

  function openSheet(kind) {
    const lyr = $(".lyr:last-child");
    if (!lyr || $(".ov", lyr)) return;
    const html2 = kind === "qr" ? lyr._sheet : quickAddSheet();
    if (!html2) return;
    const box = document.createElement("div");
    box.className = "sheetbox";
    box.innerHTML = html2;
    box.dataset.kind = kind;
    $(".scr", lyr).appendChild(box);
    const ov = $(".ov", box), sh = $(".qsheet,.qsh", box);
    ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: "backwards" });
    sh.animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.2,.9,.3,1)", fill: "backwards" });
    $$(".qt", box).forEach((t, i) => t.animate([{ opacity: 0, transform: "scale(.7) translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: 260 + i * 35, easing: "cubic-bezier(.2,1.1,.4,1)", fill: "backwards" }));
    hap("tap");
  }
  function closeSheet() {
    const box = $(".sheetbox");
    if (!box) return false;
    const sh = $(".qsheet,.qsh", box), ov = $(".ov", box);
    sh?.animate([{ transform: "none" }, { transform: "translateY(100%)" }], { duration: 260, fill: "forwards", easing: "ease-in" });
    ov?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" });
    setTimeout(() => box.remove(), 270);
    return true;
  }

  const PAGE_KEYS = { "Add note": "Add note", Planner: "Planner", "Add subject": "Add subject", Quiz: "Quiz", Progress: "Progress", Achievement: "Achievement", Reminder: "Reminder", "Upload file": "Upload file", "Add task": "Add task" };
  const SETTINGS_MAP = {
    Profile: "editProfile", Preferences: "prefs", Appearance: "themes", Language: "language", Notifications: "notif",
    "Sync and offline": "sync", "Export my data": "export", "Storage and downloads": "storage", "Privacy settings": "privacy",
  };
  const NOTIF_MAP = {
    "Notifications · Reminders": "notifReminders", "Notifications · Friends": "notifFriends", "Notifications · Leaderboards": "notifLeaderboards",
    "Notifications · Friend Nudges": "notifNudges", "Notifications · Announcements": "notifAnnounce",
  };

  function chipPick(c) {
    const parent = c.parentNode;
    $$("[data-chip]", parent).forEach((x) => x.classList.remove("on"));
    c.classList.add("on");
    hap("select");
  }

  async function onSave(btn, lyr) {
    const kind = btn.dataset.save;
    const d = dataNow();
    const val = (sel) => ($(sel, lyr)?.value || "").trim();
    const chip = (grp) => $(`${grp} .on`, lyr)?.textContent.trim();
    if (kind === "task") {
      const title = val("[data-f=title]");
      if (!title) { toast("Write the task first."); hap("warning"); return; }
      const dueSel = $(".chips [data-due].on", lyr)?.dataset.due;
      const dueDate = dueSel === "today" ? new Date().toISOString().slice(0, 10) : dueSel === "tomorrow" ? new Date(Date.now() + 864e5).toISOString().slice(0, 10) : "";
      const pr = ($(".seg[data-seg] .on", lyr)?.textContent || "Medium").trim().toLowerCase();
      const ok = await api.addTask({ title, subject: $(".chips [data-chip].on", lyr)?.textContent.trim() || "Personal", priority: pr, dueDate });
      if (ok) { hap("add"); goBack(); toast("Task added"); } else { hap("error"); toast("Could not add the task."); }
    } else if (kind === "note") {
      const title = val("[data-f=title]");
      const content = val("[data-f=content]");
      if (!title || !content) { toast("Add a title and some text."); hap("warning"); return; }
      const ok = await api.addNote({ title, content, subject: $(".chips [data-chip].on", lyr)?.textContent.trim() || "Personal" });
      if (ok) { hap("note"); goBack(); toast("Note saved"); } else { hap("error"); toast("Could not save the note."); }
    } else if (kind === "subject") {
      const name = val("[data-f=title]");
      if (!name) { toast("Type the subject name."); hap("warning"); return; }
      const date = $("[data-exam].on", lyr)?.dataset.exam || "";
      const ok = await api.addSubject({ name, examDate: date });
      if (ok) { hap("add"); goBack(); toast(date ? "Subject and exam added" : "Subject added"); } else { hap("error"); toast("Could not add the subject."); }
    } else if (kind === "focus" || kind === "study") {
      const subject = $(".chips [data-chip].on", lyr)?.textContent.trim() || "";
      let minutes = lyr._min || 25;
      if (kind === "study") {
        const rows = $$(".qrow", lyr);
        const sel = $(".qrow.picked", lyr) || rows[0];
        minutes = parseInt($(".qrr", sel)?.textContent, 10) || 5;
      }
      startTimer(minutes, subject);
    } else {
      toast("Saved on this phone");
      goBack();
    }
  }

  // ---------- focus timer ----------
  function startTimer(minutes, subject) {
    stopTick();
    timer = { total: minutes * 60, left: minutes * 60, subject, paused: false, round: 1, rounds: 4, start: Date.now() };
    show("focusTimer", null, "push");
    setTimeout(() => bindTimer(), 40);
  }
  let tick = null;
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }
  function bindTimer() {
    const lyr = $(".lyr:last-child");
    if (!lyr || !timer) return;
    const ctr = $("#fct", lyr);
    const sub = $$("div", lyr).find((x) => /Round \d of/.test(x.textContent) && !x.children.length);
    const ringEl = $(".rp", lyr);
    const C = ringEl ? +ringEl.dataset.c : 0;
    const paint = () => {
      const m = Math.floor(timer.left / 60), s = timer.left % 60;
      if (ctr) ctr.textContent = `${m}:${String(s).padStart(2, "0")}`;
      if (ringEl) ringEl.setAttribute("stroke-dashoffset", String(C * (1 - timer.left / timer.total)));
      if (sub) sub.textContent = timer.subject ? `${timer.subject} · ${Math.round(timer.total / 60)} min` : `${Math.round(timer.total / 60)} min focus`;
    };
    paint();
    stopTick();
    tick = setInterval(() => {
      if (!timer || timer.paused) return;
      timer.left -= 1;
      if (timer.left <= 0) { timer.left = 0; paint(); finishTimer(true); return; }
      paint();
    }, 1000);
  }
  async function finishTimer(done) {
    stopTick();
    const t = timer;
    timer = null;
    if (!t) return;
    const mins = done ? Math.round(t.total / 60) : Math.floor((t.total - t.left) / 60);
    if (mins >= 1) {
      const res = await api.saveFocus({ minutes: mins, subject: t.subject });
      api.haptic?.success?.();
      toast(res ? `Session saved · ${mins} min` : "Session finished (not saved)");
    }
    stack = [{ key: "home" }];
    show("home", null, "tab");
  }

  // ---------- swipe on tasks ----------
  let drag = null;
  function onPointerDown(e) {
    const row = e.target.closest?.(".swipe .trow");
    if (!row) return;
    drag = { row, x0: e.clientX, y0: e.clientY, dx: 0, id: row.closest(".swipe").dataset.swipe, locked: false };
  }
  function onPointerMove(e) {
    if (!drag) return;
    const dx = (e.clientX - drag.x0) / K0, dy = (e.clientY - drag.y0) / K0;
    if (!drag.locked) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) > 8) drag.locked = true;
    }
    if (drag.locked) { drag.dx = dx; drag.row.style.transform = `translateX(${Math.max(-140, Math.min(140, dx))}px)`; }
  }
  async function onPointerUp() {
    if (!drag) return;
    const { row, dx, id, locked } = drag;
    drag = null;
    if (!locked) return;
    const back2 = () => row.animate([{ transform: row.style.transform }, { transform: "none" }], { duration: 220, easing: "ease-out" }), reset = () => { row.style.transform = ""; };
    if (dx > 90) {
      hap("success");
      await api.toggleTask(id);
      refresh();
    } else if (dx < -90) {
      hap("warning");
      const d = dataNow();
      const task = d.tasks.find((t) => String(t.id) === String(id));
      row.animate([{ transform: row.style.transform }, { transform: "translateX(-120%)" }], { duration: 200, fill: "forwards" });
      await api.deleteTask(id);
      refresh();
      toast("Task deleted", "UNDO", () => { if (task) api.addTask({ title: task.title, subject: task.subject, priority: task.priority, dueDate: task.dueDate }).then(refresh); });
    } else { back2(); reset(); }
  }

  function refresh() {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (["home", "tasks", "profile", "friends"].includes(top.key)) {
      const cur = $(".lyr:last-child");
      const scTop = cur ? ($("[data-sc]", cur)?.scrollTop || 0) : 0;
      const lyr = renderLayer(top.key, top.arg);
      st.appendChild(lyr);
      if (cur) cur.remove();
      const sc = $("[data-sc]", lyr);
      if (sc) sc.scrollTop = scTop;
      if (top.key === "profile") profileScroll(lyr);
    }
  }

  async function onClick(e) {
    if (drag && drag.locked) return;
    const t = e.target;
    const lyr = $(".lyr:last-child");
    const c = (sel) => t.closest?.(sel);

    // sheets
    const box = $(".sheetbox");
    if (box) {
      if (c("[data-close]") || c("[data-close2]") || c(".ov") || c(".qcancel") || c(".cl")) { closeSheet(); hap("tap"); return; }
      const o = c("[data-open]");
      if (o) {
        const title = o.dataset.open;
        closeSheet();
        setTimeout(() => show("page", PAGE_KEYS[title] || title, "push"), 120);
        return;
      }
      const sh = c("[data-sh]");
      if (sh) {
        const d = dataNow();
        const text = `Add me on StudyOS: @${d.handle}`;
        const label = sh.textContent.trim();
        if (/copy/i.test(label)) { try { await navigator.clipboard.writeText(text); toast("Copied"); } catch { toast("Could not copy"); } }
        else if (/share/i.test(label)) { api.share?.(text); }
        else toast("Saved");
        return;
      }
      return;
    }

    const nv = c(".nv[data-k]");
    if (nv) { const k = nv.dataset.k; if (k !== stack[0]?.key || stack.length > 1) show(k, null, "tab"); return; }

    if (c("[data-a=back]") || c(".sbk") || c(".qback") || c("[data-back]") || c("[data-done]")) { goBack(); return; }

    const hs = c(".hd > span");
    if (hs && hs.querySelector("svg")) {
      if (hs === hs.parentNode.firstElementChild) { goBack(); return; }
      if (lyr?.dataset.key === "friends") { api.share?.("Study with me on StudyOS!"); return; }
      if (lyr?.dataset.key === "weekly") { api.share?.("My week on StudyOS"); return; }
      return;
    }
    if (lyr?.dataset.key === "search" && c(".pg > div:first-child > span:first-child")) { goBack(); return; }
    if (c("[data-fab]")) { openSheet("add"); return; }
    if (c("[data-add-task]")) { show("page", "Add task", "push"); return; }
    const go = c("[data-go]");
    if (go) {
      const k = go.dataset.go;
      if (SETTINGS_MAP[k]) show(SETTINGS_MAP[k], null, "push");
      else if (k === "addSubject") show("page", "Add subject", "push");
      else if (k === "focus") show("focus", null, "tab");
      else if (TABS.includes(k)) show(k, null, "tab");
      else show(k, null, "push");
      return;
    }
    const fl = c("[data-filter]");
    if (fl) { tFilter = fl.dataset.filter; refresh(); hap("select"); return; }

    // task checkbox
    const cb = c(".cb");
    const row = c("[data-tid]");
    if (cb && row) { hap(row.querySelector(".cb.ck") ? "tap" : "success"); await api.toggleTask(row.dataset.tid); refresh(); return; }

    // top bar search icon
    if (c(".tb .ic")) { show("search", null, "push"); return; }
    // profile
    if (c("[data-gear]")) { show("settings", null, "push"); return; }
    if (c("[data-qr]")) { openSheet("qr"); return; }
    if (c("[data-friends]")) { show("friends", null, "push"); return; }
    if (c("[data-edit]")) { show("editProfile", null, "push"); return; }
    if (c("[data-look]")) { toast("New avatar looks are coming soon"); return; }

    // settings list
    const it = c(".sit[data-it]");
    if (it && !it.classList.contains("rd") && lyr?.dataset.key === "settings") {
      const k = SETTINGS_MAP[it.dataset.it];
      if (k) show(k, null, "push");
      else if (it.dataset.it === "Help Center") window.open("/help.html", "_blank", "noopener");
      else if (it.dataset.it === "Feedback") window.open("/feedback.html", "_blank", "noopener");
      return;
    }
    if (c("[data-out]")) { api.logout?.(); return; }

    // notification pages
    const nr = c('.nr[data-a="open"]');
    if (nr) { show(NOTIF_MAP[nr.dataset.t] || "notif", null, "push"); return; }
    const tm = c('.nr[data-a="tm"]');
    if (tm) { toast("Reminder times follow your phone clock for now."); return; }

    // toggles (the design marks "off" with the class off) and push / email icons on the notification pages
    const sw = c(".ptg, .rtg, .tg, .tgx, .nib");
    const swRow = c('.nr[data-a="tg"], .sit.tgl, .scd');
    const sw2 = sw || (swRow && $(".ptg, .rtg, .tg, .tgx", swRow));
    if (sw2 && lyr) {
      if (sw2.classList.contains("nib")) sw2.classList.toggle("on"); else sw2.classList.toggle("off");
      hap("select");
      savePref(lyr, sw2);
      return;
    }
    const lang = c("[data-lang]");
    if (lang) { $$("[data-lang]", lang.parentNode).forEach((x) => x.classList.remove("on")); lang.classList.add("on"); hap("select"); const p = loadPrefs(); p.lang = lang.dataset.lang; savePrefs(p); toast("Only English is available in this version"); return; }
    if (c("[data-ref]")) { hap("tap"); const el = $("[data-last]", lyr); if (el) el.textContent = `Last synced: Today at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`; api.sync?.(); return; }
    if (c("[data-del]")) { toast("To delete your account, email support from the StudyOS website."); return; }
    if (c("[data-av]")) { toast("Avatar looks are coming soon"); return; }
    const th = c(".th");
    if (th) { if (!/Free/.test(th.textContent)) { toast("Unlock this theme with gems in the Shop"); return; } $$(".th", th.parentNode).forEach((x) => x.classList.remove("sel")); th.classList.add("sel"); hap("select"); api.setTheme?.(/Midnight/.test(th.textContent) ? "dark" : "light"); return; }

    // chips, segments, colour dots
    const chp = c("[data-chip]");
    if (chp) { chipPick(chp); return; }
    if (lyr?.dataset.key === "themes" && c(".seg span")) { const s1 = c(".seg span"); $$("span", s1.parentNode).forEach((x) => x.classList.remove("on")); s1.classList.add("on"); hap("select"); api.setTheme?.(s1.textContent.trim().toLowerCase()); return; }
    const sp = c("[data-seg] span");
    if (sp) { $$("span", sp.parentNode).forEach((x) => x.classList.remove("on")); sp.classList.add("on"); hap("select"); return; }
    const qr = c(".qrow");
    if (qr && lyr?.querySelector("[data-save=study]")) { $$(".qrow", lyr).forEach((x) => x.classList.remove("picked")); qr.classList.add("picked"); qr.style.outline = "2px solid #1b1e25"; $$(".qrow", lyr).filter((x) => x !== qr).forEach((x) => (x.style.outline = "")); hap("select"); return; }
    const sv = c("[data-save]");
    if (sv) { onSave(sv, lyr); return; }
    const stp = c(".qstep button");
    if (stp && lyr) {
      lyr._min = Math.max(5, Math.min(120, (lyr._min || 25) + (stp.textContent.includes("+") ? 5 : -5)));
      const cEl = $(".qring .c", lyr); if (cEl) cEl.textContent = `${lyr._min}:00`;
      hap("select"); return;
    }
    // timer buttons
    if (lyr?.dataset.key === "focusTimer") {
      const b = c(".btn2");
      if (b) {
        if (/stop/i.test(b.textContent)) { finishTimer(false); return; }
        if (/pause|resume/i.test(b.textContent) && timer) { timer.paused = !timer.paused; b.textContent = timer.paused ? "Resume" : "Pause"; hap("tap"); return; }
      }
    }
    if (c("[data-invite]")) { api.share?.("Study with me on StudyOS!"); return; }
    if (c(".sbtn") && /export/i.test(c(".sbtn").textContent)) { toast("Your export is being prepared"); return; }
    if (c(".lbrow")) return;
  }

  // inputs on Edit profile: save the display name when the person finishes typing
  async function onChange(e) {
    const lyr = $(".lyr:last-child");
    if (lyr?.dataset.key !== "editProfile") return;
    const ins = $$("input.sin", lyr);
    if (ins.length < 2) return;
    const name = `${ins[0].value.trim()} ${ins[1].value.trim()}`.trim();
    if (name.length >= 2 && name.length <= 40) {
      const ok = await api.saveName(name);
      toast(ok ? "Name updated" : "Could not update your name");
    }
  }

  st.addEventListener("input", (e) => {
    const q = e.target.closest?.("[data-q]");
    if (!q) return;
    const lyr = $(".lyr:last-child");
    const res = $(".sres", lyr);
    if (!res) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = searchHTML(dataNow(), q.value);
    res.innerHTML = $(".sres", tmp).innerHTML;
  });
  st.addEventListener("click", onClick);
  st.addEventListener("change", onChange);
  st.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  show(api.start || "home", null, "tab");

  return {
    refresh,
    back: () => { if ($(".sheetbox")) { closeSheet(); return true; } if (stack.length > 1) { goBack(); return true; } if (stack[0]?.key !== "home") { show("home", null, "tab"); return true; } return false; },
    show: (k, a) => show(k, a, "tab"),
    destroy() {
      destroyed = true;
      stopTick();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    },
  };
}
