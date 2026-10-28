
const cors = require("cors");

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:58274",

  // Capacitor Android WebView origin
  "https://localhost",
  "http://localhost",

  // Deployed frontend URL
  ...(process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL.replace(/\/+$/, "")]
    : []),
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.warn(`Origin not allowed by CORS: ${origin}`);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = corsOptions;
