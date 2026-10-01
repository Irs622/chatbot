import type { Lead } from './db.ts';
import { INPARTNER_CONFIG } from './config.ts';
import { detectLanguage } from './language.ts';
import { getCompanyScaleLabel, getIndustryLabel, getTimelineLabel } from './qualification.ts';

export interface NotificationResult {
  webhookSent: boolean;
  telegramSent: boolean;
  emailSent: boolean;
  clientEmailSent?: boolean;
  errors: string[];
}

/**
 * Generates an official institutional consultation reference code.
 * Format: INP-YYYYMMDD-XXXX (e.g. INP-20261001-A9F2)
 */
export function generateConsultationRef(leadId?: string, date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const suffix = (leadId ? leadId.replace(/[^a-zA-Z0-9]/g, '').slice(-4) : Math.random().toString(36).substring(2, 6)).toUpperCase();
  return `INP-${yyyy}${mm}${dd}-${suffix}`;
}

/**
 * Generates a pre-filled WhatsApp handoff URL pre-populated with consultation reference code.
 */
export function generateClientWhatsAppUrl(lead: { name: string; business_need: string }, refCode: string, lang: 'id' | 'en' | 'ko' = 'id'): string {
  const phone = '6285934548202';
  let message = '';

  if (lang === 'ko') {
    message = `안녕하세요 인파트너 자문팀, 웹사이트를 통해 비즈니스 상담(접수번호: ${refCode})을 신청한 ${lead.name}입니다. 분야: ${lead.business_need}. 미팅 일정 안내 부탁드립니다.`;
  } else if (lang === 'en') {
    message = `Hello Inpartner Advisory Team, I have submitted a consultation request on the website (Ref: ${refCode}). My name is ${lead.name}, regarding ${lead.business_need}. Please advise on next steps.`;
  } else {
    message = `Halo tim penasihat Inpartner, saya ${lead.name} telah mengajukan konsultasi bisnis di website (No. Ref: ${refCode}) mengenai ${lead.business_need}. Mohon informasi jadwal temu/diskusi.`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface ClientEmailContent {
  subject: string;
  html: string;
  refCode: string;
  waClientUrl: string;
  lang: 'id' | 'en' | 'ko';
}

/**
 * Builds the official trilingual consultation receipt email content and metadata.
 */
export function buildClientConfirmationEmailContent(
  lead: Lead,
  options?: { lang?: 'id' | 'en' | 'ko'; refCode?: string }
): ClientEmailContent {
  const lang: 'id' | 'en' | 'ko' = options?.lang || detectLanguage(`${lead.name} ${lead.business_need} ${lead.notes || ''}`);
  const refCode = options?.refCode || generateConsultationRef(lead.id);
  const waClientUrl = generateClientWhatsAppUrl(lead, refCode, lang);

  const score = lead.score !== undefined ? lead.score : 50;
  const tier = lead.priority_tier || (score >= 70 ? 'tier_1' : score >= 40 ? 'tier_2' : 'tier_3');
  const targetSla = lead.score_breakdown?.target_sla || (tier === 'tier_1' ? '< 2 Jam Kerja' : tier === 'tier_2' ? '< 12 Jam Kerja' : '1x24 Jam Kerja');

  // Trilingual content localization
  let subject = '';
  let salutation = '';
  let introP = '';
  let nextStepsH = '';
  let nextStepsText = '';
  let summaryH = '';
  let labelRef = '';
  let labelClient = '';
  let labelCompany = '';
  let labelScope = '';
  let labelSla = '';
  let ctaText = '';
  let footerConfidentiality = '';

  if (lang === 'ko') {
    subject = `[INPARTNER] 경영 자문 상담 접수 확인 안내 (${refCode})`;
    salutation = `${escapeHtml(lead.name)} 귀하,`;
    introP = `PT Inpartner Optima Integra(INPARTNER)에 문의해 주셔서 대단히 감사합니다. 귀사(<strong>${escapeHtml(lead.company || '귀사')}</strong>)의 경영 및 투자 자문 상담 요청이 공식 접수되었습니다.`;
    nextStepsH = `향후 진행 절차 안내`;
    nextStepsText = `인파트너 수석 자문팀이 제출해 주신 사업 개요를 면밀히 검토하고 있습니다. 초기 진단(Exploratory Diagnostic)을 위해 영업일 기준 신속히 회신드리겠습니다.`;
    summaryH = `접수 내역 요약`;
    labelRef = `접수 번호`;
    labelClient = `신청인 성함`;
    labelCompany = `회사 / 기관명`;
    labelScope = `자문 요청 분야`;
    labelSla = `목표 회신 SLA`;
    ctaText = `공식 WhatsApp으로 신속 문의`;
    footerConfidentiality = `본 안내는 공인된 경영 컨설팅 업무 절차에 따라 발송되었습니다. 인파트너는 철저한 비밀유지협약(Mutual NDA) 원칙을 준수합니다.`;
  } else if (lang === 'en') {
    subject = `[INPARTNER] Official Consultation Inquiry Receipt (${refCode})`;
    salutation = `Dear ${escapeHtml(lead.name)},`;
    introP = `Thank you for reaching out to PT Inpartner Optima Integra (INPARTNER). Your corporate advisory consultation inquiry for <strong>${escapeHtml(lead.company || 'your enterprise')}</strong> has been officially logged in our system.`;
    nextStepsH = `Next Steps & Onboarding`;
    nextStepsText = `Our senior advisory practice leads are conducting a preliminary review of your stated business challenge. An engagement director will contact you to schedule an initial Exploratory Diagnostic Session.`;
    summaryH = `Inquiry Summary`;
    labelRef = `Reference Code`;
    labelClient = `Client Name`;
    labelCompany = `Enterprise / Organization`;
    labelScope = `Advisory Scope`;
    labelSla = `Target Follow-up SLA`;
    ctaText = `Connect via WhatsApp Directly`;
    footerConfidentiality = `INPARTNER operates under rigorous corporate governance and institutional Non-Disclosure Agreement (NDA) standards. All information shared remains strictly confidential.`;
  } else {
    subject = `[INPARTNER] Konfirmasi Penerimaan Konsultasi Bisnis (${refCode})`;
    salutation = `Yth. Bapak/Ibu ${escapeHtml(lead.name)},`;
    introP = `Terima kasih telah mempercayakan konsultasi bisnis perusahaan Anda kepada PT Inpartner Optima Integra (INPARTNER). Permintaan penasihat bisnis untuk <strong>${escapeHtml(lead.company || 'perusahaan Anda')}</strong> telah kami terima secara resmi.`;
    nextStepsH = `Langkah Selanjutnya`;
    nextStepsText = `Tim konsultan senior kami sedang mempelajari ringkasan kebutuhan bisnis yang Anda sampaikan. Seorang Business Development Director / Senior Advisor kami akan menghubungi Anda untuk mengoordinasikan sesi Exploratory Diagnostic Consultation.`;
    summaryH = `Rincian Pengajuan Konsultasi`;
    labelRef = `Nomor Referensi`;
    labelClient = `Nama Klien`;
    labelCompany = `Nama Perusahaan`;
    labelScope = `Ruang Lingkup Penasihat`;
    labelSla = `Target Respon SLA`;
    ctaText = `Hubungi Tim via WhatsApp Langsung`;
    footerConfidentiality = `INPARTNER beroperasi di bawah standar tata kelola profesional dan protokol kerahasiaan Perjanjian Kerahasiaan Bersama (Mutual NDA). Seluruh informasi Anda terjamin kerahasiaannya.`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(subject)}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- Header Banner -->
        <tr>
          <td style="background-color: #005DAD; padding: 28px 32px; text-align: left;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">INPARTNER</h1>
            <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">PT Inpartner Optima Integra • Business & Management Consulting</p>
            <p style="color: #93c5fd; margin: 2px 0 0 0; font-size: 11px; font-style: italic;">"Unleash The Power Of Your Business"</p>
          </td>
        </tr>

        <!-- Content Body -->
        <tr>
          <td style="padding: 32px;">
            <div style="display: inline-block; background-color: #ecfeff; border: 1px solid #a5f3fc; color: #0891b2; font-family: monospace; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px;">
              ${escapeHtml(refCode)}
            </div>

            <p style="font-size: 15px; margin: 0 0 14px 0; color: #0f172a; font-weight: 600;">${salutation}</p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #334155;">${introP}</p>

            <!-- Summary Table -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px; font-size: 13px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <tr>
                <td colspan="2" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #005DAD; background-color: #f1f5f9; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  📋 ${summaryH}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 16px; color: #64748b; width: 140px; border-bottom: 1px solid #e2e8f0;">${labelRef}:</td>
                <td style="padding: 10px 16px; font-family: monospace; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(refCode)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${labelClient}:</td>
                <td style="padding: 10px 16px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(lead.name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${labelCompany}:</td>
                <td style="padding: 10px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(lead.company || '-')}</td>
              </tr>
              ${lead.job_title ? `
              <tr>
                <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${lang === 'id' ? 'Jabatan / Peran' : lang === 'ko' ? '직책' : 'Job Title'}:</td>
                <td style="padding: 10px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(lead.job_title)}</td>
              </tr>` : ''}
              ${lead.timeline ? `
              <tr>
                <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${lang === 'id' ? 'Target Linimasa' : lang === 'ko' ? '목표 일정' : 'Target Timeline'}:</td>
                <td style="padding: 10px 16px; color: #059669; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${escapeHtml(getTimelineLabel(lead.timeline, lang))}</td>
              </tr>` : ''}
              ${lead.diagnostic_summary ? `
              <tr>
                <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${lang === 'id' ? 'Diagnostik Awal' : lang === 'ko' ? '사전 진단 요약' : 'Discovery Scoping'}:</td>
                <td style="padding: 10px 16px; color: #0284c7; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${escapeHtml(lead.diagnostic_summary)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${labelScope}:</td>
                <td style="padding: 10px 16px; font-weight: 600; color: #005DAD; border-bottom: 1px solid #e2e8f0;">${escapeHtml(lead.business_need)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 16px; color: #64748b;">${labelSla}:</td>
                <td style="padding: 10px 16px; font-weight: bold; color: #059669;">${escapeHtml(targetSla)}</td>
              </tr>
            </table>

            <!-- Next Steps -->
            <div style="background-color: #ffffff; border-left: 3px solid #005DAD; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #334155; line-height: 1.5;">
              <strong style="color: #0f172a; display: block; margin-bottom: 4px;">${nextStepsH}</strong>
              ${nextStepsText}
            </div>

            <!-- WhatsApp Action Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${waClientUrl}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: bold; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                💬 ${ctaText}
              </a>
            </div>

            <!-- Office Details -->
            <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 24px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              <strong>PT Inpartner Optima Integra (INPARTNER)</strong><br>
              Pakuwon Tower, Unit J, Lantai 10, Jl. Raya Casablanca Kav. 88, Jakarta Selatan 12870, Indonesia<br>
              WhatsApp: +62 859 3454 8202 • Email: info@inpartner.id • Website: inpartner.id
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; font-size: 11px; color: #64748b;">
            ${footerConfidentiality}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return {
    subject,
    html,
    refCode,
    waClientUrl,
    lang
  };
}

/**
 * Sends an automated client-facing consultation receipt confirmation email via Resend.
 */
export async function sendClientConfirmationEmail(
  lead: Lead,
  options?: { lang?: 'id' | 'en' | 'ko'; refCode?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!lead.email) {
    return { success: false, error: 'No client email provided' };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, error: 'RESEND_API_KEY environment variable not configured' };
  }

  const { subject, html } = buildClientConfirmationEmailContent(lead, options);

  try {
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'INPARTNER Advisory <notifications@inpartner.id>';

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [lead.email],
          subject,
          html
        })
      });

    if (res.ok) {
      return { success: true };
    } else {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: `Resend API returned status ${res.status}: ${JSON.stringify(errJson)}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches real-time notifications across configured channels (Webhook, Telegram, Internal Email, Client Email).
 */
export async function sendLeadNotification(
  lead: Lead,
  options?: { lang?: 'id' | 'en' | 'ko'; refCode?: string }
): Promise<NotificationResult> {
  const result: NotificationResult = {
    webhookSent: false,
    telegramSent: false,
    emailSent: false,
    clientEmailSent: false,
    errors: []
  };

  const refCode = options?.refCode || generateConsultationRef(lead.id);

  const formattedTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const waLink = cleanPhone.startsWith('0')
    ? `https://wa.me/62${cleanPhone.slice(1)}`
    : `https://wa.me/${cleanPhone}`;

  // 1. Webhook Notification (Supports Google Sheets, Zapier, Make, Slack, Discord, Custom CRM)
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const isSlackOrDiscord = webhookUrl.includes('slack.com') || webhookUrl.includes('discord.com');
      
      const score = lead.score !== undefined ? lead.score : 50;
      const tier = lead.priority_tier || (score >= 70 ? 'tier_1' : score >= 40 ? 'tier_2' : 'tier_3');
      const tierLabel = lead.score_breakdown?.tier_label || (tier === 'tier_1' ? 'Tier 1 (Hot / Urgent)' : tier === 'tier_2' ? 'Tier 2 (Warm / Strategic)' : 'Tier 3 (Standard)');
      const targetSla = lead.score_breakdown?.target_sla || (tier === 'tier_1' ? '< 2 business hours' : tier === 'tier_2' ? '< 12 business hours' : 'Within 24 business hours');

      const qualItems = [
        lead.job_title ? `• *Role / Title:* ${lead.job_title}` : '',
        lead.company_scale ? `• *Enterprise Scale:* ${getCompanyScaleLabel(lead.company_scale)}` : '',
        lead.industry ? `• *Industry Sector:* ${getIndustryLabel(lead.industry)}` : '',
        lead.timeline ? `• *Target Timeline:* ${getTimelineLabel(lead.timeline)}` : '',
        lead.diagnostic_summary ? `• *Discovery Scoping:* ${lead.diagnostic_summary}` : ''
      ].filter(Boolean);
      const qualSection = qualItems.length > 0 ? `\n${qualItems.join('\n')}` : '';

      const payload = isSlackOrDiscord
        ? {
            text: `🚨 *NEW CONSULTATION LEAD (Inpartner AI Agent)*\n` +
                  `• *Ref:* \`${refCode}\`\n` +
                  `• *Priority:* ${tierLabel} (Score: ${score}/100)\n` +
                  `• *Target SLA:* ${targetSla}\n` +
                  `• *Name:* ${lead.name}\n` +
                  `• *Company:* ${lead.company || '-'}\n` +
                  qualSection + '\n' +
                  `• *WhatsApp:* ${lead.phone} (<${waLink}|WhatsApp Chat>)\n` +
                  `• *Email:* ${lead.email || '-'}\n` +
                  `• *Advisory Need:* ${lead.business_need}\n` +
                  `• *Notes:* ${lead.notes || '-'}\n` +
                  `• *Timestamp:* ${formattedTime} WIB`
          }
        : {
            event: 'new_lead',
            timestamp: new Date().toISOString(),
            formatted_time: formattedTime,
            ref_code: refCode,
            lead: {
              id: lead.id,
              ref_code: refCode,
              name: lead.name,
              company: lead.company,
              job_title: lead.job_title,
              company_scale: lead.company_scale ? getCompanyScaleLabel(lead.company_scale) : undefined,
              industry: lead.industry ? getIndustryLabel(lead.industry) : undefined,
              timeline: lead.timeline ? getTimelineLabel(lead.timeline) : undefined,
              diagnostic_summary: lead.diagnostic_summary,
              diagnostic_data: lead.diagnostic_data,
              phone: lead.phone,
              email: lead.email,
              business_need: lead.business_need,
              notes: lead.notes,
              status: lead.status,
              score: lead.score,
              priority_tier: lead.priority_tier,
              score_breakdown: lead.score_breakdown,
              attribution: lead.attribution,
              whatsapp_link: waLink
            }
          };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        result.webhookSent = true;
      } else {
        result.errors.push(`Webhook responded with status ${res.status}`);
      }
    } catch (err: any) {
      console.error('Failed to trigger lead webhook:', err);
      result.errors.push(`Webhook error: ${err.message}`);
    }
  }

  // 2. Telegram Bot Notification (Direct to Sales Group / PIC)
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (telegramBotToken && telegramChatId) {
    try {
      const score = lead.score !== undefined ? lead.score : 50;
      const tier = lead.priority_tier || (score >= 70 ? 'tier_1' : score >= 40 ? 'tier_2' : 'tier_3');
      const tierEmoji = tier === 'tier_1' ? '🔥 [TIER 1 - HOT]' : tier === 'tier_2' ? '⚡ [TIER 2 - STRATEGIC]' : '📋 [TIER 3 - STANDARD]';
      const targetSla = lead.score_breakdown?.target_sla || (tier === 'tier_1' ? '< 2 business hours' : tier === 'tier_2' ? '< 12 business hours' : 'Within 24 business hours');

      const tgQualItems = [
        lead.job_title ? `👔 *Role:* ${escapeTelegramMarkdown(lead.job_title)}` : '',
        lead.company_scale ? `🏷️ *Scale:* ${escapeTelegramMarkdown(getCompanyScaleLabel(lead.company_scale))}` : '',
        lead.industry ? `🏭 *Sector:* ${escapeTelegramMarkdown(getIndustryLabel(lead.industry))}` : '',
        lead.timeline ? `⏳ *Timeline:* ${escapeTelegramMarkdown(getTimelineLabel(lead.timeline))}` : '',
        lead.diagnostic_summary ? `🔍 *Discovery:* ${escapeTelegramMarkdown(lead.diagnostic_summary)}` : '',
        lead.attribution && (lead.attribution.utm_source || lead.attribution.utm_campaign)
          ? `🌐 *Attribution:* ${escapeTelegramMarkdown(lead.attribution.utm_source || 'direct')}${lead.attribution.utm_medium ? '/' + escapeTelegramMarkdown(lead.attribution.utm_medium) : ''}${lead.attribution.utm_campaign ? ' (' + escapeTelegramMarkdown(lead.attribution.utm_campaign) + ')' : ''}`
          : ''
      ].filter(Boolean);
      const tgQualSection = tgQualItems.length > 0 ? `${tgQualItems.join('\n')}\n` : '';

      const telegramMessage =
        `🚨 *NEW CLIENT LEAD (INPARTNER AGENT)*\n\n` +
        `🔖 *Ref:* \`${escapeTelegramMarkdown(refCode)}\`\n` +
        `🎯 *Priority:* ${tierEmoji} (Score: *${score}/100*)\n` +
        `⏱️ *Target SLA:* ${escapeTelegramMarkdown(targetSla)}\n` +
        `👤 *Name:* ${escapeTelegramMarkdown(lead.name)}\n` +
        `🏢 *Company:* ${escapeTelegramMarkdown(lead.company || '-')}\n` +
        tgQualSection +
        `📱 *WhatsApp:* \`${escapeTelegramMarkdown(lead.phone)}\`\n` +
        `✉️ *Email:* ${escapeTelegramMarkdown(lead.email || '-')}\n` +
        `💼 *Advisory Need:* ${escapeTelegramMarkdown(lead.business_need)}\n` +
        `📝 *Notes:* ${escapeTelegramMarkdown(lead.notes || '-')}\n` +
        `🕒 *Timestamp:* ${escapeTelegramMarkdown(formattedTime)} WIB\n\n` +
        `👉 [Click to Chat with Client via WhatsApp](${waLink})`;

      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      });

      if (res.ok) {
        result.telegramSent = true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        result.errors.push(`Telegram API failed: ${JSON.stringify(errorData)}`);
      }
    } catch (err: any) {
      console.error('Failed to send Telegram lead notification:', err);
      result.errors.push(`Telegram error: ${err.message}`);
    }
  }

  // 3. Internal Email Notification via Resend (To BD / Management)
  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || INPARTNER_CONFIG.email;

  if (resendApiKey && notificationEmail) {
    try {
      const score = lead.score !== undefined ? lead.score : 50;
      const tier = lead.priority_tier || (score >= 70 ? 'tier_1' : score >= 40 ? 'tier_2' : 'tier_3');
      const tierBadgeColor = tier === 'tier_1' ? '#b91c1c' : tier === 'tier_2' ? '#b45309' : '#475569';
      const tierBgColor = tier === 'tier_1' ? '#fef2f2' : tier === 'tier_2' ? '#fffbeb' : '#f8fafc';
      const tierLabel = lead.score_breakdown?.tier_label || (tier === 'tier_1' ? 'Tier 1 (Hot Opportunity)' : tier === 'tier_2' ? 'Tier 2 (Strategic Lead)' : 'Tier 3 (Standard)');
      const targetSla = lead.score_breakdown?.target_sla || (tier === 'tier_1' ? '< 2 business hours' : tier === 'tier_2' ? '< 12 business hours' : 'Within 24 business hours');

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Inpartner Agent <notifications@inpartner.id>',
          to: [notificationEmail],
          subject: `[${tier === 'tier_1' ? 'HOT LEAD' : tier === 'tier_2' ? 'WARM LEAD' : 'INQUIRY'}] (${refCode}) ${escapeHtml(lead.name)} - ${escapeHtml(lead.business_need)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 15px;">
                <h2 style="color: #005DAD; margin: 0; font-size: 18px;">New Client Consultation Inquiry</h2>
                <span style="background-color: ${tierBgColor}; color: ${tierBadgeColor}; border: 1px solid ${tierBadgeColor}33; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px;">
                  ${tierLabel} • Score: ${score}/100
                </span>
              </div>
              
              <div style="background-color: #f1f5f9; border-radius: 6px; padding: 6px 12px; font-family: monospace; font-size: 12px; margin-bottom: 14px;">
                Ref Code: <strong>${escapeHtml(refCode)}</strong>
              </div>

              <p style="color: #475569; font-size: 13px; margin-top: 0;">A new prospective client submitted a consultation inquiry via Inpartner AI on the website:</p>
              
              <div style="background: ${tierBgColor}; border: 1px solid ${tierBadgeColor}22; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: ${tierBadgeColor};">
                <strong>Recommended Follow-up SLA:</strong> ${targetSla}
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 15px 0;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b; width: 140px;">Full Name:</td>
                  <td style="padding: 9px 0; font-weight: bold; color: #0f172a;">${escapeHtml(lead.name)}</td>
                </tr>
                ${lead.job_title ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Job Title / Role:</td>
                  <td style="padding: 9px 0; color: #0f172a; font-weight: 600;">${escapeHtml(lead.job_title)}</td>
                </tr>` : ''}
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Company:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${escapeHtml(lead.company || '-')}</td>
                </tr>
                ${lead.company_scale ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Enterprise Scale:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${escapeHtml(getCompanyScaleLabel(lead.company_scale))}</td>
                </tr>` : ''}
                ${lead.industry ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Industry Sector:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${escapeHtml(getIndustryLabel(lead.industry))}</td>
                </tr>` : ''}
                ${lead.timeline ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Target Timeline:</td>
                  <td style="padding: 9px 0; color: #059669; font-weight: bold;">${escapeHtml(getTimelineLabel(lead.timeline))}</td>
                </tr>` : ''}
                ${lead.diagnostic_summary ? `
                <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f0fdf4;">
                  <td style="padding: 9px 0; color: #15803d; font-weight: bold;">Discovery Scoping:</td>
                  <td style="padding: 9px 0; color: #166534; font-weight: 600;">${escapeHtml(lead.diagnostic_summary)}</td>
                </tr>` : ''}
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">WhatsApp / Phone:</td>
                  <td style="padding: 9px 0; color: #005DAD; font-weight: bold;">
                    <a href="${waLink}" style="color: #005DAD; text-decoration: none;">${escapeHtml(lead.phone)} (Contact on WhatsApp)</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Email Address:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${escapeHtml(lead.email || '-')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Advisory Need:</td>
                  <td style="padding: 9px 0; font-weight: bold; color: #0f172a;">${escapeHtml(lead.business_need)}</td>
                </tr>
                ${lead.attribution ? `
                <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                  <td style="padding: 9px 0; color: #475569; font-weight: bold;">Marketing Attribution:</td>
                  <td style="padding: 9px 0; color: #0369a1; font-weight: 600;">
                    ${escapeHtml(lead.attribution.utm_source || 'direct')}${lead.attribution.utm_medium ? ' / ' + escapeHtml(lead.attribution.utm_medium) : ''}
                    ${lead.attribution.utm_campaign ? '<br/><span style="font-size: 11px; color: #64748b; font-weight: normal;">Campaign: ' + escapeHtml(lead.attribution.utm_campaign) + '</span>' : ''}
                    ${lead.attribution.referrer_url ? '<br/><span style="font-size: 11px; color: #64748b; font-weight: normal;">Referrer: ' + escapeHtml(lead.attribution.referrer_url) + '</span>' : ''}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 9px 0; color: #64748b;">Submitted Notes:</td>
                  <td style="padding: 9px 0; color: #334155;">${escapeHtml(lead.notes || '-')}</td>
                </tr>
              </table>

              <div style="margin-top: 20px;">
                <a href="${waLink}" style="display: inline-block; background: #005DAD; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
                  Connect with Client via WhatsApp
                </a>
              </div>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 25px;">
                Submitted at: ${formattedTime} WIB • Inpartner AI Business Consultation Assistant
              </p>
            </div>
          `
        })
      });

      if (res.ok) {
        result.emailSent = true;
      } else {
        result.errors.push(`Resend email API returned status ${res.status}`);
      }
    } catch (err: any) {
      console.error('Failed to send lead email notification:', err);
      result.errors.push(`Email error: ${err.message}`);
    }
  }

  // 4. Automated Client Confirmation Email (Direct to Prospective Client)
  if (lead.email) {
    try {
      const clientEmailResult = await sendClientConfirmationEmail(lead, {
        lang: options?.lang,
        refCode
      });
      if (clientEmailResult.success) {
        result.clientEmailSent = true;
      } else if (clientEmailResult.error) {
        result.errors.push(`Client confirmation email: ${clientEmailResult.error}`);
      }
    } catch (err: any) {
      console.error('Failed to send client confirmation email:', err);
      result.errors.push(`Client email error: ${err.message}`);
    }
  }

  return result;
}

function escapeTelegramMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
