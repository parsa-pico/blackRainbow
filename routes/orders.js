const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const orderSchema = require("../models/order");
const { ObjectId } = require("mongodb");
const customerAuth = require("../middlewares/customerAuth");
const validate = require("../middlewares/validate");
const Order = require("../entities/Order");
const PaymentMethod = require("../enums/paymentMethod");
const OrderStatus = require("../enums/orderStatus");
const configs = require("../configs.json");
const ordermanipulate = require("../models/ordermanipulate");
const persianStatus = {
  1: "در انتظار پرداخت",
  2: "پرداخت شده",
  3: "ارسال شده",
  4: "پرداخت ناموفق",
  5: "کنسل شده",
  6: "پردازش شده",
};
router.get("/", customerAuth, async (req, res) => {
  const query = { userId: new ObjectId(req.user._id) };
  const orders = await db
    .getDbColletion("orders")
    .find(query)
    .sort({ _id: -1 })
    .project({ status: 1, createdAt: 1, totalPrice: 1 })
    .toArray();

  return res.send({ orders, OrderStatus: persianStatus });
});

router.post("/admin-get", adminAuth, async (req, res) => {
  const { phoneNumber } = req.body;

  const ordersQuery = {};
  if (phoneNumber) {
    const user = await db.findOne("customers", { phoneNumber });
    if (!user) return res.status(404).send("کاربر یافت نشد");
    ordersQuery.userId = user._id;
  }
  const orders = await db
    .getDbColletion("orders")
    .find(ordersQuery)
    .sort({ _id: -1 })
    .project({ status: 1, createdAt: 1, totalPrice: 1, paymentMethod: 1 })
    .toArray();

  return res.send({ orders, OrderStatus: persianStatus });
});

router.get("/:id", customerAuth, async (req, res) => {
  const order = new Order();
  const result = await order.getOrder(req.params.id);
  if (!result) return res.status(404).send("خرید پیدا نشد");

  return res.send({ result, OrderStatus: persianStatus });
});

router.post(
  "/submitPurchase",
  customerAuth,
  validate(orderSchema),
  async (req, res) => {
    //TODO: when purchasd send an sms

    //TODO:replace this with transactions
    // const session = db.client.startSession();
    // session.startTransaction();
    // await session.abortTransaction();
    // await session.commitTransaction();
    // session.endSession();
    if (
      req.body.paymentMethod === PaymentMethod.cardPayment &&
      !req.body.paymentPicture
    )
      return res.status(400).send({ msg: "عکس فیش الزامی است" });

    const order = new Order(req.user._id);
    let cart = await order.getCart();
    for (let item of cart) {
      if (item.stock - item.quantity < 0)
        return res.status(400).send(`${item.productName} out of stock`);
    }

    if (cart.length === 0) return res.status(400).send("سبد خرید شما خالی است");
    let totalPrice = await order.getTotalPrice();
    totalPrice += configs.postPrice; //TODO:if  there is one order that has not been sent,do not add post price
    const { schedule } = req.body;
    const obj = {
      ...req.body,
      userId: new ObjectId(req.user._id),
      createdAt: new Date(),
      status: OrderStatus.pending,
      updatedAt: new Date(),
      totalPrice,
      remaningPrice: totalPrice,
      postPrice: configs.postPrice,
    };
    if (schedule) obj["schedule"] = new Date(schedule);
    const { insertedId } = await db.insertOne("orders", obj);
    cart = cart.map((c) => {
      const obj = {
        quantity: c.quantity,
        itemId: new ObjectId(c.itemId),
        orderId: new ObjectId(insertedId),
        price: c.price,
        isPayed: false,
      };
      if (c.options) obj.options = c.options;
      return obj;
    });
    const bulkOperations = cart.map(({ itemId, quantity }) => ({
      updateOne: {
        filter: { _id: itemId },
        update: { $inc: { stock: -quantity } },
      },
    }));
    await db.getDbColletion("items").bulkWrite(bulkOperations);
    await db.insertMany("orderItems", cart);

    await db.deleteMany("carts", { userId: new ObjectId(order.userId) });
    return res.send({ insertedId, msg: "خرید ثبت شد" });
  }
);

router.put("/:id", adminAuth, validate(ordermanipulate), async (req, res) => {
  const { status, postTrackingCode } = req.body;
  const result = await db.updateOne(
    "orders",
    { _id: new ObjectId(req.params.id) },
    { status, postTrackingCode, updatedAt: new Date() }
  );
  if (result.matchedCount === 0)
    return res.status(404).send({ msg: "سفارش پیدا نشد" });

  return res.send({ msg: "سفارش آپدیت شد" });
});
router.delete("/:id", adminAuth, async (req, res) => {});

module.exports = router;
