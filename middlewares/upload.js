const path = require("path");
const multer = require("multer");
const configs = require("../configs.json");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./pictures");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

upload_image = function (req, res, next) {
  let maxSize = 1024;
  maxSize *= req.user.isAdmin
    ? configs.adminFileLimit
    : configs.customerFileLimit;
  req.maxSize = maxSize / 1024;
  const fileSize = maxSize;

  const upload = multer({
    storage,

    limits: {
      fileSize,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp"
      ) {
        cb(null, true);
      } else {
        cb(new Error("پسوند عکس قابل قبول نیس", 400), false);
      }
    },
  });

  upload.single("picture")(req, res, function (err) {
    if (err) {
      next(err);
    }
    next();
  });
};

exports.upload_image = upload_image;
