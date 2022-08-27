const jwt = require("jsonwebtoken");
const UserSession = require("../models/UserSession");

module.exports = async (req, res, next) => {
  try {
    let token = "";
    if (!req.body.token) {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        return res.status(401).json({
          code: 401,
          message: "Token is required!",
        });
      }
      token = authHeader.split(" ")[1];
    } else {
      token = req.body.token;
    }
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Token is required!",
      });
    }
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
        message: "Invalid token!",
      });
    }
    req.decodedToken = decoded;
    next();
  } catch (err) {
    next(err);
  }
};
