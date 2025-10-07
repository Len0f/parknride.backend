var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.json({ ok: true, app: "ParkNride Backend" });
});

module.exports = router;
