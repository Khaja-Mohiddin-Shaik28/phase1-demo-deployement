const User = require("../model/userSchema");
const Otp = require("../model/otpSchema")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require('dotenv').config();

const register = async (req, res) => {
  try {
    const data = req.body;

    // checking if username already exists
    const existingUserId = await User.findOne({ userId: data.userId });
    if (existingUserId) {
      return res.status(409).json({ status: "Username already exists" });
    }

    // checking if email already exists
    const existingEmailId = await User.findOne({ emailId: data.emailId });
    if (existingEmailId) {
      return res.status(409).json({ status: "User already exists" });
    }

    //password hashing
   const salt = await bcrypt.genSalt(10); // 10 is the cost factor
  const hashedPassword = await bcrypt.hash(data.password, salt);

    // Updating password
    const credentials = {
      ...data,
      password: hashedPassword,
      role: data.role,
    };

    // adding user to the database
    const addUser = new User(credentials);
    await addUser.save();
    return res.status(201).json({ status: "User added" });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ status: `User not added : ${err.message}` });
  }
};

const duplicateUserIdChecker = async (req, res) => {
  try {
    const { userId } = req.body;
    const duplicateUserId = await User.findOne({ userId });
    if (duplicateUserId) {
      return res.status(409).json({ status: "UserId already exists" });
    } else {
      return res.status(200).json({ status: "ok" });
    }
  } catch (err) {
    return res.status("400").json({ status: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    // Check if user exists with the given userId and role
    const existingUserData = await User.findOne({ userId, role });

    // If no user found
    if (!existingUserData) {
      return res.status(404).json({ status: "User does not exist with this role" });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, existingUserData.password);
    if (!validPassword) {
      return res.status(401).json({ status: "Invalid Password" });
    }

    // Creating a JWT token
    const token = jwt.sign({ userId: existingUserData.userId }, process.env.key, {
      expiresIn: "1d",
    });

    // Storing token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ status: existingUserData });
  } catch (err) {
    return res.status(500).json({ status: `Login failed: ${err.message}` });
  }
};



// Send OTP (first time or reset)
const sendOtp = async (req, res) => {
  const { emailId } = req.body;
  const emailIdString = typeof emailId === 'object' ? emailId.emailId : emailId;

  if (!emailIdString) return res.status(400).json({ status: "Email required" });

  try {
    const existingUser = await User.findOne({ emailId: emailIdString });
    if (!existingUser) {
      return res.status(404).json({ status: "Email not registered" });
    }

    let record = await Otp.findOne({ emailId: emailIdString });

    // If user is blocked for 24 hours
    if (record?.blockedUntil && record.blockedUntil > new Date()) {
      return res.status(429).json({
        status: "Too many attempts. Try again after 24 hours.",
        blocked: true,
        remaining: Math.ceil((record.blockedUntil - new Date()) / 1000)
      });
    }

    // If OTP exists and not expired, prevent sending new one
    if (record && record.expiresAt > new Date()) {
      return res.status(400).json({
        status: "OTP already sent. Please wait before requesting a new one."
      });
    }

    // Generate new OTP
    const otpPlain = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otpPlain, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!record) {
      record = new Otp({
        emailId: emailIdString,
        otp: hashedOtp,
        expiresAt,
        createdAt: new Date(),
        attempts: 0,
        resendCount: 0,
        blockedUntil: null
      });
    } else {
      // Reset OTP, but preserve block if it exists
      record.otp = hashedOtp;
      record.expiresAt = expiresAt;
      record.createdAt = new Date();
      record.attempts = 0;
      record.resendCount = 0;
      // blockedUntil is preserved if not null
    }

    await record.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailIdString,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otpPlain}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ status: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed to send OTP" });
  }
};




//  Resend OTP - if user navigates back timer start again
const resendOtp = async (req, res) => {
  const { emailId } = req.body;
   const emailIdString = typeof emailId === 'object' ? emailId.emailId : emailId;
  if (!emailIdString) return res.status(400).json({ status: "Email required" });

  try {
    const record = await Otp.findOne({ emailId : emailIdString});
    if (!record) return res.status(400).json({ status: "No OTP request found. Please request a new one." });

    if (record.resendCount >= 3) {
      return res.status(429).json({ status: "Resend limit reached. Please try later after 24 hours." });
    }

    const otpPlain = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otpPlain, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minute

    record.otp = hashedOtp;
    record.expiresAt = expiresAt;
    record.createdAt = new Date();
    record.resendCount += 1;
    await record.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailIdString,
      subject: "Your Resent OTP for Password Reset",
      text: `Your new OTP is ${otpPlain}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ status: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed to resend OTP" });
  }
};


// Verify OTP
const verifyOtp = async (req, res) => {
  const { emailId, otp } = req.body;
  if (!emailId || !otp) return res.status(400).json({ status: "Email or OTP required" });

  try {
    const record = await Otp.findOne({ emailId });
    if (!record) return res.status(400).json({ status: "No OTP found for this email" });

    // check if blocked
    if (record.blockedUntil && record.blockedUntil > new Date()) {
      return res.status(429).json({ status: "Too many failed attempts. Try again later after 24 hours." });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ emailId });
      return res.status(400).json({ status: "OTP expired" });
    }

    const validOtp = await bcrypt.compare(otp, record.otp);
    if (!validOtp) {
      record.attempts += 1;

      if (record.attempts >= 5) {
        record.blockedUntil = new Date(Date.now() + 30 * 60 * 1000); // block for 30 mins
        await record.save();
        return res.status(429).json({ status: "Too many failed attempts. Try again later after 24 hours." });
      }

      await record.save();
      return res.status(400).json({ status: `Invalid OTP. Attempts left: ${5 - record.attempts}` });
    }

    // OTP valid → delete record
    await Otp.deleteOne({ emailId });
    res.status(200).json({ status: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed to verify OTP" });
  }
};



const resetPassword = async (req, res) => {
  const { emailId, newPassword } = req.body;

  if (!emailId || !newPassword)
    return res.status(400).json({ status: "Email and new password required" });

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    const user = await User.findOneAndUpdate(
      { emailId },
      { password: hashedPassword },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ status: "User not found" });

    res.status(200).json({ status: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed to reset password" });
  }
};

module.exports = { resetPassword };


module.exports = {
  register,
  duplicateUserIdChecker,
  login,
  sendOtp,
  resendOtp,   
  verifyOtp,
  resetPassword
};
