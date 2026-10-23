
const app = require("../src/app");
const { connectDatabase } = require("../src/config/database");

let databaseConnection;

async function handler(req, res) {
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

module.exports = handler;
