import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/app/actions/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    const result = await createUserProfile(userId, email);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create profile' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in create-profile route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

