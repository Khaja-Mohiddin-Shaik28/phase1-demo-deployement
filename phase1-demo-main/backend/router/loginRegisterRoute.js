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

// Input validation middleware
const validateInput = (req, res, next) => {
    const { body } = req;
    
    // Remove any potential harmful characters
    for (const key in body) {
        if (typeof body[key] === 'string') {
            body[key] = body[key].trim();
        }
    }
    next();
};

// ------------------- Public Routes -------------------
router.post("/register", validateInput, register);
router.post("/duplicateUserIdChecker", validateInput, duplicateUserIdChecker);
router.post("/login", validateInput, login);
router.post("/send-otp", validateInput, sendOtp);
router.post("/verify-otp", validateInput, verifyOtp);
router.post("/resend-otp", validateInput, resendOtp);
router.post("/reset-password", validateInput, resetPassword);

// ------------------- Protected Routes -------------------
router.get("/dashboard/:userId", verifyRouteMiddleware, (req, res) => {
    try {
        res.status(200).json({ 
            status: true, 
            user: req.user,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: false, 
            error: 'Failed to fetch dashboard data' 
        });
    }
});

// Test route for debugging
router.get("/test", (req, res) => {
    res.status(200).json({ 
        message: "API is working", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
