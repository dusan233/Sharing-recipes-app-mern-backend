const User = require("../models/user");

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.getUsersCreatedRecipes = (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .populate({
      path: "createdRecipes",
      populate: { path: "reviews" },
    })
    .then((user) => {
      res.json({
        usersCreatedReceipes: user.createdRecipes,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUsersFavouriteRecipes = (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .populate({
      path: "favouriteRecipes",
      populate: { path: "reviews" },
    })
    .then((user) => {
      res.json({
        usersFavouriteReceipes: user.favouriteRecipes,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteRecipe = (req, res, next) => {
  const userId = req.params.userId;
  const recipeId = req.body.recipeId;

  User.findById(userId)
    .then((user) => {
      const newCreatedRecipes = user.createdRecipes.filter((recId) => {
        return recId.toString() !== recipeId.toString();
      });
      const newFavouriteRecipes = user.favouriteRecipes.filter((recId) => {
        return recId.toString() !== recipeId.toString();
      });
      user.createdRecipes = newCreatedRecipes;
      user.favouriteRecipes = newFavouriteRecipes;
      return user.save();
    })
    .then((data) => {
      res.status(200).json({
        message: "Recipe successfully deleted!",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addRecipeToFavourites = (req, res, next) => {
  const userId = req.params.userId;
  const recipeId = req.body.recipeId;

  User.findById(userId)
    .then((user) => {
      let favouritesRecipes = [...user.favouriteRecipes];
      console.log(favouritesRecipes);
      let alreadyExists = false;
      let newFavouriteRecipes;
      favouritesRecipes.forEach((recId) => {
        if (recId.toString() === recipeId.toString()) {
          alreadyExists = true;
        }
      });
      if (alreadyExists) {
        newFavouriteRecipes = favouritesRecipes.filter((recId) => {
          return recId.toString() !== recipeId.toString();
        });
      } else {
        console.log(favouritesRecipes);
        favouritesRecipes.push(recipeId);
        newFavouriteRecipes = [...favouritesRecipes];
      }
      user.favouriteRecipes = newFavouriteRecipes;
      return user.save();
    })
    .then((data) => {
      res.status(201).json({
        message: "Success!",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateProfile = (req, res, next) => {
  const userId = req.params.userId;
  const username = req.body.username;
  const headline = req.body.headline;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  User.findById(userId)
    .then((user) => {
      user.username = username;
      if (headline) {
        user.headline = headline;
      }
      return user.save();
    })
    .then((user) => {
      console.log(user);
      res.json({
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

exports.changePassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const userId = req.params.userId;
  const newPassword = req.body.newPassword;

  User.findById(userId)
    .then((user) => {
      bcrypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          return user.save();
        })
        .then((user) => {
          res.json({
            message: "Password successfully changed!",
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteUserAccount = (req, res, next) => {
  const userId = req.params.userId;

  User.findByIdAndRemove(userId)
    .then((user) => {
      res.json({
        message: `Account with username ${user.username} was seccessfully deleted!`,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
