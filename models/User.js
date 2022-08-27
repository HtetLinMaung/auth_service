const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = require("../database");
const Application = require("./Application");
const UserSession = require("./UserSession");

class User extends Model {}

User.init(
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
    profileImage: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("password", bcrypt.hashSync(value));
      },
    },
    twoFactorAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "user",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["appId", "userId", "deletedAt"],
      },
    ],
  }
);

User.hasMany(Application);
User.hasMany(UserSession);
User.hasMany(User, { foreignKey: "creator" });

module.exports = User;
