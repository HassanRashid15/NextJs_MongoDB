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
  getCurrentUser,
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

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, getCurrentUser);

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

// @route   POST api/auth/upload-profile-image
// @desc    Upload user profile image
// @access  Private
router.post(
  "/upload-profile-image",
  protect,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const User = require("../models/User");
      const userDoc = await User.findById(req.user.id);
      if (!userDoc) {
        return res.status(404).json({ message: "User not found" });
      }
      userDoc.profileImage = `/uploads/${req.file.filename}`;
      await userDoc.save();
      res.json({ profileImage: userDoc.profileImage });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
