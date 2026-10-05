import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticatedAsync } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authenticated = await isAdminAuthenticatedAsync(req);


  return NextResponse.json({
    authenticated,
    timestamp: new Date().toISOString()
  });
}
