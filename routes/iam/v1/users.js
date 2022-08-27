const express = require("express");
const validator = require("validator");
const isTokenValid = require("../../../middlewares/is-token-valid");
const Application = require("../../../models/Application");
const User = require("../../../models/User");
const {
  createHandler,
  updateHandler,
  deleteHandler,
  getAllHandler,
  getById,
} = require("../../../utils/crud-handlers");

const router = express.Router();

router
  .route("/")
  .post(
    isTokenValid,
    createHandler(User, "User created successful", async (req) => {
      const application = await Application.findOne({
        attributes: ["passwordPolicy"],
        where: {
          appId: req.body.appId,
        },
      });
      if (!application) {
        throw new Error("Application not found!");
      }
      if (
        !validator.isStrongPassword(
          req.body.password,
          application.passwordPolicy
        )
      ) {
        throw new Error("Password is not strong enough!");
      }
      return {
        ...req.body,
      };
    })
  )
  .get(
    isTokenValid,
    getAllHandler(User, "User fetched successfully", [
      "name",
      "appId",
      "userId",
    ])
  );

router
  .route("/:id")
  .get(isTokenValid, getById(User, "User not found!"), async (req, res) => {
    res.json({
      code: 200,
      message: "Success",
      data: req.data,
    });
  })
  .put(
    isTokenValid,
    getById(User, "User not found!"),
    updateHandler(User, "User updated successfully")
  )
  .delete(
    isTokenValid,
    getById(User, "User not found!"),
    deleteHandler(User, "User deleted successfully")
  );

module.exports = router;
