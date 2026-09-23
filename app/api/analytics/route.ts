import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, logAnalyticsEvent } from '@/lib/db';

export async function GET() {
  try {
    const summary = getAnalyticsSummary();
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
