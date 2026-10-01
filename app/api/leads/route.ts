import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, getAllLeadsAsync, createLead } from '@/lib/db';
import { sendLeadNotification, generateConsultationRef, generateClientWhatsAppUrl } from '@/lib/notifications';
import { isAdminAuthenticated } from '@/lib/auth';
import { validatePhoneNumber, validateEmail } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner corporate administrative access required.' },
        { status: 401 }
      );
    }

    const leads = await getAllLeadsAsync();
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Lead Submission Rate Limiter (Max 5 submissions per 10 minutes per IP)
    const rateLimit = checkRateLimit(req, {
      identifier: 'leads_submit',
      limit: 5,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          error: `Submission limit reached. Please wait ${Math.ceil(rateLimit.resetInSeconds / 60)} minute(s) before submitting another inquiry.`
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      conversation_id,
      name,
      company,
      job_title,
      company_scale,
      industry,
      timeline,
      email,
      phone,
      business_need,
      notes,
      diagnostic_summary,
      diagnostic_data,
      attribution
    } = body;

    // Field length safety limits
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Full name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    if (company && typeof company === 'string' && company.trim().length > 120) {
      return NextResponse.json(
        { error: 'Company name cannot exceed 120 characters.' },
        { status: 400 }
      );
    }

    if (job_title && typeof job_title === 'string' && job_title.trim().length > 100) {
      return NextResponse.json(
        { error: 'Job title / designation cannot exceed 100 characters.' },
        { status: 400 }
      );
    }

    if (!business_need || typeof business_need !== 'string' || !business_need.trim() || business_need.trim().length > 200) {
      return NextResponse.json(
        { error: 'Advisory need selection is required (maximum 200 characters).' },
        { status: 400 }
      );
    }

    if (notes && typeof notes === 'string' && notes.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Notes cannot exceed 1,000 characters.' },
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
      job_title: job_title && typeof job_title === 'string' && job_title.trim() ? job_title.trim() : undefined,
      company_scale: company_scale && typeof company_scale === 'string' && company_scale.trim() ? (company_scale as any) : undefined,
      industry: industry && typeof industry === 'string' && industry.trim() ? (industry as any) : undefined,
      timeline: timeline && typeof timeline === 'string' && timeline.trim() ? (timeline as any) : undefined,
      email: email?.trim() || '',
      phone: validatedPhone || phone?.trim() || '',
      business_need: business_need.trim(),
      notes: notes?.trim() || '',
      diagnostic_summary: diagnostic_summary && typeof diagnostic_summary === 'string' && diagnostic_summary.trim() ? diagnostic_summary.trim().slice(0, 1000) : undefined,
      diagnostic_data: diagnostic_data && typeof diagnostic_data === 'object' ? diagnostic_data : undefined,
      attribution: attribution && typeof attribution === 'object' ? {
        utm_source: typeof attribution.utm_source === 'string' ? attribution.utm_source.slice(0, 100) : undefined,
        utm_medium: typeof attribution.utm_medium === 'string' ? attribution.utm_medium.slice(0, 100) : undefined,
        utm_campaign: typeof attribution.utm_campaign === 'string' ? attribution.utm_campaign.slice(0, 150) : undefined,
        utm_term: typeof attribution.utm_term === 'string' ? attribution.utm_term.slice(0, 150) : undefined,
        utm_content: typeof attribution.utm_content === 'string' ? attribution.utm_content.slice(0, 150) : undefined,
        referrer_url: typeof attribution.referrer_url === 'string' ? attribution.referrer_url.slice(0, 500) : undefined,
        landing_page: typeof attribution.landing_page === 'string' ? attribution.landing_page.slice(0, 500) : undefined,
        captured_at: typeof attribution.captured_at === 'string' ? attribution.captured_at : new Date().toISOString()
      } : undefined,
      status: 'new'
    });

    const refCode = generateConsultationRef(lead.id);
    const clientWhatsAppUrl = generateClientWhatsAppUrl(lead, refCode, body.lang || 'id');

    // Dispatch real-time lead notifications (Webhook, Telegram, Internal Email, Client Confirmation Email)
    const notificationResult = await sendLeadNotification(lead, {
      lang: body.lang,
      refCode
    }).catch((err) => {
      console.warn('Lead notification background error:', err);
      return null;
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry saved successfully. The Inpartner team will contact you promptly.',
      ref_code: refCode,
      whatsapp_url: clientWhatsAppUrl,
      lead,
      notification: notificationResult
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
