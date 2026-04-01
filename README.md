# Park'n'Ride — Backend

API REST du projet Park'n'Ride. Gère l'authentification des utilisateurs et sert d'intermédiaire avec les données de parkings velo.

Frontend : [github.com/Len0f/parknride.frontend](https://github.com/Len0f/parknride.frontend)

## Technologies

- **Runtime** : Node.js
- **Framework** : Express 5
- **Base de données** : MongoDB (Mongoose 8)
- **Authentification** : bcrypt, uid2
- **Langage** : JavaScript
- **Déploiement** : Vercel

## Fonctionnalites

- Inscription et connexion avec authentification sécurisée (bcrypt + token uid2)
- Gestion des utilisateurs
- API REST structurée avec routes et modèles séparés

## Structure du projet

- `bin/` — Point d'entrée du serveur
- `models/` — Modèles Mongoose
- `routes/` — Définition des routes Express
- `app.js` — Configuration Express

## Auteur

**Caroline Viot** — Développeuse web fullstack JS  
[GitHub](https://github.com/Len0f)
