const fs = require("fs");
const moment = require("moment");
const path = require("path");
const sequelize = require("./database");
const Application = require("./models/Application");
const User = require("./models/User");

exports.beforeServerStart = async () => {
  console.log("before server start.");
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
  await sequelize.authenticate();
  await sequelize.sync({});
  let [application] = await Application.findOrCreate({
    where: {
      name: process.env.APP_ID,
    },
    defaults: {
      name: process.env.APP_ID,
      accessKey: process.env.ACCESS_KEY,
    },
  });
  application.accessKey = process.env.ACCESS_KEY;
  await application.save();
  const [user] = await User.findOrCreate({
    where: {
      userId: process.env.ADMIN_USER_ID,
      appId: process.env.APP_ID,
    },
    defaults: {
      name: "Admin",
      appId: process.env.APP_ID,
      userId: process.env.ADMIN_USER_ID,
      password: process.env.ADMIN_PASSWORD,
    },
  });
  user.creator = user.id;
  await user.save();
};

exports.errorHandler = (err, req, res) => {
  console.error(err);
  const body = {
    code: 500,
    message: err.message,
    stack: err.stack,
  };
  res.status(500).json(body);
  const now = moment().format("DD-MM-YYYY");
  if (fs.existsSync(path.join("logs", `errors_${now}.txt`))) {
    fs.writeFileSync(
      path.join("logs", `errors_${now}.txt`),
      `${err.message}\n`
    );
  } else {
    fs.appendFileSync(
      path.join("logs", `errors_${now}.txt`),
      `${err.message}\n`
    );
  }
};
