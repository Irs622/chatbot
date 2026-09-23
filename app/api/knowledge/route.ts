import { NextRequest, NextResponse } from 'next/server';
import { loadAllKnowledgeChunks, retrieveKnowledge } from '@/lib/rag';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (query) {
      const results = retrieveKnowledge(query, 10);
      return NextResponse.json({ success: true, query, count: results.length, results });
    }

    const all = loadAllKnowledgeChunks();
    return NextResponse.json({
      success: true,
      totalChunks: all.length,
      chunks: all
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
