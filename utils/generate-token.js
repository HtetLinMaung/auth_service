const UserSession = require("../models/UserSession");
const jwt = require("jsonwebtoken");

module.exports = (userId, data = {}, expiresIn = "1d") => {
  UserSession.create({
    userId,
  }).catch(console.log);

  let payload = {
    userId,
  };

  if (data) {
    payload = { ...data, ...payload };
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};
