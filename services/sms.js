const { default: axios } = require("axios");
const { getDate } = require("../utils/common");

class SMS {
  static async sendSms(mobile, templateId, parameters) {
    if (process.env.SEND_SMS === "true") {
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
    } else return "fake sms";
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
  static async notifyAdminNewPurchase() {
    const persianDate = getDate(new Date());
    const data = await this.sendSms(process.env.ADMIN_PHONE_NUMBER, 392682, [
      {
        name: "DATE",
        value: persianDate,
      },
    ]);
    return data;
  }
}

module.exports = SMS;
