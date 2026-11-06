"use strict";

const crypto = require("crypto");

// Random link token. Only its SHA-256 hash is stored, so a database leak
// cannot be used to reset anyone's password.
function createToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function safeEqual(a, b) {
  const left = crypto.createHash("sha256").update(String(a)).digest();
  const right = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
}

module.exports = { createToken, hashToken, safeEqual };
