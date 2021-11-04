const path = require("path");

const config = {
  port: process.env.PORT || 80,
  hostname: "0.0.0.0",
  upload_path: path.join(__dirname, "uploads"),
};

module.exports = config;
