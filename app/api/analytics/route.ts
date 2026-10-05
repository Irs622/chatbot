import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, getAnalyticsSummaryAsync, logAnalyticsEvent, logAnalyticsEventAsync } from '@/lib/db';
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

    const summary = await getAnalyticsSummaryAsync();
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in GET /api/analytics] [ID: ${requestId}]:`, error);
    return NextResponse.json({ error: 'Internal server error', request_id: requestId }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, session_id, conversation_id, metadata } = body;

    if (!event_name || !session_id) {
      return NextResponse.json({ error: 'event_name and session_id are required' }, { status: 400 });
    }

    const event = await logAnalyticsEventAsync({
      event_name,
      session_id,
      conversation_id,
      metadata
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in POST /api/analytics] [ID: ${requestId}]:`, error);
    return NextResponse.json({ error: 'Internal server error', request_id: requestId }, { status: 500 });
  }
}
