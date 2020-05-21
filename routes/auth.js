const express = require("express");

const User = require("../models/user");
const { body } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");

const authControllers = require("../controllers/auth");

router.post(
  "/signup",
  [
    body("username", "Username should be at least 3 characters long.")
      .trim()
      .isLength({ min: 3 })
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((user) => {
          console.log(value);
          console.log(user, "hekj there pall");
          if (user) {
            return Promise.reject("User with this username already exists.");
          }
        });
      }),
    body("email", "Please enter a valid email .")
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          console.log(value);
          console.log(user, "hekj there pall");
          if (user) {
            return Promise.reject("User with this email already exists.");
          }
        });
      })
      .withMessage("User with this email already exists."),
    body(
      "password",
      "Password should be at least 5 characters long and contain a number."
    )
      .trim()
      .isLength({ min: 5 })
      .matches(/\d/),
  ],
  authControllers.signUp
);

router.post(
  "/login",
  [
    body(
      "email",
      "There was a problem logging in. Check your email and password or create an account."
    )
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          console.log(user);
          if (!user) {
            return Promise.reject(
              "There was a problem logging in. Check your email and password or create an account."
            );
          }
        });
      }),
    body(
      "password",
      "There was a problem logging in. Check your email and password or create an account."
    ).custom((value, { req }) => {
      return User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
          return bcrypt.compare(value, user.password).then((isValid) => {
            if (!isValid) {
              return Promise.reject(
                "There was a problem logging in. Check your email and password or create an account."
              );
            }
          });
        }
      });
    }),
  ],
  authControllers.logIn
);

module.exports = router;
