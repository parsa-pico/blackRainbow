const Joi = require("joi");
const path = require("path");
function getPicturePath(filename) {
  const root = path.resolve(__dirname, "..", "pictures");
  return `${root}/${filename}`;
}
function validate(schema, obj, res) {
  const { error } = Joi.object(schema).validate(obj);
  return error ? error.message : null;
}
function isObject(variable) {
  return typeof variable === "object" && variable !== null;
}
function validateDaysObject(inputObj) {
  // Validate the object structure
  if (!isObject(inputObj) || !inputObj) return false;
  for (const day in inputObj) {
    if (Array.isArray(inputObj[day]) && inputObj[day].length === 2) {
      // Validate the time format (HH:mm)
      const isValidTime = inputObj[day].every((time) =>
        /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
      );
      if (!isValidTime) {
        return false; // Return null if time format is invalid
      }
    } else {
      return false; // Return null if the structure is invalid
    }
  }

  return true;
}
function generateRandomCode(len) {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  const randomDigit = Math.floor(Math.random() * (max - min + 1) + min);
  return randomDigit;
}
function getSecondDifference(date1, date2) {
  const diffInMilliseconds = Math.abs(date2 - date1);
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  return diffInSeconds;
}

function codeExpired(codeTime, thresholdSeconds) {
  const now = new Date();
  const diff = getSecondDifference(now, codeTime);
  const remaning = thresholdSeconds - diff;
  return { isExpired: diff > thresholdSeconds, remaning };
}
function getDate(dateValue) {
  let date = new Date(dateValue);
  date = date.toLocaleString("fa-IR").split(" ")[0].replace(/,/g, "").trim();
  return date;
}
exports.codeExpired = codeExpired;
exports.validate = validate;
exports.validateDaysObject = validateDaysObject;
exports.generateRandomCode = generateRandomCode;
exports.getPicturePath = getPicturePath;
exports.getDate = getDate;
exports.cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 30, //max age:30 days
  httpOnly: true,
  secure: process.env.SECURE === "true",
  sameSite: process.env.SAME_SITE,
};
console.log(exports.cookieOptions);
