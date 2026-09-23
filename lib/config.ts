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
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '089628310192',
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '0896 2831 0192',
  
  // Official Corporate Email
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'corporatesecretary@inpartner.id',
  
  // Office Addresses
  addressJakarta: 'Pakuwon Tower Lantai 10, Jl. Raya Casablanca Kav. 88, Menteng Dalam, Tebet, Jakarta Selatan 12870, DKI Jakarta',
  addressSurabaya: 'Jemur Sari Street V No. 10, Surabaya, Jawa Timur',
  
  // Operating Hours
  operatingHours: 'Senin - Jumat: 08:30 - 17:30 WIB'
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
