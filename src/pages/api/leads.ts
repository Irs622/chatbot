import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllLeadsAsync,
  createLeadAsync
} from '../../chatbot/lib/db.ts';
import {
  sendLeadNotification,
  generateConsultationRef,
  generateClientWhatsAppUrl
} from '../../chatbot/lib/notifications.ts';
import { isAdminAuthenticated } from '../../chatbot/lib/auth.ts';
import { validatePhoneNumber, validateEmail } from '../../chatbot/lib/validation.ts';
import { checkRateLimitAsync } from '../../chatbot/lib/rateLimit.ts';

/**
 * Lead Inquiries Endpoint for Next.js 13.2.4 Pages Router
 * Supports both PRD v1.0.0 and interactive Lead Form submissions.
 * Guaranteed ZERO-TOUCH to host MySQL 8 Sequelize tables.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGetLeads(req, res);
  }

  if (req.method === 'POST') {
    return handlePostLead(req, res);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

async function handleGetLeads(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!isAdminAuthenticated(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Inpartner corporate administrative access required.'
      });
    }

    const leads = await getAllLeadsAsync();
    return res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in GET Pages /api/leads] [ID: ${requestId}]:`, error);
    return res.status(500).json({ error: 'Internal server error', request_id: requestId });
  }
}

async function handlePostLead(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Rate Limiting Protection (Max 5 submissions per 10 minutes per IP)
    const rateLimit = await checkRateLimitAsync(req, {
      identifier: 'leads_submit',
      limit: 5,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.isAllowed) {
      return res.status(429).json({
        error: `Submission limit reached. Please wait ${Math.ceil(rateLimit.resetInSeconds / 60)} minute(s) before submitting another inquiry.`
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // Normalize field variations between PRD blueprint and ChatWidget form
    const name = (body.name || '').trim();
    const company = (body.company || '').trim();
    const job_title = (body.job_title || body.designation || '').trim();
    const company_scale = body.company_scale;
    const industry = body.industry;
    const timeline = body.timeline;
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const business_need = (body.business_need || body.serviceInterest || 'Consultation Inquiry').trim();
    const notes = (body.notes || '').trim();
    const diagnostic_summary = body.diagnostic_summary;
    const diagnostic_data = body.diagnostic_data || (body.diagnosticScore ? { score: body.diagnosticScore } : undefined);
    const attribution = body.attribution || body.utm;
    const conversation_id = body.conversation_id;

    // Field length safety limits
    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Full name must be between 2 and 100 characters.' });
    }

    if (company && company.length > 120) {
      return res.status(400).json({ error: 'Company name cannot exceed 120 characters.' });
    }

    if (job_title && job_title.length > 100) {
      return res.status(400).json({ error: 'Job title / designation cannot exceed 100 characters.' });
    }

    if (!business_need || business_need.length > 200) {
      return res.status(400).json({ error: 'Advisory need selection is required (maximum 200 characters).' });
    }

    if (notes && notes.length > 1000) {
      return res.status(400).json({ error: 'Notes cannot exceed 1,000 characters.' });
    }

    // Phone & Email verification
    let validatedPhone = '';
    if (phone) {
      const phoneResult = validatePhoneNumber(phone);
      if (!phoneResult.isValid) {
        return res.status(400).json({
          error: phoneResult.error || 'Invalid phone or WhatsApp number format.'
        });
      }
      validatedPhone = phoneResult.cleanPhone;
    } else if (!email) {
      return res.status(400).json({
        error: 'Please provide either a WhatsApp phone number or business email for consultation follow-up.'
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email address format (e.g. name@company.com).'
      });
    }

    const country = (body.country || '').trim();
    const combinedNotes = [
      country ? `[Country / Origin: ${country}]` : '',
      notes
    ].filter(Boolean).join('\n\n');

    // 2. Persist lead record (Exclusively to Supabase Cloud or Local Cache Fallback)
    const lead = await createLeadAsync({
      conversation_id,
      name,
      company: company || undefined,
      job_title: job_title || undefined,
      company_scale: company_scale || undefined,
      industry: industry || undefined,
      timeline: timeline || undefined,
      email: email || undefined,
      phone: validatedPhone || phone,
      business_need,
      notes: combinedNotes || undefined,
      diagnostic_summary: diagnostic_summary ? String(diagnostic_summary).slice(0, 1000) : undefined,
      diagnostic_data: diagnostic_data || undefined,
      attribution: attribution && typeof attribution === 'object' ? {
        utm_source: typeof attribution.utm_source === 'string' ? attribution.utm_source.slice(0, 100) : (typeof attribution.source === 'string' ? attribution.source.slice(0, 100) : undefined),
        utm_medium: typeof attribution.utm_medium === 'string' ? attribution.utm_medium.slice(0, 100) : (typeof attribution.medium === 'string' ? attribution.medium.slice(0, 100) : undefined),
        utm_campaign: typeof attribution.utm_campaign === 'string' ? attribution.utm_campaign.slice(0, 150) : (typeof attribution.campaign === 'string' ? attribution.campaign.slice(0, 150) : undefined),
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
    const scoreCategory = body.scoreCategory || (lead.priority_tier === 'tier_1' ? 'HIGH' : lead.priority_tier === 'tier_2' ? 'MEDIUM' : 'LOW');

    // 3. Dispatch real-time lead notifications asynchronously
    const dispatchNotifications = async () => {
      try {
        await sendLeadNotification(lead, {
          lang: body.lang,
          refCode
        });
      } catch (err) {
        console.warn(`[Async Lead Notification Error] [Lead: ${lead.id}]:`, err);
      }
    };

    if (typeof queueMicrotask !== 'undefined') {
      queueMicrotask(dispatchNotifications);
    } else {
      setTimeout(dispatchNotifications, 0);
    }

    // 4. Return success response fulfilling both PRD contract and Widget contract
    return res.status(201).json({
      success: true,
      leadId: lead.id,
      lead_id: lead.id,
      scoreCategory,
      ref_code: refCode,
      whatsapp_url: clientWhatsAppUrl,
      message: 'Lead successfully recorded.',
      lead
    });
  } catch (error: any) {
    const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[Error in POST Pages /api/leads] [ID: ${requestId}]:`, error);
    return res.status(500).json({ error: 'Internal server error', request_id: requestId });
  }
}
