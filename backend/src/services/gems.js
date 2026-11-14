"use strict";

const Student = require("../models/Student");
const { forgetStudent } = require("../middleware/auth");

// How many gems each source may pay per day (null = no daily cap, but limited another way).
const DAILY_CAP = 80;
const ONBOARDING_MAX = 500;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Add gems that count toward the daily cap (focus sessions). Returns the new balance.
async function awardDaily(studentId, amount) {
  const gain = Math.max(0, Math.floor(amount));
  if (!gain) return null;
  const day = todayKey();

  // Start a new day's counter when the stored day is old, then add up to the cap.
  await Student.updateOne({ _id: studentId, gemsDay: { $ne: day } }, { $set: { gemsDay: day, gemsToday: 0 } });
  const doc = await Student.findById(studentId).select("gems gemsToday").lean();
  if (!doc) return null;
  const room = Math.max(0, DAILY_CAP - (doc.gemsToday || 0));
  const add = Math.min(gain, room);
  if (!add) return { balance: doc.gems || 0, added: 0 };
  const updated = await Student.findOneAndUpdate(
    { _id: studentId },
    { $inc: { gems: add, gemsToday: add } },
    { new: true }
  ).select("gems").lean();
  forgetStudent(studentId);
  return { balance: updated?.gems || 0, added: add };
}

// Add gems with no daily cap (one-time bonuses the caller already limited).
async function award(studentId, amount) {
  const add = Math.max(0, Math.floor(amount));
  if (!add) return null;
  const updated = await Student.findOneAndUpdate({ _id: studentId }, { $inc: { gems: add } }, { new: true })
    .select("gems")
    .lean();
  forgetStudent(studentId);
  return { balance: updated?.gems || 0, added: add };
}

// One-time: the gems earned in the new-user lesson. Paid once, capped.
async function claimOnboarding(studentId, requested) {
  const amount = Math.min(ONBOARDING_MAX, Math.max(0, Math.floor(Number(requested) || 0)));
  const updated = await Student.findOneAndUpdate(
    { _id: studentId, onboardingGemsClaimed: { $ne: true } },
    { $set: { onboardingGemsClaimed: true }, $inc: { gems: amount } },
    { new: true }
  ).select("gems").lean();
  forgetStudent(studentId);
  if (updated) return { balance: updated.gems || 0, added: amount, claimed: true };
  const doc = await Student.findById(studentId).select("gems").lean();
  return { balance: doc?.gems || 0, added: 0, claimed: false };
}

module.exports = { award, awardDaily, claimOnboarding, DAILY_CAP, ONBOARDING_MAX };
