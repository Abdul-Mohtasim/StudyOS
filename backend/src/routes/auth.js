
const requireAuth = require("../middleware/auth");
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();

const googleClient = new OAuth2Client();

router.post("/google", async (req, res) => {
  try {
    // 1. Validate server configuration.
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const jwtSecret = process.env.JWT_SECRET;

    if (!googleClientId || !jwtSecret) {
      if (req.log) {
        req.log.error(
          "GOOGLE_CLIENT_ID or JWT_SECRET is missing from backend configuration."
        );
      }

      return res.status(500).json({
        error: "Authentication is not configured on the server.",
      });
    }

    // 2. Validate the request body.
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

    // 3. Verify the Google ID token.
    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });

      payload = ticket.getPayload();
    } catch (error) {
      // Do not log or return the actual Google credential.
      if (req.log) {
        req.log.warn(
          {
            errorName: error.name,
            errorMessage: error.message,
          },
          "Google ID token verification failed."
        );
      }

      return res.status(401).json({
        error:
          "Google credential verification failed. Check that the frontend and backend use the same Google Client ID.",
      });
    }

    // 4. Validate the verified Google account.
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

    // 5. Create or update the student record.
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
            "This email or Google account may already be linked to another account.",
        });
      }

      throw error;
    }

    if (!student) {
      throw new Error("Student record could not be created or retrieved.");
    }

    // 6. Generate the StudyOS session token.
    const token = jwt.sign(
      { sub: student._id.toString() },
      jwtSecret,
      {
        expiresIn: "2h",
        issuer: "studyos-api",
        audience: "studyos-app",
      }
    );

    // 7. Return the response expected by the frontend.
    return res.status(200).json({
      message: "Google sign-in successful.",
      token,
student: {
  id: student._id,
  name: student.name,
  displayName: student.displayName || student.name,
  email: student.email,
  picture: student.picture,
},
    });
  } catch (error) {
    // Database, JWT, or other unexpected server errors.
    if (req.log) {
      req.log.error(
        {
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.code,
        },
        "Google authentication request failed."
      );
    } else {
      console.error("Google authentication request failed:", error.message);
    }

    return res.status(500).json({
      error: "An internal server error occurred during sign-in.",
    });
  }
});


router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    student: {
      id: req.student._id.toString(),
      name: req.student.name,
      displayName: req.student.displayName || req.student.name,
      email: req.student.email,
      picture: req.student.picture,
    },
  });
});



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
      student: {
        id: req.student._id.toString(),
        name: req.student.name,
        displayName: req.student.displayName,
        email: req.student.email,
        picture: req.student.picture,
      },
    });
  } catch (error) {
    if (req.log) {
      req.log.error(
        {
          errorName: error.name,
          errorMessage: error.message,
        },
        "Profile update failed."
      );
    }

    return res.status(500).json({
      error: "Could not update your display name.",
    });
  }
});


module.exports = router;
