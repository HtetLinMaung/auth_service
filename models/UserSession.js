const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Session extends Model {}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "usersession",
    timestamps: true,
  }
);

module.exports = Session;
