"use strict";

// One-time helper: creates the database indexes for the exam dates feature.
//
// In production the API runs with autoIndex turned off (see
// src/config/database.js), so new indexes are not created automatically.
// Run this once after deploying the update:
//
//   npm run sync-indexes
//
// It only ADDS missing indexes. It never drops or changes existing data.

require("dotenv").config();

const { connectDatabase, closeDatabase } = require("../src/config/database");
const Exam = require("../src/models/Exam");
const Flashcard = require("../src/models/Flashcard");
const Grade = require("../src/models/Grade");
const EmailToken = require("../src/models/EmailToken");
const EmailLog = require("../src/models/EmailLog");
const LoginDevice = require("../src/models/LoginDevice");
const EmailPreferences = require("../src/models/EmailPreferences");

async function main() {
  await connectDatabase();
  await Exam.createCollection().catch(() => {});
  await Exam.createIndexes();
  console.log("Exam indexes are ready.");
  await Flashcard.createCollection().catch(() => {});
  await Flashcard.createIndexes();
  await Grade.createCollection().catch(() => {});
  await Grade.createIndexes();
  console.log("Flashcard and grade indexes are ready.");
  await EmailToken.createCollection().catch(() => {});
  await EmailToken.createIndexes();
  await EmailLog.createCollection().catch(() => {});
  await EmailLog.createIndexes();
  await LoginDevice.createCollection().catch(() => {});
  await LoginDevice.createIndexes();
  await EmailPreferences.createCollection().catch(() => {});
  await EmailPreferences.createIndexes();
  console.log("Email indexes are ready.");
}

main()
  .catch((error) => {
    console.error("Could not create indexes:", error.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase().catch(() => {}));
