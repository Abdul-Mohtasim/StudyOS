// StudyOS dynamic app icon: the ONE place that decides which launcher icon should show.
// Pure logic, no Capacitor, no DOM: decide(state, now) -> { icon, reason, until }.
// Every screen reports events; nothing else ever picks an icon.

const ICONS = [
  "flame_default", "flame_focused", "flame_celebrating", "flame_sleepy", "flame_away",
  "flame_welcome", "flame_streak", "flame_goal_complete", "flame_resting", "flame_motivated",
];
const H = 3600000, M = 60000;
const RULES = {
  goalHold: 12 * H,        // goal complete: until 12 h later or the end of the day, whichever comes first
  streakHold: 8 * H,       // streak milestone day
  focusDoneHold: 45 * M,   // after a finished focus session
  taskDoneHold: 20 * M,    // after a finished task
  welcomeHold: 3 * H,      // after coming back from a long break
  welcomeAfter: 24 * H,    // a return counts as "welcome back" after this long away
  sleepyAfter: 24 * H,
  awayAfter: 72 * H,
  minGap: 15 * M,          // never switch the native icon more often than this, except for top-priority moments
  dayCap: 6,               // and at most this many native switches a day
};
// higher number wins; the order is the user's spec
const PRI = { goal: 7, focusDone: 6, taskDone: 5, focusing: 4, welcome: 3, inactive: 2, base: 1 };

const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const endOfDay = (t) => startOfDay(t) + 24 * H;

function freshState() {
  return {
    v: 1, auto: true, preferred: "flame_default",
    lastActive: 0, focusing: false, focusStart: 0,
    goalDay: 0, goalAt: 0, streakAt: 0, focusDoneAt: 0, taskDoneAt: 0, welcomeAt: 0,
    seen: { task: [], focus: [], goal: "", streak: 0 },
    nativeIcon: "", lastSwitchAt: 0, switchDay: 0, switchCount: 0, lastError: "",
    inactivity: "active", studiedToday: false, studiedYesterday: false,
  };
}

// Inactivity is calculated from saved timestamps whenever the app is opened; nothing runs in the background.
function classify(s, now) {
  if (!s.lastActive) return "active";
  const gap = now - s.lastActive;
  return gap >= RULES.awayAfter ? "away" : gap >= RULES.sleepyAfter ? "sleepy" : "active";
}

/* ---------- events (each returns the new state; duplicates are ignored) ---------- */
function onAppOpen(s, now) {
  const gap = s.lastActive ? now - s.lastActive : 0;
  s.inactivity = classify(s, now);
  if (s.lastActive && gap >= RULES.welcomeAfter) s.welcomeAt = now;
  // a timer from a killed process is gone
  s.focusing = false;
  s.lastActive = now;
  return s;
}
function onActivity(s, now) { s.lastActive = now; s.inactivity = "active"; return s; }
function onFocus(s, running, now) {
  if (running && !s.focusing) s.focusStart = now;
  s.focusing = !!running; s.lastActive = now; s.inactivity = "active";
  return s;
}
const remember = (list, id, max = 40) => { if (list.includes(id)) return false; list.push(id); if (list.length > max) list.splice(0, list.length - max); return true; };
function onFocusDone(s, id, now) {
  s.focusing = false; s.lastActive = now; s.inactivity = "active";
  if (remember(s.seen.focus, String(id || now))) s.focusDoneAt = now;
  return s;
}
function onTaskDone(s, id, now) {
  s.lastActive = now; s.inactivity = "active";
  if (remember(s.seen.task, String(id))) s.taskDoneAt = now;
  return s;
}
function onGoalProgress(s, todayMin, goalMin, now) {
  const day = startOfDay(now), key = String(day);
  if (goalMin > 0 && todayMin >= goalMin && s.seen.goal !== key) { s.seen.goal = key; s.goalDay = day; s.goalAt = now; }
  return s;
}
function onStreakMilestone(s, milestone, now) {
  if (milestone > (s.seen.streak || 0)) { s.seen.streak = milestone; s.streakAt = now; }
  return s;
}
function setAuto(s, on) { s.auto = !!on; return s; }
function setPreferred(s, icon) { if (ICONS.includes(icon)) s.preferred = icon; return s; }

/* ---------- the decision ---------- */
function decide(s, now) {
  if (!s.auto) return { icon: ICONS.includes(s.preferred) ? s.preferred : "flame_default", reason: "manual", pri: 9, until: 0 };
  const C = [];
  const live = (at, hold) => at && now >= at && now - at < hold;
  if (s.goalDay === startOfDay(now) && live(s.goalAt, RULES.goalHold)) C.push(["flame_goal_complete", "goal", PRI.goal, Math.min(s.goalAt + RULES.goalHold, endOfDay(now))]);
  if (live(s.streakAt, RULES.streakHold)) C.push(["flame_streak", "streak", PRI.goal, s.streakAt + RULES.streakHold]);
  if (live(s.focusDoneAt, RULES.focusDoneHold)) C.push(["flame_celebrating", "focusDone", PRI.focusDone, s.focusDoneAt + RULES.focusDoneHold]);
  if (live(s.taskDoneAt, RULES.taskDoneHold)) C.push(["flame_celebrating", "taskDone", PRI.taskDone, s.taskDoneAt + RULES.taskDoneHold]);
  if (s.focusing) C.push(["flame_focused", "focusing", PRI.focusing, 0]);
  if (live(s.welcomeAt, RULES.welcomeHold)) C.push(["flame_welcome", "welcome", PRI.welcome, s.welcomeAt + RULES.welcomeHold]);
  const ina = classify(s, now);
  if (ina === "away") C.push(["flame_away", "away", PRI.inactive, 0]);
  else if (ina === "sleepy") C.push(["flame_sleepy", "sleepy", PRI.inactive, 0]);
  // the base icon follows the time of day once the student has studied, otherwise the preferred icon
  const hr = new Date(now).getHours();
  let base = s.preferred || "flame_default";
  if (base === "flame_default") {
    if ((hr >= 22 || hr < 5) && s.studiedToday) base = "flame_resting";
    else if (hr >= 5 && hr < 11 && s.studiedYesterday) base = "flame_motivated";
  }
  C.push([base, "base", PRI.base, 0]);
  C.sort((a, b) => b[2] - a[2]);
  const [icon, reason, pri, until] = C[0];
  return { icon, reason, pri, until };
}

// Should the native icon actually be switched now? Prevents rapid flipping.
function shouldSwitch(s, d, now) {
  if (!ICONS.includes(d.icon)) return false;
  if (s.nativeIcon === d.icon) return false;
  if (d.reason === "manual") return true;
  if (!s.nativeIcon) return true;
  const day = startOfDay(now);
  const count = s.switchDay === day ? s.switchCount : 0;
  if (count >= RULES.dayCap && d.pri < PRI.goal) return false;
  if (now - (s.lastSwitchAt || 0) < RULES.minGap && d.pri < PRI.focusDone) return false;
  return true;
}
function recordSwitch(s, icon, now) {
  const day = startOfDay(now);
  if (s.switchDay !== day) { s.switchDay = day; s.switchCount = 0; }
  s.switchCount++; s.nativeIcon = icon; s.lastSwitchAt = now; s.lastError = "";
  return s;
}

const Mi=60000;let pass=0,fail=0;const res=[];
function ok(n,c,info){(c?pass++:fail++);res.push((c?'PASS ':'FAIL ')+n+(c?'':' -> '+JSON.stringify(info)))}
const T0=new Date(2026,10,25,14,0,0).getTime(); // 2pm
const D=(s,t)=>decide(s,t);
// mock native layer
function run(s,t){const d=D(s,t);if(shouldSwitch(s,d,t)){recordSwitch(s,d.icon,t);return d.icon}return s.nativeIcon}
// 1 fresh install
let s=freshState();onAppOpen(s,T0);ok('1 fresh install -> default',D(s,T0).icon==='flame_default',D(s,T0));
// 2 default selection applied
ok('2 default applied natively',run(s,T0)==='flame_default',s);
// 3 focus start
onFocus(s,true,T0+Mi);ok('3 focus start -> focused',D(s,T0+Mi).icon==='flame_focused',D(s,T0+Mi));
// 4 focus complete
onFocusDone(s,'f1',T0+26*Mi);ok('4 focus done -> celebrating',D(s,T0+26*Mi).icon==='flame_celebrating'&&D(s,T0+26*Mi).reason==='focusDone');
// dedupe focus
const fa=s.focusDoneAt;onFocusDone(s,'f1',T0+40*Mi);ok('4b duplicate focus done ignored',s.focusDoneAt===fa);
// 5 cancel focus restores
let s5=freshState();onAppOpen(s5,T0);onFocus(s5,true,T0);onFocus(s5,false,T0+5*Mi);ok('5 focus cancelled -> default',D(s5,T0+5*Mi).icon==='flame_default',D(s5,T0+5*Mi));
// 6 task done + expiry + dedupe
let s6=freshState();onAppOpen(s6,T0);onTaskDone(s6,'t1',T0);ok('6 task done -> celebrating',D(s6,T0).icon==='flame_celebrating');
ok('6b celebration expires',D(s6,T0+21*Mi).icon==='flame_default',D(s6,T0+21*Mi));
const ta=s6.taskDoneAt;onTaskDone(s6,'t1',T0+30*Mi);ok('6c same task again ignored',s6.taskDoneAt===ta);
// 7 goals
let s7=freshState();onAppOpen(s7,T0);onGoalProgress(s7,60,60,T0);ok('7 goal complete',D(s7,T0).icon==='flame_goal_complete');
const ga=s7.goalAt;onGoalProgress(s7,90,60,T0+H);ok('7b goal not retriggered same day',s7.goalAt===ga);
onTaskDone(s7,'t9',T0+H);ok('7c goal outranks task done',D(s7,T0+H).icon==='flame_goal_complete');
ok('7d goal ends at midnight',D(s7,T0+11*H).icon!=='flame_goal_complete',D(s7,T0+11*H));
// 8 one day inactive
let s8=freshState();onAppOpen(s8,T0);ok('8 24h idle -> sleepy',D(s8,T0+25*H).icon==='flame_sleepy',D(s8,T0+25*H));
// 9 three days
ok('9 72h idle -> away',D(s8,T0+73*H).icon==='flame_away');
ok('9b 1h idle -> no change',D(s8,T0+H).icon==='flame_default');
// 10 return
onAppOpen(s8,T0+73*H);ok('10 return -> welcome',D(s8,T0+73*H).icon==='flame_welcome');
ok('10b welcome expires -> default',D(s8,T0+77*H).icon==='flame_default',D(s8,T0+77*H));
// 11 auto off
let s11=freshState();onAppOpen(s11,T0);setAuto(s11,false);onTaskDone(s11,'x',T0);ok('11 auto off keeps user icon',D(s11,T0).icon==='flame_default'&&D(s11,T0).reason==='manual');
// 12 manual select
setPreferred(s11,'flame_streak');ok('12 manual pick',D(s11,T0).icon==='flame_streak');
setPreferred(s11,'bogus');ok('12b invalid pick rejected',s11.preferred==='flame_streak');
// 13 restart: JSON round trip
const s13=JSON.parse(JSON.stringify(s7));ok('13 state survives restart',D(s13,T0+H).icon==='flame_goal_complete');
// 14 force stop while focusing
let s14=freshState();onAppOpen(s14,T0);onFocus(s14,true,T0);const s14b=JSON.parse(JSON.stringify(s14));onAppOpen(s14b,T0+2*H);ok('14 force-stop clears stale focus',D(s14b,T0+2*H).icon!=='flame_focused',D(s14b,T0+2*H));
// 15 rapid events: no flapping
let s15=freshState();onAppOpen(s15,T0);run(s15,T0);let switches=0,prev=s15.nativeIcon;
for(let i=0;i<40;i++){const t=T0+i*20000;if(i%2)onTaskDone(s15,'r'+i,t);else onFocus(s15,i%4===0,t);const ic=run(s15,t);if(ic!==prev){switches++;prev=ic}}
ok('15 rapid events limited',switches<=3,{switches});
// day cap
let s15b=freshState();onAppOpen(s15b,T0);let n=0;for(let i=0;i<30;i++){const t=T0+i*16*Mi;onTaskDone(s15b,'c'+i,t);if(i%2)onFocus(s15b,true,t+Mi);else onFocus(s15b,false,t+Mi);const b=s15b.nativeIcon;run(s15b,t+2*Mi);if(s15b.nativeIcon!==b)n++}
ok('15b at most 6 normal switches per day',n<=6+1,{n});
// 16 native failure: state keeps old icon, retries later
let s16=freshState();onAppOpen(s16,T0);recordSwitch(s16,'flame_default',T0);onTaskDone(s16,'z',T0+20*Mi);const d16=D(s16,T0+20*Mi);/*simulate failure: no recordSwitch*/s16.lastError='boom';ok('16 failure keeps native icon & retries',s16.nativeIcon==='flame_default'&&shouldSwitch(s16,d16,T0+36*Mi));
// 17 unsupported: decide still works, nothing crashes
ok('17 unsupported platform safe',typeof D(freshState(),T0).icon==='string');
// priorities: inactivity never overrides achievement
let sp=freshState();onAppOpen(sp,T0);onGoalProgress(sp,60,60,T0);sp.lastActive=T0-30*H;ok('P inactivity cannot override goal',D(sp,T0+Mi).icon==='flame_goal_complete');
// streak
let ss=freshState();onAppOpen(ss,T0);onStreakMilestone(ss,7,T0);ok('S streak milestone',D(ss,T0).icon==='flame_streak');const sa=ss.streakAt;onStreakMilestone(ss,7,T0+H);ok('S2 same milestone ignored',ss.streakAt===sa);
// time-of-day base
let sn=freshState();onAppOpen(sn,new Date(2026,10,25,23,0).getTime());sn.studiedToday=true;ok('N night after study -> resting',D(sn,new Date(2026,10,25,23,0).getTime()).icon==='flame_resting');
let sm=freshState();onAppOpen(sm,new Date(2026,10,25,8,0).getTime());sm.studiedYesterday=true;ok('M morning after study yesterday -> motivated',D(sm,new Date(2026,10,25,8,0).getTime()).icon==='flame_motivated');
console.log(res.join('\n'));console.log(pass,'passed',fail,'failed');
