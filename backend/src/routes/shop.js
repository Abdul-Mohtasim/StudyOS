"use strict";

const express = require("express");
const requireAuth = require("../middleware/auth");
const shop = require("../services/shop");

const router = express.Router();
router.use(requireAuth);

function send(res, result) {
  if (result.ok) return res.json(result.state);
  return res.status(result.status || 400).json({ message: result.message, ...(result.state || {}) });
}

// GET /api/shop -> { gems, freezes, doubleUntil, protectedDays, owned, prices, live }
//   owned  = premium items this account has bought, for example ["sound", "theme_ocean"]
//   prices = price of every item (and the gift amount)
//   live   = which items are finished and can be bought
router.get("/", async (req, res) => {
  try {
    const state = await shop.state(req.student._id);
    res.json({ ...state, prices: shop.prices(), live: shop.live() });
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not load the shop." });
  }
});

// POST /api/shop/buy { item, date? }
//   item: any key from the catalog (see services/shop.js)
//   date: "YYYY-MM-DD", only for item "repair" (the missed day to bring back)
router.post("/buy", async (req, res) => {
  try {
    const item = String(req.body?.item || "").slice(0, 40);
    const date = typeof req.body?.date === "string" ? req.body.date.slice(0, 10) : "";
    send(res, await shop.buy(req.student._id, item, { date }));
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not complete that purchase." });
  }
});

// POST /api/shop/protect { date: "YYYY-MM-DD" } -> uses one Streak Freeze for that day
router.post("/protect", async (req, res) => {
  try {
    send(res, await shop.protect(req.student._id, req.body?.date));
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not use the Streak Freeze." });
  }
});

// POST /api/shop/gift { userId } -> sends 25 gems to a friend
router.post("/gift", async (req, res) => {
  try {
    send(res, await shop.gift(req.student._id, req.body?.userId));
  } catch (error) {
    req.log?.error?.(error);
    res.status(500).json({ message: "Could not send that gift." });
  }
});

module.exports = router;
