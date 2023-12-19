const Joi = require("joi");

module.exports = {
  title: Joi.string().required().max(100),
  choices: Joi.required().custom((value, helper) => {
    if (
      Array.isArray(value) &&
      value.length >= 0 &&
      value.every((opt) => typeof opt === "string")
    )
      return value;
    else return helper.error("فرمت انتخاب ها صحیح نیست");
  }),
};
