const { validate } = require("../utils/common.js");
module.exports = function schemaWrapper(schema) {
  function schemaValidator(req, res, next) {
    const err = validate(schema, req.body, res);
    if (err) return res.status(400).send(err);
    else next();
  }
  return schemaValidator;
};
