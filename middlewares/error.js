const { MulterError } = require("multer");

const { BSONError } = require("mongodb").BSON;
module.exports = function (err, req, res, next) {
  console.log(err);
  if (err instanceof BSONError) {
    return res.status(400).send("آیدی معتبر نیست");
  }
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE")
    return res
      .status(400)
      .send(`حجم فایل ارسالی بیش از ${req.maxSize} کیلوبایت است`);
  return res.status(500).send("خطای غیرمنتظره از سرور");
};
