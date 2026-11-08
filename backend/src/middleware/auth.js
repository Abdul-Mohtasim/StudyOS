const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

// Every request used to read the student from the database. A page opens ~8 requests at
// once, so that was 8 identical lookups. The student is now remembered for a few seconds
// in this process (per worker). Code that changes a student calls forgetStudent(id).
const CACHE_TTL_MS = Number(process.env.AUTH_CACHE_TTL_MS) || 10_000;
const CACHE_MAX = 5000;
const cache = new Map(); // id -> { expires, data }
const pending = new Map(); // id -> Promise (several requests at once share one lookup)

function forgetStudent(id) {
  if (id) cache.delete(String(id));
}

function remember(id, data) {
  if (cache.size >= CACHE_MAX) {
    const now = Date.now();
    for (const [key, entry] of cache) if (entry.expires <= now) cache.delete(key);
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  }
  cache.set(id, { expires: Date.now() + CACHE_TTL_MS, data });
}

async function loadStudent(id) {
  const hit = cache.get(id);
  if (hit && hit.expires > Date.now()) return Student.hydrate({ ...hit.data });

  let lookup = pending.get(id);
  if (!lookup) {
    lookup = Student.findById(id)
      .lean()
      .then((data) => {
        if (data) remember(id, data);
        return data;
      })
      .finally(() => pending.delete(id));
    pending.set(id, lookup);
  }
  const data = await lookup;
  return data ? Student.hydrate({ ...data }) : null;
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "studyos-api",
      audience: "studyos-app",
    });

    const student = await loadStudent(String(decoded.sub));

    if (!student) {
      return res.status(401).json({
        message: "Student account not found.",
      });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
}

module.exports = requireAuth;
module.exports.forgetStudent = forgetStudent;
