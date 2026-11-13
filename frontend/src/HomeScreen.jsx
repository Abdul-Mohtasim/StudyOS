import React, { useEffect, useMemo, useRef, useState } from "react";
import { Home, ListChecks, Timer, Layers, UserRound, Plus, FileText, CreditCard, CalendarDays, Check, X, Flame, Gem, GraduationCap } from "lucide-react";
import "./home.css";

// New native-app Home screen. Receives everything from App.jsx as props, owns no data.

const SUBJECT_TIPS = {
  english: "Read one short passage and note 5 new words",
  physics: "Revise one formula sheet and solve 3 numericals",
  chemistry: "Review the periodic table trends for 15 minutes",
  maths: "Solve 5 practice problems from your weakest chapter",
  biology: "Draw and label one diagram from memory",
};

function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setV(target); return undefined; }
    let raf = 0;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Ring({ percent, size = 94, stroke = 9, children }) {
  const r = (size - stroke) / 2;
  const L = 2 * Math.PI * r;
  const [p, setP] = useState(0);
  useEffect(() => { const id = setTimeout(() => setP(percent), 220); return () => clearTimeout(id); }, [percent]);
  return (
    <div className="hm-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hm-ring-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hm-mauve)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={L} strokeDashoffset={L * (1 - Math.min(100, Math.max(0, p)) / 100)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.3,.8,.3,1)" }}
        />
      </svg>
      <div className="hm-ring-c">{children}</div>
    </div>
  );
}

function formatDue(due) {
  if (!due) return "";
  const d = new Date(`${String(due).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const t = new Date(); t.setHours(12, 0, 0, 0);
  const diff = Math.round((d - t) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskRow({ task, index, onToggle }) {
  const [pop, setPop] = useState(false);
  const due = formatDue(task.dueDate);
  return (
    <div className={`hm-trow${task.completed ? " done" : ""}`} style={{ "--i": index }}>
      <button
        type="button"
        className={`hm-cb${task.completed ? " ck" : ""}${pop ? " pop" : ""}`}
        aria-label={task.completed ? `Mark ${task.title} not done` : `Mark ${task.title} done`}
        onClick={() => { setPop(true); setTimeout(() => setPop(false), 400); onToggle(task.id); }}
      >
        {task.completed && <Check size={14} strokeWidth={3.4} />}
      </button>
      <div className="hm-tbody">
        <div className="hm-tt">{task.title}</div>
        <div className="hm-meta">
          <span className="hm-tag">{task.subject}</span>
          <span className={`hm-mt${due === "Overdue" ? " warn" : ""}`}>{due || task.time}</span>
        </div>
      </div>
    </div>
  );
}

export function TabBar({ active, onSelect }) {
  const tabs = [
    ["dashboard", "Home", Home],
    ["tasks", "Tasks", ListChecks],
    ["focus", "Focus", Timer],
    ["flashcards", "Study", Layers],
    ["settings", "Profile", UserRound],
  ];
  const idx = Math.max(0, tabs.findIndex(([k]) => k === active));
  const known = tabs.some(([k]) => k === active);
  return (
    <nav className="hm-tabbar" aria-label="Main tabs">
      <span className="hm-tabpill" style={{ transform: `translateX(${idx * 100}%)`, opacity: known ? 1 : 0 }} aria-hidden="true" />
      {tabs.map(([k, label, Icon]) => (
        <button key={k} type="button" className={`hm-tab${k === active ? " on" : ""}`} onClick={() => onSelect(k)} aria-label={label} aria-current={k === active ? "page" : undefined}>
          <Icon size={21} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function HomeScreen({
  name, guest, online, tasks, goalMinutes, todayMinutes, streak, exam, newUser,
  onToggleTask, onSeeAll, onQuick, onCreateProfile, active = true, onAddStarter, onOpenGoal,
}) {
  const [sheet, setSheet] = useState(false);
  const goalPct = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0;
  const minutes = useCountUp(todayMinutes);
  const open = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const shown = useMemo(() => {
    const doneToday = tasks.filter((t) => t.completed).slice(0, 1);
    return [...open.slice(0, 4), ...doneToday].slice(0, 5);
  }, [tasks, open]);
  const sheetRef = useRef(null);

  const examInfo = useMemo(() => {
    if (!exam) return null;
    const same = tasks.filter((t) => String(t.subject).toLowerCase() === String(exam.subject).toLowerCase());
    const ready = same.length ? Math.round((same.filter((t) => t.completed).length / same.length) * 100) : null;
    return { subject: exam.subject, days: exam.countdown?.days ?? 0, ready };
  }, [exam, tasks]);

  const [readyW, setReadyW] = useState(0);
  useEffect(() => { const id = setTimeout(() => setReadyW(examInfo?.ready ?? 0), 320); return () => clearTimeout(id); }, [examInfo?.ready]);

  const weak = useMemo(() => {
    if (!newUser || !newUser.placement) return [];
    return Object.entries(newUser.placement).filter(([, v]) => v !== 1).map(([k]) => k);
  }, [newUser]);
  const recentNew = newUser && Date.now() - (newUser.at || 0) < 3 * 86400000;
  const [starterAdded, setStarterAdded] = useState(() => new Set());
  const gems = newUser?.gems || 0;
  const score = newUser?.score ?? null;

  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setSheet(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const hour = new Date().getHours();
  const greet = hour < 5 ? "Hi" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = String(name || "there").trim().split(/\s+/)[0] || "there";

  return (
    <div className="hm">
      <div className="hm-top hm-rise" style={{ "--i": 0 }}>
        <span className="hm-stat" title="Starting score"><GraduationCap size={20} />{score ?? "–"}</span>
        <span className="hm-stat" title="Day streak"><Flame size={20} />{streak}</span>
        <span className="hm-stat" title="Gems"><Gem size={19} />{gems.toLocaleString()}</span>
      </div>

      <div className="hm-rise hm-sync" style={{ "--i": 1 }}>
        <i className={online ? "" : "off"} />{online ? "Synced · works offline" : "Offline · changes sync later"}
      </div>
      <h1 className="hm-title hm-rise" style={{ "--i": 2 }}>{greet}, {first}</h1>
      <p className="hm-sub hm-rise" style={{ "--i": 3 }}>{guest ? "Create your profile to save your progress." : "Make today count."}</p>

      <div className="hm-card hm-dark hm-goal hm-rise" style={{ "--i": 4 }}>
        <Ring percent={goalPct}><span>{minutes}m</span></Ring>
        <div className="hm-goal-copy">
          <div className="hm-h">Daily goal</div>
          <div className="hm-p">{todayMinutes} of {goalMinutes} min studied</div>
          <button type="button" className="hm-pill" onClick={onOpenGoal}>{goalPct >= 100 ? "Goal done" : "Start focus"}</button>
        </div>
      </div>

      {recentNew && !guest && (
        <div className="hm-card hm-rise hm-start" style={{ "--i": 5 }}>
          <div className="hm-eyebrow">YOUR STARTING POINT</div>
          <div className="hm-row"><b className="hm-h2">{score !== null ? `Score ${score}` : "Welcome!"}</b><span className="hm-chip">{streak <= 1 ? "Day 1" : `Day ${streak}`}</span></div>
          {weak.length > 0 ? (
            <>
              <div className="hm-p2">Let's strengthen these first:</div>
              {weak.slice(0, 3).map((s) => {
                const title = SUBJECT_TIPS[String(s).toLowerCase()] || `Revise ${s} basics`;
                const added = starterAdded.has(s);
                return (
                  <div className="hm-sug" key={s}>
                    <div><b>{s}</b><span>{title}</span></div>
                    <button type="button" disabled={added} onClick={() => { setStarterAdded((p) => new Set(p).add(s)); onAddStarter(title, s); }}>{added ? "Added" : "Add"}</button>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="hm-p2">Great exam! Keep your streak going with a focus session today.</div>
          )}
        </div>
      )}

      <div className="hm-card hm-rise" style={{ "--i": 6 }}>
        <div className="hm-eyebrow">EXAM MODE</div>
        {examInfo ? (
          <>
            <div className="hm-row"><b className="hm-h2">{examInfo.subject} · {examInfo.days} {examInfo.days === 1 ? "day" : "days"}</b><b className="hm-ready">{examInfo.ready === null ? "" : `${examInfo.ready}% ready`}</b></div>
            <div className="hm-bar"><i style={{ transform: `scaleX(${readyW / 100})` }} /></div>
            {examInfo.ready === null && <div className="hm-p2">Add tasks for {examInfo.subject} to track your readiness.</div>}
          </>
        ) : (
          <>
            <div className="hm-p2" style={{ margin: "8px 0 10px" }}>{guest ? "Your exam countdown will show up here." : "No exam added yet."}</div>
            {!guest && <button type="button" className="hm-link" onClick={() => onQuick("exam")}><CalendarDays size={16} /> Add an exam date</button>}
          </>
        )}
      </div>

      <div className="hm-row hm-rise" style={{ "--i": 7, marginTop: 20 }}>
        <b className="hm-h3">Today</b>
        <button type="button" className="hm-seeall" onClick={onSeeAll}>See all</button>
      </div>
      {shown.length === 0 ? (
        <div className="hm-empty hm-rise" style={{ "--i": 8 }}>
          <div className="hm-empty-ic"><ListChecks size={26} /></div>
          <b>{guest ? "Nothing here yet" : "No tasks for today"}</b>
          <span>{guest ? "Create your profile to add tasks, notes and flashcards." : "Add your first task and plan your day."}</span>
          {guest ? <button type="button" className="hm-cta" onClick={onCreateProfile}>Create profile</button> : <button type="button" className="hm-cta" onClick={() => onQuick("task")}>Add a task</button>}
        </div>
      ) : (
        shown.map((t, k) => <TaskRow key={t.id} task={t} index={8 + k} onToggle={onToggleTask} />)
      )}
      {open.length > 4 && <button type="button" className="hm-more hm-rise" style={{ "--i": 13 }} onClick={onSeeAll}>+ {open.length - 4} more tasks</button>}

      {active && <button type="button" className="hm-fab" aria-label="Quick add" onClick={() => (guest ? onCreateProfile() : setSheet(true))}><Plus size={26} /></button>}

      {sheet && (
        <div className="hm-ov" onClick={() => setSheet(false)} role="presentation">
          <div className="hm-sheet" ref={sheetRef} role="dialog" aria-label="Quick add" onClick={(e) => e.stopPropagation()}>
            <div className="hm-hdl" />
            <div className="hm-sheet-h"><b>Quick add</b><button type="button" aria-label="Close" onClick={() => setSheet(false)}><X size={20} /></button></div>
            <div className="hm-tiles">
              <button type="button" onClick={() => { setSheet(false); onQuick("task"); }}><b><ListChecks size={20} /></b>Task</button>
              <button type="button" onClick={() => { setSheet(false); onQuick("note"); }}><b><FileText size={20} /></b>Note</button>
              <button type="button" onClick={() => { setSheet(false); onQuick("card"); }}><b><CreditCard size={20} /></b>Flashcard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
