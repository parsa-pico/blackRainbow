const { BSONError } = require("mongodb").BSON;
module.exports = function (err, req, res, next) {
  console.log(err);
  if (err instanceof BSONError) {
    return res.status(400).send("آیدی معتبر نیست");
  }
  return res.status(500).send("خطای غیرمنتظره از سرور");
};
