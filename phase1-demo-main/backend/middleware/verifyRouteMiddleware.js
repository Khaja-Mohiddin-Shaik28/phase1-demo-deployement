const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');

const verifyRouteMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ status: false });
    }
    const decodedToken = jwt.verify(token, process.env.key);
    const tokenUserId = decodedToken.userId;

    // Check if token userId matches the URL param
    if (req.params.userId != tokenUserId) {
      return res.status(403).json({ status: false, message: "Forridden" });
    }

    // Check if user exists in DB by userId
    const user = await User.findOne({ userId: tokenUserId });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: false, message: err.message });
  }
};

module.exports = {verifyRouteMiddleware};