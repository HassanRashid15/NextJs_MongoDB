import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { firstName, lastName, email, password } = await request.json();

    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      isEmailVerified: false,
    });

    // Add initial account creation activity
    await user.addActivity('Account created', 'User registered successfully');
    await user.save();

    // Generate and send verification email
    try {
      const verificationCode = user.generateEmailVerificationCode();
      await user.save({ validateBeforeSave: false });

      await sendEmail({
        email: user.email,
        subject: 'Email Verification Code',
        text: `Your verification code is: ${verificationCode}\n\nThis code will expire in 1 minute.`,
        html: `<p>Your verification code is: <b>${verificationCode}</b></p><p>This code will expire in 1 minute.</p>`,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email for verification code.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
