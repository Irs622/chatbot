import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getOrCreateConversationAsync,
  addMessageAsync,
  updateConversationIntentAsync,
  logAnalyticsEventAsync
} from '../../chatbot/lib/db.ts';
import {
  generateConsultationResponseStream,
  type AIStreamEvent
} from '../../chatbot/lib/ai.ts';
import { checkRateLimitAsync } from '../../chatbot/lib/rateLimit.ts';

// Disable default Next.js bodyParser response timeout if needed
export const config = {
  api: {
    bodyParser: true,
    responseLimit: false
  }
};

/**
 * Streaming Chat Endpoint for Next.js 13.2.4 Pages Router
 * Implements HTTP Server-Sent Events (SSE) compatible with Express and Next.js Pages runtime.
 * Supports both PRD v1.0.0 schema and interactive ChatWidget schema.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // 1. Rate Limiting Protection (Max 30 inquiries per minute per IP)
    const rateLimit = await checkRateLimitAsync(req, {
      identifier: 'chat_api',
      limit: 30,
      windowMs: 60 * 1000
    });

    if (!rateLimit.isAllowed) {
      res.setHeader('Retry-After', String(rateLimit.resetInSeconds));
      res.setHeader('X-RateLimit-Limit', '30');
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        error: `Too many requests. Please wait ${rateLimit.resetInSeconds} seconds before sending another inquiry.`
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // Support both PRD body format ({ messages, locale, sessionId }) and widget format ({ message, chatHistory, sessionId })
    let message = '';
    let selectedNeed = body.selectedNeed;
    let chatHistory = body.chatHistory || [];
    const session = body.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (typeof body.message === 'string' && body.message.trim()) {
      message = body.message.trim();
    } else if (Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMsg = body.messages[body.messages.length - 1];
      message = (lastMsg.content || lastMsg.message || '').trim();
      chatHistory = body.messages.slice(0, -1).map((m: any) => ({
        sender: m.role === 'assistant' || m.role === 'bot' ? 'bot' : 'user',
        text: m.content || m.message || ''
      }));
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum allowed length of 2,000 characters.' });
    }

    // 2. Set Server-Sent Events (SSE) Streaming Headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Crucial: prevents Nginx reverse-proxy buffering

    // Track client disconnection
    let isClientConnected = true;
    req.on('close', () => {
      isClientConnected = false;
    });

    // 3. Database Persistence: initialize conversation & record user message
    const conversation = await getOrCreateConversationAsync(session, selectedNeed);
    await addMessageAsync({
      conversation_id: conversation.id,
      sender: 'user',
      message,
      intent: selectedNeed || undefined
    });

    logAnalyticsEventAsync({
      event_name: 'question_asked',
      session_id: session,
      conversation_id: conversation.id,
      metadata: { query: message, selectedNeed }
    }).catch(() => {});

    // 4. Stream RAG & AI consultation response
    const generator = generateConsultationResponseStream(
      message,
      chatHistory,
      selectedNeed,
      true
    );

    let finalResponse: Extract<AIStreamEvent, { type: 'done' }> | null = null;

    for await (const event of generator) {
      if (!isClientConnected) break;

      if (event.type === 'start') {
        const startData = {
          ...event,
          sessionId: session,
          conversationId: conversation.id
        };
        res.write(`data: ${JSON.stringify(startData)}\n\n`);
      } else if (event.type === 'chunk') {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } else if (event.type === 'done') {
        finalResponse = event;
        const doneData = {
          ...event,
          sessionId: session,
          conversationId: conversation.id
        };
        res.write(`data: ${JSON.stringify(doneData)}\n\n`);
      }

      // Flush if gzip / compression stream wrapper is active
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    }

    // 5. Persist final AI consultation message
    if (finalResponse) {
      await addMessageAsync({
        conversation_id: conversation.id,
        sender: 'bot',
        message: finalResponse.fullAnswer,
        intent: finalResponse.intent,
        metadata: {
          recommended_service: finalResponse.recommendedService,
          sources: finalResponse.sources,
          suggest_lead_capture: finalResponse.suggestLeadCapture,
          quick_actions: finalResponse.quickActions,
          provider: finalResponse.provider,
          model: finalResponse.model
        }
      });

      await updateConversationIntentAsync(conversation.id, finalResponse.intent);

      if (finalResponse.isFallback) {
        logAnalyticsEventAsync({
          event_name: 'human_handoff',
          session_id: session,
          conversation_id: conversation.id,
          metadata: { reason: 'fallback_unknown_query' }
        }).catch(() => {});
      }
    }

    return res.end();
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in Pages /api/chat] [ID: ${requestId}]:`, error);

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error', request_id: requestId });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal server error', requestId })}\n\n`);
      return res.end();
    }
  }
}
