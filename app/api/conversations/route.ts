import { NextResponse } from 'next/server';
import { getAllConversations } from '@/lib/db';

export async function GET() {
  try {
    const list = getAllConversations();
    return NextResponse.json({ success: true, count: list.length, conversations: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
