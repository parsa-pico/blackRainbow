const db = require("../services/mongodb");
const { ObjectId } = require("mongodb");
class Order {
  constructor(userId) {
    this.userId = userId;
  }
  async getCart() {
    const cart = await db
      .getCollection(undefined, "carts")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(this.userId),
          },
        },
        {
          $lookup: {
            from: "items",
            localField: "itemId", // field in the "carts" collection
            foreignField: "_id", // field in the "items" collection
            as: "cartItem",
          },
        },
        {
          $unwind: "$cartItem",
        },
        {
          $project: {
            quantity: 1,
            itemId: 1,
            userId: 1,
            options: 1,
            price: "$cartItem.price",
            _id: 0,
          },
        },
      ])
      .toArray();
    return cart;
  }
  async getTotalPrice() {
    let totalPrice = await db
      .getCollection(undefined, "carts")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(this.userId),
          },
        },
        {
          $lookup: {
            from: "items",
            localField: "itemId",
            foreignField: "_id",
            as: "cartItem",
          },
        },
        {
          $unwind: "$cartItem",
        },
        {
          $group: {
            _id: null,
            totalPrice: {
              $sum: { $multiply: ["$cartItem.price", "$quantity"] },
            },
          },
        },
      ])
      .toArray();
    totalPrice = parseFloat(totalPrice[0].totalPrice.toFixed(2));
    return totalPrice;
  }
}
module.exports = Order;
