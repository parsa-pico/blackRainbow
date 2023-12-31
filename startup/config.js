module.exports = function () {
  const env_inputs = [
    "JWT_PRIVATE_KEY",
    "MONGO_URL",
    "BACK_END_URL",
    "SMS_KEY",
    "FRONT_BASE_URL",
    "ID_PAY_AUTH_KEY",
    "ADMIN_PHONE_NUMBER",
    "SECURE",
    "SAME_SITE",
    "SEND_SMS",
  ];
  for (let input of env_inputs) {
    if (!process.env[input]) {
      const msg = `${input} not defined`;
      console.log(msg);
      throw new Error(msg);
    }
  }
};
