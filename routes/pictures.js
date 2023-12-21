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

const upload = multer({ storage });

router.get("/:picturePath", async (req, res) => {
  const filePath = getPicturePath(req.params.picturePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    console.log("err", err);
    if (!err) return res.sendFile(filePath);
    else return res.sendFile(getPicturePath("placeholder.png"));
  });
});

router.post("/", adminAuth, upload.single("picture"), async (req, res) => {
  return res.send({
    fileName: req.file.filename,
    msg: "عکس اپلود شد",
    filePath: req.file.path,
  });
});

module.exports = router;
