const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  upload,
  updateProfile,
  deleteProfileImage,
  changePassword,
} = require("../controllers/authController");
const protect = require("../utils/authMiddleware");

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

// @route   PUT api/auth/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", protect, changePassword);

// @route   PUT api/auth/update-profile
// @desc    Update user profile information (name, email)
// @access  Private
router.put("/update-profile", protect, updateProfile);

// @route   PATCH api/auth/profile
// @desc    Update user profile (name and/or image)
// @access  Private
router.patch("/profile", protect, upload.single("profileImage"), updateProfile);

// @route   DELETE api/auth/profile/image
// @desc    Delete user profile image
// @access  Private
router.delete("/profile/image", protect, deleteProfileImage);

module.exports = router;
