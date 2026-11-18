import { useMemo, useState } from "react";
import { GRADES, describeNext, generateCardsFromNote, isDue } from "./srs";
import { haptic } from "./haptics";
import "./native-pages.css";

// App-only pages in the StudyOS design language: Flashcards, Notes & subjects, Grades.
// They use the same data hooks as before; nothing here comes from the website layout.

const TYPES = [["quiz", "Quiz"], ["exam", "Exam"], ["assignment", "Assignment"], ["other", "Other"]];
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function Skeleton() {
  return (
    <div role="status" aria-label="Loading" className="np-skel">
      <div className="np-sk" style={{ height: 70, borderRadius: 20 }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="np-skc">
          <div className="np-sk" style={{ width: 26, height: 26, borderRadius: 9, flex: "none" }} />
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            <div className="np-sk" style={{ width: i % 2 ? "62%" : "76%", height: 13 }} />
            <div className="np-sk" style={{ width: "36%", height: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Shell({ dark, title, sub, onBack, children, footer, loading }) {
  return (
    <div className={`np${dark ? " np-dark" : ""}`}>
      <div className="np-head">
        <button type="button" className="np-back" onClick={() => { haptic.tap?.(); onBack(); }} aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
      </div>
      <div className="np-scroll">
        <h1 className="np-title">{title}</h1>
        {sub && <p className="np-sub">{sub}</p>}
        {loading ? <Skeleton /> : children}
      </div>
      {loading ? null : footer}
    </div>
  );
}

const Chips = ({ value, options, onChange }) => (
  <div className="np-chips">
    {options.map((o) => {
      const [v, label] = Array.isArray(o) ? o : [o, o];
      return (
        <button type="button" key={v} className={`np-chip${value === v ? " on" : ""}`} onClick={() => { haptic.tap?.(); onChange(v); }}>
          {label}
        </button>
      );
    })}
  </div>
);

const Empty = ({ children }) => <div className="np-empty">{children}</div>;

/* ---------------------------------------------------------------- Flashcards */
export function NativeFlashcards({ dark, fc, notes, subjects, onBack, setNotice }) {
  const [tab, setTab] = useState("review");
  const [shown, setShown] = useState(false);
  const [subject, setSubject] = useState("All");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [cardSubject, setCardSubject] = useState(subjects[0] || "Personal");
  const [busy, setBusy] = useState(false);

  const due = useMemo(
    () => fc.cards.filter((c) => isDue(c) && (subject === "All" || c.subject === subject)),
    [fc.cards, subject]
  );
  const card = due[0];
  const mastered = fc.cards.filter((c) => (c.interval || 0) >= 21).length;

  async function addCard() {
    if (front.trim().length < 2 || back.trim().length < 2) { setNotice("Write both sides of the card."); return; }
    setBusy(true);
    try {
      await fc.add({ front: front.trim(), back: back.trim(), subject: cardSubject });
      setFront(""); setBack(""); haptic.add?.();
    } catch (e) { setNotice(e.message || "Could not add the card."); }
    setBusy(false);
  }
  async function fromNote(note) {
    const made = generateCardsFromNote(note).map((c) => ({ ...c, subject: note.subject, noteId: note.id }));
    if (!made.length) { setNotice("No question and answer pairs found. Write lines like “Term: meaning”."); return; }
    setBusy(true);
    try { const n = await fc.addMany(made); setNotice(`${n} cards added.`); haptic.success?.(); setTab("cards"); }
    catch (e) { setNotice(e.message || "Could not make cards."); }
    setBusy(false);
  }

  return (
    <Shell dark={dark} title="Flashcards" sub="Cards come back at growing intervals." onBack={onBack} loading={Boolean(fc.loading) && !fc.cards.length}>
      <div className="np-stats">
        <div><b>{fc.dueCount}</b><small>Due now</small></div>
        <div><b>{fc.cards.length}</b><small>Total</small></div>
        <div><b>{mastered}</b><small>Mastered</small></div>
      </div>
      <div className="np-tabs">
        {[["review", "Review"], ["cards", "My cards"], ["notes", "From notes"]].map(([k, l]) => (
          <button type="button" key={k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setShown(false); }}>{l}</button>
        ))}
      </div>

      {tab === "review" && (
        <>
          <Chips value={subject} options={["All", ...subjects]} onChange={(v) => { setSubject(v); setShown(false); }} />
          {card ? (
            <div className="np-card np-fc">
              <span className="np-tag">{card.subject}</span>
              <div className="np-q">{card.front}</div>
              {shown ? (
                <>
                  <div className="np-a">{card.back}</div>
                  <div className="np-grades">
                    {GRADES.map((g) => (
                      <button type="button" key={g.value} className={`np-g np-g${g.value}`} onClick={() => { fc.review(card.id, g.value); setShown(false); haptic.tap?.(); }}>
                        {g.label}<small>{describeNext(card, g.value)}</small>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button type="button" className="np-primary" onClick={() => { setShown(true); haptic.tap?.(); }}>Show answer</button>
              )}
            </div>
          ) : (
            <Empty>{fc.cards.length ? "All caught up. Come back later." : "No cards yet. Add one in My cards or make cards from a note."}</Empty>
          )}
        </>
      )}

      {tab === "cards" && (
        <>
          <div className="np-card">
            <label className="np-label">Question</label>
            <textarea className="np-input" rows={2} maxLength={300} value={front} onChange={(e) => setFront(e.target.value)} placeholder="What is mitosis?" />
            <label className="np-label">Answer</label>
            <textarea className="np-input" rows={3} maxLength={900} value={back} onChange={(e) => setBack(e.target.value)} placeholder="Cell division that makes two identical cells" />
            <Chips value={cardSubject} options={subjects.length ? subjects : ["Personal"]} onChange={setCardSubject} />
            <button type="button" className="np-primary" disabled={busy} onClick={addCard}>Add card</button>
          </div>
          {fc.cards.slice(0, 100).map((c) => (
            <div className="np-row" key={c.id}>
              <div className="np-rowtxt"><b>{c.front}</b><small>{c.subject} · {c.back}</small></div>
              <button type="button" className="np-x" aria-label="Delete card" onClick={() => fc.remove(c.id).catch((e) => setNotice(e.message))}>✕</button>
            </div>
          ))}
        </>
      )}

      {tab === "notes" && (
        notes.length ? notes.slice(0, 60).map((n) => (
          <div className="np-row" key={n.id}>
            <div className="np-rowtxt"><b>{n.title}</b><small>{n.subject}</small></div>
            <button type="button" className="np-mini" disabled={busy} onClick={() => fromNote(n)}>Make cards</button>
          </div>
        )) : <Empty>Write a note first, then turn it into cards.</Empty>
      )}
    </Shell>
  );
}

/* -------------------------------------------------------------------- Grades */
export function NativeGrades({ dark, gr, subjects, onBack, setNotice }) {
  const [subject, setSubject] = useState(subjects[0] || "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("quiz");
  const [score, setScore] = useState("");
  const [max, setMax] = useState("100");
  const [date, setDate] = useState(todayKey());
  const [busy, setBusy] = useState(false);

  const avg = gr.grades.length ? Math.round((gr.grades.reduce((s, g) => s + g.percent, 0) / gr.grades.length) * 10) / 10 : null;

  async function save() {
    const s = Number(score), m = Number(max);
    if (!subject.trim()) { setNotice("Choose or type a subject."); return; }
    if (!Number.isFinite(s) || s < 0 || !Number.isFinite(m) || m <= 0 || s > m) { setNotice("Enter a score between 0 and the maximum."); return; }
    setBusy(true);
    try {
      await gr.add({ subject: subject.trim(), title: title.trim(), type, score: s, maxScore: m, date });
      setTitle(""); setScore(""); haptic.add?.();
    } catch (e) { setNotice(e.message || "Could not save the grade."); }
    setBusy(false);
  }

  return (
    <Shell dark={dark} title="Grades" sub="Log your marks and watch your trend." onBack={onBack} loading={Boolean(gr.loading) && !gr.grades.length}>
      <div className="np-stats">
        <div><b>{avg === null ? "—" : `${avg}%`}</b><small>Average</small></div>
        <div><b>{gr.grades.length}</b><small>Logged</small></div>
        <div><b>{new Set(gr.grades.map((g) => g.subject)).size}</b><small>Subjects</small></div>
      </div>
      <div className="np-card">
        <label className="np-label">Subject</label>
        {subjects.length > 0 && <Chips value={subject} options={subjects} onChange={setSubject} />}
        <input className="np-input" value={subject} maxLength={100} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        <label className="np-label">Title</label>
        <input className="np-input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 3 quiz" />
        <Chips value={type} options={TYPES} onChange={setType} />
        <div className="np-two">
          <div><label className="np-label">Score</label><input className="np-input" inputMode="decimal" value={score} onChange={(e) => setScore(e.target.value)} placeholder="85" /></div>
          <div><label className="np-label">Out of</label><input className="np-input" inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} /></div>
        </div>
        <label className="np-label">Date</label>
        <input className="np-input" type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
        <button type="button" className="np-primary" disabled={busy} onClick={save}>Log grade</button>
      </div>
      {gr.grades.length ? gr.grades.slice(0, 100).map((g) => (
        <div className="np-row" key={g.id}>
          <div className="np-rowtxt"><b>{g.title || g.subject}</b><small>{g.subject} · {TYPES.find((t) => t[0] === g.type)?.[1] || "Other"} · {String(g.date || "").slice(0, 10)}</small></div>
          <span className="np-score">{g.percent}%</span>
          <button type="button" className="np-x" aria-label="Delete grade" onClick={() => gr.remove(g.id).catch((e) => setNotice(e.message))}>✕</button>
        </div>
      )) : <Empty>No grades yet. Log a quiz or exam above.</Empty>}
    </Shell>
  );
}

/* --------------------------------------------------------- Notes & subjects */
export function NativeNotes({ dark, loading, notes, setNotes, subjects, tasks, exams, setExams, api, normalizeNote, normalizeExam, onBack, setNotice }) {
  const [tab, setTab] = useState("notes");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null); // {id?, title, subject, content}
  const [busy, setBusy] = useState(false);
  const [examSubject, setExamSubject] = useState("");
  const [examDate, setExamDate] = useState("");

  const shown = notes.filter((n) => {
    const s = q.trim().toLowerCase();
    return !s || `${n.title} ${n.subject} ${n.content}`.toLowerCase().includes(s);
  });

  async function saveNote() {
    if (!edit.title.trim()) { setNotice("Give the note a title."); return; }
    setBusy(true);
    const body = { title: edit.title.trim().slice(0, 120), subject: edit.subject || "Personal", content: String(edit.content || "").slice(0, 20000), tags: [] };
    const { ok, data } = await api(edit.id ? `/api/notes/${encodeURIComponent(edit.id)}` : "/api/notes", edit.id ? "PATCH" : "POST", body);
    setBusy(false);
    if (!ok || !data.note) { setNotice(data.message || "Could not save the note."); return; }
    const saved = normalizeNote(data.note);
    setNotes((cur) => [saved, ...cur.filter((x) => x.id !== saved.id)]);
    setEdit(null); haptic.success?.();
  }
  async function removeNote(id) {
    const { ok, data } = await api(`/api/notes/${encodeURIComponent(id)}`, "DELETE");
    if (!ok) { setNotice(data.message || "Could not delete the note."); return; }
    setNotes((cur) => cur.filter((x) => x.id !== id)); setEdit(null);
  }
  async function addExam() {
    if (!examSubject.trim() || !examDate) { setNotice("Choose a subject and an exam date."); return; }
    const { ok, data } = await api("/api/exams", "PUT", { subject: examSubject.trim(), date: examDate });
    if (!ok || !data.exam) { setNotice(data.message || "Could not save the exam."); return; }
    const saved = normalizeExam(data.exam);
    setExams((cur) => [...cur.filter((x) => x.id !== saved.id && String(x.subject).toLowerCase() !== String(saved.subject).toLowerCase()), saved].sort((a, b) => String(a.date).localeCompare(String(b.date))));
    setExamDate(""); haptic.success?.();
  }
  async function removeExam(id) {
    const { ok } = await api(`/api/exams/${encodeURIComponent(id)}`, "DELETE");
    if (ok) setExams((cur) => cur.filter((x) => x.id !== id));
  }

  if (edit) {
    return (
      <Shell dark={dark} title={edit.id ? "Edit note" : "New note"} onBack={() => setEdit(null)}>
        <div className="np-card">
          <label className="np-label">Title</label>
          <input className="np-input" maxLength={120} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Photosynthesis" />
          <Chips value={edit.subject} options={subjects.length ? subjects : ["Personal"]} onChange={(v) => setEdit({ ...edit, subject: v })} />
          <label className="np-label">Note</label>
          <textarea className="np-input" rows={10} maxLength={20000} value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} placeholder="Write here. Lines like “Term: meaning” become flashcards." />
          <button type="button" className="np-primary" disabled={busy} onClick={saveNote}>Save note</button>
          {edit.id && <button type="button" className="np-danger" onClick={() => removeNote(edit.id)}>Delete note</button>}
        </div>
      </Shell>
    );
  }

  return (
    <Shell dark={dark} title="Notes & subjects" sub="Everything you write and study." onBack={onBack} loading={Boolean(loading) && !notes.length}>
      <div className="np-tabs">
        {[["notes", "Notes"], ["subjects", "Subjects"], ["exams", "Exams"]].map(([k, l]) => (
          <button type="button" key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "notes" && (
        <>
          <div className="np-search">
            <input className="np-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes" />
            <button type="button" className="np-mini" onClick={() => setEdit({ title: "", subject: subjects[0] || "Personal", content: "" })}>New</button>
          </div>
          {shown.length ? shown.slice(0, 100).map((n) => (
            <button type="button" className="np-row np-tap" key={n.id} onClick={() => setEdit({ id: n.id, title: n.title, subject: n.subject, content: n.content || "" })}>
              <div className="np-rowtxt"><b>{n.title}</b><small>{n.subject}{n.content ? ` · ${String(n.content).replace(/\s+/g, " ").slice(0, 60)}` : ""}</small></div>
              <span className="np-chev">›</span>
            </button>
          )) : <Empty>{notes.length ? "No notes match your search." : "No notes yet. Tap New to write one."}</Empty>}
        </>
      )}

      {tab === "subjects" && (
        subjects.length ? subjects.map((s) => {
          const mine = tasks.filter((t) => (t.subject || "").toLowerCase() === s.toLowerCase());
          const done = mine.filter((t) => t.completed).length;
          const pct = mine.length ? Math.round((done / mine.length) * 100) : 0;
          return (
            <div className="np-card np-subj" key={s}>
              <div className="np-subjhead"><b>{s}</b><span>{pct}%</span></div>
              <div className="np-bar"><i style={{ width: `${pct}%` }} /></div>
              <small>{done} of {mine.length} tasks done · {notes.filter((n) => (n.subject || "").toLowerCase() === s.toLowerCase()).length} notes</small>
            </div>
          );
        }) : <Empty>Subjects appear here when you add tasks or notes.</Empty>
      )}

      {tab === "exams" && (
        <>
          <div className="np-card">
            <label className="np-label">Subject</label>
            {subjects.length > 0 && <Chips value={examSubject} options={subjects} onChange={setExamSubject} />}
            <input className="np-input" value={examSubject} maxLength={100} onChange={(e) => setExamSubject(e.target.value)} placeholder="Subject" />
            <label className="np-label">Exam date</label>
            <input className="np-input" type="date" value={examDate} min={todayKey()} onChange={(e) => setExamDate(e.target.value)} />
            <button type="button" className="np-primary" onClick={addExam}>Add exam</button>
          </div>
          {exams.length ? exams.map((x) => (
            <div className="np-row" key={x.id}>
              <div className="np-rowtxt"><b>{x.subject}</b><small>{String(x.date).slice(0, 10)}</small></div>
              <button type="button" className="np-x" aria-label="Delete exam" onClick={() => removeExam(x.id)}>✕</button>
            </div>
          )) : <Empty>No exams yet.</Empty>}
        </>
      )}
    </Shell>
  );
}
