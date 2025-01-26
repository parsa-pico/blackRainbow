const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const cookies = req.cookies;
  // if (!cookies) return res.status(401).send("کوکی وجود ندارد");
  if (!cookies) return res.status(401).send("دوباره وارد اکانت شوید");

  const { token } = cookies;
  // if (!token) return res.status(401).send("توکن وجود ندارد");
  if (!token) return res.status(401).send("دوباره وارد اکانت شوید");

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    // res.status(400).send("توکن نامعتبر ");
    res.status(400).send("دوباره وارد اکانت شوید");
  }
};
