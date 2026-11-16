"use strict";

// Speed and overload protection. No extra npm packages needed.
//   compress()   gzip for JSON/text answers (smaller = faster on phones)
//   guard()      says "busy, retry" (503) instead of freezing when a worker is overloaded
//   apiHeaders() private/no-cache headers so shared caches never keep personal data

const zlib = require("zlib");
const { monitorEventLoopDelay } = require("perf_hooks");

const COMPRESS_MIN_BYTES = 1024;
const COMPRESSIBLE = /json|text|javascript|xml|svg/i;

// ---------- gzip ----------
function compress() {
  return function compressMiddleware(req, res, next) {
    if (req.method === "HEAD" || !/\bgzip\b/i.test(req.headers["accept-encoding"] || "")) {
      return next();
    }

    const originalWrite = res.write;
    const originalEnd = res.end;
    let gzip = null;
    let decided = false;

    function decide() {
      decided = true;
      const type = String(res.getHeader("Content-Type") || "");
      const length = Number(res.getHeader("Content-Length") || 0);
      const cacheControl = String(res.getHeader("Cache-Control") || "");
      const skip =
        res.getHeader("Content-Encoding") ||
        res.statusCode === 204 ||
        res.statusCode === 304 ||
        !COMPRESSIBLE.test(type) ||
        /no-transform/i.test(cacheControl) ||
        (length && length < COMPRESS_MIN_BYTES);
      if (skip) return;

      gzip = zlib.createGzip({ level: 4 });
      res.setHeader("Content-Encoding", "gzip");
      res.removeHeader("Content-Length");
      const vary = String(res.getHeader("Vary") || "");
      if (!/accept-encoding/i.test(vary)) {
        res.setHeader("Vary", vary ? `${vary}, Accept-Encoding` : "Accept-Encoding");
      }
      const etag = res.getHeader("ETag");
      if (etag && !/^W\//.test(String(etag))) res.setHeader("ETag", `W/${etag}`);

      gzip.on("data", (chunk) => originalWrite.call(res, chunk));
      gzip.on("end", () => originalEnd.call(res));
      gzip.on("error", () => originalEnd.call(res));
    }

    res.write = function write(chunk, encoding, callback) {
      if (!decided) decide();
      if (!gzip) return originalWrite.call(res, chunk, encoding, callback);
      if (typeof encoding === "function") {
        callback = encoding;
        encoding = undefined;
      }
      const ok = gzip.write(chunk, encoding);
      if (typeof callback === "function") callback();
      return ok;
    };

    res.end = function end(chunk, encoding, callback) {
      if (typeof chunk === "function") {
        callback = chunk;
        chunk = undefined;
        encoding = undefined;
      } else if (typeof encoding === "function") {
        callback = encoding;
        encoding = undefined;
      }
      if (!decided) {
        // Whole body known here, so Content-Length can be checked precisely.
        if (chunk && !res.getHeader("Content-Length") && !res.headersSent) {
          res.setHeader("Content-Length", Buffer.byteLength(chunk, encoding));
        }
        decide();
      }
      if (!gzip) return originalEnd.call(res, chunk, encoding, callback);
      if (typeof callback === "function") res.once("finish", callback);
      if (chunk) gzip.end(chunk, encoding);
      else gzip.end();
      return res;
    };

    next();
  };
}

// ---------- overload guard ----------
// Only for REAL overload. On a small or shared server one slow moment (starting up, a
// sign-in, a slow database call) must never turn into "server busy" for people, so:
//   * it does nothing during the first 30 seconds after the server starts,
//   * the event loop must be stuck for several seconds IN A ROW before it says "busy",
//   * sign-in, sign-up and health checks are never refused.
function guard({
  maxInFlight = Number(process.env.MAX_IN_FLIGHT) || 400,
  maxLagMs = Number(process.env.MAX_EVENT_LOOP_LAG_MS) || 4000,
  warmupMs = 30000,
  strikes = 3,
} = {}) {
  const startedAt = Date.now();
  const histogram = monitorEventLoopDelay({ resolution: 20 });
  histogram.enable();
  let lagMs = 0;
  let hot = 0; // how many checks in a row were overloaded
  const sampler = setInterval(() => {
    lagMs = histogram.max / 1e6; // nanoseconds -> ms
    histogram.reset();
    hot = lagMs > maxLagMs ? hot + 1 : 0;
  }, 1000);
  sampler.unref();

  let inFlight = 0;

  function middleware(req, res, next) {
    // req.path is relative to "/api"
    if (req.path === "/health" || req.path === "/health/live" || req.path === "/ping" || req.path.startsWith("/auth/") || req.path.startsWith("/cron/")) {
      return next();
    }

    const warm = Date.now() - startedAt > warmupMs;
    if (warm && (inFlight >= maxInFlight || hot >= strikes)) {
      res.setHeader("Retry-After", "2");
      return res.status(503).json({ error: "The server is busy right now. Please try again in a moment." });
    }

    inFlight += 1;
    let done = false;
    const release = () => {
      if (done) return;
      done = true;
      inFlight -= 1;
    };
    res.once("finish", release);
    res.once("close", release);
    next();
  }

  middleware.stats = () => ({ inFlight, eventLoopLagMs: Math.round(lagMs), hot });
  return middleware;
}

// ---------- headers ----------
function apiHeaders(req, res, next) {
  // Personal data: browsers may keep it but must re-check (ETag => cheap 304); shared caches must not store it.
  res.setHeader("Cache-Control", "private, no-cache");
  next();
}

module.exports = { compress, guard, apiHeaders };
