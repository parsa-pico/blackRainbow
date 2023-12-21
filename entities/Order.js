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
            stock: "$cartItem.stock",
            productName: "$cartItem.productName",
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
    totalPrice = parseInt(totalPrice[0].totalPrice);
    return totalPrice;
  }
}
module.exports = Order;
