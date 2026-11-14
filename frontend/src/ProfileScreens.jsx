import React, { useEffect, useMemo, useState } from "react";
import {
  Bell, ChevronLeft, ChevronRight, Flame, Gem, Settings as Cog, Share2, LogOut, UserPlus, Check, X,
  Timer, Users, Pencil, ListChecks, CalendarDays, Trophy, Sparkles, BellOff,
} from "lucide-react";
import { useCountUp } from "./HomeScreen";
import "./profile.css";

// Native-app Profile and Notifications screens. They own no server data: App.jsx passes everything in.

const AV_COLORS = ["#c7b9c4", "#9fb6c3", "#c9c4a6", "#b4c7b0", "#d0b09f"];

function colorFor(text) {
  let h = 0;
  for (const ch of String(text)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
}

function Avatar({ name, picture, size = 44 }) {
  const [broken, setBroken] = useState(false);
  const letter = String(name || "?").trim().charAt(0).toUpperCase() || "?";
  if (picture && !broken) {
    return <img className="pf-av" src={picture} alt="" width={size} height={size} style={{ width: size, height: size }} onError={() => setBroken(true)} referrerPolicy="no-referrer" />;
  }
  return <span className="pf-av pf-av-l" style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.42 }} aria-hidden="true">{letter}</span>;
}

function Stat({ icon: Icon, value, label, i }) {
  const n = useCountUp(Number(value) || 0);
  return (
    <div className="pf-stat pf-rise" style={{ "--i": i }}>
      <Icon size={18} />
      <b>{n.toLocaleString()}</b>
      <span>{label}</span>
    </div>
  );
}

export function timeAgo(value) {
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d}d ago`;
}

function formatMinutes(total) {
  const m = Math.max(0, Math.round(total || 0));
  if (m < 60) return { value: m, label: "min studied" };
  return { value: Math.round(m / 6) / 10, label: "hours studied", decimal: true };
}

export function ProfileScreen({
  student, guest, gems, streak, focusMinutes, score, social, unread,
  nameDraft, setNameDraft, onSaveName, nameSaving,
  onAddFriend, onRespond, onRemove, onInvite,
  onOpenSettings, onOpenNotifications, onCreateProfile, onLogout, loadingSocial,
}) {
  const name = student?.displayName || student?.name || "Student";
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [removing, setRemoving] = useState("");
  const friends = social?.friends || [];
  const incoming = social?.incoming || [];
  const outgoing = social?.outgoing || [];
  const study = formatMinutes(focusMinutes);

  useEffect(() => { if (!removing) return undefined; const id = setTimeout(() => setRemoving(""), 3000); return () => clearTimeout(id); }, [removing]);

  async function submitFriend(event) {
    event.preventDefault();
    const value = email.trim();
    if (!value || adding) return;
    if (!value.includes("@")) { setMsg("Enter your friend's email address."); return; }
    setAdding(true);
    setMsg("");
    const result = await onAddFriend(value);
    setAdding(false);
    setMsg(result?.message || "");
    if (result?.ok) setEmail("");
  }

  async function submitName(event) {
    const ok = await onSaveName(event);
    if (ok !== false) setEditing(false);
  }

  return (
    <div className="hm pf">
      <div className="pf-hero pf-rise" style={{ "--i": 0 }}>
        <Avatar name={name} picture={guest ? "" : student?.picture} size={76} />
        {editing && !guest ? (
          <form className="pf-name-form" onSubmit={submitName}>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} minLength={2} maxLength={40} autoFocus aria-label="Display name" disabled={nameSaving} />
            <div>
              <button type="submit" className="pf-btn" disabled={nameSaving}>{nameSaving ? "Saving…" : "Save"}</button>
              <button type="button" className="pf-btn ghost" onClick={() => setEditing(false)} disabled={nameSaving}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="pf-name">{guest ? "Guest" : name}</h1>
            <p className="pf-mail">{guest ? "Not signed in" : student?.email}</p>
            {!guest && <button type="button" className="pf-edit" onClick={() => setEditing(true)}><Pencil size={14} /> Edit name</button>}
          </>
        )}
      </div>

      {guest ? (
        <div className="pf-card pf-rise pf-cta" style={{ "--i": 1 }}>
          <Sparkles size={22} />
          <div>
            <b>Create your profile</b>
            <span>Save your progress, earn gems and study with friends.</span>
          </div>
          <button type="button" className="pf-btn" onClick={onCreateProfile}>Create</button>
        </div>
      ) : (
        <>
          <div className="pf-stats">
            <Stat icon={Gem} value={gems} label="gems" i={1} />
            <Stat icon={Flame} value={streak} label="day streak" i={2} />
            <Stat icon={Timer} value={study.value} label={study.label} i={3} />
            <Stat icon={Users} value={friends.length} label="friends" i={4} />
          </div>
          {score != null && (
            <div className="pf-card pf-rise pf-score" style={{ "--i": 5 }}>
              <Trophy size={20} /> <span>Starting score</span> <b>{score}</b>
            </div>
          )}

          <h2 className="pf-h pf-rise" style={{ "--i": 6 }}>Friends</h2>

          {incoming.length > 0 && (
            <div className="pf-card pf-rise" style={{ "--i": 7 }}>
              <p className="pf-sub">Requests</p>
              {incoming.map((u) => (
                <div className="pf-row" key={u.id}>
                  <Avatar name={u.name} picture={u.picture} />
                  <span className="pf-grow"><b>{u.name}</b><small>wants to study with you</small></span>
                  <button type="button" className="pf-circle ok" aria-label={`Accept ${u.name}`} onClick={() => onRespond(u.id, true)}><Check size={17} /></button>
                  <button type="button" className="pf-circle" aria-label={`Decline ${u.name}`} onClick={() => onRespond(u.id, false)}><X size={17} /></button>
                </div>
              ))}
            </div>
          )}

          <form className="pf-card pf-rise pf-add" style={{ "--i": 8 }} onSubmit={submitFriend}>
            <p className="pf-sub">Add a friend by email</p>
            <div className="pf-add-row">
              <input type="email" inputMode="email" autoComplete="off" placeholder="friend@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setMsg(""); }} maxLength={254} aria-label="Friend email" />
              <button type="submit" className="pf-btn" disabled={adding || !email.trim()}><UserPlus size={16} /> {adding ? "…" : "Add"}</button>
            </div>
            {msg && <p className="pf-msg" role="status">{msg}</p>}
          </form>

          <div className="pf-card pf-rise" style={{ "--i": 9 }}>
            {loadingSocial && !friends.length ? (
              <p className="pf-empty">Loading friends…</p>
            ) : friends.length === 0 ? (
              <p className="pf-empty">No friends yet. Add one above or invite someone — you both earn 10 gems when they accept.</p>
            ) : (
              friends.map((u) => (
                <div className="pf-row" key={u.id}>
                  <Avatar name={u.name} picture={u.picture} />
                  <span className="pf-grow"><b>{u.name}</b><small><Gem size={11} /> {u.gems.toLocaleString()} gems</small></span>
                  <button type="button" className={`pf-link${removing === u.id ? " warn" : ""}`} onClick={() => { if (removing === u.id) { setRemoving(""); onRemove(u.id); } else setRemoving(u.id); }}>
                    {removing === u.id ? "Tap to remove" : "Remove"}
                  </button>
                </div>
              ))
            )}
            {outgoing.length > 0 && (
              <>
                <p className="pf-sub" style={{ marginTop: 10 }}>Waiting for reply</p>
                {outgoing.map((u) => (
                  <div className="pf-row" key={u.id}>
                    <Avatar name={u.name} picture={u.picture} />
                    <span className="pf-grow"><b>{u.name}</b><small>Request sent</small></span>
                    <button type="button" className="pf-link" onClick={() => onRemove(u.id)}>Cancel</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      <div className="pf-card pf-menu pf-rise" style={{ "--i": 10 }}>
        <button type="button" onClick={onOpenNotifications}>
          <Bell size={19} /><span>Notifications</span>
          {unread > 0 && <i className="pf-badge">{unread > 9 ? "9+" : unread}</i>}
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={onOpenSettings}><Cog size={19} /><span>Settings</span><ChevronRight size={18} /></button>
        <button type="button" onClick={onInvite}><Share2 size={19} /><span>Invite friends</span><ChevronRight size={18} /></button>
        {!guest && <button type="button" className="danger" onClick={onLogout}><LogOut size={19} /><span>Sign out</span></button>}
      </div>
    </div>
  );
}

export function BackPill({ onClick, label = "Back" }) {
  return (
    <button type="button" className="pf-back" onClick={onClick}><ChevronLeft size={17} /> {label}</button>
  );
}

const ICONS = { friend_request: UserPlus, friend_accepted: Users, gems: Gem, streak: Flame, tasks: ListChecks, exam: CalendarDays, system: Bell };

export function NotificationsScreen({
  guest, items, local, unread, loading, onBack, onReadAll, onDelete, onRespond, onOpen, onCreateProfile, pendingFrom,
}) {
  const [answered, setAnswered] = useState({});
  const all = useMemo(() => [...(local || []), ...(items || [])], [local, items]);

  async function answer(item, accept) {
    setAnswered((p) => ({ ...p, [item.id]: accept ? "accepted" : "declined" }));
    const ok = await onRespond(item.from, accept, item.id);
    if (ok === false) setAnswered((p) => { const n = { ...p }; delete n[item.id]; return n; });
  }

  return (
    <div className="hm pf">
      <div className="pf-bar pf-rise" style={{ "--i": 0 }}>
        <BackPill onClick={onBack} />
        {!guest && unread > 0 && <button type="button" className="pf-link" onClick={onReadAll}>Mark all read</button>}
      </div>
      <h1 className="pf-title pf-rise" style={{ "--i": 1 }}>Notifications</h1>

      {guest && (
        <div className="pf-card pf-rise pf-cta" style={{ "--i": 2 }}>
          <Sparkles size={22} />
          <div><b>Create your profile</b><span>Get friend requests, rewards and reminders here.</span></div>
          <button type="button" className="pf-btn" onClick={onCreateProfile}>Create</button>
        </div>
      )}

      {loading && !all.length ? <p className="pf-empty">Loading…</p> : null}

      {!loading && !all.length && !guest && (
        <div className="pf-card pf-rise pf-none" style={{ "--i": 2 }}>
          <BellOff size={30} />
          <b>You're all caught up</b>
          <span>New friend requests, rewards and reminders will show up here.</span>
        </div>
      )}

      <div className="pf-list">
        {all.map((n, idx) => {
          const Icon = ICONS[n.kind || n.type] || Bell;
          const isReq = n.type === "friend_request" && n.from;
          const state = answered[n.id] || (isReq && pendingFrom && !pendingFrom.has(n.from) ? "done" : "");
          return (
            <div className={`pf-note pf-rise${n.read === false ? " unread" : ""}`} style={{ "--i": 2 + Math.min(idx, 10) }} key={n.id}>
              <span className="pf-note-ic"><Icon size={19} /></span>
              <div className="pf-grow">
                <b>{n.title}</b>
                {n.body && <small>{n.body}</small>}
                {isReq && !state && (
                  <div className="pf-note-act">
                    <button type="button" className="pf-btn" onClick={() => answer(n, true)}>Accept</button>
                    <button type="button" className="pf-btn ghost" onClick={() => answer(n, false)}>Decline</button>
                  </div>
                )}
                {isReq && state === "accepted" && <small className="pf-ok">You are now friends</small>}
                {isReq && state === "declined" && <small>Declined</small>}
                {isReq && state === "done" && <small>Already answered</small>}
                {n.action && <button type="button" className="pf-link" onClick={() => onOpen(n.action)}>{n.actionLabel || "Open"} →</button>}
              </div>
              <span className="pf-time">{n.createdAt ? timeAgo(n.createdAt) : ""}</span>
              {n.local ? null : <button type="button" className="pf-x" aria-label="Remove notification" onClick={() => onDelete(n.id)}><X size={15} /></button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
