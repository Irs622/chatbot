import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateConversation,
  addMessage,
  updateConversationIntent,
  logAnalyticsEvent
} from '@/lib/db';
import {
  generateConsultationResponse,
  generateConsultationResponseStream,
  AIStreamEvent
} from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      message,
      selectedNeed,
      chatHistory,
      stream = true
    } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum allowed length of 2,000 characters.' },
        { status: 400 }
      );
    }

    const session = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const conversation = getOrCreateConversation(session, selectedNeed);

    // Save user message to database immediately
    addMessage({
      conversation_id: conversation.id,
      sender: 'user',
      message: message.trim(),
      intent: selectedNeed || undefined
    });

    // Track analytics: question_asked
    logAnalyticsEvent({
      event_name: 'question_asked',
      session_id: session,
      conversation_id: conversation.id,
      metadata: { query: message, selectedNeed }
    });

    // 1. Non-streaming legacy mode (if stream: false requested)
    if (stream === false) {
      const aiResponse = await generateConsultationResponse(
        message,
        chatHistory || [],
        selectedNeed
      );

      updateConversationIntent(conversation.id, aiResponse.intent);

      addMessage({
        conversation_id: conversation.id,
        sender: 'bot',
        message: aiResponse.answer,
        intent: aiResponse.intent,
        metadata: {
          recommended_service: aiResponse.recommendedService,
          sources: aiResponse.sources,
          suggest_lead_capture: aiResponse.suggestLeadCapture,
          quick_actions: aiResponse.quickActions
        }
      });

      if (aiResponse.isFallback) {
        logAnalyticsEvent({
          event_name: 'human_handoff',
          session_id: session,
          conversation_id: conversation.id,
          metadata: { reason: 'fallback_unknown_query' }
        });
      }

      return NextResponse.json({
        sessionId: session,
        conversationId: conversation.id,
        ...aiResponse
      });
    }

    // 2. Real-time Streaming Mode (SSE)
    const encoder = new TextEncoder();
    const generator = generateConsultationResponseStream(
      message,
      chatHistory || [],
      selectedNeed,
      true
    );

    const readable = new ReadableStream({
      async start(controller) {
        let finalResponse: Extract<AIStreamEvent, { type: 'done' }> | null = null;

        try {
          for await (const event of generator) {
            if (event.type === 'start') {
              const startData = {
                ...event,
                sessionId: session,
                conversationId: conversation.id
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(startData)}\n\n`));
            } else if (event.type === 'chunk') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            } else if (event.type === 'done') {
              finalResponse = event;
              const doneData = {
                ...event,
                sessionId: session,
                conversationId: conversation.id
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`));
            }
          }

          if (finalResponse) {
            // Save bot message to database upon stream completion
            addMessage({
              conversation_id: conversation.id,
              sender: 'bot',
              message: finalResponse.fullAnswer,
              intent: finalResponse.intent,
              metadata: {
                recommended_service: finalResponse.recommendedService,
                sources: finalResponse.sources,
                suggest_lead_capture: finalResponse.suggestLeadCapture,
                quick_actions: finalResponse.quickActions
              }
            });

            updateConversationIntent(conversation.id, finalResponse.intent);

            if (finalResponse.isFallback) {
              logAnalyticsEvent({
                event_name: 'human_handoff',
                session_id: session,
                conversation_id: conversation.id,
                metadata: { reason: 'fallback_unknown_query' }
              });
            }
          }
        } catch (err: any) {
          console.error('Error during chat stream:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Stream error' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
