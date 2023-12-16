const Joi = require("joi");

module.exports = {
  comment: Joi.string().max(2000),
};
