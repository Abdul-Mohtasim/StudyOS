import { Capacitor } from "@capacitor/core";
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";
import { haptic, isHapticsEnabled, setHapticsEnabled } from "./haptics";
import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { flushSync } from "react-dom";

import {
  FileText,
  Pencil,
  Save,
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  BookMarked,
  Target,
  Settings,
  Search,
  Bell,
  Plus,
  Check,
  Clock3,
  Flame,
  Menu,
  X,
  Play,
  Sparkles,
  GraduationCap,
  ChevronRight,
  Trash2,
  CircleHelp,
  RotateCcw,
  Pause,
  Quote,
  RefreshCw,
  LogOut,
  ChartNoAxesCombined,
  NotebookText,
  SlidersHorizontal,
  ArrowRight,
  ListChecks,
  Timer,
  UserPlus,
  TrendingUp,
  Smartphone,
  Moon,
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ChevronLeft,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Laptop,
  Feather,
  Languages,
  Hourglass,
  Globe,
  Landmark,
  Banknote,
  Palette,
  Music,
  Dumbbell,
  Brain,
  Scale,
  Microscope,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// StudyOS logo (inline SVG, so no extra file is needed).
const STUDYOS_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 144 144" width="128" height="128" role="img" aria-label="StudyOS logo"><g fill="#E4585F" transform="translate(0 -5)"><path d="M64 24L124 54L64 84L4 54Z"/><path d="M28 74L64 92L100 74V96C100 106 84 114 64 114C44 114 28 106 28 96Z"/><path d="M112 60V97" stroke="#E4585F" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="112" cy="101" r="5"/></g></svg>`;
const STUDYOS_LOGO_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(STUDYOS_LOGO_SVG)}`;

const reminders = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "-Abdul Mohtasim-",
    tip: "Choose one small task and begin with that.",
  },
  {
    text: "Great things are done by a series of small things brought together.",
    author: "-Abdul Mohtasim-",
    tip: "Every completed task is progress worth celebrating.",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "-Abdul Mohtasim-",
    tip: "Break a difficult topic into smaller, manageable steps.",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "-Abdul Mohtasim-",
    tip: "Give yourself permission to learn at your own pace.",
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
    tip: "Stay curious, take breaks, and keep asking questions.",
  },
];

function getGreetingName(student) {
  const accountName =
    student?.displayName?.trim() ||
    student?.name?.trim() ||
    student?.givenName?.trim() ||
    student?.firstName?.trim();

  if (accountName) {
    return accountName.split(/\s+/)[0];
  }

  const emailName = student?.email?.trim()?.split("@")[0];
  if (emailName) {
    const firstPart = emailName.split(/[._-]+/).filter(Boolean)[0];
    if (firstPart) {
      return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    }
  }

  return "there";
}

function normalizeTask(task) {
  return {
    id: task._id,
    title: task.title,
    subject: task.subject || "Personal",
    time: `${task.duration ?? 25} min`,
    completed: Boolean(task.completed),
  };
}

function normalizeNote(note) {
  return {
    id: note._id || note.id,
    title: note.title,
    subject: note.subject || "Personal",
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

function normalizeFocusSession(session) {
  return {
    id: session._id || session.id,
    durationMinutes: Number(session.durationMinutes),
    completedAt: session.completedAt,
  };
}

function normalizePlannerTask(task) {
  return {
    id: task._id || task.id,
    title: task.title,
    subject: task.subject || "Mathematics",
    day: task.day,
    deadline: task.deadline || "",
    completed: Boolean(task.completed),
  };
}

const plannerDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getTodayPlannerDay = () => plannerDays[(new Date().getDay() + 6) % 7];

function loadDailyGoal() {
  try {
    const value = Number(localStorage.getItem("studyos-daily-goal-minutes"));
    return Number.isFinite(value) && value > 0
      ? Math.min(720, Math.floor(value))
      : 120;
  } catch {
    return 120;
  }
}

function getLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// "Today", "Yesterday", weekday name or short date for the session history.
function describeSessionDay(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const diff = Math.round((startOfToday - startOfDay) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ---------- Public landing page (shown to visitors who are not signed in) ----------
const PUBLIC_FEATURES = [
  {
    icon: ListChecks,
    tone: "coral",
    anim: "wiggle",
    title: "Tasks that actually get done",
    text: "Add what you need to study, give it a subject and a time, and tick it off. Deleted something by mistake? One tap brings it back.",
    tags: ["Subjects", "Time per task", "Undo"],
  },
  {
    icon: CalendarDays,
    tone: "blue",
    anim: "flip",
    title: "A weekly planner you'll use",
    text: "Spread your work across the week, set deadlines, and see at a glance what is due today or already overdue.",
    tags: ["Day tabs", "Deadlines", "Overdue alerts"],
  },
  {
    icon: Timer,
    tone: "amber",
    anim: "tick",
    title: "Focus Room",
    text: "Set a timer from 1 to 180 minutes and study without distractions. Every finished session is saved to your history.",
    tags: ["Custom timer", "Session history"],
  },
  {
    icon: NotebookText,
    tone: "teal",
    anim: "pop",
    title: "Notes for every subject",
    text: "Write notes, search them in seconds, and filter by subject. Your subjects also show how far along you are in each one.",
    tags: ["Search", "Filter", "Subject progress"],
  },
  {
    icon: ChartNoAxesCombined,
    tone: "green",
    anim: "grow",
    title: "Progress you can see",
    text: "Track a daily study goal, keep your streak alive, and check a 7-day chart of your focus time.",
    tags: ["Daily goal", "Streaks", "7-day chart"],
  },
  {
    icon: SlidersHorizontal,
    tone: "ink",
    anim: "slide",
    title: "Made to fit you",
    text: "Switch between dark and light mode, choose your own display name, and turn notifications on or off. Everything syncs to your account.",
    tags: ["Dark & light", "Synced"],
  },
];

const PUBLIC_STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Sign up with your email or Google in under a minute.",
  },
  {
    icon: ListChecks,
    title: "Plan your week",
    text: "Add tasks, subjects and deadlines so nothing slips through.",
  },
  {
    icon: TrendingUp,
    title: "Focus and improve",
    text: "Run focus sessions, hit your daily goal and watch your streak grow.",
  },
];

const PUBLIC_MARQUEE = [
  { icon: ListChecks, label: "Tasks" },
  { icon: CalendarDays, label: "Weekly planner" },
  { icon: Timer, label: "Focus timer" },
  { icon: NotebookText, label: "Subject notes" },
  { icon: Target, label: "Daily goals" },
  { icon: Flame, label: "Study streaks" },
  { icon: ChartNoAxesCombined, label: "Analytics" },
  { icon: Moon, label: "Dark mode" },
];

const RING_CIRCUMFERENCE = 2 * Math.PI * 34;

const CONTACT_EMAIL = "abdulmohtasim034@gmail.com";

function ContactFooter({ onLogin }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      const input = document.createElement("textarea");
      input.value = CONTACT_EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <footer className="pl-footer pl-cta-footer">
      <div className="pl-cta-inner">
        <h2>Let's work together.</h2>
        <p>
          Whether you're looking to collaborate, share feedback, or brainstorm
          around a meaningful project, I'd love to hear from you.
        </p>

        <button type="button" className="pl-cta-btn" onClick={copyEmail}>
          {copied ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8" y="8" width="13" height="13" rx="2" />
              <path d="M4 16V5a1 1 0 0 1 1-1h11" />
            </svg>
          )}
          <span aria-live="polite">{copied ? "Email copied!" : "Copy my email address"}</span>
        </button>
      </div>

      <div className="pl-cta-bar">
        <span className="pl-cta-brand">
          Study<span>OS</span>
        </span>
        {/* <nav aria-label="Footer">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <button type="button" onClick={onLogin}>Log in</button>
        </nav> */}
        <a
          href="/privacy.html"
          className="pl-cta-copy"
          style={{ textDecoration: "underline" }}
        >
          Privacy Policy
        </a>
        <span className="pl-cta-copy">© 2026 Abdul Mohtasim. All rights reserved.</span>
      </div>
    </footer>
  );
}

function PublicLanding({ onLogin, onRegister, theme, onThemeChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: "Review calculus notes", subject: "Math", tone: "blue", time: "25 min", done: true },
    { id: 2, title: "Physics problem set", subject: "Physics", tone: "coral", time: "40 min", done: false },
    { id: 3, title: "Plan next week's study", subject: "Planner", tone: "teal", time: "15 min", done: false },
  ]);

  const doneCount = demoTasks.filter((task) => task.done).length;
  const donePercent = Math.round((doneCount / demoTasks.length) * 100);

  function toggleDemoTask(id) {
    setDemoTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  // Sticky navigation shadow.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal sections as they scroll into view.
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".pl-reveal"));

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  // Match the page edges to the active theme while the landing page is open.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.background;
    root.style.background = theme === "dark" ? "#14121b" : "#fffaf7";
    return () => {
      root.style.background = previous;
    };
  }, [theme]);

  // Switch theme. Where the browser supports View Transitions, the new theme
  // grows outward from the toggle as a circle; otherwise it just switches.
  function handleThemeToggle(event) {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reduceMotion ||
      document.documentElement.classList.contains("perf-lite") ||
      typeof document.startViewTransition !== "function"
    ) {
      onThemeChange(next);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.classList.add("pl-vt");

    const transition = document.startViewTransition(() => {
      flushSync(() => onThemeChange(next));
    });

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 750,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});

    transition.finished
      .catch(() => {})
      .finally(() => root.classList.remove("pl-vt"));
  }

  return (
    <main className="pl-page" id="home" data-pl-theme={theme}>
      <div className="pl-bg" aria-hidden="true">
        <span className="pl-blob pl-blob-one" />
        <span className="pl-blob pl-blob-two" />
      </div>

      <header className={`pl-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="pl-container pl-nav-inner">
          <a className="pl-brand" href="#home" aria-label="StudyOS home">
            <img src={STUDYOS_LOGO_SRC} alt="" className="pl-brand-logo" />
            <span>
              Study<span className="pl-brand-accent">OS</span>
            </span>
          </a>

          <nav className="pl-nav-links" aria-label="Page sections">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </nav>

          <div className="pl-nav-actions">
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className="pl-theme"
              onClick={handleThemeToggle}
            >
              <span className="pl-theme-sky pl-theme-day" aria-hidden="true" />
              <span className="pl-theme-sky pl-theme-night" aria-hidden="true" />
              <span className="pl-cloud pl-cloud-a" aria-hidden="true" />
              <span className="pl-cloud pl-cloud-b" aria-hidden="true" />
              <span className="pl-cloud pl-cloud-c" aria-hidden="true" />
              <span className="pl-star pl-star-a" aria-hidden="true" />
              <span className="pl-star pl-star-b" aria-hidden="true" />
              <span className="pl-star pl-star-c" aria-hidden="true" />
              <span className="pl-star pl-star-d" aria-hidden="true" />
              <span className="pl-star pl-star-e" aria-hidden="true" />
              <span className="pl-theme-thumb" aria-hidden="true">
                <svg className="pl-sun" viewBox="0 0 28 28">
                  <defs>
                    <radialGradient id="plSunGrad" cx="40%" cy="35%" r="70%">
                      <stop offset="0%" stopColor="#fff2a8" />
                      <stop offset="100%" stopColor="#ffb62e" />
                    </radialGradient>
                  </defs>
                  <g className="pl-sun-rays" stroke="#ffc83d" strokeWidth="2" strokeLinecap="round">
                    <line x1="14" y1="1.5" x2="14" y2="4.5" />
                    <line x1="14" y1="23.5" x2="14" y2="26.5" />
                    <line x1="1.5" y1="14" x2="4.5" y2="14" />
                    <line x1="23.5" y1="14" x2="26.5" y2="14" />
                    <line x1="5.2" y1="5.2" x2="7.3" y2="7.3" />
                    <line x1="20.7" y1="20.7" x2="22.8" y2="22.8" />
                    <line x1="5.2" y1="22.8" x2="7.3" y2="20.7" />
                    <line x1="20.7" y1="7.3" x2="22.8" y2="5.2" />
                  </g>
                  <circle cx="14" cy="14" r="7.5" fill="url(#plSunGrad)" />
                </svg>
                <svg className="pl-moon" viewBox="0 0 28 28">
                  <defs>
                    <radialGradient id="plMoonGrad" cx="35%" cy="30%" r="75%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#c9d0e6" />
                    </radialGradient>
                  </defs>
                  <circle cx="14" cy="14" r="12" fill="url(#plMoonGrad)" />
                  <circle cx="9.5" cy="10" r="2.6" fill="#b3bad4" opacity="0.75" />
                  <circle cx="18.5" cy="16.5" r="3.2" fill="#b3bad4" opacity="0.7" />
                  <circle cx="11" cy="19.5" r="1.6" fill="#b3bad4" opacity="0.7" />
                  <circle cx="19" cy="8.5" r="1.3" fill="#b3bad4" opacity="0.6" />
                </svg>
              </span>
            </button>
            <button type="button" className="pl-btn pl-btn-text" onClick={onLogin}>
              Log in
            </button>
            <button
              type="button"
              className="pl-btn pl-btn-primary pl-btn-sm"
              onClick={onRegister}
            >
              Get started
              <ArrowRight size={16} className="pl-arrow" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <section className="pl-hero">
        <div className="pl-container pl-hero-grid">
          <div className="pl-hero-copy">
            <span className="pl-eyebrow">
              <Sparkles size={15} className="pl-icon-twinkle" aria-hidden="true" />
              Built for students
            </span>

            <h1>
              Your whole study life,{" "}
              <span className="pl-hl">
                in one place.
                <svg
                  className="pl-underline"
                  viewBox="0 0 300 14"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M3 9 C 60 2, 120 14, 180 7 S 270 4, 297 8" />
                </svg>
              </span>
            </h1>

            <p className="pl-hero-text">
              Plan your week, stay focused, and keep every note organized.
              StudyOS helps you spend less time juggling apps and more time
              actually learning.
            </p>

            <div className="pl-hero-actions">
              <button
                type="button"
                className="pl-btn pl-btn-primary pl-btn-lg pl-btn-pulse"
                onClick={onRegister}
              >
                Create free account
                <ArrowRight size={19} className="pl-arrow" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pl-btn pl-btn-ghost pl-btn-lg"
                onClick={onLogin}
              >
                Log in
              </button>
            </div>

            <ul className="pl-trust">
              <li>
                <Zap size={16} className="pl-icon-zap" aria-hidden="true" />
                No clutter
              </li>
              <li>
                <Smartphone size={16} className="pl-icon-buzz" aria-hidden="true" />
                Phone &amp; laptop
              </li>
              <li>
                <Moon size={16} className="pl-icon-rock" aria-hidden="true" />
                Dark &amp; light mode
              </li>
            </ul>
          </div>

          <div className="pl-hero-visual" aria-label="StudyOS dashboard preview">
            <div className="pl-mock">
              <div className="pl-mock-top">
                <span className="pl-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <strong>Today</strong>
                <span className="pl-mock-hint">Try it: tap a task</span>
              </div>

              <div className="pl-mock-progress">
                <div className="pl-ring-wrap">
                  <svg viewBox="0 0 80 80" className="pl-ring" aria-hidden="true">
                    <circle className="pl-ring-bg" cx="40" cy="40" r="34" />
                    <circle
                      className="pl-ring-fg"
                      cx="40"
                      cy="40"
                      r="34"
                      style={{
                        strokeDasharray: RING_CIRCUMFERENCE,
                        strokeDashoffset:
                          RING_CIRCUMFERENCE * (1 - donePercent / 100),
                      }}
                    />
                  </svg>
                  <span className="pl-ring-text">{donePercent}%</span>
                </div>
                <div>
                  <strong>
                    {doneCount} of {demoTasks.length} tasks done
                  </strong>
                  <p>
                    {doneCount === demoTasks.length
                      ? "All done. Great work!"
                      : "Keep going, you're doing great."}
                  </p>
                </div>
              </div>

              <div className="pl-mock-tasks">
                {demoTasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    className={`pl-task${task.done ? " is-done" : ""}`}
                    onClick={() => toggleDemoTask(task.id)}
                    aria-pressed={task.done}
                  >
                    <span className="pl-check" aria-hidden="true">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="pl-task-title">{task.title}</span>
                    <span className={`pl-chip pl-tone-${task.tone}`}>
                      {task.subject}
                    </span>
                    <span className="pl-task-time">{task.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pl-float pl-float-streak" aria-hidden="true">
              <span className="pl-float-icon pl-tone-amber">
                <Flame size={18} className="pl-icon-flame" />
              </span>
              <div>
                <strong>5-day streak</strong>
                <small>Keep it burning</small>
              </div>
            </div>

            <div className="pl-float pl-float-focus" aria-hidden="true">
              <span className="pl-float-icon pl-tone-coral">
                <Timer size={18} className="pl-icon-tick" />
              </span>
              <div>
                <strong>25:00</strong>
                <small>Focus session</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pl-marquee" aria-hidden="true">
        <div className="pl-marquee-track">
          {[...PUBLIC_MARQUEE, ...PUBLIC_MARQUEE].map((item, index) => {
            const MarqueeIcon = item.icon;
            return (
              <span className="pl-marquee-item" key={`${item.label}-${index}`}>
                <MarqueeIcon size={17} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      <section className="pl-section" id="features">
        <div className="pl-container">
          <div className="pl-heading pl-reveal">
            <span className="pl-kicker">Everything in one place</span>
            <h2>Tools that make studying feel simple</h2>
            <p>
              Everything you need to plan, focus and review, without switching
              between five different apps.
            </p>
          </div>

          <div className="pl-feature-grid">
            {PUBLIC_FEATURES.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  className="pl-reveal"
                  style={{ "--rd": `${(index % 3) * 90}ms` }}
                  key={feature.title}
                >
                  <article className={`pl-feature pl-tone-${feature.tone}`}>
                    <span
                      className={`pl-icon-box pl-anim-${feature.anim}`}
                      style={{ "--d": `${index * -0.6}s` }}
                    >
                      <FeatureIcon size={26} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                    <ul className="pl-tags">
                      {feature.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pl-section pl-section-cream" id="how">
        <div className="pl-container">
          <div className="pl-heading pl-reveal">
            <span className="pl-kicker">How it works</span>
            <h2>Up and running in three steps</h2>
          </div>

          <ol className="pl-steps">
            {PUBLIC_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <li
                  className="pl-reveal"
                  style={{ "--rd": `${index * 120}ms` }}
                  key={step.title}
                >
                  <div className="pl-step">
                    <span className="pl-step-number">{index + 1}</span>
                    <span
                      className="pl-step-icon"
                      style={{ "--d": `${index * -0.8}s` }}
                    >
                      <StepIcon size={24} aria-hidden="true" />
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="pl-cta-wrap">
        <div className="pl-container">
          <div className="pl-cta pl-reveal">
            <Sparkles className="pl-cta-deco pl-cta-deco-a" size={34} aria-hidden="true" />
            <Flame className="pl-cta-deco pl-cta-deco-b" size={30} aria-hidden="true" />
            <Target className="pl-cta-deco pl-cta-deco-c" size={32} aria-hidden="true" />
            <BookOpen className="pl-cta-deco pl-cta-deco-d" size={30} aria-hidden="true" />

            <h2>Ready to make your study time count?</h2>
            <p>Create your StudyOS account today and build a routine that sticks.</p>

            <div className="pl-cta-actions">
              <button
                type="button"
                className="pl-btn pl-btn-primary pl-btn-lg pl-btn-pulse"
                onClick={onRegister}
              >
                Create free account
                <ArrowRight size={19} className="pl-arrow" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pl-btn pl-btn-light pl-btn-lg"
                onClick={onLogin}
              >
                I already have an account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* <footer className="pl-footer">
        <div className="pl-container pl-footer-inner">
          <a className="pl-brand pl-brand-small" href="#home" aria-label="StudyOS home">
            <img src={STUDYOS_LOGO_SRC} alt="" className="pl-brand-logo" />
            <span>
              Study<span className="pl-brand-accent">OS</span>
            </span>
          </a>
          <span className="pl-copy">© 2026 Abdul Mohtasim. All rights reserved.</span>
          
        </div>
      </footer> */}
      <ContactFooter onLogin={onLogin} />
    </main>
  );
}


// ---------- Login / sign-up screen: animated mascot and falling leaves ----------
const AUTH_LEAVES = Array.from({ length: 14 }, (_, index) => ({
  left: (index * 37 + 7) % 100,
  size: 16 + ((index * 11) % 18),
  delay: -((index * 1.9) % 16),
  duration: 11 + ((index * 3) % 9),
  sway: 30 + ((index * 17) % 50),
  tone: index % 4,
}));

function AuthLeaves() {
  return (
    <div className="as-leaves" aria-hidden="true">
      {AUTH_LEAVES.map((leaf, index) => (
        <svg
          key={index}
          className={`as-leaf as-leaf-${leaf.tone}`}
          viewBox="0 0 24 28"
          style={{
            left: `${leaf.left}%`,
            width: leaf.size,
            height: leaf.size * 1.15,
            animationDuration: `${leaf.duration}s, ${leaf.duration / 2.4}s`,
            animationDelay: `${leaf.delay}s, ${leaf.delay}s`,
            "--sway": `${leaf.sway}px`,
          }}
        >
          <path d="M12 1C20 6 22 17 12 27 2 17 4 6 12 1Z" />
          <path d="M12 6V25" className="as-leaf-vein" />
        </svg>
      ))}
    </div>
  );
}

// An original owl mascot. It blinks, breathes, waves, follows the pointer with
// its eyes, covers its eyes while you type a password, and reacts to errors.
function AuthMascot({ mood, bubble, typed }) {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let frame = 0;
    const clamp = (value) => Math.max(-1, Math.min(1, value));

    function onMove(event) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = stage.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height * 0.4;
        stage.style.setProperty(
          "--lx",
          clamp((event.clientX - centerX) / (window.innerWidth / 2)).toFixed(3)
        );
        stage.style.setProperty(
          "--ly",
          clamp((event.clientY - centerY) / (window.innerHeight / 2)).toFixed(3)
        );
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={`as-stage is-${mood}`}
      style={{ "--tx": typed }}
    >
      <div className="as-halo" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="as-bubble" key={bubble} role="status">
        {bubble}
      </div>

      <span className="as-chip as-chip-a" aria-hidden="true">
        <Flame size={16} /> 5-day streak
      </span>
      <span className="as-chip as-chip-b" aria-hidden="true">
        <Check size={16} /> Task done
      </span>
      <span className="as-chip as-chip-c" aria-hidden="true">
        <BookOpen size={16} /> Notes ready
      </span>

      <svg
        className="as-owl-svg"
        viewBox="0 0 320 340"
        role="img"
        aria-label="StudyOS owl mascot"
      >
        <defs>
          <linearGradient id="asBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffa56a" />
            <stop offset="100%" stopColor="#f0663a" />
          </linearGradient>
          <linearGradient id="asWing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f47c4a" />
            <stop offset="100%" stopColor="#d9532c" />
          </linearGradient>
          <radialGradient id="asBelly" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff3e4" />
            <stop offset="100%" stopColor="#ffd9b8" />
          </radialGradient>
        </defs>

        <ellipse className="as-shadow" cx="160" cy="320" rx="86" ry="11" />

        <g className="as-owl">
          {/* feet */}
          <g className="as-feet">
            <g fill="#f7a62e">
              <ellipse cx="122" cy="306" rx="27" ry="11" />
              <ellipse cx="198" cy="306" rx="27" ry="11" />
            </g>
            <g stroke="#d98417" strokeWidth="3" strokeLinecap="round">
              <path d="M110 306V312M122 306V314M134 306V312" />
              <path d="M186 306V312M198 306V314M210 306V312" />
            </g>
          </g>

          {/* body */}
          <g className="as-body">
            <ellipse cx="160" cy="218" rx="98" ry="94" fill="url(#asBody)" />
            <ellipse cx="160" cy="244" rx="62" ry="64" fill="url(#asBelly)" />
            <g
              fill="none"
              stroke="#f0bf98"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M130 214q10 11 20 0" />
              <path d="M170 214q10 11 20 0" />
              <path d="M112 244q10 11 20 0" />
              <path d="M150 246q10 11 20 0" />
              <path d="M188 244q10 11 20 0" />
              <path d="M130 276q10 11 20 0" />
              <path d="M170 276q10 11 20 0" />
            </g>
          </g>

          {/* head */}
          <g className="as-head">
            <path d="M80 92L66 40L122 68Z" fill="#f0663a" />
            <path d="M240 92L254 40L198 68Z" fill="#f0663a" />
            <ellipse cx="160" cy="128" rx="98" ry="84" fill="url(#asBody)" />
            <ellipse cx="160" cy="138" rx="82" ry="62" fill="url(#asBelly)" />

            {/* cheeks */}
            <circle className="as-cheek" cx="92" cy="166" r="12" />
            <circle className="as-cheek" cx="228" cy="166" r="12" />

            {/* eyes */}
            {[122, 198].map((x) => (
              <g key={x} transform={`translate(${x} 130)`}>
                <circle r="32" fill="#fff" stroke="#f0b48b" strokeWidth="3" />
                <g className="as-eye-track">
                  <g className="as-eye-idle">
                    <circle r="16" fill="#2a1f2d" />
                    <circle cx="-5" cy="-6" r="5.5" fill="#fff" />
                    <circle cx="6" cy="6" r="2.6" fill="#fff" opacity=".85" />
                  </g>
                </g>
                <ellipse className="as-lid" rx="33" ry="33" fill="#f4ac78" />
              </g>
            ))}

            {/* beak */}
            <path
              d="M160 142L146 162Q160 176 174 162Z"
              fill="#ffb02e"
              stroke="#e0901a"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* graduation cap */}
            <g className="as-cap">
              <path d="M112 66V94Q160 114 208 94V66L160 84Z" fill="#241c2c" />
              <path d="M160 14L256 50L160 86L64 50Z" fill="#2f2638" />
              <path d="M160 14L256 50L160 58L64 50Z" fill="#43364f" />
              <circle cx="160" cy="52" r="5.5" fill="#f7a62e" />
              <path
                d="M160 52L240 58V70"
                fill="none"
                stroke="#f7a62e"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <g className="as-tassel">
                <rect x="235" y="68" width="10" height="26" rx="5" fill="#f7a62e" />
                <path d="M237 90v10M243 90v10" stroke="#f7a62e" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* wings (drawn after the head so they can cover the eyes) */}
          <g className="as-wing as-wing-l">
            <ellipse
              cx="68"
              cy="225"
              rx="24"
              ry="62"
              fill="url(#asWing)"
              transform="rotate(12 68 225)"
            />
            <path
              d="M58 262q8 9 16 0M54 244q8 9 16 0"
              fill="none"
              stroke="#c4471f"
              strokeWidth="3"
              strokeLinecap="round"
              opacity=".5"
            />
          </g>
          <g className="as-wing as-wing-r">
            <ellipse
              cx="252"
              cy="225"
              rx="24"
              ry="62"
              fill="url(#asWing)"
              transform="rotate(-12 252 225)"
            />
            <path
              d="M246 262q8 9 16 0M250 244q8 9 16 0"
              fill="none"
              stroke="#c4471f"
              strokeWidth="3"
              strokeLinecap="round"
              opacity=".5"
            />
          </g>

        </g>

        {/* sparkles */}
        <g className="as-sparkles" fill="#fff">
          <path className="as-spark as-spark-a" d="M40 90l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
          <path className="as-spark as-spark-b" d="M286 120l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
          <path className="as-spark as-spark-c" d="M268 250l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
        </g>
      </svg>
    </div>
  );
}

// ---------- Dashboard motion helpers ----------

// Counts a number up (or down) smoothly whenever the value changes.
function CountUp({ value, decimals = 0, duration = 1000 }) {
  const target = Number(value) || 0;
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      fromRef.current = target;
      setShown(target);
      return undefined;
    }

    const from = fromRef.current;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <>{shown.toFixed(decimals)}</>;
}

// Subject icons: clean line icons on a soft tinted tile (the "Minimal & Premium"
// style). Maths -> calculator, Physics -> atom, English / unknown -> open book.
function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Hue is still used by notes to tint their cards.
function getSubjectHue(name) {
  const clean = String(name || "?").trim() || "?";
  return hashString(clean.toLowerCase()) % 360;
}

// [pattern, icon, tone, motion]. Only three calm tones are used (purple, blue,
// amber) so the icons never look colourful.
const SUBJECT_ICON_RULES = [
  [/math|algebra|calcul|geometry|trigon|arithmetic/, Calculator, "purple", "tilt"],
  [/physic|mechanic|quantum/, Atom, "blue", "spin"],
  [/english|literature|grammar|linguist/, BookOpen, "amber", "lift"],
  [/chem/, FlaskConical, "blue", "tilt"],
  [/bio|botany|zoology|genetic/, Dna, "purple", "spin"],
  [/comput|program|coding|software|informatic|\bit\b|\bics\b|web|cyber/, Laptop, "blue", "lift"],
  [/islam|quran|qur'an|deeniyat|religio|theolog|hadith|fiqh|seerah/, Moon, "amber", "tilt"],
  [/urdu|poetry|poem/, Feather, "amber", "tilt"],
  [/arabic|french|german|spanish|hindi|persian|punjabi|sindhi|language/, Languages, "amber", "lift"],
  [/histor/, Hourglass, "amber", "tilt"],
  [/geograph|geo\b|earth|environment/, Globe, "blue", "spin"],
  [/pakistan|civic|social|politic|govern|constitution|sociolog|study of/, Landmark, "purple", "lift"],
  [/econom|business|account|financ|commerce|banking/, Banknote, "amber", "lift"],
  [/statist|data|probabil/, ChartNoAxesCombined, "purple", "lift"],
  [/\bart\b|arts\b|drawing|design|paint|sketch/, Palette, "amber", "tilt"],
  [/music|singing|piano|guitar/, Music, "purple", "tilt"],
  [/sport|physical|\bpe\b|fitness|gym|health|exercise/, Dumbbell, "blue", "tilt"],
  [/psycholog|mind|philosoph|logic/, Brain, "purple", "lift"],
  [/\blaw\b|legal|justice/, Scale, "blue", "tilt"],
  [/science|lab|medic|anatom/, Microscope, "blue", "lift"],
  [/personal|self|general|life|routine/, User, "purple", "lift"],
];

const SUBJECT_TONES = ["purple", "blue", "amber"];

function getSubjectIconStyle(name) {
  const text = String(name || "").toLowerCase();
  const match = SUBJECT_ICON_RULES.find(([pattern]) => pattern.test(text));
  if (match) return { Icon: match[1], tone: match[2], motion: match[3] };
  return {
    Icon: BookOpen,
    tone: SUBJECT_TONES[hashString(text) % SUBJECT_TONES.length],
    motion: "lift",
  };
}

function SubjectBadge({ name, mini = false }) {
  const clean = String(name || "?").trim() || "?";
  const { Icon, tone, motion } = getSubjectIconStyle(clean);

  return (
    <span
      className={`subject-icon sb-badge sb-${tone} sb-motion-${motion}${mini ? " sb-mini" : ""}`}
      aria-hidden="true"
    >
      <Icon className="sb-glyph" size={mini ? 11 : 21} strokeWidth={mini ? 2.2 : 1.8} aria-hidden="true" />
    </span>
  );
}

// Duolingo-style streak flame: three flickering layers, a morphing outline,
// rising embers, a glow, and a burst when the streak changes.
let flameInstance = 0;

const FLAME_OUTER = [
  [32, 3, 35, 17, 53, 27, 53, 50, 53, 66, 44, 77, 32, 77, 20, 77, 11, 66, 11, 50, 11, 39, 17, 32, 23, 26, 23, 33, 26, 37, 30, 38, 27, 27, 28, 14, 32, 3],
  [36, 3, 38, 16, 54, 28, 53, 50, 53, 66, 44, 77, 32, 77, 20, 77, 11, 66, 11, 50, 11, 41, 15, 34, 20, 28, 22, 34, 27, 38, 31, 38, 31, 27, 34, 14, 36, 3],
  [28, 4, 31, 17, 52, 26, 53, 50, 53, 66, 44, 77, 32, 77, 20, 77, 11, 66, 11, 50, 11, 38, 19, 30, 26, 24, 24, 32, 26, 36, 29, 38, 24, 28, 24, 15, 28, 4],
];

const FLAME_MID = [
  [32, 24, 34, 33, 44, 39, 44, 54, 44, 65, 38, 72, 32, 72, 26, 72, 20, 65, 20, 54, 20, 47, 24, 43, 27, 40, 27, 45, 29, 48, 31, 48, 30, 40, 30, 31, 32, 24],
  [34, 23, 36, 32, 45, 40, 44, 54, 44, 65, 38, 72, 32, 72, 26, 72, 20, 65, 20, 54, 20, 48, 23, 44, 26, 41, 28, 46, 30, 48, 32, 48, 32, 40, 33, 30, 34, 23],
  [30, 25, 33, 34, 43, 38, 44, 54, 44, 65, 38, 72, 32, 72, 26, 72, 20, 65, 20, 54, 20, 46, 25, 42, 28, 39, 26, 44, 28, 48, 30, 48, 29, 40, 29, 32, 30, 25],
];

function buildFlamePath(n) {
  return `M${n[0]} ${n[1]}C${n[2]} ${n[3]} ${n[4]} ${n[5]} ${n[6]} ${n[7]}C${n[8]} ${n[9]} ${n[10]} ${n[11]} ${n[12]} ${n[13]}C${n[14]} ${n[15]} ${n[16]} ${n[17]} ${n[18]} ${n[19]}C${n[20]} ${n[21]} ${n[22]} ${n[23]} ${n[24]} ${n[25]}C${n[26]} ${n[27]} ${n[28]} ${n[29]} ${n[30]} ${n[31]}C${n[32]} ${n[33]} ${n[34]} ${n[35]} ${n[36]} ${n[37]}Z`;
}

const EMBERS = [
  { x: 24, dx: -9, delay: 0, dur: 2.4, r: 1.9 },
  { x: 38, dx: 8, delay: 0.7, dur: 2.9, r: 1.5 },
  { x: 30, dx: -3, delay: 1.3, dur: 2.2, r: 2.1 },
  { x: 42, dx: 12, delay: 1.9, dur: 3.1, r: 1.3 },
  { x: 20, dx: -13, delay: 2.4, dur: 2.7, r: 1.4 },
  { x: 34, dx: 4, delay: 0.3, dur: 3.3, r: 1.1 },
];

function StreakFlame({ streak = 0, size = 48, rich = false }) {
  const idRef = useRef(null);
  if (idRef.current === null) {
    flameInstance += 1;
    idRef.current = flameInstance;
  }
  const id = idRef.current;
  const lit = streak > 0;
  const tier = !lit ? "off" : streak >= 30 ? "blue" : streak >= 7 ? "hot" : "warm";
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const morph = lit && !reduce;
  const embers = lit ? (rich ? EMBERS : EMBERS.slice(0, 3)) : [];

  const outerValues = [...FLAME_OUTER, FLAME_OUTER[0]].map(buildFlamePath).join(";");
  const midValues = [...FLAME_MID, FLAME_MID[0]].map(buildFlamePath).join(";");

  return (
    <span
      key={`${tier}-${streak}`}
      className={`sf-wrap sf-${tier}${rich ? " sf-rich" : ""}`}
      style={{ width: size * 0.8, height: size, fontSize: size }}
      aria-hidden="true"
    >
      <span className="sf-glow" />
      {lit && (
        <span className="sf-burst">
          <span className="sf-shock" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <i key={angle} style={{ "--a": `${angle}deg` }} />
          ))}
        </span>
      )}
      <svg className="sf-svg" viewBox="0 0 64 80" focusable="false">
        <defs>
          <linearGradient id={`sfo${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sf-o1)" />
            <stop offset="1" stopColor="var(--sf-o2)" />
          </linearGradient>
          <linearGradient id={`sfm${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sf-m1)" />
            <stop offset="1" stopColor="var(--sf-m2)" />
          </linearGradient>
          <linearGradient id={`sfc${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sf-c1)" />
            <stop offset="1" stopColor="var(--sf-c2)" />
          </linearGradient>
        </defs>

        <g className="sf-flame">
          <path className="sf-outer" fill={`url(#sfo${id})`} d={buildFlamePath(FLAME_OUTER[0])}>
            {morph && (
              <animate attributeName="d" dur="2.4s" repeatCount="indefinite" values={outerValues} />
            )}
          </path>
          <path className="sf-mid" fill={`url(#sfm${id})`} d={buildFlamePath(FLAME_MID[0])}>
            {morph && (
              <animate attributeName="d" dur="1.7s" repeatCount="indefinite" values={midValues} />
            )}
          </path>
          <path
            className="sf-core"
            fill={`url(#sfc${id})`}
            d="M32 46C34 51 38 54 38 60C38 66 35 69 32 69C29 69 26 66 26 60C26 55 29 52 32 46Z"
          />
          <ellipse className="sf-shine" cx="19" cy="52" rx="2.4" ry="6" transform="rotate(14 19 52)" />
        </g>

        {embers.map((ember, index) => (
          <circle
            key={index}
            className="sf-ember"
            cx={ember.x}
            cy="64"
            r={ember.r}
            style={{
              "--dx": `${ember.dx}px`,
              animationDelay: `${ember.delay}s`,
              animationDuration: `${ember.dur}s`,
            }}
          />
        ))}
      </svg>
    </span>
  );
}

// ---------- Welcome banner: animated "study universe" scene ----------
// Layers: a pointer-reactive particle network (canvas), a 3D tilted orbit
// system with subject icons, a pulsing core, comets, and live glass cards.
const BANNER_RINGS = [
  { d: 44, t: 26, nodes: [[Timer, 0], [Flame, 120], [Check, 240]] },
  { d: 68, t: 38, nodes: [[NotebookText, 40], [Calculator, 160], [Atom, 280]] },
  { d: 92, t: 54, nodes: [[GraduationCap, 0], [Brain, 90], [Languages, 180], [Target, 270]] },
];

function BannerScene({ done, total, streak, minutes, goalPercent }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  // Pointer parallax for the whole stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const host = stage.closest(".welcome-banner") || stage;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    let frame = 0;
    const onMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = host.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
        const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
        stage.style.setProperty("--px", Math.max(-1, Math.min(1, x)).toFixed(3));
        stage.style.setProperty("--py", Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };
    const onLeave = () => {
      stage.style.setProperty("--px", "0");
      stage.style.setProperty("--py", "0");
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Particle constellation: drifts, links nearby dots, reacts to the pointer,
  // bursts outward on click, pauses when off-screen or the tab is hidden.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const host = canvas.parentElement;
    const banner = canvas.closest(".welcome-banner") || host;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let particles = [];
    const pointer = { x: -9999, y: -9999 };

    function resize() {
      const box = host.getBoundingClientRect();
      const lite = document.documentElement.classList.contains("perf-lite");
      const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(
        lite ? 10 : 16,
        Math.min(lite ? 24 : 56, Math.round((width * height) / (lite ? 16000 : 8500)))
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.7,
        tw: Math.random() * Math.PI * 2,
      }));
      if (reduce) draw(0);
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      const link = Math.min(125, width * 0.28);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (!reduce) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150 && dist > 0.1) {
            const force = (1 - dist / 150) * 0.05;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.vx *= 0.985;
          p.vy *= 0.985;
          const speed = Math.hypot(p.vx, p.vy);
          if (speed < 0.12) {
            p.vx += (Math.random() - 0.5) * 0.02;
            p.vy += (Math.random() - 0.5) * 0.02;
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        const glow = 0.45 + 0.4 * Math.sin(time / 700 + p.tw);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${glow.toFixed(3)})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(255,255,255,${((1 - d / link) * 0.22).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        const pd = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (pd < 130) {
          ctx.strokeStyle = `rgba(255,214,200,${((1 - pd / 130) * 0.55).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    let lastDraw = 0;
    function loop(time) {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      // phones: cap the particle canvas at ~30fps so scrolling stays smooth
      if (document.documentElement.classList.contains("perf-lite") && time - lastDraw < 32) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastDraw = time;
      draw(time);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (reduce || raf) return;
      raf = requestAnimationFrame(loop);
    }

    function onMove(event) {
      const box = canvas.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
    }
    function onLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }
    function onDown(event) {
      const box = canvas.getBoundingClientRect();
      const cx = event.clientX - box.left;
      const cy = event.clientY - box.top;
      particles.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < 220 && dist > 0.1) {
          const push = (1 - dist / 220) * 4.2;
          p.vx += (dx / dist) * push;
          p.vy += (dy / dist) * push;
        }
      });
    }
    function onVisibility() {
      if (!document.hidden) start();
    }

    resize();

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible) start();
            },
            { threshold: 0.01 }
          )
        : null;
    io?.observe(host);

    banner.addEventListener("pointermove", onMove, { passive: true });
    banner.addEventListener("pointerleave", onLeave);
    banner.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      resizeObserver?.disconnect();
      io?.disconnect();
      banner.removeEventListener("pointermove", onMove);
      banner.removeEventListener("pointerleave", onLeave);
      banner.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const weekHours = minutes / 60;

  return (
    <div className="banner-stage" ref={stageRef} aria-hidden="true">
      <canvas ref={canvasRef} className="bs-canvas" />

      <span className="bs-comet bs-comet-a" />
      <span className="bs-comet bs-comet-b" />
      <span className="bs-comet bs-comet-c" />

      <div className="bs-scene">
        <div className="bs-plane">
          {BANNER_RINGS.map((ring, ringIndex) => (
            <div
              className="bs-ring"
              key={ring.d}
              style={{ "--d": `${ring.d}cqmin`, "--t": `${ring.t}s`, "--r": ringIndex }}
            >
              {ring.nodes.map(([NodeIcon, angle]) => (
                <span className="bs-node" key={angle} style={{ "--a": `${angle}deg` }}>
                  <span className="bs-node-spin">
                    <span className="bs-node-face">
                      <NodeIcon size={16} strokeWidth={2.2} />
                    </span>
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="bs-core">
          <span className="bs-pulse" />
          <span className="bs-pulse" />
          <span className="bs-pulse" />
          <span className="bs-core-orb">
            <BookMarked size={38} strokeWidth={1.5} />
          </span>
          <Sparkles className="bs-spark bs-spark-a" size={20} />
          <Sparkles className="bs-spark bs-spark-b" size={14} />
          <Sparkles className="bs-spark bs-spark-c" size={16} />
        </div>
      </div>

      <div className="bs-card bs-card-tasks" style={{ "--k": 14 }}>
        <span className="bs-card-icon">
          <Check size={16} strokeWidth={3} />
        </span>
        <div>
          <strong>
            <CountUp value={done} /> / {total}
          </strong>
          <small>Tasks done</small>
        </div>
      </div>

      <div className="bs-card bs-card-streak" style={{ "--k": -18 }}>
        <StreakFlame streak={streak} size={34} />
        <div>
          <strong>
            <CountUp value={streak} /> {streak === 1 ? "day" : "days"}
          </strong>
          <small>Study streak</small>
        </div>
      </div>

      <div className="bs-card bs-card-goal" style={{ "--k": 22 }}>
        <div className="bs-goal-head">
          <small>Daily goal</small>
          <strong>
            <CountUp value={goalPercent} />%
          </strong>
        </div>
        <div className="bs-goal-track">
          <span style={{ width: `${goalPercent}%` }} />
        </div>
        <div className="bs-goal-foot">
          <Clock3 size={12} />
          <CountUp value={weekHours} decimals={1} /> hrs this week
        </div>
      </div>
    </div>
  );
}


export default function App() {
  // ---------- Authentication ----------
  const [student, setStudent] = useState(null);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [authFocus, setAuthFocus] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
const [authMode, setAuthMode] = useState("login");
const [authName, setAuthName] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [showAuthPassword, setShowAuthPassword] = useState(false);
const [googleSignInReady, setGoogleSignInReady] = useState(false);
const [hapticsOn, setHapticsOn] = useState(() => isHapticsEnabled());

const [deletedTasks, setDeletedTasks] = useState([]);
const [undoLoading, setUndoLoading] = useState(false);

useEffect(() => {
  if (Capacitor.getPlatform() !== "android") {
    return;
  }

  GoogleSignIn.initialize({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  })
    .then(() => {
      console.log("Native Google Sign-In initialized.");
    })
    .catch((error) => {
      console.error(
        "Google Sign-In initialization failed:",
        error
      );
    });
}, []);


  // ---------- Tasks ----------
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newSubject, setNewSubject] = useState("Personal");
  const [newTaskDuration, setNewTaskDuration] = useState("25");
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // ---------- Interface ----------
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [subjectsExpanded, setSubjectsExpanded] = useState(true);
  const [selectedSubjectsForRemoval, setSelectedSubjectsForRemoval] = useState([]);
  const [hiddenSubjectNames, setHiddenSubjectNames] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("studyos-hidden-subjects") || "[]");
      return Array.isArray(saved) ? saved.filter((name) => typeof name === "string") : [];
    } catch {
      return [];
    }
  });

  // ---------- Settings ----------
  const [settingsTheme, setSettingsTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("studyos-theme");
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    } catch (error) {
      // localStorage may be unavailable in restricted browser contexts.
    }
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });
  const [studyRemindersEnabled, setStudyRemindersEnabled] = useState(true);
  const [taskNotificationsEnabled, setTaskNotificationsEnabled] =
    useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  // ---------- Notes ----------
  const [subjectNotes, setSubjectNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("Mathematics");
  const [noteContent, setNoteContent] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [noteFilter, setNoteFilter] = useState("All Subjects");
  const [editingNoteId, setEditingNoteId] = useState(null);

  // ---------- Pomodoro timer ----------
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [focusSessions, setFocusSessions] = useState([]);
  const [focusSessionsLoading, setFocusSessionsLoading] = useState(false);
  const [focusSessionsLoadingMore, setFocusSessionsLoadingMore] = useState(false);
  const [focusSessionsHasMore, setFocusSessionsHasMore] = useState(false);
  const [focusSessionsError, setFocusSessionsError] = useState("");
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [totalFocusSessionCount, setTotalFocusSessionCount] = useState(0);
  const completionRecordedRef = useRef(false);

  // ---------- Weekly planner and daily goal ----------
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");
  const [plannerDay, setPlannerDay] = useState(getTodayPlannerDay);
  const [plannerTitle, setPlannerTitle] = useState("");
  const [plannerSubject, setPlannerSubject] = useState("Mathematics");
  const [plannerDeadline, setPlannerDeadline] = useState("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(loadDailyGoal);
  const [goalDraft, setGoalDraft] = useState(() => String(loadDailyGoal()));
  const [dailyGoalLoading, setDailyGoalLoading] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);

  // ---------- Reminder ----------
  const [reminderIndex, setReminderIndex] = useState(0);
  const [showStudyTip, setShowStudyTip] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  // ---------- Streak calendar popup ----------
  const [streakCalendarOpen, setStreakCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const first = new Date();
    first.setDate(1);
    first.setHours(0, 0, 0, 0);
    return first;
  });

  // ---------- Effects ----------
  useEffect(() => {
    setDisplayNameDraft(student?.displayName || student?.name || "");
  }, [student?.displayName, student?.name]);

  // Streak calendar: close with Escape and keep the page from scrolling behind it.
  useEffect(() => {
    if (!streakCalendarOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setStreakCalendarOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [streakCalendarOpen]);

  // Restore a saved login session.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem("studyos_auth_token");

      if (!savedToken) {
        if (!cancelled) setAuthChecking(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (!response.ok) {
          throw new Error("Session expired or invalid.");
        }

        const data = await response.json();

        if (!data.student) {
          throw new Error("Student data is missing.");
        }

        if (!cancelled) {
          setStudent(data.student);
          setAuthToken(savedToken);
        }
      } catch (error) {
        localStorage.removeItem("studyos_auth_token");

        if (!cancelled) {
          setStudent(null);
          setAuthToken("");
        }

        console.error("StudyOS session restoration:", error.message);
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load tasks.
  useEffect(() => {
    if (!authToken) {
      setTasks([]);
      setTasksLoading(false);
      setTasksError("");
      return;
    }

    const controller = new AbortController();

    async function fetchTasks() {
      setTasksLoading(true);
      setTasksError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Could not load your tasks.");
        }

        setTasks(
          Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Loading StudyOS tasks:", error);
          setTasksError(error.message || "Could not load tasks.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setTasksLoading(false);
        }
      }
    }

    fetchTasks();

    return () => controller.abort();
  }, [authToken, reloadVersion]);

  // Load notes.
  useEffect(() => {
    if (!authToken) {
      setSubjectNotes([]);
      setNotesLoading(false);
      setNotesError("");
      return;
    }

    const controller = new AbortController();

    async function fetchNotes() {
      setNotesLoading(true);
      setNotesError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Could not load your notes.");
        }

        setSubjectNotes(
          Array.isArray(data.notes) ? data.notes.map(normalizeNote) : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Loading StudyOS notes:", error);
          setNotesError(error.message || "Could not load your notes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setNotesLoading(false);
        }
      }
    }

    fetchNotes();

    return () => controller.abort();
  }, [authToken, reloadVersion]);

  // Load settings (daily goal, theme, notifications) with ONE request.
  useEffect(() => {
    if (!authToken) {
      setDailyGoalLoading(false);
      setSettingsLoading(false);
      setSettingsError("");
      return;
    }

    const controller = new AbortController();

    async function fetchSettings() {
      setDailyGoalLoading(true);
      setSettingsLoading(true);
      setSettingsError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Could not load your settings."
          );
        }

        if (localStorage.getItem("studyos_auth_token") !== authToken) {
          return;
        }

        const saved = data.settings;

        if (!saved) {
          throw new Error("The server did not return your saved settings.");
        }

        const minutes = saved.dailyGoalMinutes;

        if (Number.isInteger(minutes) && minutes >= 1 && minutes <= 720) {
          setDailyGoalMinutes(minutes);
          setGoalDraft(String(minutes));
          localStorage.setItem("studyos-daily-goal-minutes", String(minutes));
        }

        if (saved.theme === "light" || saved.theme === "dark") {
          setSettingsTheme(saved.theme);
        }

        if (typeof saved.studyRemindersEnabled === "boolean") {
          setStudyRemindersEnabled(saved.studyRemindersEnabled);
        }

        if (typeof saved.taskNotificationsEnabled === "boolean") {
          setTaskNotificationsEnabled(saved.taskNotificationsEnabled);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Loading StudyOS settings:", error);
          setSettingsError(error.message || "Could not load your settings.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setDailyGoalLoading(false);
          setSettingsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => controller.abort();
  }, [authToken, reloadVersion]);

  // Apply and persist the selected theme.
  useEffect(() => {
    document.documentElement.dataset.theme = settingsTheme;
    try {
      localStorage.setItem("studyos-theme", settingsTheme);
    } catch (error) {
      // The active theme still works for this session if storage is unavailable.
    }
  }, [settingsTheme]);

  // Dashboard motion: click ripples on buttons. (The cursor-following
  // spotlight and 3D tilt effects were removed.)
  useEffect(() => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function onPointerDown(event) {
      if (reduceMotion) return;
      const button = event.target.closest?.(
        ".study-app .add-task-button, .study-app .primary-link, .study-app .focus-start-button, .study-app .focus-reset-button, .study-app .settings-save-button, .study-app .primary-button"
      );
      if (!button || button.disabled) return;

      const box = button.getBoundingClientRect();
      const size = Math.max(box.width, box.height) * 1.6;
      const ripple = document.createElement("span");
      ripple.className = "sm-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - box.left - size / 2}px`;
      ripple.style.top = `${event.clientY - box.top - size / 2}px`;
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    }

    document.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  // Scroll-reveal fallback (only used where CSS scroll-driven animation is missing).
  useEffect(() => {
    if (!student) return undefined;

    const nativeReveal = window.CSS?.supports?.("animation-timeline: view()");
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (nativeReveal || reduceMotion || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sm-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    const timer = window.setTimeout(() => {
      document
        .querySelectorAll(".study-app .panel, .study-app .stat-card")
        .forEach((node) => observer.observe(node));
      root.classList.add("sm-js-reveal");
    }, 60);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      root.classList.remove("sm-js-reveal");
    };
  }, [student]);

  // Load weekly planner tasks.
  useEffect(() => {
    if (!authToken) {
      setWeeklyPlan([]);
      setPlannerLoading(false);
      setPlannerError("");
      return;
    }

    const controller = new AbortController();

    async function fetchPlannerTasks() {
      setPlannerLoading(true);
      setPlannerError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/planner`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load your weekly planner."
          );
        }

        if (localStorage.getItem("studyos_auth_token") !== authToken) {
          return;
        }

        setWeeklyPlan(
          Array.isArray(data.tasks) ? data.tasks.map(normalizePlannerTask) : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Loading StudyOS planner:", error);
          setPlannerError(error.message || "Could not load your weekly planner.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setPlannerLoading(false);
        }
      }
    }

    fetchPlannerTasks();

    return () => controller.abort();
  }, [authToken, reloadVersion]);

  // Load focus sessions.
  useEffect(() => {
    if (!authToken) {
      setFocusSessions([]);
      setFocusSessionsLoading(false);
      setFocusSessionsHasMore(false);
      setFocusSessionsError("");
      setTotalFocusMinutes(0);
      setTotalFocusSessionCount(0);
      return;
    }

    const controller = new AbortController();

    async function fetchFocusSessions() {
      setFocusSessionsLoading(true);
      setFocusSessionsError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/focus-sessions`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Could not load your focus history.");
        }

        const sessions = Array.isArray(data.sessions)
          ? data.sessions.map(normalizeFocusSession)
          : [];

        setFocusSessions(sessions);
        setFocusSessionsHasMore(data.hasMore === true);
        setTotalFocusMinutes(
          Number.isFinite(data.totalFocusMinutes)
            ? data.totalFocusMinutes
            : sessions.reduce(
              (total, session) => total + session.durationMinutes,
              0
            )
        );
        setTotalFocusSessionCount(
          Number.isInteger(data.totalFocusSessionCount)
            ? data.totalFocusSessionCount
            : sessions.length
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Loading StudyOS focus history:", error);
          setFocusSessionsError(
            error.message || "Could not load focus session history."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFocusSessionsLoading(false);
        }
      }
    }

    fetchFocusSessions();

    return () => controller.abort();
  }, [authToken, reloadVersion]);

  // Accurate countdown and database persistence for completed sessions.
  useEffect(() => {
    if (!isRunning || endTime === null) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setSecondsLeft(remaining);

      if (remaining !== 0) return;

      setIsRunning(false);
      setEndTime(null);
      setSessionCompleted(true);

      // Ensure this timer completion is processed only once.
      if (completionRecordedRef.current) return;
      completionRecordedRef.current = true;
      haptic.celebrate();

      const completedAt = new Date().toISOString();

      async function saveCompletedSession() {
        if (!authToken) {
          setNotice("Your session finished, but you must sign in to save it.");
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/focus-sessions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ durationMinutes, completedAt }),
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              data.message || "Could not save your completed session."
            );
          }

          if (!data.session) {
            throw new Error(
              "The server did not return the saved focus session."
            );
          }

          if (localStorage.getItem("studyos_auth_token") !== authToken) {
            return;
          }

          const savedSession = normalizeFocusSession(data.session);

          setFocusSessions((current) => [
            savedSession,
            ...current.filter((session) => session.id !== savedSession.id),
          ]);
          setTotalFocusMinutes(
            (current) => current + savedSession.durationMinutes
          );
          setTotalFocusSessionCount((current) => current + 1);
          setFocusSessionsError("");

          setNotice("Focus session saved to your StudyOS account!");
        } catch (error) {
          console.error("Saving StudyOS focus session:", error);

          if (localStorage.getItem("studyos_auth_token") === authToken) {
            setNotice(
              `Your session finished, but saving failed: ${error.message || "Unknown error"
              }`
            );
          }
        }
      }

      saveCompletedSession();
    };

    updateTimer();

    const interval = setInterval(updateTimer, 250);

    return () => clearInterval(interval);
  }, [isRunning, endTime, durationMinutes, authToken]);

  // ---------- Auth handlers ----------
  async function handleEmailAuth(event) {
    event.preventDefault();
    setAuthError("");

    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (authMode === "register" && authName.trim().length < 2) {
      setAuthError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setAuthError("Your password must be between 8 and 128 characters.");
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = authMode === "register" ? "register" : "login";
      const payload = authMode === "register"
        ? { name: authName.trim(), email, password }
        : { email, password };

      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};
      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Authentication failed (HTTP ${response.status}).`);
      }
      if (!data.student || !data.token) {
        throw new Error("The server response is missing account or session data.");
      }

      localStorage.setItem("studyos_auth_token", data.token);
      setStudent(data.student);
      setAuthToken(data.token);
      haptic.welcome();
      setAuthPassword("");
      setAuthError("");
    } catch (error) {
      console.error("StudyOS email authentication error:", error);
      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        setAuthError("Cannot reach the login API. Check the API URL, backend availability, and CORS settings.");
      } else {
        setAuthError(error.message || "Unable to authenticate. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  }

  // Native (Capacitor / Android) Google sign-in. This lives OUTSIDE
  // handleGoogleSuccess so it can actually be called from the button.
  async function handleNativeGoogleSignIn() {
    setAuthError("");

    try {
      const result = await GoogleSignIn.signIn();

      if (!result?.idToken) {
        throw new Error("Google did not return an ID token. Please try again.");
      }

      await handleGoogleSuccess({ idToken: result.idToken });
    } catch (error) {
      console.error("Native Google sign-in error:", error);

      if (
        error?.code === "SIGN_IN_CANCELED" ||
        error?.message?.toLowerCase()?.includes("cancel")
      ) {
        return;
      }

      setAuthError(
        error?.message || "Native Google sign-in failed. Please try again."
      );
    }
  }

  async function handleGoogleSuccess(googleResponse) {
    const credential =
      googleResponse?.credential || googleResponse?.idToken;

    if (!credential) {
      setAuthError("Google did not return a credential. Please try again.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          `Sign-in request failed (HTTP ${response.status}).`
        );
      }

      if (!data.student || !data.token) {
        throw new Error("Login response is missing student or token data.");
      }

      localStorage.setItem("studyos_auth_token", data.token);

      setStudent(data.student);
      setAuthToken(data.token);
      haptic.welcome();
      setAuthError("");
    } catch (error) {
      console.error("StudyOS Google sign-in error:", error);

      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        setAuthError(
          "Cannot reach the login API. Check the API URL, backend CORS settings, and backend availability."
        );
      } else {
        setAuthError(error.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  }

  const handleLogout = () => {
    // Stop and reset the timer.
    setIsRunning(false);
    setEndTime(null);
    setSecondsLeft(durationMinutes * 60);
    setSessionCompleted(false);
    completionRecordedRef.current = false;

    // Clear the saved login session.
    localStorage.removeItem("studyos_auth_token");

    // Clear authenticated student state.
    setStudent(null);
    setAuthToken("");
    setAuthError("");
    setAuthLoading(false);
    setShowAuthScreen(false);

    // Close open interface elements.
    setMenuOpen(false);
    setShowNotifications(false);
    setNotice("");
  };

  function retryDataLoads() {
    setReloadVersion((current) => current + 1);
  }

  async function loadMoreFocusSessions() {
    if (
      !authToken ||
      !focusSessionsHasMore ||
      focusSessionsLoadingMore ||
      focusSessions.length === 0
    ) {
      return;
    }

    const cursor = focusSessions[focusSessions.length - 1].id;

    setFocusSessionsLoadingMore(true);
    setFocusSessionsError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/focus-sessions?before=${encodeURIComponent(cursor)}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not load older focus sessions.");
      }

      if (!Array.isArray(data.sessions)) {
        throw new Error("The server did not return focus session history.");
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      const olderSessions = data.sessions.map(normalizeFocusSession);
      setFocusSessions((current) => {
        const existingIds = new Set(current.map((session) => session.id));
        return [
          ...current,
          ...olderSessions.filter((session) => !existingIds.has(session.id)),
        ];
      });
      setFocusSessionsHasMore(data.hasMore === true);
    } catch (error) {
      console.error("Loading older StudyOS focus sessions:", error);

      if (localStorage.getItem("studyos_auth_token") === authToken) {
        setFocusSessionsError(
          error.message || "Could not load older focus sessions."
        );
      }
    } finally {
      setFocusSessionsLoadingMore(false);
    }
  }

  // ---------- Timer handlers ----------
  function changeDuration(event) {
    const value = Number(event.target.value);

    if (!Number.isFinite(value)) return;

    const minutes = Math.min(180, Math.max(1, Math.floor(value)));

    setDurationMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setSessionCompleted(false);
    setEndTime(null);
  }

  function applyPreset(minutes) {
    if (isRunning) return;
    setDurationMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setSessionCompleted(false);
    setEndTime(null);
  }

  function startTimer() {
    if (focusSessionsLoading) {
      setNotice("Loading your focus history. Please wait a moment.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in to start a focus session.");
      return;
    }

    if (isRunning) return;

    // After a finished session the clock sits at 0; start a fresh one.
    let remaining = secondsLeft;
    if (remaining <= 0) {
      remaining = durationMinutes * 60;
      setSecondsLeft(remaining);
    }

    completionRecordedRef.current = false;
    setSessionCompleted(false);

    setEndTime(Date.now() + remaining * 1000);
    setIsRunning(true);
    haptic.timerStart();
  }

  function pauseTimer() {
    if (endTime !== null) {
      setSecondsLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    }

    setIsRunning(false);
    setEndTime(null);
  }

  function resetTimer() {
    haptic.warning();
    setIsRunning(false);
    setEndTime(null);
    setSecondsLeft(durationMinutes * 60);
    setSessionCompleted(false);
  }

  function nextReminder() {
    setReminderIndex((current) => (current + 1) % reminders.length);
    setShowStudyTip(false);
  }

  // ---------- Derived values ----------
  const totalSeconds = durationMinutes * 60;
  const timerMinutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const timerSeconds = String(secondsLeft % 60).padStart(2, "0");
  const timerProgress = Math.min(
    100,
    Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100)
  );

  const currentReminder = reminders[reminderIndex];

  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;

  const today = new Date();
  const todayKey = getLocalDateKey(today);

  const sessionDateKeys = new Set(
    focusSessions
      .map((session) => new Date(session.completedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(getLocalDateKey)
  );

  const todayFocusMinutes = focusSessions.reduce((total, session) => {
    const completedAt = new Date(session.completedAt);

    if (
      Number.isNaN(completedAt.getTime()) ||
      getLocalDateKey(completedAt) !== todayKey
    ) {
      return total;
    }

    return total + Math.max(0, Number(session.durationMinutes) || 0);
  }, 0);

  const dailyGoalPercent =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((todayFocusMinutes / dailyGoalMinutes) * 100))
      : 0;

  // Current consecutive-day study streak.
  const streakAnchor = new Date(today);

  if (!sessionDateKeys.has(todayKey)) {
    streakAnchor.setDate(streakAnchor.getDate() - 1);
  }

  let studyStreak = 0;
  const streakDate = new Date(streakAnchor);

  while (sessionDateKeys.has(getLocalDateKey(streakDate))) {
    studyStreak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  // Activity for the last seven calendar days.
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const dateKey = getLocalDateKey(date);

    const minutes = focusSessions.reduce((total, session) => {
      const completedAt = new Date(session.completedAt);

      if (
        Number.isNaN(completedAt.getTime()) ||
        getLocalDateKey(completedAt) !== dateKey
      ) {
        return total;
      }

      return total + Math.max(0, Number(session.durationMinutes) || 0);
    }, 0);

    return {
      dateKey,
      label: date.toLocaleDateString([], { weekday: "short" }),
      minutes,
      isToday: dateKey === todayKey,
    };
  });

  const weeklyFocusMinutes = weeklyActivity.reduce(
    (total, day) => total + day.minutes,
    0
  );

  const weeklyDateKeys = new Set(weeklyActivity.map((day) => day.dateKey));

  const weeklySessions = focusSessions.filter((session) => {
    const completedAt = new Date(session.completedAt);

    return (
      !Number.isNaN(completedAt.getTime()) &&
      weeklyDateKeys.has(getLocalDateKey(completedAt))
    );
  });

  const weeklySessionCount = weeklySessions.length;

  const averageSessionMinutes =
    weeklySessionCount > 0
      ? Math.round(weeklyFocusMinutes / weeklySessionCount)
      : 0;

  const mostProductiveDay = weeklyActivity.reduce(
    (best, day) => (day.minutes > best.minutes ? day : best),
    weeklyActivity[0]
  );

  const hasWeeklyActivity = weeklyFocusMinutes > 0;

  const maxDailyMinutes = Math.max(1, ...weeklyActivity.map((day) => day.minutes));

  // Streak calendar (Sunday-first month grid). A day is "studied" when at least
  // one focus session was completed on it.
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarLeadingBlanks = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const calendarDaysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: calendarLeadingBlanks }, () => null),
    ...Array.from({ length: calendarDaysInMonth }, (_, index) => {
      const key = getLocalDateKey(new Date(calendarYear, calendarMonthIndex, index + 1));
      return {
        day: index + 1,
        key,
        done: sessionDateKeys.has(key),
        isToday: key === todayKey,
      };
    }),
  ];
  const calendarStudiedDays = calendarCells.filter((cell) => cell && cell.done).length;
  const isCurrentCalendarMonth =
    calendarYear === today.getFullYear() && calendarMonthIndex === today.getMonth();
  const calendarTitle = calendarMonth.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const longestSessionMinutes = focusSessions.reduce(
    (best, session) => Math.max(best, Number(session.durationMinutes) || 0),
    0
  );

  function shiftCalendarMonth(delta) {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
  }

  const completionPercent =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const searchQuery = search.trim().toLowerCase();

const visibleTasks = tasks.filter((task) => {
  const searchableText = [
    task.title,
    task.subject,
    task.time,
    task.completed ? "completed done" : "pending todo incomplete",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchQuery);
});

  // My Subjects is based ONLY on subjects used by tasks.
  // Planner entries and notes never create a subject card on their own.
  const subjects = (() => {
    const byName = new Map();
    tasks.forEach((task) => {
      const name = (typeof task.subject === "string" ? task.subject : "").trim();
      if (!name || name.toLowerCase() === "other") return;
      const key = name.toLowerCase();
      if (!byName.has(key)) {
        const colors = ["purple", "blue", "orange", "green"];
        byName.set(key, {
          name,
          detail: `Your ${name} tasks`,
          color: colors[byName.size % colors.length],
        });
      }
    });
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  // A subject is completed when it has at least one task and every task is done.
  // Completed subjects remain available in the history area; their tasks and notes are untouched.
  const getSubjectTaskStats = (subjectName) => {
    const normalizedName = subjectName.trim().toLowerCase();
    const relatedTasks = tasks.filter(
      (task) => (task.subject || "Personal").trim().toLowerCase() === normalizedName
    );
    const completed = relatedTasks.filter((task) => task.completed).length;
    return { total: relatedTasks.length, completed };
  };
  const completedSubjects = subjects.filter((subject) => {
    const stats = getSubjectTaskStats(subject.name);
    return stats.total > 0 && stats.completed === stats.total;
  });
  const activeSubjects = subjects.filter(
    (subject) => !completedSubjects.includes(subject) &&
      !hiddenSubjectNames.some((name) => name.toLowerCase() === subject.name.toLowerCase())
  );

  function toggleSubjectRemoval(subjectName) {
    setSelectedSubjectsForRemoval((current) =>
      current.includes(subjectName)
        ? current.filter((name) => name !== subjectName)
        : [...current, subjectName]
    );
  }

  function removeSelectedSubjectsFromList() {
    if (selectedSubjectsForRemoval.length === 0) return;
    const nextHidden = Array.from(new Set([...hiddenSubjectNames, ...selectedSubjectsForRemoval]));
    setHiddenSubjectNames(nextHidden);
    try {
      localStorage.setItem("studyos-hidden-subjects", JSON.stringify(nextHidden));
    } catch (error) {
      console.error("Could not save hidden subjects preference:", error);
    }
    setSelectedSubjectsForRemoval([]);
  }

  const globalSearchQuery = globalSearch.trim().toLowerCase();
  const globalSearchResults = globalSearchQuery
    ? [
        ...tasks
          .filter((task) =>
            [task.title, task.subject, task.time, task.completed ? "completed done" : "pending incomplete"]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(globalSearchQuery)
          )
          .map((task) => ({
            id: `task-${task.id}`,
            type: "Task",
            title: task.title,
            detail: `${task.subject} · ${task.time}${task.completed ? " · Completed" : " · Pending"}`,
            onSelect: () => {
              setSearch(task.title);
              document.getElementById("tasks")?.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          })),
        ...subjectNotes
          .filter((note) =>
            [note.title, note.content, note.subject]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(globalSearchQuery)
          )
          .map((note) => ({
            id: `note-${note.id}`,
            type: "Note",
            title: note.title,
            detail: `${note.subject} · Saved note`,
            onSelect: () => {
              setGlobalSearchOpen(false);
              setGlobalSearch("");
              editSubjectNote(note);
              document.getElementById("subject-notes")?.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          })),
        ...subjects
          .filter((subject) => subject.name.toLowerCase().includes(globalSearchQuery))
          .map((subject) => ({
            id: `subject-${subject.name}`,
            type: "Subject",
            title: subject.name,
            detail: "Study subject",
            onSelect: () => {
              setGlobalSearchOpen(false);
              document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          })),
        ...weeklyPlan
          .filter((item) =>
            [item.title, item.subject, item.day, item.deadline, item.completed ? "completed done" : "pending incomplete"]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(globalSearchQuery)
          )
          .map((item) => ({
            id: `planner-${item.id}`,
            type: "Planner",
            title: item.title,
            detail: `${item.subject} · ${item.day}${item.completed ? " · Completed" : " · Pending"}`,
            onSelect: () => {
              if (plannerDays.includes(item.day)) setPlannerDay(item.day);
              setGlobalSearchOpen(false);
              document.getElementById("weekly-planner")?.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          })),
      ].slice(0, 12)
    : [];

  function handleGlobalSearchKeyDown(event) {
    if (event.key === "Escape") {
      setGlobalSearchOpen(false);
      setGlobalSearch("");
    }
  }

  const subjectSuggestions = Array.from(
    new Set([
      ...subjects.map((subject) => subject.name),
      "Islamiat",
      "Urdu",
      "Computer Science",
      "Chemistry",
      "Biology",
      "History",
      "Geography",
      "Personal",
    ])
  ).sort((a, b) => a.localeCompare(b));

  // ---------- Task handlers ----------
  async function addTask(event) {
    event.preventDefault();

    const title = newTask.trim();

    if (!title) {
      setNotice("Please enter a task title first.");
      return;
    }

    const duration = Number(newTaskDuration);

    if (!Number.isInteger(duration) || duration < 1 || duration > 720) {
      setNotice("Choose a task duration between 1 and 720 minutes.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in before adding tasks.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title, subject: newSubject, duration }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not add the task.");
      }

      setTasks((current) => [normalizeTask(data.task), ...current]);
      setTasksError("");

      setNewTask("");
      setNewTaskDuration("25");
      haptic.add();
      setNotice("Your new task has been saved!");
    } catch (error) {
      console.error("Adding StudyOS task:", error);
      setNotice(error.message || "Could not save the task.");
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task || !authToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ completed: !task.completed }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not update the task.");
      }

      setTasks((current) =>
        current.map((item) => (item.id === id ? normalizeTask(data.task) : item))
      );

      if (!task.completed) haptic.success();
      setNotice("");
    } catch (error) {
      console.error("Updating StudyOS task:", error);
      setNotice(error.message || "Could not update the task.");
    }
  }


async function deleteTask(id) {
  if (!authToken) return;

  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Could not delete the task.");
    }

    setTasks((current) => current.filter((item) => item.id !== id));
    setDeletedTasks((current) => [
      { ...task, deletedAt: Date.now() },
      ...current,
    ]);
    haptic.warning();
    setNotice("Task deleted. You can undo this action.");
  } catch (error) {
    console.error("Deleting StudyOS task:", error);
    setNotice(error.message || "Could not delete the task.");
  }
}



async function undoDeleteTask() {
  if (!authToken || undoLoading || deletedTasks.length === 0) return;

  const taskToRestore = deletedTasks[0];

  setUndoLoading(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${encodeURIComponent(taskToRestore.id)}/restore`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Could not restore the task.");
    }

    setTasks((current) => [
      normalizeTask(data.task),
      ...current.filter((task) => task.id !== taskToRestore.id),
    ]);

    setDeletedTasks((current) =>
      current.filter((task) => task.id !== taskToRestore.id)
    );

    haptic.undo();
    setNotice("Task restored successfully.");
  } catch (error) {
    console.error("Restoring StudyOS task:", error);
    setNotice(error.message || "Could not restore the task.");
  } finally {
    setUndoLoading(false);
  }
}



  async function clearCompleted() {
    if (!authToken) return;

    const completedTasks = tasks.filter((task) => task.completed);

    if (completedTasks.length === 0) return;

    try {
      const results = await Promise.all(
        completedTasks.map(async (task) => {
          const response = await fetch(
            `${API_BASE_URL}/api/tasks/${encodeURIComponent(task.id)}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || `Could not delete "${task.title}".`);
          }

          return task.id;
        })
      );

      const deletedIds = new Set(results);

      setTasks((current) => current.filter((task) => !deletedIds.has(task.id)));

      setNotice("Completed tasks cleared.");
    } catch (error) {
      console.error("Clearing completed StudyOS tasks:", error);

      // Reload from the server so the UI reflects what was actually saved.
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(
            Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : []
          );
        }
      } catch (refreshError) {
        console.error("Refreshing StudyOS tasks:", refreshError);
      }

      setNotice(error.message || "Some completed tasks could not be deleted.");
    }
  }

  // ---------- Planner handlers ----------
  async function addPlannerTask(event) {
    event.preventDefault();

    const title = plannerTitle.trim();

    if (!title) {
      setNotice("Please enter a study task title.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in before adding planner tasks.");
      return;
    }

    if (title.length > 120) {
      setNotice("The task title cannot exceed 120 characters.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/planner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title,
          subject: plannerSubject,
          day: plannerDay,
          deadline: plannerDeadline,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save your planner task.");
      }

      if (!data.task) {
        throw new Error("The server did not return the saved planner task.");
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      const savedTask = normalizePlannerTask(data.task);

      setWeeklyPlan((current) => [
        savedTask,
        ...current.filter((task) => task.id !== savedTask.id),
      ]);
      setPlannerError("");

      setPlannerTitle("");
      setPlannerDeadline("");
      haptic.add();
      setNotice("Study task saved to your StudyOS account!");
    } catch (error) {
      console.error("Adding StudyOS planner task:", error);
      setNotice(error.message || "Could not save the planner task.");
    }
  }

  async function togglePlannerTask(id) {
    const task = weeklyPlan.find((item) => item.id === id);

    if (!task || !authToken) {
      if (!authToken) {
        setNotice("Please sign in to update planner tasks.");
      }
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/planner/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ completed: !task.completed }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not update your planner task.");
      }

      if (!data.task) {
        throw new Error("The server did not return the updated planner task.");
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      const updatedTask = normalizePlannerTask(data.task);

      setWeeklyPlan((current) =>
        current.map((item) => (item.id === id ? updatedTask : item))
      );

      if (!task.completed) haptic.success();
      setNotice("");
    } catch (error) {
      console.error("Updating StudyOS planner task:", error);
      setNotice(error.message || "Could not update the planner task.");
    }
  }

  async function deletePlannerTask(id) {
    if (!authToken) {
      setNotice("Please sign in to delete planner tasks.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/planner/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete your planner task.");
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      setWeeklyPlan((current) => current.filter((task) => task.id !== id));

      haptic.warning();
      setNotice("Planner task deleted.");
    } catch (error) {
      console.error("Deleting StudyOS planner task:", error);
      setNotice(error.message || "Could not delete the planner task.");
    }
  }

  // ---------- Notes handlers ----------
  async function saveSubjectNote(event) {
    event.preventDefault();

    const title = noteTitle.trim();
    const content = noteContent.trim();

    if (!title || !content) {
      setNotice("Please enter a note title and some content.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in before saving notes.");
      return;
    }

    if (title.length > 120 || content.length > 20000) {
      setNotice("The title or note content is too long.");
      return;
    }

    setNoteSaving(true);

    try {
      const isEditing = editingNoteId !== null;
      const url = isEditing
        ? `${API_BASE_URL}/api/notes/${encodeURIComponent(editingNoteId)}`
        : `${API_BASE_URL}/api/notes`;
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title, subject: noteSubject, content }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save your note.");
      }

      if (!data.note) {
        throw new Error("The server did not return the saved note.");
      }

      const savedNote = normalizeNote(data.note);

      if (isEditing) {
        setSubjectNotes((current) =>
          current.map((note) => (note.id === editingNoteId ? savedNote : note))
        );
        haptic.note();
        setNotice("Note updated successfully!");
      } else {
        setSubjectNotes((current) => [savedNote, ...current]);
        haptic.note();
        setNotice("Note saved successfully!");
      }
      setNotesError("");

      setNoteTitle("");
      setNoteContent("");
      setNoteSubject("Mathematics");
      setEditingNoteId(null);
    } catch (error) {
      console.error("Saving StudyOS note:", error);
      setNotice(error.message || "Could not save your note.");
    } finally {
      setNoteSaving(false);
    }
  }

  function editSubjectNote(note) {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteSubject(note.subject);
    setNoteContent(note.content);

    document.getElementById("subject-note-editor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function cancelNoteEdit() {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteSubject("Mathematics");
  }

  async function deleteSubjectNote(id) {
    if (!authToken) {
      setNotice("Please sign in before deleting notes.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notes/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the note.");
      }

      setSubjectNotes((current) => current.filter((note) => note.id !== id));

      if (editingNoteId === id) {
        cancelNoteEdit();
      }

      haptic.warning();
      setNotice("Note deleted.");
    } catch (error) {
      console.error("Deleting StudyOS note:", error);
      setNotice(error.message || "Could not delete the note.");
    }
  }

  const visibleNotes = subjectNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      note.content.toLowerCase().includes(noteSearch.toLowerCase());

    const matchesSubject =
      noteFilter === "All Subjects" ||
      (note.subject || "Personal").trim().toLowerCase() ===
      noteFilter.trim().toLowerCase();

    return matchesSearch && matchesSubject;
  });

  // ---------- Settings handlers ----------
  async function saveDailyGoal(event) {
    event.preventDefault();

    const minutes = Number(goalDraft);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 720) {
      setNotice("Please enter a whole-number goal between 1 and 720 minutes.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in before saving your daily goal.");
      return;
    }

    setGoalSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ dailyGoalMinutes: minutes }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Could not save your daily study goal."
        );
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      const savedMinutes = data.settings?.dailyGoalMinutes;

      if (
        !Number.isInteger(savedMinutes) ||
        savedMinutes < 1 ||
        savedMinutes > 720
      ) {
        throw new Error("The server did not return a valid saved goal.");
      }

      setDailyGoalMinutes(savedMinutes);
      setGoalDraft(String(savedMinutes));
      setSettingsError("");

      localStorage.setItem("studyos-daily-goal-minutes", String(savedMinutes));

      haptic.confirm();
      setNotice("Daily study goal saved to your StudyOS account!");
    } catch (error) {
      console.error("Saving daily study goal:", error);
      setNotice(error.message || "Could not save your daily study goal.");
    } finally {
      setGoalSaving(false);
    }
  }

  // Save the custom StudyOS display name without changing the Google name.
  async function saveDisplayName(event) {
    event.preventDefault();

    const trimmedName = displayNameDraft.trim();

    if (trimmedName.length < 2 || trimmedName.length > 40) {
      setNotice("Display name must be between 2 and 40 characters.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in before updating your display name.");
      return;
    }

    setProfileSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ displayName: trimmedName }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not update your display name."
        );
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      if (!data.student) {
        throw new Error("The server did not return your updated profile.");
      }

      setStudent((currentStudent) =>
        currentStudent ? { ...currentStudent, ...data.student } : data.student
      );
      setDisplayNameDraft(data.student.displayName || trimmedName);
      haptic.confirm();
      setNotice("Your StudyOS display name has been updated!");
    } catch (error) {
      console.error("Saving StudyOS display name:", error);
      setNotice(error.message || "Could not update your display name.");
    } finally {
      setProfileSaving(false);
    }
  }

  // Save appearance and notification preferences to the student's account.
  async function saveSettings(updates) {
    // Apply appearance immediately; the account sync happens in the background.
    if (updates.theme === "light" || updates.theme === "dark") {
      setSettingsTheme(updates.theme);
    }

    if (!authToken) {
      setNotice(
        "Your preference is applied on this device. Sign in to sync settings to your account."
      );
      return;
    }

    setSettingsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Could not save your settings."
        );
      }

      if (localStorage.getItem("studyos_auth_token") !== authToken) {
        return;
      }

      const saved = data.settings;

      if (!saved) {
        throw new Error("The server did not return the saved settings.");
      }

      if (saved.theme === "light" || saved.theme === "dark") {
        setSettingsTheme(saved.theme);
      }

      if (typeof saved.studyRemindersEnabled === "boolean") {
        setStudyRemindersEnabled(saved.studyRemindersEnabled);
      }

      if (typeof saved.taskNotificationsEnabled === "boolean") {
        setTaskNotificationsEnabled(saved.taskNotificationsEnabled);
      }

      if (
        Number.isInteger(saved.dailyGoalMinutes) &&
        saved.dailyGoalMinutes >= 1 &&
        saved.dailyGoalMinutes <= 720
      ) {
        setDailyGoalMinutes(saved.dailyGoalMinutes);
        setGoalDraft(String(saved.dailyGoalMinutes));
        localStorage.setItem(
          "studyos-daily-goal-minutes",
          String(saved.dailyGoalMinutes)
        );
      }

      setSettingsError("");
      haptic.confirm();
      setNotice("Settings saved successfully!");
    } catch (error) {
      console.error("Saving StudyOS settings:", error);
      setNotice(error.message || "Could not save your settings.");
    } finally {
      setSettingsSaving(false);
    }
  }

  const plannerTasksForDay = weeklyPlan.filter((task) => task.day === plannerDay);
  const plannerCompletedCount = weeklyPlan.filter((task) => task.completed).length;
  const plannerCompletionPercent = weeklyPlan.length
    ? Math.round((plannerCompletedCount / weeklyPlan.length) * 100)
    : 0;

  // ---------- Auth screens ----------
  if (authChecking) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <p>Restoring your StudyOS...</p>
        </section>
      </main>
    );
  }

  if (!student && showAuthScreen) {
    const isRegister = authMode === "register";

    // What the owl is doing right now.
    let authMood = "idle";
    if (authLoading) authMood = "loading";
    else if (authError) authMood = "error";
    else if (authFocus === "password") {
      authMood = showAuthPassword ? "peek" : "cover";
    } else if (authFocus === "email" || authFocus === "name") {
      authMood = "email";
    }

    const authBubbles = {
      idle: isRegister ? "Let's get you started!" : "Welcome back! Ready to study?",
      email: "Nice to meet you!",
      cover: "I won't peek, promise!",
      peek: "Okay... just a tiny peek",
      loading: "Hold on a moment...",
      error: "Oops! Let's try again",
    };

    const typedProgress = Math.min(authEmail.length, 28) / 28;

    return (
      <main className="as-page" data-as-theme={settingsTheme}>
        <AuthLeaves />
        <span className="as-orb as-orb-a" aria-hidden="true" />
        <span className="as-orb as-orb-b" aria-hidden="true" />

        <section className="as-shell">
          <div className="as-panel">
            <button
              type="button"
              className="as-back"
              onClick={() => {
                setShowAuthScreen(false);
                setAuthError("");
                setAuthFocus("");
              }}
            >
              <ChevronLeft size={16} className="as-back-icon" aria-hidden="true" />
              Back to home
            </button>

            <div className="as-brand">
              <img className="as-brand-logo" src={STUDYOS_LOGO_SRC} alt="" />
              <span>
                Study<span className="as-brand-accent">OS</span>
              </span>
            </div>

            <h1 className="as-title" key={authMode}>
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="as-sub">
              {isRegister
                ? "Join StudyOS and plan, focus and learn in one place."
                : "Sign in to pick up right where you left off."}
            </p>

            <div
              className="as-tabs"
              role="tablist"
              aria-label="Authentication options"
              data-mode={authMode}
            >
              <span className="as-tab-pill" aria-hidden="true" />
              <button
                type="button"
                role="tab"
                aria-selected={!isRegister}
                className={!isRegister ? "is-active" : ""}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                disabled={authLoading}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isRegister}
                className={isRegister ? "is-active" : ""}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                disabled={authLoading}
              >
                Create account
              </button>
            </div>

            <form className="as-form" key={authMode} onSubmit={handleEmailAuth}>
              {isRegister && (
                <label className="as-field">
                  <span className="as-label">Full name</span>
                  <span className="as-input-wrap">
                    <User size={18} className="as-input-icon" aria-hidden="true" />
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={authName}
                      onChange={(event) => setAuthName(event.target.value)}
                      onFocus={() => setAuthFocus("name")}
                      onBlur={() => setAuthFocus("")}
                      minLength={2}
                      maxLength={100}
                      required
                      disabled={authLoading}
                      placeholder="Enter your name"
                    />
                  </span>
                </label>
              )}

              <label className="as-field">
                <span className="as-label">Email address</span>
                <span className="as-input-wrap">
                  <Mail size={18} className="as-input-icon" aria-hidden="true" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={authEmail}
                    onChange={(event) => {
                      setAuthEmail(event.target.value);
                      if (authError) setAuthError("");
                    }}
                    onFocus={() => setAuthFocus("email")}
                    onBlur={() => setAuthFocus("")}
                    maxLength={254}
                    required
                    disabled={authLoading}
                    placeholder="you@example.com"
                  />
                </span>
              </label>

              <label className="as-field">
                <span className="as-label">Password</span>
                <span className="as-input-wrap">
                  <Lock size={18} className="as-input-icon" aria-hidden="true" />
                  <input
                    type={showAuthPassword ? "text" : "password"}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    value={authPassword}
                    onChange={(event) => {
                      setAuthPassword(event.target.value);
                      if (authError) setAuthError("");
                    }}
                    onFocus={() => setAuthFocus("password")}
                    onBlur={() => setAuthFocus("")}
                    placeholder="Enter your password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="as-eye"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setShowAuthPassword((previous) => !previous)}
                    aria-label={showAuthPassword ? "Hide password" : "Show password"}
                    aria-pressed={showAuthPassword}
                  >
                    {showAuthPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </span>
              </label>

              <button className="as-submit" type="submit" disabled={authLoading}>
                <span className="as-submit-text">
                  {authLoading
                    ? "Please wait..."
                    : isRegister
                      ? "Create account"
                      : "Sign in"}
                </span>
                {authLoading ? (
                  <span className="as-spinner" aria-hidden="true" />
                ) : (
                  <ArrowRight size={18} className="as-submit-arrow" aria-hidden="true" />
                )}
              </button>
            </form>

            <div className="as-divider">
              <span>or continue with</span>
            </div>

            <div className="as-google">
              {Capacitor.getPlatform() === "android" ? (
                <button
                  type="button"
                  className="as-google-native"
                  onClick={handleNativeGoogleSignIn}
                  disabled={authLoading}
                >
                  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                    <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                  </svg>
                  Continue with Google
                </button>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setAuthError("Google sign-in failed. Please try again.");
                  }}
                  text="continue_with"
                  theme={settingsTheme === "dark" ? "filled_black" : "outline"}
                  size="large"
                  shape="pill"
                />
              )}
            </div>

            {authLoading && (
              <p className="as-status" role="status">
                Authenticating securely...
              </p>
            )}

            {authError && (
              <p className="as-error" role="alert">
                {authError}
              </p>
            )}

            <p className="as-switch">
              {isRegister ? "Already have an account? " : "New to StudyOS? "}
              <button
                type="button"
                disabled={authLoading}
                onClick={() => {
                  setAuthMode(isRegister ? "login" : "register");
                  setAuthError("");
                }}
              >
                {isRegister ? "Sign in" : "Register for free"}
              </button>
            </p>
          </div>

          <aside className="as-stage-wrap" aria-label="StudyOS mascot">
            <AuthMascot
              mood={authMood}
              bubble={authBubbles[authMood]}
              typed={typedProgress}
            />
          </aside>
        </section>
      </main>
    );
  }

  // ---------- Public landing page for visitors ----------
  if (!student) {
    return (
      <PublicLanding
        theme={settingsTheme}
        onThemeChange={setSettingsTheme}
        onLogin={() => {
          setAuthMode("login");
          setShowAuthScreen(true);
        }}
        onRegister={() => {
          setAuthMode("register");
          setShowAuthScreen(true);
        }}
      />
    );
  }

  // ---------- Main app ----------
  return (
    <div className="study-app">
      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
  <img
    className="studyos-brand-logo"
    src={STUDYOS_LOGO_SRC}
    alt="StudyOS logo"
  />

  <span>
    Study<span className="brand-accent">OS</span>
  </span>

          <button
            className="icon-button mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
          </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-links">
          <a
            className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
            href="#dashboard"
            onClick={() => {
              setActiveSection("dashboard");
              setMenuOpen(false);
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>

          <a
            className={`nav-link ${activeSection === "tasks" ? "active" : ""}`}
            href="#tasks"
            onClick={() => {
              setActiveSection("tasks");
              setMenuOpen(false);
            }}
          >
            <CalendarDays size={18} />
            <span>My Tasks</span>
            <span className="nav-count">{remainingCount}</span>
          </a>

          <a
            className={`nav-link ${activeSection === "subjects" ? "active" : ""}`}
            href="#subjects"
            onClick={() => {
              setActiveSection("subjects");
              setMenuOpen(false);
            }}
          >
            <BookOpen size={18} />
            <span>Subjects</span>
          </a>

          <a
            className={`nav-link ${activeSection === "focus" ? "active" : ""}`}
            href="#focus"
            onClick={() => {
              setActiveSection("focus");
              setMenuOpen(false);
            }}
          >
            <Target size={18} />
            <span>Focus Room</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a
            className={`nav-link ${activeSection === "settings" ? "active" : ""}`}
            href="#settings"
            onClick={() => {
              setActiveSection("settings");
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </a>

          <button
            type="button"
            className="nav-link logout-link"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>

          <div className="profile">
            <div className="avatar profile-avatar">
              <span className="profile-avatar-initial" aria-hidden="true">
                {(
                  student?.displayName?.trim()?.charAt(0) ||
                  student?.name?.trim()?.charAt(0) ||
                  student?.email?.trim()?.charAt(0) ||
                  "S"
                ).toUpperCase()}
              </span>
              {student?.picture && (
                <img
                  className="profile-avatar-image"
                  src={student.picture}
                  alt={`${student?.name || "Student"} profile`}
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="profile-info">
              <strong title={student?.displayName || student?.name || "Student"}>
                {student?.displayName?.trim() ||
                  student?.name?.trim() ||
                  "Student"}
              </strong>
              <span title={student?.email || "Study workspace"}>
                {student?.email?.trim() || "Study workspace"}
              </span>
            </div>

            <Sparkles size={17} className="profile-sparkle" />
          </div>
        </div>
      </aside>

      <main className={`main-content${activeSection === "settings" ? " settings-page" : ""}`} id="dashboard">
          <nav className={`mobile-top-nav${menuOpen ? " menu-open" : ""}`} aria-label="Main navigation">
            <a className="mobile-navbar-brand" href="#dashboard" aria-label="StudyOS home">
              <img src={STUDYOS_LOGO_SRC} alt="" />
              <span>Study<span className="brand-accent">OS</span></span>
            </a>
            <div className="mobile-navbar-links">
            <a className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`} href="#dashboard" onClick={() => setActiveSection("dashboard")} aria-label="Dashboard" title="Dashboard"><LayoutDashboard size={17} /><span>Dashboard</span></a>
            <a className={`nav-link ${activeSection === "tasks" ? "active" : ""}`} href="#tasks" onClick={() => setActiveSection("tasks")}><CalendarDays size={17} /><span>My Tasks</span><span className="nav-count">{remainingCount}</span></a>
            <a className={`nav-link ${activeSection === "subjects" ? "active" : ""}`} href="#subjects" onClick={() => setActiveSection("subjects")}><BookOpen size={17} /><span>Subjects</span></a>
            <a className={`nav-link ${activeSection === "focus" ? "active" : ""}`} href="#focus" onClick={() => setActiveSection("focus")} aria-label="Focus Room" title="Focus Room"><Target size={17} /><span>Focus Room</span></a>
            </div>
          <div className="topbar-actions">
            <div className={`global-search-wrapper${mobileSearchOpen ? " mobile-search-open" : ""}`} style={{ position: "relative" }}>
              <button
                type="button"
                className="mobile-search-toggle"
                aria-label={mobileSearchOpen ? "Close search" : "Open search"}
                aria-expanded={mobileSearchOpen}
                onClick={() => setMobileSearchOpen((current) => !current)}
              >
                {mobileSearchOpen ? <X size={21} /> : <Search size={21} />}
              </button>
              <label className="search-box">
                <Search size={17} aria-hidden="true" />
                <input
                  value={globalSearch}
                  onChange={(event) => {
                    setGlobalSearch(event.target.value);
                    setGlobalSearchOpen(true);
                  }}
                  onFocus={() => setGlobalSearchOpen(true)}
                  onKeyDown={handleGlobalSearchKeyDown}
                  placeholder="Search everything..."
                  aria-label="Search tasks, notes, subjects, and planner"
                  aria-expanded={globalSearchOpen && Boolean(globalSearchQuery)}
                  aria-controls="global-search-results"
                  autoComplete="off"
                />
                {globalSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalSearch("");
                      setGlobalSearchOpen(false);
                    }}
                    aria-label="Clear global search"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>

              {globalSearchOpen && globalSearchQuery && (
                <div
                  id="global-search-results"
                  className="global-search-results"
                  role="listbox"
                  aria-label="Search results"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "min(380px, 88vw)",
                    maxHeight: "min(420px, 65vh)",
                    overflowY: "auto",
                    zIndex: 1000,
                    padding: "8px",
                    borderRadius: "14px",
                    background: "var(--panel, #171525)",
                    border: "1px solid var(--border, rgba(255,255,255,.12))",
                    boxShadow: "0 18px 45px rgba(0,0,0,.28)",
                  }}
                >
                  {globalSearchResults.length ? (
                    globalSearchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        role="option"
                        aria-selected="false"
                        className="global-search-result"
                        onClick={() => {
                          result.onSelect();
                          setGlobalSearchOpen(false);
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "4px",
                          width: "100%",
                          padding: "11px 12px",
                          border: 0,
                          borderRadius: "9px",
                          background: "transparent",
                          color: "inherit",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", opacity: .72, flexShrink: 0 }}>
                            {result.type}
                          </span>
                          <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {result.title}
                          </strong>
                        </span>
                        <span style={{ fontSize: "12px", opacity: .72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                          {result.detail}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: "18px 12px", textAlign: "center" }}>
                      <strong>No results found</strong>
                      <p style={{ margin: "5px 0 0", fontSize: "12px", opacity: .72 }}>
                        Try another task, note, subject, or planner keyword.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="notification-wrapper">
              <button
                type="button"
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                aria-controls="notification-panel"
                disabled={!taskNotificationsEnabled}
                onClick={() => setShowNotifications((current) => !current)}
                title={
                  taskNotificationsEnabled
                    ? "Notifications"
                    : "Task notifications are turned off in Settings"
                }
              >
                <Bell size={19} />
                {taskNotificationsEnabled && (
                  <span className="notification-dot" />
                )}
              </button>

              {showNotifications && taskNotificationsEnabled && (
                <div
                  className="notification-popover"
                  id="notification-panel"
                  role="status"
                >
                  <div className="notification-heading">
                    <strong>Task Notifications</strong>

                    <button
                      type="button"
                      className="notification-close"
                      aria-label="Cancel and close notifications"
                      title="Cancel"
                      onClick={() => setShowNotifications(false)}
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>

                  <p>
                    {remainingCount > 0
                      ? `You have ${remainingCount} unfinished ${remainingCount === 1 ? "task" : "tasks"
                      }. Keep going!`
                      : "You're all caught up. Great work!"}
                  </p>

                  <button
                    type="button"
                    className="text-button notification-view-tasks"
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveSection("tasks");

                      document.getElementById("tasks")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  >
                    View tasks →
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-button mobile-nav-hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              title="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="topbar-account-controls" aria-label="Account actions">
              <button
                type="button"
                className="icon-button topbar-settings-link"
                aria-label="Settings"
                title="Settings"
                onClick={() => {
                  setActiveSection("settings");
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Settings size={19} />
              </button>
              <button
                type="button"
                className="icon-button topbar-account-link"
                aria-label="Sign out"
                title="Sign out"
                onClick={handleLogout}
              >
                <LogOut size={19} />
              </button>
            </div>
          </div>
          
          </nav>

        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="breadcrumb">
                Workspace <ChevronRight size={13} /> {activeSection === "settings" ? "Settings" : "Dashboard"}
              </div>

              <h1>
                {activeSection === "settings"
                  ? "Settings"
                  : <>Good day, {getGreetingName(student)}</>}
              </h1>

              <p className="subtitle">
                {activeSection === "settings"
                  ? "Personalize your StudyOS experience."
                  : "A little progress every day adds up."}
              </p>
            </div>
          </div>
        </header>

        <div className="dashboard-page-content" hidden={activeSection === "settings"}>
        <section className="welcome-banner">
          <span className="wb-grid" aria-hidden="true" />
          <span className="wb-aurora wb-aurora-a" aria-hidden="true" />
          <span className="wb-aurora wb-aurora-b" aria-hidden="true" />

          <div className="welcome-copy">
            <span className="eyebrow">
              <Sparkles size={14} /> YOUR LEARNING JOURNEY
            </span>

            <h2 className="wb-title" aria-label="Make today count.">
              {["Make", "today", "count."].map((word, wordIndex) => (
                <span className="wb-word" key={word} aria-hidden="true">
                  {word.split("").map((letter, letterIndex) => (
                    <span
                      className="wb-ch"
                      key={`${word}-${letterIndex}`}
                      style={{ "--i": wordIndex * 6 + letterIndex }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              ))}
            </h2>

            <p className="wb-ticker" aria-hidden="true">
              Study
              <span className="wb-slot">
                <i>smarter</i>
                <i>calmer</i>
                <i>longer</i>
                <i>smarter</i>
              </span>
            </p>

            <p>Focus on what matters. You are making progress, one task at a time.</p>

            <a href="#tasks" className="primary-link">
              View my tasks <ChevronRight size={16} />
            </a>
          </div>

          <BannerScene
            done={completedCount}
            total={tasks.length}
            streak={studyStreak}
            minutes={weeklyFocusMinutes}
            goalPercent={dailyGoalPercent}
          />
        </section>

        <section className="stats-grid" aria-label="Study statistics">
          <article className="stat-card">
            <div className="stat-top">
              <span className="stat-icon green">
                <Check size={19} />
              </span>
              <span className="stat-tag">TASKS</span>
            </div>

            <div className="stat-value">
              <CountUp value={completedCount} />
              <span> / {tasks.length}</span>
            </div>

            <p>Tasks completed</p>

            <div className="mini-progress">
              <span style={{ width: `${completionPercent}%` }} />
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span className="stat-icon orange">
                <StreakFlame streak={studyStreak} size={30} />
              </span>
              <span className="stat-tag">CONSISTENCY</span>
            </div>

            <div className="stat-value">
              <CountUp value={studyStreak} /> <span>days</span>
            </div>

            <p>Study streak</p>

            <div className="stat-foot">Keep your momentum going!</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span className="stat-icon blue">
                <Clock3 size={19} />
              </span>
              <span className="stat-tag">FOCUS</span>
            </div>

            <div className="stat-value">
              <CountUp value={weeklyFocusMinutes / 60} decimals={1} /> <span>hrs</span>
            </div>

            <p>Focus time this week</p>

            <div className="stat-foot">Your study time summary</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span className="stat-icon purple">
                <BookOpen size={19} />
              </span>
              <span className="stat-tag">LEARNING</span>
            </div>

            <div className="stat-value">
              <CountUp value={subjects.length} />
            </div>

            <p>Subjects in progress</p>

            <div className="stat-foot">Keep exploring new ideas</div>
          </article>
        </section>

        <section
          className="goals-grid"
          id="daily-goals"
          aria-label="Daily study goals and streaks"
        >
          <article className="panel daily-goal-panel">
            <div className="panel-heading">
              <div>
                <h2>Daily Study Goal</h2>
                <p>Small, consistent sessions add up.</p>
              </div>
              <span className="goal-flame">
                <StreakFlame streak={studyStreak} size={30} />
              </span>
            </div>

            <div className="goal-progress-row">
              <div
                className="goal-ring"
                style={{ "--goal-progress": `${dailyGoalPercent}%` }}
              >
                <div className="goal-ring-inner">
                  <strong>
                    <CountUp value={dailyGoalPercent} />%
                  </strong>
                  <span>today</span>
                </div>
              </div>

              <div className="goal-copy">
                <strong>
                  {todayFocusMinutes} <span>of {dailyGoalMinutes} min</span>
                </strong>
                <p>
                  {todayFocusMinutes >= dailyGoalMinutes
                    ? "Daily goal achieved. Great work!"
                    : `${Math.max(
                      0,
                      dailyGoalMinutes - todayFocusMinutes
                    )} minutes to reach your goal`}
                </p>
              </div>
            </div>

            <div className="goal-progress-track">
              <span style={{ width: `${dailyGoalPercent}%` }} />
            </div>

            <form className="goal-setting-form" onSubmit={saveDailyGoal}>
              <label htmlFor="dailyGoalMinutes">Daily target (minutes)</label>
              <input
                id="dailyGoalMinutes"
                type="number"
                min="1"
                max="720"
                value={goalDraft}
                onChange={(event) => setGoalDraft(event.target.value)}
              />
              <button
                className="add-task-button"
                type="submit"
                disabled={goalSaving || dailyGoalLoading}
              >
                {dailyGoalLoading
                  ? "Loading goal..."
                  : goalSaving
                    ? "Saving..."
                    : "Save goal"}
              </button>
            </form>

            <div className={`streak-strip streak-hero${studyStreak > 0 ? " is-lit" : ""}`}>
              <button
                type="button"
                className="streak-calendar-button"
                onClick={() => setStreakCalendarOpen(true)}
                aria-label="Open streak calendar"
                title="Streak calendar"
              >
                <CalendarDays size={18} />
              </button>
              <StreakFlame streak={studyStreak} size={72} rich />
              <div className="streak-body">
                <strong>
                  <CountUp value={studyStreak} />-day study streak
                </strong>
                <span>
                  {studyStreak > 0
                    ? "You've studied on consecutive days!"
                    : "Finish a focus session today to start your streak."}
                </span>
                <div className="streak-week" aria-label="Study activity for the last seven days">
                  {weeklyActivity.map((day, index) => (
                    <span
                      key={day.dateKey}
                      className={`streak-day${day.minutes > 0 ? " is-done" : ""}${day.isToday ? " is-today" : ""}`}
                      style={{ "--i": index }}
                    >
                      <i>{day.minutes > 0 && <Flame size={13} strokeWidth={2.4} />}</i>
                      <em>{String(day.label).slice(0, 3)}</em>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="panel planner-summary-panel">
            <div className="panel-heading">
              <div>
                <h2>Weekly Plan Progress</h2>
                <p>Keep your week moving forward.</p>
              </div>
              <span className="planner-summary-icon">
                <CalendarDays size={19} />
              </span>
            </div>

            <div className="planner-total-row">
              <strong>
                {plannerCompletedCount}
                <span> / {weeklyPlan.length}</span>
              </strong>
              <span>planned tasks done</span>
            </div>

            <div className="goal-progress-track">
              <span style={{ width: `${plannerCompletionPercent}%` }} />
            </div>

            <p className="planner-progress-note">
              {plannerCompletionPercent}% of your planned tasks completed
            </p>

            <a className="primary-link" href="#weekly-planner">
              Open weekly planner <ChevronRight size={16} />
            </a>
          </article>
        </section>

        <section
          className="panel weekly-planner-panel"
          id="weekly-planner"
          aria-label="Weekly study planner"
        >
          <div className="panel-heading planner-heading">
            <div>
              <h2>Weekly Study Planner</h2>
              <p>Organize subjects, assignments, deadlines, and completion status.</p>
            </div>
            <span className="analytics-period">
              {weeklyPlan.length} TASK{weeklyPlan.length === 1 ? "" : "S"}
            </span>
          </div>

          <div className="planner-day-tabs" role="tablist" aria-label="Choose a day">
            {plannerDays.map((day) => {
              const dayCount = weeklyPlan.filter(
                (task) => task.day === day && !task.completed
              ).length;
              return (
                <button
                  key={day}
                  type="button"
                  role="tab"
                  aria-selected={plannerDay === day}
                  className={`planner-day-tab ${plannerDay === day ? "selected" : ""
                    }`}
                  onClick={() => setPlannerDay(day)}
                >
                  <span>{day.slice(0, 3)}</span>
                  <small>{dayCount}</small>
                </button>
              );
            })}
          </div>

          <form className="planner-add-form" onSubmit={addPlannerTask}>
            <label className="planner-field planner-task-field">
              <span>Study task</span>
              <input
                value={plannerTitle}
                onChange={(event) => setPlannerTitle(event.target.value)}
                placeholder="e.g. Revise chapter 4"
                maxLength={120}
                required
              />
            </label>

            <label className="planner-field">
              <span>Subject</span>
              <input
                list="studyos-subject-suggestions"
                value={plannerSubject}
                onChange={(event) => setPlannerSubject(event.target.value)}
                placeholder="e.g. Islamiat"
                maxLength={60}
              />
            </label>

            <label className="planner-field">
              <span>Day</span>
              <select
                value={plannerDay}
                onChange={(event) => setPlannerDay(event.target.value)}
              >
                {plannerDays.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
            </label>

            <label className="planner-field">
              <span>Deadline</span>
              <input
                type="date"
                value={plannerDeadline}
                onChange={(event) => setPlannerDeadline(event.target.value)}
              />
            </label>

            <button className="add-task-button planner-submit" type="submit">
              <Plus size={17} /> Add task
            </button>
          </form>

          <div className="planner-task-list">
            {plannerLoading ? (
              <div className="planner-empty" role="status">
                <RefreshCw size={24} />
                <strong>Loading your weekly planner...</strong>
                <span>Retrieving your saved tasks from your account.</span>
              </div>
            ) : plannerError ? (
              <div className="data-load-error" role="alert">
                <span>{plannerError}</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={retryDataLoads}
                >
                  Retry
                </button>
              </div>
            ) : plannerTasksForDay.length === 0 ? (
              <div className="planner-empty">
                <CalendarDays size={24} />
                <strong>No tasks planned for {plannerDay}</strong>
                <span>Add a study task above to organize this day.</span>
              </div>
            ) : (
              plannerTasksForDay.map((task) => {
                const overdue =
                  task.deadline &&
                  task.deadline < getLocalDateKey(new Date()) &&
                  !task.completed;
                return (
                  <article
                    className={`planner-task-row ${
                      task.completed ? "planner-task-completed" : ""
                    }`}
                    key={task.id}
                  >
                    <button
                      type="button"
                      className={`task-check ${task.completed ? "checked" : ""}`}
                      onClick={() => togglePlannerTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Mark ${task.title} incomplete`
                          : `Mark ${task.title} complete`
                      }
                    >
                      {task.completed && <Check size={14} />}
                    </button>

                    <div className="planner-task-main">
                      <strong>{task.title}</strong>
                      <span>
                        <BookOpen size={12} /> {task.subject}
                      </span>
                    </div>

                    <div className={`planner-deadline ${overdue ? "overdue" : ""}`}>
                      {task.deadline ? (
                        <>
                          <span className="planner-due-date">
                            <Clock3 size={12} />
                            {overdue ? "Overdue · " : "Due "}
                            {new Date(`${task.deadline}T00:00:00`).toLocaleDateString(
                              [],
                              { month: "short", day: "numeric" }
                            )}
                          </span>

                          <button
                            type="button"
                            className="task-delete"
                            onClick={() => deletePlannerTask(task.id)}
                            aria-label={`Delete ${task.title}`}
                            title="Delete planned task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span>No deadline</span>

      <button
        type="button"
        className="task-delete"
        onClick={() => deletePlannerTask(task.id)}
        aria-label={`Delete ${task.title}`}
        title="Delete planned task"
      >
        <Trash2 size={15} />
      </button>
    </>
  )}
</div>
                  </article>
                );
              })
            )}
          </div>

          <p className="analytics-note">
            Your weekly planner tasks are saved to your StudyOS account. Your
            daily study goal is saved to your StudyOS account.
          </p>
        </section>

        <section
          className="panel analytics-panel"
          id="analytics"
          aria-label="Study analytics"
        >
          <div className="panel-heading analytics-heading">
            <div>
              <h2>Study Analytics</h2>
              <p>Your focus activity over the last seven days.</p>
            </div>
            <span className="analytics-period">LAST 7 DAYS</span>
          </div>

          <div className="analytics-summary">
            <div className="analytics-metric">
              <span className="analytics-metric-icon">
                <Clock3 size={17} />
              </span>
              <div>
                <strong>{weeklyFocusMinutes} min</strong>
                <span>Weekly focus time</span>
              </div>
            </div>

            <div className="analytics-metric">
              <span className="analytics-metric-icon">
                <Check size={17} />
              </span>
              <div>
                <strong>{weeklySessionCount}</strong>
                <span>Weekly sessions</span>
              </div>
            </div>

            <div className="analytics-metric">
              <span className="analytics-metric-icon">
                <Target size={17} />
              </span>
              <div>
                <strong>{averageSessionMinutes} min</strong>
                <span>Weekly average session</span>
              </div>
            </div>
          </div>

          <div
            className="wc-chart"
            role="img"
            aria-label="Daily focus minutes over the last seven days"
          >
            <div className="wc-lines" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className="wc-cols">
              {weeklyActivity.map((day, index) => {
                const heightPercent =
                  day.minutes === 0
                    ? 0
                    : Math.max(12, Math.round((day.minutes / maxDailyMinutes) * 100));
                const isBest =
                  hasWeeklyActivity && day.dateKey === mostProductiveDay.dateKey;

                return (
                  <div
                    className={`wc-col${day.isToday ? " is-today" : ""}${
                      isBest ? " is-best" : ""
                    }${day.minutes === 0 ? " is-empty" : ""}`}
                    key={day.dateKey}
                    style={{ "--i": index }}
                    tabIndex={0}
                  >
                    <span className="wc-tip">
                      {day.minutes > 0 ? `${day.minutes} min` : "No focus"}
                    </span>

                    <div className="wc-track">
                      {day.minutes === 0 ? (
                        <span className="wc-dot" />
                      ) : (
                        <span
                          className="wc-bar"
                          style={{ "--h": `${heightPercent}%` }}
                        >
                          {isBest && (
                            <Flame className="wc-crown" size={17} strokeWidth={2.4} />
                          )}
                          <em className="wc-val">{day.minutes}m</em>
                        </span>
                      )}
                    </div>

                    <span className="wc-label">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="analytics-summary">
            <div className="analytics-metric">
              <span className="analytics-metric-icon">
                <Flame size={17} />
              </span>
              <div>
                <strong>
                  {hasWeeklyActivity ? mostProductiveDay.label : "No activity"}
                </strong>
                <span>
                  {hasWeeklyActivity
                    ? `${mostProductiveDay.minutes} minutes · Most productive day`
                    : "Complete a focus session to begin"}
                </span>
              </div>
            </div>

            <div className="analytics-metric">
              <span className="analytics-metric-icon">
                <BookOpen size={17} />
              </span>
              <div>
                <strong>{(totalFocusMinutes / 60).toFixed(1)} hrs</strong>
                <span>All-time focus hours</span>
              </div>
            </div>
          </div>

          <p className="analytics-note">
            Weekly statistics cover the last seven calendar days, including
            today. All-time focus hours use the completed sessions available in
            your StudyOS account. Paused or reset sessions are not counted.
          </p>
        </section>

        <div className="dashboard-grid">
          <section className="panel tasks-panel" id="tasks">
            <div className="panel-heading">
              <div>
                <div className="panel-title-row">
                  <h2>My Tasks</h2>
                  <span className="pill-count">{remainingCount} left</span>
                </div>

                <p>Your next steps, all in one place.</p>
              </div>

              <button
                className="text-button"
                onClick={clearCompleted}
                disabled={completedCount === 0}
              >
                Clear completed
              </button>
            </div>

            <form className="task-add-form" onSubmit={addTask}>
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="What do you need to study?"
                aria-label="New task title"
                maxLength={120}
              />

              <input
                className="task-subject-input"
                list="studyos-subject-suggestions"
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                aria-label="Task subject"
                placeholder="Subject (e.g. Islamiat)"
                maxLength={60}
              />

              <input
                className="task-duration-input"
                type="number"
                min="1"
                max="720"
                step="1"
                value={newTaskDuration}
                onChange={(event) => setNewTaskDuration(event.target.value)}
                aria-label="Task duration in minutes"
                title="Choose how many minutes you want to spend on this task (1–720)"
                placeholder="Minutes"
                required
              />

              <datalist id="studyos-subject-suggestions">
                {subjectSuggestions.map((subjectName) => (
                  <option key={subjectName} value={subjectName} />
                ))}
              </datalist>

              <button className="add-task-button" type="submit" aria-label="Add task">
                <Plus size={19} />
                <span>Add</span>
              </button>
            </form>

            {notice && (
              <p className="task-notice" role="status">
                {notice}
              </p>
            )}

            
{deletedTasks.length > 0 && (
  <button
    type="button"
    onClick={undoDeleteTask}
    disabled={undoLoading}
    className="undo-task-button"
  >
    {undoLoading ? "Restoring..." : "↶ Undo"}
  </button>
)}


            <div className="task-list">
              {tasksLoading ? (
                <p role="status">Loading your tasks...</p>
              ) : tasksError ? (
                <div className="data-load-error" role="alert">
                  <span>{tasksError}</span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={retryDataLoads}
                  >
                    Retry
                  </button>
                </div>
              ) : visibleTasks.length === 0 ? (
                <div className="empty-tasks">
                  <div className="empty-icon">
                    <Check size={23} />
                  </div>

                  <strong>
                    {search ? "No matching tasks" : "You're all caught up!"}
                  </strong>

                  <p>
                    {search
                      ? "Try a different search."
                      : "Add a task above whenever you're ready."}
                  </p>
                </div>
              ) : (
                visibleTasks.map((task) => (
                  <article
                    className={`task-row ${task.completed ? "task-completed" : ""}`}
                    key={task.id}
                  >
                    <button
                      type="button"
                      className={`task-check ${task.completed ? "checked" : ""}`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Mark ${task.title} incomplete`
                          : `Mark ${task.title} complete`
                      }
                      title={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed && <Check size={14} />}
                    </button>

                    <div className="task-main">
                      <span className="task-title">{task.title}</span>

                      <span className="task-meta">
                        <SubjectBadge name={task.subject || "Personal"} mini /> {task.subject || "Personal"}
                        <span className="meta-dot">·</span>
                        <Clock3 size={12} /> {task.time || "Anytime"}
                      </span>
                    </div>

                    <span
                      className={`task-status ${task.completed ? "status-done" : ""}`}
                    >
                      {task.completed ? "Done" : "To do"}
                    </span>

                    <button
                      type="button"
                      className="task-delete"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))
              )}
            </div>

            <div className="task-summary">
              <span>
                {completedCount} of {tasks.length} tasks completed
              </span>
              <span>{completionPercent}%</span>
            </div>

            <div className="task-progress">
              <span style={{ width: `${completionPercent}%` }} />
            </div>
          </section>

          {/* Editable Focus Room timer */}
          <section className="panel focus-panel" id="focus">
            <div className="panel-heading">
              <div>
                <h2>Focus Room</h2>
                <p>Make space for deep work.</p>
              </div>

              <span className={`focus-live ${isRunning ? "focus-active" : ""}`}>
                <span />
                {isRunning ? "FOCUSING" : sessionCompleted ? "COMPLETED" : "READY"}
              </span>
            </div>

            <div className="timer-duration-setting">
              <label htmlFor="focusDuration">Session length</label>

              <div className="timer-duration-input">
                <input
                  id="focusDuration"
                  type="number"
                  min="1"
                  max="180"
                  step="1"
                  value={durationMinutes}
                  disabled={isRunning}
                  onChange={changeDuration}
                  aria-label="Focus session length in minutes"
                />

                <span>minutes</span>
              </div>

              <p>Choose between 1 and 180 minutes.</p>
            </div>

            <div className="fr-presets" role="group" aria-label="Quick session lengths">
              {[5, 15, 25, 45, 60, 90].map((minutes) => (
                <button
                  type="button"
                  key={minutes}
                  className={`fr-preset${durationMinutes === minutes ? " is-active" : ""}`}
                  onClick={() => applyPreset(minutes)}
                  disabled={isRunning}
                >
                  {minutes}m
                </button>
              ))}
            </div>

            <div
              className={`focus-visual fr-stage${isRunning ? " is-running" : ""}${
                sessionCompleted ? " is-complete" : ""
              }`}
            >
              <span className="fr-orbit" aria-hidden="true" />
              <span className="fr-orbit fr-orbit-two" aria-hidden="true" />
              <span className="fr-wave" aria-hidden="true" />
              <span className="fr-wave fr-wave-two" aria-hidden="true" />
              <span className="fr-wave fr-wave-three" aria-hidden="true" />
              {[0, 1, 2, 3, 4, 5].map((spark) => (
                <i
                  key={spark}
                  className="fr-spark"
                  style={{ "--k": spark }}
                  aria-hidden="true"
                />
              ))}
              {sessionCompleted && (
                <div className="fr-confetti" aria-hidden="true">
                  {Array.from({ length: 14 }, (_, index) => (
                    <i key={index} style={{ "--a": `${index * (360 / 14)}deg`, "--d": `${(index % 4) * 0.06}s` }} />
                  ))}
                </div>
              )}
              <div
                className={`focus-ring${isRunning ? " is-running" : ""}${sessionCompleted ? " is-complete" : ""}`}
                style={{ "--timer-progress": `${timerProgress}%` }}
                role="timer"
                aria-label={`${timerMinutes} minutes and ${timerSeconds} seconds remaining`}
              >
                <div className="focus-inner">
                  <span className="focus-emoji">
                    {sessionCompleted ? <Check size={23} /> : <Target size={21} />}
                  </span>

                  <strong>
                    {timerMinutes}<i className="fr-colon">:</i>{timerSeconds}
                  </strong>

                  <span>{sessionCompleted ? "COMPLETE" : "TIME LEFT"}</span>
                </div>
              </div>
            </div>

            <p className="focus-caption" aria-live="polite">
              {sessionCompleted
                ? "Amazing work! Your focus session is complete."
                : isRunning
                  ? "Stay focused. You're doing great!"
                  : secondsLeft < totalSeconds
                    ? "Resume whenever you're ready."
                    : "One thing at a time. You've got this."}
            </p>

            <div className="focus-controls">
              {isRunning ? (
                <button
                  type="button"
                  className="focus-start-button"
                  onClick={pauseTimer}
                >
                  <Pause size={16} /> Pause session
                </button>
              ) : (
                <button
                  type="button"
                  className="focus-start-button"
                  onClick={startTimer}
                >
                  <Play size={16} fill="currentColor" />
                  {sessionCompleted
                    ? "Start another session"
                    : secondsLeft < totalSeconds
                      ? "Resume session"
                      : "Start focus session"}
                </button>
              )}

              <button
                type="button"
                className="focus-reset-button"
                onClick={resetTimer}
                title="Reset timer to selected duration"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div className="focus-duration">
              <Clock3 size={14} />
              <span>Custom Timer session · {durationMinutes} minutes</span>
            </div>
          </section>

          <section className="panel session-history-panel" id="focus-history">
            <div className="panel-heading">
              <div>
                <h2>Focus Session History</h2>
                <p>Your completed focus sessions, saved to your StudyOS account.</p>
              </div>
              <span className="session-history-count">
                {totalFocusSessionCount}
              </span>
            </div>

            {!focusSessionsLoading && focusSessions.length > 0 && (
              <div className="fh-stats">
                <div className="fh-stat">
                  <span className="fh-stat-icon"><Check size={16} /></span>
                  <strong><CountUp value={totalFocusSessionCount} /></strong>
                  <small>Sessions</small>
                </div>
                <div className="fh-stat">
                  <span className="fh-stat-icon"><Clock3 size={16} /></span>
                  <strong><CountUp value={totalFocusMinutes / 60} decimals={1} /></strong>
                  <small>Hours focused</small>
                </div>
                <div className="fh-stat">
                  <span className="fh-stat-icon"><Flame size={16} /></span>
                  <strong><CountUp value={longestSessionMinutes} /></strong>
                  <small>Longest (min)</small>
                </div>
              </div>
            )}

            {focusSessionsLoading ? (
              <div className="session-history-empty" role="status">
                <RefreshCw size={21} />
                <strong>Loading your focus history...</strong>
                <p>Retrieving your saved sessions from your account.</p>
              </div>
            ) : focusSessionsError && focusSessions.length === 0 ? (
              <div className="data-load-error" role="alert">
                <span>{focusSessionsError}</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={retryDataLoads}
                >
                  Retry
                </button>
              </div>
            ) : focusSessions.length === 0 ? (
              <div className="session-history-empty">
                <Clock3 size={21} />
                <strong>No completed sessions yet</strong>
                <p>When your focus timer reaches zero, your session will appear here.</p>
              </div>
            ) : (
              <>
                <div className="session-history-list">
                  {focusSessions.map((session, index) => (
                    <article
                      className="session-history-row"
                      key={session.id}
                      style={{ "--i": Math.min(index, 14) }}
                    >
                      <div className="session-history-icon">
                        <Check size={16} />
                      </div>

                      <div className="session-history-details">
                        <strong>
                          {session.durationMinutes} minute focus session
                        </strong>

                        <span>
                          {new Date(session.completedAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>

                        <div className="fh-bar" aria-hidden="true">
                          <i
                            style={{
                              "--w": `${Math.max(
                                6,
                                Math.round(
                                  ((Number(session.durationMinutes) || 0) /
                                    Math.max(1, longestSessionMinutes)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="fh-side">
                        <span className="fh-day">{describeSessionDay(session.completedAt)}</span>
                        <span className="session-history-status">Completed</span>
                      </div>
                    </article>
                  ))}
                </div>
                {focusSessionsError && (
                  <div className="data-load-error" role="alert">
                    <span>{focusSessionsError}</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={loadMoreFocusSessions}
                      disabled={focusSessionsLoadingMore}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {focusSessionsHasMore && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={loadMoreFocusSessions}
                    disabled={focusSessionsLoadingMore}
                  >
                    {focusSessionsLoadingMore
                      ? "Loading older sessions..."
                      : "Load older sessions"}
                  </button>
                )}
              </>
            )}
          </section>

          <section className="panel notebook-panel" id="notebook">
            <div className="panel-heading">
              <div>
                <h2>Notebook</h2>
                <p>Search and manage your saved notes.</p>
              </div>
              <span className="notes-count">
                <FileText size={16} />
                {subjectNotes.length} {subjectNotes.length === 1 ? "NOTE" : "NOTES"}
              </span>
            </div>
            <div className="notes-library">


              <div className="notes-toolbar">
                <label className="notes-search">
                  <Search size={16} />
                  <input
                    type="search"
                    value={noteSearch}
                    onChange={(event) => setNoteSearch(event.target.value)}
                    placeholder="Search titles and content..."
                    aria-label="Search subject notes"
                  />
                </label>

                <select
                  className="notes-filter"
                  value={noteFilter}
                  onChange={(event) => setNoteFilter(event.target.value)}
                  aria-label="Filter notes by subject"
                >
                  <option>All Subjects</option>
                  {subjectSuggestions.map((subjectName) => (
                    <option key={subjectName}>{subjectName}</option>
                  ))}
                </select>
              </div>

              {notesLoading ? (
                <div className="notes-empty" role="status">
                  <span className="notes-empty-icon">
                    <RefreshCw size={25} />
                  </span>
                  <strong>Loading your notes...</strong>
                  <p>Your saved notes are being loaded from your account.</p>
                </div>
              ) : notesError ? (
                <div className="data-load-error" role="alert">
                  <span>{notesError}</span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={retryDataLoads}
                  >
                    Retry
                  </button>
                </div>
              ) : visibleNotes.length === 0 ? (
                <div className="notes-empty">
                  <span className="notes-empty-icon">
                    <FileText size={25} />
                  </span>

                  <strong>
                    {subjectNotes.length === 0
                      ? "Your notebook is ready"
                      : "No matching notes found"}
                  </strong>

                  <p>
                    {subjectNotes.length === 0
                      ? "Create your first note using the form above."
                      : "Try another search or choose a different subject."}
                  </p>
                </div>
              ) : (
                <div className="notes-list">
                  {visibleNotes.map((note, noteIndex) => (
                    <article
                      className="note-card"
                      key={note.id}
                      style={{
                        "--nh": getSubjectHue(note.subject),
                        "--i": Math.min(noteIndex, 12),
                      }}
                    >
                      <div className="note-card-top">
                        <span className="note-subject-tag">
                          <SubjectBadge name={note.subject} mini /> {note.subject}
                        </span>

                        <div className="note-card-actions">
                          <button
                            type="button"
                            className="note-action-button"
                            onClick={() => editSubjectNote(note)}
                            aria-label={`Edit ${note.title}`}
                            title="Edit note"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="note-action-button note-delete-button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete "${note.title}"? This cannot be undone.`
                                )
                              ) {
                                deleteSubjectNote(note.id);
                              }
                            }}
                            aria-label={`Delete ${note.title}`}
                            title="Delete note"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h3>{note.title}</h3>

                      <p className="note-card-content">{note.content}</p>

                      <div className="note-card-footer">
                        <span className="note-words">
                          {note.content.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        <Clock3 size={13} />
                        <span>
                          Updated{" "}
                          {new Date(
                            note.updatedAt || note.createdAt || Date.now()
                          ).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="panel subjects-panel" id="subjects">
            <div className="panel-heading">
              <div>
                <h2>My Subjects</h2>
                <p>Subjects appear here when you use them in Tasks. Select any subject to remove it from this list.</p>
              </div>

              <button
                type="button"
                className="icon-button small-icon"
                aria-label={subjectsExpanded ? "Collapse subjects" : "Expand subjects"}
                aria-expanded={subjectsExpanded}
                onClick={() => setSubjectsExpanded((current) => !current)}
              >
                <ChevronRight
                  size={18}
                  style={{
                    transform: subjectsExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 180ms ease",
                  }}
                />
              </button>
            </div>

            {subjectsExpanded && (
              <>
              {activeSubjects.length > 0 && (
                <div className="subjects-actions">
                  <span>{selectedSubjectsForRemoval.length} selected</span>
                  <button
                    type="button"
                    className="subject-remove-button"
                    onClick={removeSelectedSubjectsFromList}
                    disabled={selectedSubjectsForRemoval.length === 0}
                  >
                    <Trash2 size={15} /> Remove selected
                  </button>
                </div>
              )}
              <div className="subjects-list">
                {activeSubjects.map((subject) => {
                  // Progress is based on Tasks section items only.
                  const subjectTasks = tasks.filter(
                    (task) =>
                      (task.subject || "Personal").trim().toLowerCase() ===
                      subject.name.toLowerCase()
                  );
                  const allSubjectTasks = subjectTasks;
                  const completedSubjectTasks = allSubjectTasks.filter(
                    (task) => task.completed
                  ).length;
                  const totalSubjectTasks = allSubjectTasks.length;
                  const subjectProgress =
                    totalSubjectTasks > 0
                      ? Math.round((completedSubjectTasks / totalSubjectTasks) * 100)
                      : 0;
                  const subjectNotesCount = subjectNotes.filter(
                    (note) =>
                      (note.subject || "Personal").trim().toLowerCase() ===
                      subject.name.toLowerCase()
                  ).length;
                  const progressLevel =
                    subjectProgress >= 100
                      ? "progress-100"
                      : subjectProgress >= 75
                        ? "progress-75"
                        : subjectProgress >= 50
                          ? "progress-50"
                          : subjectProgress >= 25
                            ? "progress-25"
                            : "progress-low";

                  return (
                    <article className={`subject-row${selectedSubjectsForRemoval.includes(subject.name) ? " is-selected" : ""}`} key={subject.name}>
                      <label className="subject-select-control">
                        <input
                          type="checkbox"
                          checked={selectedSubjectsForRemoval.includes(subject.name)}
                          onChange={() => toggleSubjectRemoval(subject.name)}
                          aria-label={`Select ${subject.name} for removal`}
                        />
                      </label>
                      <SubjectBadge name={subject.name} />

                      <div className="subject-info">
                        <div className="subject-name-line">
                          <strong>{subject.name}</strong>
                          <span>{subjectProgress}%</span>
                        </div>

                        <p>{subject.detail}</p>

                        <div
                          className={`subject-progress ${subject.color} ${progressLevel}`}
                          role="progressbar"
                          aria-label={`${subject.name} task completion`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={subjectProgress}
                        >
                          <span style={{ width: `${subjectProgress}%` }} />
                        </div>

                        <div className="subject-progress-details">
                          <span>
                            {completedSubjectTasks} of {totalSubjectTasks} tasks complete
                          </span>
                          <span>
                            {subjectNotesCount} {subjectNotesCount === 1 ? "note" : "notes"}
                          </span>
                        </div>

                        {totalSubjectTasks === 0 && (
                          <p className="subject-progress-hint">
                            Add a {subject.name} task to start tracking progress.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
                {activeSubjects.length === 0 && (
                  <p className="subjects-history-empty">No active subjects. Add a subject to a task to show it here.</p>
                )}
              </div>
              </>
            )}

            <section className="subjects-completed" aria-label="Completed subjects history">
              <div className="subjects-completed-heading">
                <div>
                  <h3>Subject Completed</h3>
                  <p>Completed subjects are kept here as history. Removing a subject from My Subjects does not delete its tasks or notes.</p>
                </div>
                <span className="subjects-history-count">{completedSubjects.length}</span>
              </div>
              <div className="subjects-history">
                <h4>Subjects History</h4>
                {completedSubjects.length === 0 ? (
                  <p className="subjects-history-empty">No completed subjects yet. Finish all tasks in a subject and it will appear here.</p>
                ) : (
                  completedSubjects.map((subject) => {
                    const stats = getSubjectTaskStats(subject.name);
                    const notesCount = subjectNotes.filter((note) =>
                      (note.subject || "Personal").trim().toLowerCase() === subject.name.toLowerCase()
                    ).length;
                    return (
                      <article className="subject-history-row" key={`history-${subject.name}`}>
                        <SubjectBadge name={subject.name} />
                        <div className="subject-history-info">
                          <strong>{subject.name}</strong>
                          <span>{stats.completed} of {stats.total} tasks completed · {notesCount} {notesCount === 1 ? "note" : "notes"}</span>
                        </div>
                        <span className="subject-history-status"><Check size={14} /> Completed</span>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <div className="subjects-footer">
              <Sparkles size={15} /> Taking small steps leads to big results.
            </div>
          </section>

          <section className="panel notes-panel" id="subject-notes">
            <div className="panel-heading">
              <div>
                <h2>Subject Notes</h2>
                <p>Write, organize, and revisit what you learn.</p>
              </div>

              <span className="notes-count">
                <FileText size={16} />
                {subjectNotes.length} {subjectNotes.length === 1 ? "NOTE" : "NOTES"}
              </span>
            </div>

            <form
              className="notes-editor"
              id="subject-note-editor"
              onSubmit={saveSubjectNote}
            >
              <div className="notes-form-heading">
                <span className="notes-form-icon">
                  {editingNoteId !== null ? <Pencil size={18} /> : <Plus size={18} />}
                </span>

                <div>
                  <h3>{editingNoteId !== null ? "Edit your note" : "Create a new note"}</h3>
                  <p>
                    {editingNoteId !== null
                      ? "Make your changes and save them."
                      : "Keep important concepts in one place."}
                  </p>
                </div>
              </div>

              <label className="notes-field">
                <span>Note title</span>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
                  placeholder="e.g. Newton's Laws of Motion"
                  maxLength={120}
                  required
                />
              </label>

              <label className="notes-field">
                <span>Subject</span>
                <input
                  list="studyos-subject-suggestions"
                  value={noteSubject}
                  onChange={(event) => setNoteSubject(event.target.value)}
                  placeholder="e.g. Islamiat"
                  maxLength={60}
                />
              </label>

              <label className="notes-field">
                <span>Note content</span>
                <textarea
                  value={noteContent}
                  onChange={(event) => setNoteContent(event.target.value)}
                  placeholder="Write your explanation, definitions, formulas, or revision notes..."
                  rows={6}
                  maxLength={20000}
                  required
                />
              </label>

              <div className="notes-form-actions">
                <button
                  className="add-task-button"
                  type="submit"
                  disabled={noteSaving || notesLoading}
                >
                  {noteSaving ? (
                    <RefreshCw size={16} />
                  ) : editingNoteId !== null ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={17} />
                  )}
                  {noteSaving
                    ? "Saving..."
                    : editingNoteId !== null
                      ? "Update note"
                      : "Save note"}
                </button>

                {editingNoteId !== null && (
                  <button className="text-button" type="button" onClick={cancelNoteEdit}>
                    Cancel editing
                  </button>
                )}
              </div>
            </form>



            <p className="analytics-note">
              Your notes are saved to your StudyOS account and can sync across devices.
            </p>
          </section>

        </div>
        </div>

        {/* The dashboard quote reminder has been removed. Settings reminder preferences remain unchanged. */}

        {activeSection === "settings" && (
          <section
            className="settings-section"
            id="settings"
            aria-labelledby="settings-title"
          >
            <div className="section-heading settings-heading">
              <div>
                <span className="section-kicker">PERSONALIZE STUDYOS</span>
                <h2 id="settings-title">Settings</h2>
                <p>Adjust your study goal, appearance, and notifications.</p>
              </div>
              <span className="settings-heading-icon" aria-hidden="true">
                <Settings size={23} />
              </span>
            </div>

            {settingsLoading && (
              <p className="settings-status" role="status">
                <RefreshCw size={15} /> Loading your saved settings...
              </p>
            )}
            {settingsError && (
              <div className="data-load-error" role="alert">
                <span>{settingsError}</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={retryDataLoads}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="settings-grid">
              <article className="settings-card settings-profile-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Pencil size={19} />
                  </span>
                  <div>
                    <h3>Profile &amp; display name</h3>
                    <p>
                      Choose the name shown in your StudyOS workspace. Your Google
                      account name stays unchanged.
                    </p>
                  </div>
                </div>

                <div className="profile-account-details">
                  <span className="profile-detail-label">Google account name</span>
                  <strong>{student?.name?.trim() || "Not available"}</strong>
                  <span className="profile-detail-label">Google email</span>
                  <span className="profile-account-email">
                    {student?.email?.trim() || "Not available"}
                  </span>
                </div>

                <form className="settings-profile-form" onSubmit={saveDisplayName}>
                  <label htmlFor="settings-display-name">StudyOS display name</label>
                  <input
                    id="settings-display-name"
                    type="text"
                    value={displayNameDraft}
                    onChange={(event) => setDisplayNameDraft(event.target.value)}
                    minLength={2}
                    maxLength={40}
                    autoComplete="nickname"
                    placeholder="Enter your display name"
                    disabled={profileSaving}
                    required
                  />
                  <span className="settings-help-text">
                    Use 2–40 characters. This name appears in your StudyOS sidebar.
                  </span>
                  <button
                    type="submit"
                    className="settings-save-button settings-profile-save"
                    disabled={profileSaving || !authToken}
                  >
                    {profileSaving ? "Saving profile..." : "Save display name"}
                  </button>
                </form>
              </article>

              <article className="settings-card settings-goal-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Target size={19} />
                  </span>
                  <div>
                    <h3>Daily study goal</h3>
                    <p>Choose how many minutes you want to study each day.</p>
                  </div>
                </div>

                <form className="settings-goal-form" onSubmit={saveDailyGoal}>
                  <label htmlFor="settings-daily-goal">Goal (minutes)</label>
                  <div className="settings-goal-controls">
                    <input
                      id="settings-daily-goal"
                      type="number"
                      min="1"
                      max="720"
                      step="1"
                      value={goalDraft}
                      onChange={(event) => setGoalDraft(event.target.value)}
                      disabled={dailyGoalLoading || goalSaving}
                      required
                    />
                    <button
                      type="submit"
                      className="settings-save-button"
                      disabled={dailyGoalLoading || goalSaving}
                    >
                      {goalSaving ? "Saving..." : "Save goal"}
                    </button>
                  </div>
                  <span className="settings-help-text">
                    Enter a whole number from 1 to 720 minutes.
                  </span>
                </form>
              </article>

              <article className="settings-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <h3>Appearance</h3>
                    <p>Choose the look that feels comfortable for studying.</p>
                  </div>
                </div>

                <div
                  className="settings-theme-options"
                  role="group"
                  aria-label="Choose appearance"
                >
                  <button
                    type="button"
                    className={`settings-theme-option ${settingsTheme === "dark" ? "selected" : ""
                      }`}
                    aria-pressed={settingsTheme === "dark"}
                    disabled={settingsLoading || settingsSaving}
                    onClick={() => saveSettings({ theme: "dark" })}
                  >
                    <span className="theme-preview theme-preview-dark" aria-hidden="true" />
                    <span>Dark</span>
                    {settingsTheme === "dark" && <Check size={16} />}
                  </button>

                  <button
                    type="button"
                    className={`settings-theme-option ${settingsTheme === "light" ? "selected" : ""
                      }`}
                    aria-pressed={settingsTheme === "light"}
                    disabled={settingsLoading || settingsSaving}
                    onClick={() => saveSettings({ theme: "light" })}
                  >
                    <span className="theme-preview theme-preview-light" aria-hidden="true" />
                    <span>Light</span>
                    {settingsTheme === "light" && <Check size={16} />}
                  </button>
                </div>
              </article>

              <article className="settings-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <h3>Haptic feedback</h3>
                    <p>Strong vibrations on taps, completed tasks and finished focus sessions.</p>
                  </div>
                </div>

                <div
                  className="settings-theme-options"
                  role="group"
                  aria-label="Haptic feedback"
                >
                  <button
                    type="button"
                    className={`settings-theme-option ${hapticsOn ? "selected" : ""}`}
                    aria-pressed={hapticsOn}
                    onClick={() => {
                      setHapticsEnabled(true);
                      setHapticsOn(true);
                    }}
                  >
                    <span>On</span>
                    {hapticsOn && <Check size={16} />}
                  </button>

                  <button
                    type="button"
                    className={`settings-theme-option ${!hapticsOn ? "selected" : ""}`}
                    aria-pressed={!hapticsOn}
                    onClick={() => {
                      setHapticsEnabled(false);
                      setHapticsOn(false);
                    }}
                  >
                    <span>Off</span>
                    {!hapticsOn && <Check size={16} />}
                  </button>
                </div>
              </article>

              <article className="settings-card settings-reminder-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <h3>A Little Reminder</h3>
                    <p>A little encouragement for your next study session.</p>
                  </div>
                </div>

                <blockquote key={`q-${reminderIndex}`} className="settings-reminder-quote">
                  “{currentReminder.text}”
                </blockquote>
                <p key={`a-${reminderIndex}`} className="settings-reminder-author">{currentReminder.author}</p>
                <div key={`t-${reminderIndex}`} className="settings-reminder-tip">
                  <strong>Study tip</strong>
                  <p>{currentReminder.tip}</p>
                </div>
                <button
                  type="button"
                  className="settings-save-button settings-reminder-next"
                  onClick={nextReminder}
                >
                  <RefreshCw size={15} /> New reminder
                </button>
              </article>

              <article className="settings-card settings-notifications-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Bell size={19} />
                  </span>
                  <div>
                    <h3>Notifications</h3>
                    <p>Choose whether you want notifications about unfinished tasks.</p>
                  </div>
                </div>

                <div className="settings-toggle-row">
                  <div>
                    <strong>Task notifications</strong>
                    <p>Show notifications about unfinished tasks.</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-switch ${taskNotificationsEnabled ? "is-on" : ""}`}
                    role="switch"
                    aria-checked={taskNotificationsEnabled}
                    aria-label="Task notifications"
                    disabled={settingsLoading || settingsSaving}
                    onClick={() =>
                      saveSettings({
                        taskNotificationsEnabled: !taskNotificationsEnabled,
                      })
                    }
                  >
                    <span />
                  </button>
                </div>
              </article>
            </div>

            <p className="settings-footnote">
              <Save size={14} />
              Your preferences are saved to your StudyOS account.
            </p>
          </section>

        )}

        {streakCalendarOpen && (
          <div
            className="streak-modal-overlay"
            role="presentation"
            onClick={() => setStreakCalendarOpen(false)}
          >
            <div
              className="streak-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="streak-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="streak-modal-head">
                <h3 id="streak-modal-title">Streak Calendar</h3>
                <button
                  type="button"
                  className="streak-modal-close"
                  onClick={() => setStreakCalendarOpen(false)}
                  aria-label="Close streak calendar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="streak-modal-summary">
                <StreakFlame streak={studyStreak} size={46} />
                <div>
                  <strong>
                    {studyStreak}-day streak
                  </strong>
                  <span>
                    {calendarStudiedDays} {calendarStudiedDays === 1 ? "day" : "days"} studied in {calendarTitle}
                  </span>
                </div>
              </div>

              <div className="streak-cal">
                <div className="streak-cal-nav">
                  <button
                    type="button"
                    onClick={() => shiftCalendarMonth(-1)}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <strong>{calendarTitle}</strong>
                  <button
                    type="button"
                    onClick={() => shiftCalendarMonth(1)}
                    disabled={isCurrentCalendarMonth}
                    aria-label="Next month"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="streak-cal-weekdays" aria-hidden="true">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>

                <div className="streak-cal-grid" key={`${calendarYear}-${calendarMonthIndex}`}>
                  {calendarCells.map((cell, index) =>
                    cell ? (
                      <span
                        key={cell.key}
                        className={`streak-cal-day${cell.done ? " is-done" : ""}${
                          cell.isToday ? " is-today" : ""
                        }`}
                        style={{ "--i": index }}
                        title={cell.done ? "Focus session completed" : undefined}
                      >
                        {cell.day}
                      </span>
                    ) : (
                      <span key={`blank-${index}`} className="streak-cal-blank" />
                    )
                  )}
                </div>
              </div>

              <p className="streak-cal-note">
                Days with a completed focus session are marked in red.
              </p>
            </div>
          </div>
        )}

        <footer className="app-footer">
          <span>
            <GraduationCap size={16} />
            StudyOS
          </span>

          <span>
            <a href="/privacy.html" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
              Privacy Policy
            </a>
          </span>

          <span>
            © 2026 Abdul Mohtasim. All rights reserved.
            <Sparkles size={13} />
          </span>
        </footer>
      </main>
    </div>
  );
}