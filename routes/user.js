const express = require("express");

const router = express.Router();

const User = require("../models/user");

const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const userController = require("../controllers/user");
const isAuthCont = require("../middleware/is-auth");

router.get(
  "/user/recipes/:userId",
  isAuthCont.isAuth,
  userController.getUsersCreatedRecipes
);

router.get(
  "/user/favouriteRecipes/:userId",
  isAuthCont.isAuth,
  userController.getUsersFavouriteRecipes
);

router.post(
  "/user/favouriteRecipes/:userId",
  isAuthCont.isAuth,
  userController.addRecipeToFavourites
);

router.put(
  "/user/update-profile/:userId",
  isAuthCont.isAuth,
  [
    body("username", "Username should be at least 3 characters long.")
      .trim()
      .isLength({ min: 3 })
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((user) => {
          if (user && user._id.toString() !== req.params.userId.toString()) {
            return Promise.reject("User with this username already exists.");
          }
        });
      }),
  ],
  userController.updateProfile
);

router.put(
  "/change-password/:userId",
  isAuthCont.isAuth,
  [
    body("password")
      .trim()
      .custom((value, { req }) => {
        return User.findById(req.params.userId).then((user) => {
          return bcrypt.compare(value, user.password).then((isValid) => {
            if (!isValid) {
              return Promise.reject("Wrong password!");
            }
          });
        });
      }),
    body(
      "newPassword",
      "Password should be at least 5 characters long and contain a number."
    )
      .trim()
      .isLength({ min: 5 })
      .matches(/\d/),
    body("confirmedNewPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          return Promise.reject("Has to match with new password");
        } else {
          return true;
        }
      }),
  ],
  userController.changePassword
);

router.delete(
  "/user/deleteRecipe/:userId",
  isAuthCont.isAuth,
  userController.deleteRecipe
);

router.delete(
  "/user/account/:userId",
  isAuthCont.isAuth,
  userController.deleteUserAccount
);

module.exports = router;
