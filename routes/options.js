const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const optionSchema = require("../models/option");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");

router.get("/:id", customerAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی انتخاب معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("انتخاب پیدا نشد");

  return res.send(item);
});

router.post("/", adminAuth, validate(optionSchema), async (req, res) => {
  await db.insertOne("options", {
    ...req.body,
  });
  return res.send("انتخاب ثبت شد");
});
router.put("/:id", adminAuth, validate(optionSchema), async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی انتخاب معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("options", query);
  if (!item) return res.status(404).send("انتخاب پیدا نشد");

  await db.updateOne("options", query, {
    ...req.body,
  });
  return res.send("کالا ادیت شد");
});
router.delete("/:id", adminAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی انتخاب معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("options", query);
  if (!item) return res.status(404).send("انتخاب پیدا نشد");
  const relatedItem = await db.findOne("items", {
    options: new ObjectId(req.params.id),
  });
  if (relatedItem)
    return res.status(403).send("این انتخاب،مربوط به یک کالا است");
  await db.deleteOne("options", query);
  return res.send("انتخاب حذف شد");
});

module.exports = router;
