const Joi = require("joi");

module.exports = {
  firstName: Joi.string().required().max(100),
  lastName: Joi.string().required().max(100),
  city: Joi.string().required().max(20),
  address: Joi.string().required().max(500),
  description: Joi.string().max(600),
  postalCode: Joi.string().required().max(30),
};
