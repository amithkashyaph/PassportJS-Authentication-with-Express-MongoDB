require("dotenv").config();

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { forwardAuthenticated } = require("../config/auth");
const sendSms = require("../services/sms");
const sendWhatsappMessage = require("../services/whatsapp");
const sendMail = require("../services/email");

// Login Render
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Render
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Handle Google authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Handle Facebook Authentication
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["profile", "email"],
  })
);

// Handle Register for new users
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  var errors = [];

  //   Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  //   Check Password match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check Password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be atleast 6 characters long" });
  }

  console.log(errors);

  // Check if its a valid request
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Request Valid and Now See if the user already exists
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // user exists
        errors.push({ msg: "Email already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          password2,
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set Password Hash
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered. Please continue to login"
                );

                // On successfull register send a message to the user
                sendSms();
                res.redirect("http://localhost:3001/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Handle Login and on success redirect to twilio URL to send SMS and Whatsapp Text
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/login/twilio",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Handle Logout from the home page and redirect  to login page
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have successfully logged out");
  res.redirect("http://localhost:3001/login");
});

// Google callback - when a google account is used for logging in
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
    successRedirect: "/users/login/twilio",
  })
);

// Facebook callback - when facebook account is used for logging in
router.get(
  "facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/users/login/twilio",
    failureRedirect: "/failed",
  })
);

// Twilio implementation - send SMS, Gmail and Whatsapp text on suucessful logIn.
router.get("/login/twilio", (req, res) => {
  sendSms();
  sendWhatsappMessage();
  sendMail();

  res.redirect("http://localhost:3001/home");
});

module.exports = router;
