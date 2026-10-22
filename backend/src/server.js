
require("dotenv").config();

const app = require("./app");

const {
  connectDatabase,
  closeDatabase,
} = require("./config/database");

const PORT = Number(process.env.PORT) || 5000;

let httpServer;
let isShuttingDown = false;

async function startServer() {
  // Connect to MongoDB before accepting requests.
  await connectDatabase();

  httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study OS API listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });

  httpServer.on("error", (err) => {
    console.error("HTTP server error:", err.message);
    process.exitCode = 1;
  });
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down...`);

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    await closeDatabase();
    console.log("Shutdown completed.");
  } catch (err) {
    console.error("Shutdown failed:", err.message);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch(async (err) => {
  console.error("Study OS could not start.");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Error code:", err.code || "No error code");

  try {
    await closeDatabase();
  } catch (closeError) {
    console.error("Database cleanup failed:", closeError.message);
  }

  process.exitCode = 1;
});
