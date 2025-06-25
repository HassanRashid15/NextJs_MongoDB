const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: { type: String }, // URL or base64 string
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
  },
  emailVerificationCodeExpires: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Activity tracking fields
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  activities: [
    {
      action: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
    },
  ],
  // You can add more fields here like emailVerified, etc.
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateEmailVerificationCode = function () {
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  this.emailVerificationCode = verificationCode;
  this.emailVerificationCodeExpires = Date.now() + 60 * 1000;

  return verificationCode;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token to expire in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Activity tracking methods
UserSchema.methods.addActivity = function (action, details = "") {
  this.activities.push({
    action,
    timestamp: new Date(),
    details,
  });

  // Keep only the last 20 activities to prevent the array from growing too large
  if (this.activities.length > 20) {
    this.activities = this.activities.slice(-20);
  }

  return this.save();
};

UserSchema.methods.recordLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  
  // Add login activity without calling save (since we'll save at the end)
  this.activities.push({
    action: "Logged in",
    timestamp: new Date(),
    details: `Login #${this.loginCount}`,
  });
  
  // Keep only the last 20 activities
  if (this.activities.length > 20) {
    this.activities = this.activities.slice(-20);
  }
  
  return this.save();
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
