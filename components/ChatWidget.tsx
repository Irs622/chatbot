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
  Square
} from 'lucide-react';
import { INPARTNER_CONFIG, getWhatsAppUrl } from '@/lib/config';
import ChatbotIcon from '@/components/ChatbotIcon';
import { validatePhoneNumber, validateEmail } from '@/lib/validation';

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

  // Inpartner Agent Configuration
  const agentConfig = {
    name: 'Inpartner Agent',
    title: 'Solusi Bisnis Apa yang Anda Butuhkan?',
    subtitle: 'Inpartner AI siap membantu menganalisis tantangan perusahaan dan merekomendasikan solusi konsultan terbaik.',
    featured: {
      title: 'Business Growth & Market Expansion',
      desc: 'Riset penetrasi pasar, sales roadmap, & strategi ekspansi bisnis',
      query: 'Bagaimana Inpartner membantu Business Growth & strategi ekspansi pasar untuk perusahaan saya?',
      intent: 'Growth'
    },
    dividerText: 'PILIHAN LAYANAN LAINNYA',
    secondary1: {
      title: 'Funding & Profitability',
      query: 'Saya butuh bantuan terkait skema Funding (pendanaan) dan optimalisasi Profit Margin bisnis.',
      intent: 'Funding'
    },
    secondary2: {
      title: 'Diagnosis Kebutuhan Bisnis',
      query: 'Saya belum yakin solusi apa yang paling dibutuhkan perusahaan saya saat ini. Mohon panduan diagnosis kebutuhan bisnis dari Inpartner.',
      intent: 'other'
    },
    inputPlaceholder: 'Tanyakan solusi bisnis atau tantangan perusahaan Anda...'
  };

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    businessNeed: '',
    notes: '',
    consent: true
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState('');

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
    } catch (err) {
      console.warn('Could not restore chat state from localStorage:', err);
    }
  }, []);

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

  // Proactive Teaser Bubble timer (trigger after 8 seconds)
  useEffect(() => {
    if (embeddedMode || isOpen) return;
    try {
      if (sessionStorage.getItem('inpartner_teaser_dismissed')) return;
    } catch {}

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTeaser(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isOpen, embeddedMode]);

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

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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
                          isFallback: event.isFallback
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

        if (data.recommendedService && !leadForm.businessNeed) {
          setLeadForm((prev) => ({ ...prev, businessNeed: data.recommendedService }));
        }

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
          isStreaming: false
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
          text: 'Mohon maaf, terjadi kendala koneksi ke server. Silakan coba kembali atau hubungi via WhatsApp di [0896 2831 0192](https://wa.me/6289628310192).',
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
    setShowLeadModal(false);
    setMessages([]);
    setShowMenu(false);
  };

  const phoneValidation = validatePhoneNumber(leadForm.phone);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');

    if (!leadForm.name || leadForm.name.trim().length < 2) {
      setLeadError('Nama lengkap wajib diisi minimal 2 karakter.');
      return;
    }

    if (!leadForm.businessNeed) {
      setLeadError('Kebutuhan Layanan Bisnis wajib dipilih.');
      return;
    }

    if (!leadForm.email && !leadForm.phone) {
      setLeadError('Harap cantumkan Nomor WhatsApp atau Email untuk follow-up.');
      return;
    }

    if (leadForm.phone) {
      const pValidation = validatePhoneNumber(leadForm.phone);
      if (!pValidation.isValid) {
        setLeadError(pValidation.error || 'Format nomor WhatsApp tidak valid.');
        return;
      }
    }

    if (leadForm.email && !validateEmail(leadForm.email)) {
      setLeadError('Format alamat email tidak valid (contoh: nama@perusahaan.com).');
      return;
    }

    if (!leadForm.consent) {
      setLeadError('Harap setujui persetujuan komunikasi agar tim kami dapat menghubungi Anda.');
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
          email: leadForm.email,
          phone: leadForm.phone,
          business_need: leadForm.businessNeed,
          notes: leadForm.notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim data');
      }

      setLeadSubmitted(true);
      setShowLeadModal(false);

      const confirmMsg: ChatMessage = {
        id: `sys_lead_${Date.now()}`,
        sender: 'bot',
        text: `✅ **Terima kasih, Bapak/Ibu ${leadForm.name}!**\n\nInformasi Anda telah kami terima. Tim kami akan meninjau kebutuhan bisnis Anda (**${leadForm.company || 'Perusahaan Anda'}**) dan segera menghubungi Anda.\n\nJika membutuhkan respons cepat, Anda dapat menghubungi via WhatsApp di **[0896 2831 0192](https://wa.me/6289628310192)**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: any) {
      setLeadError(err.message || 'Terjadi kesalahan sistem.');
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
                try {
                  sessionStorage.setItem('inpartner_teaser_dismissed', 'true');
                } catch {}
                setIsOpen(true);
              }}
              className="pointer-events-auto max-w-[310px] w-full bg-white rounded-2xl p-4 shadow-2xl border border-[#005DAD]/20 animate-in fade-in slide-in-from-bottom-3 duration-300 cursor-pointer hover:shadow-3xl hover:border-[#005DAD]/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-[11px] text-[#005DAD]">Inpartner AI Assistant</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTeaser(false);
                    try {
                      sessionStorage.setItem('inpartner_teaser_dismissed', 'true');
                    } catch {}
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Tutup sapaan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-[#005DAD] transition-colors">
                Butuh Konsultasi Strategi Bisnis atau Optimasi Laba?
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Dapatkan analisis ringkas & solusi 4 pilar Inpartner dalam 2 menit.
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                <span className="font-bold text-[#005DAD] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Mulai Diskusi &rarr;
                </span>
                <span className="text-slate-400">Online 24/7 • Gratis</span>
              </div>
            </div>
          )}

          {/* Launcher Row */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {!isOpen && !showTeaser && (
              <button
                onClick={() => {
                  setShowTeaser(false);
                  try {
                    sessionStorage.setItem('inpartner_teaser_dismissed', 'true');
                  } catch {}
                  setIsOpen(true);
                }}
                className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg border border-slate-200/80 hover:shadow-xl transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Konsultasi {agentConfig.name}
              </button>
            )}
            <button
              onClick={() => {
                setShowTeaser(false);
                try {
                  sessionStorage.setItem('inpartner_teaser_dismissed', 'true');
                } catch {}
                setIsOpen(!isOpen);
              }}
              aria-label={isOpen ? 'Tutup Chatbot' : `Buka ${agentConfig.name}`}
              className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#005DAD] hover:bg-[#004785] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-200"
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
              : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[410px] h-[720px] max-h-[88vh] rounded-3xl shadow-2xl border border-slate-200/80'
          } flex flex-col bg-white overflow-hidden transition-all duration-300 font-sans`}
        >
          {/* Minimalist Top Header */}
          <div className="relative px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-20">
            {/* Left: Brand Icon + Agent Title */}
            <div className="flex items-center gap-3">
              {/* Custom Robot Chatbot Icon badge */}
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center shadow-xs shrink-0 ring-1 ring-black/5">
                <ChatbotIcon size="sm" />
              </div>
              <div>
                <h2 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.02em] leading-snug">
                  {agentConfig.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold tracking-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online • Siap membantu
                </div>
              </div>
            </div>

            {/* Right: Header Action Buttons (Menu + Close) */}
            <div className="flex items-center gap-1">
              {/* Dropdown Options Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                  aria-label="Options"
                  title="Menu Opsi"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Header Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <button
                      onClick={handleResetConversation}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>New conversation</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowLeadModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-[#005DAD]/10 hover:text-[#005DAD] flex items-center gap-2 font-medium transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#005DAD]" />
                      <span>Jadwalkan Konsultasi</span>
                    </button>

                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Official WhatsApp</span>
                    </a>

                    <a
                      href={INPARTNER_CONFIG.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Visit inpartner.id</span>
                    </a>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleCloseWidget}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tutup Percakapan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Close / Minimize Button (Works on both desktop & mobile / iframe) */}
              <button
                type="button"
                onClick={handleCloseWidget}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Tutup Percakapan"
                title="Tutup Chat"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Main Body Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-between">
            {messages.length === 0 ? (
              /* State 1: Clean Minimalist Welcome Screen (Matching Screenshot) */
              <div className="my-auto max-w-sm mx-auto w-full py-2 flex flex-col items-center">
                {/* Agent Mascot / Brand Badge */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200/90 flex items-center justify-center shadow-md mb-4 ring-4 ring-[#005DAD]/10 group">
                  <ChatbotIcon size="lg" className="transition-transform group-hover:scale-105 duration-200" />
                </div>

                {/* Heading */}
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 text-center tracking-[-0.03em] leading-tight">
                  {agentConfig.title}
                </h1>

                {/* Subtitle */}
                <p className="text-[13px] sm:text-[13.5px] text-slate-500 text-center mt-2.5 leading-relaxed max-w-[310px] font-normal">
                  {agentConfig.subtitle}
                </p>

                {/* Featured / Hero Card */}
                <button
                  type="button"
                  onClick={() => handleSendMessage(agentConfig.featured.query, agentConfig.featured.intent)}
                  className="mt-7 w-full p-4 rounded-2xl bg-[#005DAD]/10 hover:bg-[#005DAD]/15 border border-[#005DAD]/20 transition-all flex items-center justify-between gap-3.5 cursor-pointer shadow-xs hover:shadow-md text-left group active:scale-[0.99]"
                >
                  {/* Executive Inpartner Blue Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#005DAD] to-[#004785] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-[#005DAD]/20">
                    <TrendingUp className="w-5 h-5 text-white stroke-[2.3]" />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13.5px] text-slate-900 group-hover:text-[#005DAD] transition-colors leading-snug tracking-tight">
                      {agentConfig.featured.title}
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5 leading-snug font-normal">
                      {agentConfig.featured.desc}
                    </div>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="w-4 h-4 text-slate-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Divider */}
                <div className="my-6 relative flex items-center justify-center w-full">
                  <div className="w-full border-t border-slate-200/80"></div>
                  <span className="absolute bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider select-none">
                    {agentConfig.dividerText}
                  </span>
                </div>

                {/* 2-Column Grid Secondary Cards */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* Card 1: Funding & Profitability */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage(agentConfig.secondary1.query, agentConfig.secondary1.intent)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-[#005DAD]/40 hover:bg-[#005DAD]/5 transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#005DAD]/10 text-[#005DAD] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Landmark className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-800 group-hover:text-[#005DAD] transition-colors leading-snug tracking-tight">
                      {agentConfig.secondary1.title}
                    </span>
                  </button>

                  {/* Card 2: Diagnosis Kebutuhan Bisnis */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage(agentConfig.secondary2.query, agentConfig.secondary2.intent)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-[#005DAD]/40 hover:bg-[#005DAD]/5 transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#005DAD]/10 text-[#005DAD] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-800 group-hover:text-[#005DAD] transition-colors leading-snug tracking-tight">
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
                        className={`w-full rounded-2xl px-4 py-3 text-[13px] leading-[1.65] ${
                          msg.sender === 'user'
                            ? 'bg-[#005DAD] text-white rounded-br-xs shadow-xs font-medium'
                            : 'bg-slate-50/90 border border-slate-200/70 text-slate-800 rounded-bl-xs shadow-2xs font-normal'
                        }`}
                      >
                      {/* Message Content with Markdown rendering & Typewriter Caret */}
                      <div className="whitespace-pre-line prose prose-sm max-w-none text-[13px] leading-[1.65]">
                        {formatBotMessage(msg.text)}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#005DAD] animate-pulse align-middle rounded-xs" />
                        )}
                      </div>

                      {/* Recommended Service Badge */}
                      {msg.recommendedService && !msg.isStreaming && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#005DAD]/10 text-[#005DAD] border border-[#005DAD]/20 rounded-lg text-[11px] font-bold tracking-tight">
                          <Sparkles className="w-3.5 h-3.5 text-[#005DAD]" />
                          <span>Layanan: {msg.recommendedService}</span>
                        </div>
                      )}

                      {/* Official Sources */}
                      {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">Sumber:</span>
                          {msg.sources.map((s, idx) => (
                            <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[10px] text-slate-600 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp & Realtime indicator */}
                      <div
                        className={`mt-1.5 flex items-center justify-between gap-2 text-[10px] font-mono ${
                          msg.sender === 'user' ? 'text-sky-100/90 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.sender === 'bot' && msg.isStreaming ? (
                          <span className="inline-flex items-center gap-1 text-[#005DAD] font-medium not-italic animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#005DAD]" />
                            Mengetik respons...
                          </span>
                        ) : (
                          <span></span>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {/* Follow-up Questions Suggestions */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && !msg.isStreaming && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                        {msg.followUpQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-[11.5px] font-medium bg-white hover:bg-[#005DAD]/5 text-slate-700 hover:text-[#005DAD] px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#005DAD]/40 transition-all shadow-2xs flex items-center gap-1.5 group"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#005DAD] shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lead Capture CTA Card */}
                    {msg.suggestLeadCapture && !leadSubmitted && !msg.isStreaming && (
                      <div className="mt-3 w-full sm:w-[90%] bg-gradient-to-br from-[#005DAD]/5 via-sky-50/50 to-[#005DAD]/10 border border-[#005DAD]/25 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005DAD] to-[#004785] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-bold text-slate-900 tracking-tight leading-snug">
                              Ingin Konsultasi Bisnis Lebih Lanjut?
                            </h4>
                            <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed font-normal">
                              Tinggalkan kontak bisnis Anda, konsultan Inpartner akan menghubungi Anda untuk analisis kebutuhan mendalam.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setShowLeadModal(true)}
                                className="bg-[#005DAD] hover:bg-[#004785] text-white text-xs font-bold tracking-tight px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                <span>Isi Form Konsultasi</span>
                              </button>
                              <a
                                href={getWhatsAppUrl('Halo tim Inpartner, saya ingin konsultasi lebih lanjut terkait solusi bisnis.')}
                                target="_blank"
                                rel="noopener noreferrer"
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
                        <div className="w-2 h-2 rounded-full bg-[#005DAD] animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-[#005DAD] animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#005DAD] animate-bounce [animation-delay:0.4s]"></div>
                        <span className="text-xs text-slate-500 font-medium ml-1.5">
                          Inpartner AI sedang berpikir...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="border-t border-slate-100 p-3 sm:p-4 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={agentConfig.inputPlaceholder}
                className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-slate-900 text-[13px] font-medium pl-4 pr-12 py-3 rounded-2xl border border-slate-200 focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                disabled={isLoading || isStreaming}
              />
              {isLoading || isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  aria-label="Stop generation"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer active:scale-95 shadow-xs border border-rose-200"
                  title="Hentikan respons"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-600 stroke-rose-600" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  aria-label="Send message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-300 bg-[#005DAD] hover:bg-[#004785] text-white cursor-pointer active:scale-95 shadow-xs"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </form>

            {/* Disclaimer Matching Screenshot */}
            <div className="text-center text-[10.5px] text-slate-400 mt-2 font-medium tracking-normal select-none">
              AI can make mistakes. Double-check replies.
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-hidden">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setShowLeadModal(false)}
          />

          {/* Dialog Card Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[94vh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header with #005DAD Brand Gradient - Shrink-0 ensures it NEVER gets clipped */}
            <div className="shrink-0 bg-gradient-to-r from-[#005DAD] to-[#004785] text-white px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Building2 className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[15px] sm:text-base text-white tracking-tight leading-snug truncate">
                    Jadwalkan Konsultasi Bisnis
                  </h3>
                  <p className="text-[11.5px] text-sky-100/90 leading-tight font-normal truncate mt-0.5">
                    Tim konsultan Inpartner akan segera menghubungi Anda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition-colors focus:outline-none shrink-0"
                aria-label="Tutup form"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    placeholder="PT / CV / Lembaga"
                    className="w-full text-xs px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    {leadForm.phone && (
                      <span className={`text-[10px] font-semibold ${phoneValidation.isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {phoneValidation.isValid ? '✓ Valid' : `${leadForm.phone.replace(/[^0-9]/g, '').length} digit`}
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className={`w-full text-xs px-3 py-2 sm:py-2.5 rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 ${
                      leadForm.phone && !phoneValidation.isValid && leadForm.phone.length >= 4
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                        : leadForm.phone && phoneValidation.isValid
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                        : 'border-slate-200 focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15'
                    }`}
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Format: 08xx atau +628xx (10-14 digit)
                  </span>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="nama@perusahaan.com"
                    className="w-full text-xs px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Opsional untuk dokumen proposal
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Kebutuhan Utama Layanan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leadForm.businessNeed}
                  onChange={(e) => setLeadForm({ ...leadForm, businessNeed: e.target.value })}
                  className="w-full text-xs px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15 focus:outline-none transition-all text-slate-900"
                  required
                >
                  <option value="">-- Pilih Kebutuhan Layanan Inpartner --</option>
                  <option value="Business Growth & Market Expansion">Business Growth & Market Expansion</option>
                  <option value="Funding & Investment Advisory">Funding & Investment Advisory</option>
                  <option value="Profitability & Cost Optimization">Profitability & Margin Optimization</option>
                  <option value="Capacity Building">Capacity Building / Executive Program</option>
                  <option value="Other Consulting Service">Layanan Konsultasi Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Catatan / Kebutuhan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Ceritakan gambaran singkat kebutuhan atau tantangan bisnis Anda..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#005DAD] focus:ring-2 focus:ring-[#005DAD]/15 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-start gap-2.5 bg-[#005DAD]/5 p-2.5 rounded-xl border border-[#005DAD]/15">
                <input
                  type="checkbox"
                  id="lead-consent"
                  checked={leadForm.consent}
                  onChange={(e) => setLeadForm({ ...leadForm, consent: e.target.checked })}
                  className="mt-0.5 rounded text-[#005DAD] focus:ring-[#005DAD] w-3.5 h-3.5 cursor-pointer accent-[#005DAD]"
                />
                <label htmlFor="lead-consent" className="text-[11px] font-medium text-slate-700 leading-snug cursor-pointer select-none">
                  Saya bersedia dihubungi oleh tim konsultan Inpartner untuk tindak lanjut dan memahami data saya disimpan secara aman sesuai kebijakan privasi.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#005DAD] hover:bg-[#004785] active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {leadSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim Data...</span>
                    </>
                  ) : (
                    <span>Kirim Informasi Konsultasi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Simple Helper to highlight bold text, headers, and markdown links
function formatBotMessage(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005DAD] font-semibold underline underline-offset-2 hover:text-[#004785] transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}
