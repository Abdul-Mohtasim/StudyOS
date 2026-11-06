"use strict";

// All StudyOS emails. Every template returns { subject, html, text }.

const { formatDateKey } = require("../utils/emailTime");
const { compareToLast, formatHours } = require("../utils/emailStats");

const BRAND = "#E4585F";

function appUrl(path = "") {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}${path}`;
}

// Logo shown at the top of every email. Email apps block inline SVG, so it is a PNG
// served from the web app (frontend/public/icons/email-logo.png). Override with EMAIL_LOGO_URL.
function logoUrl() {
  return process.env.EMAIL_LOGO_URL || appUrl("/icons/email-logo.png");
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(student) {
  const full = String(student?.displayName || student?.name || "").trim();
  return full.split(/\s+/)[0] || "there";
}

function button(label, url) {
  return `<p style="margin:24px 0"><a href="${esc(url)}" style="background:${BRAND};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block">${esc(label)}</a></p>`;
}

function layout({ preheader, title, body, manage = true }) {
  const footer = manage
    ? `You get this because of your StudyOS email settings. <a href="${esc(appUrl())}" style="color:#8a8f98">Open StudyOS &rarr; Settings</a> to change which emails you receive.`
    : "You get this email because it relates to your StudyOS account.";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fff3ec;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2430">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || "")}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff3ec;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:28px 26px">
<tr><td>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:18px"><tr>
<td style="padding-right:10px;vertical-align:middle"><img src="${esc(logoUrl())}" width="36" height="36" alt="StudyOS" style="display:block;border:0;outline:none;width:36px;height:36px"></td>
<td style="vertical-align:middle;font-size:20px;font-weight:800;color:${BRAND}">StudyOS</td>
</tr></table>
<h1 style="font-size:22px;line-height:1.3;margin:0 0 14px">${esc(title)}</h1>
${body}
</td></tr></table>
<p style="max-width:520px;font-size:12px;line-height:1.5;color:#8a8f98;margin:16px 0 0">${footer}</p>
</td></tr></table></body></html>`;
}

const p = (text) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">${text}</p>`;

function statRow(label, value, note) {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e6df;font-size:14px;color:#5b6270">${esc(label)}</td><td style="padding:8px 0;border-bottom:1px solid #f0e6df;font-size:15px;font-weight:700;text-align:right">${esc(value)}</td><td style="padding:8px 0 8px 10px;border-bottom:1px solid #f0e6df;font-size:13px;color:#8a8f98;text-align:right">${esc(note || "")}</td></tr>`;
}

// ---------- Account emails ----------

function welcome({ student, verifyUrl }) {
  const name = firstName(student);
  const body =
    p(`Welcome to StudyOS! Your account is ready. Plan tasks, take notes, run focus sessions, review flashcards and track your exams in one place.`) +
    (verifyUrl
      ? p("Please confirm your email address so StudyOS can send you reminders and reports. The link works for 24 hours.") + button("Confirm my email", verifyUrl)
      : button("Open StudyOS", appUrl()));
  return {
    subject: "Welcome to StudyOS",
    html: layout({ preheader: "Your StudyOS account is ready.", title: `Welcome, ${name}!`, body, manage: false }),
    text: `Welcome to StudyOS, ${name}!\n\nYour account is ready.\n${verifyUrl ? `\nConfirm your email (valid 24 hours):\n${verifyUrl}\n` : `\nOpen StudyOS: ${appUrl()}\n`}`,
  };
}

function verifyEmail({ student, url }) {
  const name = firstName(student);
  const body =
    p("Tap the button to confirm this email address for your StudyOS account. The link works for 24 hours.") +
    button("Confirm my email", url) +
    p("If you did not create a StudyOS account, you can ignore this email.");
  return {
    subject: "Confirm your StudyOS email",
    html: layout({ preheader: "Confirm your email address.", title: `Hi ${name}, confirm your email`, body, manage: false }),
    text: `Hi ${name},\n\nConfirm your email for StudyOS (valid 24 hours):\n${url}\n\nIf you did not create an account, ignore this email.`,
  };
}

function passwordReset({ student, url }) {
  const name = firstName(student);
  const body =
    p("We received a request to reset your StudyOS password. The link works for 1 hour and can be used once.") +
    button("Choose a new password", url) +
    p("If you did not ask for this, ignore this email. Your password will stay the same.");
  return {
    subject: "Reset your StudyOS password",
    html: layout({ preheader: "Use this link to choose a new password.", title: `Hi ${name}, reset your password`, body, manage: false }),
    text: `Hi ${name},\n\nReset your StudyOS password (valid 1 hour, one use):\n${url}\n\nIf you did not ask for this, ignore this email.`,
  };
}

function passwordResetGoogle({ student }) {
  const name = firstName(student);
  const body =
    p("Someone asked to reset the password for this StudyOS account, but it signs in with Google and has no password to reset.") +
    p("Use “Continue with Google” on the sign-in screen.") +
    button("Open StudyOS", appUrl());
  return {
    subject: "StudyOS sign-in help",
    html: layout({ preheader: "This account uses Google sign-in.", title: `Hi ${name}`, body, manage: false }),
    text: `Hi ${name},\n\nThis StudyOS account signs in with Google, so there is no password to reset. Use "Continue with Google": ${appUrl()}`,
  };
}

function passwordChanged({ student }) {
  const name = firstName(student);
  const body =
    p("The password for your StudyOS account was just changed.") +
    p("If this was not you, reset your password again right away and check your email account's security.");
  return {
    subject: "Your StudyOS password was changed",
    html: layout({ preheader: "Your password was changed.", title: `Hi ${name}, password changed`, body, manage: false }),
    text: `Hi ${name},\n\nThe password for your StudyOS account was just changed. If this was not you, reset it again right away.`,
  };
}

function newLogin({ student, when, device, ip }) {
  const name = firstName(student);
  const body =
    p("We noticed a sign-in to your StudyOS account from a device we have not seen before.") +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 14px">
<tr><td style="padding:3px 14px 3px 0;color:#5b6270;font-size:14px">Device</td><td style="font-size:14px;font-weight:700">${esc(device)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#5b6270;font-size:14px">Time</td><td style="font-size:14px;font-weight:700">${esc(when)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#5b6270;font-size:14px">IP address</td><td style="font-size:14px;font-weight:700">${esc(ip || "unknown")}</td></tr></table>` +
    p("If this was you, no action is needed. If not, reset your password now.") +
    button("Reset my password", appUrl("/"));
  return {
    subject: "New sign-in to your StudyOS account",
    html: layout({ preheader: "A new device signed in.", title: `Hi ${name}, new sign-in`, body }),
    text: `Hi ${name},\n\nNew sign-in to your StudyOS account.\nDevice: ${device}\nTime: ${when}\nIP: ${ip || "unknown"}\n\nIf this was not you, reset your password.`,
  };
}

// ---------- Scheduled emails ----------

function weeklyReport({ student, weekly }) {
  const name = firstName(student);
  const { current, previous, best } = weekly;
  const bestText = best
    ? best.basis === "focus"
      ? `${best.name} (${formatHours(best.minutes)} of focus)`
      : `${best.name} (${best.tasks} task${best.tasks === 1 ? "" : "s"} done)`
    : "—";
  const rows =
    statRow("Hours studied", formatHours(current.minutes), `${compareToLast(current.minutes, previous.minutes)} vs last week (${formatHours(previous.minutes)})`) +
    statRow("Tasks done", String(current.tasks), `${compareToLast(current.tasks, previous.tasks)} vs last week (${previous.tasks})`) +
    statRow("Focus sessions", String(current.sessions), `${compareToLast(current.sessions, previous.sessions)} vs last week (${previous.sessions})`) +
    statRow("Best subject", bestText, "");
  const body =
    p("Here is how your last 7 days went compared with the 7 days before.") +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px">${rows}</table>` +
    button("Open StudyOS", appUrl());
  return {
    subject: `Your StudyOS week: ${formatHours(current.minutes)} studied, ${current.tasks} task${current.tasks === 1 ? "" : "s"} done`,
    html: layout({ preheader: `${formatHours(current.minutes)} studied this week.`, title: `Your week in review, ${name}`, body }),
    text: `Your week in review, ${name}\n\nHours studied: ${formatHours(current.minutes)} (last week ${formatHours(previous.minutes)}, ${compareToLast(current.minutes, previous.minutes)})\nTasks done: ${current.tasks} (last week ${previous.tasks}, ${compareToLast(current.tasks, previous.tasks)})\nFocus sessions: ${current.sessions} (last week ${previous.sessions})\nBest subject: ${bestText}\n\n${appUrl()}`,
  };
}

function examCountdown({ student, subject, date, daysLeft }) {
  const name = firstName(student);
  const when = daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`;
  const advice =
    daysLeft === 1
      ? "Do a light review, pack what you need and get a good night's sleep."
      : "Plan your revision now: pick the weakest topics first and schedule a focus session for each.";
  const body =
    p(`Your <strong>${esc(subject)}</strong> exam is <strong>${esc(when)}</strong> (${esc(formatDateKey(date))}).`) +
    p(esc(advice)) +
    button("Open StudyOS", appUrl());
  return {
    subject: `${subject} exam ${daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}`,
    html: layout({ preheader: `${subject} exam ${when}.`, title: `${subject} exam ${when}`, body }),
    text: `Hi ${name},\n\nYour ${subject} exam is ${when} (${formatDateKey(date)}).\n${advice}\n\n${appUrl()}`,
  };
}

function taskList(title, tasks, color) {
  if (!tasks.length) return "";
  const items = tasks
    .map(
      (task) =>
        `<li style="margin:4px 0;font-size:14px">${esc(task.title)} <span style="color:#8a8f98">· ${esc(task.subject || "Personal")}${task.dueDate ? ` · due ${esc(formatDateKey(task.dueDate))}` : ""}</span></li>`
    )
    .join("");
  return `<h2 style="font-size:15px;margin:16px 0 4px;color:${color}">${esc(title)} (${tasks.length})</h2><ul style="margin:0;padding-left:20px">${items}</ul>`;
}

function dailyDigest({ student, overdue, today, tomorrow }) {
  const name = firstName(student);
  const line = (list) => list.map((task) => `- ${task.title} (${task.subject || "Personal"})`).join("\n");
  const body =
    p("Here is what needs your attention today.") +
    taskList("Overdue", overdue, "#c7343b") +
    taskList("Due today", today, BRAND) +
    taskList("Due tomorrow", tomorrow, "#5b6270") +
    button("Open my tasks", appUrl());
  const parts = [];
  if (overdue.length) parts.push(`${overdue.length} overdue`);
  if (today.length) parts.push(`${today.length} due today`);
  return {
    subject: `Today in StudyOS: ${parts.join(", ")}`,
    html: layout({ preheader: parts.join(", "), title: `Good morning, ${name}`, body }),
    text: `Good morning, ${name}\n${overdue.length ? `\nOverdue:\n${line(overdue)}\n` : ""}${today.length ? `\nDue today:\n${line(today)}\n` : ""}${tomorrow.length ? `\nDue tomorrow:\n${line(tomorrow)}\n` : ""}\n${appUrl()}`,
  };
}

function streakWarning({ student, streak }) {
  const name = firstName(student);
  const body =
    p(`You are on a <strong>${streak}-day</strong> study streak, but you have not studied yet today.`) +
    p("One short focus session before midnight keeps it alive.") +
    button("Start a focus session", appUrl());
  return {
    subject: `Your ${streak}-day streak ends tonight`,
    html: layout({ preheader: "One short session keeps your streak alive.", title: `Keep your ${streak}-day streak, ${name}`, body }),
    text: `Hi ${name},\n\nYour ${streak}-day streak ends tonight unless you do a focus session. ${appUrl()}`,
  };
}

function flashcardsDue({ student, count, bySubject }) {
  const name = firstName(student);
  const list = bySubject
    .map((row) => `<li style="margin:3px 0;font-size:14px">${esc(row.subject || "No subject")}: ${row.count}</li>`)
    .join("");
  const body =
    p(`You have <strong>${count} flashcard${count === 1 ? "" : "s"}</strong> ready to review.`) +
    (list ? `<ul style="margin:0 0 10px;padding-left:20px">${list}</ul>` : "") +
    p("A few minutes now keeps them fresh in your memory.") +
    button("Review flashcards", appUrl());
  return {
    subject: `${count} flashcard${count === 1 ? "" : "s"} due for review`,
    html: layout({ preheader: `${count} cards ready to review.`, title: `Time to review, ${name}`, body }),
    text: `Hi ${name},\n\n${count} flashcard${count === 1 ? " is" : "s are"} due for review.\n${bySubject.map((row) => `- ${row.subject || "No subject"}: ${row.count}`).join("\n")}\n\n${appUrl()}`,
  };
}

// ---------- Email-to-self ----------

// Small, safe Markdown renderer for notes (text is escaped first).
function markdownToHtml(source) {
  const inline = (raw) =>
    esc(raw)
      .replace(/`([^`]+)`/g, '<code style="background:#f4eee9;padding:1px 5px;border-radius:4px">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");

  const out = [];
  let list = null;
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };

  for (const line of String(source).split(/\r?\n/)) {
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const check = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (heading) {
      closeList();
      const size = [20, 17, 15][heading[1].length - 1];
      out.push(`<h2 style="font-size:${size}px;margin:16px 0 6px">${inline(heading[2])}</h2>`);
    } else if (check) {
      closeList();
      out.push(`<div style="font-size:15px;margin:3px 0">${check[1] === " " ? "☐" : "☑"} ${inline(check[2])}</div>`);
    } else if (bullet || numbered) {
      const tag = bullet ? "ul" : "ol";
      if (list !== tag) {
        closeList();
        out.push(`<${tag} style="margin:6px 0;padding-left:22px">`);
        list = tag;
      }
      out.push(`<li style="font-size:15px;line-height:1.5;margin:2px 0">${inline((bullet || numbered)[1])}</li>`);
    } else if (!line.trim()) {
      closeList();
    } else {
      closeList();
      out.push(`<p style="font-size:15px;line-height:1.6;margin:0 0 10px">${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

function noteEmail({ student, note }) {
  const tags = (note.tags || []).map((tag) => `#${tag}`).join(" ");
  const body =
    `<p style="font-size:13px;color:#8a8f98;margin:0 0 12px">${esc(note.subject || "Personal")}${tags ? ` · ${esc(tags)}` : ""}</p>` +
    markdownToHtml(note.content || "");
  return {
    subject: `Note: ${note.title}`,
    html: layout({ preheader: note.title, title: note.title, body }),
    text: `${note.title}\n${note.subject || "Personal"}${tags ? ` · ${tags}` : ""}\n\n${note.content || ""}`,
  };
}

function flashcardSet({ student, subject, cards, truncated }) {
  const rows = cards
    .map(
      (card, index) =>
        `<tr><td style="padding:8px 8px 8px 0;border-bottom:1px solid #f0e6df;font-size:13px;color:#8a8f98;vertical-align:top">${index + 1}</td><td style="padding:8px 10px 8px 0;border-bottom:1px solid #f0e6df;font-size:14px;font-weight:700;vertical-align:top">${esc(card.front)}</td><td style="padding:8px 0;border-bottom:1px solid #f0e6df;font-size:14px;vertical-align:top">${esc(card.back)}</td></tr>`
    )
    .join("");
  const label = subject ? `${subject} flashcards` : "Flashcards";
  const body =
    p(`${cards.length} card${cards.length === 1 ? "" : "s"}${truncated ? " (first 200 shown)" : ""}.`) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
  return {
    subject: `${label} (${cards.length})`,
    html: layout({ preheader: label, title: label, body }),
    text: `${label}\n\n${cards.map((card, index) => `${index + 1}. ${card.front}\n   ${card.back}`).join("\n")}`,
  };
}

function testEmail({ student }) {
  const name = firstName(student);
  return {
    subject: "StudyOS test email",
    html: layout({ preheader: "Email is working.", title: "Email is working", body: p(`Hi ${esc(name)}, this is a test email from StudyOS. Your email setup works.`) }),
    text: `Hi ${name}, this is a test email from StudyOS. Your email setup works.`,
  };
}

module.exports = {
  appUrl,
  firstName,
  markdownToHtml,
  welcome,
  verifyEmail,
  passwordReset,
  passwordResetGoogle,
  passwordChanged,
  newLogin,
  weeklyReport,
  examCountdown,
  dailyDigest,
  streakWarning,
  flashcardsDue,
  noteEmail,
  flashcardSet,
  testEmail,
};
