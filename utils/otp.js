const axios = require("axios");
const validator = require("validator");

exports.sendOtp = async (userId) => {
  let body = {
    appid: "002",
    accesskey: "445fdc4bd21cbcd5",
  };
  if (validator.isEmail(userId)) {
    body = {
      ...body,
      toemail: userId,
      subject: "OTP",
      body_template: "Dear Customer, Your verification code is {otp}",
    };
  } else {
    body = {
      ...body,
      phoneno: userId.replace("09", "+959"),
      msg_template: "Your Verification Code {otp}.",
    };
  }
  return axios.post(
    `${process.env.OTP_SERVICE}/${
      validator.isEmail(userId) ? "email" : "sms"
    }/sendotp`,
    body
  );
};

exports.checkOtp = async (userId, code, otpsession) => {
  let body = {
    appid: "002",
    accesskey: "445fdc4bd21cbcd5",
    otp: code,
    otpsession: otpsession,
  };
  if (validator.isEmail(userId)) {
    body["toemail"] = userId;
  } else {
    body["phoneno"] = userId.replace("09", "+959");
  }
  return axios.post(
    `${process.env.OTP_SERVICE}/${
      validator.isEmail(userId) ? "email" : "sms"
    }/checkotp`,
    body
  );
};
