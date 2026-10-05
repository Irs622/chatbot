import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminPassword,
  generateAdminSessionToken,
  recordAdminSessionAsync,
  setAdminCookie
} from '@/lib/auth';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Admin Login Brute-Force Limiter (Max 5 attempts per 15 minutes per IP - distributed async)
    const rateLimit = await checkRateLimitAsync(req, {
      identifier: 'admin_login',
      limit: 5,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Administrative access locked. Please retry in ${Math.ceil(rateLimit.resetInSeconds / 60)} minute(s).`
        },
        { status: 429 }
      );
    }

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

    // Persist session to PostgreSQL admin_sessions table
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || undefined;
    await recordAdminSessionAsync(token, ip, userAgent);

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
