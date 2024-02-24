const ItemSort = {
  1: { score: { $meta: "textScore" } }, // most relevant
  2: { views: -1 }, // most  viewd
  3: { _id: -1 }, // newset
  4: { _id: 1 }, //oldset
  5: { sold: -1 }, //most sold
  6: { price: 1 }, //chipest
  7: { price: -1 }, //most expensive
  8: { originalPrice: -1 }, // discounted products
};

module.exports = ItemSort;
