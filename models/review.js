const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    rate: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    creatorUsername: {
      type: String,
      required: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Review", reviewSchema);
