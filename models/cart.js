const Joi = require("joi");

module.exports = {
  quantity: Joi.number().required().max(100),
  options: Joi.custom((value, helper) => {
    if (typeof value === "object") return value;
    else return helper.error("any.invalid");
  }),
};
