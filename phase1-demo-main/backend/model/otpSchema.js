const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  emailId: { type: String, required: true },
  otp: { type: String, required: true }, // hashed OTP
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },

  attempts: { type: Number, default: 0 }, // wrong OTP attempts
  resendCount: { type: Number, default: 0 }, // resend attempts
  blockedUntil: { type: Date, default: null }, // block user until
});

module.exports = mongoose.model("Otp", otpSchema);
