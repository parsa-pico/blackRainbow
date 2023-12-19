const Joi = require("joi");

module.exports = {
  productName: Joi.string().required().max(100),
  category: Joi.string().required().max(255),
  brand: Joi.string().max(100),
  price: Joi.number().required().max(1e9),
  description: Joi.string().required().max(2000),
  stock: Joi.number().required(),
};
