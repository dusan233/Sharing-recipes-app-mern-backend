module.exports = (req, res, next) => {
  // req.body.tags =
  //   req.body.tags === "" ? req.body.tags.split("") : req.body.tags.split(",");
  // req.body.ingredients =
  //   req.body.ingredients === ""
  //     ? req.body.ingredients.split("")
  //     : req.body.ingredients.split(",");
  // req.body.instructions =
  //   req.body.instructions === ""
  //     ? req.body.instructions.split("")
  //     : req.body.instructions.split(",");
  console.log(req.body.ingredients);

  next();
};
