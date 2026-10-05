import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummaryAsync, logAnalyticsEventAsync, AnalyticsEvent } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { checkRateLimitAsync } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const ALLOWED_ANALYTICS_EVENTS = new Set<string>([
  'chatbot_opened',
  'conversation_started',
  'intent_selected',
  'question_asked',
  'service_viewed',
  'lead_form_opened',
  'lead_submitted',
  'contact_clicked',
  'conversation_completed',
  'human_handoff'
]);


const MAX_ID_LENGTH = 128;
const MAX_METADATA_BYTES = 4096;

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
    // 1. Ingestion rate limiter: max 60 events/min per IP
    const rateLimit = await checkRateLimitAsync(req, {
      identifier: 'analytics_post',
      limit: 60,
      windowMs: 60 * 1000
    });

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { error: 'Too many analytics events. Telemetry ingestion throttled.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { event_name, session_id, conversation_id, metadata } = body;

    // 2. Strict Event Name Allowlist Validation
    if (!event_name || typeof event_name !== 'string' || !ALLOWED_ANALYTICS_EVENTS.has(event_name)) {
      return NextResponse.json({ error: 'Invalid or disallowed event_name' }, { status: 400 });
    }

    // 3. Session & Conversation ID Bounds
    if (!session_id || typeof session_id !== 'string' || session_id.length > MAX_ID_LENGTH) {
      return NextResponse.json({ error: 'Valid session_id (max 128 chars) is required' }, { status: 400 });
    }

    if (conversation_id && (typeof conversation_id !== 'string' || conversation_id.length > MAX_ID_LENGTH)) {
      return NextResponse.json({ error: 'conversation_id must be a string up to 128 chars' }, { status: 400 });
    }

    // 4. Metadata Payload Structure & Size Bounds
    if (metadata !== undefined) {
      if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
        return NextResponse.json({ error: 'metadata must be a key-value object' }, { status: 400 });
      }
      const serialized = JSON.stringify(metadata);
      if (serialized.length > MAX_METADATA_BYTES) {
        return NextResponse.json({ error: 'metadata exceeds maximum payload limit (4KB)' }, { status: 400 });
      }
    }

    const event = await logAnalyticsEventAsync({
      event_name: event_name as AnalyticsEvent['event_name'],
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

