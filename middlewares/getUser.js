const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const cookies = req.cookies;
  if (!cookies) return next();

  const { token } = cookies;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;
    return next();
  } catch (error) {
    console.log(error);
    next();
  }
};
