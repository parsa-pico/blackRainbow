const db = require("../services/mongodb");
const { ObjectId } = require("mongodb");

class Order {
  constructor(userId) {
    this.userId = userId;
  }
  async getCart() {
    const cart = await db
      .getDbColletion("carts")
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
  async getOrder(orderId) {
    const order = await db
      .getDbColletion("orders")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(orderId),
          },
        },
        {
          $lookup: {
            from: "orderItems", // Target collection to join
            localField: "_id", // Field from the 'orders' collection
            foreignField: "orderId", // Field from the 'orderItems' collection
            as: "orderItems", // Output field name
          },
        },
        {
          $unwind: "$orderItems", // Deconstruct the array created by $lookup
        },
        {
          $lookup: {
            from: "items", // Target collection to join
            localField: "orderItems.itemId", // Field from the 'orderItems' collection
            foreignField: "_id", // Field from the 'items' collection
            as: "item", // Output field name
          },
        },
        {
          $unwind: "$item", // Deconstruct the array created by $lookup
        },
        {
          $group: {
            _id: "$_id", // Group by order ID
            createdAt: { $first: "$createdAt" },
            firstName: { $first: "$firstName" },
            lastName: { $first: "$lastName" },
            province: { $first: "$province" },
            city: { $first: "$city" },
            address: { $first: "$address" },
            postalCode: { $first: "$postalCode" },
            paymentMethod: { $first: "$paymentMethod" },
            paymentPicture: { $first: "$paymentPicture" },
            status: { $first: "$status" },
            updatedAt: { $first: "$updatedAt" },
            totalPrice: { $first: "$totalPrice" },
            // remaningPrice: { $first: "$remaningPrice" },
            postPrice: { $first: "$postPrice" },
            postTrackingCode: { $first: "$postTrackingCode" },
            description: { $first: "$description" },
            schedule: { $first: "$schedule" },
            phoneNumber: { $first: "$phoneNumber" },

            items: {
              $push: {
                itemId: "$item._id",
                productName: "$item.productName",
                quantity: "$orderItems.quantity",
                price: "$orderItems.price",
                options: "$orderItems.options",
                picture: { $first: "$item.pictures" },
              },
            },
          },
        },
      ])
      .toArray();

    return order[0];
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
  static async getScheduledOrder(userId) {
    return await db.findOne("orders", {
      schedule: { $exists: true, $gt: new Date() },
      status: 2,
      userId: new ObjectId(userId),
      postPrice: { $ne: 0 },
    });
  }
}
module.exports = Order;
