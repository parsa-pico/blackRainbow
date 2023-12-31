const countCart = async (req, res) => {
  const { user, sessionId } = req;

  const query = {};
  if (user) query.userId = new ObjectId(req.user._id);
  else query.sessionId = sessionId;
  const result = await db.countCollection("carts", query);
  req.cartCount = result;
  next();
};
module.exports = countCart;
