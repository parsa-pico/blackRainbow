const Joi = require("joi");

module.exports = {
  productName: Joi.string().required().max(100),
  category: Joi.string().required().max(255),
  subCategory: Joi.string().required().max(255),
  brand: Joi.string().max(100),
  price: Joi.number().required().max(1e9),
  description: Joi.string().required().max(2000),
  stock: Joi.number().required(),
  private: Joi.boolean(),
  options: Joi.custom((value, helper) => {
    if (
      Array.isArray(value) &&
      value.length >= 0 &&
      value.every((opt) => typeof opt === "string")
    )
      return value;
    else return helper.error("any.custom");
  }).messages({ "any.custom": "فرمت انتخاب ها صحیح نیست" }),

  tags: Joi.array().required(),
  pictures: Joi.array().required(),
  customersPictures: Joi.array(),
};
