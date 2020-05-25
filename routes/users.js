const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { forwardAuthenticated } = require("../config/auth");

// Login
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Sign up
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Handle Register
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
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Handle Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Handle Logout
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have successfully logged out");
  res.redirect("/users/login");
});

module.exports = router;
