const Joi = require("joi");

module.exports = {
  phoneNumber: Joi.required()
    .custom((value, helper) => {
      const phoneNumberRegex = /^09\d{9}$/;
      if (phoneNumberRegex.test(value)) return value;
      else return helper.error("any.custom");
    })
    .messages({ "any.custom": "فرمت شماره موبایل صحیح نیست" }),
  code: Joi.string().required().max(10),
};
