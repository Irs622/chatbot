import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const hasGeminiKey = Boolean(geminiApiKey && geminiApiKey.trim().length > 10);

  return NextResponse.json({
    status: 'ok',
    hasGeminiKey,
    configuredModel: geminiModel,
    activeCandidates: [geminiModel, 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    ),
    timestamp: new Date().toISOString()
  });
}
