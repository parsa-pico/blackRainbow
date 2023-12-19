const Joi = require("joi");

module.exports = {
  quantity: Joi.number().required().max(100),
};
