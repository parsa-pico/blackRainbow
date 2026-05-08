const express = require('express');
const router = express.Router();
const db = require('../services/mongodb');
const adminAuth = require('../middlewares/adminAuth');
const cartSchema = require('../models/cart');
const { ObjectId } = require('mongodb');
const customerAuth = require('../middlewares/customerAuth');
const getUser = require('../middlewares/getUser');
const anonymousAuth = require('../middlewares/anonymousAuth');
const validate = require('../middlewares/validate');
const configs = require('../configs.json');
const Order = require('../entities/Order');

router.post('/count-cart', anonymousAuth(false), async (req, res) => {
  const { user, sessionId } = req;
  if (!user && !sessionId) return res.send({ count: 0 });
  const query = {};
  if (user) query.userId = new ObjectId(req.user._id);
  else query.sessionId = sessionId;
  const result = await db.countCollection('carts', query);
  return res.send({ count: result });
});

router.get('/', anonymousAuth(), async (req, res) => {
  const { user, sessionId } = req;

  const query = {};
  if (user) query.userId = new ObjectId(req.user._id);
  else query.sessionId = sessionId;

  const cart = await db
    .getCollection(undefined, 'carts')
    .aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId', // field in the "carts" collection
          foreignField: '_id', // field in the "items" collection
          as: 'cartItem',
        },
      },
      { $unwind: '$cartItem' },
      {
        $project: {
          productName: '$cartItem.productName',
          picture: { $arrayElemAt: ['$cartItem.pictures', 0] },
          quantity: 1,
          price: '$cartItem.price',
          options: 1,
          itemId: 1,
          originalPrice: '$cartItem.originalPrice',
        },
      },
    ])
    .toArray();
  let postPrice = parseInt(process.env.POST_PRICE);
  if (user) {
    const scheduledOrder = await Order.getScheduledOrder(user._id);

    if (scheduledOrder) postPrice = 0;
  }

  return res.send({ cart, postPrice });
});

router.get('/:itemId', anonymousAuth(), async (req, res) => {
  const { sessionId, user } = req;
  const query = { itemId: new ObjectId(req.params.itemId) };
  if (user) query.userId = new ObjectId(user._id);
  else query.sessionId = sessionId;

  const result = await db.findOne('carts', query);

  return res.send(result);
});

router.post(
  '/new/:itemId',
  anonymousAuth(),
  validate(cartSchema),
  async (req, res) => {
    const { sessionId, user } = req;
    let { quantity, options } = req.body;
    const obj = {
      quantity: parseInt(quantity),
      itemId: new ObjectId(req.params.itemId),
    };
    quantity = Math.max(0, quantity);
    const query = { itemId: obj.itemId };
    if (options) obj['options'] = options; //TODO:check if these options are valid
    if (user) {
      obj.userId = new ObjectId(user._id);
      query.userId = obj.userId;
    } else {
      obj.sessionId = sessionId;
      query.sessionId = obj.sessionId;
    }

    const item = await db.findOne('items', {
      _id: obj.itemId,
    });
    if (!item) return res.status(404).send('کالا وجود ندارد');
    if (quantity > item.stock)
      return res.status(400).send('تعداد درخواستی بیشتر از موجودی انبار است');

    try {
      const cartItem = await db.findOne('carts', query);
      if (!cartItem) {
        obj.createdAt = new Date();

        const result = await db.insertOne('carts', obj);
        return res.send({
          obj: { _id: result.insertedId, ...obj },
          msg: 'به سبد اضافه شد',
        });
      }
      //update
      if (
        (user && cartItem.userId.toString() !== req.user._id) ||
        (!user && sessionId !== cartItem.sessionId)
      )
        return res.status(403).send({ msg: 'این کالا مربوط به شما نیست' });

      if (quantity <= 0) {
        await db.deleteOne('carts', {
          _id: cartItem._id,
        });
        return res.send('کالا حذف شد');
      }

      const result = await db.updateOne('carts', { _id: cartItem._id }, obj);
      return res.send({ obj, msg: 'کالا ادیت شد' });
    } catch (error) {
      console.log(error);
      if (error.code === 11000)
        return res.status(400).send('کالا در سبد میباشد');
    }
  },
);

module.exports = router;
