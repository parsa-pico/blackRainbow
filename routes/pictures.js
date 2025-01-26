const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const itemSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { getPicturePath } = require("../utils/common");

const { upload_image } = require("../middlewares/upload");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/s3Bucket");
const bucketName = process.env.LIARA_BUCKET_NAME;
// router.get("/:picturePath", async (req, res) => {
//   const filePath = getPicturePath(req.params.picturePath);
//   // fs.access(filePath, fs.constants.F_OK, (err) => {
//   //   console.log("err", err);
//   //   if (!err) return res.sendFile(filePath);
//   //   else return res.sendFile(getPicturePath("placeholder.png"));
//   // });
//   res.sendFile(filePath);
// });

router.post("/", adminAuth, upload_image, async (req, res) => {
  console.log(req.file);

  return res.send({
    fileName: req.file.key,
    msg: "عکس اپلود شد",
    filePath: req.file.location,
  });
});

router.post(
  "/payment-picutre",
  customerAuth,
  upload_image,
  async (req, res) => {
    return res.send({
      fileName: req.file.key,
      msg: "عکس اپلود شد",
      filePath: req.file.location,
    });
  }
);
// const bgStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./pictures");
//   },
//   filename: function (req, file, cb) {
//     cb(null, "bg.jpg");
//   },
// });
// const bgMulter = multer({
//   storage: bgStorage,
//   limits: { fileSize: 1024 * 700 },
//   fileFilter: (req, file, cb) => {
//     console.log(file.mimetype);
//     if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
//       cb(null, true);
//     } else {
//       cb(new Error("پسوند عکس باید jpg باشد", 400), false);
//     }
//   },
// });
// router.post(
//   "/background",
//   adminAuth,
//   bgMulter.single("picture"),
//   async (req, res) => {
//     return res.send({
//       fileName: req.file.filename,
//       msg: "عکس اپلود شد",
//       filePath: req.file.path,
//     });
//   }
// );

router.delete("/:picturePath", adminAuth, async (req, res) => {
  const { picturePath } = req.params;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: picturePath,
    });

    const response = await s3.send(command);
    console.log("File deleted successfully:", response);
    return res.send({ msg: "فایل پاک شد" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).send("مشکلی در پاک کردن فایل پیش آمد");
  }
});

module.exports = router;
