const loginRegisterRouter = require("express").Router();
const {register,duplicateUserIdChecker, login, sendOtp, verifyOtp, resendOtp, resetPassword} = require("../controller/loginRegisterController");
const {verifyRouteMiddleware} = require("../middleware/verifyRouteMiddleware");

loginRegisterRouter.post("/register",register);
loginRegisterRouter.post("/duplicateUserIdChecker",duplicateUserIdChecker);
loginRegisterRouter.post("/login",login);
loginRegisterRouter.post("/send-otp", sendOtp);
loginRegisterRouter.post("/verify-otp", verifyOtp);
loginRegisterRouter.post("/resend-otp", resendOtp);
loginRegisterRouter.post("/reset-password", resetPassword);

// Protected Route
loginRegisterRouter.get("/dashboard/:userId", verifyRouteMiddleware, (req, res)=>{
    res.status(200).json({status : true, user : req.user});
})

module.exports = loginRegisterRouter;