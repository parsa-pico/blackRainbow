const { default: axios } = require("axios");

class SMS {
  static async sendSms(mobile, templateId, parameters) {
    const { data } = await axios.post(
      "https://api.sms.ir/v1/send/verify",
      {
        mobile,
        templateId,
        parameters,
      },
      {
        headers: {
          "x-api-key": process.env.SMS_KEY,
        },
      }
    );

    return data;
  }
  static async sendCode(phoneNumber, code) {
    const data = await this.sendSms(phoneNumber, 100000, [
      {
        name: "Code",
        value: code,
      },
    ]);
    return data;
  }
}

module.exports = SMS;
