const jwt = require("jsonwebtoken");
module.exports = function wrapper(force = true) {
  return function (req, res, next) {
    const cookies = req.cookies;
    if (!cookies) return res.status(401).send({ msg: "کوکی وجود ندارد" });

    const { token, sessionId } = cookies;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = decoded;
        return next();
      } catch (error) {
        console.log(error);
        return res.status(401).send("token is invalid");
      }
    } else if (sessionId) {
      req.sessionId = sessionId;
      next();
    } else {
      if (force) return res.status(403).send("token or session id is required");
      else next();
    }
  };
};
