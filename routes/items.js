const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const getUser = require("../middlewares/getUser");
const itemSchema = require("../models/item");
const { ObjectId } = require("mongodb");
const validate = require("../middlewares/validate");
const customerAuth = require("../middlewares/customerAuth");
const Joi = require("joi");
const ItemSort = require("../enums/ItemSort");

router.get("/:id", getUser, async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  if (!req.user) query.private = false;
  let isAdmin = false;
  if (req.user && req.user.isAdmin) isAdmin = true;

  const item = await db
    .getCollection(undefined, "items")
    .aggregate([
      {
        $match: query,
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $lookup: {
          from: "categories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryData",
        },
      },
      {
        $unwind: "$subCategoryData",
      },
      {
        $lookup: {
          from: "options",
          localField: "options",
          foreignField: "_id",
          as: "optionsData",
        },
      },

      {
        $limit: 1, // Limit to one document
      },

      {
        $project: {
          category: 0,
          options: 0,
          subCategory: 0,
        },
      },

      {
        $project: {
          sold: {
            $cond: {
              if: isAdmin,
              then: "$sold",
              else: "$$REMOVE",
            },
          },
          views: {
            $cond: {
              if: isAdmin,
              then: "$views",
              else: "$$REMOVE",
            },
          },
          categoryData: 1,
          customersPictures: 1,
          description: 1,
          optionsData: 1,
          pictures: 1,
          price: 1,
          productName: 1,
          subCategoryData: 1,
          tags: 1,
          stock: 1,
          brand: 1,
        },
      },
    ])
    .toArray();

  if (!req.user || !isAdmin)
    await db.getDbColletion("items").updateOne(query, { $inc: { views: 1 } });

  if (!item) return res.status(404).send("محصول پیدا نشد");

  return res.send(item);
});
async function checkCategory(category) {
  const foundCategory = await db.findOne("categories", {
    _id: new ObjectId(category),
  });
  return foundCategory;
}
router.post("/get-by-keyword", getUser, async (req, res) => {
  const { search, category, subCategory, sortIndex } = req.body;

  const projcetObj = { productName: 1, price: 1, pictures: 1, stock: 1 };
  let searchObj = {};
  let result;
  if (!req.user) searchObj.private = false;
  if (category) searchObj.category = new ObjectId(category);
  if (subCategory) searchObj.subCategory = new ObjectId(subCategory);
  let options = {};
  if (search) {
    searchObj.$text = { $search: search };
    options = { score: { $meta: "textScore" } };
  }

  const sortBy = ItemSort[sortIndex] || (search ? ItemSort[1] : ItemSort[2]);
  result = await (
    await db
      .getDbColletion("items")
      .find(searchObj, options)
      .sort(sortBy)
      .project(projcetObj)
  ).toArray();

  return res.send({ result, sortBy });
});
router.post("/", adminAuth, validate(itemSchema), async (req, res) => {
  let { category, subCategory, options } = req.body;
  const foundCategory = await checkCategory(category);
  const foundSubCategory = await checkCategory(subCategory);
  if (!foundCategory || !foundSubCategory)
    return res.status(404).send("کتگوری پیدا نشد");

  if (foundCategory._id.toString() !== foundSubCategory.parentId.toString())
    return res.status(400).send("کتگوری و ساب کتگوری مطابقت ندارد");
  obj = {
    ...req.body,
    sold: 0,
    private: req.body.private || false,
    category: new ObjectId(category),
    subCategory: new ObjectId(subCategory),
    views: 0,
  };

  if (options && options.length > 0) {
    options = options.map((opt) => new ObjectId(opt));
    obj.options = options;
  }
  await db.insertOne("items", obj);
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
  if (foundCategory._id.toString() !== foundSubCategory.parentId.toString())
    return res.status(400).send("کتگوری و ساب کتگوری مطابقت ندارد");
  obj = {
    ...req.body,
    private: req.body.private || false,
    category: new ObjectId(category),
    subCategory: new ObjectId(subCategory),
  };
  if (options && options.length > 0) {
    options = options.map((opt) => new ObjectId(opt));
    obj.options = options;
  }
  const result = await db.updateOne("items", query, obj);
  console.log(result);
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
// router.post(
//   "/add-view",
//   validate({ _id: Joi.string().required() }),
//   async (req, res) => {
//     const { _id } = req.body;

//     await db.updateOne(
//       "items",
//       { _id: new ObjectId(_id) },
//       { $inc: { views: 1 } }
//     );
//     return res.send("view added");
//   }
// );
module.exports = router;
