import { NextRequest, NextResponse } from 'next/server';
import {
  updateLeadStatus,
  updateLeadStatusAsync,
  deleteLead,
  deleteLeadAsync,
  getLeadById,
  getLeadByIdAsync,
  getMessagesByConversationId,
  getMessagesByConversationIdAsync,
  LeadStatus
} from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner administrative privileges required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const lead = await getLeadByIdAsync(id);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const messages = lead.conversation_id
      ? await getMessagesByConversationIdAsync(lead.conversation_id)
      : [];

    return NextResponse.json({ success: true, lead, messages });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in GET /api/leads/[id]] [ID: ${requestId}]:`, error);
    return NextResponse.json({ error: 'Internal server error', request_id: requestId }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner administrative privileges required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { status, notes } = body;

    const validStatuses: LeadStatus[] = ['new', 'contacted', 'in_progress', 'proposal', 'converted', 'closed'];

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 });
    }

    if (status === undefined && notes === undefined) {
      return NextResponse.json({ error: 'Either status or notes must be provided' }, { status: 400 });
    }

    const updated = await updateLeadStatusAsync(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in PATCH /api/leads/[id]] [ID: ${requestId}]:`, error);
    return NextResponse.json({ error: 'Internal server error', request_id: requestId }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner administrative privileges required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const deleted = await deleteLeadAsync(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Lead not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in DELETE /api/leads/[id]] [ID: ${requestId}]:`, error);
    return NextResponse.json({ error: 'Internal server error', request_id: requestId }, { status: 500 });
  }
}
