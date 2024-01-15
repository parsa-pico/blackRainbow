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
const ordermanipulate = require("../models/orderManipulate");
const SMS = require("../services/sms");
const { setDateTimeToZero } = require("../utils/common");
const persianStatus = {
  1: "در انتظار پرداخت",
  2: "پرداخت شده",
  6: "پردازش شده",
  3: "ارسال شده",
  4: "پرداخت ناموفق",
  5: "کنسل شده",
};
router.get("/", customerAuth, async (req, res) => {
  const query = { userId: new ObjectId(req.user._id) };
  const orders = await db
    .getDbColletion("orders")
    .find(query)
    .sort({ _id: -1 })
    .project({ status: 1, createdAt: 1, totalPrice: 1, paymentMethod: 1 })
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
    const { schedule } = req.body;
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

    const scheduledOrder = await Order.getScheduledOrder(req.user._id);
    if (scheduledOrder && req.body.schedule) {
      return res
        .status(400)
        .send({ msg: "شما یک سفارش به تاخیر انداخته دارید" });
    }
    const postPrice = scheduledOrder ? 0 : configs.postPrice;

    totalPrice += postPrice;

    const obj = {
      ...req.body,
      userId: new ObjectId(req.user._id),
      createdAt: new Date(),
      status: OrderStatus.pending,
      updatedAt: new Date(),
      totalPrice,
      // remaningPrice: totalPrice,
      postPrice,
    };
    if (schedule) obj.schedule = new Date(schedule);
    if (scheduledOrder) obj.schedule = scheduledOrder.schedule;
    if (obj.schedule) obj.schedule = setDateTimeToZero(obj.schedule);

    const { insertedId } = await db.insertOne("orders", obj);
    cart = cart.map((c) => {
      const obj = {
        quantity: c.quantity,
        itemId: new ObjectId(c.itemId),
        orderId: new ObjectId(insertedId),
        price: c.price,
        // isPayed: false,
      };
      if (c.options) obj.options = c.options;
      return obj;
    });
    const bulkOperations = cart.map(({ itemId, quantity }) => ({
      updateOne: {
        filter: { _id: itemId },
        update: { $inc: { stock: -quantity }, $inc: { sold: quantity } },
      },
    }));
    await db.getDbColletion("items").bulkWrite(bulkOperations);
    await db.insertMany("orderItems", cart);
    await db.deleteMany("carts", { userId: new ObjectId(order.userId) });
    await SMS.notifyAdminNewPurchase();
    return res.send({ insertedId, msg: "خرید ثبت شد" });
  }
);

router.put("/:id", adminAuth, validate(ordermanipulate), async (req, res) => {
  const { status, postTrackingCode } = req.body;
  const obj = { status, postTrackingCode, updatedAt: new Date() };

  const result = await db.updateOne(
    "orders",
    { _id: new ObjectId(req.params.id) },
    obj
  );
  if (result.matchedCount === 0)
    return res.status(404).send({ msg: "سفارش پیدا نشد" });

  return res.send({ msg: "سفارش آپدیت شد" });
});
router.delete("/:id", adminAuth, async (req, res) => {});

module.exports = router;
