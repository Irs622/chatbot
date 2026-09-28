import { NextRequest, NextResponse } from 'next/server';
import { loadAllKnowledgeChunks, retrieveKnowledge } from '@/lib/rag';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner administrative privileges required.' },
        { status: 401 }
      );
    }
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
