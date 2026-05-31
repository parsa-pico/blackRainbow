const multerS3 = require('multer-s3');
const multer = require('multer');
const configs = require('../configs.json');
const path = require('path');
const { s3 } = require('../services/s3Bucket');

const upload_image = function (req, res, next) {
  let maxSize = 1024;
  maxSize *= req.user.isAdmin
    ? configs.adminFileLimit
    : configs.customerFileLimit;
  req.maxSize = maxSize / 1024;
  const fileSize = maxSize;

  const upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.LIARA_BUCKET_NAME, // Your S3 bucket name
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
          null,
          `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
        );
      },
    }),
    limits: {
      fileSize,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/webp'
      ) {
        cb(null, true);
      } else {
        cb(new Error('پسوند عکس قابل قبول نیس', 400), false);
      }
    },
  });

  upload.single('picture')(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      req.fileInfo = {
        size: req.file.size,
        url: req.file.location,
        name: req.file.key,
        type: req.file.mimetype,
      };
      next();
    }
  });
};

module.exports = {
  upload_image,
};
