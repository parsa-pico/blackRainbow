const Joi = require("joi");

module.exports = {
  status: Joi.number().min(1).max(6).required(),
  postTrackingCode: Joi.string().max(200),
};
