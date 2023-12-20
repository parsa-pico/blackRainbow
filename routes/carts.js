const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const cartSchema = require("../models/cart");
const { ObjectId } = require("mongodb");
const customerAuth = require("../middlewares/customerAuth");
const validate = require("../middlewares/validate");
router.get("/", customerAuth, async (req, res) => {
  const cart = await db
    .getCollection(undefined, "carts")
    .aggregate([
      {
        $match: {
          userId: new ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "itemId", // field in the "carts" collection
          foreignField: "_id", // field in the "items" collection
          as: "cartItem",
        },
      },
      { $unwind: "$cartItem" },
    ])
    .toArray();
  return res.send(cart);
});

router.post(
  "/:itemId",
  customerAuth,
  validate(cartSchema),
  async (req, res) => {
    if (!ObjectId.isValid(req.params.itemId))
      return res.status(400).send("ایدی کالا معتبر نیست");
    let { quantity, options } = req.body;

    quantity = parseInt(quantity);
    const item = await db.findOne("items", {
      _id: new ObjectId(req.params.itemId),
    });
    if (!item) return res.status(404).send("کالا وجود ندارد");
    if (quantity > item.stock)
      return res.status(400).send("تعداد درخواستی بیشتر از موجودی انبار است");
    try {
      const obj = {
        userId: new ObjectId(req.user._id),
        quantity,
        itemId: new ObjectId(req.params.itemId),
      };
      if (options) obj["options"] = options; //TODO:check if these options are valid
      const result = await db.insertOne("carts", obj);
      return res.send({ ...result, msg: "کالا به سبد اضافه  شد" });
    } catch (error) {
      if (error.code === 11000)
        return res.status(400).send("کالا در سبد میباشد");
    }
  }
);
router.put(
  "/:cartItemId",
  customerAuth,
  validate(cartSchema),
  async (req, res) => {
    if (!ObjectId.isValid(req.params.cartItemId))
      return res.status(400).send("ایدی کالا معتبر نیست");
    let { quantity, options } = req.body;

    quantity = parseInt(quantity);
    const cartItem = await db.findOne("carts", {
      _id: new ObjectId(req.params.cartItemId),
    });
    if (!cartItem) return res.status(404).send("کالا وجود ندارد");
    const item = await db.findOne("items", { _id: cartItem.itemId });

    if (quantity > item.stock)
      return res.status(400).send("تعداد درخواستی بیشتر از موجودی انبار است");
    if (quantity === 0) {
      await db.deleteOne("carts", {
        _id: new ObjectId(req.params.cartItemId),
      });
      return res.send("کالا حذف شد");
    }
    const obj = { quantity };
    if (options) obj["options"] = options;
    await db.updateOne(
      "carts",
      {
        _id: new ObjectId(req.params.cartItemId),
      },
      obj
    );
    return res.send("کالا ادیت شد");
  }
);
router.delete("/", customerAuth, async (req, res) => {
  await db.deleteMany("carts", { userId: new ObjectId(req.user._id) });
  return res.send("سبد خالی شد");
});
module.exports = router;
