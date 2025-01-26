const jwt = require("jsonwebtoken");
module.exports = function wrapper(force = true) {
  return function (req, res, next) {
    const cookies = req.cookies;
    // if (!cookies) return res.status(401).send({ msg: "کوکی وجود ندارد" });
    if (!cookies)
      return res.status(401).send({ msg: "دوباره وارد اکانت شوید" });

    const { token, sessionId } = cookies;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = decoded;
        return next();
      } catch (error) {
        console.log(error);
        // return res.status(401).send("token is invalid");
        return res.status(401).send("دوباره وارد اکانت شوید");
      }
    } else if (sessionId) {
      req.sessionId = sessionId;
      next();
    } else {
      // if (force) return res.status(403).send("token or session id is required");
      if (force) return res.status(403).send("دوباره وارد اکانت شوید");
      else next();
    }
  };
};
