const { ObjectId } = require("mongodb");
const db = require("../services/mongodb");
const { cookieOptions } = require("../utils/common");

const transfer = async (req, res) => {
  // TODO: transactionnnnn
  const { sessionId, user, token } = req;
  if (!sessionId)
    return res.status(400).send("sesseion id required for transfer");

  const userId = new ObjectId(user._id);

  let currentItemIds = await (
    await db
      .getDbColletion("carts")
      .find({
        userId,
      })
      .project({ itemId: 1, _id: 0 })
  ).toArray();

  currentItemIds = currentItemIds.map((obj) => obj.itemId);

  await db.getDbColletion("carts").updateMany(
    { sessionId, itemId: { $nin: currentItemIds } },
    {
      $set: { userId },
      $unset: { sessionId: "" },
    }
  );

  await db.deleteMany("carts", { sessionId });

  res.cookie("token", token, cookieOptions);
  res.clearCookie("sessionId");

  return res.send({ msg: "ورود انجام شد،ایتم ها منتقل شد", userInfo: user });
};
exports.transfer = transfer;
