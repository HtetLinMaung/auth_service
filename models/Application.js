const { Model, DataTypes } = require("sequelize");
const crypto = require("crypto");
const sequelize = require("../database");

class Application extends Model {}

Application.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessKey: {
      type: DataTypes.STRING,
      defaultValue: crypto.randomBytes(8).toString("hex"),
    },
    jwtExpiresIn: {
      type: DataTypes.STRING,
      defaultValue: "1d",
    },
    publicRegistration: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    passwordPolicy: {
      type: DataTypes.STRING,
      defaultValue: JSON.stringify({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 0,
        minSymbols: 1,
      }),
      set(value) {
        this.setDataValue("passwordPolicy", JSON.stringify(value));
      },
      get() {
        return JSON.parse(this.getDataValue("passwordPolicy"));
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "application",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name", "deletedAt"],
      },
    ],
  }
);

// minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1

module.exports = Application;
