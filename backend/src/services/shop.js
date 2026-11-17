"use strict";

const Student = require("../models/Student");
const Friendship = require("../models/Friendship");
const { forgetStudent } = require("../middleware/auth");

// Everything the Gem Shop sells. Prices and limits live here only, never in the app.
//
// kind "stock"  : can be bought again and again, up to `max` in stock (Streak Freeze)
// kind "repair" : spends gems on one action for one day (Streak Repair)
// kind "timed"  : a boost that runs for `hours` (Double Gems)
// kind "unlock" : bought once and kept forever (every premium feature and theme)
//
// live: false  = the feature is not finished yet. The shop shows "Soon" and the server
// refuses the purchase, so nobody can spend gems on something that does nothing.
// When a later update finishes a feature, only its `live` flag changes to true.
const ITEMS = {
  // Streak boosts
  freeze: { kind: "stock", price: 100, max: 2, live: true },
  repair: { kind: "repair", price: 150, live: true },
  double: { kind: "timed", price: 120, hours: 24, live: true },
  // Focus and study
  sound: { kind: "unlock", price: 180, live: true }, // Focus Soundscapes
  focusplus: { kind: "unlock", price: 220, live: true }, // Focus Plus
  report: { kind: "unlock", price: 200, live: true }, // Weekly Report Plus
  exam: { kind: "unlock", price: 300, live: true }, // Exam Mode Pro
  widgets: { kind: "unlock", price: 160, live: false }, // Widget Pack
  // Profile and friends
  frames: { kind: "unlock", price: 140, live: false }, // Avatar Frames
  badges: { kind: "unlock", price: 120, live: false }, // Badge Showcase
  // Themes (Calm Mauve and Midnight are free and are not sold)
  theme_ocean: { kind: "unlock", price: 250, live: false },
  theme_forest: { kind: "unlock", price: 250, live: false },
  theme_sunset: { kind: "unlock", price: 250, live: false },
  theme_mono: { kind: "unlock", price: 250, live: false },
};
const GIFT_AMOUNT = 25;

// Pack sizes the shop offers. A bigger pack costs a little less per item.
// Streak Freeze is limited by how many you can hold (max 2), Streak Repair is one day at a time,
// and a one-time feature is bought one at a time.
const PACK_FACTOR = { 1: 1, 2: 0.95, 3: 0.9, 5: 0.8 };
const PACKS = { freeze: [1, 2], repair: [1], double: [1, 3, 5] };
const packSizes = (item) => PACKS[item] || [1];
const packCost = (item, n) => Math.round(ITEMS[item].price * n * (PACK_FACTOR[n] || 1));
// What the app needs to draw the pack choices: { freeze: [{ n: 1, price: 100 }, ...], ... }
function packs() {
  const out = {};
  for (const key of Object.keys(ITEMS)) out[key] = packSizes(key).map((n) => ({ n, price: packCost(key, n) }));
  return out;
}
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

// Own-property check, so a name like "constructor" or "__proto__" is never treated as an item.
const isItem = (key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(ITEMS, key);

// What the app needs to draw prices and the Soon labels.
function prices() {
  const out = { gift: GIFT_AMOUNT };
  for (const key of Object.keys(ITEMS)) out[key] = ITEMS[key].price;
  return out;
}
function live() {
  const out = {};
  for (const key of Object.keys(ITEMS)) out[key] = Boolean(ITEMS[key].live);
  return out;
}

function view(doc) {
  const until = doc.doubleGemsUntil ? new Date(doc.doubleGemsUntil).getTime() : 0;
  const owned = Array.isArray(doc.shopOwned) ? doc.shopOwned.filter((key) => isItem(key) && ITEMS[key].kind === "unlock") : [];
  return {
    gems: doc.gems || 0,
    freezes: doc.shopFreezes || 0,
    doubleUntil: until > Date.now() ? until : 0,
    protectedDays: Array.isArray(doc.protectedDays) ? doc.protectedDays : [],
    owned,
  };
}

const FIELDS = "gems shopFreezes doubleGemsUntil protectedDays shopOwned";

async function state(studentId) {
  const doc = await Student.findById(studentId).select(FIELDS).lean();
  return view(doc || {});
}

// A "YYYY-MM-DD" day that is a real calendar day.
function isRealDay(date) {
  if (typeof date !== "string" || !DAY_KEY.test(date)) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === date;
}

// Streak Repair can only bring back the day that was just missed. People live in every time
// zone, so "just missed" is any day from two days ago up to today in UTC.
function repairWindow() {
  const t = Date.now();
  return {
    lo: new Date(t - 2 * 86400000).toISOString().slice(0, 10),
    hi: new Date(t).toISOString().slice(0, 10),
  };
}

// Spends gems. Every rule is inside one database update so two taps can never spend twice.
// `extra` carries the day for Streak Repair: { date: "YYYY-MM-DD" }.
async function buy(studentId, item, extra = {}) {
  if (!isItem(item)) return { ok: false, status: 400, message: "That item is not in the shop." };
  const def = ITEMS[item];
  if (!def.live) return { ok: false, status: 409, message: "This is coming soon. Gems are not spent yet.", state: await state(studentId) };

  // How many in one purchase: 1, or one of the pack sizes this item offers.
  const qty = extra && extra.qty !== undefined ? extra.qty : 1;
  if (!Number.isInteger(qty) || !packSizes(item).includes(qty)) {
    return { ok: false, status: 400, message: "That pack size is not available.", state: await state(studentId) };
  }
  const cost = packCost(item, qty);

  const filter = { _id: studentId, gems: { $gte: cost } };
  let update;
  if (def.kind === "stock") {
    // Older accounts do not have the field yet, so a missing value counts as zero.
    filter.$or = [{ shopFreezes: { $exists: false } }, { shopFreezes: { $lte: def.max - qty } }];
    update = { $inc: { gems: -cost, shopFreezes: qty } };
  } else if (def.kind === "timed") {
    filter.$or = [{ doubleGemsUntil: null }, { doubleGemsUntil: { $lte: new Date() } }];
    update = {
      $inc: { gems: -cost },
      $set: { doubleGemsUntil: new Date(Date.now() + def.hours * qty * 3600 * 1000) },
    };
  } else if (def.kind === "repair") {
    const date = extra && extra.date;
    if (!isRealDay(date)) return { ok: false, status: 400, message: "There is no missed day to repair." };
    const { lo, hi } = repairWindow();
    if (date < lo || date > hi) return { ok: false, status: 409, message: "That day is too old to repair. Repair works for 24 hours." };
    filter.protectedDays = { $ne: date };
    update = {
      $inc: { gems: -cost },
      $push: { protectedDays: { $each: [date], $slice: -90 } },
    };
  } else {
    // unlock: the feature stays unlocked. Buying it again is allowed while you have the gems.
    update = { $inc: { gems: -cost }, $addToSet: { shopOwned: item } };
  }

  const done = await Student.findOneAndUpdate(filter, update, { new: true }).select(FIELDS).lean();
  forgetStudent(studentId);
  if (done) return { ok: true, state: view(done) };

  // Work out why, so the person gets a clear message.
  const doc = await Student.findById(studentId).select(FIELDS).lean();
  const now = view(doc || {});
  let message = "Not enough gems.";
  if (now.gems >= cost) {
    if (def.kind === "stock") message = "You can not hold that many Streak Freezes (the most is 2).";
    else if (def.kind === "timed") message = "Double Gems is already running.";
    else if (def.kind === "repair") message = "That day is already covered. Your streak is safe.";
    else message = "Could not complete that purchase. Try again.";
  }
  return { ok: false, status: 409, message, state: now };
}

// Uses one Streak Freeze to cover one missed day (the app asks for yesterday).
async function protect(studentId, date) {
  if (typeof date !== "string" || !DAY_KEY.test(date)) return { ok: false, status: 400, message: "Invalid day." };
  const t = Date.now();
  const lo = new Date(t - 3 * 86400000).toISOString().slice(0, 10);
  const hi = new Date(t + 86400000).toISOString().slice(0, 10);
  if (date < lo || date > hi) return { ok: false, status: 400, message: "That day is out of range." };

  const done = await Student.findOneAndUpdate(
    { _id: studentId, shopFreezes: { $gt: 0 }, protectedDays: { $ne: date } },
    { $inc: { shopFreezes: -1 }, $push: { protectedDays: { $each: [date], $slice: -90 } } },
    { new: true }
  ).select(FIELDS).lean();
  forgetStudent(studentId);
  if (done) return { ok: true, state: view(done) };
  return { ok: false, status: 409, message: "No Streak Freeze to use.", state: await state(studentId) };
}

// Sends gems to someone you are friends with.
async function gift(studentId, toId) {
  if (!toId || String(toId) === String(studentId) || !/^[a-f0-9]{24}$/i.test(String(toId))) {
    return { ok: false, status: 400, message: "Pick a friend to gift." };
  }
  const link = await Friendship.findOne({
    status: "accepted",
    $or: [{ requester: studentId, recipient: toId }, { requester: toId, recipient: studentId }],
  }).lean();
  if (!link) return { ok: false, status: 403, message: "You can only gift friends." };

  const taken = await Student.findOneAndUpdate(
    { _id: studentId, gems: { $gte: GIFT_AMOUNT } },
    { $inc: { gems: -GIFT_AMOUNT } },
    { new: true }
  ).select(FIELDS).lean();
  if (!taken) return { ok: false, status: 409, message: "Not enough gems.", state: await state(studentId) };

  const got = await Student.findOneAndUpdate({ _id: toId }, { $inc: { gems: GIFT_AMOUNT } }, { new: true }).select("_id").lean();
  if (!got) {
    // The friend's account is gone: give the gems back.
    await Student.updateOne({ _id: studentId }, { $inc: { gems: GIFT_AMOUNT } });
    forgetStudent(studentId);
    return { ok: false, status: 404, message: "That friend could not be found.", state: await state(studentId) };
  }
  forgetStudent(studentId);
  forgetStudent(toId);
  return { ok: true, state: view(taken) };
}

module.exports = { ITEMS, GIFT_AMOUNT, isItem, prices, packs, live, state, buy, protect, gift };
