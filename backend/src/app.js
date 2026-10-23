
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const noteRoutes = require("./routes/notes");
const focusSessionsRouter = require("./routes/focusSessions");
const plannerRoutes = require("./routes/planner");
const settingsRoutes = require("./routes/settings");
const { isDatabaseConnected } = require("./config/database");

const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5176",
  "http://localhost:5175",
  "https://study-os-66bo.vercel.app",
];

app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

app.use(
  pinoHttp({
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
      "req.body.credential",
    ],
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Register API routes once.
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/focus-sessions", focusSessionsRouter);
app.use("/api/planner", plannerRoutes);
app.use("/api/settings", settingsRoutes);

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
