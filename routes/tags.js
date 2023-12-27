const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");

router.get("/", customerAuth, async (req, res) => {
  const categories = await (await db.find("tags", {})).toArray();

  return res.send(categories);
});
router.post("/get-by-title", customerAuth, async (req, res) => {
  const { title } = req.body;
  const categories = await (
    await db
      .getDbColletion("tags")
      .find({
        title: { $regex: new RegExp(title) },
      })
      .limit(10)
  ).toArray();

  return res.send(categories);
});

router.post("/", adminAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).send(" نام اجباری است");

  const { insertedId } = await db.insertOne("tags", { title });
  return res.send({ msg: "تگ اضافه شد", obj: { _id: insertedId, title } });
});

router.put("/:tagId", adminAuth, async (req, res) => {
  const tagId = req.params.tagId;
  const { title } = req.body;
  if (!title) {
    return res.status(400).send("نام اجباری است  ");
  }
  const tag = await db.findOne("tags", {
    _id: new ObjectId(tagId),
  });

  if (!tag) {
    return res.status(404).send("  تگ پیدا نشد");
  }

  await db.updateOne("tags", { _id: new ObjectId(tagId) }, { title });

  return res.send({ msg: "تگ اپدیت شد  " });
});
module.exports = router;
