'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  TrendingUp,
  Landmark,
  Compass,
  X,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Square,
  Globe,
  Calendar,
  Check,
  Copy
} from 'lucide-react';
import { INPARTNER_CONFIG, getWhatsAppUrl, PROACTIVE_TRIGGER_CONFIG } from '@/lib/config';
import {
  NudgeTriggerType,
  canShowProactiveNudge,
  markNudgeDismissed,
  markNudgeShown,
  recordVisitorSession,
  getNudgeMessage
} from '@/lib/proactiveNudge';
import { captureMarketingAttribution } from '@/lib/attribution';
import type { AttributionData } from '@/lib/db';
import ChatbotIcon from '@/components/ChatbotIcon';
import { validatePhoneNumber, validateEmail } from '@/lib/validation';
import {
  COMPANY_SCALE_OPTIONS,
  INDUSTRY_OPTIONS,
  TIMELINE_OPTIONS
} from '@/lib/qualification';
import {
  DiagnosticPillarKey,
  DiagnosticPillarTree,
  DiagnosticOption,
  getDiagnosticTree,
  getAllDiagnosticPillars,
  detectDiagnosticPillar,
  generateScopingSummary
} from '@/lib/diagnostic';

export interface ActiveDiagnosticSession {
  pillarKey: DiagnosticPillarKey;
  currentStep: 1 | 2 | 'completed';
  step1ChoiceId?: string;
  step1ChoiceLabel?: string;
  step2ChoiceId?: string;
  step2ChoiceLabel?: string;
  scopingSummary?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  recommendedService?: string;
  sources?: string[];
  suggestLeadCapture?: boolean;
  followUpQuestions?: string[];
  quickActions?: string[];
  isFallback?: boolean;
  isStreaming?: boolean;
  diagnosticPillar?: DiagnosticPillarKey;
}

interface ChatWidgetProps {
  initialOpen?: boolean;
  embeddedMode?: boolean;
  onClose?: () => void;
}

export default function ChatWidget({
  initialOpen = false,
  embeddedMode = false,
  onClose
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleCloseWidget = () => {
    setIsOpen(false);
    setShowMenu(false);
    if (onClose) {
      onClose();
    }
    if (typeof window !== 'undefined') {
      window.parent?.postMessage({ type: 'inpartner_close_chat' }, '*');
    }
  };
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [nudgeType, setNudgeType] = useState<NudgeTriggerType>('dwell_time');
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [attribution, setAttribution] = useState<AttributionData | null>(null);
  const [lang, setLang] = useState<'id' | 'en' | 'ko'>('id');

  // Trilingual UI Translations (ID / EN / KO)
  const t = lang === 'id' ? {
    onlineStatus: 'Online • Siap Membantu',
    newChat: 'Percakapan baru',
    scheduleConsultation: 'Jadwalkan Konsultasi',
    chatWa: 'Chat WhatsApp Resmi',
    callOffice: 'Hubungi Kantor Pusat',
    privacyPolicy: 'Kebijakan Privasi',
    title: 'Solusi Bisnis Apa yang Anda Butuhkan?',
    subtitle: 'Inpartner AI siap menganalisis tantangan korporasi dan merekomendasikan solusi konsultasi bisnis yang tepat.',
    featured: {
      title: 'Strategi Korporat & Konsultasi Investasi',
      desc: 'Corporate strategy, M&A Advisory, IPO, Feasibility Study & Investment Advisory',
      query: 'Bagaimana Inpartner dapat mendampingi strategi korporat, investasi, atau advisory pasar untuk perusahaan saya?',
      intent: 'strategy_corporate'
    },
    dividerText: 'JELAJAHI LAYANAN KONSULTASI LAINNYA',
    secondary1: {
      title: 'Akses Pasar & Ekspansi Bisnis',
      query: 'Saya membutuhkan bantuan untuk riset pasar, strategi masuk pasar baru, atau business matching.',
      intent: 'market_access'
    },
    secondary2: {
      title: 'Diagnostik Kebutuhan Bisnis',
      query: 'Saya belum yakin layanan apa yang paling dibutuhkan perusahaan saya. Mohon pandu melalui diagnostik kebutuhan bisnis.',
      intent: 'other'
    },
    inputPlaceholder: 'Tanyakan seputar solusi bisnis atau kendala perusahaan Anda...',
    sending: 'Sedang mengetik...',
    stopGenerating: 'Hentikan respon',
    disclaimer: 'AI dapat melakukan kesalahan. Silakan konfirmasi informasi dengan tim konsultan.',
    consultationSchedule: 'Jadwalkan Konsultasi Bisnis',
    consultationDesc: 'Sampaikan profil bisnis Anda agar konsultan senior Inpartner dapat mengagendakan sesi diagnostik awal.',
    fullName: 'Nama Lengkap',
    companyName: 'Nama Perusahaan',
    jobTitle: 'Jabatan / Peran Pengambil Keputusan',
    jobTitlePlaceholder: 'contoh: Direktur Utama / CFO / VP Strategy',
    companyScale: 'Klasifikasi Skala Entitas',
    selectCompanyScale: '-- Pilih Skala Entitas (Opsional) --',
    industrySector: 'Sektor Industri',
    selectIndustry: '-- Pilih Sektor Industri (Opsional) --',
    targetTimeline: 'Target Linimasa Penugasan',
    selectTimeline: '-- Pilih Linimasa (Opsional) --',
    enterpriseSectionTitle: 'Kualifikasi Korporat (Opsional)',
    phone: 'WhatsApp / Telepon',
    phoneFormatHint: 'Format: 08xx atau internasional dengan + (10-14 digit)',
    email: 'Email Kantor / Bisnis',
    emailHint: 'Opsional untuk pengiriman proposal resmi & materi eksekutif',
    advisoryNeed: 'Kebutuhan Konsultasi Utama',
    selectPillar: '-- Pilih Layanan Konsultasi Utama --',
    notes: 'Ringkasan Tantangan / Kebutuhan Bisnis',
    notesPlaceholder: 'Ceritakan kendala, skala omset, atau target ekspansi perusahaan Anda...',
    consent: 'Saya menyetujui data di atas digunakan untuk dihubungi oleh tim konsultan Inpartner sesuai Kebijakan Privasi dan regulasi perlindungan data.',
    cancel: 'Batal',
    submit: 'Kirim Permintaan Konsultasi',
    submitting: 'Mengirimkan Permintaan...',
    successTitle: 'Permintaan Konsultasi Diterima!',
    successDesc: 'Data Anda telah tersimpan dengan aman. Tim Business Development Inpartner akan menghubungi Anda dalam waktu 1x24 jam kerja.',
    chatNowWa: 'Chat Langsung di WhatsApp',
    sources: 'Sumber Resmi:',
    service: 'Layanan:',
    generating: 'Menyusun analisis...',
    interestedCta: 'Tertarik dengan Konsultasi Strategis Lebih Lanjut?',
    interestedDesc: 'Tinggalkan kontak bisnis Anda, dan konsultan senior Inpartner akan menghubungi Anda untuk analisis diagnostik mendalam.',
    diagnosticBadge: 'Diagnostik Penjajakan Kebutuhan Bisnis',
    diagnosticStep1: 'Langkah 1/2',
    diagnosticStep2: 'Langkah 2/2',
    diagnosticCompletedBadge: 'Scoping Diagnostik Selesai',
    diagnosticBookWithScoping: 'Jadwalkan Konsultasi dengan Hasil Diagnostik Ini',
    diagnosticWaWithScoping: 'Konsultasi via WhatsApp',
    diagnosticChangeStep1: 'Ubah Pilihan Langkah 1',
    diagnosticRestart: 'Ulangi Diagnostik',
    diagnosticGeneralPrompt: 'Pilih Pilar Layanan untuk Memulai Diagnostik Terpandu:'
  } : lang === 'ko' ? {
    onlineStatus: '온라인 • 실시간 상담 가능',
    newChat: '새 대화 시작',
    scheduleConsultation: '경영 상담 예약하기',
    chatWa: '공식 WhatsApp 문의',
    callOffice: '본사 전화 문의',
    privacyPolicy: '개인정보 처리방침',
    title: '어떤 비즈니스 솔루션이 필요하십니까?',
    subtitle: '인파트너(Inpartner) AI가 기업의 주요 과제를 분석하고 최적화된 전략 자문 솔루션을 제시합니다.',
    featured: {
      title: '기업전략 & 투자 자문',
      desc: '기업 전략, M&A, IPO, 타당성 연구 및 투자 자문 서비스',
      query: '인파트너는 기업전략, 투자 자문, 시장 접근 전략을 어떻게 지원합니까?',
      intent: 'strategy_corporate'
    },
    dividerText: '주요 자문 분야 둘러보기',
    secondary1: {
      title: '시장 접근 & 사업 확장',
      query: '시장 조사, 신규 시장 진입 전략, 또는 비즈니스 매칭 서비스에 대한 자문이 필요합니다.',
      intent: 'market_access'
    },
    secondary2: {
      title: '기업 경영 진단 및 솔루션 매칭',
      query: '현재 기업에 가장 필요한 솔루션이 무엇인지 진단을 받고 싶습니다.',
      intent: 'other'
    },
    inputPlaceholder: '기업 경영 과제 또는 문의 사항을 입력하세요...',
    sending: '답변 작성 중...',
    stopGenerating: '답변 생성 중지',
    disclaimer: 'AI 응답은 참고용입니다. 세부 사항은 인파트너 전문 컨설턴트와 확인하세요.',
    consultationSchedule: '비즈니스 자문 세션 예약',
    consultationDesc: '기업 개요와 주요 과제를 남겨주시면 인파트너 수석 파트너가 사전 진단 세션을 준비합니다.',
    fullName: '성함',
    companyName: '회사명',
    jobTitle: '직책 / 역할',
    jobTitlePlaceholder: '예: 대표이사 / CFO / 전략기획실장',
    companyScale: '기업 규모 분류',
    selectCompanyScale: '-- 기업 규모 선택 (선택 사항) --',
    industrySector: '산업 분야',
    selectIndustry: '-- 산업 분야 선택 (선택 사항) --',
    targetTimeline: '목표 자문 일정',
    selectTimeline: '-- 목표 일정 선택 (선택 사항) --',
    enterpriseSectionTitle: '기업 프로필 및 자문 요건 (선택 사항)',
    phone: 'WhatsApp / 연락처',
    phoneFormatHint: '예: 010-xxxx-xxxx 또는 국가번호 포함 (+82...)',
    email: '회사 이메일',
    emailHint: '공식 제안서 및 경영 자료 발송용 (선택 사항)',
    advisoryNeed: '주요 자문 분야',
    selectPillar: '-- 주요 자문 서비스 선택 --',
    notes: '기업 과제 요약 / 프로젝트 범위',
    notesPlaceholder: '기업의 주요 애로사항, 매출 규모 또는 사업 확장 목표를 공유해 주세요...',
    consent: '개인정보 처리방침에 따라 인파트너 컨설팅 팀의 상담 진행을 위한 정보 제공에 동의합니다.',
    cancel: '취소',
    submit: '상담 요청서 제출',
    submitting: '요청서 제출 중...',
    successTitle: '상담 요청이 접수되었습니다!',
    successDesc: '제출하신 정보가 안전하게 전달되었습니다. 인파트너 사업개발팀이 영업일 기준 1일 이내에 연락드리겠습니다.',
    chatNowWa: 'WhatsApp으로 실시간 문의',
    sources: '참조 공식 문서:',
    service: '추천 서비스:',
    generating: '분석 내용 생성 중...',
    interestedCta: '심층 비즈니스 자문이 필요하십니까?',
    interestedDesc: '연락처를 남겨주시면 인파트너 수석 컨설턴트가 1:1 맞춤형 진단 상담을 제공해 드립니다.',
    diagnosticBadge: '맞춤형 기업 사전 진단 (Consultative Discovery)',
    diagnosticStep1: '1단계 / 2단계',
    diagnosticStep2: '2단계 / 2단계',
    diagnosticCompletedBadge: '사전 진단 요약 완료',
    diagnosticBookWithScoping: '진단 결과로 경영 상담 예약하기',
    diagnosticWaWithScoping: '수석 파트너 WhatsApp 실시간 문의',
    diagnosticChangeStep1: '1단계 선택 변경',
    diagnosticRestart: '진단 다시 시작하기',
    diagnosticGeneralPrompt: '사전 진단을 시작할 주요 자문 분야를 선택해 주세요:'
  } : {
    onlineStatus: 'Online • Ready to assist',
    newChat: 'New conversation',
    scheduleConsultation: 'Schedule Consultation',
    chatWa: 'Official WhatsApp Chat',
    callOffice: 'Call Corporate Office',
    privacyPolicy: 'Privacy Policy',
    title: 'What Business Solutions Do You Need?',
    subtitle: 'Inpartner AI is ready to analyze your corporate challenges and recommend tailored strategic advisory solutions.',
    featured: {
      title: 'Corporate Strategy & Investment Advisory',
      desc: 'Corporate strategy, M&A Advisory, IPO, Feasibility Studies & Investment Advisory',
      query: 'How does Inpartner assist with corporate strategy, investment advisory, and market access for my company?',
      intent: 'strategy_corporate'
    },
    dividerText: 'EXPLORE OTHER ADVISORY SERVICES',
    secondary1: {
      title: 'Market Access & Business Expansion',
      query: 'I need assistance with market research, market entry strategy, or business matching.',
      intent: 'market_access'
    },
    secondary2: {
      title: 'Business Needs Diagnosis',
      query: 'I am not sure which service my company needs most. Please guide me through a business needs diagnosis.',
      intent: 'other'
    },
    inputPlaceholder: 'Ask about business solutions or your company\'s challenges...',
    sending: 'Thinking...',
    stopGenerating: 'Stop generating',
    disclaimer: 'AI can make mistakes. Double-check replies with our advisory team.',
    consultationSchedule: 'Schedule Advisory Consultation',
    consultationDesc: 'Share your corporate details so Inpartner senior partners can prepare an initial diagnostic session.',
    fullName: 'Full Name',
    companyName: 'Company Name',
    jobTitle: 'Job Title / Decision-Maker Role',
    jobTitlePlaceholder: 'e.g. CEO / Managing Director / VP Strategy',
    companyScale: 'Enterprise Classification',
    selectCompanyScale: '-- Select Enterprise Scale (Optional) --',
    industrySector: 'Industry Sector',
    selectIndustry: '-- Select Industry Sector (Optional) --',
    targetTimeline: 'Target Engagement Timeframe',
    selectTimeline: '-- Select Timeframe (Optional) --',
    enterpriseSectionTitle: 'Enterprise Profile & Qualification (Optional)',
    phone: 'WhatsApp / Phone',
    phoneFormatHint: 'Format: 08xx or international format with + (10-14 digits)',
    email: 'Business Email',
    emailHint: 'Optional for proposals and executive teasers',
    advisoryNeed: 'Primary Advisory Need',
    selectPillar: '-- Select Primary Advisory Pillar --',
    notes: 'Project Scope / Additional Notes',
    notesPlaceholder: 'Share a brief overview of your business challenges or goals...',
    consent: 'I agree to be contacted by the Inpartner corporate advisory team for consultation follow-up in accordance with the Privacy Policy.',
    cancel: 'Cancel',
    submit: 'Submit Consultation Request',
    submitting: 'Submitting Inquiry...',
    successTitle: 'Consultation Request Received!',
    successDesc: 'Your inquiry has been successfully recorded. The Inpartner advisory team will contact you within 1 business day.',
    chatNowWa: 'Chat Directly on WhatsApp',
    sources: 'Sources:',
    service: 'Service:',
    generating: 'Generating response...',
    interestedCta: 'Interested in Further Corporate Advisory?',
    interestedDesc: 'Leave your business contact details, and an Inpartner senior consultant will connect with you for an in-depth needs analysis.',
    diagnosticBadge: 'Consultative Discovery Diagnostic',
    diagnosticStep1: 'Step 1 of 2',
    diagnosticStep2: 'Step 2 of 2',
    diagnosticCompletedBadge: 'Preliminary Scoping Complete',
    diagnosticBookWithScoping: 'Schedule Consultation with this Scoping',
    diagnosticWaWithScoping: 'Fast-Track WhatsApp Discussion',
    diagnosticChangeStep1: 'Change Step 1 Choice',
    diagnosticRestart: 'Restart Diagnostic',
    diagnosticGeneralPrompt: 'Select an Advisory Pillar to Begin Consultative Scoping:'
  };

  // Inpartner Agent Configuration derived from active language
  const agentConfig = {
    name: 'Inpartner Agent',
    title: t.title,
    subtitle: t.subtitle,
    featured: t.featured,
    dividerText: t.dividerText,
    secondary1: t.secondary1,
    secondary2: t.secondary2,
    inputPlaceholder: t.inputPlaceholder
  };

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    jobTitle: '',
    companyScale: '',
    industry: '',
    timeline: '',
    email: '',
    phone: '',
    businessNeed: '',
    notes: '',
    consent: true
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [submittedSuccessInfo, setSubmittedSuccessInfo] = useState<{
    refCode: string;
    whatsappUrl: string;
    clientEmail?: string;
    name: string;
  } | null>(null);
  const [copiedRefCode, setCopiedRefCode] = useState(false);
  const [activeDiagnostic, setActiveDiagnostic] = useState<ActiveDiagnosticSession | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize session and restore persisted conversation
  useEffect(() => {
    setMounted(true);
    let sess = localStorage.getItem('inpartner_chat_session');
    if (!sess) {
      sess = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('inpartner_chat_session', sess);
    }
    setSessionId(sess);

    // Restore saved language preference
    try {
      const savedLang = localStorage.getItem('inpartner_chat_lang') as 'id' | 'en' | 'ko' | null;
      if (savedLang === 'id' || savedLang === 'en' || savedLang === 'ko') {
        setLang(savedLang);
      }
    } catch {}

    // Restore previously saved conversation state
    try {
      const savedMessagesStr = localStorage.getItem(`inpartner_chat_messages_${sess}`);
      if (savedMessagesStr) {
        const savedMessages = JSON.parse(savedMessagesStr);
        if (Array.isArray(savedMessages) && savedMessages.length > 0) {
          setMessages(savedMessages.map((m: ChatMessage) => ({ ...m, isStreaming: false })));
        }
      }

      const savedConvId = localStorage.getItem(`inpartner_conv_id_${sess}`);
      if (savedConvId) {
        setConversationId(savedConvId);
      }

      const savedNeed = localStorage.getItem(`inpartner_selected_need_${sess}`);
      if (savedNeed) {
        setSelectedNeed(savedNeed);
      }

      const savedLeadSubmitted = localStorage.getItem(`inpartner_lead_submitted_${sess}`);
      if (savedLeadSubmitted === 'true') {
        setLeadSubmitted(true);
      }

      const savedDiagStr = localStorage.getItem(`inpartner_diagnostic_${sess}`);
      if (savedDiagStr) {
        try {
          const parsedDiag = JSON.parse(savedDiagStr);
          if (parsedDiag && parsedDiag.pillarKey) {
            setActiveDiagnostic(parsedDiag);
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Could not restore chat state from localStorage:', err);
    }
  }, []);

  const handleToggleLanguage = (targetLang?: 'id' | 'en' | 'ko') => {
    let next: 'id' | 'en' | 'ko';
    if (targetLang) {
      next = targetLang;
    } else {
      // Cycle: id -> en -> ko -> id
      if (lang === 'id') next = 'en';
      else if (lang === 'en') next = 'ko';
      else next = 'id';
    }
    setLang(next);
    try {
      localStorage.setItem('inpartner_chat_lang', next);
    } catch {}
  };

  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    if (!sessionId) return;
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        session_id: sessionId,
        conversation_id: conversationId,
        metadata: { ...metadata, lang }
      })
    }).catch(() => {});
  };

  const handleOpenLeadModal = (defaultNeed?: string) => {
    if (defaultNeed && !leadForm.businessNeed) {
      setLeadForm((prev) => ({ ...prev, businessNeed: defaultNeed }));
    }
    setSubmittedSuccessInfo(null);
    setLeadError('');
    setShowLeadModal(true);
    setShowMenu(false);
    trackEvent('lead_form_opened', { defaultNeed });
  };

  const handleCloseLeadModal = () => {
    setShowLeadModal(false);
    setSubmittedSuccessInfo(null);
    setLeadError('');
  };

  const handleCopyRefCode = async (code: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopiedRefCode(true);
        setTimeout(() => setCopiedRefCode(false), 2000);
      }
    } catch (err) {
      console.warn('Failed to copy ref code:', err);
    }
  };

  // Auto-save messages to localStorage
  useEffect(() => {
    if (!mounted || !sessionId) return;
    try {
      if (messages.length > 0) {
        localStorage.setItem(`inpartner_chat_messages_${sessionId}`, JSON.stringify(messages.slice(-60)));
      } else {
        localStorage.removeItem(`inpartner_chat_messages_${sessionId}`);
      }
    } catch (err) {
      console.warn('Failed to save chat messages to localStorage:', err);
    }
  }, [messages, sessionId, mounted]);

  // Auto-save conversationId
  useEffect(() => {
    if (!mounted || !sessionId) return;
    try {
      if (conversationId) {
        localStorage.setItem(`inpartner_conv_id_${sessionId}`, conversationId);
      }
    } catch {}
  }, [conversationId, sessionId, mounted]);

  // Auto-save selectedNeed
  useEffect(() => {
    if (!mounted || !sessionId) return;
    try {
      if (selectedNeed) {
        localStorage.setItem(`inpartner_selected_need_${sessionId}`, selectedNeed);
      }
    } catch {}
  }, [selectedNeed, sessionId, mounted]);

  // Auto-save leadSubmitted
  useEffect(() => {
    if (!mounted || !sessionId) return;
    try {
      if (leadSubmitted) {
        localStorage.setItem(`inpartner_lead_submitted_${sessionId}`, 'true');
      }
    } catch {}
  }, [leadSubmitted, sessionId, mounted]);

  // Auto-save activeDiagnostic
  useEffect(() => {
    if (!mounted || !sessionId) return;
    try {
      if (activeDiagnostic) {
        localStorage.setItem(`inpartner_diagnostic_${sessionId}`, JSON.stringify(activeDiagnostic));
      } else {
        localStorage.removeItem(`inpartner_diagnostic_${sessionId}`);
      }
    } catch (err) {
      console.warn('Failed to save active diagnostic to localStorage:', err);
    }
  }, [activeDiagnostic, sessionId, mounted]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Initialize visitor session & return visitor recognition on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const { isReturning } = recordVisitorSession(window.localStorage);
        setIsReturningVisitor(isReturning);

        // Capture marketing attribution telemetry (UTM parameters, referrer, landing page)
        const attr = captureMarketingAttribution(
          window.location.href,
          document.referrer,
          window.sessionStorage
        );
        setAttribution(attr);
      } catch {}
    }
  }, []);

  // Proactive Advisory Engagement & Exit-Intent Triggers (Issue #8)
  useEffect(() => {
    if (embeddedMode || isOpen || hasUserInteracted) return;
    if (!PROACTIVE_TRIGGER_CONFIG.enabled) return;

    const canTrigger = canShowProactiveNudge({
      isOpen,
      hasInteracted: hasUserInteracted,
      sessionStorage: typeof window !== 'undefined' ? window.sessionStorage : null
    });
    if (!canTrigger) return;

    // 1. Dwell Time Trigger: Configured dwell time (default 25s; 10s for recognized return visitors)
    const dwellSeconds = isReturningVisitor
      ? PROACTIVE_TRIGGER_CONFIG.returnVisitorDwellSeconds
      : PROACTIVE_TRIGGER_CONFIG.dwellTimeSeconds;

    const dwellTimer = setTimeout(() => {
      const stillEligible = canShowProactiveNudge({
        isOpen,
        hasInteracted: hasUserInteracted,
        sessionStorage: typeof window !== 'undefined' ? window.sessionStorage : null
      });

      if (stillEligible && !isOpen) {
        setNudgeType(isReturningVisitor ? 'return_visitor' : 'dwell_time');
        setShowTeaser(true);
        markNudgeShown(typeof window !== 'undefined' ? window.sessionStorage : null);
      }
    }, dwellSeconds * 1000);

    // 2. Desktop Exit-Intent Trigger: Detect cursor movement towards tab closure/address bar
    const handleMouseLeave = (e: MouseEvent) => {
      if (!PROACTIVE_TRIGGER_CONFIG.exitIntentEnabled) return;
      // Exit intent condition: cursor moves towards top boundary of window (y <= 15) on desktop
      if (e.clientY <= 15 && typeof window !== 'undefined' && window.innerWidth >= 768) {
        const eligibleForExit = canShowProactiveNudge({
          isOpen,
          hasInteracted: hasUserInteracted,
          sessionStorage: window.sessionStorage
        });

        if (eligibleForExit && !isOpen) {
          setNudgeType('exit_intent');
          setShowTeaser(true);
          markNudgeShown(window.sessionStorage);
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(dwellTimer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isOpen, embeddedMode, isReturningVisitor, hasUserInteracted]);

  // Track chatbot open
  useEffect(() => {
    if (isOpen && sessionId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'chatbot_opened',
          session_id: sessionId,
          conversation_id: conversationId,
          metadata: { page: window.location.pathname }
        })
      }).catch(() => {});
    }
  }, [isOpen, sessionId, conversationId]);

  // Scroll to bottom on new message (Instant during streaming to prevent animation jitter, smooth on complete)
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
    }
  }, [messages, isLoading, isStreaming]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  const handleSendMessage = async (textToSend?: string, needCategory?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading || isStreaming) return;

    const currentNeed = needCategory || selectedNeed || undefined;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    if (textToSend && needCategory) {
      trackEvent('intent_selected', { intent: needCategory, query: textToSend });
    }
    trackEvent('chat_message_sent', { text_length: text.length, need: currentNeed });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const botMsgId = `bot_${Date.now()}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          sessionId,
          message: text,
          selectedNeed: currentNeed,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          stream: true
        }),
        signal: abortController.signal
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let botMessageCreated = false;
        let accumulatedText = '';
        let botMetadata: Partial<ChatMessage> = {};

        setIsStreaming(true);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === 'start') {
                if (event.conversationId) {
                  setConversationId(event.conversationId);
                }
                if (event.recommendedService && !leadForm.businessNeed) {
                  setLeadForm((prev) => ({ ...prev, businessNeed: event.recommendedService }));
                }
                botMetadata = {
                  recommendedService: event.recommendedService,
                  sources: event.sources,
                  isFallback: event.isFallback
                };
              } else if (event.type === 'chunk') {
                accumulatedText += event.text;

                if (!botMessageCreated) {
                  botMessageCreated = true;
                  setIsLoading(false); // Stop "thinking" dots, typewriter has begun!
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: botMsgId,
                      sender: 'bot',
                      text: accumulatedText,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isStreaming: true,
                      ...botMetadata
                    }
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botMsgId
                        ? { ...m, text: accumulatedText, isStreaming: true }
                        : m
                    )
                  );
                }
              } else if (event.type === 'done') {
                const finalAnswer = event.fullAnswer || accumulatedText;
                if (event.recommendedService) {
                  trackEvent('service_viewed', { service: event.recommendedService });
                }
                const detectedPillar = detectDiagnosticPillar(event.intent || event.recommendedService || finalAnswer);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId
                      ? {
                          ...m,
                          text: finalAnswer,
                          isStreaming: false,
                          recommendedService: event.recommendedService,
                          sources: event.sources,
                          suggestLeadCapture: event.suggestLeadCapture,
                          followUpQuestions: event.followUpQuestions,
                          quickActions: event.quickActions,
                          isFallback: event.isFallback,
                          diagnosticPillar: detectedPillar || undefined
                        }
                      : m
                  )
                );
              }
            } catch (err) {
              console.warn('Failed to parse SSE chunk:', err);
            }
          }
        }

        // Final safety check after stream ends: ensure isStreaming is marked false
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, isStreaming: false } : m))
        );
      } else {
        // Fallback for non-streaming JSON responses
        const data = await res.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        if (data.recommendedService) {
          trackEvent('service_viewed', { service: data.recommendedService });
          if (!leadForm.businessNeed) {
            setLeadForm((prev) => ({ ...prev, businessNeed: data.recommendedService }));
          }
        }

        const detectedPillar = detectDiagnosticPillar(data.intent || data.recommendedService || data.answer);
        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'bot',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedService: data.recommendedService,
          sources: data.sources,
          suggestLeadCapture: data.suggestLeadCapture,
          followUpQuestions: data.followUpQuestions,
          quickActions: data.quickActions,
          isFallback: data.isFallback,
          isStreaming: false,
          diagnosticPillar: detectedPillar || undefined
        };

        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('AI generation stopped by user');
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: lang === 'id'
            ? 'Mohon maaf, terjadi gangguan koneksi ke server. Silakan coba kembali atau hubungi konsultan kami via WhatsApp di [+62 859 3454 8202](https://wa.me/6285934548202).'
            : lang === 'ko'
            ? '죄송합니다. 서버 연결에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 공식 WhatsApp [+62 859 3454 8202](https://wa.me/6285934548202)로 직접 문의해 주십시오.'
            : 'We apologize, but a connection error occurred while reaching the server. Please try again or reach our team directly via WhatsApp at [+62 859 3454 8202](https://wa.me/6285934548202).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: true,
          isStreaming: false
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetConversation = () => {
    if (sessionId) {
      try {
        localStorage.removeItem(`inpartner_chat_messages_${sessionId}`);
        localStorage.removeItem(`inpartner_conv_id_${sessionId}`);
        localStorage.removeItem(`inpartner_selected_need_${sessionId}`);
        localStorage.removeItem(`inpartner_lead_submitted_${sessionId}`);
        localStorage.removeItem(`inpartner_diagnostic_${sessionId}`);
      } catch (err) {
        console.warn('Could not clear session storage:', err);
      }
    }

    const newSess = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('inpartner_chat_session', newSess);
    setSessionId(newSess);
    setConversationId(null);
    setSelectedNeed(null);
    setLeadSubmitted(false);
    setActiveDiagnostic(null);
    setShowLeadModal(false);
    setMessages([]);
    setShowMenu(false);
  };

  const handleSelectDiagnosticOption = (
    pillarKey: DiagnosticPillarKey,
    stepNum: 1 | 2,
    option: DiagnosticOption
  ) => {
    const tree = getDiagnosticTree(pillarKey);
    if (!tree) return;

    const optLabel = lang === 'ko' ? option.label_ko : lang === 'en' ? option.label_en : option.label_id;

    if (stepNum === 1) {
      setActiveDiagnostic({
        pillarKey,
        currentStep: 2,
        step1ChoiceId: option.id,
        step1ChoiceLabel: optLabel
      });
      trackEvent('diagnostic_step_completed', {
        pillar: pillarKey,
        step: 1,
        choice_id: option.id,
        choice_label: optLabel
      });
    } else if (stepNum === 2) {
      const s1Id = (activeDiagnostic?.pillarKey === pillarKey && activeDiagnostic.step1ChoiceId) ? activeDiagnostic.step1ChoiceId : tree.step1.options[0].id;
      const s1Label = (activeDiagnostic?.pillarKey === pillarKey && activeDiagnostic.step1ChoiceLabel) ? activeDiagnostic.step1ChoiceLabel : (lang === 'ko' ? tree.step1.options[0].label_ko : lang === 'en' ? tree.step1.options[0].label_en : tree.step1.options[0].label_id);
      
      const synthesis = generateScopingSummary(pillarKey, s1Id, option.id, lang);

      const completedState: ActiveDiagnosticSession = {
        pillarKey,
        currentStep: 'completed',
        step1ChoiceId: s1Id,
        step1ChoiceLabel: s1Label,
        step2ChoiceId: option.id,
        step2ChoiceLabel: optLabel,
        scopingSummary: synthesis.scopingSummary
      };

      setActiveDiagnostic(completedState);

      // Pre-populate lead form
      setLeadForm((prev) => ({
        ...prev,
        businessNeed: synthesis.pillarName,
        notes: prev.notes && !prev.notes.startsWith('[') ? `${synthesis.scopingSummary}\n\n${prev.notes}` : synthesis.scopingSummary
      }));

      trackEvent('diagnostic_completed', {
        pillar: pillarKey,
        scoping_summary: synthesis.scopingSummary
      });
    }
  };

  const handleResetDiagnostic = (pillarKey: DiagnosticPillarKey) => {
    setActiveDiagnostic({
      pillarKey,
      currentStep: 1
    });
    trackEvent('diagnostic_reset', { pillar: pillarKey });
  };

  const phoneValidation = validatePhoneNumber(leadForm.phone);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');

    if (!leadForm.name || leadForm.name.trim().length < 2) {
      setLeadError(lang === 'id' ? 'Nama lengkap wajib diisi (minimal 2 karakter).' : lang === 'ko' ? '성함을 입력해 주세요 (최소 2자 이상).' : 'Full name is required (minimum 2 characters).');
      return;
    }

    if (!leadForm.businessNeed) {
      setLeadError(lang === 'id' ? 'Kebutuhan konsultasi utama wajib dipilih.' : lang === 'ko' ? '주요 자문 분야를 선택해 주세요.' : 'Primary advisory need must be selected.');
      return;
    }

    if (!leadForm.email && !leadForm.phone) {
      setLeadError(lang === 'id' ? 'Harap cantumkan nomor WhatsApp atau email kantor untuk tindak lanjut konsultasi.' : lang === 'ko' ? '상담 후속 조치를 위해 WhatsApp 번호 또는 회사 이메일을 입력해 주세요.' : 'Please provide a WhatsApp phone number or business email for consultation follow-up.');
      return;
    }

    if (leadForm.phone) {
      const pValidation = validatePhoneNumber(leadForm.phone);
      if (!pValidation.isValid) {
        setLeadError(lang === 'id' ? 'Format nomor WhatsApp / telepon tidak valid (contoh: 08123456789 atau +62...).' : lang === 'ko' ? '전화번호 형식이 올바르지 않습니다 (예: 01012345678 또는 +82...).' : (pValidation.error || 'Invalid phone or WhatsApp number format.'));
        return;
      }
    }

    if (leadForm.email && !validateEmail(leadForm.email)) {
      setLeadError(lang === 'id' ? 'Format email tidak valid (contoh: nama@perusahaan.com).' : lang === 'ko' ? '이메일 형식이 올바르지 않습니다 (예: name@company.com).' : 'Invalid email address format (e.g. name@company.com).');
      return;
    }

    if (!leadForm.consent) {
      setLeadError(lang === 'id' ? 'Harap centang persetujuan komunikasi agar tim kami dapat menghubungi Anda.' : lang === 'ko' ? '상담 진행을 위한 개인정보 처리 및 연락 동의에 체크해 주세요.' : 'Please agree to communication consent so our team can reach out to you.');
      return;
    }

    setLeadSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId || undefined,
          name: leadForm.name,
          company: leadForm.company,
          job_title: leadForm.jobTitle || undefined,
          company_scale: leadForm.companyScale || undefined,
          industry: leadForm.industry || undefined,
          timeline: leadForm.timeline || undefined,
          email: leadForm.email,
          phone: leadForm.phone,
          business_need: leadForm.businessNeed,
          notes: leadForm.notes,
          diagnostic_summary: activeDiagnostic?.scopingSummary,
          diagnostic_data: activeDiagnostic?.currentStep === 'completed' && activeDiagnostic.scopingSummary ? {
            pillar: activeDiagnostic.pillarKey,
            pillar_name: getDiagnosticTree(activeDiagnostic.pillarKey)?.[`serviceName_${lang}`] || activeDiagnostic.pillarKey,
            step1_id: activeDiagnostic.step1ChoiceId || '',
            step1_question: getDiagnosticTree(activeDiagnostic.pillarKey)?.step1[`question_${lang}`] || '',
            step1_answer: activeDiagnostic.step1ChoiceLabel || '',
            step2_id: activeDiagnostic.step2ChoiceId || '',
            step2_question: getDiagnosticTree(activeDiagnostic.pillarKey)?.step2[`question_${lang}`] || '',
            step2_answer: activeDiagnostic.step2ChoiceLabel || '',
            scoping_summary: activeDiagnostic.scopingSummary,
            completed_at: new Date().toISOString()
          } : undefined,
          attribution: attribution || undefined,
          lang
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (lang === 'id' ? 'Gagal mengirimkan permintaan konsultasi' : lang === 'ko' ? '상담 요청 제출에 실패했습니다.' : 'Failed to submit consultation inquiry'));
      }

      const refCode = data.ref_code || `INP-${Date.now().toString(36).toUpperCase()}`;
      const waLink = data.whatsapp_url || `https://wa.me/6285934548202?text=${encodeURIComponent(`Halo tim Inpartner, saya telah mengajukan konsultasi di website (No. Ref: ${refCode}) mengenai ${leadForm.businessNeed}.`)}`;

      setSubmittedSuccessInfo({
        refCode,
        whatsappUrl: waLink,
        clientEmail: leadForm.email,
        name: leadForm.name
      });
      setLeadSubmitted(true);
      trackEvent('lead_captured', {
        need: leadForm.businessNeed,
        has_email: !!leadForm.email,
        has_phone: !!leadForm.phone,
        company_scale: leadForm.companyScale || 'unspecified',
        industry: leadForm.industry || 'unspecified',
        timeline: leadForm.timeline || 'unspecified',
        has_diagnostic: Boolean(activeDiagnostic?.scopingSummary),
        ref_code: refCode
      });

      const emailNote = leadForm.email
        ? lang === 'id'
          ? `\n\n📩 **Email Tanda Terima:** Rangkuman konsultasi dan kode referensi telah dikirimkan ke **${leadForm.email}**.`
          : lang === 'ko'
          ? `\n\n📩 **접수 확인서 발송:** 상담 요약본 및 접수 번호가 **${leadForm.email}**(으)로 발송되었습니다.`
          : `\n\n📩 **Official Receipt:** A consultation summary and reference code have been dispatched to **${leadForm.email}**.`
        : '';

      const confirmMsg: ChatMessage = {
        id: `sys_lead_${Date.now()}`,
        sender: 'bot',
        text: lang === 'id'
          ? `✅ **Pengajuan Konsultasi Berhasil Dicatat!**\n\nNomor Referensi: **\`${refCode}\`**\n\nTerima kasih, **${leadForm.name}**. Tim penasihat senior INPARTNER akan menganalisis profil bisnis **${leadForm.company || 'perusahaan Anda'}** dan menghubungi Anda dalam 1x24 jam kerja.${emailNote}\n\nUntuk respon cepat, Anda dapat melanjutkan diskusi langsung ke WhatsApp tim kami:\n👉 **[Lanjutkan ke WhatsApp dengan No. Ref (${refCode})](${waLink})**`
          : lang === 'ko'
          ? `✅ **상담 신청이 성공적으로 접수되었습니다!**\n\n접수 번호: **\`${refCode}\`**\n\n감사합니다, **${leadForm.name}**님. 인파트너 수석 자문팀이 귀사(**${leadForm.company || '귀사'}**)의 자문 요청을 검토한 후 영업일 기준 1일 이내에 연락드리겠습니다.${emailNote}\n\n빠른 상담을 원하시면 공식 WhatsApp으로 즉시 문의해 주십시오:\n👉 **[WhatsApp으로 즉시 상담 연결 (접수번호: ${refCode})](${waLink})**`
          : `✅ **Consultation Inquiry Successfully Logged!**\n\nOfficial Reference: **\`${refCode}\`**\n\nThank you, **${leadForm.name}**. Our senior practice leaders will review your requirements for **${leadForm.company || 'your enterprise'}** and follow up promptly.${emailNote}\n\nFor expedited coordination, connect with our Advisory Team via WhatsApp:\n👉 **[Connect via WhatsApp with Ref Code (${refCode})](${waLink})**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: any) {
      setLeadError(err.message || (lang === 'id' ? 'Terjadi kesalahan sistem saat mengirimkan data.' : lang === 'ko' ? '데이터 제출 중 시스템 오류가 발생했습니다.' : 'A system error occurred while submitting.'));
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (!mounted) {
    if (embeddedMode) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <div className="w-6 h-6 border-2 border-[#005DAD] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* Floating Launcher Button & Proactive Teaser Bubble (Standalone Mode) */}
      {!embeddedMode && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
          {/* Proactive Bubble Teaser */}
          {showTeaser && !isOpen && (
            <div
              onClick={() => {
                setShowTeaser(false);
                setHasUserInteracted(true);
                markNudgeDismissed(typeof window !== 'undefined' ? window.sessionStorage : null);
                setIsOpen(true);
              }}
              className="pointer-events-auto max-w-[320px] w-full bg-white rounded-2xl p-4 shadow-2xl border border-[#005DAD]/20 animate-in fade-in slide-in-from-bottom-3 duration-300 cursor-pointer hover:shadow-3xl hover:border-[#005DAD]/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-[11px] text-[#0779D1]">
                    {getNudgeMessage(nudgeType, lang).badge}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTeaser(false);
                    markNudgeDismissed(typeof window !== 'undefined' ? window.sessionStorage : null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close teaser"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-[#0779D1] transition-colors">
                {getNudgeMessage(nudgeType, lang).title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                {getNudgeMessage(nudgeType, lang).body}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#0779D1] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {getNudgeMessage(nudgeType, lang).cta}
                </span>
                <span className="text-[10px] text-slate-400">
                  {lang === 'id' ? 'Online 24/7 • Rahasia' : lang === 'ko' ? '24시간 상시 운영 • 비밀보장' : '24/7 • Confidential'}
                </span>
              </div>
            </div>
          )}

          {/* Launcher Row */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {!isOpen && !showTeaser && (
              <button
                onClick={() => {
                  setShowTeaser(false);
                  setHasUserInteracted(true);
                  markNudgeDismissed(typeof window !== 'undefined' ? window.sessionStorage : null);
                  setIsOpen(true);
                }}
                className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg border border-slate-200/80 hover:shadow-xl transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Consult <strong className="text-[#0779D1] font-bold">{agentConfig.name}</strong></span>
              </button>
            )}
            <button
              onClick={() => {
                setShowTeaser(false);
                setHasUserInteracted(true);
                markNudgeDismissed(typeof window !== 'undefined' ? window.sessionStorage : null);
                setIsOpen(!isOpen);
              }}
              aria-label={isOpen ? 'Close Chatbot' : `Open ${agentConfig.name}`}
              className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#005DAD] hover:bg-[#004785] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-200 cursor-pointer"
            >
              {isOpen ? (
                <ChevronDown className="w-6 h-6 transition-transform group-hover:translate-y-0.5 duration-200" />
              ) : (
                <div className="flex items-center justify-center">
                  <ChatbotIcon size="md" className="transition-transform group-hover:scale-110 duration-200" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Window */}
      {(isOpen || embeddedMode) && (
        <div
          className={`${
            embeddedMode
              ? 'w-full h-full'
              : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[410px] h-[720px] max-h-[88vh] max-sm:h-[calc(100dvh-104px)] max-sm:max-h-[calc(100dvh-104px)] rounded-3xl shadow-2xl border border-slate-200/80'
          } flex flex-col bg-white overflow-hidden transition-all duration-300 font-sans`}
        >
          {/* Minimalist Top Header */}
          <div className="sticky top-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-20">
            {/* Left: Brand Icon + Agent Title */}
            <div className="flex items-center gap-3">
              {/* Custom Robot Chatbot Icon badge */}
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center shadow-xs shrink-0 ring-1 ring-black/5">
                <ChatbotIcon size="sm" />
              </div>
              <div>
                <h2 className="font-extrabold text-[15px] sm:text-base text-[#0779D1] tracking-[-0.02em] leading-snug">
                  {agentConfig.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold tracking-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.onlineStatus}
                </div>
              </div>
            </div>

            {/* Right: Header Action Buttons (Lang Toggle + Menu + Close) */}
            <div className="flex items-center gap-1">
              {/* Language Switcher Badge Button */}
              <button
                type="button"
                onClick={() => handleToggleLanguage()}
                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:border-[#005DAD] hover:bg-[#005DAD]/5 text-slate-700 transition-colors cursor-pointer mr-0.5 flex items-center gap-0.5"
                aria-label="Switch Language"
                title={lang === 'id' ? 'Switch to English' : lang === 'en' ? 'Switch to 한국어' : 'Ganti ke Bahasa Indonesia'}
              >
                <span className={lang === 'id' ? 'text-[#005DAD] font-extrabold' : 'text-slate-400 font-medium'}>ID</span>
                <span className="text-slate-300">/</span>
                <span className={lang === 'en' ? 'text-[#005DAD] font-extrabold' : 'text-slate-400 font-medium'}>EN</span>
                <span className="text-slate-300">/</span>
                <span className={lang === 'ko' ? 'text-[#005DAD] font-extrabold' : 'text-slate-400 font-medium'}>KO</span>
              </button>

              {/* Dropdown Options Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Options"
                  title="Options Menu"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Header Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    {/* Toggle Language inside menu */}
                    <button
                      onClick={() => {
                        handleToggleLanguage();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-between font-medium cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {lang === 'id' ? 'Bahasa: Indonesia' : lang === 'ko' ? '언어: 한국어' : 'Language: English'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#005DAD] uppercase bg-[#005DAD]/10 px-1.5 py-0.5 rounded">
                        {lang.toUpperCase()}
                      </span>
                    </button>

                    <button
                      onClick={handleResetConversation}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.newChat}</span>
                    </button>

                    <button
                      onClick={() => handleOpenLeadModal()}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-[#005DAD]/10 hover:text-[#005DAD] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#005DAD]" />
                      <span>{t.scheduleConsultation}</span>
                    </button>

                    <a
                      href={getWhatsAppUrl(
                        lang === 'id'
                          ? 'Halo tim Inpartner, saya ingin berkonsultasi mengenai layanan penasihat bisnis.'
                          : lang === 'ko'
                          ? '안녕하세요 인파트너 팀, 기업 비즈니스 자문 서비스 관련 상담을 요청합니다.'
                          : 'Hello Inpartner team, I would like to inquire about business advisory services.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('contact_clicked', { channel: 'whatsapp', location: 'menu' })}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.chatWa}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        handleOpenLeadModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#0779D1]" />
                      <span>{lang === 'id' ? 'Jadwalkan Konsultasi' : lang === 'ko' ? '상담 예약하기' : 'Schedule Consultation'}</span>
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleCloseWidget}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{lang === 'id' ? 'Tutup Chat' : lang === 'ko' ? '대화창 닫기' : 'Close Chat'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Close / Minimize Button (Works on both desktop & mobile / iframe) */}
              <button
                type="button"
                onClick={handleCloseWidget}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Close Chat"
                title="Close Chat"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Main Body Area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 overscroll-contain scroll-smooth">
            {messages.length === 0 ? (
              /* State 1: Clean Minimalist Welcome Screen (Matching Screenshot) */
              <div className="min-h-full max-w-sm mx-auto w-full py-2 flex flex-col items-center justify-center">
                {/* Agent Mascot / Brand Badge */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200/90 flex items-center justify-center shadow-md mb-3.5 ring-4 ring-[#0779D1]/10 group">
                  <ChatbotIcon size="lg" className="transition-transform group-hover:scale-105 duration-200" />
                </div>

                {/* Heading */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center tracking-[-0.03em] leading-snug">
                  {agentConfig.title}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-[13px] text-slate-600 text-center mt-2 leading-relaxed max-w-[320px] font-normal">
                  {agentConfig.subtitle}
                </p>

                {/* Featured / Hero Card */}
                <button
                  type="button"
                  onClick={() => handleSendMessage(agentConfig.featured.query, agentConfig.featured.intent)}
                  className="mt-6 w-full p-4 rounded-2xl bg-[#0779D1]/8 hover:bg-[#0779D1]/12 border border-[#0779D1]/20 transition-all flex items-center justify-between gap-3.5 cursor-pointer shadow-2xs hover:shadow-sm text-left group active:scale-[0.99]"
                >
                  {/* Executive Inpartner Blue Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0779D1] to-[#055ea3] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-[#0779D1]/20">
                    <TrendingUp className="w-5 h-5 text-white stroke-[2.3]" />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-[#0779D1] transition-colors leading-snug tracking-tight">
                      {agentConfig.featured.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug font-normal">
                      {agentConfig.featured.desc}
                    </div>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Divider */}
                <div className="my-5 relative flex items-center justify-center w-full">
                  <div className="w-full border-t border-slate-200/80"></div>
                  <span className="absolute bg-white px-3 text-[10.5px] uppercase font-bold text-slate-400 tracking-wider select-none">
                    {agentConfig.dividerText}
                  </span>
                </div>

                {/* 2-Column Grid Secondary Cards */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* Card 1: Funding & Profitability */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage(agentConfig.secondary1.query, agentConfig.secondary1.intent)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#0779D1]/40 hover:bg-[#0779D1]/5 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0779D1]/10 text-[#0779D1] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Landmark className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0779D1] transition-colors leading-snug tracking-tight">
                      {agentConfig.secondary1.title}
                    </span>
                  </button>

                  {/* Card 2: Business Diagnostic & Advisory Routing */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage(agentConfig.secondary2.query, agentConfig.secondary2.intent)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#0779D1]/40 hover:bg-[#0779D1]/5 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0779D1]/10 text-[#0779D1] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0779D1] transition-colors leading-snug tracking-tight">
                      {agentConfig.secondary2.title}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* State 2: Active Chat Thread */
              <div className="space-y-4 w-full max-w-2xl mx-auto py-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start items-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-1 ring-1 ring-black/5">
                        <ChatbotIcon size="xs" />
                      </div>
                    )}
                    <div
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      } max-w-[85%] sm:max-w-[80%]`}
                    >
                      <div
                        className={`w-full rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#0779D1] text-white rounded-br-xs shadow-xs font-medium'
                            : 'bg-slate-50/90 border border-slate-200/70 text-slate-800 rounded-bl-xs shadow-2xs font-normal'
                        }`}
                      >
                      {/* Message Content with Markdown rendering & Typewriter Caret */}
                      <div className="prose prose-sm max-w-none text-sm leading-relaxed space-y-0.5">
                        {formatBotMessage(msg.text)}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-[#0779D1] animate-pulse align-middle rounded-xs" />
                        )}
                      </div>

                      {/* Recommended Service Badge */}
                      {msg.recommendedService && !msg.isStreaming && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0779D1]/10 text-[#0779D1] border border-[#0779D1]/20 rounded-lg text-xs font-semibold tracking-tight">
                          <Sparkles className="w-3.5 h-3.5 text-[#0779D1]" />
                          <span>{t.service} {msg.recommendedService}</span>
                        </div>
                      )}

                      {/* Official Sources */}
                      {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t.sources}</span>
                          {msg.sources.map((s, idx) => (
                            <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[11px] text-slate-600 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp & Realtime indicator */}
                      <div
                        className={`mt-1.5 flex items-center justify-between gap-2 text-[10.5px] font-mono ${
                          msg.sender === 'user' ? 'text-sky-100/90 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.sender === 'bot' && msg.isStreaming ? (
                          <span className="inline-flex items-center gap-1 text-[#0779D1] font-medium not-italic animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0779D1]" />
                            {t.generating}
                          </span>
                        ) : (
                          <span></span>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {/* Interactive Consultative Discovery Module */}
                    {msg.diagnosticPillar && !msg.isStreaming && (() => {
                      const tree = getDiagnosticTree(msg.diagnosticPillar);
                      if (!tree) return null;

                      const currentDiagState = (activeDiagnostic && activeDiagnostic.pillarKey === msg.diagnosticPillar)
                        ? activeDiagnostic
                        : { pillarKey: msg.diagnosticPillar, currentStep: 1 as const };

                      const isCompleted = currentDiagState.currentStep === 'completed';
                      const isStep1 = currentDiagState.currentStep === 1;
                      const isStep2 = currentDiagState.currentStep === 2;

                      const currentStepTitle = isCompleted
                        ? t.diagnosticCompletedBadge
                        : isStep1
                        ? `${t.diagnosticStep1}: ${tree.step1[`title_${lang}`]}`
                        : `${t.diagnosticStep2}: ${tree.step2[`title_${lang}`]}`;

                      return (
                        <div className="mt-3 w-full sm:w-[94%] bg-gradient-to-br from-white via-sky-50/40 to-[#0779D1]/5 border border-[#0779D1]/25 rounded-2xl p-4 shadow-xs">
                          {/* Module Header */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0779D1] to-[#055ea3] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Compass className="w-4 h-4 text-white stroke-[2.2]" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-[#0779D1] uppercase tracking-wider block truncate">
                                  {t.diagnosticBadge}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 block truncate">
                                  {tree[`serviceName_${lang}`]}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-sky-50 text-[#0779D1] border-sky-200'
                            }`}>
                              {currentStepTitle}
                            </span>
                          </div>

                          {/* Step 1 State */}
                          {isStep1 && (
                            <div className="space-y-2.5">
                              <p className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug">
                                {tree.step1[`question_${lang}`]}
                              </p>
                              <div className="space-y-1.5 pt-1">
                                {tree.step1.options.map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectDiagnosticOption(tree.pillarKey, 1, opt)}
                                    className="w-full text-left p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0779D1] hover:bg-[#0779D1]/5 transition-all shadow-2xs group flex items-start gap-2.5 cursor-pointer active:scale-[0.99]"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#0779D1]/10 text-slate-500 group-hover:text-[#0779D1] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#0779D1] block leading-snug">
                                        {opt[`label_${lang}`]}
                                      </span>
                                      {opt[`detail_${lang}`] && (
                                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight font-normal">
                                          {opt[`detail_${lang}`]}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step 2 State */}
                          {isStep2 && (
                            <div className="space-y-2.5">
                              {/* Confirmed Step 1 Choice Chip */}
                              <div className="flex items-center justify-between bg-sky-50/80 border border-sky-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                                <span className="truncate pr-2 font-medium">
                                  <span className="text-slate-400 font-semibold mr-1">{t.diagnosticStep1}:</span>
                                  <strong>{currentDiagState.step1ChoiceLabel}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleResetDiagnostic(tree.pillarKey)}
                                  className="text-[#0779D1] hover:underline font-semibold text-[11px] shrink-0 cursor-pointer"
                                >
                                  {t.diagnosticChangeStep1}
                                </button>
                              </div>

                              <p className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug">
                                {tree.step2[`question_${lang}`]}
                              </p>
                              <div className="space-y-1.5 pt-1">
                                {tree.step2.options.map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectDiagnosticOption(tree.pillarKey, 2, opt)}
                                    className="w-full text-left p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0779D1] hover:bg-[#0779D1]/5 transition-all shadow-2xs group flex items-start gap-2.5 cursor-pointer active:scale-[0.99]"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#0779D1]/10 text-slate-500 group-hover:text-[#0779D1] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[#0779D1] block leading-snug">
                                        {opt[`label_${lang}`]}
                                      </span>
                                      {opt[`detail_${lang}`] && (
                                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight font-normal">
                                          {opt[`detail_${lang}`]}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Completed Scoping State */}
                          {isCompleted && (
                            <div className="space-y-3">
                              <div className="p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                                  {lang === 'id' ? 'Hasil Scoping Diagnostik Awal' : lang === 'ko' ? '사전 진단 요약 결과' : 'Preliminary Scoping Synthesis'}
                                </span>
                                <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                                  {currentDiagState.scopingSummary}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenLeadModal(tree[`serviceName_${lang}`])}
                                  className="bg-[#0779D1] hover:bg-[#055ea3] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>{t.diagnosticBookWithScoping}</span>
                                </button>
                                <a
                                  href={getWhatsAppUrl(
                                    lang === 'ko'
                                      ? `안녕하세요 인파트너 자문팀, 사전 진단을 완료하고 상담을 요청합니다: ${currentDiagState.scopingSummary}`
                                      : lang === 'en'
                                      ? `Hello Inpartner Advisory Team, I have completed the preliminary scoping diagnostic: ${currentDiagState.scopingSummary}. Please advise on consultation booking.`
                                      : `Halo tim konsultan INPARTNER, saya telah melakukan scoping diagnostik awal: ${currentDiagState.scopingSummary}. Mohon info jadwal konsultasi lebih lanjut.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => trackEvent('contact_clicked', { channel: 'whatsapp', location: 'diagnostic_complete' })}
                                  className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all"
                                >
                                  <Phone className="w-3.5 h-3.5" /> {t.diagnosticWaWithScoping}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleResetDiagnostic(tree.pillarKey)}
                                  className="text-slate-500 hover:text-slate-700 text-xs font-medium px-2 py-1 transition-colors cursor-pointer"
                                >
                                  {t.diagnosticRestart}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Follow-up Questions Suggestions */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && !msg.isStreaming && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                        {msg.followUpQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-xs font-medium bg-white hover:bg-[#0779D1]/5 text-slate-700 hover:text-[#0779D1] px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-[#0779D1]/40 transition-all shadow-2xs flex items-center gap-1.5 group cursor-pointer"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#0779D1] shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lead Capture CTA Card */}
                    {msg.suggestLeadCapture && !leadSubmitted && !msg.isStreaming && (
                      <div className="mt-3 w-full sm:w-[92%] bg-gradient-to-br from-[#0779D1]/5 via-sky-50/50 to-[#0779D1]/10 border border-[#0779D1]/25 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0779D1] to-[#055ea3] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                              {t.interestedCta}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                              {t.interestedDesc}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleOpenLeadModal(msg.recommendedService)}
                                className="bg-[#0779D1] hover:bg-[#055ea3] text-white text-xs font-bold tracking-tight px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{t.scheduleConsultation}</span>
                              </button>
                              <a
                                href={getWhatsAppUrl(
                                  lang === 'id'
                                    ? 'Halo tim Inpartner, saya ingin berkonsultasi mengenai layanan penasihat bisnis.'
                                    : lang === 'ko'
                                    ? '안녕하세요 인파트너 팀, 기업 비즈니스 자문 서비스 관련 상담을 요청합니다.'
                                    : 'Hello Inpartner team, I would like to inquire about business advisory services.'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('contact_clicked', { channel: 'whatsapp', location: 'chat_cta' })}
                                className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all"
                              >
                                <Phone className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator (Only before first token/chunk arrives) */}
                {isLoading && !messages.some((m) => m.isStreaming) && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-1 ring-1 ring-black/5">
                      <ChatbotIcon size="xs" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#0779D1] animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-[#0779D1] animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#0779D1] animate-bounce [animation-delay:0.4s]"></div>
                        <span className="text-xs text-slate-500 font-medium ml-1.5">
                          {t.sending}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input Bar - Fixed at Bottom */}
          <div className="sticky bottom-0 z-20 shrink-0 border-t border-slate-100 p-3 sm:p-4 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                id="chat-input-message"
                name="chatMessage"
                type="text"
                autoComplete="off"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={agentConfig.inputPlaceholder}
                className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-slate-900 text-[16px] sm:text-sm font-medium pl-4 pr-12 py-3 rounded-2xl border border-slate-200 focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                disabled={isLoading || isStreaming}
              />
              {isLoading || isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  aria-label={t.stopGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer active:scale-95 shadow-xs border border-rose-200"
                  title={t.stopGenerating}
                >
                  <Square className="w-3.5 h-3.5 fill-rose-600 stroke-rose-600" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  aria-label="Send message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-300 bg-[#0779D1] hover:bg-[#055ea3] text-white cursor-pointer active:scale-95 shadow-xs"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </form>

            {/* Disclaimer Matching Screenshot */}
            <div className="text-center text-[11px] text-slate-400 mt-2 font-medium tracking-normal select-none">
              {t.disclaimer}
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-hidden">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={handleCloseLeadModal}
          />

          {/* Dialog Card Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[94vh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-auto">
            {submittedSuccessInfo ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Receipt Header */}
                <div className="shrink-0 bg-gradient-to-r from-emerald-600 via-[#0779D1] to-[#055ea3] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-5 h-5 text-white stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-white tracking-tight leading-snug">
                        {t.successTitle}
                      </h3>
                      <p className="text-xs text-emerald-100/90 leading-tight font-normal mt-0.5">
                        {lang === 'id' ? 'Tanda Terima Resmi Inbound Konsultasi' : lang === 'ko' ? '공식 비즈니스 상담 접수 확인서' : 'Official Consultation Intake Receipt'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseLeadModal}
                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition-colors focus:outline-none shrink-0 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Receipt Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-800">
                  {/* Reference Code Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col items-center text-center shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {lang === 'id' ? 'Nomor Referensi Konsultasi' : lang === 'ko' ? '공식 접수 번호' : 'Consultation Reference Code'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-lg sm:text-xl font-mono font-bold text-[#0779D1] bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs select-all">
                        {submittedSuccessInfo.refCode}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyRefCode(submittedSuccessInfo.refCode)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        title={copiedRefCode ? 'Tersalin' : 'Salin Nomor Referensi'}
                      >
                        {copiedRefCode ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                            <span className="text-xs font-semibold text-emerald-600">{lang === 'id' ? 'Tersalin' : lang === 'ko' ? '복사됨' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-xs font-medium">{lang === 'id' ? 'Salin' : lang === 'ko' ? '복사' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-normal">
                      {lang === 'id'
                        ? 'Simpan nomor referensi ini untuk kemudahan penelusuran status konsultasi bersama tim penasihat INPARTNER.'
                        : lang === 'ko'
                        ? '인파트너 자문팀과의 후속 상담 조회 시 상기 접수 번호를 활용하실 수 있습니다.'
                        : 'Retain this reference code for seamless consultation status coordination with INPARTNER.'}
                    </p>
                  </div>

                  {/* Email Confirmation Notice (if client provided email) */}
                  {submittedSuccessInfo.clientEmail && (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900">
                      <Mail className="w-4 h-4 text-[#0779D1] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-blue-950">
                          {lang === 'id' ? 'Tanda Terima Telah Dikirim ke Email' : lang === 'ko' ? '이메일 확인서 발송 완료' : 'Receipt Confirmation Dispatched'}
                        </span>
                        <p className="text-blue-800/90 mt-0.5 font-normal">
                          {lang === 'id'
                            ? `Salinan tanda terima resmi beserta nomor referensi telah dikirim ke ${submittedSuccessInfo.clientEmail}. Harap periksa folder inbox atau spam Anda.`
                            : lang === 'ko'
                            ? `공식 접수 확인서가 ${submittedSuccessInfo.clientEmail} 로 발송되었습니다. 수신함을 확인해 주십시오.`
                            : `An official intake receipt has been dispatched to ${submittedSuccessInfo.clientEmail}. Please check your inbox or spam folder.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Response SLA Note */}
                  <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{lang === 'id' ? 'SLA Respons: Maksimal 1x24 Jam Kerja' : lang === 'ko' ? '응답 SLA: 영업일 기준 1일 이내' : 'Response SLA: Within 1 Business Day'}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-normal">
                      {lang === 'id'
                        ? 'Tim Business Development & Senior Advisor INPARTNER sedang menelaah profil kebutuhan bisnis Anda dan akan segera menghubungi Anda untuk koordinasi sesi diagnostik strategis.'
                        : lang === 'ko'
                        ? '인파트너 비즈니스 개발팀 및 수석 자문위원이 귀사의 자문 요구사항을 분석하여 남겨주신 연락처로 신속히 회신드리겠습니다.'
                        : 'Our Business Development & Senior Practice Leaders are reviewing your requirements and will reach out via your provided contact details.'}
                    </p>
                  </div>

                  {/* WhatsApp Fast-Track Button */}
                  <div className="pt-2 space-y-2.5">
                    <a
                      href={submittedSuccessInfo.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4 fill-white stroke-none" />
                      <span>{lang === 'id' ? 'Lanjutkan Chat via WhatsApp Sekarang' : lang === 'ko' ? '공식 WhatsApp으로 즉시 상담' : 'Fast-Track Coordination via WhatsApp'}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCloseLeadModal}
                      className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Kembali ke Obrolan' : lang === 'ko' ? '대화창으로 돌아가기' : 'Return to Chat'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header with #0779D1 Brand Gradient - Shrink-0 ensures it NEVER gets clipped */}
                <div className="shrink-0 bg-gradient-to-r from-[#0779D1] to-[#055ea3] text-white px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Building2 className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-white tracking-tight leading-snug truncate">
                        {t.consultationSchedule}
                      </h3>
                      <p className="text-xs text-sky-100/90 leading-tight font-normal truncate mt-0.5">
                        {t.consultationDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseLeadModal}
                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition-colors focus:outline-none shrink-0 cursor-pointer"
                    aria-label="Close form"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleLeadSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {leadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{leadError}</span>
                </div>
              )}

              {/* Row 1: Full Name & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label htmlFor="lead-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fullName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lead-full-name"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder={lang === 'id' ? 'contoh: Budi Santoso' : lang === 'ko' ? '예: 홍길동' : 'e.g. John Doe / Budi Santoso'}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="lead-job-title" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.jobTitle}
                  </label>
                  <input
                    id="lead-job-title"
                    name="jobTitle"
                    type="text"
                    autoComplete="organization-title"
                    value={leadForm.jobTitle}
                    onChange={(e) => setLeadForm({ ...leadForm, jobTitle: e.target.value })}
                    placeholder={t.jobTitlePlaceholder}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                </div>
              </div>

              {/* Row 2: Company Name & Company Scale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label htmlFor="lead-company-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.companyName}
                  </label>
                  <input
                    id="lead-company-name"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    placeholder={lang === 'id' ? 'contoh: PT Maju Bersama' : lang === 'ko' ? '예: (주)한국상사' : 'e.g. Acme Corp / Enterprise Ltd'}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="lead-company-scale" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.companyScale}
                  </label>
                  <select
                    id="lead-company-scale"
                    name="companyScale"
                    value={leadForm.companyScale}
                    onChange={(e) => setLeadForm({ ...leadForm, companyScale: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all text-slate-900 cursor-pointer"
                  >
                    <option value="">{t.selectCompanyScale}</option>
                    {COMPANY_SCALE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label[lang] || opt.label.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Industry Sector & Target Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label htmlFor="lead-industry-sector" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.industrySector}
                  </label>
                  <select
                    id="lead-industry-sector"
                    name="industry"
                    value={leadForm.industry}
                    onChange={(e) => setLeadForm({ ...leadForm, industry: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all text-slate-900 cursor-pointer"
                  >
                    <option value="">{t.selectIndustry}</option>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label[lang] || opt.label.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lead-target-timeline" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.targetTimeline}
                  </label>
                  <select
                    id="lead-target-timeline"
                    name="timeline"
                    value={leadForm.timeline}
                    onChange={(e) => setLeadForm({ ...leadForm, timeline: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all text-slate-900 cursor-pointer"
                  >
                    <option value="">{t.selectTimeline}</option>
                    {TIMELINE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label[lang] || opt.label.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="lead-phone-number" className="block text-xs font-semibold text-slate-700">
                      {t.phone} <span className="text-rose-500">*</span>
                    </label>
                    {leadForm.phone && (
                      <span className={`text-[11px] font-semibold ${phoneValidation.isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {phoneValidation.isValid ? '✓ Valid' : `${leadForm.phone.replace(/[^0-9]/g, '').length} digits`}
                      </span>
                    )}
                  </div>
                  <input
                    id="lead-phone-number"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="0812xxxxxxxx / +62..."
                    className={`w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 ${
                      leadForm.phone && !phoneValidation.isValid && leadForm.phone.length >= 4
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                        : leadForm.phone && phoneValidation.isValid
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                        : 'border-slate-200 focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15'
                    }`}
                  />
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {t.phoneFormatHint}
                  </span>
                </div>
                <div>
                  <label htmlFor="lead-business-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.email}
                  </label>
                  <input
                    id="lead-business-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {t.emailHint}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="lead-advisory-need" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.advisoryNeed} <span className="text-rose-500">*</span>
                </label>
                <select
                  id="lead-advisory-need"
                  name="businessNeed"
                  value={leadForm.businessNeed}
                  onChange={(e) => setLeadForm({ ...leadForm, businessNeed: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all text-slate-900 cursor-pointer"
                  required
                >
                  <option value="">{t.selectPillar}</option>
                  <option value="Strategy & Corporate Advisory">
                    {lang === 'id' ? 'Strategy & Corporate Advisory' : lang === 'ko' ? '기업전략 & 기업 자문' : 'Strategy & Corporate Advisory'}
                  </option>
                  <option value="Investment & Project Advisory">
                    {lang === 'id' ? 'Investment & Project Advisory' : lang === 'ko' ? '투자 & 프로젝트 자문' : 'Investment & Project Advisory'}
                  </option>
                  <option value="Market Access & Business Expansion">
                    {lang === 'id' ? 'Market Access & Business Expansion' : lang === 'ko' ? '시장 접근 & 사업 확장' : 'Market Access & Business Expansion'}
                  </option>
                  <option value="Cross-Border & Technology Advisory">
                    {lang === 'id' ? 'Cross-Border & Technology Advisory' : lang === 'ko' ? '크로스보더 & 기술 자문' : 'Cross-Border & Technology Advisory'}
                  </option>
                  <option value="Human Capital & Organization">
                    {lang === 'id' ? 'Human Capital & Organization' : lang === 'ko' ? '인적 자원 & 조직 개발' : 'Human Capital & Organization'}
                  </option>
                  <option value="Other Advisory Service">
                    {lang === 'id' ? 'Layanan Konsultasi Lainnya' : lang === 'ko' ? '기타 자문 서비스' : 'Other Advisory Service'}
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="lead-project-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.notes}
                </label>
                <textarea
                  id="lead-project-notes"
                  name="notes"
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder={t.notesPlaceholder}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#0779D1] focus:ring-2 focus:ring-[#0779D1]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-start gap-2.5 bg-[#0779D1]/5 p-3 rounded-xl border border-[#0779D1]/15">
                <input
                  type="checkbox"
                  id="lead-consent"
                  name="consent"
                  checked={leadForm.consent}
                  onChange={(e) => setLeadForm({ ...leadForm, consent: e.target.checked })}
                  className="mt-0.5 rounded text-[#0779D1] focus:ring-[#0779D1] w-4 h-4 cursor-pointer accent-[#0779D1]"
                />
                <label htmlFor="lead-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                  {lang === 'id' ? (
                    <>
                      Saya menyetujui data di atas digunakan untuk dihubungi oleh tim konsultan Inpartner sesuai{' '}
                      <a href="https://inpartner.id" target="_blank" rel="noopener noreferrer" className="text-[#0779D1] underline underline-offset-2 hover:text-[#055ea3]">
                        Kebijakan Privasi
                      </a>{' '}
                      dan regulasi perlindungan data.
                    </>
                  ) : lang === 'ko' ? (
                    <>
                      인파트너 비즈니스 자문팀의 상담 안내를 위해 개인정보를 제공하고{' '}
                      <a href="https://inpartner.id" target="_blank" rel="noopener noreferrer" className="text-[#0779D1] underline underline-offset-2 hover:text-[#055ea3]">
                        개인정보처리방침
                      </a>
                      에 동의합니다.
                    </>
                  ) : (
                    <>
                      I agree to be contacted by the Inpartner corporate advisory team for consultation follow-up in accordance with the{' '}
                      <a href="https://inpartner.id" target="_blank" rel="noopener noreferrer" className="text-[#0779D1] underline underline-offset-2 hover:text-[#055ea3]">
                        Privacy Policy
                      </a>.
                    </>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseLeadModal}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#0779D1] hover:bg-[#055ea3] active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  {leadSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <span>{t.submit}</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )}
    </>
  );
}

// Clean Helper to format bot responses cleanly without raw markdown symbols (###, ---, *, etc.)
function formatBotMessage(text: string) {
  if (!text) return null;

  // Pre-normalize text so headings and dividers have proper line breaks
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])\s*(#{1,4}\s+)/g, '$1\n\n$2')
    .replace(/([^\n])\s*(\-{3,}|\*{3,}|_{3,})\s*/g, '$1\n\n$2\n\n');

  // Split text by newlines into logical lines
  const lines = normalized.split('\n');

  return lines.map((line, lineIndex) => {
    const trimmed = line.trim();

    // 1. Horizontal rules (--- or ***) -> render clean subtle divider
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      return <hr key={`hr-${lineIndex}`} className="my-2 border-slate-200/80" />;
    }

    // 2. Headings (### Title or ## Title) -> render clean bold subheader without ### symbols
    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      return (
        <div key={`h-${lineIndex}`} className="font-bold text-slate-900 text-sm mt-3 mb-1">
          {renderInlineElements(headingMatch[1])}
        </div>
      );
    }

    // 3. Bullet points (* item, - item, • item) -> render clean bullet dot without raw asterisk
    const bulletMatch = trimmed.match(/^[\*\-\•]\s+(.+)$/);
    if (bulletMatch) {
      return (
        <div key={`b-${lineIndex}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-[#0779D1] font-bold select-none text-xs leading-5">•</span>
          <div className="flex-1 text-slate-800">{renderInlineElements(bulletMatch[1])}</div>
        </div>
      );
    }

    // 4. Numbered list (1. item, 2. item)
    const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.+)$/);
    if (numMatch) {
      return (
        <div key={`num-${lineIndex}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-[#0779D1] font-semibold select-none text-xs leading-5 min-w-[18px]">
            {numMatch[1]}
          </span>
          <div className="flex-1 text-slate-800">{renderInlineElements(numMatch[2])}</div>
        </div>
      );
    }

    // 5. Empty line -> clean spacing
    if (!trimmed) {
      return <div key={`empty-${lineIndex}`} className="h-1.5" />;
    }

    // 6. Regular paragraph text
    return (
      <div key={`p-${lineIndex}`} className="my-0.5 text-slate-800">
        {renderInlineElements(line)}
      </div>
    );
  });
}

// Inline renderer for bold, italic, and links without leaking raw asterisks
function renderInlineElements(content: string) {
  // Matches **bold**, *italic*, and [link](url)
  const regex = /(\*\*.*?\*\*|\*[^\*]+?\*|\[.*?\]\(.*?\))/g;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text* (clean up the asterisks so no raw symbol is shown)
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.includes('**')) {
      return (
        <span key={index} className="italic text-slate-700">
          {part.slice(1, -1)}
        </span>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0779D1] font-semibold underline underline-offset-2 hover:text-[#055ea3] transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Clean any stray single asterisk or hashes from text
    const cleaned = part.replace(/#{1,4}\s*/g, '').replace(/[\*\_]/g, '');
    return cleaned;
  });
}
