const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const orderSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const { validate } = require("../utils/common.js");
const customerAuth = require("../middlewares/customerAuth");
orderStatus = {
  1: "نهایی نشده",
  3: "در انتظار پرداخت",
  4: "پرداخت موفق",
  5: "ارسال شده",
  6: "پرداخت ناموفق",
};
router.get("/", customerAuth, async (req, res) => {
  const query = { userId: new ObjectId(req.user._id) };
  const order = await db.find("carts", query).toArray();
  return res.send(order);
});

router.post("/:itemId", customerAuth, async (req, res) => {
  let { quantity } = req.body;
  if (!quantity) quantity = 1;
  const item = await db.findOne("items", {
    _id: new ObjectId(req.params.itemId),
  });
  if (!item) return res.status(404).send("کالا وجود ندارد");
  if (quantity > item.stock)
    return res.status(400).send("تعداد درخواستی بیشتر از موجودی انبار است");
  await db.insertOne("carts", {
    userId: new ObjectId(req.user._id),
    quantity,
    itemId: new ObjectId(req.params.itemId),
  });
  return res.send("کالا به سید اضافه  شد");
});
router.put("/:id", adminAuth, async (req, res) => {
  const r = validate(orderSchema, req.body, res);
  if (r) return;

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی کالا معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("محصول پیدا نشد");
  const { category } = req.body;
  if (!ObjectId.isValid(category))
    return res.status(400).send("کتگوری معتبر نیست");
  const foundCategory = await db.findOne("categories", {
    _id: new ObjectId(category),
  });
  if (!foundCategory) return res.status(404).send("این کتگوری وجود ندارد");
  await db.updateOne("items", query, {
    ...req.body,
    category: new ObjectId(category),
  });
  return res.send("کالا ادیت شد");
});
router.delete("/:id", adminAuth, async (req, res) => {
  const r = validate(orderSchema, req.body, res);
  if (r) return;

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی کالا معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("محصول پیدا نشد");

  await db.deleteOne("items", query);
  return res.send("کالا حذف شد");
});

module.exports = router;
