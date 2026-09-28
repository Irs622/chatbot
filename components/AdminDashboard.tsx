'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/db';

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
  const [sortField, setSortField] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeTemplate, setActiveTemplate] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        // Preserve or auto-select first lead
        if (!selectedLead && leadsData.leads.length > 0) {
          handleSelectLead(leadsData.leads[0], convsData.conversations || []);
        } else if (selectedLead) {
          const updatedSelected = leadsData.leads.find((l: Lead) => l.id === selectedLead.id);
          if (updatedSelected) {
            setSelectedLead(updatedSelected);
            setInternalNote(updatedSelected.notes || '');
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
      const matched = convList.find((c) => c.conversation?.id === lead.conversation_id || c.id === lead.conversation_id);
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

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyDossier = () => {
    if (!selectedLead) return;
    const dossier = [
      `💼 INPARTNER ADVISORY LEAD DOSSIER`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Client Name: ${selectedLead.name}`,
      `Company: ${selectedLead.company || 'Direct / Enterprise'}`,
      `Phone/WhatsApp: ${selectedLead.phone}`,
      `Email: ${selectedLead.email || 'N/A'}`,
      `Advisory Need: ${selectedLead.business_need}`,
      `Status: ${selectedLead.status.toUpperCase()}`,
      `Date: ${new Date(selectedLead.created_at).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB`,
      selectedLead.notes ? `\nClient Notes:\n"${selectedLead.notes}"` : '',
      `\nDirect WhatsApp: https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`
    ].filter(Boolean).join('\n');

    handleCopyText(dossier, 'dossier');
  };

  // Outreach WhatsApp Templates
  const outreachTemplates = useMemo(() => {
    if (!selectedLead) return [];
    const name = selectedLead.name;
    const need = selectedLead.business_need;

    return [
      {
        id: 0,
        title: 'Initial Acknowledgment',
        text: `Hello ${name}, thank you for reaching out to Inpartner (inpartner.id) regarding your corporate inquiry on ${need}. I am following up to understand your current operational objectives and discuss how our advisory partners can assist. Would you have 15 minutes for an introductory conversation?`
      },
      {
        id: 1,
        title: 'Discovery Meeting Invite',
        text: `Dear ${name}, following your advisory consultation request for ${need} on inpartner.id, our senior partner would like to invite you for an exploratory discovery session this week. Please let us know your preferred date and time.`
      },
      {
        id: 2,
        title: 'Advisory Deck & Brief',
        text: `Hi ${name}, this is the Inpartner corporate advisory team. We received your note regarding ${need}. I would be pleased to share our corporate credentials deck and case studies relevant to your industry. Would this number be best to send the PDF?`
      }
    ];
  }, [selectedLead]);

  // Filtering & Sorting
  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => {
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
          l.business_need.toLowerCase().includes(q) ||
          (l.notes && l.notes.toLowerCase().includes(q));

        return matchesStatus && matchesPillar && matchesQuery;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return sortOrder === 'desc' ? diff : -diff;
        }
        if (sortField === 'name') {
          return sortOrder === 'desc'
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        }
        if (sortField === 'status') {
          return sortOrder === 'desc'
            ? b.status.localeCompare(a.status)
            : a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [leads, filterStatus, filterPillar, searchQuery, sortField, sortOrder]);

  const handleExportCSV = (exportAll: boolean = false) => {
    const listToExport = exportAll ? leads : filteredLeads;

    if (listToExport.length === 0) {
      alert('No lead inquiries available for export.');
      return;
    }

    const headers = [
      'Lead Reference',
      'Date & Time (UTC+7)',
      'Client Name',
      'Company Name',
      'Phone / WhatsApp',
      'Email Address',
      'Advisory Pillar / Need',
      'Status',
      'Client Notes',
      'Direct WhatsApp Link'
    ];

    const escapeCsv = (val?: string | null) => {
      if (val === undefined || val === null) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=+@\-\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    const rows = listToExport.map((lead, idx) => {
      const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : '';
      const formattedDate = lead.created_at
        ? new Date(lead.created_at).toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        : '-';

      return [
        escapeCsv(`INP-${String(idx + 1).padStart(3, '0')}`),
        escapeCsv(formattedDate),
        escapeCsv(lead.name),
        escapeCsv(lead.company || 'Direct Client'),
        `="${lead.phone}"`,
        escapeCsv(lead.email || '-'),
        escapeCsv(lead.business_need),
        escapeCsv(lead.status),
        escapeCsv(lead.notes || '-'),
        escapeCsv(waLink)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const filename = `inpartner-advisory-leads-${now.toISOString().slice(0, 10)}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(`Exported ${listToExport.length} lead records to ${filename}`);
    setTimeout(() => setExportSuccess(null), 4000);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            NEW
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-2.5 h-2.5 text-amber-600" />
            CONTACTED
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw className="w-2.5 h-2.5 text-sky-600 animate-spin" />
            IN PROGRESS
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
            QUALIFIED
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  const getPillarBadge = (pillar: string) => {
    const p = pillar.toLowerCase();
    if (p.includes('growth') || p.includes('market')) {
      return <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">Business Growth</span>;
    }
    if (p.includes('funding') || p.includes('investment')) {
      return <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">Funding & Valuation</span>;
    }
    if (p.includes('profit') || p.includes('margin') || p.includes('cost')) {
      return <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">Profitability</span>;
    }
    if (p.includes('capacity') || p.includes('executive')) {
      return <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">Capacity Building</span>;
    }
    return <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{pillar}</span>;
  };

  // Pipeline Metrics Counts
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

  return (
    <div className="space-y-6">
      {/* 1. Sovereign Pipeline KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-white border-[#005DAD] ring-2 ring-[#005DAD]/15 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Inquiries</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            {counts.all}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">All captured leads</div>
        </button>

        <button
          onClick={() => setFilterStatus('new')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'new'
              ? 'bg-white border-rose-500 ring-2 ring-rose-500/15 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-rose-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
            <span>Uncontacted</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono tracking-tight">
            {counts.new}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-1">Needs outreach &lt; 24h</div>
        </button>

        <button
          onClick={() => setFilterStatus('contacted')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'contacted'
              ? 'bg-white border-amber-500 ring-2 ring-amber-500/15 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-amber-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600 font-medium">
            <span>Contacted</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono tracking-tight">
            {counts.contacted}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">Awaiting response</div>
        </button>

        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'in_progress'
              ? 'bg-white border-sky-500 ring-2 ring-sky-500/15 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-sky-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-sky-600 font-medium">
            <span>In Discussion</span>
            <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600 mt-1 font-mono tracking-tight">
            {counts.in_progress}
          </div>
          <div className="text-[11px] text-sky-600/80 mt-1">Active diagnostics</div>
        </button>

        <button
          onClick={() => setFilterStatus('converted')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'converted'
              ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/15 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-emerald-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
            <span>Qualified</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono tracking-tight">
            {counts.converted}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Retainer / Proposal</div>
        </button>
      </div>

      {/* Export Confirmation Alert */}
      {exportSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{exportSuccess}</span>
          </div>
          <button
            onClick={() => setExportSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Main Workspace: Leads Table (Left) + Deal Desk (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leads Filter & Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Controls Header */}
          <div className="p-4 border-b border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  id="leads-search-input"
                  name="leadsSearch"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter inquiries by name, company, notes... (Press / to search)"
                  aria-label="Search leads"
                  className="w-full text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-[#005DAD] focus:ring-1 focus:ring-[#005DAD] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={fetchLeadsAndConversations}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="Refresh leads list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => handleExportCSV(false)}
                  disabled={filteredLeads.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Export filtered records to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export ({filteredLeads.length})</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {(['all', 'new', 'contacted', 'in_progress', 'converted'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all whitespace-nowrap cursor-pointer ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                    <span className="ml-1 opacity-70 text-[10px] font-mono">
                      ({counts[st as keyof typeof counts] ?? 0})
                    </span>
                  </button>
                ))}
              </div>

              {/* Advisory Pillar Select */}
              <select
                id="leads-pillar-filter"
                name="filterPillar"
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                aria-label="Filter by advisory pillar"
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#005DAD] cursor-pointer shrink-0"
              >
                <option value="all">All Pillars</option>
                <option value="Growth">Business Growth</option>
                <option value="Funding">Funding & Valuation</option>
                <option value="Profit">Profitability</option>
                <option value="Capacity">Capacity Building</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto min-h-[380px]">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-4 font-mono">Ref</th>
                  <th className="py-2.5 px-4">Client & Company</th>
                  <th className="py-2.5 px-4">Advisory Pillar</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-medium text-xs text-slate-500">
                          No matching corporate inquiries found.
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Try adjusting your search criteria or filter status.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => {
                    const isSelected = selectedLead?.id === lead.id;
                    const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : '';

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-50/80 border-l-4 border-l-[#005DAD]'
                            : 'hover:bg-slate-50/90'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          #{String(idx + 1).padStart(3, '0')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {lead.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{lead.company || 'Direct / Enterprise'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getPillarBadge(lead.business_need)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                title="Open direct WhatsApp chat"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => handleSelectLead(lead)}
                              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                            >
                              Inspect &rarr;
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

          {/* Table Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Showing {filteredLeads.length} of {leads.length} records</span>
            <span>Sorted by {sortField} ({sortOrder.toUpperCase()})</span>
          </div>
        </div>

        {/* Right Column: Lead Detail & Deal Desk (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col space-y-5">
          {selectedLead ? (
            <>
              {/* Client Dossier Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                        {selectedLead.name}
                      </h3>
                      {getStatusBadge(selectedLead.status)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-[#005DAD]" />
                      <span>{selectedLead.company || 'Direct / Enterprise Client'}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleCopyDossier}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Copy full dossier for Slack / WhatsApp team sharing"
                  >
                    {copiedField === 'dossier' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy Brief</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pipeline Progression Stepper */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Pipeline Stage Progression
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                  {(
                    [
                      { key: 'new', label: '1. New' },
                      { key: 'contacted', label: '2. Contacted' },
                      { key: 'in_progress', label: '3. Diagnostic' },
                      { key: 'converted', label: '4. Qualified' }
                    ] as const
                  ).map((step) => {
                    const isActive = selectedLead.status === step.key;
                    return (
                      <button
                        key={step.key}
                        onClick={() => handleStatusChange(selectedLead.id, step.key as LeadStatus)}
                        disabled={updatingStatus}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate ${
                          isActive
                            ? 'bg-[#005DAD] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Outreach Toolkit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Consultant Outreach Toolkit
                  </label>
                  <span className="text-[10px] text-slate-400">1-Click Dispatch</span>
                </div>

                {/* Outreach Template Selector */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px]">
                  {outreachTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setActiveTemplate(tmpl.id)}
                      className={`py-1 px-2 rounded-lg font-medium transition-all truncate cursor-pointer ${
                        activeTemplate === tmpl.id
                          ? 'bg-white text-[#005DAD] shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>

                {/* Pre-crafted message preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-sans relative">
                  <p className="line-clamp-3 italic text-[11.5px]">
                    &quot;{outreachTemplates[activeTemplate]?.text}&quot;
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      outreachTemplates[activeTemplate]?.text || ''
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </a>

                  {selectedLead.email ? (
                    <a
                      href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(
                        `Inpartner Business Advisory Consultation - ${selectedLead.name}`
                      )}&body=${encodeURIComponent(outreachTemplates[activeTemplate]?.text || '')}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#005DAD] hover:bg-[#004785] active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Email</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center px-3 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium">
                      No email provided
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Particulars */}
              <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono text-[11px]">Phone / WhatsApp:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-mono">{selectedLead.phone}</span>
                    <button
                      onClick={() => handleCopyText(selectedLead.phone, 'phone')}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono text-[11px]">Email Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{selectedLead.email || '—'}</span>
                    {selectedLead.email && (
                      <button
                        onClick={() => handleCopyText(selectedLead.email, 'email')}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between">
                  <span className="text-slate-500 font-mono text-[11px]">Target Pillar:</span>
                  <div>{getPillarBadge(selectedLead.business_need)}</div>
                </div>

                {selectedLead.notes && (
                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-slate-500 font-mono text-[11px] block mb-1">
                      Client’s Submitted Scope:
                    </span>
                    <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 text-xs italic leading-relaxed">
                      &quot;{selectedLead.notes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Internal Consultant Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Internal Advisory Notes
                  </label>
                  {noteSavedFeedback && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>
                <textarea
                  id="lead-internal-notes"
                  name="internalNotes"
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Record consultant notes, scheduled call dates, or deal requirements..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#005DAD] focus:ring-1 focus:ring-[#005DAD] text-slate-800 transition-all resize-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {savingNote ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Note...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Consultant Note</span>
                    </>
                  )}
                </button>
              </div>

              {/* Associated Chat Conversation History */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#005DAD]" />
                    AI Consultation Transcript
                  </h4>
                  {selectedLeadConversation && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedLeadConversation.messages?.length || 0} messages
                    </span>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  {selectedLeadConversation && selectedLeadConversation.messages?.length > 0 ? (
                    selectedLeadConversation.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-xl text-[11.5px] leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-[#005DAD] text-white ml-6 shadow-2xs'
                            : 'bg-white text-slate-800 border border-slate-200 mr-6 shadow-2xs'
                        }`}
                      >
                        <span className={`font-mono text-[9.5px] uppercase block mb-1 ${m.sender === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                          {m.sender === 'user' ? 'Client Question' : 'Inpartner AI Advisory'}:
                        </span>
                        <div className="whitespace-pre-line">{m.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Direct consultation form submission without prior chat history.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-semibold text-sm text-slate-700">Select an Inquiry Dossier</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Click on any lead record from the pipeline table on the left to inspect client profile, dispatch pre-crafted WhatsApp outreach, and review transcripts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
