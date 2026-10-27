
const app = require("../src/app");
const { connectDatabase } = require("../src/config/database");
const cors = require("cors");
const corsOptions = require("../src/config/cors");

let databaseConnection;
const applyCors = cors(corsOptions);

function handler(req, res) {
  applyCors(req, res, (corsError) => {
    if (res.writableEnded) {
      return;
    }

    if (corsError) {
      return app(req, res);
    }

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    async function handleRequest() {
      try {
        if (!databaseConnection) {
          databaseConnection = connectDatabase().catch((error) => {
            databaseConnection = null;
            throw error;
          });
        }

        await databaseConnection;
        return app(req, res);
      } catch (error) {
        console.error("Database initialization failed:", {
          name: error.name,
          message: error.message,
          code: error.code,
        });

        return res.status(503).json({
          error: "Database is temporarily unavailable. Please try again.",
        });
      }
    }

    handleRequest().catch((error) => {
      console.error("Serverless request failed:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });

      if (!res.headersSent) {
        res.status(500).json({
          error: "An internal server error occurred.",
        });
      }
    });
  });
}

module.exports = handler;
