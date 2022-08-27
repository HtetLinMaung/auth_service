const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const Application = require("../../../models/Application");
const User = require("../../../models/User");
const TokenPayload = require("../../../models/TokenPayload");
const UserSession = require("../../../models/UserSession");
const { sendOtp, checkOtp } = require("../../../utils/otp");
const generateToken = require("../../../utils/generate-token");
const isTokenValid = require("../../../middlewares/is-token-valid");

const router = express.Router();

router.post("/signin", async (req, res, next) => {
  try {
    const { appId, userId, password, data, accessKey } = req.body;

    const application = await Application.findOne({
      attributes: ["jwtExpiresIn", "accessKey"],
      where: {
        name: appId,
      },
    });
    if (!application) {
      return res.status(400).json({
        code: 400,
        message: "Application not found",
      });
    }
    if (data && accessKey !== application.accessKey) {
      return res.status(400).json({
        code: 400,
        message: "Invalid access key",
      });
    }
    const user = await User.findOne({
      where: {
        appId,
        userId,
      },
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        code: 401,
        message: "Invalid password!",
      });
    }

    if (user.twoFactorAuth) {
      const tokenPayload = await TokenPayload.create({
        userId,
        appId,
        data: data || {},
      });

      const response = await sendOtp(userId);
      if (response.data.returncode != "300") {
        throw new Error("Error sending OTP");
      }

      return res.json({
        code: 200,
        message: "Success",
        data: {
          pId: tokenPayload.id,
          otpSession: response.data.otpsession,
        },
      });
    }

    res.json({
      code: 200,
      message: "Success",
      data: {
        token: generateToken(user.id, data, application.jwtExpiresIn),
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-signin", async (req, res, next) => {
  try {
    const { otpCode, otpSession, pId } = req.body;

    const tokenPayload = await TokenPayload.findOne({
      attributes: ["userId", "appId", "data"],
      where: {
        id: pId,
      },
    });
    const application = await Application.findOne({
      attributes: ["jwtExpiresIn"],
      where: {
        name: tokenPayload.appId,
      },
    });
    if (!application) {
      return res.status(400).json({
        code: 400,
        message: "Application not found",
      });
    }

    const data = tokenPayload ? tokenPayload.data : {};

    const response = await checkOtp(tokenPayload.userId, otpCode, otpSession);

    if (response.data.returncode != "300") {
      return res.status(400).json({
        code: 400,
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({
      where: {
        appId: tokenPayload.appId,
        userId: tokenPayload.userId,
      },
    });

    res.json({
      code: 200,
      message: "Success",
      data: {
        token: generateToken(user.id, data, application.jwtExpiresIn),
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { appId, userId, password, name, profileImage, twoFactorAuth } =
      req.body;

    const application = await Application.findOne({
      attributes: ["passwordPolicy"],
      where: {
        name: appId,
        publicRegistration: true,
      },
    });
    if (!application) {
      return res.status(400).json({
        code: 400,
        message: "Unable to register user",
      });
    }
    if (!validator.isStrongPassword(password, application.passwordPolicy)) {
      return res.status(400).json({
        code: 400,
        message: "Password is not strong enough",
      });
    }
    const [user, created] = await User.findOrCreate({
      where: {
        appId,
        userId,
      },
      defaults: {
        appId,
        userId,
        password,
        name,
        profileImage,
        twoFactorAuth,
      },
    });
    if (user && !created) {
      return res.status(409).json({
        code: 409,
        message: "User already exists!",
      });
    }

    return res.json({
      code: 200,
      message: "Registration successful",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-token", isTokenValid, async (req, res, next) => {
  try {
    const { appId, accessKey } = req.body;
    const decoded = req.decodedToken;

    const application = await Application.findOne({
      attributes: ["id"],
      where: {
        name: appId,
        accessKey,
      },
    });
    if (!application) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized!",
      });
    }

    const user = await User.findOne({
      attributes: ["name", "profileImage"],
      where: {
        id: decoded.userId,
        appId,
      },
    });
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Invalid token!",
      });
    }
    return res.json({
      code: 200,
      message: "Success",
      data: {
        ...decoded,
        user: {
          name: user.name,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/signout", async (req, res, next) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        code: 401,
        message: "Invalid token!",
      });
    }
    const session = await UserSession.findOne({
      where: {
        userId: decoded.userId,
      },
    });
    if (!session) {
      return res.status(401).json({
        code: 401,
        message: "Already Logout!",
      });
    }
    await session.destroy();
    res.json({
      code: 200,
      message: "Logout success",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
