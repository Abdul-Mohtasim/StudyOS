import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import {
  FileText,
  Pencil,
  Save,
  LayoutDashboard,
  CalendarDays,
  BookOpen,
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
} from "lucide-react";

import "./App.css";

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const defaultSubjects = [
  { name: "Mathematics", detail: "Your mathematics tasks", color: "purple" },
  { name: "Physics", detail: "Your physics tasks", color: "blue" },
  { name: "English", detail: "Your English tasks", color: "orange" },
];

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

export default function App() {
  // ---------- Authentication ----------
  const [student, setStudent] = useState(null);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ---------- Tasks ----------
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newSubject, setNewSubject] = useState("Personal");
  const [newTaskDuration, setNewTaskDuration] = useState("25");
  const [search, setSearch] = useState("");

  // ---------- Interface ----------
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [subjectsExpanded, setSubjectsExpanded] = useState(true);

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

  // ---------- Effects ----------
  useEffect(() => {
    setDisplayNameDraft(student?.displayName || student?.name || "");
  }, [student?.displayName, student?.name]);

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
              `Your session finished, but saving failed: ${
                error.message || "Unknown error"
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
  async function handleGoogleSuccess(googleResponse) {
    if (!googleResponse?.credential) {
      setAuthError("Google did not return a credential. Please try again.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googleResponse.credential }),
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

  function startTimer() {
    if (focusSessionsLoading) {
      setNotice("Loading your focus history. Please wait a moment.");
      return;
    }

    if (!authToken) {
      setNotice("Please sign in to start a focus session.");
      return;
    }

    if (secondsLeft <= 0 || isRunning) return;

    completionRecordedRef.current = false;
    setSessionCompleted(false);

    setEndTime(Date.now() + secondsLeft * 1000);
    setIsRunning(true);
  }

  function pauseTimer() {
    if (endTime !== null) {
      setSecondsLeft(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    }

    setIsRunning(false);
    setEndTime(null);
  }

  function resetTimer() {
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

  const completionPercent =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const visibleTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  // Subject list: defaults plus any subject the student actually uses.
  const subjects = (() => {
    const byName = new Map();
    defaultSubjects.forEach((subject) =>
      byName.set(subject.name.toLowerCase(), subject)
    );
    const usedNames = [
      ...tasks.map((item) => item.subject),
      ...weeklyPlan.map((item) => item.subject),
      ...subjectNotes.map((item) => item.subject),
    ];
    usedNames.forEach((rawName) => {
      const name = typeof rawName === "string" ? rawName.trim() : "";
      if (!name || name.toLowerCase() === "other") return;
      const key = name.toLowerCase();
      if (!byName.has(key)) {
        const colors = ["blue", "orange", "purple"];
        byName.set(key, {
          name,
          detail: `Your ${name} tasks and notes`,
          color: colors[byName.size % colors.length],
        });
      }
    });
    return Array.from(byName.values()).sort((a, b) => {
      const ai = defaultSubjects.findIndex((s) => s.name === a.name);
      const bi = defaultSubjects.findIndex((s) => s.name === b.name);
      if (ai !== -1 || bi !== -1)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return a.name.localeCompare(b.name);
    });
  })();

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

      setNotice("");
    } catch (error) {
      console.error("Updating StudyOS task:", error);
      setNotice(error.message || "Could not update the task.");
    }
  }

  async function deleteTask(id) {
    if (!authToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the task.");
      }

      setTasks((current) => current.filter((task) => task.id !== id));
      setNotice("Task deleted.");
    } catch (error) {
      console.error("Deleting StudyOS task:", error);
      setNotice(error.message || "Could not delete the task.");
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
        setNotice("Note updated successfully!");
      } else {
        setSubjectNotes((current) => [savedNote, ...current]);
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

  if (!student) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="auth-logo">
            <GraduationCap size={30} />
          </div>

          <h1>Welcome to StudyOS</h1>

          <p className="auth-subtitle">
            Your personal space to plan, focus, and learn.
          </p>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setAuthError("Google sign-in failed. Please try again.");
            }}
            text="continue_with"
            theme="outline"
            size="large"
            shape="pill"
          />

          {authLoading && <p role="status">Signing in...</p>}

          {authError && (
            <p className="auth-error" role="alert">
              {authError}
            </p>
          )}

          <p className="auth-footer">Sign in with your Google account.</p>
        </section>
      </main>
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
          <div className="brand-icon">
            <GraduationCap size={23} />
          </div>

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
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={18} />
            </div>

            <strong>Keep going!</strong>

            <p>Every small step brings you closer to your goals.</p>
          </div>

          <a
            className={`nav-link ${activeSection === "settings" ? "active" : ""}`}
            href="#settings"
            onClick={() => {
              setActiveSection("settings");
              setMenuOpen(false);
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

      <main className="main-content" id="dashboard">
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
                Workspace <ChevronRight size={13} /> Dashboard
              </div>

              <h1>
                Good day,{" "}
                {student?.displayName?.trim()?.split(/\s+/)[0] ||
                  student?.name?.trim()?.split(/\s+/)[0] ||
                  "Student"}
                <span className="wave"> ✦</span>
              </h1>

              <p className="subtitle">A little progress every day adds up.</p>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>

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
                      ? `You have ${remainingCount} unfinished ${
                          remainingCount === 1 ? "task" : "tasks"
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
          </div>
        </header>

        <section className="welcome-banner">
          <div className="welcome-copy">
            <span className="eyebrow">
              <Sparkles size={14} /> YOUR LEARNING JOURNEY
            </span>

            <h2>Make today count.</h2>

            <p>Focus on what matters. You are making progress, one task at a time.</p>

            <a href="#tasks" className="primary-link">
              View my tasks <ChevronRight size={16} />
            </a>
          </div>

          <div className="banner-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-book">
              <BookOpen size={52} strokeWidth={1.3} />
            </div>
            <Sparkles className="art-sparkle sparkle-one" size={24} />
            <Sparkles className="art-sparkle sparkle-two" size={16} />
            <span className="art-star">✦</span>
          </div>
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
              {completedCount}
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
                <Flame size={19} />
              </span>
              <span className="stat-tag">CONSISTENCY</span>
            </div>

            <div className="stat-value">
              {studyStreak} <span>days</span>
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
              {(weeklyFocusMinutes / 60).toFixed(1)} <span>hrs</span>
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

            <div className="stat-value">{subjects.length}</div>

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
                <Flame size={19} />
              </span>
            </div>

            <div className="goal-progress-row">
              <div
                className="goal-ring"
                style={{ "--goal-progress": `${dailyGoalPercent}%` }}
              >
                <div className="goal-ring-inner">
                  <strong>{dailyGoalPercent}%</strong>
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

            <div className="streak-strip">
              <span className="streak-icon">
                <Flame size={18} />
              </span>
              <div>
                <strong>{studyStreak}-day study streak</strong>
                <span>
                  {studyStreak > 0
                    ? "You've studied on consecutive days!"
                    : "Finish a focus session today to start your streak."}
                </span>
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
                  className={`planner-day-tab ${
                    plannerDay === day ? "selected" : ""
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
                          <Clock3 size={12} /> {overdue ? "Overdue · " : "Due "}
                          {new Date(`${task.deadline}T00:00:00`).toLocaleDateString(
                            [],
                            { month: "short", day: "numeric" }
                          )}
                        </>
                      ) : (
                        <span>No deadline</span>
                      )}
                    </div>

                    <span
                      className={`task-status ${task.completed ? "status-done" : ""}`}
                    >
                      {task.completed ? "Done" : "To do"}
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
            className="weekly-chart"
            role="img"
            aria-label="Daily focus minutes over the last seven days"
          >
            {weeklyActivity.map((day) => (
              <div className="weekly-chart-day" key={day.dateKey}>
                <span className="weekly-chart-value">
                  {day.minutes > 0 ? `${day.minutes}m` : ""}
                </span>

                <div className="weekly-chart-track">
                  <span
                    className={`weekly-chart-bar ${day.isToday ? "today" : ""}`}
                    style={{
                      height: `${
                        day.minutes === 0
                          ? 4
                          : Math.max(8, (day.minutes / maxDailyMinutes) * 100)
                      }%`,
                    }}
                  />
                </div>

                <span
                  className={`weekly-chart-label ${
                    day.isToday ? "today-label" : ""
                  }`}
                >
                  {day.label}
                </span>
              </div>
            ))}
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
                        <BookOpen size={12} /> {task.subject || "Personal"}
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

            <div className="focus-visual">
              <div
                className="focus-ring"
                style={{ "--timer-progress": `${timerProgress}%` }}
                role="timer"
                aria-label={`${timerMinutes} minutes and ${timerSeconds} seconds remaining`}
              >
                <div className="focus-inner">
                  <span className="focus-emoji">
                    {sessionCompleted ? <Check size={23} /> : <Target size={21} />}
                  </span>

                  <strong>
                    {timerMinutes}:{timerSeconds}
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
                  disabled={secondsLeft === 0}
                >
                  <Play size={16} fill="currentColor" />
                  {secondsLeft < totalSeconds ? "Resume session" : "Start focus session"}
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
                  {focusSessions.map((session) => (
                    <article className="session-history-row" key={session.id}>
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
                      </div>

                      <span className="session-history-status">Completed</span>
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

          <section className="panel subjects-panel" id="subjects">
            <div className="panel-heading">
              <div>
                <h2>My Subjects</h2>
                <p>Keep your learning on track.</p>
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
              <div className="subjects-list">
                {subjects.map((subject) => {
                  // Count both regular tasks and weekly-planner tasks for this subject.
                  const subjectTasks = tasks.filter(
                    (task) =>
                      (task.subject || "Personal").trim().toLowerCase() ===
                      subject.name.toLowerCase()
                  );
                  const subjectPlannerTasks = weeklyPlan.filter(
                    (task) =>
                      (task.subject || "Mathematics").trim().toLowerCase() ===
                      subject.name.toLowerCase()
                  );
                  const allSubjectTasks = [...subjectTasks, ...subjectPlannerTasks];
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
                    <article className="subject-row" key={subject.name}>
                      <div className={`subject-icon ${subject.color}`} aria-hidden="true">
                        <BookOpen size={19} />
                      </div>

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
              </div>
            )}

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

            <div className="notes-library">
              <div className="notes-library-heading">
                <div>
                  <h3>Your notebook</h3>
                  <p>Search and manage your saved notes.</p>
                </div>
              </div>

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
                  {visibleNotes.map((note) => (
                    <article className="note-card" key={note.id}>
                      <div className="note-card-top">
                        <span className="note-subject-tag">{note.subject}</span>

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

            <p className="analytics-note">
              Your notes are saved to your StudyOS account and can sync across devices.
            </p>
          </section>

          {/* Account settings */}
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
                    className={`settings-theme-option ${
                      settingsTheme === "dark" ? "selected" : ""
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
                    className={`settings-theme-option ${
                      settingsTheme === "light" ? "selected" : ""
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

              <article className="settings-card settings-notifications-card">
                <div className="settings-card-heading">
                  <span className="settings-card-icon">
                    <Bell size={19} />
                  </span>
                  <div>
                    <h3>Notifications</h3>
                    <p>Choose which study reminders you want enabled.</p>
                  </div>
                </div>

                <div className="settings-toggle-row">
                  <div>
                    <strong>Study reminders</strong>
                    <p>Helpful reminders to keep your study routine on track.</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-switch ${studyRemindersEnabled ? "is-on" : ""}`}
                    role="switch"
                    aria-checked={studyRemindersEnabled}
                    aria-label="Study reminders"
                    disabled={settingsLoading || settingsSaving}
                    onClick={() =>
                      saveSettings({
                        studyRemindersEnabled: !studyRemindersEnabled,
                      })
                    }
                  >
                    <span />
                  </button>
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

          {/* Interactive rectangular reminder */}
          {studyRemindersEnabled && (
            <section className="quote-panel" aria-label="Daily study reminder">
              <div className="quote-sparkle">
                <Quote size={22} />
              </div>

              <div className="quote-content">
                <span className="quote-label">A LITTLE REMINDER</span>

                <p key={reminderIndex} className="reminder-quote">
                  "{currentReminder.text}"
                </p>

                <span className="quote-author">— {currentReminder.author}</span>

                {showStudyTip && (
                  <div className="reminder-tip">
                    <Sparkles size={15} />
                    <span>{currentReminder.tip}</span>
                  </div>
                )}

                <div className="reminder-actions">
                  <button
                    type="button"
                    className="reminder-button reminder-next"
                    onClick={nextReminder}
                  >
                    <RefreshCw size={14} /> New reminder
                  </button>

                  <button
                    type="button"
                    className="reminder-button reminder-tip-button"
                    onClick={() => setShowStudyTip((current) => !current)}
                  >
                    <Sparkles size={14} />
                    {showStudyTip ? "Hide study tip" : "Study tip"}
                  </button>
                </div>
              </div>

              <div className="quote-decoration" aria-hidden="true">
                ✦
              </div>
            </section>
          )}
        </div>

        <footer className="app-footer">
          <span>
            <GraduationCap size={16} />
            StudyOS
          </span>

          <span>
            -Abdul Mohtasim-
            <Sparkles size={13} />
          </span>
        </footer>
      </main>
    </div>
  );
}
