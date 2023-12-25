const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");
const adminAuth = require("../middlewares/adminAuth");
const verifyPaymentSchema = require("../models/verifyPayment");
const { ObjectId } = require("mongodb");
const customerAuth = require("../middlewares/customerAuth");
const validate = require("../middlewares/validate");
const Order = require("../entities/Order");
const IdPay = require("../entities/IdPay");
OrderStatus = require("../enums/orderStatus");
PaymentStatus = require("../enums/paymetnStatus");

router.post(
  "/make-payment",
  customerAuth,

  async (req, res) => {
    let { orderId } = req.body;
    orderId = new ObjectId(orderId);
    if (!orderId) return res.status(400).send("آیدی خرید وارد نشده");
    const order = await db.findOne("orders", { _id: orderId });
    if (!order) return res.status(404).send("سفارش وجود ندارد");
    if (order.remaningPrice < 1000)
      return res.status(409).send("پرداخت انجام شده است");
    if (order.userId != req.user._id)
      return res.status(403).send("سفارش با توکن کاربر مغایرت دارد");
    const amount = order.remaningPrice;
    let paymentId, link;
    try {
      const payment = await IdPay.makePayment(orderId, amount);
      paymentId = payment.id;
      link = payment.link;
    } catch (error) {
      return res.status(500).send("اختلال درگاه پرداخت");
    }
    await db.insertOne("payments", {
      _id: paymentId,
      link,
      status: PaymentStatus.pending,
      orderId,
      createdAt: new Date(),
      payedAt: null,
      amount,
      trackId: null,
    });
    return res.send({ paymentId, link });
  }
);

router.post(
  "/verify",
  customerAuth,
  validate(verifyPaymentSchema),
  async (req, res) => {
    //TODO: transaction
    const { id, trackId } = req.body;
    const payment = await db.findOne("payments", { _id: id });
    if (!payment) return res.status(404).send("پرداخت پیدا نشد");
    if (payment.status == PaymentStatus.successful)
      return res.status(409).send("پرداخت تایید شده است");
    const isVerified = await IdPay.fakeisVerifiedPayment(10);
    if (!isVerified) {
      await db.updateOne(
        "payments",
        { _id: id },
        { staus: PaymentStatus.failed }
      );
      return res.status(402).send("پرداخت ناموفق");
    }
    await db.updateOne(
      "payments",
      { _id: id },
      { status: PaymentStatus.successful, trackId }
    );

    await db.updateOne(
      "orders",
      { _id: payment.orderId },
      { status: OrderStatus.successful, remaningPrice: 0 }
    );
    await db.updateMany(
      "orderItems",
      { orderId: payment.orderId },
      { isPayed: true }
    );
    return res.send({ msg: "پرداخت با موفقیت تایید شد" });
  }
);

module.exports = router;
