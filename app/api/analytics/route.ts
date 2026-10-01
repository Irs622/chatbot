import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, getAnalyticsSummaryAsync, logAnalyticsEvent } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, session_id, conversation_id, metadata } = body;

    if (!event_name || !session_id) {
      return NextResponse.json({ error: 'event_name and session_id are required' }, { status: 400 });
    }

    const event = logAnalyticsEvent({
      event_name,
      session_id,
      conversation_id,
      metadata
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
