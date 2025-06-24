const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      isEmailVerified: false,
    });

    await user.save();

    // TODO: Send verification email here if not already handled
    console.log("User saved successfully:", user.email);

    // Generate and send verification email
    try {
      const verificationCode = user.generateEmailVerificationCode();
      await user.save({ validateBeforeSave: false });

      const text = `Your verification code is: ${verificationCode}\n\nThis code will expire in 1 minute.`;
      const html = `<p>Your verification code is: <b>${verificationCode}</b></p><p>This code will expire in 1 minute.</p>`;

      console.log(
        "Sending verification email to:",
        user.email,
        "with code:",
        verificationCode
      );

      await sendEmail({
        email: user.email,
        subject: "Email Verification Code",
        text,
        html,
      });

      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    console.log("Verifying email:", email, "with code:", code);
    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationCodeExpires: { $gt: Date.now() },
    });
    console.log("User found for verification:", user);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    // Mark email as verified and clear verification code
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification-code
// @access  Public
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Generate and save a new verification code
    const verificationCode = user.generateEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const text = `Your new verification code is: ${verificationCode}\n\nThis code will expire in 1 minute.`;
    const html = `<p>Your new verification code is: <b>${verificationCode}</b></p><p>This code will expire in 1 minute.</p>`;

    sendEmail({
      email: user.email,
      subject: "New Email Verification Code",
      text,
      html,
    }).catch((err) => {
      console.error("Failed to resend verification email:", err);
    });

    res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always send a success response to prevent email enumeration.
    // Only proceed with sending the email if the user actually exists.
    if (user) {
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // The URL must point to the frontend application
      const resetURL = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

      const text = `Forgot your password? Click the link to reset your password: ${resetURL}\n\nThis link is valid for 10 minutes.\nIf you didn't forget your password, please ignore this email!`;
      const html = `
        <p>Forgot your password? Click the button below to reset it.</p>
        <a href="${resetURL}" target="_blank" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link is valid for 10 minutes.</p>
        <p>If you didn't forget your password, please ignore this email!</p>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: "Your password reset token (valid for 10 min)",
          text,
          html,
        });
      } catch (err) {
        // If email fails, reset the token fields on the user to allow retries
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        // Even if email fails, we don't want to leak info.
        // The error is logged on the server for debugging.
        console.error("Failed to send password reset email:", err);
      }
    }

    // This generic message is sent whether the user was found or not.
    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired." });
    }

    if (req.body.password === req.body.passwordConfirm) {
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password reset successfully." });
    } else {
      res.status(400).json({ message: "Passwords do not match." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isEmailVerified) {
        return res
          .status(401)
          .json({ message: "Please verify your email before logging in." });
      }
      res.json({
        _id: user._id,
        name:
          (user.firstName ? user.firstName : "") +
          (user.lastName ? " " + user.lastName : ""),
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  loginUser,
};
