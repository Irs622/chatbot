'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Briefcase,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Users,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';

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
}

interface ChatWidgetProps {
  initialOpen?: boolean;
  embeddedMode?: boolean;
}

export default function ChatWidget({
  initialOpen = false,
  embeddedMode = false
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session
  useEffect(() => {
    let sess = localStorage.getItem('inpartner_chat_session');
    if (!sess) {
      sess = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('inpartner_chat_session', sess);
    }
    setSessionId(sess);

    // Initial Welcome Message
    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      sender: 'bot',
      text: `Selamat datang di **Inpartner AI Business Consultation Assistant**! 👋\n\nSebagai mitra konsultan strategis bisnis & manajemen terpercaya di Indonesia, Inpartner siap membantu perusahaan Anda menghadapi tantangan dan merealisasikan potensi pertumbuhan.\n\nApa fokus kebutuhan utama bisnis Anda saat ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        '💰 Funding & Investment',
        '📈 Business Growth',
        '📊 Profitability',
        '👥 Capacity Building',
        '🏢 Profil Inpartner'
      ],
      followUpQuestions: [
        'Bagaimana Inpartner membantu perusahaan saya?',
        'Perusahaan saya ingin ekspansi pasar baru',
        'Omzet naik tapi profit margin menurun'
      ]
    };
    setMessages([welcomeMsg]);
  }, []);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, needCategory?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          selectedNeed: currentNeed,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Pre-fill lead form business need if detected
      if (data.recommendedService && !leadForm.businessNeed) {
        setLeadForm((prev) => ({ ...prev, businessNeed: data.recommendedService }));
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedService: data.recommendedService,
        sources: data.sources,
        suggestLeadCapture: data.suggestLeadCapture,
        followUpQuestions: data.followUpQuestions,
        quickActions: data.quickActions,
        isFallback: data.isFallback
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'bot',
        text: 'Mohon maaf, terjadi kendala koneksi ke server. Silakan hubungi tim Inpartner melalui WhatsApp di [0896 2831 0192](https://wa.me/6289628310192) atau coba kembali sebentar lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelectBusinessNeed = (need: string, queryText: string) => {
    setSelectedNeed(need);
    setLeadForm((prev) => ({ ...prev, businessNeed: need }));

    // Track analytics: intent_selected
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'intent_selected',
        session_id: sessionId,
        conversation_id: conversationId,
        metadata: { selected_need: need }
      })
    }).catch(() => {});

    handleSendMessage(queryText, need);
  };

  const handleResetConversation = () => {
    const newSess = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('inpartner_chat_session', newSess);
    setSessionId(newSess);
    setConversationId(null);
    setSelectedNeed(null);
    setLeadSubmitted(false);
    setShowLeadModal(false);

    const welcomeMsg: ChatMessage = {
      id: `welcome_${Date.now()}`,
      sender: 'bot',
      text: `Sesi percakapan telah diperbarui. Silakan pilih pilar konsultasi atau tanyakan tantangan bisnis Anda kepada Inpartner:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        '💰 Funding & Investment',
        '📈 Business Growth',
        '📊 Profitability',
        '👥 Capacity Building'
      ]
    };
    setMessages([welcomeMsg]);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');

    if (!leadForm.name || !leadForm.businessNeed) {
      setLeadError('Nama dan Kebutuhan Bisnis wajib diisi.');
      return;
    }

    if (!leadForm.email && !leadForm.phone) {
      setLeadError('Harap cantumkan Email atau Nomor WhatsApp untuk follow-up.');
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

      // Add bot confirmation message
      const confirmMsg: ChatMessage = {
        id: `sys_lead_${Date.now()}`,
        sender: 'bot',
        text: `✅ **Terima kasih, Bapak/Ibu ${leadForm.name}!**\n\nInformasi Anda telah diteruskan ke tim Business Development & Konsultan Inpartner. Kami akan mempelajari kebutuhan bisnis perusahaan Anda (**${leadForm.company || 'Perusahaan Anda'}**) dan menghubungi Anda dalam 1x24 jam kerja.\n\nJika membutuhkan respons instan, Anda juga dapat langsung berdiskusi via WhatsApp resmi di **[0896 2831 0192](https://wa.me/6289628310192)**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: any) {
      setLeadError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleContactClick = (channel: string) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'contact_clicked',
        session_id: sessionId,
        conversation_id: conversationId,
        metadata: { channel }
      })
    }).catch(() => {});
  };

  return (
    <>
      {/* Floating Launcher Button (Only when not in embeddedMode) */}
      {!embeddedMode && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {!isOpen && (
            <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded-full shadow-lg border border-slate-200 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ada kendala bisnis? Konsultasikan di sini
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Tutup Chatbot' : 'Buka Chatbot Inpartner'}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#0d5f8a] to-[#083c5a] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-300"
          >
            {isOpen ? (
              <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
            ) : (
              <>
                <MessageSquare className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-bold text-white items-center justify-center">
                    AI
                  </span>
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Chat Drawer / Window */}
      {(isOpen || embeddedMode) && (
        <div
          className={`${
            embeddedMode
              ? 'w-full h-full'
              : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[640px] max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200/80'
          } flex flex-col bg-white overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0d5f8a] via-[#0b4d70] to-[#083c5a] text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-amber-300 text-lg shadow-inner">
                IN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide">Inpartner Assistant</h3>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-300/30">
                    AI Consultant
                  </span>
                </div>
                <p className="text-[11px] text-sky-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Online • PT Inpartner Optima Integra
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetConversation}
                title="Mulai Ulang Percakapan"
                className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Mulai ulang chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {!embeddedMode && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Tutup jendela chat"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Business Needs Quick Bar (PRD Section 5.1 & 7 FR-02) */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
              <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#0d5f8a]" /> Fokus:
              </span>
              <button
                onClick={() => handleSelectBusinessNeed('Funding', 'Saya membutuhkan bantuan terkait Funding & Investment')}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  selectedNeed === 'Funding'
                    ? 'bg-[#0d5f8a] text-white border-[#0d5f8a] shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#0d5f8a] hover:text-[#0d5f8a]'
                }`}
              >
                💰 Funding
              </button>
              <button
                onClick={() => handleSelectBusinessNeed('Growth', 'Bagaimana Inpartner membantu strategi Business Growth & ekspansi pasar?')}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  selectedNeed === 'Growth'
                    ? 'bg-[#0d5f8a] text-white border-[#0d5f8a] shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#0d5f8a] hover:text-[#0d5f8a]'
                }`}
              >
                📈 Growth
              </button>
              <button
                onClick={() => handleSelectBusinessNeed('Profitability', 'Perusahaan saya sedang berkembang tetapi profit margin menurun. Apakah Inpartner bisa membantu?')}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  selectedNeed === 'Profitability'
                    ? 'bg-[#0d5f8a] text-white border-[#0d5f8a] shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#0d5f8a] hover:text-[#0d5f8a]'
                }`}
              >
                📊 Profitability
              </button>
              <button
                onClick={() => handleSelectBusinessNeed('Capacity Building', 'Saya ingin mengetahui program Capacity Building / Inpartner Academy')}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  selectedNeed === 'Capacity Building'
                    ? 'bg-[#0d5f8a] text-white border-[#0d5f8a] shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#0d5f8a] hover:text-[#0d5f8a]'
                }`}
              >
                👥 Capacity Building
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0d5f8a] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {/* Message Content with Markdown rendering */}
                  <div className="whitespace-pre-line prose prose-sm max-w-none">
                    {formatBotMessage(msg.text)}
                  </div>

                  {/* Sources tag if available */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">Sumber Resmi:</span>
                      {msg.sources.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommended Service Badge */}
                  {msg.recommendedService && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-[#0d5f8a] border border-sky-200 rounded-lg text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Layanan Relevan: {msg.recommendedService}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-1.5 text-[10px] ${
                      msg.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Lead Capture CTA Card (FR-07 & Section 13) */}
                {msg.suggestLeadCapture && !leadSubmitted && (
                  <div className="mt-2 w-[88%] bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-[#0d5f8a] text-white rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-800">
                          Ingin Konsultasi Langsung dengan Tim Inpartner?
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Tinggalkan kontak bisnis Anda, konsultan kami akan memberikan telaah awal tanpa komitmen.
                        </p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowLeadModal(true);
                              fetch('/api/analytics', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  event_name: 'lead_form_opened',
                                  session_id: sessionId,
                                  conversation_id: conversationId
                                })
                              }).catch(() => {});
                            }}
                            className="bg-[#0d5f8a] hover:bg-[#083c5a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            Isi Form Konsultasi
                          </button>
                          <a
                            href="https://wa.me/6289628310192?text=Halo%20Inpartner,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20bisnis."
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleContactClick('whatsapp_direct')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Phone className="w-3 h-3" /> Chat WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up Questions Suggestions (FR-06) */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5 w-[88%]">
                    <span className="text-[11px] font-semibold text-slate-500">Pertanyaan Lanjutan:</span>
                    {msg.followUpQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-left text-xs bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0d5f8a] px-3 py-2 rounded-xl border border-slate-200 hover:border-sky-300 transition-all shadow-xs flex items-center justify-between group"
                      >
                        <span>{q}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0d5f8a] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Human Handoff Contact Bar (FR-09 & FR-10) */}
                {msg.isFallback && (
                  <div className="mt-2 w-[88%] bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Saluran Resmi Konsultan Inpartner:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <a
                        href="https://wa.me/6289628310192"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('whatsapp_fallback')}
                        className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg p-2 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WA: 0896 2831 0192</span>
                      </a>
                      <a
                        href="mailto:corporatesecretary@inpartner.id"
                        onClick={() => handleContactClick('email_fallback')}
                        className="bg-white hover:bg-sky-50 text-[#0d5f8a] border border-sky-300 rounded-lg p-2 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Kirim Email</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#0d5f8a] animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-[#0d5f8a] animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#0d5f8a] animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-xs text-slate-500 font-medium ml-1.5">
                      Menganalisis knowledge base Inpartner...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Footer Pills */}
          <div className="px-3 py-1.5 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSendMessage('Bagaimana cara Inpartner membantu masalah profit margin yang menurun?')}
              className="text-[11px] bg-white hover:bg-sky-50 text-slate-600 hover:text-[#0d5f8a] border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              📊 Solusi Profit Margin
            </button>
            <button
              onClick={() => handleSendMessage('Apakah Inpartner menyediakan pinjaman dana investasi?')}
              className="text-[11px] bg-white hover:bg-sky-50 text-slate-600 hover:text-[#0d5f8a] border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              💰 Skema Funding
            </button>
            <button
              onClick={() => handleSendMessage('Di mana alamat kantor dan kontak resmi Inpartner?')}
              className="text-[11px] bg-white hover:bg-sky-50 text-slate-600 hover:text-[#0d5f8a] border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              📍 Kantor & Kontak
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan kebutuhan bisnis Anda (misal: 'omzet naik tapi profit turun')..."
                className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-transparent focus:border-[#0d5f8a] focus:outline-none transition-all placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Kirim Pesan"
                className="bg-[#0d5f8a] hover:bg-[#083c5a] disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
              <span>Didukung RAG resmi Inpartner Knowledge Base</span>
              <button
                onClick={() => setShowLeadModal(true)}
                className="text-[#0d5f8a] hover:underline font-semibold"
              >
                Jadwalkan Konsultasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal (PRD Section 5.4, 7 FR-07 & 13) */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0d5f8a] to-[#083c5a] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-300" />
                  Jadwalkan Konsultasi Bisnis Inpartner
                </h3>
                <p className="text-xs text-sky-100 mt-0.5">
                  Tim kami akan menganalisis kebutuhan Anda dan menghubungi kembali.
                </p>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-sky-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleLeadSubmit} className="p-6 space-y-4">
              {leadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{leadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Perusahaan / Organisasi
                  </label>
                  <input
                    type="text"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    placeholder="PT / CV / Lembaga"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email Bisnis
                  </label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="nama@perusahaan.co.id"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kebutuhan Bisnis Utama <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leadForm.businessNeed}
                  onChange={(e) => setLeadForm({ ...leadForm, businessNeed: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Pilih Kebutuhan Bisnis --</option>
                  <option value="Profitability & Operational Process Optimization">
                    Profitability & Optimalisasi Biaya / Margin
                  </option>
                  <option value="Funding & Investment Advisory">
                    Funding & Pendampingan Investasi / Investor
                  </option>
                  <option value="Business Growth & Market Expansion">
                    Growth & Strategi Ekspansi Pasar
                  </option>
                  <option value="Capacity Building (The Executive Business Program)">
                    Capacity Building / Pelatihan Eksekutif
                  </option>
                  <option value="Other Consulting Service">Kebutuhan Konsultasi Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Tantangan Bisnis yang Sedang Dihadapi
                </label>
                <textarea
                  rows={3}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Ceritakan gambaran singkat tantangan bisnis yang ingin Anda selesaikan..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                />
              </div>

              {/* Explicit Consent (PRD Section 5.4 & 8 Privacy) */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lead-consent"
                  checked={leadForm.consent}
                  onChange={(e) => setLeadForm({ ...leadForm, consent: e.target.checked })}
                  className="mt-0.5 rounded text-[#0d5f8a] focus:ring-[#0d5f8a]"
                />
                <label htmlFor="lead-consent" className="text-[11px] text-slate-600 leading-snug">
                  Saya bersedia dihubungi oleh tim konsultan Inpartner untuk tujuan konsultasi bisnis dan memahami data saya disimpan secara aman sesuai kebijakan privasi Inpartner.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0d5f8a] hover:bg-[#083c5a] rounded-lg shadow-sm transition-all disabled:bg-slate-300"
                >
                  {leadSubmitting ? 'Mengirim Data...' : 'Kirim Informasi Konsultasi'}
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
        <strong key={index} className="font-semibold text-slate-900">
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
          className="text-[#0d5f8a] font-semibold underline hover:text-[#083c5a]"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}
