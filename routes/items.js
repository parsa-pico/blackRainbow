const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const itemSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const { validate } = require("../utils/common.js");
const customerAuth = require("../middlewares/customerAuth");

router.get("/:id", customerAuth, async (req, res) => {
  const r = validate(itemSchema, req.body, res);
  if (r) return;

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی کالا معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("محصول پیدا نشد");

  return res.send(item);
});

router.post("/", adminAuth, async (req, res) => {
  const r = validate(itemSchema, req.body, res);
  if (r) return;
  const { category } = req.body;
  if (!ObjectId.isValid(category))
    return res.status(400).send("کتگوری معتبر نیست");
  const foundCategory = await db.findOne("categories", {
    _id: new ObjectId(category),
  });
  if (!foundCategory) return res.status(404).send("این کتگوری وجود ندارد");
  await db.insertOne("items", {
    ...req.body,
    category: new ObjectId(category),
  });
  return res.send("کالا ثبت شد");
});
router.put("/:id", adminAuth, async (req, res) => {
  const r = validate(itemSchema, req.body, res);
  if (r) return;

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی کالا معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("محصول پیدا نشد");
  let { category, options } = req.body;
  if (!ObjectId.isValid(category))
    return res.status(400).send("کتگوری معتبر نیست");
  const foundCategory = await db.findOne("categories", {
    _id: new ObjectId(category),
  });
  obj = { ...req.body, category: new ObjectId(category) };
  if (options && options.length > 0) {
    options = options.map((opt) => new ObjectId(opt));
    obj.options = options;
  }
  if (!foundCategory) return res.status(404).send("این کتگوری وجود ندارد");
  await db.updateOne("items", query, obj);
  return res.send("کالا ادیت شد");
});
router.delete("/:id", adminAuth, async (req, res) => {
  const r = validate(itemSchema, req.body, res);
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
