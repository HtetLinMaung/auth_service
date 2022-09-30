const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: 5,
    min: 0,
    acquire: 3000000,
    idle: 10000,
  },
});

// sequelize
//   .sync({ force: true })
//   .then(() => {})
//   .catch(console.log);

module.exports = sequelize;
