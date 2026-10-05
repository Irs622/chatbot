import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authenticated = isAdminAuthenticated(req);

  return NextResponse.json({
    authenticated,
    timestamp: new Date().toISOString()
  });
}
