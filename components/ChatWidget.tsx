'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  TrendingUp,
  HelpCircle,
  X,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { INPARTNER_CONFIG, getWhatsAppUrl } from '@/lib/config';
import ChatbotIcon from '@/components/ChatbotIcon';

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
  const [showMenu, setShowMenu] = useState(false);

  // Inpartner Agent Configuration
  const agentConfig = {
    name: 'Inpartner Agent',
    title: 'What are you setting up?',
    subtitle: "I'm Inpartner Agent. I'll match you with the right business solution in under 2 minutes.",
    featured: {
      title: "Business Growth — I'll scale my business",
      desc: 'Market expansion, sales roadmap with full advisory',
      query: 'Bagaimana Inpartner membantu Business Growth & strategi ekspansi pasar untuk perusahaan saya?',
      intent: 'Growth'
    },
    secondary1: {
      title: 'Funding & Profitability',
      query: 'Saya butuh bantuan terkait skema Funding (pendanaan) dan optimalisasi Profit Margin bisnis.',
      intent: 'Funding'
    },
    secondary2: {
      title: 'Not sure what I need',
      query: 'Saya belum yakin solusi apa yang paling dibutuhkan perusahaan saya saat ini. Mohon panduan diagnosis kebutuhan bisnis dari Inpartner.',
      intent: 'other'
    },
    inputPlaceholder: 'Message Inpartner Agent...'
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
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    setMounted(true);
    let sess = localStorage.getItem('inpartner_chat_session');
    if (!sess) {
      sess = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('inpartner_chat_session', sess);
    }
    setSessionId(sess);
  }, []);

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
        text: 'Mohon maaf, terjadi kendala koneksi ke server. Silakan coba kembali atau hubungi via WhatsApp di [0896 2831 0192](https://wa.me/6289628310192).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetConversation = () => {
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
          <div className="w-6 h-6 border-2 border-[#0d5f8a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* Floating Launcher Button (Only when not in embeddedMode) */}
      {!embeddedMode && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg border border-slate-200/80 hover:shadow-xl transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Message {agentConfig.name}
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Tutup Chatbot' : `Buka ${agentConfig.name}`}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0d5f8a] hover:bg-[#083c5a] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-200"
          >
            {isOpen ? (
              <ChevronDown className="w-6 h-6 transition-transform group-hover:translate-y-0.5 duration-200" />
            ) : (
              <div className="flex items-center justify-center">
                <ChatbotIcon className="w-8 h-8 transition-transform group-hover:scale-110 duration-200" />
              </div>
            )}
          </button>
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
              <div className="w-9 h-9 rounded-xl bg-[#0d5f8a] flex items-center justify-center p-1 shadow-xs shrink-0 ring-1 ring-black/5">
                <ChatbotIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                  {agentConfig.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online • Siap membantu
                </div>
              </div>
            </div>

            {/* Right: Chevron Down / Dropdown trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  if (!embeddedMode && !showMenu) {
                    setIsOpen(false);
                  } else {
                    setShowMenu(!showMenu);
                  }
                }}
                className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/80 transition-colors focus:outline-none"
                aria-label="Options"
              >
                <ChevronDown className="w-5 h-5 transition-transform duration-200" />
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
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Schedule consultation</span>
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

                  {!embeddedMode && (
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close chat</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Body Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-between">
            {messages.length === 0 ? (
              /* State 1: Clean Minimalist Welcome Screen (Matching Screenshot) */
              <div className="my-auto max-w-sm mx-auto w-full py-2 flex flex-col items-center">
                {/* Agent Mascot / Brand Badge */}
                <div className="w-14 h-14 rounded-2xl bg-[#0d5f8a] flex items-center justify-center p-2 shadow-md mb-4 ring-4 ring-[#0d5f8a]/15 group">
                  <ChatbotIcon className="w-10 h-10 transition-transform group-hover:scale-105 duration-200" />
                </div>

                {/* Heading */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center tracking-tight">
                  {agentConfig.title}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-slate-600 text-center mt-2 leading-relaxed max-w-[320px]">
                  {agentConfig.subtitle}
                </p>

                {/* Featured / Hero Card */}
                <button
                  type="button"
                  onClick={() => handleSendMessage(agentConfig.featured.query, agentConfig.featured.intent)}
                  className="mt-7 w-full p-4 rounded-2xl bg-[#0d5f8a]/10 hover:bg-[#0d5f8a]/15 border border-[#0d5f8a]/20 transition-all flex items-center justify-between gap-3.5 cursor-pointer shadow-xs hover:shadow-md text-left group active:scale-[0.99]"
                >
                  {/* Blue Rounded Icon with terminal >_ */}
                  <div className="w-12 h-12 rounded-xl bg-[#0d5f8a] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <div className="w-6 h-5 rounded border border-white/80 flex items-center justify-center font-mono text-[10px] font-bold text-white tracking-tighter">
                      &gt;_
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-[#0d5f8a] transition-colors leading-snug">
                      {agentConfig.featured.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {agentConfig.featured.desc}
                    </div>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="w-4 h-4 text-slate-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* "and more" Divider */}
                <div className="my-6 relative flex items-center justify-center w-full">
                  <div className="w-full border-t border-slate-200/80"></div>
                  <span className="absolute bg-white px-3 text-xs text-slate-500 font-medium tracking-normal">
                    and more
                  </span>
                </div>

                {/* 2-Column Grid Secondary Cards */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* Card 1: Funding & Profitability */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage(agentConfig.secondary1.query, agentConfig.secondary1.intent)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-[#0d5f8a]/40 hover:bg-[#0d5f8a]/5 transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0d5f8a]/10 text-[#0d5f8a] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-800 group-hover:text-[#0d5f8a] transition-colors leading-snug">
                      {agentConfig.secondary1.title}
                    </span>
                  </button>

                  {/* Card 2: Help / Not sure what I need */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage(agentConfig.secondary2.query, agentConfig.secondary2.intent)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-[#0d5f8a]/40 hover:bg-[#0d5f8a]/5 transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0d5f8a]/10 text-[#0d5f8a] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-800 group-hover:text-[#0d5f8a] transition-colors leading-snug">
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
                      <div className="w-7 h-7 rounded-xl bg-[#0d5f8a] flex items-center justify-center p-0.5 shrink-0 shadow-2xs mt-1 ring-1 ring-black/5">
                        <ChatbotIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      } max-w-[85%] sm:max-w-[80%]`}
                    >
                      <div
                        className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#0d5f8a] text-white rounded-br-xs shadow-xs'
                            : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                      {/* Message Content with Markdown rendering */}
                      <div className="whitespace-pre-line prose prose-sm max-w-none">
                        {formatBotMessage(msg.text)}
                      </div>

                      {/* Recommended Service Badge */}
                      {msg.recommendedService && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0d5f8a]/10 text-[#0d5f8a] border border-[#0d5f8a]/20 rounded-lg text-xs font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-[#0d5f8a]" />
                          Layanan: {msg.recommendedService}
                        </div>
                      )}

                      {/* Official Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-600">Sumber:</span>
                          {msg.sources.map((s, idx) => (
                            <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              {s}
                            </span>
                          ))}
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

                    {/* Follow-up Questions Suggestions */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                        {msg.followUpQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-xs bg-white hover:bg-[#0d5f8a]/5 text-slate-700 hover:text-[#0d5f8a] px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#0d5f8a]/40 transition-all shadow-2xs flex items-center gap-1.5"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lead Capture CTA Card */}
                    {msg.suggestLeadCapture && !leadSubmitted && (
                      <div className="mt-2.5 w-[85%] bg-[#0d5f8a]/5 border border-[#0d5f8a]/20 rounded-2xl p-3.5 shadow-2xs">
                        <h4 className="text-xs font-bold text-slate-900">
                          Ingin Konsultasi Lebih Lanjut?
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Tinggalkan kontak bisnis Anda, konsultan kami akan menghubungi Anda.
                        </p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => setShowLeadModal(true)}
                            className="bg-[#0d5f8a] hover:bg-[#083c5a] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all"
                          >
                            Isi Form Konsultasi
                          </button>
                          <a
                            href={getWhatsAppUrl('Halo tim Inpartner, saya ingin konsultasi lebih lanjut terkait solusi bisnis.')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-2xs transition-all"
                          >
                            <Phone className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-xl bg-[#0d5f8a] flex items-center justify-center p-0.5 shrink-0 shadow-2xs mt-1 ring-1 ring-black/5">
                      <ChatbotIcon className="w-5 h-5" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#0d5f8a] animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-[#0d5f8a] animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#0d5f8a] animate-bounce [animation-delay:0.4s]"></div>
                        <span className="text-xs text-slate-500 font-medium ml-1.5">
                          Thinking...
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
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-xs sm:text-sm pl-4 pr-12 py-3 rounded-2xl border border-slate-200/80 focus:border-[#0d5f8a] focus:ring-2 focus:ring-[#0d5f8a]/15 focus:outline-none transition-all placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-300 bg-[#0d5f8a] hover:bg-[#083c5a] text-white cursor-pointer active:scale-95 shadow-xs"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Disclaimer Matching Screenshot */}
            <div className="text-center text-[11px] text-slate-400 mt-2 font-normal tracking-tight">
              AI can make mistakes. Double-check replies.
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-300" />
                  Jadwalkan Konsultasi Bisnis
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tim kami akan menganalisis kebutuhan Anda dan menghubungi kembali.
                </p>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                    Nama Perusahaan
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
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="nama@perusahaan.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kebutuhan Utama <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leadForm.businessNeed}
                  onChange={(e) => setLeadForm({ ...leadForm, businessNeed: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Pilih Kebutuhan --</option>
                  <option value="Profitability & Cost Optimization">Profitability & Margin Optimization</option>
                  <option value="Funding & Investment Advisory">Funding & Investment Advisory</option>
                  <option value="Business Growth & Market Expansion">Business Growth & Market Expansion</option>
                  <option value="Capacity Building">Capacity Building / Executive Program</option>
                  <option value="Other Consulting Service">Layanan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Kebutuhan Tambahan
                </label>
                <textarea
                  rows={3}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Ceritakan gambaran singkat kebutuhan atau tantangan Anda..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0d5f8a] focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lead-consent"
                  checked={leadForm.consent}
                  onChange={(e) => setLeadForm({ ...leadForm, consent: e.target.checked })}
                  className="mt-0.5 rounded text-[#0d5f8a] focus:ring-[#0d5f8a]"
                />
                <label htmlFor="lead-consent" className="text-[11px] text-slate-600 leading-snug">
                  Saya bersedia dihubungi untuk tindak lanjut dan memahami data saya disimpan secara aman.
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
                  {leadSubmitting ? 'Mengirim Data...' : 'Kirim Informasi'}
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
