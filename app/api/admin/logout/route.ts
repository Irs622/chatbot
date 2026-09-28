import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi admin berhasil diakhiri.'
  });

  clearAdminCookie(response);
  return response;
}
