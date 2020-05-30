const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  forwardAuthenticated,
  loggedIn,
} = require("../config/auth");

router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  console.log(req.user);
  res.render("dashboard", {
    user: req.user,
  });
});

module.exports = router;
