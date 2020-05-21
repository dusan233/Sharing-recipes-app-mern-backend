const User = require("../models/user");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        username: username,
        password: hashedPassword,
        email: email,
      });
      return user.save();
    })
    .then((user) => {
      res.status(201).json({
        user: user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.logIn = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Invalid login inputs");
    error.statusCode = 401;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      const token = jwt.sign(
        {
          email: email,
          userId: user._id.toString(),
        },
        "somesupersecretsecret",
        {
          expiresIn: 60 * 30,
        }
      );
      res.status(200).json({
        token: token,
        userId: user._id.toString(),
        username: user.username,
        headline: user.headline,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
