import { NextRequest, NextResponse } from 'next/server';
import { updateLeadStatus, LeadStatus } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, notes } = body;

    const validStatuses: LeadStatus[] = ['new', 'contacted', 'in_progress', 'converted', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 });
    }

    const updated = updateLeadStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
