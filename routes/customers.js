const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../services/mongodb");
const { default: axios } = require("axios");
const bcrypt = require("bcrypt");
const customerAuth = require("../middlewares/customerAuth");
const validate = require("../middlewares/validate");
const {
  generateRandomCode,
  codeExpired,
  cookieOptions,
} = require("../utils/common.js");
const loginSchema = require("../models/login");
const customerSchema = require("../models/customer");
const phoneNumberSchema = require("../models/phoneNumer");
const loginSmsSchema = require("../models/login-sms");
const config = require("../configs.json");
const { v4: uuidv4 } = require("uuid");
const { transfer } = require("../controllers/transferCart");
const anonymousAuth = require("../middlewares/anonymousAuth");

// router.post("/login", validate(loginSchema), async (req, res) => {
//   const { phoneNumber, password } = req.body;
//   const user = await db.findOne("customers", { phoneNumber });
//   if (!user) return res.status(404).send("کاربر یافت نشد");

//   const { firstName, lastName, phoneNumber: p, _id, isAdmin } = user;
//   const correctPass = await bcrypt.compare(password, user.password);
//   if (!correctPass) return res.status(400).send("رمز صحیح نمیباشد");
//   const token = jwt.sign(
//     {
//       firstName,
//       lastName,
//       phoneNumber: p,
//       _id,
//       isAdmin: isAdmin || false,
//     },
//     process.env.JWT_PRIVATE_KEY
//   );
//   return res.send(token);
// });

router.post("/send-code", validate(phoneNumberSchema), async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await db.findOne("customers", { phoneNumber });
  if (!user) {
    await db.insertOne("customers", {
      phoneNumber,
      codeTime: new Date(),
      code: generateRandomCode(4).toString(),
      isAdmin: false,
    });
  }

  const threshold = config.codeExpires; //in seconds
  const { isExpired, remaning } = user
    ? codeExpired(user.codeTime, threshold)
    : { isExpired: true, remaning: 0 };

  if (!isExpired)
    return res.send({
      msg: "کد ارسال شده است،چند دقیقه صبر کنید",
      codeExpires: remaning,
    });
  const randomCode = generateRandomCode(4).toString();
  const sandBox = true;
  try {
    if (!sandBox) {
      const { data } = await axios.post(
        "https://api.sms.ir/v1/send/verify",
        {
          mobile: phoneNumber,
          templateId: 100000,
          parameters: [
            {
              name: "Code",
              value: randomCode,
            },
          ],
        },
        {
          headers: {
            "x-api-key": process.env.SMS_KEY,
          },
        }
      );
      console.log(data);
    }
  } catch (error) {
    console.log(error);
    return res.status(499).send("سامانه پیامکی در دسترس نمیباشد");
  }

  const result = await db.updateOne(
    "customers",
    { phoneNumber },
    { code: randomCode, codeTime: new Date() }
  );
  console.log(result);
  return res.send({ msg: "کد ارسال شد", codeExpires: config.codeExpires });
});
router.post(
  "/login-sms",
  anonymousAuth,
  validate(loginSmsSchema),
  async (req, res, next) => {
    const { phoneNumber, code } = req.body;
    const user = await db.findOne("customers", { phoneNumber });
    if (!user) return res.status(404).send("کاربر یافت نشد");
    const threshold = config.codeExpires; //minutes
    const { isExpired, remaning } = codeExpired(user.codeTime, threshold);
    if (isExpired) return res.status(403).send("کد منقضی شده است");

    const correctCode = user.code === code;
    if (!correctCode) return res.status(400).send("کد اشتباه است");
    const { firstName, lastName, _id, isAdmin } = user;
    const userInfo = {
      firstName,
      lastName,
      phoneNumber,
      _id,
      isAdmin: isAdmin || false,
    };
    const token = jwt.sign(userInfo, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "30d",
    });
    userInfo.exp = jwt.decode(token).exp * 1000; //convert it to millis

    req.user = userInfo;
    req.token = token;
    next();
  },
  transfer
);
router.post("/login-anonymous", async (req, res) => {
  const sessionId = uuidv4();
  res.cookie("sessionId", sessionId, { ...cookieOptions, httpOnly: false });
  res.clearCookie("token");
  res.send({ msg: "session id sent" });
});
router.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.send({ msg: "خروج انجام شد" });
});
// router.post(
//   "/sign-up-nopass",
//   validate(phoneNumberSchema),
//   async (req, res) => {
//     const { phoneNumber } = req.body;
//     const result = await db.insertOne("customers", {
//       phoneNumber,
//       codeTime: new Date(),
//       code: generateRandomCode(4).toString(),
//     });
//     res.send(result);
//   }
// );
// router.post("/sign-up", validate(customerSchema), async (req, res) => {
//   const { phoneNumber, password } = req.body;
//   user = await db.findOne("customers", { phoneNumber });
//   if (user) return res.status(409).send("شماره تلفن تکراری است");
//   encryptedPass = await bcrypt.hash(password, 10);
//   const result = await db.insertOne("customers", {
//     phoneNumber,
//     password: encryptedPass,
//     codeTime: new Date(),
//     code: generateRandomCode(4).toString(),
//   });
//   res.send(result);
// });

// router.post("/reset-pass", async (req, res) => {
//   const { phoneNumber, code, password } = req.body;
//   const user = await db.findOne("customers", { phoneNumber });
//   if (!user) return res.status(404).send("کاربر یافت نشد");
//   const threshold = config.codeExpires; //minutes

//   const { isExpired, remaning } = codeExpired(user.codeTime, threshold);
//   if (isExpired) return res.status(403).send("کد منقضی شده است");
//   console.log(code, user.code);
//   const correctCode = user.code === code;
//   if (!correctCode) return res.status(400).send("کد اشتباه است");
//   encryptedPass = await bcrypt.hash(password, 10);
//   const result = await db.updateOne(
//     "customers",
//     { phoneNumber },
//     {
//       code: generateRandomCode(4).toString(),
//       password: encryptedPass,
//       codeTime: new Date(),
//     }
//   );
//   return res.send(result);
// });

module.exports = router;
