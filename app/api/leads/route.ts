import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, createLead } from '@/lib/db';
import { sendLeadNotification } from '@/lib/notifications';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses khusus manajemen dan tim internal Inpartner.' },
        { status: 401 }
      );
    }

    const leads = getAllLeads();
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversation_id,
      name,
      company,
      email,
      phone,
      business_need,
      notes
    } = body;

    // Minimum validation (FR-07: Name, Email / WhatsApp, Business Need)
    if (!name || !business_need || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Name, Business Need, and either Email or Phone are required.' },
        { status: 400 }
      );
    }

    const lead = createLead({
      conversation_id,
      name: name.trim(),
      company: company?.trim() || '',
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      business_need: business_need.trim(),
      notes: notes?.trim() || '',
      status: 'new'
    });

    // Dispatch real-time lead notifications (Webhook, Telegram, Email)
    const notificationResult = await sendLeadNotification(lead).catch((err) => {
      console.warn('Lead notification background error:', err);
      return null;
    });

    return NextResponse.json({
      success: true,
      message: 'Lead berhasil disimpan. Tim Inpartner akan segera menghubungi Anda.',
      lead,
      notification: notificationResult
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
