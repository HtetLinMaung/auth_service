const express = require("express");
const crypto = require("crypto");

const isTokenValid = require("../../../middlewares/is-token-valid");
const Application = require("../../../models/Application");
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
    createHandler(
      Application,
      "Application created successful",
      async (req) => {
        try {
          console.log(req.body);
          const { jwtExpiresIn, publicRegistration, passwordPolicy } = req.body;
          return {
            ...req.body,
            accessKey: crypto.randomBytes(20).toString("hex"),
            jwtExpiresIn: jwtExpiresIn || "1d",
            publicRegistration:
              "publicRegistration" in req.body ? publicRegistration : true,
            passwordPolicy: passwordPolicy || {
              minLength: 8,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 0,
              minSymbols: 1,
            },
            userId: req.decodedToken.userId,
          };
        } catch (err) {
          console.log(err);
        }
      }
    )
  )
  .get(
    isTokenValid,
    getAllHandler(Application, "Application fetched successfully", ["name"])
  );

router
  .route("/:id")
  .get(
    isTokenValid,
    getById(Application, "Application not found!"),
    async (req, res) => {
      res.json({
        code: 200,
        message: "Success",
        data: req.data,
      });
    }
  )
  .put(
    isTokenValid,
    getById(Application, "Application not found!"),
    updateHandler(Application, "Application updated successfully")
  )
  .delete(
    isTokenValid,
    getById(Application, "Application not found!"),
    deleteHandler(Application, "Application deleted successfully")
  );

module.exports = router;
