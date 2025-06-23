const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post("/verify-email", verifyEmail);

// @route   POST api/auth/resend-verification-code
// @desc    Resend verification code
// @access  Public
router.post("/resend-verification-code", resendVerificationCode);

// @route   POST api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post("/forgot-password", forgotPassword);

// @route   PUT api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put("/reset-password/:token", resetPassword);

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post("/login", loginUser);

module.exports = router;
