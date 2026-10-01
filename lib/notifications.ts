import { Lead } from './db';
import { INPARTNER_CONFIG } from './config';

export interface NotificationResult {
  webhookSent: boolean;
  telegramSent: boolean;
  emailSent: boolean;
  errors: string[];
}

/**
 * Dispatches real-time notifications across configured channels (Webhook/Google Sheets, Telegram, Email)
 * when a new business lead is submitted through Inpartner Agent.
 */
export async function sendLeadNotification(lead: Lead): Promise<NotificationResult> {
  const result: NotificationResult = {
    webhookSent: false,
    telegramSent: false,
    emailSent: false,
    errors: []
  };

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

      const payload = isSlackOrDiscord
        ? {
            text: `🚨 *NEW CONSULTATION LEAD (Inpartner AI Agent)*\n` +
                  `• *Priority:* ${tierLabel} (Score: ${score}/100)\n` +
                  `• *Target SLA:* ${targetSla}\n` +
                  `• *Name:* ${lead.name}\n` +
                  `• *Company:* ${lead.company || '-'}\n` +
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
            lead: {
              id: lead.id,
              name: lead.name,
              company: lead.company,
              phone: lead.phone,
              email: lead.email,
              business_need: lead.business_need,
              notes: lead.notes,
              status: lead.status,
              score: lead.score,
              priority_tier: lead.priority_tier,
              score_breakdown: lead.score_breakdown,
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

      const telegramMessage =
        `🚨 *NEW CLIENT LEAD (INPARTNER AGENT)*\n\n` +
        `🎯 *Priority:* ${tierEmoji} (Score: *${score}/100*)\n` +
        `⏱️ *Target SLA:* ${escapeTelegramMarkdown(targetSla)}\n` +
        `👤 *Name:* ${escapeTelegramMarkdown(lead.name)}\n` +
        `🏢 *Company:* ${escapeTelegramMarkdown(lead.company || '-')}\n` +
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

  // 3. Email Notification via Resend (Optional)
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
          from: 'Inpartner Agent <notifications@inpartner.id>',
          to: [notificationEmail],
          subject: `[${tier === 'tier_1' ? 'HOT LEAD' : tier === 'tier_2' ? 'WARM LEAD' : 'INQUIRY'}] ${escapeHtml(lead.name)} (${escapeHtml(lead.company || 'Direct')}) - ${escapeHtml(lead.business_need)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 15px;">
                <h2 style="color: #005DAD; margin: 0; font-size: 18px;">New Client Consultation Inquiry</h2>
                <span style="background-color: ${tierBgColor}; color: ${tierBadgeColor}; border: 1px solid ${tierBadgeColor}33; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px;">
                  ${tierLabel} • Score: ${score}/100
                </span>
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
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; color: #64748b;">Company:</td>
                  <td style="padding: 9px 0; color: #0f172a;">${escapeHtml(lead.company || '-')}</td>
                </tr>
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
