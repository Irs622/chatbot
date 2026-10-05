import { NextRequest, NextResponse } from 'next/server';
import { checkSupabaseHealth } from '@/lib/supabaseClient';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Inpartner administrative privileges required.' },
      { status: 401 }
    );
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const hasGeminiKey = Boolean(geminiApiKey && geminiApiKey.trim().length > 10);

  const dbHealth = await checkSupabaseHealth();

  return NextResponse.json({
    status: 'ok',
    hasGeminiKey,
    configuredModel: geminiModel,
    activeCandidates: [geminiModel, 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    ),
    database: {
      provider: 'supabase',
      configured: dbHealth.configured,
      connected: dbHealth.ok,
      latencyMs: dbHealth.latencyMs,
      ...(dbHealth.error ? { error: dbHealth.error } : {})
    },
    timestamp: new Date().toISOString()
  });
}
