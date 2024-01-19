const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const optionSchema = require("../models/option");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");

router.get("/", customerAuth, async (req, res) => {
  const userId = new ObjectId(req.user._id);

  const result = await (
    await db.get("likes").aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "itemId",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: "$item",
      },
      { $sort: { _id: -1 } },
      {
        $replaceRoot: { newRoot: "$item" },
      },
      { $project: { pictures: 1, price: 1, productName: 1 } },
    ])
  ).toArray();

  return res.send(result);
});
router.get("/admin-get", adminAuth, async (req, res) => {
  const result = await (
    await db.get("likes").aggregate([
      {
        $lookup: {
          from: "items",
          localField: "itemId",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: "$item",
      },
      {
        $group: {
          _id: "$item._id",
          productName: { $first: "$item.productName" },
          price: { $first: "$item.price" },
          pictures: { $first: "$item.pictures" },
          likesCount: { $sum: 1 },
        },
      },
      { $sort: { likesCount: -1 } },
      // {
      //   $replaceRoot: { newRoot: "$item" },
      // },
      // { $project: { pictures: 1, price: 1, productName: 1 } },
    ])
  ).toArray();

  return res.send(result);
});
// router.get("/:itemId", customerAuth, async (req, res) => {
//   const itemId = new ObjectId(req.params.itemId);
//   const userId = new ObjectId(req.user._id);

//   const result = (await db.get("likes").findOne({ itemId, userId }))
//     ? true
//     : false;

//   return res.send(result);
// });

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
