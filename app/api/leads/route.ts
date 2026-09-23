import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, createLead, logAnalyticsEvent } from '@/lib/db';

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      message: 'Lead berhasil disimpan. Tim Inpartner akan segera menghubungi Anda.',
      lead
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
