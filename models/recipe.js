const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    serves: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    course: {
      type: String,
      required: true
    },
    cookingTime: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    public: {
      type: Boolean,
      required: true
    },
    creator: {
      type: String,
      required: true
    },
    averageRate: {
      type: Number,
      required: true
    },
    ingredients: [],
    instructions: [],
    tags: [],
    recipeImages: [String],
    user: {
      type: Schema.Types.ObjectId,
      required: true
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Recipe", recipeSchema);
