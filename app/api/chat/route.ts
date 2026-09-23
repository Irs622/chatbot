import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateConversation,
  addMessage,
  updateConversationIntent,
  logAnalyticsEvent
} from '@/lib/db';
import { generateConsultationResponse } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      message,
      selectedNeed,
      chatHistory
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const session = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const conversation = getOrCreateConversation(session, selectedNeed);

    // Save user message to database
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

    // Generate AI response with RAG
    const aiResponse = await generateConsultationResponse(
      message,
      chatHistory || [],
      selectedNeed
    );

    // Update conversation intent
    updateConversationIntent(conversation.id, aiResponse.intent);

    // Save bot message to database
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

    // If human handoff was needed or fallback
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
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
