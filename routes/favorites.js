// routes/favorites.js
const express = require("express");
const mongoose = require("mongoose");
const Favorite = require("../models/favorite");
const User = require("../models/User");

const router = express.Router();

/**
 * Petite vérif de base : le userId est bien une ObjectId et l'utilisateur existe.
 * (Pas d'auth : on évite les 500/404 stupides et on renvoie des erreurs propres.)
 */
async function ensureUserExists(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid userId");
    err.status = 400;
    throw err;
  }
  const user = await User.findById(userId).select("_id").lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
}

/**
 * GET /api/favorites/:userId
 * -> Liste des favoris pour cet utilisateur
 */
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    await ensureUserExists(userId);

    const items = await Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /api/favorites/:userId/:placeId
 * -> Upsert d'un favori (ajoute si absent, met à jour les méta si présent)
 * Body JSON possible: { name, latitude, longitude, address, type }
 */
router.put("/:userId/:placeId", async (req, res, next) => {
  try {
    const { userId, placeId } = req.params;
    await ensureUserExists(userId);

    const payload = (({ name, latitude, longitude, address, type }) => ({
      name,
      latitude,
      longitude,
      address,
      type,
    }))(req.body || {});

    const doc = await Favorite.findOneAndUpdate(
      { user: userId, placeId },
      { user: userId, placeId, ...payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ ok: true, item: doc });
  } catch (e) {
    // collisions d'index unique, etc.
    if (e.code === 11000) {
      e.status = 409;
      e.message = "Duplicate favorite";
    }
    next(e);
  }
});

/**
 * DELETE /api/favorites/:userId/:placeId
 * -> Supprime ce favori le cas échéant
 */
router.delete("/:userId/:placeId", async (req, res, next) => {
  try {
    const { userId, placeId } = req.params;
    await ensureUserExists(userId);

    await Favorite.findOneAndDelete({ user: userId, placeId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
