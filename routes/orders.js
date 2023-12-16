const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const orderSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const { validate } = require("../utils/common.js");
const customerAuth = require("../middlewares/customerAuth");
orderStatus = {
  1: "در انتظار پرداخت",
  2: "پرداخت موفق",
  3: "ارسال شده",
  4: "پرداخت ناموفق",
};
router.get("/:id", customerAuth, async (req, res) => {
  const r = validate(orderSchema, req.body, res);
  if (r) return;

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی خرید معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const order = await db.findOne("items", query);
  if (!order) return res.status(404).send("خرید پیدا نشد");

  return res.send(order);
});

router.post("/", customerAuth, async (req, res) => {
  const r = validate(orderSchema, req.body, res);
  if (r) return;
  await db.insertOne("items", {
    ...req.body,
  });
  return res.send("کالا ثبت شد");
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
