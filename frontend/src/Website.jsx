import React, { useEffect, useRef, useState } from "react";
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
  Sun,
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
  Pin,
  Bold,
  Italic,
  List,
  Flag,
  CalendarClock,
  Hash,
  Coffee,
  Trophy,
  TrendingDown,
  Minus,
  TriangleAlert,
} from "lucide-react";
import { STUDYOS_LOGO_SRC } from "./brand";
import "./website.css";

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


// ---------- Dashboard motion helpers ----------

export default PublicLanding;
