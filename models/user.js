// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    token: { type: String, unique: true, sparse: true, index: true },
    resetToken: { type: String },
    resetTokenExp: { type: Date },
  },
  { timestamps: true }
);

// 🔽 IMPORTANT : réutilise le modèle s'il existe déjà
module.exports = mongoose.models?.users || mongoose.model("users", userSchema);
