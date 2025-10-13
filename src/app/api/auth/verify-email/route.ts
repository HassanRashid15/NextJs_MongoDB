import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, code } = await request.json();

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.addActivity('Verified email', 'Email address verified successfully');
    await user.save();

    return NextResponse.json({
      message: 'Email verified successfully.',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
