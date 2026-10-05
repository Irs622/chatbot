import { NextRequest, NextResponse } from 'next/server';
import { getAllConversations, getAllConversationsAsync } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner administrative privileges required.' },
        { status: 401 }
      );
    }

    const list = await getAllConversationsAsync();
    return NextResponse.json({ success: true, count: list.length, conversations: list });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in GET /api/conversations] [ID: ${requestId}]:`, error);
    return NextResponse.json({ error: 'Internal server error', request_id: requestId }, { status: 500 });
  }
}
