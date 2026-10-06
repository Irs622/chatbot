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

/**
 * Proactive Engagement Triggers & Exit-Intent Nudges Configuration (Issue #8)
 */
export const PROACTIVE_TRIGGER_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_PROACTIVE_TRIGGERS_ENABLED !== 'false',
  dwellTimeSeconds: Number(process.env.NEXT_PUBLIC_DWELL_TIME_SECONDS || 25),
  returnVisitorDwellSeconds: Number(process.env.NEXT_PUBLIC_RETURN_VISITOR_DWELL_SECONDS || 10),
  exitIntentEnabled: process.env.NEXT_PUBLIC_EXIT_INTENT_ENABLED !== 'false',
  frequencyCapPerSession: 1,
  messages: {
    dwell_time: {
      id: {
        badge: 'Konsultasi Strategis',
        title: 'Mengevaluasi Rencana Korporat?',
        body: 'Sedang mengevaluasi opsi strategis korporat atau rencana ekspansi pasar? Tim penasihat kami siap berdiskusi awal secara rahasia.',
        cta: 'Mulai Diskusi Awal →'
      },
      en: {
        badge: 'Strategic Advisory',
        title: 'Evaluating Strategic Options?',
        body: 'Evaluating strategic corporate options or market expansion plans? Our advisory team is available for preliminary discussion.',
        cta: 'Start Preliminary Discussion →'
      },
      ko: {
        badge: '전략 자문',
        title: '기업 전략을 검토 중이십니까?',
        body: '전략적 기업 옵션이나 시장 확장 계획을 검토 중이십니까? 인파트너 자문팀이 초기 비밀 상담을 지원합니다.',
        cta: '비밀 상담 시작하기 →'
      }
    },
    exit_intent: {
      id: {
        badge: 'Sebelum Anda Pergi',
        title: 'Eksplorasi Peluang Bisnis Anda',
        body: 'Sebelum menutup sesi, luangkan 2 menit untuk mengevaluasi potensi kemitraan atau optimasi bisnis bersama Inpartner.',
        cta: 'Konsultasi Singkat 2 Menit →'
      },
      en: {
        badge: 'Before You Go',
        title: 'Explore Advisory Opportunities',
        body: 'Before you leave, spend 2 minutes discovering strategic partnerships or business optimization roadmaps with an advisor.',
        cta: 'Quick 2-Minute Consultation →'
      },
      ko: {
        badge: '떠나시기 전에',
        title: '비즈니스 성장 기회 확인',
        body: '페이지를 나가시기 전, 2분간 인파트너 전문 자문역과 맞춤형 성장 전략을 간편하게 확인해보세요.',
        cta: '2분 빠른 자문 시작 →'
      }
    },
    return_visitor: {
      id: {
        badge: 'Selamat Datang Kembali',
        title: 'Lanjutkan Diskusi Bisnis Anda',
        body: 'Senang melihat Anda kembali. Ingin melanjutkan diskusi konsultasi atau menjadwalkan diagnostic assessment?',
        cta: 'Lanjutkan Sesi Konsultasi →'
      },
      en: {
        badge: 'Welcome Back',
        title: 'Continue Your Advisory Session',
        body: 'Glad to see you again. Would you like to continue our consultation discussion or schedule a diagnostic assessment?',
        cta: 'Continue Advisory Session →'
      },
      ko: {
        badge: '다시 오신 것을 환영합니다',
        title: '자문 상담을 이어가세요',
        body: '다시 방문해 주셔서 감사합니다. 이전 자문 논의를 이어가시거나 비즈니스 진단을 예약하시겠습니까?',
        cta: '자문 세션 계속하기 →'
      }
    }
  }
};

