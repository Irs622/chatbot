import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookie, revokeAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (token) {
    revokeAdminSession(token);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Admin session terminated and revoked successfully.'
  });

  clearAdminCookie(response);
  return response;
}
