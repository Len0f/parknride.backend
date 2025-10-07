var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/user");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// ========================= SIGNUP =========================
router.post("/signup", async (req, res) => {
  try {
    if (!checkBody(req.body, ["username", "email", "password"])) {
      return res.json({ result: false, error: "Champs manquants ou vides" });
    }
    const email = String(req.body.email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return res.json({
        result: false,
        error: `${email} n'est pas une adresse valide`,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ result: false, error: `${email} existe déjà` });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email,
      passwordHash: hash,
      token: uid2(32),
    });

    const dataUser = await newUser.save();

    // CHANGEMENT : renvoyer _id + token (et masquer passwordHash)
    return res.json({
      result: true,
      user: {
        _id: dataUser._id,
        username: dataUser.username,
        email: dataUser.email,
        token: dataUser.token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Erreur interne" });
  }
});

// ========================= SIGNIN =========================
router.post("/signin", async (req, res) => {
  try {
    if (!checkBody(req.body, ["email", "password"])) {
      return res.json({ result: false, error: "Champs manquants ou vides" });
    }
    const email = String(req.body.email).trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(req.body.password, user.passwordHash)) {
      return res.json({
        result: false,
        error: "Utilisateur introuvable ou mot de passe incorrect",
      });
    }

    // CHANGEMENT : renvoyer _id (pas id) + token + username + email
    return res.json({
      result: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: user.token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: "Erreur interne" });
  }
});

// ========================= ME (sans middleware) =========================
// Récupère le user via le token (query ?token=..., header Authorization: Bearer ..., ou body.token)
router.get("/me", async (req, res) => {
  try {
    // CHANGEMENT : on NE dépend pas de req.isAuthenticated()
    const bearer = (req.headers.authorization || "").startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.query.token || req.body.token || bearer;

    if (!token) {
      return res.status(401).json({ result: false, error: "Token manquant" });
    }

    const user = await User.findOne({ token }).select(
      "_id username email token"
    );
    if (!user) {
      return res
        .status(401)
        .json({ result: false, error: "Utilisateur inconnu" });
    }

    return res.json({ result: true, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: false, error: "Erreur interne" });
  }
});

// ========================= UPDATE ME =========================
router.put("/me", async (req, res) => {
  try {
    // On accepte token en body OU Authorization: Bearer
    const bearer = (req.headers.authorization || "").startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.body.token || bearer;

    if (!token) {
      return res
        .status(401)
        .json({ result: false, error: "Utilisateur inconnu" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(401)
        .json({ result: false, error: "Utilisateur inconnu" });
    }

    const allowed = ["username", "email"];
    const updates = {};

    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        updates[k] = req.body[k];
      }
    }

    if (updates.email) {
      updates.email = String(updates.email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(updates.email)) {
        return res.status(400).json({ result: false, error: "Email invalide" });
      }
    }

    if (req.body.password) {
      updates.passwordHash = await bcrypt.hash(String(req.body.password), 12);
    }

    Object.assign(user, updates);
    const saved = await user.save();
    const { passwordHash, ...safeUser } = saved.toObject();
    return res.json({ result: true, user: safeUser });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.json({
        result: false,
        error: "Email ou username déjà utilisé",
      });
    }
    console.error(err);
    return res.status(500).json({ result: false, error: "Erreur interne" });
  }
});

// ========================= DELETE ME =========================
router.delete("/", async (req, res) => {
  try {
    const bearer = (req.headers.authorization || "").startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.body.token || bearer;

    if (!token) {
      return res.json({ result: false, error: "Token manquant" });
    }

    const deletedUser = await User.findOneAndDelete({ token });
    if (deletedUser) {
      return res.json({ result: true, message: "Utilisateur supprimé" });
    }
    return res.json({
      result: false,
      error: "Utilisateur introuvable ou déjà supprimé",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, error: "Erreur interne" });
  }
});

module.exports = router;
