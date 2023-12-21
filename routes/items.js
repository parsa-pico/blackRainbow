const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const itemSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");

router.get("/:id", customerAuth, validate(itemSchema), async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی کالا معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("محصول پیدا نشد");

  return res.send(item);
});
async function checkCategory(category) {
  const foundCategory = await db.findOne("categories", {
    _id: new ObjectId(category),
  });
  return foundCategory;
}
router.post("/test", async (req, res) => {
  console.log(req.body);
  return res.send("ok");
});
router.post("/", adminAuth, validate(itemSchema), async (req, res) => {
  // TODO:create a collection of tags and use those
  const { category, subCategory } = req.body;
  const foundCategory = await checkCategory(category);
  const foundSubCategory = await checkCategory(subCategory);
  if (!foundCategory || !foundSubCategory)
    return res.status(404).send("کتگوری پیدا نشد");
  await db.insertOne("items", {
    ...req.body,
    category: new ObjectId(category),
    subCategory: new ObjectId(subCategory),
  });
  return res.send("کالا ثبت شد");
});
router.put("/:id", adminAuth, validate(itemSchema), async (req, res) => {
  let { category, options, subCategory } = req.body;
  const query = { _id: new ObjectId(req.params.id) };
  const item = await db.findOne("items", query);
  if (!item) return res.status(404).send("محصول پیدا نشد");

  const foundCategory = await checkCategory(category);
  const foundSubCategory = await checkCategory(subCategory);
  if (!foundCategory || !foundSubCategory)
    return res.status(404).send("کتگوری پیدا نشد");

  obj = {
    ...req.body,
    category: new ObjectId(category),
    subCategory: new ObjectId(subCategory),
  };
  if (options && options.length > 0) {
    options = options.map((opt) => new ObjectId(opt));
    obj.options = options;
  }
  await db.updateOne("items", query, obj);
  return res.send("کالا ادیت شد");
});
router.delete("/:id", adminAuth, validate(itemSchema), async (req, res) => {
  //if it has any order you should not be able to delete it
  // if (!ObjectId.isValid(req.params.id))
  //   return res.status(400).send("ایدی کالا معتبر نیست");
  // const query = { _id: new ObjectId(req.params.id) };
  // const item = await db.findOne("items", query);
  // if (!item) return res.status(404).send("محصول پیدا نشد");
  // await db.deleteOne("items", query);
  // return res.send("کالا حذف شد");
});

module.exports = router;
