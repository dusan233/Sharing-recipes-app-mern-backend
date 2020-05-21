const Recipe = require("../models/recipe");
const User = require("../models/user");
const Review = require("../models/review");

const io = require("../socket");
const { validationResult } = require("express-validator");

exports.addRecipe = (req, res, next) => {
  const errors = validationResult(req);

  if (req.files.length === 0 && !req.uploadErr) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();

    error.data.push({
      msg: "You need to select  one image",
      param: "images"
    });
    throw error;
  }

  if (req.uploadErr) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();

    error.data.push({
      msg: "All files must be of type image",
      param: "images"
    });
    throw error;
  }

  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const userId = req.userId;

  const title = req.body.title;
  const serves = req.body.serves;
  const cookingTime = req.body.cookingTime;
  const difficulty = req.body.difficulty;
  const description = req.body.description;
  const category = req.body.category;
  const course = req.body.course;
  const public = req.body.public;
  const ingredients = req.body.ingredients;
  const instructions = req.body.instructions;
  const tags = req.body.tags;
  const recipeImages = req.files.map(file => {
    return file.path.replace("\\", "/");
  });

  let recipeData;

  User.findById(userId)
    .then(user => {
      const recipe = new Recipe({
        title: title,
        serves: serves,
        cookingTime: cookingTime,
        difficulty: difficulty,
        category: category,
        course: course,
        description: description,
        public: public,
        creator: user.username,
        ingredients: ingredients,
        instructions: instructions,
        tags: tags,
        recipeImages: recipeImages,
        averageRate: 0,
        user: userId
      });
      recipeData = recipe;
      user.createdRecipes.push(recipeData._id);
      return user.save();
    })
    .then(data => {
      return recipeData.save();
    })
    .then(result => {
      res.status(201).json({
        message: "You submited recipe successfully"
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getRecipeDetails = (req, res, next) => {
  const recipeId = req.params.recipeId;
  const userId = req.params.userId;

  Recipe.findById(recipeId)
    .populate("reviews")
    .then(recipe => {
      if (userId === "null") {
        if (!recipe.public) {
          const error = new Error();
          error.statusCode = 401;
          error.message = "You are not authorizedqqq!";
          error.data = {
            permission: false
          };
          throw error;
        } else {
          res.status(200).json({
            recipe: recipe,
            message: "You successfully fetched recipe!"
          });
        }
      } else {
        if (!recipe.public) {
          if (recipe.user.toString() !== userId.toString()) {
            const error = new Error();
            error.statusCode = 401;
            error.message = "You are not authorized!";
            error.data = {
              permission: false
            };
            throw error;
          } else {
            res.status(200).json({
              recipe: recipe,
              message: "You successfully fetched recipe!"
            });
          }
        } else {
          res.status(200).json({
            recipe: recipe,
            message: "You successfully fetched recipe!"
          });
        }
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addRecipeReview = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.message = "Send correct data please.";
    error.data = errors.array()[0];
    throw error;
  }

  const userId = req.params.userId;
  const recipeId = req.params.recipeId;
  const rate = req.body.rate;
  const comment = req.body.comment;

  let numberOfReviews;
  let sumOfReviews;

  Recipe.findById(recipeId)
    .populate("reviews")
    .then(recipe => {
      numberOfReviews = recipe.reviews.length + 1;
      sumOfReviews = recipe.reviews.reduce((sum, rev) => {
        return sum + rev.rate;
      }, 0);

      recipe.reviews.forEach(rev => {
        if (rev.creatorId.toString() === userId.toString()) {
          const error = new Error();
          (error.statusCode = 409),
            (error.message = "You already reviewed this recipe.");
          throw error;
        }
      });

      return User.findById(userId)
        .then(user => {
          return user.save();
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .then(user => {
      const review = new Review({
        rate: rate,
        comment: comment,
        creatorUsername: user.username,
        creatorId: user._id
      });

      return review.save();
    })
    .then(review => {
      return Recipe.findById(recipeId)
        .then(recipe => {
          recipe.reviews.push(review._id);
          recipe.averageRate = (sumOfReviews + review.rate) / numberOfReviews;
          return recipe.save();
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .then(recipe => {
      Recipe.findById(recipe._id)
        .populate("reviews")
        .then(recipe => {
          io.getIO().emit("reviews", {
            action: "create",
            reviews: recipe.reviews
          });
          res.status(200).json({
            message: "You send review successfully!",
            recipe: recipe
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getLatestRecipes = (req, res, next) => {
  Recipe.find({ public: true })
    .sort({ createdAt: -1 })
    .populate("reviews")
    .limit(3)
    .then(recipes => {
      res.status(200).json({
        message: "You fetched recipes successfully!",
        recipes: recipes
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getBestRatedRecipes = (req, res, next) => {
  Recipe.find({ public: true })
    .sort({ averageRate: -1, createdAt: -1 })
    .populate("reviews")
    .limit(3)
    .then(recipes => {
      res.status(200).json({
        message: "You fetched recipes successfully!",
        recipes: recipes
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getAllRecipes = (req, res, next) => {
  Recipe.find()
    .populate("reviews")
    .then(recipes => {
      res.status(200).json({
        message: "Recipes fetched successfully!",
        recipes: recipes
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.filterRecipes = (req, res, next) => {
  const currentPage = req.params.page || 1;
  console.log(req.params.page);
  const perPage = 9;
  let totalItems;
  const query = {};
  const filters = req.body.filters;

  for (let key in filters) {
    let objecto = filters[key];

    for (let keyTwo in filters[key]) {
      if (objecto[keyTwo] !== "") {
        if (typeof query[key] === "undefined") {
          query[key] = objecto[keyTwo];
        } else if (typeof query[key] === "string") {
          const firstValue = query[key];
          let values = [];
          values.push(firstValue);
          values.push(objecto[keyTwo]);
          query[key] = [...values];
        } else {
          let values = [...query[key]];
          values.push(objecto[keyTwo]);
          query[key] = [...values];
        }
      } else if (
        objecto[keyTwo] !== "" &&
        (objecto[keyTwo] === "0-20 mintues" ||
          objecto[keyTwo] === "20-30 mintues" ||
          objecto[keyTwo] === "30-50 mintues" ||
          objecto[keyTwo] === "50+ mintues")
      ) {
      }
    }
  }

  console.log(query);

  Recipe.find(query)
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Recipe.find(query)
        .populate("reviews")
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(recipes => {
      res.status(200).json({
        message: "Recipes fetched successfully!",
        recipes: recipes,
        totalItems: totalItems,
        currentPage: currentPage
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
