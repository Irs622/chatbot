import { NextRequest, NextResponse } from 'next/server';
import { getAllConversations } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses khusus manajemen dan tim internal Inpartner.' },
        { status: 401 }
      );
    }

    const list = getAllConversations();
    return NextResponse.json({ success: true, count: list.length, conversations: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
