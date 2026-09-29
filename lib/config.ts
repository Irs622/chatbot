/**
 * Centralized Configuration for Inpartner AI Assistant
 * Can be overridden via environment variables in .env.local without modifying code.
 */
export const INPARTNER_CONFIG = {
  name: 'Inpartner Agent',
  companyName: 'PT Inpartner Optima Integra',
  tagline: 'AI Business Consultation Assistant',
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://inpartner.id',
  
  // WhatsApp Contact (Tim Sales / Business Development)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285934548202',
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '+62 859 3454 8202',
  
  // Official Corporate Email
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'corporatesecretary@inpartner.id',
  
  // Office Address
  addressJakarta: 'Pakuwon Tower, Unit J, 10th Floor, Raya Casablanca Street, Kav. 88, South Jakarta, Indonesia',
  
  // Operating Hours
  operatingHours: 'Monday – Friday: 09:00 – 17:00 WIB'
};

/**
 * Returns formatted WhatsApp click-to-chat URL with optional pre-filled message
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const cleanPhone = INPARTNER_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const phone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const msg = customMessage ? `?text=${encodeURIComponent(customMessage)}` : '';
  return `https://wa.me/${phone}${msg}`;
}
