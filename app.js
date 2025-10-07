require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Routers
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var favoritesRouter = require("./routes/favorites");

var app = express();

// Database connection
var cors = require("cors");
app.use(cors());
app.get("/ping", (req, res) => res.json({ ok: true, time: Date.now() }));

// 404
app.use((req, res) =>
  res.status(404).json({ error: "Not Found", path: req.path })
);
// 500
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: "Internal", message: err.message });
});

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/favorites", favoritesRouter);

module.exports = app;
