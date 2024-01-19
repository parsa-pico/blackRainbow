const { default: axios } = require("axios");
const { getDate } = require("../utils/common");
const DB = require("./mongodb");
const SmsStatus = require("../enums/smsStatus");
class SMS {
  static async sendSms(mobile, templateId, parameters) {
    if (process.env.SEND_SMS === "true") {
      console.time("sms");
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
      console.timeEnd("sms");
      return data;
    } else return "fake sms";
  }
  static async pushToDb(mobile, templateId, parameters, session) {
    const opt = {};
    if (session) opt.session = session;
    return await DB.insertOne(
      "sms",
      { mobile, templateId, parameters, status: SmsStatus.notSent },
      undefined,
      opt
    );
  }

  static async sendCode(phoneNumber, code) {
    const data = await this.sendSms(phoneNumber, 557994, [
      {
        name: "Code",
        value: code,
      },
    ]);
    return data;
  }
  static async sendAdminNewPurchase() {
    const persianDate = getDate(new Date());
    const params = this.convertParams({ DATE: persianDate });

    return await this.sendSms(process.env.ADMIN_PHONE_NUMBER, 392682, params);
  }
  static async pushAdminNewPurchase(session) {
    const persianDate = getDate(new Date());

    return await this.pushToDb(
      process.env.ADMIN_PHONE_NUMBER,
      392682,
      {
        DATE: persianDate,
      },
      session
    );
  }
  static convertParams(inputObj) {
    const outputArr = Object.entries(inputObj).map(([key, value]) => ({
      name: key.toUpperCase(),
      value,
    }));
    return outputArr;
  }
}

module.exports = SMS;
