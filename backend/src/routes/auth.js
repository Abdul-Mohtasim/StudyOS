
const requireAuth = require("../middleware/auth");
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

const router = express.Router();
const googleClient = new OAuth2Client();

function createSessionToken(student, jwtSecret) {
  return jwt.sign(
    { sub: student._id.toString() },
    jwtSecret,
    {
      expiresIn: "2h",
      issuer: "studyos-api",
      audience: "studyos-app",
    }
  );
}

function publicStudent(student) {
  return {
    id: student._id.toString(),
    name: student.name,
    displayName: student.displayName || student.name,
    email: student.email,
    picture: student.picture || "",
  };
}

// Email/password registration
router.post("/register", async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        error: "Authentication is not configured on the server.",
      });
    }

    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        error: "Name must be between 2 and 100 characters.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        error: "Password must be between 8 and 128 characters.",
      });
    }

    const existingStudent = await Student.findOne({
      email: normalizedEmail,
    });

    if (existingStudent) {
      return res.status(409).json({
        error:
          "An account with this email already exists. Please sign in using its original method.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // A synthetic ID satisfies the existing required googleId field.
    // It is not a Google account ID.
    const student = await Student.create({
      googleId: `email:${normalizedEmail}`,
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      picture: "",
    });

    const token = createSessionToken(student, jwtSecret);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      student: publicStudent(student),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    if (req.log) {
      req.log.error(
        { errorName: error.name, errorCode: error.code },
        "Email registration failed."
      );
    }

    return res.status(500).json({
      error: "Could not create your account. Please try again.",
    });
  }
});

// Email/password login
router.post("/login", async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        error: "Authentication is not configured on the server.",
      });
    }

    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      password.length > 128
    ) {
      return res.status(400).json({
        error: "Please enter a valid email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const student = await Student.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    // Use the same message for unknown emails and incorrect passwords.
    if (
      !student ||
      !student.passwordHash ||
      !(await bcrypt.compare(password, student.passwordHash))
    ) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const token = createSessionToken(student, jwtSecret);

    return res.status(200).json({
      message: "Signed in successfully.",
      token,
      student: publicStudent(student),
    });
  } catch (error) {
    if (req.log) {
      req.log.error(
        { errorName: error.name, errorCode: error.code },
        "Email login failed."
      );
    }

    return res.status(500).json({
      error: "Could not sign in. Please try again.",
    });
  }
});

// Existing Google sign-in — preserved
router.post("/google", async (req, res) => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const jwtSecret = process.env.JWT_SECRET;

    if (!googleClientId || !jwtSecret) {
      return res.status(500).json({
        error: "Authentication is not configured on the server.",
      });
    }

    const { credential } = req.body || {};

    if (
      typeof credential !== "string" ||
      credential.length === 0 ||
      credential.length > 10000
    ) {
      return res.status(400).json({
        error: "A valid Google credential is required.",
      });
    }

    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });

      payload = ticket.getPayload();
    } catch (error) {
      if (req.log) {
        req.log.warn(
          { errorName: error.name },
          "Google ID token verification failed."
        );
      }

      return res.status(401).json({
        error:
          "Google credential verification failed. Check that the frontend and backend use the same Google Client ID.",
      });
    }

    if (
      !payload ||
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.email !== "string" ||
      !payload.email
    ) {
      return res.status(401).json({
        error: "Google account information is incomplete.",
      });
    }

    if (payload.email_verified !== true) {
      return res.status(401).json({
        error: "Please use a verified Google email address.",
      });
    }

    const email = payload.email.toLowerCase();

    let student;

    try {
      student = await Student.findOneAndUpdate(
        { googleId: payload.sub },
        {
          $set: {
            name: payload.name || email,
            email,
            picture: payload.picture || "",
          },
          $setOnInsert: {
            googleId: payload.sub,
          },
        },
        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          error:
            "This email is already associated with another account. Please sign in using its original method.",
        });
      }

      throw error;
    }

    if (!student) {
      throw new Error("Student record could not be retrieved.");
    }

    const token = createSessionToken(student, jwtSecret);

    return res.status(200).json({
      message: "Google sign-in successful.",
      token,
      student: publicStudent(student),
    });
  } catch (error) {
    if (req.log) {
      req.log.error(
        { errorName: error.name, errorCode: error.code },
        "Google authentication request failed."
      );
    }

    return res.status(500).json({
      error: "An internal server error occurred during sign-in.",
    });
  }
});

// Existing session restoration — preserved
router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({
    student: publicStudent(req.student),
  });
});

// Existing profile update — preserved
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { displayName } = req.body || {};

    if (typeof displayName !== "string") {
      return res.status(400).json({
        error: "Display name must be text.",
      });
    }

    const trimmedName = displayName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 40) {
      return res.status(400).json({
        error: "Display name must be between 2 and 40 characters.",
      });
    }

    req.student.displayName = trimmedName;
    await req.student.save();

    return res.status(200).json({
      message: "Display name updated successfully.",
      student: publicStudent(req.student),
    });
  } catch (error) {
    if (req.log) {
      req.log.error(
        { errorName: error.name },
        "Profile update failed."
      );
    }

    return res.status(500).json({
      error: "Could not update your display name.",
    });
  }
});

module.exports = router;
