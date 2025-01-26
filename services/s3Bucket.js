const { S3Client } = require("@aws-sdk/client-s3"); // Import S3Client from v3
const s3 = new S3Client({
  endpoint: process.env.LIARA_ENDPOINT, // Your S3-compatible endpoint
  region: "default", // Adjust region if needed
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY,
    secretAccessKey: process.env.LIARA_SECRET_KEY,
  },
});
module.exports = { s3 };
