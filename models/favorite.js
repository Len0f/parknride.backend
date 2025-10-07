// models/Favorite.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    placeId: { type: String, required: true },
    name: String,
    latitude: Number,
    longitude: Number,
    address: String,
    type: String,
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, placeId: 1 }, { unique: true });

// 🔽 Réutilise le modèle si déjà compilé
module.exports =
  mongoose.models?.favorites || mongoose.model("favorites", favoriteSchema);
