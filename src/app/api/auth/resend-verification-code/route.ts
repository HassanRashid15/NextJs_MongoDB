import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified.' },
        { status: 400 }
      );
    }

    // Generate and save a new verification code
    const verificationCode = user.generateEmailVerificationCode();
    await user.addActivity('Resent verification code', 'New email verification code was generated');
    await user.save({ validateBeforeSave: false });

    // Send verification email
    await sendEmail({
      email: user.email,
      subject: 'New Email Verification Code',
      text: `Your new verification code is: ${verificationCode}\n\nThis code will expire in 1 minute.`,
      html: `<p>Your new verification code is: <b>${verificationCode}</b></p><p>This code will expire in 1 minute.</p>`,
    });

    return NextResponse.json({
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
