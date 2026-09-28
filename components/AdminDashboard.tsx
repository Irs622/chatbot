'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Building,
  FileText,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  Copy,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertCircle,
  PhoneCall,
  Share2,
  Info,
  ChevronUp,
  UserCheck,
  Smile,
  X
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/db';

// Avatar background palette matching Figma design
const AVATAR_COLORS = [
  { bg: '#CDAABB', border: '#A88D9A', text: '#FFFFFF' },
  { bg: '#5FA0BE', border: '#558BA4', text: '#FFFFFF' },
  { bg: '#6FA672', border: '#628B64', text: '#FFFFFF' },
  { bg: '#BE905F', border: '#A88055', text: '#FFFFFF' },
  { bg: '#AA7FB9', border: '#8E6C9A', text: '#FFFFFF' }
];

// Helper: Format phone number cleanly (e.g. 0812-3456-7890 or +62 812-3456-7890)
function formatPhoneNumber(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+62')) {
    const rest = clean.slice(3);
    if (rest.length >= 9) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
    return clean;
  }
  if (clean.startsWith('62')) {
    const rest = clean.slice(2);
    if (rest.length >= 9) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
    return `+${clean}`;
  }
  if (clean.startsWith('0')) {
    if (clean.length >= 10) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
    }
  }
  return phone;
}

// Helper: Clean phone number for WhatsApp URL
function getWhatsAppCleanNumber(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  return clean;
}

// Helper: Friendly relative date (e.g. "Just now", "2 hours ago", "Yesterday")
function formatFriendlyDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPillar, setFilterPillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadConversation, setSelectedLeadConversation] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<number>(0);
  const [customGreeting, setCustomGreeting] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState<boolean>(true);
  const [showGuideBanner, setShowGuideBanner] = useState<boolean>(true);

  const fetchLeadsAndConversations = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, convsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/conversations')
      ]);

      const leadsData = await leadsRes.json();
      const convsData = await convsRes.json();

      if (leadsData.leads) {
        setLeads(leadsData.leads);
        if (!selectedLead && leadsData.leads.length > 0) {
          handleSelectLead(leadsData.leads[0], convsData.conversations || []);
        } else if (selectedLead) {
          const updated = leadsData.leads.find((l: Lead) => l.id === selectedLead.id);
          if (updated) {
            setSelectedLead(updated);
            setInternalNote(updated.notes || '');
          }
        }
      }
      if (convsData.conversations) setConversations(convsData.conversations);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndConversations();
  }, []);

  const handleSelectLead = (lead: Lead, convList: any[] = conversations) => {
    setSelectedLead(lead);
    setInternalNote(lead.notes || '');
    setNoteSavedFeedback(false);

    if (lead.conversation_id) {
      const matched = convList.find(
        (c) => c.conversation?.id === lead.conversation_id || c.id === lead.conversation_id
      );
      setSelectedLeadConversation(matched || null);
    } else {
      setSelectedLeadConversation(null);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(data.lead);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedLead.status, notes: internalNote })
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? data.lead : l)));
        setSelectedLead(data.lead);
        setNoteSavedFeedback(true);
        setTimeout(() => setNoteSavedFeedback(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save internal note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Quick 1-click note tag appender for non-dev consultants
  const handleAppendNoteTag = (tag: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const lineToAdd = `[${timestamp}] ${tag}`;
    const newNote = internalNote.trim() ? `${internalNote}\n${lineToAdd}` : lineToAdd;
    setInternalNote(newNote);
  };

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // 1-Click WhatsApp Group Summary Generator for Team
  const handleCopyTeamSummary = () => {
    if (!selectedLead) return;
    const cleanPhone = formatPhoneNumber(selectedLead.phone);
    const dateFormatted = new Date(selectedLead.created_at).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const summaryText = `📌 *INPARTNER INBOUND CLIENT INQUIRY*
━━━━━━━━━━━━━━━━━━━━
👤 *Client Name:* ${selectedLead.name}
🏢 *Company:* ${selectedLead.company || 'Direct Business Owner'}
📞 *WhatsApp / Phone:* ${cleanPhone}
✉️ *Email:* ${selectedLead.email || 'Not provided'}
💼 *Advisory Topic:* ${selectedLead.business_need}
📝 *Client Notes:* "${selectedLead.notes || 'Submitted via inpartner.id consultation form'}"
🕒 *Received:* ${dateFormatted} WIB
━━━━━━━━━━━━━━━━━━━━
👉 *Status:* ${selectedLead.status.toUpperCase()}
🔗 *Open in WhatsApp:* https://wa.me/${getWhatsAppCleanNumber(selectedLead.phone)}`;

    handleCopyText(summaryText, 'team_summary');
  };

  // Outreach message templates crafted for business development & partners
  const outreachTemplates = useMemo(() => {
    if (!selectedLead) return [];
    const name = selectedLead.name;
    const need = selectedLead.business_need;
    const company = selectedLead.company ? `di ${selectedLead.company}` : '';

    return [
      {
        id: 0,
        badge: 'WA Formal (ID)',
        title: 'Sapaan Resmi (ID)',
        text: `Halo Bapak/Ibu ${name}, terima kasih telah menghubungi Inpartner Consulting via website kami (inpartner.id) mengenai konsultasi ${need}. Saya dari tim corporate advisory Inpartner. Apakah ada waktu luang hari ini atau besok untuk berdiskusi singkat terkait kebutuhan ${company || 'perusahaan Anda'}?`
      },
      {
        id: 1,
        badge: 'WA English (EN)',
        title: 'Executive Intro (EN)',
        text: `Hello ${name}, thank you for reaching out to Inpartner Consulting regarding your inquiry on ${need}. I am following up from our corporate advisory partner team. Would you have 15 minutes this week for an introductory discovery call to discuss your objectives?`
      },
      {
        id: 2,
        badge: 'Zoom / Meeting',
        title: 'Jadwal Diskusi',
        text: `Halo Bapak/Ibu ${name}, kami telah menerima detail kebutuhan konsultasi Anda terkait ${need}. Tim managing partner Inpartner siap menjadwalkan sesi discovery meeting (tatap muka atau Zoom). Boleh kami tahu hari dan jam yang paling nyaman untuk Anda?`
      },
      {
        id: 3,
        badge: 'Brochure / Deck',
        title: 'Kirim Profil & Deck',
        text: `Halo Bapak/Ibu ${name}, salam dari Inpartner Consulting. Kami memiliki rekam jejak dan proposal solusi untuk ${need}. Apakah nomor WhatsApp ini tepat untuk kami kirimkan dokumen ringkas profil perusahaan dan studi kasus kami?`
      }
    ];
  }, [selectedLead]);

  // Keep custom greeting in sync when switching templates
  useEffect(() => {
    if (outreachTemplates[activeTemplate]) {
      setCustomGreeting(outreachTemplates[activeTemplate].text);
    }
  }, [activeTemplate, outreachTemplates]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
      const matchesPillar =
        filterPillar === 'all' ||
        l.business_need.toLowerCase().includes(filterPillar.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.business_need.toLowerCase().includes(q);

      return matchesStatus && matchesPillar && matchesQuery;
    });
  }, [leads, filterStatus, filterPillar, searchQuery]);

  // Lead Counts by Status for quick filter buttons
  const counts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      in_progress: leads.filter((l) => l.status === 'in_progress').length,
      converted: leads.filter((l) => l.status === 'converted').length,
      closed: leads.filter((l) => l.status === 'closed').length
    };
  }, [leads]);

  // Clean CSV Export formatted for Microsoft Excel & Google Sheets
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      'Inquiry ID',
      'Date Received',
      'Client Name',
      'Company Name',
      'WhatsApp / Phone',
      'Email Address',
      'Advisory Scope Needed',
      'Follow-up Status',
      'Consultant Notes'
    ];
    const escapeCsv = (val?: string | null) => {
      if (!val) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=+@\-\t\r]/.test(str)) str = `'${str}`;
      return `"${str}"`;
    };
    const rows = filteredLeads.map((lead) => [
      `"#${lead.id.slice(-6).toUpperCase()}"`,
      escapeCsv(new Date(lead.created_at).toLocaleString('en-GB')),
      escapeCsv(lead.name),
      escapeCsv(lead.company || 'Direct Owner'),
      `="${formatPhoneNumber(lead.phone)}"`,
      escapeCsv(lead.email || '-'),
      escapeCsv(lead.business_need),
      escapeCsv(lead.status),
      escapeCsv(lead.notes || '-')
    ].join(','));

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inpartner-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess(`Downloaded ${filteredLeads.length} client inquiries to Excel (.csv)`);
    setTimeout(() => setExportSuccess(null), 3500);
  };

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* 0. Consultant & Business Development Quick Guide Banner (Non-Dev Friendly) */}
      {showGuideBanner && (
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.04)] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#CEEBF9] border border-[#5FA0BE]/40 flex items-center justify-center text-[#5FA0BE] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#747374] flex items-center gap-2">
                <span>Welcome to Inpartner Inbound Inquiries Portal</span>
                <span className="bg-[#DCF1DD] text-[#3E7A41] text-[10px] font-semibold px-2 py-0.5 rounded-[4px]">
                  Team Guide
                </span>
              </h4>
              <p className="text-[11px] text-[#8B8B8B] mt-1 leading-relaxed">
                This portal tracks business owners and corporate decision-makers who requested consultations on <strong>inpartner.id</strong>. 
                Click any client to send a <strong>pre-filled WhatsApp greeting</strong>, copy their details for your team WhatsApp group, or record follow-up notes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGuideBanner(false)}
            className="text-[#8B8B8B] hover:text-[#747374] text-xs p-1 cursor-pointer shrink-0"
            title="Dismiss guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Top Metric Cards Row (Figma Stat Cards #F5F5F5 style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Stat Card 1: Total Inquiries */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-3.5 sm:p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[104px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            Total Inquiries
          </div>
          <div className="flex items-baseline gap-1 text-[#5FA0BE] font-bold text-xl tracking-tight">
            <span>{counts.all}</span>
            <span className="text-xs text-[#8B8B8B] font-normal">clients</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8B8B8B]">
            <span>All website leads</span>
            <span className="text-[#6FA672] font-semibold text-[10px] bg-[#DCF1DD] px-1.5 py-0.5 rounded-[4px]">
              Live 24/7
            </span>
          </div>
        </div>

        {/* Stat Card 2: Needs Response (Critical for BD) */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-3.5 sm:p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[104px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide flex items-center justify-between">
            <span>Needs Reply</span>
            {counts.new > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#BE5F5F] animate-pulse" />
            )}
          </div>
          <div className="text-[#BE5F5F] font-bold text-xl tracking-tight">
            {counts.new}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8B8B8B]">
            <span>Uncontacted</span>
            <span className="text-[#BE5F5F] font-semibold text-[10px] bg-[#F8E0E0] px-1.5 py-0.5 rounded-[4px]">
              Action today
            </span>
          </div>
        </div>

        {/* Stat Card 3: In Discussion */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-3.5 sm:p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[104px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            In Discussion
          </div>
          <div className="text-[#5FA0BE] font-bold text-xl tracking-tight">
            {counts.contacted + counts.in_progress}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8B8B8B]">
            <span>Being followed up</span>
            <span className="text-[#5FA0BE] font-semibold text-[10px] bg-[#CEEBF9] px-1.5 py-0.5 rounded-[4px]">
              Active
            </span>
          </div>
        </div>

        {/* Stat Card 4: Qualified / Won Deals */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-3.5 sm:p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[104px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            Qualified Clients
          </div>
          <div className="text-[#3E7A41] font-bold text-xl tracking-tight">
            {counts.converted}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8B8B8B]">
            <span>Proposal stage</span>
            <span className="text-[#3E7A41] font-semibold text-[10px] bg-[#DCF1DD] px-1.5 py-0.5 rounded-[4px]">
              High intent
            </span>
          </div>
        </div>

        {/* Stat Card 5: Top Advisory Topic */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-3.5 sm:p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between h-[104px] col-span-2 sm:col-span-1">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            Top Service Topic
          </div>
          <div className="text-[#747374] font-semibold text-xs truncate">
            Profitability & Margin
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8B8B8B]">
            <span>4 Pillars Active</span>
            <span className="text-[#5FA0BE] font-semibold text-[10px]">Inpartner AI</span>
          </div>
        </div>
      </div>

      {/* Export notification toast */}
      {exportSuccess && (
        <div className="bg-[#DCF1DD] border border-[#6FA672]/40 text-[#3E7A41] text-xs px-4 py-2.5 rounded-[10px] flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3E7A41]" />
            <span>{exportSuccess}</span>
          </div>
          <button onClick={() => setExportSuccess(null)} className="cursor-pointer text-xs font-bold">✕</button>
        </div>
      )}

      {/* 2. Main Inquiries Table Card (Figma Style #F5F5F5) */}
      <div className="bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Header: Quick Filter Tabs, Search & Export */}
        <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col gap-3 border-b border-[#E3E3E3]">
          {/* Top Row: Title + Status Filter Pills for non-devs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[#747374] text-sm font-bold tracking-[0.7px]">
                Client Consultation Inquiries
              </h2>
              <span className="text-[11px] text-[#8B8B8B] bg-[#DFDFDF] px-2.5 py-0.5 rounded-full font-medium">
                {filteredLeads.length} inquiries
              </span>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterStatus('all')}
                className={`text-[11px] px-2.5 py-1 rounded-[5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'all'
                    ? 'bg-[#5FA0BE] text-white shadow-2xs'
                    : 'bg-white text-[#747374] border border-[#E3E3E3] hover:bg-[#EAEAEA]'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                onClick={() => setFilterStatus('new')}
                className={`text-[11px] px-2.5 py-1 rounded-[5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'new'
                    ? 'bg-[#BE5F5F] text-white shadow-2xs'
                    : 'bg-white text-[#BE5F5F] border border-[#E3E3E3] hover:bg-[#F8E0E0]'
                }`}
              >
                🔴 Needs Reply ({counts.new})
              </button>
              <button
                onClick={() => setFilterStatus('contacted')}
                className={`text-[11px] px-2.5 py-1 rounded-[5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'contacted'
                    ? 'bg-[#BE905F] text-white shadow-2xs'
                    : 'bg-white text-[#747374] border border-[#E3E3E3] hover:bg-[#EAEAEA]'
                }`}
              >
                🟡 Contacted ({counts.contacted})
              </button>
              <button
                onClick={() => setFilterStatus('converted')}
                className={`text-[11px] px-2.5 py-1 rounded-[5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'converted'
                    ? 'bg-[#3E7A41] text-white shadow-2xs'
                    : 'bg-white text-[#3E7A41] border border-[#E3E3E3] hover:bg-[#DCF1DD]'
                }`}
              >
                🟢 Qualified ({counts.converted})
              </button>
            </div>
          </div>

          {/* Bottom Row: Search Box, Advisory Pillar Filter, Download CSV */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#747374]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, company, WhatsApp number, topic..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[5px] border border-[#E3E3E3] bg-white text-[#747374] placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#5FA0BE]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Filter by Advisory Pillar */}
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-[5px] border border-[#E3E3E3] bg-white text-[#747374] focus:outline-none cursor-pointer"
              >
                <option value="all">All Advisory Services</option>
                <option value="growth">Business Growth & Market</option>
                <option value="profitability">Profitability & Margin</option>
                <option value="funding">Funding & Investment</option>
                <option value="capacity">Executive Program</option>
              </select>

              {/* Download CSV / Excel */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EAEAEA] text-[#747374] text-xs font-semibold rounded-[5px] border border-[#DADADA] shadow-[0px_2px_4px_rgba(0,0,0,0.04)] transition-all cursor-pointer whitespace-nowrap"
                title="Download spreadsheet to open in Microsoft Excel or Google Sheets"
              >
                <Download className="w-3.5 h-3.5 text-[#5FA0BE]" />
                <span>Download to Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-3.5 sm:p-4">
          <div className="rounded-[5px] border border-[#E3E3E3] overflow-hidden bg-white">
            <table className="w-full text-left text-xs text-[#747374]">
              {/* Header row matching Figma background #DFDFDF */}
              <thead className="bg-[#DFDFDF] text-[#747374] font-bold text-[11px] tracking-[0.6px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Ref</th>
                  <th className="py-2.5 px-3">Client & Company</th>
                  <th className="py-2.5 px-3">Advisory Need</th>
                  <th className="py-2.5 px-3">Phone / WhatsApp</th>
                  <th className="py-2.5 px-3">Received</th>
                  <th className="py-2.5 px-3">Follow-up Status</th>
                  <th className="py-2.5 px-3 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E3E3]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#8B8B8B]">
                      No inquiry records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => {
                    const avatarStyle = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const isSelected = selectedLead?.id === lead.id;
                    const cleanPhone = getWhatsAppCleanNumber(lead.phone);
                    const formattedPhone = formatPhoneNumber(lead.phone);
                    const waGreeting = encodeURIComponent(
                      `Halo Bapak/Ibu ${lead.name}, terima kasih telah menghubungi Inpartner Consulting via website kami mengenai ${lead.business_need}. Boleh kami tahu waktu yang tepat untuk berdiskusi singkat?`
                    );
                    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waGreeting}` : '';

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EAEAEA]/80 font-medium' : 'hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {/* No */}
                        <td className="py-2.5 px-3 text-center text-[#8B8B8B] font-medium text-[11px]">
                          {idx + 1}.
                        </td>

                        {/* Ref ID */}
                        <td className="py-2.5 px-3 font-semibold text-[#8B8B8B] font-mono text-[11px]">
                          #{lead.id.slice(-6).toUpperCase()}
                        </td>

                        {/* Customer Avatar & Name */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              style={{
                                backgroundColor: avatarStyle.bg,
                                borderColor: avatarStyle.border,
                                color: avatarStyle.text
                              }}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0"
                            >
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-[#747374]">{lead.name}</div>
                              <div className="text-[10px] text-[#8B8B8B]">
                                {lead.company || 'Business Owner'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Advisory Scope */}
                        <td className="py-2.5 px-3 text-[#747374]">
                          <span className="line-clamp-1 max-w-[200px] text-[11px]">
                            {lead.business_need}
                          </span>
                        </td>

                        {/* WhatsApp / Phone formatted */}
                        <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#747374]">
                            <span>{formattedPhone}</span>
                            <button
                              onClick={() => handleCopyText(lead.phone, `phone_${lead.id}`)}
                              className="text-[#8B8B8B] hover:text-[#5FA0BE] p-0.5"
                              title="Copy phone number"
                            >
                              {copiedField === `phone_${lead.id}` ? (
                                <Check className="w-3 h-3 text-[#3E7A41]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Date Received */}
                        <td className="py-2.5 px-3 text-[#8B8B8B] whitespace-nowrap text-[11px]">
                          <div title={new Date(lead.created_at).toLocaleString('en-GB')}>
                            {formatFriendlyDate(lead.created_at)}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {lead.status === 'new' && (
                            <span className="inline-flex items-center gap-1 text-[#BE5F5F] font-bold text-[11px] bg-[#F8E0E0] px-2 py-0.5 rounded-[4px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#BE5F5F] animate-pulse" />
                              Needs Reply
                            </span>
                          )}
                          {lead.status === 'contacted' && (
                            <span className="inline-flex items-center gap-1 text-[#BE905F] font-semibold text-[11px] bg-[#F5ECE1] px-2 py-0.5 rounded-[4px]">
                              Contacted
                            </span>
                          )}
                          {lead.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 text-[#5FA0BE] font-semibold text-[11px] bg-[#CEEBF9] px-2 py-0.5 rounded-[4px]">
                              In Discussion
                            </span>
                          )}
                          {lead.status === 'converted' && (
                            <span className="inline-flex items-center gap-1 text-[#3E7A41] font-semibold text-[11px] bg-[#DCF1DD] px-2 py-0.5 rounded-[4px]">
                              Qualified
                            </span>
                          )}
                          {lead.status === 'closed' && (
                            <span className="inline-flex items-center gap-1 text-[#8B8B8B] font-semibold text-[11px] bg-[#EAEAEA] px-2 py-0.5 rounded-[4px]">
                              Closed / Won
                            </span>
                          )}
                        </td>

                        {/* Action with 3 colored square buttons matching Figma */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Blue Square: 1-Click WhatsApp */}
                            <a
                              href={waUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 rounded-[5px] bg-[#CEEBF9] border border-[#5FA0BE]/40 flex items-center justify-center hover:scale-105 transition-transform"
                              title="1-Click Chat on WhatsApp with pre-filled greeting"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#457D97]" />
                            </a>

                            {/* Green Square: Email Client */}
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}?subject=Inpartner Consulting - Advisory Follow-up for ${encodeURIComponent(lead.name)}`}
                                className="w-6 h-6 rounded-[5px] bg-[#DCF1DD] border border-[#84BFB5]/50 flex items-center justify-center hover:scale-105 transition-transform"
                                title="Send Email to Client"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#3E7A41]" />
                              </a>
                            ) : (
                              <div className="w-6 h-6 rounded-[5px] bg-[#EAEAEA] flex items-center justify-center opacity-40">
                                <Mail className="w-3.5 h-3.5 text-[#8B8B8B]" />
                              </div>
                            )}

                            {/* Red Square: Open Dossier Details */}
                            <button
                              onClick={() => handleSelectLead(lead)}
                              className="w-6 h-6 rounded-[5px] bg-[#F8E0E0] border border-[#DE7E7E]/50 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                              title="View full client inquiry & notes"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#DE7E7E]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer with Pagination info matching Figma layout */}
        <div className="px-4 py-2.5 border-t border-[#E3E3E3] flex items-center justify-between text-xs text-[#8B8B8B]">
          <span>Showing {filteredLeads.length} of {leads.length} client inquiries</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="w-6 h-6 bg-white rounded-[3px] border border-[#DADADA] flex items-center justify-center text-[#B3AEAE] disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled
              className="w-6 h-6 bg-white rounded-[3px] border border-[#DADADA] flex items-center justify-center text-[#B3AEAE] disabled:opacity-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Pipeline Progress & Selected Lead Action Desk (Figma bottom cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Card: 4 Advisory Pillars Demand & Quick Reference (5 cols) */}
        <div className="lg:col-span-5 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3">
            <div>
              <h3 className="text-[#747374] text-xs font-bold tracking-[0.7px]">
                Advisory Service Demand
              </h3>
              <p className="text-[10px] text-[#8B8B8B] mt-0.5">Distribution of client requests</p>
            </div>
            <span className="text-[10px] text-[#5FA0BE] bg-[#CEEBF9] font-semibold px-2 py-0.5 rounded-[4px]">
              4 Pillars
            </span>
          </div>

          {/* Progress Bars for Pillars */}
          <div className="space-y-3.5 pt-1">
            {/* Pillar 1: Growth */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium text-[11px]">Business Growth & Market Expansion</span>
                <span className="text-[#3E7A41] font-bold text-xs">36%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#3E7A41] h-full rounded-[10px]" style={{ width: '36%' }} />
              </div>
            </div>

            {/* Pillar 2: Funding */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium text-[11px]">Funding & Capital Advisory</span>
                <span className="text-[#5FA0BE] font-bold text-xs">28%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#5FA0BE] h-full rounded-[10px]" style={{ width: '28%' }} />
              </div>
            </div>

            {/* Pillar 3: Profitability */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium text-[11px]">Profitability & Margin Optimization</span>
                <span className="text-[#BE905F] font-bold text-xs">20%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#BE905F] h-full rounded-[10px]" style={{ width: '20%' }} />
              </div>
            </div>

            {/* Pillar 4: Capacity */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium text-[11px]">Executive Business Program</span>
                <span className="text-[#94839D] font-bold text-xs">16%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#94839D] h-full rounded-[10px]" style={{ width: '16%' }} />
              </div>
            </div>
          </div>

          {/* Quick Best Practice for Non-Dev Team */}
          <div className="mt-4 pt-3.5 border-t border-[#E3E3E3] space-y-2">
            <span className="text-xs font-bold text-[#747374] block">
              💡 Advisory Team Follow-Up Protocol:
            </span>
            <ul className="text-[11px] text-[#8B8B8B] space-y-1.5 list-disc list-inside leading-relaxed">
              <li><strong>Step 1:</strong> Reply via WhatsApp within 15 minutes of submission.</li>
              <li><strong>Step 2:</strong> Clarify business scope & invite to a 20-minute discovery call.</li>
              <li><strong>Step 3:</strong> Click <em>&quot;Copy Summary for Team&quot;</em> to alert relevant partner.</li>
              <li><strong>Step 4:</strong> Advance status to <em>&quot;Contacted&quot;</em> or <em>&quot;In Discussion&quot;</em>.</li>
            </ul>
          </div>
        </div>

        {/* Right Card: Selected Lead Action Desk & Outreach Toolkit (7 cols) */}
        <div className="lg:col-span-7 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-4 sm:p-5 space-y-4">
          {selectedLead ? (
            <>
              {/* Dossier Header with Name, Phone, and 1-Click Copy Team Summary */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E3E3E3] pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#747374]">
                      {selectedLead.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#8B8B8B] bg-white px-2 py-0.5 rounded border border-[#E3E3E3]">
                      #{selectedLead.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B8B8B] flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-[#5FA0BE]" />
                    <span>{selectedLead.company || 'Direct Business Owner'}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-[#8B8B8B]" />
                    <span>{formatFriendlyDate(selectedLead.created_at)}</span>
                  </p>
                </div>

                {/* 1-Click Button: Copy Summary for Team WhatsApp Group */}
                <button
                  onClick={handleCopyTeamSummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#CEEBF9]/50 text-[#5FA0BE] text-xs font-semibold rounded-[5px] border border-[#5FA0BE]/40 shadow-xs transition-all cursor-pointer whitespace-nowrap self-start"
                  title="Copy a nicely formatted bullet summary ready to paste into team WhatsApp group"
                >
                  {copiedField === 'team_summary' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3E7A41]" />
                      <span className="text-[#3E7A41]">Copied for WA Group!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#5FA0BE]" />
                      <span>📋 Copy Summary for Team</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Stepper Buttons (Easy 1-click for non-devs) */}
              <div className="bg-white p-3 rounded-[8px] border border-[#E3E3E3] space-y-1.5">
                <span className="text-[11px] font-semibold text-[#8B8B8B] block">
                  Click to Update Follow-up Stage:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'new', label: 'Needs Reply', color: 'bg-[#BE5F5F]' },
                    { id: 'contacted', label: 'Contacted', color: 'bg-[#BE905F]' },
                    { id: 'in_progress', label: 'In Discussion', color: 'bg-[#5FA0BE]' },
                    { id: 'converted', label: 'Qualified', color: 'bg-[#3E7A41]' },
                    { id: 'closed', label: 'Closed / Won', color: 'bg-[#747374]' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleStatusChange(selectedLead.id, st.id as LeadStatus)}
                      disabled={updatingStatus}
                      className={`text-[10px] py-1.5 px-2 rounded-[5px] font-semibold transition-all cursor-pointer text-center ${
                        selectedLead.status === st.id
                          ? `${st.color} text-white shadow-xs`
                          : 'bg-[#F5F5F5] text-[#747374] border border-[#E3E3E3] hover:bg-[#EAEAEA]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Click Outreach Toolkit: Pre-crafted Greetings */}
              <div className="space-y-2.5 bg-white p-3.5 rounded-[8px] border border-[#E3E3E3]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#3E7A41]" />
                    <span>WhatsApp Outreach Message:</span>
                  </span>
                  {/* Template Switcher Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {outreachTemplates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTemplate(t.id);
                          setCustomGreeting(t.text);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-[4px] cursor-pointer whitespace-nowrap transition-colors ${
                          activeTemplate === t.id
                            ? 'bg-[#5FA0BE] text-white font-semibold'
                            : 'text-[#8B8B8B] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Greeting Box */}
                <textarea
                  rows={3}
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-[6px] border border-[#E3E3E3] bg-[#F9F9F9] text-[#747374] focus:outline-none focus:border-[#5FA0BE] focus:bg-white leading-relaxed resize-none"
                  placeholder="Personalize your greeting message before sending..."
                />

                {/* Action Buttons: Open WhatsApp, Email, Phone Call */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a
                    href={`https://wa.me/${getWhatsAppCleanNumber(selectedLead.phone)}?text=${encodeURIComponent(
                      customGreeting
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-1.5 py-2 px-3 bg-[#3E7A41] hover:bg-[#346737] text-white rounded-[5px] text-xs font-semibold transition-all shadow-xs"
                    title="Open WhatsApp Web or WhatsApp Desktop with this message"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp ({formatPhoneNumber(selectedLead.phone)})</span>
                  </a>

                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(
                        `Inpartner Consulting - Consultation Inquiry (${selectedLead.name})`
                      )}&body=${encodeURIComponent(customGreeting)}`}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-[#747374] border border-[#DADADA] rounded-[5px] text-xs font-semibold flex items-center gap-1"
                      title="Send email via your email client"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#5FA0BE]" />
                      <span>Email</span>
                    </a>
                  )}

                  <a
                    href={`tel:${selectedLead.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-[#747374] border border-[#DADADA] rounded-[5px] text-xs font-semibold flex items-center gap-1"
                    title="Direct call"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#747374]" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Client Original Inquiry Details */}
              <div className="space-y-2 text-xs text-[#747374] bg-white p-3.5 rounded-[8px] border border-[#E3E3E3]">
                <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-1.5">
                  <span className="text-[#8B8B8B]">Requested Advisory Pillar:</span>
                  <span className="font-semibold text-[#5FA0BE]">{selectedLead.business_need}</span>
                </div>
                {selectedLead.notes && (
                  <div className="pt-1">
                    <span className="text-[#8B8B8B] block mb-1 text-[11px] font-medium">
                      Visitor&apos;s Submitted Challenge / Notes:
                    </span>
                    <p className="bg-[#F9F9F9] p-2.5 rounded-[6px] border border-[#E3E3E3] italic text-xs leading-relaxed text-[#747374]">
                      &quot;{selectedLead.notes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Internal Consultant Notes with Quick Tag Shortcuts */}
              <div className="space-y-2 bg-white p-3.5 rounded-[8px] border border-[#E3E3E3]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#747374]">Internal Consultant Notes</span>
                  {noteSavedFeedback && (
                    <span className="text-xs text-[#3E7A41] font-semibold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Note Saved!
                    </span>
                  )}
                </div>

                {/* 1-Click Quick Note Tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="text-[10px] text-[#8B8B8B] shrink-0">Quick tags:</span>
                  {[
                    'Called (No answer)',
                    'Sent WA follow-up',
                    'Discovery call booked',
                    'Proposal sent',
                    'Follow up Monday'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAppendNoteTag(tag)}
                      className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#747374] border border-[#E3E3E3] whitespace-nowrap cursor-pointer transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Record consultant observations, discussion summary, or scheduled follow-up dates..."
                  className="w-full text-xs p-2.5 rounded-[5px] border border-[#E3E3E3] bg-[#F9F9F9] focus:bg-white text-[#747374] focus:outline-none focus:border-[#5FA0BE]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  className="w-full py-2 bg-[#747374] hover:bg-[#5a595a] text-white text-xs font-semibold rounded-[5px] transition-all cursor-pointer shadow-xs"
                >
                  {savingNote ? 'Saving Notes...' : '💾 Save Internal Note'}
                </button>
              </div>

              {/* Chatbot Conversation Transcript Stream */}
              <div className="bg-white p-3.5 rounded-[8px] border border-[#E3E3E3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#747374] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#5FA0BE]" />
                    <span>Website Chatbot Conversation Transcript</span>
                  </span>
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-[11px] text-[#5FA0BE] hover:underline cursor-pointer"
                  >
                    {showTranscript ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showTranscript && (
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-[#F9F9F9] p-3 rounded-[6px] border border-[#E3E3E3] text-xs">
                    {selectedLeadConversation?.messages?.length > 0 ? (
                      selectedLeadConversation.messages.map((m: any) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-[5px] text-[11px] leading-relaxed ${
                            m.sender === 'user'
                              ? 'bg-[#EAEAEA] text-[#747374] ml-4'
                              : 'bg-white text-[#747374] border border-[#E3E3E3] mr-4 shadow-2xs'
                          }`}
                        >
                          <span className="font-bold text-[9px] uppercase block mb-0.5 text-[#8B8B8B]">
                            {m.sender === 'user' ? 'Client' : 'Inpartner AI Assistant'}:
                          </span>
                          <div>{m.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[#8B8B8B] text-xs">
                        This client submitted their inquiry directly via the consultation form.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-[#8B8B8B] text-xs">
              Select an inquiry row from the table above to view client details and outreach tools.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
