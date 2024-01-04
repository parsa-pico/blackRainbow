const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const itemSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");

router.get("/", async (req, res) => {
  const categories = await (
    await db.getDbColletion("categories").aggregate([
      {
        $match: { parentId: { $exists: false } },
      },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "subCategories",
          maxDepth: 1,
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,

          subCategories: {
            $map: {
              input: "$subCategories",
              as: "subcategory",
              in: {
                _id: "$$subcategory._id",
                title: "$$subcategory.title",
              },
            },
          },
        },
      },
    ])
  ).toArray();

  return res.send(categories);
});

router.post("/get-by-title", customerAuth, async (req, res) => {
  const { title } = req.body;
  const categories = await (
    await db
      .getCollection(undefined, "categories")
      .find({
        parentId: null,
        title: { $regex: new RegExp(title) },
      })
      .limit(10)
  ).toArray();

  return res.send(categories);
});
router.post("/get-sub", customerAuth, async (req, res) => {
  let { parentId } = req.body;
  parentId = new ObjectId(parentId);
  const categories = await (
    await db.getDbColletion("categories").find({
      parentId,
    })
  ).toArray();

  return res.send(categories);
});

router.post("/", adminAuth, async (req, res) => {
  const { title, parentId } = req.body;
  if (!title) return res.status(400).send("title is required");
  const obj = { title };
  if (parentId) {
    const parent = await db.findOne("categories", {
      _id: new ObjectId(parentId),
    });
    if (!parent) return res.status(404).send("کتگوری اصلی پیدا نشد");
    obj.parentId = new ObjectId(parentId);
  }

  const { insertedId } = await db.insertOne("categories", obj);
  return res.send({
    msg: "کتگوری اضافه شد",
    obj: {
      _id: insertedId,
      title,
      parentId,
    },
  });
});
router.put("/:categoryId", adminAuth, async (req, res) => {
  const categoryId = req.params.categoryId;
  const { title, parentId } = req.body;
  if (!title) {
    return res.status(400).send("Title is required");
  }
  const category = await db.findOne("categories", {
    _id: new ObjectId(categoryId),
  });

  if (!category) {
    return res.status(404).send("  کتگوری پیدا نشد");
  }

  category.title = title;

  if (parentId) {
    const parent = await db.findOne("categories", {
      _id: new ObjectId(parentId),
    });
    if (!parent) {
      return res.status(404).send("Parent category not found");
    }
    category.parentId = new ObjectId(parentId);
  } else {
    // If parentId is not provided, remove the parentId field
    delete category.parentId;
  }

  // Save the updated category
  await db.updateOne("categories", { _id: new ObjectId(categoryId) }, category);

  return res.send({ msg: "کتگوری اپدیت شد  " });
});
module.exports = router;
