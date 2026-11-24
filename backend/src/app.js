
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const corsOptions = require("./config/cors");
const { compress, guard, apiHeaders } = require("./middleware/performance");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const noteRoutes = require("./routes/notes");
const focusSessionsRouter = require("./routes/focusSessions");
const plannerRoutes = require("./routes/planner");
const settingsRoutes = require("./routes/settings");
const examRoutes = require("./routes/exams");
const flashcardRoutes = require("./routes/flashcards");
const gradeRoutes = require("./routes/grades");
const accountEmailRoutes = require("./routes/accountEmail");
const emailRoutes = require("./routes/email");
const cronRoutes = require("./routes/cron");
const friendRoutes = require("./routes/friends");
const gemRoutes = require("./routes/gems");
const shopRoutes = require("./routes/shop");
const notificationRoutes = require("./routes/notifications");
const supportRoutes = require("./routes/support");
const { helpPage, feedbackPage } = require("./pages/helpPages");
const {
  connectDatabase,
  isDatabaseConnected,
} = require("./config/database");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

// Cheap "is the process alive" check for load balancers. It answers before anything
// else runs (no database, no logging), so it stays fast even under heavy load.
app.get(["/api/ping", "/api/health/live"], cors(corsOptions), (req, res) => {
  res.status(200).json({ status: "ok", pid: process.pid });
});


app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

// Feedback form: mounted first, before compression / overload guard / JSON parsing, and it reads its own body.
// (On Vercel the request body can already be read by the platform, which made express.json fail with
// "Internal server error". The route handles both cases itself.)
app.use("/api/support", supportRoutes);

// Smaller answers (gzip) and "busy, retry" instead of freezing when overloaded.
// (After CORS, so the browser can read the "busy" answer and retry.)
app.use(compress());
app.use("/api", guard());
app.use("/api", apiHeaders);


app.use(express.json({ limit: "100kb" }));

app.use(
  pinoHttp({
    autoLogging: {
      ignore: (req) => req.url === "/api/health" || req.url === "/api/health/live" || req.url === "/api/ping",
    },
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
      "req.body.credential",
    ],
  })
);

// Limits are per IP address. Many students can share one school/mobile-network address,
// so the general limit is generous; sign-in endpoints have their own stricter limit.
const skipLimit = (req) =>
  req.method === "OPTIONS" ||
  req.path === "/health" ||
  req.path === "/health/live" ||
  req.path === "/ping" ||
  req.path.startsWith("/cron/");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT) || 3000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipLimit,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 150,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many sign-in attempts. Please wait a few minutes and try again.",
  },
});

app.use("/api", apiLimiter);
app.use(["/api/auth/login", "/api/auth/register", "/api/auth/google"], authLimiter);

app.use("/api", async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    if (req.log) {
      req.log.error(
        { err },
        "Database connection failed"
      );
    }

    return res.status(503).json({
      error: "Database is temporarily unavailable. Please try again.",
    });
  }
});

// Register API routes once.
app.use("/api/auth", authRoutes);
app.use("/api/auth", accountEmailRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/focus-sessions", focusSessionsRouter);
app.use("/api/planner", plannerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/cron", cronRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/gems", gemRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/notifications", notificationRoutes);

// Public Help Center and Feedback pages (the app opens these in the phone's browser).
// They use a few inline styles and scripts and Google Fonts, so they get their own content security policy.
const PAGE_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";
const sendPage = (build) => (req, res) => {
  res.set({
    "Content-Security-Policy": PAGE_CSP,
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
  res.send(build(req.query || {}));
};
app.get(["/help", "/help/"], sendPage(helpPage));
app.get(["/help/feedback", "/help/feedback/"], sendPage(feedbackPage));

app.get("/", (req, res) => {
  res.json({
    name: "Study OS API",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  const databaseConnected = isDatabaseConnected();

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    service: "study-os-api",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body is too large.",
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON request body.",
    });
  }

  if (req.log) {
    req.log.error({ err }, "Request failed");
  } else {
    console.error("Request failed:", err.message);
  }

  return res.status(500).json({
    error: "Internal server error",
  });
});

module.exports = app;
