// Flashcards (spaced repetition), grade tracker, per-subject study time,
// reminder settings and the offline banner.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  Bell,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  WifiOff,
  Check,
} from "lucide-react";
import { GRADES, describeNext, generateCardsFromNote, isDue, nextSchedule, normalizeCard } from "./srs";
import { Capacitor } from "@capacitor/core";
import { useOfflineStatus } from "./offline";
import {
  notificationsSupported,
  requestReminderPermission,
  requestExactAlarms,
  MAX_CUSTOM,
  exactAlarmsGranted,
  sendTestReminder,
  openNotificationSettings,
  openChannelSettings,
  getDiagnostics,
  getNotifyStatus,
} from "./reminders";

async function call(base, token, method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Something went wrong.");
  return data;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SUBJECT_COLORS = ["#e4585f", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
function subjectColor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SUBJECT_COLORS[h % SUBJECT_COLORS.length];
}

// Reload a list when another device/the offline queue has synced.
function useSyncedReload() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const on = () => setN((v) => v + 1);
    window.addEventListener("studyos:synced", on);
    return () => window.removeEventListener("studyos:synced", on);
  }, []);
  return n;
}

// =============================================================== flashcards data
export function useFlashcards(authToken, base) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const syncTick = useSyncedReload();

  useEffect(() => {
    if (!authToken) {
      setCards([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    call(base, authToken, "GET", "/api/flashcards")
      .then((d) => !cancelled && (setCards((d.flashcards || []).map(normalizeCard)), setError("")))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [authToken, base, syncTick]);

  const add = useCallback(
    async (card) => {
      const d = await call(base, authToken, "POST", "/api/flashcards", card);
      setCards((prev) => [normalizeCard(d.flashcard), ...prev]);
    },
    [authToken, base]
  );

  const addMany = useCallback(
    async (list) => {
      const created = [];
      for (let i = 0; i < list.length; i += 50) {
        const d = await call(base, authToken, "POST", "/api/flashcards/bulk", { cards: list.slice(i, i + 50) });
        created.push(...(d.flashcards || []).map(normalizeCard));
      }
      setCards((prev) => [...created, ...prev]);
      return created.length;
    },
    [authToken, base]
  );

  const edit = useCallback(
    async (id, fields) => {
      const d = await call(base, authToken, "PATCH", `/api/flashcards/${encodeURIComponent(id)}`, fields);
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...normalizeCard(d.flashcard) } : c)));
    },
    [authToken, base]
  );

  const remove = useCallback(
    async (id) => {
      await call(base, authToken, "DELETE", `/api/flashcards/${encodeURIComponent(id)}`);
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    [authToken, base]
  );

  const review = useCallback(
    (id, grade) => {
      const reviewedAt = new Date().toISOString();
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...nextSchedule(c, grade, reviewedAt), lastReviewedAt: reviewedAt } : c))
      );
      call(base, authToken, "POST", `/api/flashcards/${encodeURIComponent(id)}/review`, { grade, reviewedAt }).catch((e) =>
        setError(e.message)
      );
    },
    [authToken, base]
  );

  const dueCount = cards.filter((c) => isDue(c)).length;
  return { cards, loading, error, add, addMany, edit, remove, review, dueCount };
}

function dueLabel(card) {
  if (!card.reps && !card.lastReviewedAt) return "New";
  const diff = new Date(card.dueAt).getTime() - Date.now();
  if (diff <= 0) return "Due now";
  const days = Math.ceil(diff / 86400000);
  if (diff < 3600000) return `In ${Math.max(1, Math.round(diff / 60000))} min`;
  if (days <= 1) return "Tomorrow";
  return `In ${days} days`;
}

// =============================================================== flashcards page
export function FlashcardsPage({ fc, notes, subjectNames, initialNoteId, onInitialNoteUsed, extraActions }) {
  const [tab, setTab] = useState(initialNoteId ? "notes" : "review");
  useEffect(() => {
    if (initialNoteId) setTab("notes");
  }, [initialNoteId]);

  const mastered = fc.cards.filter((c) => c.interval >= 21).length;

  return (
    <section className="st-page" aria-label="Flashcards">
      <div className="st-stats">
        <div className="st-stat"><span>Due now</span><strong>{fc.dueCount}</strong></div>
        <div className="st-stat"><span>Total cards</span><strong>{fc.cards.length}</strong></div>
        <div className="st-stat"><span>Mastered</span><strong>{mastered}</strong></div>
      </div>

      <div className="st-tabs" role="tablist">
        {[["review", "Review"], ["cards", "My cards"], ["notes", "From notes"]].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {extraActions}

      {fc.error && <p className="st-error" role="alert">{fc.error}</p>}
      {fc.loading && fc.cards.length === 0 && <p className="st-muted"><RefreshCw size={14} /> Loading your cards...</p>}

      {tab === "review" && <ReviewTab fc={fc} subjectNames={subjectNames} goAdd={() => setTab("notes")} />}
      {tab === "cards" && <CardsTab fc={fc} subjectNames={subjectNames} />}
      {tab === "notes" && (
        <NotesTab fc={fc} notes={notes} initialNoteId={initialNoteId} onUsed={onInitialNoteUsed} onDone={() => setTab("review")} />
      )}
    </section>
  );
}

function ReviewTab({ fc, subjectNames, goAdd }) {
  const [subject, setSubject] = useState("");
  const [session, setSession] = useState(null); // { ids, total, done }
  const [flipped, setFlipped] = useState(false);

  const dueCards = fc.cards
    .filter((c) => isDue(c) && (!subject || c.subject === subject))
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  const current = session && session.ids.length ? fc.cards.find((c) => c.id === session.ids[0]) : null;

  const start = () => {
    setSession({ ids: dueCards.slice(0, 100).map((c) => c.id), total: Math.min(100, dueCards.length), done: 0 });
    setFlipped(false);
  };

  const answer = useCallback(
    (grade) => {
      if (!current) return;
      fc.review(current.id, grade);
      setSession((s) => {
        const rest = s.ids.slice(1);
        return { ...s, ids: grade === 0 ? [...rest, current.id] : rest, done: grade === 0 ? s.done : s.done + 1 };
      });
      setFlipped(false);
    },
    [current, fc]
  );

  useEffect(() => {
    if (!current) return undefined;
    const onKey = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        answer(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, answer]);

  const subjectsWithCards = Array.from(new Set(fc.cards.map((c) => c.subject).filter(Boolean))).sort();

  if (fc.cards.length === 0 && !fc.loading) {
    return (
      <div className="st-empty">
        <h3>No flashcards yet</h3>
        <p>Turn any note into flashcards, or add your own. Cards you answer come back at growing intervals.</p>
        <button type="button" className="st-primary" onClick={goAdd}>Make cards from a note</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="st-start">
        {subjectsWithCards.length > 0 && (
          <label className="st-field">
            <span>Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjectsWithCards.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <p className="st-big">{dueCards.length > 0 ? `${dueCards.length} card${dueCards.length === 1 ? "" : "s"} ready to review` : "You're all caught up 🎉"}</p>
        {dueCards.length === 0 && <NextDue cards={fc.cards} />}
        <button type="button" className="st-primary" disabled={dueCards.length === 0} onClick={start}>Start review</button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="st-start">
        <p className="st-big">Session complete — {session.done} card{session.done === 1 ? "" : "s"} reviewed 🎉</p>
        <NextDue cards={fc.cards} />
        <button type="button" className="st-primary" onClick={() => setSession(null)}>Done</button>
      </div>
    );
  }

  const pct = session.total ? Math.round((session.done / session.total) * 100) : 0;
  return (
    <div className="st-review">
      <div className="st-progress" aria-label={`${session.done} of ${session.total} done`}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="st-review-meta">
        <span>{session.done}/{session.total} done</span>
        {current.subject && <span className="st-chip" style={{ "--c": subjectColor(current.subject) }}>{current.subject}</span>}
        <button type="button" className="st-link" onClick={() => setSession(null)}>End session</button>
      </div>

      <button type="button" className={`st-card${flipped ? " flipped" : ""}`} onClick={() => setFlipped((f) => !f)} aria-label={flipped ? "Show question" : "Show answer"}>
        <span className="st-card-label">{flipped ? "Answer" : "Question"}</span>
        <span className="st-card-text">{flipped ? current.back : current.front}</span>
        <span className="st-card-hint">{flipped ? "" : "Tap or press space to flip"}</span>
      </button>

      {flipped ? (
        <div className="st-grades">
          {GRADES.map((g, i) => (
            <button key={g.value} type="button" className={`st-grade ${g.tone}`} onClick={() => answer(g.value)}>
              <strong>{g.label}</strong>
              <small>{describeNext(current, g.value)}</small>
              <kbd>{i + 1}</kbd>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="st-primary" onClick={() => setFlipped(true)}>Show answer</button>
      )}
    </div>
  );
}

function NextDue({ cards }) {
  const upcoming = cards.filter((c) => !isDue(c)).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0];
  if (!upcoming) return null;
  return <p className="st-muted">Next card is due {dueLabel(upcoming).toLowerCase()}.</p>;
}

function CardsTab({ fc, subjectNames }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // { id, front, back, subject }
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      await fc.add({ front: front.trim(), back: back.trim(), subject: subject.trim() });
      setFront("");
      setBack("");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    try {
      await fc.edit(editing.id, { front: editing.front, back: editing.back, subject: editing.subject });
      setEditing(null);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const q = query.trim().toLowerCase();
  const list = fc.cards.filter((c) => !q || `${c.front} ${c.back} ${c.subject}`.toLowerCase().includes(q));

  return (
    <div>
      <form className="st-form" onSubmit={submit}>
        <label className="st-field"><span>Front (question)</span>
          <textarea rows={2} value={front} maxLength={400} onChange={(e) => setFront(e.target.value)} placeholder="What is osmosis?" />
        </label>
        <label className="st-field"><span>Back (answer)</span>
          <textarea rows={2} value={back} maxLength={1000} onChange={(e) => setBack(e.target.value)} placeholder="Movement of water across a membrane" />
        </label>
        <label className="st-field"><span>Subject</span>
          <input list="st-subjects" value={subject} maxLength={60} onChange={(e) => setSubject(e.target.value)} placeholder="Optional" />
        </label>
        <datalist id="st-subjects">{subjectNames.map((s) => <option key={s} value={s} />)}</datalist>
        <button type="submit" className="st-primary" disabled={busy || !front.trim() || !back.trim()}><Plus size={15} /> Add card</button>
      </form>
      {msg && <p className="st-error" role="alert">{msg}</p>}

      <input className="st-search" type="search" placeholder="Search cards" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search flashcards" />

      <ul className="st-list">
        {list.map((c) => (
          <li key={c.id} className="st-item">
            {editing && editing.id === c.id ? (
              <div className="st-edit">
                <textarea rows={2} value={editing.front} maxLength={400} onChange={(e) => setEditing({ ...editing, front: e.target.value })} />
                <textarea rows={2} value={editing.back} maxLength={1000} onChange={(e) => setEditing({ ...editing, back: e.target.value })} />
                <input list="st-subjects" value={editing.subject} maxLength={60} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} />
                <div className="st-row">
                  <button type="button" className="st-primary" onClick={saveEdit}><Save size={14} /> Save</button>
                  <button type="button" className="st-ghost" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="st-item-main">
                  <strong>{c.front}</strong>
                  <p>{c.back}</p>
                  <div className="st-row">
                    {c.subject && <span className="st-chip" style={{ "--c": subjectColor(c.subject) }}>{c.subject}</span>}
                    <span className="st-muted">{dueLabel(c)}</span>
                  </div>
                </div>
                <div className="st-item-actions">
                  <button type="button" className="st-icon" aria-label="Edit card" onClick={() => setEditing({ id: c.id, front: c.front, back: c.back, subject: c.subject })}><Pencil size={15} /></button>
                  <button type="button" className="st-icon danger" aria-label="Delete card" onClick={() => window.confirm("Delete this card?") && fc.remove(c.id).catch((e) => setMsg(e.message))}><Trash2 size={15} /></button>
                </div>
              </>
            )}
          </li>
        ))}
        {list.length === 0 && <li className="st-muted">No cards match.</li>}
      </ul>
    </div>
  );
}

function NotesTab({ fc, notes, initialNoteId, onUsed, onDone }) {
  const [noteId, setNoteId] = useState(initialNoteId || "");
  const [draft, setDraft] = useState(null); // [{ front, back, keep }]
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const note = notes.find((n) => n.id === noteId);

  const generate = useCallback((n) => {
    const existing = new Set(fc.cards.filter((c) => c.noteId === n.id).map((c) => c.front.toLowerCase()));
    setDraft(generateCardsFromNote(n).map((c) => ({ ...c, keep: !existing.has(c.front.toLowerCase()), dup: existing.has(c.front.toLowerCase()) })));
    setMsg("");
  }, [fc.cards]);

  useEffect(() => {
    if (initialNoteId) {
      const n = notes.find((x) => x.id === initialNoteId);
      if (n) {
        setNoteId(n.id);
        generate(n);
        onUsed && onUsed();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNoteId]);

  const save = async () => {
    const chosen = draft.filter((d) => d.keep && d.front.trim() && d.back.trim());
    if (!chosen.length) return;
    setBusy(true);
    try {
      const n = await fc.addMany(chosen.map((d) => ({ front: d.front.trim().slice(0, 400), back: d.back.trim().slice(0, 1000), subject: note.subject === "Personal" ? "" : note.subject, noteId: note.id })));
      setMsg(`${n} card${n === 1 ? "" : "s"} added.`);
      setDraft(null);
      onDone && setTimeout(onDone, 700);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const patch = (i, p) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, ...p } : x)));

  return (
    <div>
      <div className="st-form">
        <label className="st-field"><span>Pick a note</span>
          <select value={noteId} onChange={(e) => { setNoteId(e.target.value); setDraft(null); }}>
            <option value="">Choose a note...</option>
            {notes.map((n) => <option key={n.id} value={n.id}>{n.title} · {n.subject}</option>)}
          </select>
        </label>
        <button type="button" className="st-primary" disabled={!note} onClick={() => generate(note)}>Generate cards</button>
      </div>
      <p className="st-muted st-hint">
        Works best with lines like <code>Term: definition</code>, <code>**Term** meaning</code>, or a <code>## Heading</code> followed by bullet points. You can edit every card before saving.
      </p>
      {msg && <p className="st-ok" role="status">{msg}</p>}

      {draft && draft.length === 0 && (
        <div className="st-empty"><p>No cards could be found in this note. Try the formats above, or add cards by hand in “My cards”.</p></div>
      )}

      {draft && draft.length > 0 && (
        <>
          <ul className="st-list">
            {draft.map((d, i) => (
              <li key={i} className={`st-item st-draft${d.keep ? "" : " off"}`}>
                <label className="st-check"><input type="checkbox" checked={d.keep} onChange={(e) => patch(i, { keep: e.target.checked })} /> <span className="sr-only">Include card</span></label>
                <div className="st-edit">
                  <textarea rows={2} value={d.front} maxLength={400} onChange={(e) => patch(i, { front: e.target.value })} />
                  <textarea rows={2} value={d.back} maxLength={1000} onChange={(e) => patch(i, { back: e.target.value })} />
                  {d.dup && <span className="st-muted">Already made from this note</span>}
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="st-primary" disabled={busy || !draft.some((d) => d.keep)} onClick={save}>
            <Check size={15} /> Add {draft.filter((d) => d.keep).length} cards
          </button>
        </>
      )}
    </div>
  );
}

// =============================================================== grades
export function useGrades(authToken, base) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const syncTick = useSyncedReload();

  useEffect(() => {
    if (!authToken) {
      setGrades([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    call(base, authToken, "GET", "/api/grades")
      .then((d) => !cancelled && (setGrades((d.grades || []).map(normalizeGrade)), setError("")))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [authToken, base, syncTick]);

  const add = useCallback(
    async (g) => {
      const d = await call(base, authToken, "POST", "/api/grades", g);
      setGrades((prev) => [normalizeGrade(d.grade), ...prev]);
    },
    [authToken, base]
  );
  const remove = useCallback(
    async (id) => {
      await call(base, authToken, "DELETE", `/api/grades/${encodeURIComponent(id)}`);
      setGrades((prev) => prev.filter((g) => g.id !== id));
    },
    [authToken, base]
  );
  return { grades, loading, error, add, remove };
}

function normalizeGrade(g) {
  const score = Number(g.score);
  const max = Number(g.maxScore) || 100;
  return {
    id: g._id || g.id,
    subject: g.subject,
    title: g.title || "",
    type: g.type || "quiz",
    score,
    maxScore: max,
    percent: Math.round((score / max) * 1000) / 10,
    date: g.date,
  };
}

const average = (list) => (list.length ? list.reduce((s, g) => s + g.percent, 0) / list.length : 0);

function trendOf(list) {
  // list is oldest -> newest
  if (list.length < 2) return 0;
  const recent = list.slice(-Math.min(3, Math.ceil(list.length / 2)));
  const before = list.slice(0, list.length - recent.length);
  return average(recent) - average(before);
}

const TYPE_LABEL = { quiz: "Quiz", exam: "Exam", assignment: "Assignment", other: "Other" };

export function GradesPage({ gr, subjectNames }) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("quiz");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [date, setDate] = useState(todayKey);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const allSubjects = useMemo(() => Array.from(new Set(gr.grades.map((g) => g.subject))).sort((a, b) => a.localeCompare(b)), [gr.grades]);
  const sorted = useMemo(() => [...gr.grades].sort((a, b) => a.date.localeCompare(b.date)), [gr.grades]);
  const visible = filter ? sorted.filter((g) => g.subject === filter) : sorted;

  const perSubject = allSubjects.map((name) => {
    const rows = sorted.filter((g) => g.subject === name);
    return { name, rows, avg: average(rows), latest: rows[rows.length - 1], trend: trendOf(rows) };
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await gr.add({ subject: subject.trim(), title: title.trim(), type, score: Number(score), maxScore: Number(maxScore), date });
      setTitle("");
      setScore("");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const valid = subject.trim() && score !== "" && Number(score) >= 0 && Number(maxScore) > 0 && date;

  return (
    <section className="st-page" aria-label="Grade tracker">
      <div className="st-stats">
        <div className="st-stat"><span>Overall average</span><strong>{gr.grades.length ? `${average(gr.grades).toFixed(1)}%` : "—"}</strong></div>
        <div className="st-stat"><span>Grades logged</span><strong>{gr.grades.length}</strong></div>
        <div className="st-stat"><span>Subjects</span><strong>{allSubjects.length}</strong></div>
      </div>

      <form className="st-form" onSubmit={submit}>
        <label className="st-field"><span>Subject</span>
          <input list="st-grade-subjects" value={subject} maxLength={60} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" required />
        </label>
        <datalist id="st-grade-subjects">{Array.from(new Set([...subjectNames, ...allSubjects])).map((s) => <option key={s} value={s} />)}</datalist>
        <label className="st-field"><span>Title</span>
          <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 3 quiz" />
        </label>
        <label className="st-field"><span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <div className="st-row st-score">
          <label className="st-field"><span>Score</span>
            <input type="number" inputMode="decimal" min="0" step="any" value={score} onChange={(e) => setScore(e.target.value)} required />
          </label>
          <span className="st-slash">/</span>
          <label className="st-field"><span>Out of</span>
            <input type="number" inputMode="decimal" min="0.01" step="any" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} required />
          </label>
        </div>
        <label className="st-field"><span>Date</span>
          <input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <button type="submit" className="st-primary" disabled={busy || !valid}><Plus size={15} /> Log grade</button>
      </form>
      {msg && <p className="st-error" role="alert">{msg}</p>}
      {gr.error && <p className="st-error" role="alert">{gr.error}</p>}

      {gr.grades.length === 0 ? (
        <div className="st-empty"><h3>No grades yet</h3><p>Log a quiz or exam mark above and your trend will appear here.</p></div>
      ) : (
        <>
          <div className="st-subject-cards">
            {perSubject.map((s) => (
              <button type="button" key={s.name} className={`st-subject-card${filter === s.name ? " active" : ""}`} style={{ "--c": subjectColor(s.name) }} onClick={() => setFilter(filter === s.name ? "" : s.name)}>
                <span className="st-dot" />
                <strong>{s.name}</strong>
                <span className="st-avg">{s.avg.toFixed(1)}%</span>
                <span className={`st-trend ${s.trend > 0.5 ? "up" : s.trend < -0.5 ? "down" : "flat"}`}>
                  {s.trend > 0.5 ? <TrendingUp size={13} /> : s.trend < -0.5 ? <TrendingDown size={13} /> : <Minus size={13} />}
                  {s.rows.length < 2 ? "Need 2+" : `${s.trend > 0 ? "+" : ""}${s.trend.toFixed(1)}`}
                </span>
              </button>
            ))}
          </div>

          <div className="st-chart-wrap">
            <div className="st-chart-head">
              <h3>Trend</h3>
              {filter && <button type="button" className="st-link" onClick={() => setFilter("")}>Show all subjects</button>}
            </div>
            <GradeChart grades={visible} subjects={filter ? [filter] : allSubjects} />
          </div>

          <ul className="st-list">
            {[...visible].reverse().slice(0, 60).map((g) => (
              <li key={g.id} className="st-item">
                <div className="st-item-main">
                  <strong>{g.title || TYPE_LABEL[g.type]}</strong>
                  <div className="st-row">
                    <span className="st-chip" style={{ "--c": subjectColor(g.subject) }}>{g.subject}</span>
                    <span className="st-muted">{TYPE_LABEL[g.type]} · {g.date}</span>
                  </div>
                </div>
                <div className="st-grade-score">
                  <strong>{g.percent}%</strong>
                  <span className="st-muted">{g.score}/{g.maxScore}</span>
                </div>
                <button type="button" className="st-icon danger" aria-label="Delete grade" onClick={() => window.confirm("Delete this grade?") && gr.remove(g.id).catch((e) => setMsg(e.message))}><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function GradeChart({ grades, subjects }) {
  const W = 640, H = 260, L = 38, R = 14, T = 14, B = 30;
  if (grades.length === 0) return null;

  const times = grades.map((g) => new Date(`${g.date}T00:00:00`).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const span = Math.max(1, maxT - minT);
  const lo = Math.max(0, Math.floor((Math.min(...grades.map((g) => g.percent)) - 10) / 10) * 10);
  const hi = Math.max(100, Math.ceil(Math.max(...grades.map((g) => g.percent)) / 10) * 10);
  const x = (t) => (grades.length === 1 || maxT === minT ? (L + (W - R)) / 2 : L + ((t - minT) / span) * (W - L - R));
  const y = (p) => T + (1 - (p - lo) / (hi - lo)) * (H - T - B);
  const ticks = [lo, lo + (hi - lo) / 2, hi];
  const fmt = (t) => new Date(t).toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div className="st-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grade percentage over time">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end">{Math.round(t)}%</text>
          </g>
        ))}
        <text x={L} y={H - 8} textAnchor="start">{fmt(minT)}</text>
        {maxT !== minT && <text x={W - R} y={H - 8} textAnchor="end">{fmt(maxT)}</text>}
        {subjects.map((name) => {
          const rows = grades.filter((g) => g.subject === name);
          if (!rows.length) return null;
          const color = subjectColor(name);
          const pts = rows.map((g) => [x(new Date(`${g.date}T00:00:00`).getTime()), y(g.percent)]);
          return (
            <g key={name}>
              {pts.length > 1 && <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
              {rows.map((g, i) => (
                <circle key={g.id} cx={pts[i][0]} cy={pts[i][1]} r="4.5" fill={color} stroke="var(--surface, #fff)" strokeWidth="1.5">
                  <title>{`${g.subject}: ${g.percent}% (${g.score}/${g.maxScore}) on ${g.date}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      {subjects.length > 1 && (
        <div className="st-legend">
          {subjects.map((s) => <span key={s}><i style={{ background: subjectColor(s) }} />{s}</span>)}
        </div>
      )}
    </div>
  );
}

// =============================================================== study time per subject
export function StudyTimeCard({ authToken, base, refreshKey }) {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const syncTick = useSyncedReload();

  useEffect(() => {
    if (!authToken) return undefined;
    let cancelled = false;
    call(base, authToken, "GET", `/api/focus-sessions/by-subject?days=${days}`)
      .then((d) => !cancelled && (setRows(d.subjects || []), setError("")))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [authToken, base, days, refreshKey, syncTick]);

  const total = rows.reduce((s, r) => s + r.minutes, 0);
  const max = Math.max(1, ...rows.map((r) => r.minutes));
  const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim() : `${m}m`);
  const onlyUnassigned = rows.length > 0 && rows.every((r) => !r.subject);

  return (
    <article className="panel st-time-card">
      <div className="panel-heading">
        <div>
          <h2>Study time by subject</h2>
          <p>Where your focus hours actually go.</p>
        </div>
        <div className="st-range" role="group" aria-label="Time range">
          {[[7, "7 days"], [30, "30 days"], [0, "All"]].map(([v, l]) => (
            <button key={v} type="button" className={days === v ? "active" : ""} onClick={() => setDays(v)}>{l}</button>
          ))}
        </div>
      </div>

      {error && <p className="st-error">{error}</p>}
      {rows.length === 0 && !error ? (
        <p className="st-muted">No focus sessions in this period. Pick a subject in the Focus Room before you start the timer.</p>
      ) : (
        <>
          <p className="st-time-total"><strong>{fmt(total)}</strong> focused in total</p>
          <ul className="st-bars">
            {rows.map((r) => (
              <li key={r.subject || "_none"}>
                <span className="st-bar-name">{r.subject || "No subject"}</span>
                <div className="st-bar"><i style={{ width: `${Math.max(3, (r.minutes / max) * 100)}%`, background: r.subject ? subjectColor(r.subject) : "var(--text-muted, #888)" }} /></div>
                <span className="st-bar-val">{fmt(r.minutes)} <small>{total ? Math.round((r.minutes / total) * 100) : 0}%</small></span>
              </li>
            ))}
          </ul>
          {onlyUnassigned && <p className="st-muted">Choose a subject in the Focus Room so your hours are split by subject.</p>}
        </>
      )}
    </article>
  );
}

// =============================================================== reminders (Settings)
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const pad2 = (n) => String(n).padStart(2, "0");

// "18:05" <-> { h12: 6, minute: 5, pm: true }
function splitTime(value, fallback) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || "") || /^(\d{1,2}):(\d{2})$/.exec(fallback);
  const h24 = Math.min(23, Number(m[1]));
  return { h12: h24 % 12 === 0 ? 12 : h24 % 12, minute: Math.min(59, Number(m[2])), pm: h24 >= 12 };
}
function joinTime({ h12, minute, pm }) {
  return `${pad2((h12 % 12) + (pm ? 12 : 0))}:${pad2(minute)}`;
}

function TimeSelect({ value, fallback, onChange, label, disabled }) {
  const t = splitTime(value, fallback);
  const set = (patch) => onChange(joinTime({ ...t, ...patch }));
  return (
    <div className={`st-time${disabled ? " is-off" : ""}`} role="group" aria-label={label}>
      <select aria-label={`${label}: hour`} value={t.h12} onChange={(e) => set({ h12: Number(e.target.value) })}>
        {HOURS_12.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="st-time-colon">:</span>
      <select aria-label={`${label}: minute`} value={t.minute} onChange={(e) => set({ minute: Number(e.target.value) })}>
        {MINUTES.map((m) => <option key={m} value={m}>{pad2(m)}</option>)}
      </select>
      <select aria-label={`${label}: AM or PM`} value={t.pm ? "PM" : "AM"} onChange={(e) => set({ pm: e.target.value === "PM" })}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function ReminderRow({ title, hint, on, onToggle, time, fallback, onTime, timeLabel, children }) {
  return (
    <div className="st-rem-row">
      <div className="st-rem-main">
        <div className="st-rem-text">
          <strong>{title}</strong>
          <p>{hint}</p>
        </div>
        <button
          type="button"
          className={`settings-switch ${on ? "is-on" : ""}`}
          role="switch"
          aria-checked={on}
          aria-label={title}
          onClick={onToggle}
        >
          <span />
        </button>
      </div>
      <div className="st-rem-timeline">
        <span className="st-rem-timelabel">{timeLabel}</span>
        <TimeSelect value={time} fallback={fallback} onChange={onTime} label={timeLabel} disabled={!on} />
      </div>
      {children}
    </div>
  );
}

export function ReminderSettings({ prefs, onChange }) {
  const [perm, setPerm] = useState(null); // { state, message }
  const [exactOk, setExactOk] = useState(true);
  const [testMsg, setTestMsg] = useState("");
  const [soundIssue, setSoundIssue] = useState(false);
  const [diag, setDiag] = useState(null);
  const [busy, setBusy] = useState(false);
  const [nstat, setNstat] = useState(null);
  const supported = notificationsSupported();
  const native = Capacitor.isNativePlatform();

  useEffect(() => {
    let alive = true;
    exactAlarmsGranted().then((ok) => alive && setExactOk(ok));
    return () => { alive = false; };
  }, [prefs.daily, prefs.streak]);

  const runDiag = useCallback(async () => setDiag(await getDiagnostics()), []);
  useEffect(() => { if (native) { runDiag(); getNotifyStatus().then(setNstat); } }, [native, runDiag]);

  const toggle = async (key) => {
    if (prefs[key]) {
      onChange((cur) => ({ ...cur, [key]: false }));
      return;
    }
    // Switch on straight away so the tap always responds; flip back if Android says no.
    onChange((cur) => ({ ...cur, [key]: true }));
    if (!supported) return;
    setBusy(true);
    setPerm(null);
    const res = await requestReminderPermission(); // shows the Allow / Don't allow pop-up (has its own time limit)
    setBusy(false);
    setPerm(res);
    runDiag();
    if (res.state !== "granted") {
      onChange((cur) => ({ ...cur, [key]: false }));
      return;
    }
    // Android: also ask for "Alarms & reminders" so it fires on the exact minute (does not block the toggle).
    requestExactAlarms().then(setExactOk).catch(() => {});
  };

  const custom = Array.isArray(prefs.custom) ? prefs.custom : [];
  const updateCustom = (id, patch) =>
    onChange((cur) => ({ ...cur, custom: (cur.custom || []).map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeCustom = (id) =>
    onChange((cur) => ({ ...cur, custom: (cur.custom || []).filter((c) => c.id !== id) }));
  const addCustom = async () => {
    if (custom.length >= MAX_CUSTOM) return;
    if (supported) {
      setBusy(true);
      const res = await requestReminderPermission();
      setBusy(false);
      setPerm(res);
      runDiag();
      if (res.state !== "granted") return;
    }
    onChange((cur) => ({
      ...cur,
      custom: [...(cur.custom || []), { id: Date.now(), time: "08:00", text: "", on: true }].slice(0, MAX_CUSTOM),
    }));
  };

  const test = async () => {
    setSoundIssue(false);
    const res = await requestReminderPermission();
    setPerm(res);
    if (res.state !== "granted") {
      setTestMsg(res.message || "Allow notifications first, then try again.");
      return;
    }
    const out = await sendTestReminder();
    runDiag();
    setSoundIssue(Boolean(out.soundIssue));
    setTestMsg(out.ok ? "Test reminder sent. Check your notification bar." : out.message);
    setTimeout(() => setTestMsg(""), 8000);
  };

  return (
    <article className="settings-card st-reminders">
      <div className="settings-card-heading">
        <span className="settings-card-icon"><Bell size={19} /></span>
        <div>
          <h3>Study reminders</h3>
          <p>Pick when StudyOS should nudge you. Reminders play the StudyOS chime.</p>
        </div>
      </div>

      {!supported && <p className="st-muted">This browser does not support notifications.</p>}

      {native && nstat && nstat.sdk < 33 && (
        <p className="st-info">
          Your phone runs Android 12 or older (API {nstat.sdk}). These versions never show an “Allow” pop-up, because notifications are
          allowed automatically. Just turn a toggle on and tap “Send test reminder”.
        </p>
      )}
      {native && nstat && nstat.sdk >= 33 && nstat.declaresPostNotifications === false && (
        <p className="st-error">This app build does not ask Android for notification permission. Uninstall it, rebuild and reinstall.</p>
      )}

      <ReminderRow
        title="Daily “time to study” reminder"
        hint="A friendly nudge every day at your chosen time."
        on={prefs.daily}
        onToggle={() => toggle("daily")}
        time={prefs.time}
        fallback="18:00"
        onTime={(time) => onChange({ ...prefs, time })}
        timeLabel="Remind me at"
      />

      <ReminderRow
        title="Warn me when my streak is about to break"
        hint="Only sent on days you have not studied yet."
        on={prefs.streak}
        onToggle={() => toggle("streak")}
        time={prefs.streakTime}
        fallback="20:00"
        onTime={(streakTime) => onChange({ ...prefs, streakTime })}
        timeLabel="Warn me at"
      />

      <ReminderRow
        title="Nag mode (like Duolingo) 🦉"
        hint="Playful nudges through the day that get cheekier until you study. They stop as soon as you finish a session."
        on={prefs.nag}
        onToggle={() => toggle("nag")}
        time={prefs.nagStart}
        fallback="15:00"
        onTime={(nagStart) => onChange({ ...prefs, nagStart })}
        timeLabel="Start nudging at"
      >
        <div className="st-rem-timeline">
          <span className="st-rem-timelabel">Last nudge at</span>
          <TimeSelect value={prefs.nagEnd} fallback="21:00" onChange={(nagEnd) => onChange({ ...prefs, nagEnd })} label="Last nudge at" disabled={!prefs.nag} />
        </div>
        <div className="st-rem-timeline">
          <span className="st-rem-timelabel">Nudge me every</span>
          <select
            className="st-every"
            aria-label="Hours between nudges"
            value={prefs.nagEvery}
            disabled={!prefs.nag}
            onChange={(e) => onChange({ ...prefs, nagEvery: Number(e.target.value) })}
          >
            {[1, 2, 3, 4].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
          </select>
        </div>
      </ReminderRow>

      <div className="st-rem-row">
        <div className="st-rem-text">
          <strong>My own reminders</strong>
          <p>Add as many as {MAX_CUSTOM} reminders at any time, with your own message (for example “Revise chemistry”).</p>
        </div>
        {custom.map((c) => (
          <div className="st-custom" key={c.id}>
            <div className="st-custom-top">
              <TimeSelect value={c.time} fallback="08:00" onChange={(time) => updateCustom(c.id, { time })} label="Custom reminder time" disabled={c.on === false} />
              <button
                type="button"
                className={`settings-switch ${c.on !== false ? "is-on" : ""}`}
                role="switch"
                aria-checked={c.on !== false}
                aria-label="Turn this reminder on or off"
                onClick={() => updateCustom(c.id, { on: c.on === false })}
              >
                <span />
              </button>
              <button type="button" className="st-link" onClick={() => removeCustom(c.id)} aria-label="Delete this reminder">Delete</button>
            </div>
            <input
              className="st-custom-text"
              type="text"
              maxLength={80}
              placeholder="Message, e.g. Revise chemistry"
              value={c.text}
              onChange={(e) => updateCustom(c.id, { text: e.target.value })}
            />
          </div>
        ))}
        <button type="button" className="settings-save-button" onClick={addCustom} disabled={custom.length >= MAX_CUSTOM}>
          + Add a reminder
        </button>
      </div>

      {busy && <p className="st-muted" role="status"><RefreshCw size={14} /> Waiting for Android...</p>}
      {perm && perm.state !== "granted" && (
        <p className="st-error" role="alert">
          {perm.message || "Notifications are blocked. Allow them in your device or browser settings, then try again."}{" "}
          {native && perm.state === "blocked" && (
            <button type="button" className="st-link" onClick={openNotificationSettings}>Open notification settings</button>
          )}
        </p>
      )}
      <div className="st-rem-actions">
        <button type="button" className="settings-save-button" onClick={test}>
          <Bell size={15} /> Send test reminder
        </button>
        {testMsg && <span className="st-muted" role="status">{testMsg}</span>}
      </div>

      {soundIssue && (
        <p className="st-error" role="alert">
          Sound is switched off for StudyOS reminders on this phone.{" "}
          <button type="button" className="st-link" onClick={openChannelSettings}>Open sound settings</button>
        </p>
      )}
      {native && testMsg.startsWith("Test reminder sent") && !soundIssue && (
        <p className="st-muted st-hint">No sound? Check the phone is not on silent or Do Not Disturb and the notification volume is up.</p>
      )}
      {!exactOk && (
        <p className="st-error">
          Android may delay reminders until you allow “Alarms &amp; reminders” for StudyOS.{" "}
          <button type="button" className="st-link" onClick={async () => setExactOk(await requestExactAlarms())}>Allow now</button>
        </p>
      )}
      {native && (
        <div className="st-diag">
          <div className="st-row">
            <strong>Notification check</strong>
            <button type="button" className="st-link" onClick={runDiag}>Refresh</button>
          </div>
          <ul>
            {(diag || []).map((d, i) => (
              <li key={i} className={d.ok ? "ok" : "bad"}>
                <span aria-hidden="true">{d.ok ? "✓" : "✗"}</span>
                <span>{d.label}{d.detail ? <small> {d.detail}</small> : null}</span>
              </li>
            ))}
            {!diag && <li className="st-muted">Checking...</li>}
          </ul>
        </div>
      )}
      <p className="st-muted st-hint">In the Android app reminders arrive on time even when StudyOS is closed. In a browser they only appear while StudyOS is open.</p>
    </article>
  );
}

// =============================================================== offline banner
export function OfflineBanner() {
  const { online, pending, syncing } = useOfflineStatus();
  if (online && !pending && !syncing) return null;
  return (
    <div className={`st-offline${online ? " syncing" : ""}`} role="status" aria-live="polite">
      {online ? <RefreshCw size={15} className="spin" /> : <WifiOff size={15} />}
      <span>
        {online
          ? `Syncing ${pending} change${pending === 1 ? "" : "s"}...`
          : `You're offline. Your work is saved on this device${pending ? ` (${pending} change${pending === 1 ? "" : "s"} waiting)` : ""} and will sync automatically.`}
      </span>
    </div>
  );
}
