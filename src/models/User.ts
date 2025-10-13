import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationCodeExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginCount: number;
  activities: Array<{
    action: string;
    timestamp: Date;
    details: string;
  }>;
  matchPassword(enteredPassword: string): Promise<boolean>;
  generateEmailVerificationCode(): string;
  createPasswordResetToken(): string;
  addActivity(action: string, details?: string): Promise<IUser>;
  recordLogin(): Promise<IUser>;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: { type: String },
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
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  activities: [
    {
      action: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
    },
  ],
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateEmailVerificationCode = function () {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = verificationCode;
  this.emailVerificationCodeExpires = new Date(Date.now() + 60 * 1000);
  return verificationCode;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

UserSchema.methods.addActivity = function (action: string, details = '') {
  this.activities.push({
    action,
    timestamp: new Date(),
    details,
  });

  if (this.activities.length > 20) {
    this.activities = this.activities.slice(-20);
  }

  return this.save();
};

UserSchema.methods.recordLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  
  this.activities.push({
    action: 'Logged in',
    timestamp: new Date(),
    details: `Login #${this.loginCount}`,
  });
  
  if (this.activities.length > 20) {
    this.activities = this.activities.slice(-20);
  }
  
  return this.save();
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
