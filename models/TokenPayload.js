const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class TokenPayload extends Model {}

TokenPayload.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.STRING,
      defaultValue: JSON.stringify({}),
      set(value) {
        this.setDataValue("data", JSON.stringify(value));
      },
      get() {
        return JSON.parse(this.getDataValue("data"));
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "tokenpayload",
    timestamps: true,
  }
);

module.exports = TokenPayload;
