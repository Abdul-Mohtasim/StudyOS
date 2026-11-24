
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

// The Help Center / Feedback pages are served by this same backend and call its API on their own address.
// Browsers add an Origin header to those POST requests, so a request from the server's own address is allowed.
function isOwnOrigin(origin, req) {
  try {
    const host = new URL(origin).host.toLowerCase();
    return [req.get("x-forwarded-host"), req.get("host")]
      .filter(Boolean)
      .flatMap((v) => String(v).split(","))
      .map((v) => v.trim().toLowerCase())
      .includes(host);
  } catch {
    return false;
  }
}

const baseOptions = {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Per-request options. An unknown origin gets no CORS headers (the browser blocks it)
// instead of throwing, which used to surface as "Internal server error".
function corsOptions(req, callback) {
  const origin = req.get("origin");
  const allowed = !origin || allowedOrigins.has(origin) || isOwnOrigin(origin, req);
  if (!allowed) console.warn(`Origin not allowed by CORS: ${origin}`);
  callback(null, { ...baseOptions, origin: allowed });
}

module.exports = corsOptions;
