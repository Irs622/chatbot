import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminPassword,
  generateAdminSessionToken,
  setAdminCookie
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password or PIN is required.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminPassword(password);

    if (!isValid) {
      // Artificial delay to prevent timing and brute-force attacks
      await new Promise((resolve) => setTimeout(resolve, 400));

      return NextResponse.json(
        { success: false, error: 'The password or PIN you entered is incorrect.' },
        { status: 401 }
      );
    }

    // Generate secure signed session token
    const token = generateAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful.'
    });

    // Set secure HTTP-only cookie
    setAdminCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Error in /api/admin/login:', error);
    return NextResponse.json(
      { success: false, error: 'A server error occurred during verification.' },
      { status: 500 }
    );
  }
}
