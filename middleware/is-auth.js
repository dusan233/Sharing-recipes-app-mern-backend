const jwt = require("jsonwebtoken");

exports.isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not auth");
    error.statusCode = 401;
    error.message = "You are not authorized";
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    err.statusCode = 500;
    err.message = "Unauthorized";
    throw err;
  }
  if (!decodeToken) {
    const error = new Error("Not auth");
    error.statusCode = 401;
    error.message = "You are not authorized";
    throw error;
  }

  if (req.params.userId.toString() !== decodeToken.userId.toString()) {
    const error = new Error();
    error.statusCode = 401;
    error.message = "You are not authorized";
    throw error;
  }

  req.userId = decodeToken.userId;
  next();
};
