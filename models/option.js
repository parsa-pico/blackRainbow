const Joi = require("joi");

module.exports = {
  localName: Joi.string().required().max(100),
  title: Joi.string().required().max(100),
  choices: Joi.required()
    .custom((value, helper) => {
      if (
        Array.isArray(value) &&
        value.length >= 0 &&
        value.every((opt) => typeof opt === "string")
      )
        return value;
      else return helper.error("any.custom");
    })
    .messages({ "any.custom": "فرمت انتخاب ها صحیح نیست" }),
};
