// Run: TZ=UTC node src/widgets/moodEngine.test.mjs [--write]
// --write regenerates moodVectors.json (also checked by the Java port).
import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveMood, newMilestone } from "./moodEngine.js";

const T = (h, m = 0) => new Date(2026, 10, 18, h, m, 0).getTime(); // local 18 Nov 2026
const base = { studiedToday: false, studiedYesterday: true, everStudied: true, sessionActive: false, lastTaskAt: 0, celebrationAt: 0 };
const cases = [
  ["morning, not started", { ...base, now: T(9) }, "motivated"],
  ["afternoon, not started", { ...base, now: T(15) }, "motivated"],
  ["21:30 no progress", { ...base, now: T(21, 30) }, "worried", 1],
  ["23:10 -> asleep wins over worried", { ...base, now: T(23, 10) }, "sleeping"],
  ["22:30 no progress", { ...base, now: T(22, 30) }, "worried", 1],
  ["22:05 no progress, last hour", { ...base, now: T(23, 1), sessionActive: true }, "worried", 2],
  ["23:10 studying keeps awake", { ...base, now: T(23, 10), sessionActive: true }, "worried", 2],
  ["03:00 asleep", { ...base, now: T(3) }, "sleeping"],
  ["07:00 yesterday missed -> sad", { ...base, now: T(7), studiedYesterday: false }, "sad"],
  ["new user never studied -> motivated", { ...base, now: T(10), everStudied: false, studiedYesterday: false }, "motivated"],
  ["studied today -> happy", { ...base, now: T(21, 30), studiedToday: true }, "happy"],
  ["studied today never worried/sad", { ...base, now: T(22, 30), studiedToday: true, studiedYesterday: false }, "happy"],
  ["task just done -> excited", { ...base, now: T(10), studiedToday: true, lastTaskAt: T(10) - 1000 }, "excited"],
  ["excited expires after 3s", { ...base, now: T(10), studiedToday: true, lastTaskAt: T(10) - 3001 }, "happy"],
  ["excited beats sleeping", { ...base, now: T(2), studiedToday: true, lastTaskAt: T(2) - 500 }, "excited"],
  ["first task after sad -> excited", { ...base, now: T(8), studiedYesterday: false, studiedToday: true, lastTaskAt: T(8) - 10 }, "excited"],
  ["first task after sad then 5s -> happy", { ...base, now: T(8), studiedYesterday: false, studiedToday: true, lastTaskAt: T(8) - 5000 }, "happy"],
  ["milestone beats excited", { ...base, now: T(10), studiedToday: true, lastTaskAt: T(10) - 100, celebrationAt: T(10) - 100 }, "celebrating"],
  ["milestone not interrupted by sleeping", { ...base, now: T(2), studiedToday: true, celebrationAt: T(2) - 7000 }, "celebrating"],
  ["milestone over after 8s", { ...base, now: T(10), studiedToday: true, celebrationAt: T(10) - 8001 }, "happy"],
];
const out = [];
for (const [name, st, mood, level = 0] of cases) {
  const r = resolveMood(st);
  assert.equal(r.mood, mood, name + " -> " + r.mood);
  assert.equal(r.level, level, name + " level " + r.level);
  assert.ok(r.nextAt > st.now, name + " nextAt");
  out.push({ name, state: st, expect: r });
}
// nextAt: happy mid-day should wake at the next boundary, never before.
assert.equal(resolveMood({ ...base, now: T(10), studiedToday: true }).nextAt, T(21)); // worry boundary is irrelevant but is the earliest boundary
assert.equal(newMilestone(7, 3), 7);
assert.equal(newMilestone(7, 7), 0);
assert.equal(newMilestone(2, 0), 0);
assert.equal(newMilestone(31, 7), 30);
if (process.argv.includes("--write")) fs.writeFileSync(new URL("./moodVectors.json", import.meta.url), JSON.stringify(out, null, 1));
if (process.argv.includes("--write")) {
  const b = (x) => (x ? "1" : "0");
  fs.writeFileSync(new URL("./moodVectors.tsv", import.meta.url), out.map(({ state: t, expect: e }) =>
    [t.now, b(t.studiedToday), b(t.studiedYesterday), b(t.everStudied), b(t.sessionActive), t.lastTaskAt, t.celebrationAt, e.mood, e.level, e.nextAt].join("\t")).join("\n") + "\n");
}
console.log("mood engine: " + cases.length + " cases ok");
