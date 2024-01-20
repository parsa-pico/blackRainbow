const Joi = require("joi");

module.exports = {
  firstName: Joi.string().required().max(100),
  lastName: Joi.string().required().max(100),
  province: Joi.string().required().max(50),
  city: Joi.string().required().max(50),
  address: Joi.string().required().max(500),
  description: Joi.string().max(600),
  postalCode: Joi.string().required().max(30),
  phoneNumber: Joi.string().required().length(11),
  schedule: Joi.date(),
  paymentMethod: Joi.number().required().min(1).max(2),
  paymentPicture: Joi.string().max(100),
};
