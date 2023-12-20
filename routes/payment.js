const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const orderSchema = require("../models/order");
const { ObjectId } = require("mongodb");
const customerAuth = require("../middlewares/customerAuth");
const validate = require("../middlewares/validate");
const Order = require("../entities/Order");
orderStatus = {
  1: "در انتظار پرداخت",
  2: "پرداخت موفق",
  3: "ارسال شده",
  4: "پرداخت ناموفق",
};
router.get("/:id", customerAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ایدی خرید معتبر نیست");
  const query = { _id: new ObjectId(req.params.id) };
  const order = await db.findOne("items", query);
  if (!order) return res.status(404).send("خرید پیدا نشد");

  return res.send(order);
});

router.post("/", customerAuth, validate(orderSchema), async (req, res) => {});

router.put("/:id", adminAuth, async (req, res) => {});
router.delete("/:id", adminAuth, async (req, res) => {});

module.exports = router;
