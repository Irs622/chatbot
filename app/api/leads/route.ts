import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, createLead } from '@/lib/db';
import { sendLeadNotification } from '@/lib/notifications';
import { isAdminAuthenticated } from '@/lib/auth';
import { validatePhoneNumber, validateEmail } from '@/lib/validation';

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

    // Minimum validation: Name & Business Need
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi minimal 2 karakter.' },
        { status: 400 }
      );
    }

    if (!business_need || typeof business_need !== 'string' || !business_need.trim()) {
      return NextResponse.json(
        { error: 'Kebutuhan layanan bisnis wajib dipilih.' },
        { status: 400 }
      );
    }

    // Phone validation (Indonesian format 08xx / +628xx, 10-14 digits)
    let validatedPhone = '';
    if (phone && typeof phone === 'string' && phone.trim()) {
      const phoneResult = validatePhoneNumber(phone);
      if (!phoneResult.isValid) {
        return NextResponse.json(
          { error: phoneResult.error || 'Format nomor WhatsApp tidak valid.' },
          { status: 400 }
        );
      }
      validatedPhone = phoneResult.cleanPhone;
    } else if (!email) {
      return NextResponse.json(
        { error: 'Harap cantumkan Nomor WhatsApp atau Email untuk tindak lanjut konsultasi.' },
        { status: 400 }
      );
    }

    // Email validation (if provided)
    if (email && typeof email === 'string' && email.trim()) {
      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'Format alamat email tidak valid (contoh: nama@perusahaan.com).' },
          { status: 400 }
        );
      }
    }

    const lead = createLead({
      conversation_id,
      name: name.trim(),
      company: company?.trim() || '',
      email: email?.trim() || '',
      phone: validatedPhone || phone?.trim() || '',
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
