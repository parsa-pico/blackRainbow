const ItemSort = {
  1: { score: { $meta: "textScore" } }, // most relevant
  2: { views: -1 }, // most  viewd
  3: { sold: -1 }, //most sold
  3: { _id: 1 }, // newset
  4: { _id: -1 }, //oldset
};

module.exports = ItemSort;
