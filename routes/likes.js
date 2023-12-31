const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const optionSchema = require("../models/option");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");

// router.get("/", customerAuth, async (req, res) => {
//   const reuslt = await (
//     await db
//       .getDbColletion("likes")
//       .find({ userId: new ObjectId(req.user._id) })
//       .sort({ _id: 1 })
//   ).toArray();
//   return res.send(reuslt);
// });
router.get("/:itemId", customerAuth, async (req, res) => {
  const itemId = new ObjectId(req.params.itemId);
  const userId = new ObjectId(req.user._id);

  const result = (await db.get("likes").findOne({ itemId, userId })) || false;

  return res.send(result);
});

router.post("/:itemId", customerAuth, async (req, res) => {
  const itemId = new ObjectId(req.params.itemId);
  const userId = new ObjectId(req.user._id);

  const result = await db.get("likes").insertOne({ itemId, userId });
  console.log(result);
  return res.send({ msg: "محصول به علاقه مندی ها اضافه شد" });
});

router.delete("/:itemId", customerAuth, async (req, res) => {
  const itemId = new ObjectId(req.params.itemId);
  const userId = new ObjectId(req.user._id);

  await db.get("likes").deleteOne({ itemId, userId });

  return res.send({ msg: "محصول از علاقه مندی ها حذف شد" });
});

module.exports = router;
