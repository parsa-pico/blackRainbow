// const DB = require("../services/mongodb");
// const SmsStatus = require("../enums/smsStatus");
// const SMS = require("../services/sms");
// module.exports = async function checkSms() {
//   console.log("checking for sending sms");

//   try {
//     const results = await (
//       await DB.find("sms", { status: SmsStatus.notSent })
//     ).toArray();
//     const bulkOperations = [];
//     for (const item in results) {
//       const itemId = new Object(item._id);
//       const params = SMS.convertParams(item.parameters);
//       const result = await SMS.sendSms(item.mobile, item.templateId, params);
//       if (result && result.status === 1) {
//         bulkOperations.push({
//           updateOne: {
//             filter: { _id: itemId },
//             update: { $set: { msgId: result.data.messageIds[0] } },
//           },
//         });
//       }
//     }
//     await DB.getDbColletion("sms").bulkWrite(bulkOperations);
//   } catch (error) {
//     console.log(error);
//   }
// };
