const express = require("express");

const router = express.Router();
const recipeController = require("../controllers/recipes");
const isAuthCont = require("../middleware/is-auth");
const prepareForValidation = require("../middleware/prepareForValidation");
const { body } = require("express-validator");

router.post(
  "/add-recipe/:userId",
  isAuthCont.isAuth,
  prepareForValidation,
  [
    body("title", "Title should have at least 3 characters.")
      .trim()
      .isLength({ min: 3 }),
    body("description", "Description should have at least 10 characters.")
      .trim()
      .isLength({ min: 10 }),
    body("ingredients")
      .isArray()
      .withMessage("You need to put at least 2 ingredients.")
      .isLength({ min: 1 })
      .withMessage("You need to put at least 2 ingredients."),
    body("instructions")
      .isLength({ min: 1 })
      .withMessage("You need to give some instructions."),
    body("tags")
      .isLength({ min: 1 })
      .withMessage("You need to put at least 1 tag")
  ],
  recipeController.addRecipe
);

router.post(
  "/recipe/review/:userId/:recipeId",
  [
    body("rate")
      .isNumeric()
      .withMessage("You forgot to rate or comment recipe."),
    body("comment")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You forgot to rate or comment recipe.")
  ],
  recipeController.addRecipeReview
);

router.get("/toprated-recipes", recipeController.getBestRatedRecipes);

router.get("/recipes", recipeController.getAllRecipes);

router.post("/recipes/filter/:page", recipeController.filterRecipes);

router.get("/latest-recipes", recipeController.getLatestRecipes);

router.get("/recipe/:recipeId/:userId", recipeController.getRecipeDetails);

module.exports = router;
