"use strict";

require("dotenv").config();

// StudyOS API entry point.
//
// Load balancing & crash protection:
//   * The main process starts several worker processes (one per CPU core, up to
//     WEB_CONCURRENCY). The operating system shares incoming connections between
//     them, so one busy or crashed worker never takes the site down.
//   * If a worker dies, the main process starts a new one within a second.
//   * Each worker has request/keep-alive time limits and shuts down gracefully.
// Set WEB_CONCURRENCY=1 on very small hosting plans (less than ~512 MB RAM).

const os = require("os");
const cluster = require("cluster");

const PORT = Number(process.env.PORT) || 5000;

function workerCount() {
  const wanted = Number(process.env.WEB_CONCURRENCY);
  if (Number.isFinite(wanted) && wanted >= 1) return Math.floor(wanted);
  const cpus = typeof os.availableParallelism === "function" ? os.availableParallelism() : os.cpus().length;
  return Math.max(1, Math.min(cpus, 2)); // default: up to 2; raise with WEB_CONCURRENCY
}

// ---------------------------------------------------------------- main process
function runPrimary(count) {
  console.log(`StudyOS API main process ${process.pid}: starting ${count} workers on port ${PORT}.`);

  const recentCrashes = [];
  let stopping = false;

  const fork = () => cluster.fork();
  for (let i = 0; i < count; i += 1) fork();

  cluster.on("exit", (worker, code, signal) => {
    if (stopping) return;
    console.error(`Worker ${worker.process.pid} stopped (code ${code}, signal ${signal || "none"}). Starting a new one.`);

    // Back off when workers keep crashing right away (for example a wrong database address).
    const now = Date.now();
    recentCrashes.push(now);
    while (recentCrashes.length && now - recentCrashes[0] > 60_000) recentCrashes.shift();
    const delay = recentCrashes.length > 5 ? 5000 : 500;
    setTimeout(fork, delay);
  });

  const stopAll = (signal) => {
    if (stopping) return;
    stopping = true;
    console.log(`${signal} received. Stopping workers...`);
    for (const id of Object.keys(cluster.workers)) cluster.workers[id]?.process.kill("SIGTERM");
    setTimeout(() => process.exit(0), 12_000).unref();
    const check = setInterval(() => {
      if (!Object.keys(cluster.workers).length) process.exit(0);
    }, 200);
    check.unref?.();
  };
  process.once("SIGINT", () => stopAll("SIGINT"));
  process.once("SIGTERM", () => stopAll("SIGTERM"));
}

// ---------------------------------------------------------------- worker process
function runWorker() {
  const app = require("./app");
  const { connectDatabase, closeDatabase } = require("./config/database");

  let httpServer;
  let isShuttingDown = false;

  async function startServer() {
    // Start listening first so the platform health check passes quickly,
    // then connect to MongoDB (requests wait for the connection if needed).
    httpServer = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Study OS API worker ${process.pid} listening on port ${PORT}`);
    });

    // Longer than common load balancers' idle time (60 s), so they never reuse a closed connection.
    httpServer.keepAliveTimeout = 65_000;
    httpServer.headersTimeout = 66_000;
    // A request that takes longer than this is cut instead of piling up.
    httpServer.requestTimeout = 60_000;
    httpServer.maxRequestsPerSocket = 0;

    httpServer.on("error", (err) => {
      console.error("HTTP server error:", err.message);
      process.exit(1);
    });

    // Open the database connection in the background.
    connectDatabase().catch((err) => {
      console.error("First database connection failed (it will be retried on the next request):", err.message);
    });
  }

  async function shutdown(signal, exitCode = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${signal} received. Worker ${process.pid} shutting down...`);

    // Do not wait forever for slow connections.
    const force = setTimeout(() => process.exit(exitCode), 10_000);
    force.unref();

    try {
      if (httpServer) {
        await new Promise((resolve) => {
          httpServer.close(() => resolve());
          httpServer.closeIdleConnections?.();
        });
      }
      await closeDatabase();
      console.log("Shutdown completed.");
      process.exit(exitCode);
    } catch (err) {
      console.error("Shutdown failed:", err.message);
      process.exit(1);
    }
  }

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  // A bug in one request must not silently leave the process in an unknown state.
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason instanceof Error ? reason.stack || reason.message : reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception, restarting this worker:", err.stack || err.message);
    shutdown("uncaughtException", 1);
  });

  startServer().catch((err) => {
    console.error("Study OS could not start.");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    process.exit(1);
  });
}

// ---------------------------------------------------------------- go
const count = workerCount();
if (count > 1 && cluster.isPrimary) {
  runPrimary(count);
} else {
  runWorker();
}
