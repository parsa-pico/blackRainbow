const Joi = require("joi");

module.exports = {
  trackId: Joi.string().required().max(500),
  id: Joi.string().required().max(500),
};
