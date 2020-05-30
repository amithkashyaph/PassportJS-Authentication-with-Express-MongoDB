const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Model
const User = require("../models/User");

module.exports = function (passport) {
  // Serialize user using id
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // De-Serialize user using id to extract user data
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            done(null, false, { message: "Invalid Email ID" });
          }

          // Match Password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              throw err;
            }

            if (isMatch) {
              done(null, user);
            } else {
              done(null, false, { message: "Incorrect Password" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/users/google/callback",
      },

      function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          console.log(profile);
          User.findOne({ email: profile.emails[0].value }, function (
            err,
            user
          ) {
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, user);
            } else {
              let newUser = new User();
              newUser.googleId = profile.id;
              newUser.token = accessToken;
              newUser.name = profile.displayName;
              newUser.email = profile.emails[0].value;

              newUser.save((err) => {
                if (err) throw err;
                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );

  // Facebook strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/users/facebook/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        User.findOne({ email: profile.emails[0].value }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          } else {
            const user = new User();
            user.name = profile.displayName;
            user.email = profile.emails[0].value;
            user.token = accessToken;
            user.save((err) => {
              if (err) {
                throw err;
              }
              return done(null, user);
            });
          }
        });
      }
    )
  );
};
