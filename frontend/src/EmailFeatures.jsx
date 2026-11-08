// Email features: forgot/reset password, email confirmation, email settings,
// "email me this note" and "email me these flashcards".
import { useCallback, useEffect, useState } from "react";
import { Mail, Send, Check, X, Loader2 } from "lucide-react";
import "./emailFeatures.css";
import CollapsibleCard from "./CollapsibleCard";

const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function request(method, path, { token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Something went wrong (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// React StrictMode runs effects twice in development; a link token may only be used once.
const verifyCalls = new Map();
function verifyOnce(token) {
  if (!verifyCalls.has(token)) {
    verifyCalls.set(token, request("POST", "/api/auth/verify-email", { body: { token } }));
  }
  return verifyCalls.get(token);
}

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

// ---------- Forgot password (pop-up on the sign-in screen) ----------

export function ForgotPasswordModal({ initialEmail = "", onClose }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await request("POST", "/api/auth/forgot-password", { body: { email: value } });
      setDone(true);
    } catch (err) {
      setError(err instanceof TypeError ? "Cannot reach the server. Check your connection." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="em-overlay" role="presentation" onClick={onClose}>
      <div className="em-dialog" role="dialog" aria-modal="true" aria-labelledby="em-forgot-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="em-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <h2 id="em-forgot-title">Reset your password</h2>
        {done ? (
          <>
            <p className="em-text">If an account exists for <strong>{email.trim()}</strong>, we have sent a link to reset the password. It works for 1 hour. Check your spam folder too.</p>
            <button type="button" className="em-button" onClick={onClose}>Back to sign in</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <p className="em-text">Enter your account email and we will send you a reset link.</p>
            <input
              className="em-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              maxLength={254}
              required
              autoFocus
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
            />
            {error && <p className="em-error" role="alert">{error}</p>}
            <button className="em-button" type="submit" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------- Pages opened from an email link (?reset=... and ?verify=...) ----------

export function EmailLinkScreen({ kind, token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState(kind === "verify" ? "working" : "form"); // working | form | done | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studyos-theme");
      document.documentElement.dataset.theme = saved === "light" ? "light" : "dark";
    } catch {
      /* theme is optional here */
    }
  }, []);

  useEffect(() => {
    if (kind !== "verify") return undefined;
    let alive = true;
    verifyOnce(token)
      .then((data) => {
        if (!alive) return;
        setMessage(data.message || "Your email address is confirmed.");
        setState("done");
      })
      .catch((err) => {
        if (!alive) return;
        setMessage(err instanceof TypeError ? "Cannot reach the server. Check your connection and reload." : err.message);
        setState("error");
      });
    return () => { alive = false; };
  }, [kind, token]);

  async function submitReset(event) {
    event.preventDefault();
    if (password.length < 8 || password.length > 128) {
      setMessage("Your password must be between 8 and 128 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("The two passwords do not match.");
      return;
    }
    setMessage("");
    setState("working");
    try {
      const data = await request("POST", "/api/auth/reset-password", { body: { token, password } });
      setMessage(data.message || "Your password was changed.");
      setState("done");
    } catch (err) {
      setMessage(err instanceof TypeError ? "Cannot reach the server. Check your connection and try again." : err.message);
      setState(err.status === 400 && /link/i.test(err.message) ? "error" : "form");
    }
  }

  function openApp() {
    window.location.replace(`${window.location.origin}/`);
  }

  return (
    <main className="em-page">
      <div className="em-card">
        <div className="em-brand">StudyOS</div>
        {state === "working" && <p className="em-text"><Loader2 size={16} className="em-spin" /> Please wait...</p>}

        {state === "form" && (
          <form onSubmit={submitReset}>
            <h1>Choose a new password</h1>
            <input className="em-input" type="password" autoComplete="new-password" placeholder="New password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
            <input className="em-input" type="password" autoComplete="new-password" placeholder="Repeat new password" minLength={8} maxLength={128} required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
            {message && <p className="em-error" role="alert">{message}</p>}
            <button className="em-button" type="submit">Save new password</button>
          </form>
        )}

        {state === "done" && (
          <>
            <h1><Check size={22} className="em-ok" /> {kind === "verify" ? "Email confirmed" : "Password changed"}</h1>
            <p className="em-text">{message}</p>
            <button className="em-button" type="button" onClick={openApp}>{kind === "verify" ? "Open StudyOS" : "Go to sign in"}</button>
          </>
        )}

        {state === "error" && (
          <>
            <h1>This link did not work</h1>
            <p className="em-error" role="alert">{message}</p>
            <button className="em-button" type="button" onClick={openApp}>Open StudyOS</button>
          </>
        )}
      </div>
    </main>
  );
}

// ---------- Settings: email notifications ----------

const EMAIL_OPTIONS = [
  ["weeklyReport", "Weekly report", "Your progress, every Sunday."],
  ["examCountdown", "Exam countdown", "7 days and 1 day before an exam."],
  ["dailyDigest", "Morning tasks", "Overdue and due-today tasks."],
  ["streakWarning", "Streak warning", "Only if your streak is at risk."],
  ["flashcardsDue", "Flashcards due", "When cards are ready to review."],
  ["securityAlerts", "Security alerts", "When a new device signs in."],
];

export function EmailSettingsCard({ authToken, student }) {
  const [data, setData] = useState(null); // { prefs, emailVerified, email, mailConfigured }
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!authToken) return undefined;
    let alive = true;
    request("GET", "/api/email/prefs", { token: authToken })
      .then((result) => {
        if (!alive) return;
        setData(result);
        // Keep emails on your local clock: remember this device's time zone.
        const zone = browserTimeZone();
        if (zone && zone !== result.prefs.timeZone) {
          request("PUT", "/api/email/prefs", { token: authToken, body: { timeZone: zone } }).catch(() => {});
        }
      })
      .catch((err) => alive && setError(err.message || "Could not load email settings."));
    return () => { alive = false; };
  }, [authToken]);

  const toggle = useCallback(
    async (key) => {
      if (!data) return;
      const next = !data.prefs[key];
      setData((current) => ({ ...current, prefs: { ...current.prefs, [key]: next } }));
      setError("");
      try {
        await request("PUT", "/api/email/prefs", { token: authToken, body: { [key]: next } });
      } catch (err) {
        setData((current) => ({ ...current, prefs: { ...current.prefs, [key]: !next } }));
        setError(err.message || "Could not save that setting.");
      }
    },
    [authToken, data]
  );

  async function action(name, path) {
    setBusy(name);
    setError("");
    setNote("");
    try {
      const result = await request("POST", path, { token: authToken });
      setNote(result.message || "Done.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const email = data?.email || student?.email || "";

  const onCount = data ? EMAIL_OPTIONS.filter(([key]) => data.prefs[key]).length : 0;

  return (
    <CollapsibleCard
      className="em-settings"
      icon={<Mail size={19} />}
      title="Email notifications"
      summary={data ? (onCount ? `${onCount} of ${EMAIL_OPTIONS.length} on` : "All off") : email || "Reports and reminders by email"}
    >
      {email && <p className="st-muted">Sent to {email}</p>}

      {data && data.mailConfigured === false && (
        <p className="st-info">Email sending is not set up on this server yet, so nothing can be sent. See UPDATE_GUIDE_4_EMAILS.md.</p>
      )}

      {data && !data.emailVerified && (
        <div className="st-error em-verify">
          <span>Your email is not confirmed yet, so StudyOS cannot email you.</span>
          <button type="button" className="settings-save-button" disabled={busy === "verify"} onClick={() => action("verify", "/api/email/verification")}>
            {busy === "verify" ? "Sending..." : "Send confirmation email"}
          </button>
        </div>
      )}

      {data && EMAIL_OPTIONS.map(([key, title, hint]) => (
        <div className="settings-toggle-row" key={key}>
          <div>
            <strong>{title}</strong>
            <p>{hint}</p>
          </div>
          <button
            type="button"
            className={`settings-switch ${data.prefs[key] ? "is-on" : ""}`}
            role="switch"
            aria-checked={data.prefs[key]}
            aria-label={title}
            onClick={() => toggle(key)}
          >
            <span />
          </button>
        </div>
      ))}

      {!data && !error && <p className="st-muted">Loading...</p>}
      {data && data.emailVerified && (
        <button type="button" className="settings-save-button em-test" disabled={busy === "test"} onClick={() => action("test", "/api/email/test")}>
          <Send size={14} /> {busy === "test" ? "Sending..." : "Send me a test email"}
        </button>
      )}

      {note && <p className="st-info" role="status">{note}</p>}
      {error && <p className="st-error" role="alert">{error}</p>}
    </CollapsibleCard>
  );
}

// ---------- "Email me this note" ----------

export function EmailNoteButton({ note, authToken, onNotice }) {
  const [state, setState] = useState("idle"); // idle | sending | sent

  async function send() {
    if (state === "sending") return;
    setState("sending");
    try {
      const result = await request("POST", "/api/email/note", { token: authToken, body: { noteId: note.id } });
      setState("sent");
      onNotice?.(result.message || "Note sent to your email.");
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      setState("idle");
      onNotice?.(err instanceof TypeError ? "You need an internet connection to email a note." : err.message);
    }
  }

  return (
    <button
      type="button"
      className="note-action-button"
      onClick={send}
      disabled={state === "sending"}
      aria-label={`Email ${note.title} to me`}
      title="Email this note to me"
    >
      {state === "sent" ? <Check size={15} /> : <Mail size={15} />}
    </button>
  );
}

// ---------- "Email me my flashcards" ----------

export function EmailFlashcardsButton({ authToken, subjectNames = [], onNotice }) {
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const result = await request("POST", "/api/email/flashcards", { token: authToken, body: subject ? { subject } : {} });
      onNotice?.(result.message || "Flashcards sent to your email.");
    } catch (err) {
      onNotice?.(err instanceof TypeError ? "You need an internet connection to email flashcards." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="em-flash-send">
      <select value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Subject to email" disabled={busy}>
        <option value="">All subjects</option>
        {subjectNames.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
      <button type="button" className="settings-save-button" onClick={send} disabled={busy}>
        <Mail size={14} /> {busy ? "Sending..." : "Email my cards"}
      </button>
    </div>
  );
}
