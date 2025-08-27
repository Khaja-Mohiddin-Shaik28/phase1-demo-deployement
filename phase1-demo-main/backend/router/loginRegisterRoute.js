const router = require("express").Router();
const {
    register,
    duplicateUserIdChecker,
    login,
    sendOtp,
    verifyOtp,
    resendOtp,
    resetPassword
} = require("../controller/loginRegisterController");
const { verifyRouteMiddleware } = require("../middleware/verifyRouteMiddleware");

// Public routes
router.post("/register", register);
router.post("/duplicateUserIdChecker", duplicateUserIdChecker);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/reset-password", resetPassword);

// Protected route - parameter is named "userId"
router.get("/dashboard/:userId", verifyRouteMiddleware, (req, res) => {
    res.status(200).json({ status: true, user: req.user });
});

module.exports = router;
