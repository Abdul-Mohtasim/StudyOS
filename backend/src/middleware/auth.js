
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

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

    const student = await Student.findById(decoded.sub);

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
