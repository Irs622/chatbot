import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, createLead } from '@/lib/db';
import { sendLeadNotification } from '@/lib/notifications';
import { isAdminAuthenticated } from '@/lib/auth';
import { validatePhoneNumber, validateEmail } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner corporate administrative access required.' },
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
        { error: 'Full name is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!business_need || typeof business_need !== 'string' || !business_need.trim()) {
      return NextResponse.json(
        { error: 'Advisory need selection is required.' },
        { status: 400 }
      );
    }

    // Phone validation
    let validatedPhone = '';
    if (phone && typeof phone === 'string' && phone.trim()) {
      const phoneResult = validatePhoneNumber(phone);
      if (!phoneResult.isValid) {
        return NextResponse.json(
          { error: phoneResult.error || 'Invalid phone or WhatsApp number format.' },
          { status: 400 }
        );
      }
      validatedPhone = phoneResult.cleanPhone;
    } else if (!email) {
      return NextResponse.json(
        { error: 'Please provide either a WhatsApp phone number or business email for consultation follow-up.' },
        { status: 400 }
      );
    }

    // Email validation (if provided)
    if (email && typeof email === 'string' && email.trim()) {
      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email address format (e.g. name@company.com).' },
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
      message: 'Inquiry saved successfully. The Inpartner team will contact you promptly.',
      lead,
      notification: notificationResult
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
