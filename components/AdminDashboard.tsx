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
  MoreVertical,
  Activity
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
  const [activeTabSubView, setActiveTabSubView] = useState<'table' | 'overview'>('table');
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');

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

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const outreachTemplates = useMemo(() => {
    if (!selectedLead) return [];
    const name = selectedLead.name;
    const need = selectedLead.business_need;

    return [
      {
        id: 0,
        title: 'Initial Intro',
        text: `Hello ${name}, thank you for reaching out to Inpartner (inpartner.id) regarding your corporate advisory inquiry on ${need}. I am following up to understand your objectives and explore how our advisory partners can assist. Would you have 15 minutes for a brief conversation?`
      },
      {
        id: 1,
        title: 'Discovery Call',
        text: `Dear ${name}, following your consultation request for ${need} on inpartner.id, our partner team would be delighted to host an exploratory discovery session this week. Please let us know your availability.`
      },
      {
        id: 2,
        title: 'Advisory Deck',
        text: `Hi ${name}, this is the Inpartner corporate advisory team. We received your request on ${need}. We would be pleased to share our corporate credentials deck and case studies. Would this number be best to send the PDF?`
      }
    ];
  }, [selectedLead]);

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

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      'Ref ID',
      'Date',
      'Client Name',
      'Company',
      'WhatsApp / Phone',
      'Email',
      'Advisory Pillar',
      'Status',
      'Notes'
    ];
    const escapeCsv = (val?: string | null) => {
      if (!val) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=+@\-\t\r]/.test(str)) str = `'${str}`;
      return `"${str}"`;
    };
    const rows = filteredLeads.map((lead, idx) => [
      `"#${String(idx + 1).padStart(6, '0')}"`,
      escapeCsv(new Date(lead.created_at).toLocaleDateString('en-GB')),
      escapeCsv(lead.name),
      escapeCsv(lead.company || '-'),
      `="${lead.phone}"`,
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
    link.download = `inpartner-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess(`Exported ${filteredLeads.length} leads successfully`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Metric Cards Row (Matching Figma Stat Cards #F5F5F5 style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Stat Card 1: Revenue / Pipeline */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.06),0px_0px_6px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[100px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            Total Pipeline
          </div>
          <div className="flex items-baseline gap-1 text-[#5FA0BE] font-medium text-lg tracking-tight">
            <span>{leads.length}</span>
            <span className="text-xs text-[#8B8B8B] font-normal">inquiries</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B8B8B]">All active</span>
            <div className="bg-[#DCF1DD] text-[#6FA672] text-[10px] font-semibold px-2 py-0.5 rounded-[5px] flex items-center gap-1">
              <span>+10%</span>
              <TrendingUp className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        {/* Stat Card 2: Uncontacted Leads */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.06),0px_0px_6px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[100px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide flex items-center justify-between">
            <span>Uncontacted</span>
            <span className="w-2 h-2 rounded-full bg-[#BE5F5F] animate-pulse" />
          </div>
          <div className="text-[#BE5F5F] font-semibold text-lg tracking-tight">
            {leads.filter((l) => l.status === 'new').length}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B8B8B]">Needs response</span>
            <div className="bg-[#F8E0E0] text-[#BE5F5F] text-[10px] font-semibold px-2 py-0.5 rounded-[5px]">
              &lt; 24h
            </div>
          </div>
        </div>

        {/* Stat Card 3: In Discussion */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.06),0px_0px_6px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[100px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            In Discussion
          </div>
          <div className="text-[#5FA0BE] font-semibold text-lg tracking-tight">
            {leads.filter((l) => l.status === 'in_progress' || l.status === 'contacted').length}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B8B8B]">Active pipeline</span>
            <div className="bg-[#DCF1DD] text-[#6FA672] text-[10px] font-semibold px-2 py-0.5 rounded-[5px]">
              +15%
            </div>
          </div>
        </div>

        {/* Stat Card 4: Qualified / Converted */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.06),0px_0px_6px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[100px]">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            Qualified Retainers
          </div>
          <div className="text-[#3E7A41] font-semibold text-lg tracking-tight">
            {leads.filter((l) => l.status === 'converted').length}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B8B8B]">High intent</span>
            <div className="bg-[#DCF1DD] text-[#6FA672] text-[10px] font-semibold px-2 py-0.5 rounded-[5px]">
              21%
            </div>
          </div>
        </div>

        {/* Stat Card 5: Advisory Pillars Performance Widget */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.06),0px_0px_6px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[100px] col-span-2 sm:col-span-1">
          <div className="text-[#747374] font-semibold text-xs tracking-wide">
            Top Pillar
          </div>
          <div className="text-[#747374] font-medium text-xs truncate">
            Business Growth & Margin
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B8B8B]">4 Pillars Active</span>
            <span className="text-[10px] text-[#5FA0BE] font-semibold">100% RAG</span>
          </div>
        </div>
      </div>

      {/* Export notification */}
      {exportSuccess && (
        <div className="bg-[#DCF1DD] border border-[#6FA672]/30 text-[#3E7A41] text-xs px-4 py-2.5 rounded-[10px] flex items-center justify-between shadow-2xs">
          <span>{exportSuccess}</span>
          <button onClick={() => setExportSuccess(null)} className="cursor-pointer text-xs">✕</button>
        </div>
      )}

      {/* 2. Main Invoices & Leads Table (Exact Figma Table Styling) */}
      <div className="bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Card Header with Title and Pagination Tools */}
        <div className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-3">
            <h2 className="text-[#747374] text-sm font-semibold tracking-[0.7px]">
              Inquiries & Client Invoices
            </h2>
            <span className="text-[11px] text-[#8B8B8B] bg-[#DFDFDF] px-2.5 py-0.5 rounded-full font-medium">
              {filteredLeads.length} records
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#747374]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inquiries..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[5px] border border-[#E3E3E3] bg-white text-[#747374] focus:outline-none focus:border-[#5FA0BE]"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-[5px] border border-[#E3E3E3] bg-white text-[#747374] focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="converted">Qualified</option>
              <option value="closed">Closed</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#747374] text-xs font-semibold rounded-[5px] border border-[#DADADA] shadow-[0px_2px_4px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#5FA0BE]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-4 sm:p-5">
          <div className="rounded-[5px] border border-[#E3E3E3] overflow-hidden bg-white">
            <table className="w-full text-left text-xs text-[#747374]">
              {/* Header row matching Figma background #DFDFDF */}
              <thead className="bg-[#DFDFDF] text-[#747374] font-bold text-[12px] tracking-[0.6px]">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Inquiry Ref</th>
                  <th className="py-2.5 px-4">Client / Customer</th>
                  <th className="py-2.5 px-4">Advisory Scope</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E3E3]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#8B8B8B]">
                      No inquiry records matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => {
                    const avatarStyle = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const isSelected = selectedLead?.id === lead.id;
                    const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                    const waUrl = cleanPhone
                      ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`
                      : '';

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EAEAEA]/80 font-medium' : 'hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {/* No */}
                        <td className="py-3 px-4 text-center text-[#8B8B8B] font-medium text-[11px]">
                          {idx + 1}.
                        </td>

                        {/* Invoice/Inquiry ID */}
                        <td className="py-3 px-4 font-semibold text-[#8B8B8B] font-mono text-[11px]">
                          #{lead.id.slice(-6).toUpperCase()}
                        </td>

                        {/* Customer Avatar & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              style={{
                                backgroundColor: avatarStyle.bg,
                                borderColor: avatarStyle.border,
                                color: avatarStyle.text
                              }}
                              className="w-[23px] h-[23px] rounded-full flex items-center justify-center text-[10px] font-semibold border shrink-0"
                            >
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <div className="font-medium text-[#747374]">{lead.name}</div>
                              <div className="text-[10px] text-[#8B8B8B]">
                                {lead.company || 'Enterprise Client'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Advisory Scope */}
                        <td className="py-3 px-4 text-[#747374] font-normal">
                          <span className="line-clamp-1 max-w-[220px]">
                            {lead.business_need}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-[#8B8B8B] whitespace-nowrap text-[11px]">
                          {new Date(lead.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {lead.status === 'new' && (
                            <span className="text-[#BE5F5F] font-semibold text-[11px]">New</span>
                          )}
                          {lead.status === 'contacted' && (
                            <span className="text-[#BE905F] font-semibold text-[11px]">Contacted</span>
                          )}
                          {lead.status === 'in_progress' && (
                            <span className="text-[#5FA0BE] font-semibold text-[11px]">In Progress</span>
                          )}
                          {lead.status === 'converted' && (
                            <span className="text-[#3E7A41] font-semibold text-[11px]">Qualified</span>
                          )}
                          {lead.status === 'closed' && (
                            <span className="text-[#8B8B8B] font-semibold text-[11px]">Closed</span>
                          )}
                        </td>

                        {/* Action with 3 colored square buttons from Figma */}
                        <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {/* Blue Square: WhatsApp Outreach */}
                            <a
                              href={waUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-5 h-5 rounded-[5px] bg-[#CEEBF9] border border-[#5FA0BE]/40 flex items-center justify-center hover:opacity-80 transition-opacity"
                              title="Connect on WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-[#457D97]" />
                            </a>

                            {/* Green Square: Email Client */}
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="w-5 h-5 rounded-[5px] bg-[#DCF1DD] border border-[#84BFB5]/50 flex items-center justify-center hover:opacity-80 transition-opacity"
                                title="Send Email"
                              >
                                <Mail className="w-3 h-3 text-[#3E7A41]" />
                              </a>
                            ) : (
                              <div className="w-5 h-5 rounded-[5px] bg-[#EAEAEA] flex items-center justify-center opacity-40">
                                <Mail className="w-3 h-3 text-[#8B8B8B]" />
                              </div>
                            )}

                            {/* Pink/Red Square: Inspect / Details */}
                            <button
                              onClick={() => handleSelectLead(lead)}
                              className="w-5 h-5 rounded-[5px] bg-[#F8E0E0] border border-[#DE7E7E]/50 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                              title="Inspect Deal Brief"
                            >
                              <FileText className="w-3 h-3 text-[#DE7E7E]" />
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
        <div className="px-5 py-3 border-t border-[#E3E3E3] flex items-center justify-between text-xs text-[#8B8B8B]">
          <span>Showing {filteredLeads.length} of {leads.length} data</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="w-7 h-7 bg-white rounded-[3px] border border-[#DADADA] flex items-center justify-center text-[#B3AEAE] shadow-xs disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled
              className="w-7 h-7 bg-white rounded-[3px] border border-[#DADADA] flex items-center justify-center text-[#B3AEAE] shadow-xs disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Pipeline Progress & Deal Desk Panel (Matching Figma bottom cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Task Progress & Stage Distribution (Left Card - 5 cols) */}
        <div className="lg:col-span-5 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3">
            <h3 className="text-[#747374] text-sm font-semibold tracking-[0.7px]">
              Advisory Pipeline Progress
            </h3>
            <span className="text-[11px] text-[#8B8B8B]">Real-time Status</span>
          </div>

          {/* Progress Bar Items matching Figma style */}
          <div className="space-y-4 pt-1">
            {/* Pillar 1: Business Growth */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium">Business Growth & Market Expansion</span>
                <span className="text-[#3E7A41] font-bold">36%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#3E7A41] h-full rounded-[10px]" style={{ width: '36%' }}></div>
              </div>
            </div>

            {/* Pillar 2: Funding & Investment */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium">Funding & Investment Advisory</span>
                <span className="text-[#5FA0BE] font-bold">28%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#5FA0BE] h-full rounded-[10px]" style={{ width: '28%' }}></div>
              </div>
            </div>

            {/* Pillar 3: Profitability */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium">Profitability & Margin Optimization</span>
                <span className="text-[#BE905F] font-bold">20%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#BE905F] h-full rounded-[10px]" style={{ width: '20%' }}></div>
              </div>
            </div>

            {/* Pillar 4: Capacity Building */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#747374] font-medium">The Executive Business Program</span>
                <span className="text-[#94839D] font-bold">16%</span>
              </div>
              <div className="w-full bg-[#D9D9D9] h-2 rounded-[10px] overflow-hidden">
                <div className="bg-[#94839D] h-full rounded-[10px]" style={{ width: '16%' }}></div>
              </div>
            </div>
          </div>

          {/* Yearly Order Rate Mini Chart Visual */}
          <div className="mt-5 pt-4 border-t border-[#E3E3E3]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#747374]">Monthly Inquiries Rate</span>
              <div className="flex items-center gap-2 text-[10px] text-[#9C9C9C]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5FA0BE]" /> Website
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6BA77F]" /> Direct
                </span>
              </div>
            </div>

            {/* Mini SVG Trend Curves */}
            <div className="h-20 w-full flex items-end justify-between px-2 pt-2 border-b border-[#E3E3E3] text-[9px] text-[#8B8B8B]">
              {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((m, i) => (
                <div key={m} className="flex flex-col items-center gap-1">
                  <div
                    className="w-2 bg-[#5FA0BE] rounded-t-[3px]"
                    style={{ height: `${20 + i * 8}px` }}
                  />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Lead Deal Desk & Transcript (Right Card - 7 cols) */}
        <div className="lg:col-span-7 bg-[#F5F5F5] rounded-[10px] border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-5">
          {selectedLead ? (
            <>
              {/* Header Dossier */}
              <div className="flex items-start justify-between border-b border-[#E3E3E3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#747374]">
                      {selectedLead.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#8B8B8B] bg-white px-2 py-0.5 rounded border border-[#E3E3E3]">
                      #{selectedLead.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B8B8B] flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 text-[#5FA0BE]" />
                    <span>{selectedLead.company || 'Direct Client'}</span>
                  </p>
                </div>

                {/* Pipeline Step Advance Buttons */}
                <div className="flex items-center gap-1">
                  {(['new', 'contacted', 'in_progress', 'converted'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedLead.id, st as LeadStatus)}
                      disabled={updatingStatus}
                      className={`text-[10px] px-2 py-1 rounded-[5px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedLead.status === st
                          ? 'bg-[#5FA0BE] text-white shadow-2xs'
                          : 'bg-white text-[#747374] border border-[#E3E3E3] hover:bg-[#EAEAEA]'
                      }`}
                    >
                      {st === 'in_progress' ? 'Diag' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outreach Toolkit */}
              <div className="space-y-3 bg-white p-4 rounded-[8px] border border-[#E3E3E3]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#747374]">
                    Consultant Outreach Template
                  </span>
                  <div className="flex items-center gap-1">
                    {outreachTemplates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTemplate(t.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-[4px] cursor-pointer ${
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

                <p className="text-xs text-[#747374] italic bg-[#F5F5F5] p-2.5 rounded-[6px] border border-[#E3E3E3] leading-relaxed">
                  &quot;{outreachTemplates[activeTemplate]?.text}&quot;
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      outreachTemplates[activeTemplate]?.text || ''
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#5FA0BE] hover:bg-[#558BA4] text-white rounded-[5px] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp ({selectedLead.phone})</span>
                  </a>

                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(
                        `Inpartner Advisory - ${selectedLead.name}`
                      )}&body=${encodeURIComponent(outreachTemplates[activeTemplate]?.text || '')}`}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-[#747374] border border-[#DADADA] rounded-[5px] text-xs font-semibold"
                    >
                      Email
                    </a>
                  )}
                </div>
              </div>

              {/* Client Notes & Details */}
              <div className="space-y-2 text-xs text-[#747374]">
                <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-2">
                  <span className="text-[#8B8B8B]">Target Pillar:</span>
                  <span className="font-semibold text-[#5FA0BE]">{selectedLead.business_need}</span>
                </div>
                {selectedLead.notes && (
                  <div className="border-b border-[#E3E3E3] pb-2">
                    <span className="text-[#8B8B8B] block mb-1">Submitted Challenge:</span>
                    <p className="bg-white p-2.5 rounded-[6px] border border-[#E3E3E3] italic">
                      &quot;{selectedLead.notes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Internal Consultant Note Editor */}
              <div className="space-y-2 pt-2 border-t border-[#E3E3E3]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#747374]">Internal Advisory Notes</span>
                  {noteSavedFeedback && (
                    <span className="text-xs text-[#3E7A41] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Record consultant observations or scheduled follow-up dates..."
                  className="w-full text-xs p-2.5 rounded-[5px] border border-[#E3E3E3] bg-white text-[#747374] focus:outline-none focus:border-[#5FA0BE]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  className="w-full py-1.5 bg-[#747374] hover:bg-[#5a595a] text-white text-xs font-semibold rounded-[5px] transition-all cursor-pointer"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>

              {/* Chatbot Transcript Stream */}
              <div className="pt-2 border-t border-[#E3E3E3]">
                <span className="text-xs font-semibold text-[#747374] block mb-2">
                  Visitor AI Chatbot Transcript
                </span>
                <div className="max-h-48 overflow-y-auto space-y-2 bg-white p-3 rounded-[6px] border border-[#E3E3E3] text-xs">
                  {selectedLeadConversation?.messages?.length > 0 ? (
                    selectedLeadConversation.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-[5px] text-[11px] leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-[#EAEAEA] text-[#747374] ml-4'
                            : 'bg-[#F5F5F5] text-[#747374] border border-[#E3E3E3] mr-4'
                        }`}
                      >
                        <span className="font-bold text-[9px] uppercase block mb-0.5 text-[#8B8B8B]">
                          {m.sender === 'user' ? 'Client' : 'Inpartner Assistant'}:
                        </span>
                        <div>{m.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[#8B8B8B] text-xs">
                      Direct form consultation inquiry.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[#8B8B8B] text-xs">
              Select an inquiry row from the table to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
