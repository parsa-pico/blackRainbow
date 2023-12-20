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

router.post(
  "/submitPurchase",
  customerAuth,
  validate(orderSchema),
  async (req, res) => {
    //TODO:replace this with transactions
    // const session = db.client.startSession();
    // session.startTransaction();
    // await session.abortTransaction();
    // await session.commitTransaction();
    // session.endSession();
    const order = new Order(req.user._id);
    let cart = await order.getCart();
    let totalPrice = await order.getTotalPrice();

    const { insertedId } = await db.insertOne("orders", {
      ...req.body,
      userId: new ObjectId(req.user._id),
      createdAt: new Date(),
      status: 1,
      updatedAt: new Date(),
      totalPrice,
      remaningPrice: totalPrice,
    });
    cart = cart.map((c) => ({
      quantity: c.quantity,
      itemId: new ObjectId(c.itemId),
      orderId: new ObjectId(insertedId),
      price: c.price,
    }));
    await db.insertMany("orderItems", cart);
    return res.send("خرید ثبت شد");
  }
);

router.put("/:id", adminAuth, async (req, res) => {});
router.delete("/:id", adminAuth, async (req, res) => {});

module.exports = router;
