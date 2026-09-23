import { Lead } from './db';

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
            text: `🚨 *PROSPEK KONSULTASI BARU (Inpartner Agent)*\n` +
                  `• *Nama:* ${lead.name}\n` +
                  `• *Perusahaan:* ${lead.company || '-'}\n` +
                  `• *WhatsApp:* ${lead.phone} (<${waLink}|Chat WA>)\n` +
                  `• *Email:* ${lead.email || '-'}\n` +
                  `• *Kebutuhan:* ${lead.business_need}\n` +
                  `• *Catatan:* ${lead.notes || '-'}\n` +
                  `• *Waktu:* ${formattedTime} WIB`
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
        `🚨 *PROSPEK KLIEN BARU (INPARTNER AGENT)*\n\n` +
        `👤 *Nama:* ${escapeTelegramMarkdown(lead.name)}\n` +
        `🏢 *Perusahaan:* ${escapeTelegramMarkdown(lead.company || '-')}\n` +
        `📱 *WhatsApp:* \`${escapeTelegramMarkdown(lead.phone)}\`\n` +
        `✉️ *Email:* ${escapeTelegramMarkdown(lead.email || '-')}\n` +
        `🎯 *Kebutuhan:* ${escapeTelegramMarkdown(lead.business_need)}\n` +
        `📝 *Catatan:* ${escapeTelegramMarkdown(lead.notes || '-')}\n` +
        `🕒 *Waktu:* ${escapeTelegramMarkdown(formattedTime)} WIB\n\n` +
        `👉 [Klik untuk Chat WhatsApp Klien](${waLink})`;

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
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'corporatesecretary@inpartner.id';

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
          subject: `🚨 Prospek Baru: ${lead.name} (${lead.company || 'Pribadi'}) - ${lead.business_need}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0d5f8a; margin-top: 0;">Prospek Klien Baru Masuk</h2>
              <p style="color: #475569; font-size: 14px;">Terdapat calon klien baru yang mengisi formulir konsultasi melalui Inpartner Agent di website:</p>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; width: 140px;">Nama Lengkap:</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${lead.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Perusahaan:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${lead.company || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">WhatsApp / Telp:</td>
                  <td style="padding: 10px 0; color: #0d5f8a; font-weight: bold;">
                    <a href="${waLink}" style="color: #0d5f8a; text-decoration: none;">${lead.phone} (Hubungi WhatsApp)</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Alamat Email:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${lead.email || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Kebutuhan Utama:</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${lead.business_need}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b;">Catatan Tambahan:</td>
                  <td style="padding: 10px 0; color: #334155;">${lead.notes || '-'}</td>
                </tr>
              </table>

              <div style="margin-top: 25px;">
                <a href="${waLink}" style="display: inline-block; background: #0d5f8a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
                  Hubungi Klien via WhatsApp
                </a>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 25px;">
                Waktu masuk: ${formattedTime} WIB • Inpartner AI Business Consultation Assistant
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
