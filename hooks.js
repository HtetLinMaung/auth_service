const sequelize = require("./database");
const Application = require("./models/Application");
const User = require("./models/User");

exports.beforeServerStart = async () => {
  console.log("before server start.");

  await sequelize.authenticate();
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
  res.json({
    code: 500,
    message: err.message,
    stack: err.stack,
  });
};
