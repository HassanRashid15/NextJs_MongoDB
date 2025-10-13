import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Record login activity
      await user.recordLogin();

      return NextResponse.json({
        message: 'Login successful',
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
        },
      });
    } else {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
