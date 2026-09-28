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

  const formattedTime = new Date().toLocaleString('id-ID', {
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
      
      const payload = isSlackOrDiscord
        ? {
            text: `🚨 *NEW CONSULTATION LEAD (Inpartner AI Agent)*\n` +
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
      const telegramMessage =
        `🚨 *NEW CLIENT LEAD (INPARTNER AGENT)*\n\n` +
        `👤 *Name:* ${escapeTelegramMarkdown(lead.name)}\n` +
        `🏢 *Company:* ${escapeTelegramMarkdown(lead.company || '-')}\n` +
        `📱 *WhatsApp:* \`${escapeTelegramMarkdown(lead.phone)}\`\n` +
        `✉️ *Email:* ${escapeTelegramMarkdown(lead.email || '-')}\n` +
        `🎯 *Advisory Need:* ${escapeTelegramMarkdown(lead.business_need)}\n` +
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
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Inpartner Agent <notifications@inpartner.id>',
          to: [notificationEmail],
          subject: `🚨 New Consultation Lead: ${lead.name} (${lead.company || 'Direct'}) - ${lead.business_need}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #005DAD; margin-top: 0;">New Client Consultation Inquiry</h2>
              <p style="color: #475569; font-size: 14px;">A new prospective client submitted a consultation inquiry via Inpartner AI on the website:</p>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; width: 140px;">Full Name:</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${lead.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Company:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${lead.company || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">WhatsApp / Phone:</td>
                  <td style="padding: 10px 0; color: #005DAD; font-weight: bold;">
                    <a href="${waLink}" style="color: #005DAD; text-decoration: none;">${lead.phone} (Contact on WhatsApp)</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Email Address:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${lead.email || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Primary Need:</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${lead.business_need}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b;">Additional Notes:</td>
                  <td style="padding: 10px 0; color: #334155;">${lead.notes || '-'}</td>
                </tr>
              </table>

              <div style="margin-top: 25px;">
                <a href="${waLink}" style="display: inline-block; background: #005DAD; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
                  Contact Client via WhatsApp
                </a>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 25px;">
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
