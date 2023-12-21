const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const orderSchema = require("../models/order");
const { ObjectId } = require("mongodb");
const customerAuth = require("../middlewares/customerAuth");
const validate = require("../middlewares/validate");
const Order = require("../entities/Order");
OrderStatus = require("../enums/orderStatus");
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
    for (let item of cart) {
      if (item.stock - item.quantity < 0)
        return res.status(400).send(`${item.productName} out of stock`);
    }

    if (cart.length === 0) return res.status(400).send("سبد خرید شما خالی است");
    let totalPrice = await order.getTotalPrice();
    const { schedule } = req.body;
    const obj = {
      ...req.body,
      userId: new ObjectId(req.user._id),
      createdAt: new Date(),
      status: OrderStatus.pending,
      updatedAt: new Date(),
      totalPrice,
      remaningPrice: totalPrice,
    };
    if (schedule) obj["schedule"] = new Date(schedule);
    const { insertedId } = await db.insertOne("orders", obj);
    cart = cart.map((c) => ({
      quantity: c.quantity,
      itemId: new ObjectId(c.itemId),
      orderId: new ObjectId(insertedId),
      price: c.price,
    }));
    const bulkOperations = cart.map(({ itemId, quantity }) => ({
      updateOne: {
        filter: { _id: itemId },
        update: { $inc: { stock: -quantity } },
      },
    }));
    await db.getCollection(undefined, "items").bulkWrite(bulkOperations);
    await db.insertMany("orderItems", cart);
    //TODO:remove items from cart
    return res.send({ insertedId, msg: "خرید ثبت شد" });
  }
);

router.put("/:id", adminAuth, async (req, res) => {});
router.delete("/:id", adminAuth, async (req, res) => {});

module.exports = router;
