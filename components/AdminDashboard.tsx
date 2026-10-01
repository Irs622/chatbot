'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Phone,
  Mail,
  Building,
  Download,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Trash2,
  Flame,
  Zap,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/db';
import { calculateLeadScore, getPriorityBadgeInfo, PriorityTier, LeadScoreResult } from '@/lib/leadScoring';

function formatPhone(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('0') && clean.length >= 10) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  return phone;
}

function getWhatsAppUrl(phone: string, name: string, need: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  const msg = encodeURIComponent(
    `Halo Bapak/Ibu ${name}, terima kasih telah menghubungi Inpartner Consulting via inpartner.id mengenai ${need}. Apakah ada waktu luang untuk berdiskusi singkat?`
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScoreFactors, setShowScoreFactors] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState<Array<{ id?: string; sender: string; text: string; created_at?: string }>>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const loadTranscript = async (leadId: string) => {
    setLoadingTranscript(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        setTranscriptMessages(data.messages);
      } else {
        setTranscriptMessages([]);
      }
    } catch (err) {
      console.error('Failed to load transcript:', err);
      setTranscriptMessages([]);
    } finally {
      setLoadingTranscript(false);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setInternalNote(lead.notes || '');
    loadTranscript(lead.id);
  };

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
        setSelectedLead((prev) => {
          if (!prev && data.leads.length > 0) {
            const first = data.leads[0];
            setInternalNote(first.notes || '');
            loadTranscript(first.id);
            return first;
          }
          if (prev) {
            const updated = data.leads.find((l: Lead) => l.id === prev.id);
            if (updated) {
              setInternalNote(updated.notes || '');
              return updated;
            }
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) setSelectedLead(data.lead);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedLead) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: internalNote })
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? data.lead : l)));
        setSelectedLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this client inquiry?')) {
      return;
    }
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        if (selectedLead?.id === leadId) {
          const remaining = leads.filter((l) => l.id !== leadId);
          if (remaining.length > 0) {
            handleSelectLead(remaining[0]);
          } else {
            setSelectedLead(null);
            setTranscriptMessages([]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Enriched leads with computed scoring if missing
  const enrichedLeads = useMemo(() => {
    return leads.map((l) => {
      if (l.score !== undefined && l.priority_tier !== undefined) {
        return l;
      }
      const scoring = calculateLeadScore({
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        business_need: l.business_need,
        notes: l.notes
      });
      return {
        ...l,
        score: scoring.score,
        priority_tier: scoring.priority_tier,
        score_breakdown: {
          tier_label: scoring.tier_label,
          target_sla: scoring.target_sla,
          factors: scoring.factors
        }
      };
    });
  }, [leads]);

  // Filtered leads by status, priority tier, and search query
  const filteredLeads = useMemo(() => {
    return enrichedLeads.filter((l) => {
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      const matchPriority = filterPriority === 'all' || l.priority_tier === filterPriority;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        l.phone.includes(q) ||
        l.business_need.toLowerCase().includes(q);
      return matchStatus && matchPriority && matchQuery;
    });
  }, [enrichedLeads, filterStatus, filterPriority, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: enrichedLeads.length,
      tier1Hot: enrichedLeads.filter((l) => l.priority_tier === 'tier_1').length,
      new: enrichedLeads.filter((l) => l.status === 'new').length,
      contacted: enrichedLeads.filter((l) => l.status === 'contacted' || l.status === 'in_progress').length,
      converted: enrichedLeads.filter((l) => l.status === 'converted').length
    };
  }, [enrichedLeads]);

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = ['Date', 'Client Name', 'Company', 'Phone', 'Email', 'Topic', 'Score', 'Priority Tier', 'Target SLA', 'Status', 'Notes'];
    const rows = filteredLeads.map((l) => {
      const score = l.score !== undefined ? l.score : '-';
      const tier = l.priority_tier ? (l.priority_tier === 'tier_1' ? 'Tier 1 (Hot)' : l.priority_tier === 'tier_2' ? 'Tier 2 (Warm)' : 'Tier 3 (Standard)') : '-';
      const sla = l.score_breakdown?.target_sla || (l.priority_tier === 'tier_1' ? '< 2h' : l.priority_tier === 'tier_2' ? '< 12h' : '24h');
      
      return [
        new Date(l.created_at).toLocaleDateString('en-GB'),
        `"${l.name.replace(/"/g, '""')}"`,
        `"${(l.company || '-').replace(/"/g, '""')}"`,
        `="${l.phone}"`,
        l.email || '-',
        `"${l.business_need.replace(/"/g, '""')}"`,
        score,
        tier,
        `"${sla}"`,
        l.status,
        `"${(l.notes || '-').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inpartner-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedLeadScoring: LeadScoreResult = useMemo(() => {
    if (!selectedLead) {
      return { score: 0, priority_tier: 'tier_3', tier_label: 'Tier 3', target_sla: '24h', factors: [] };
    }
    return calculateLeadScore({
      name: selectedLead.name,
      company: selectedLead.company,
      email: selectedLead.email,
      phone: selectedLead.phone,
      business_need: selectedLead.business_need,
      notes: selectedLead.notes,
      conversation_messages: transcriptMessages
    });
  }, [selectedLead, transcriptMessages]);

  const selectedBadgeInfo = getPriorityBadgeInfo(selectedLeadScoring.priority_tier);

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER: Section Title & Global Actions */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Client Inquiries & BD Matrix</h2>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>Lead Scoring Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming corporate advisory leads, multi-variable scoring, and SLA-driven follow-ups.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP METRICS ROW (Fixed Height: 105px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Total Inquiries</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400">All inbound leads</div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs h-[105px] flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/30">
          <div className="text-xs text-rose-700 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Tier 1 Hot Leads</span>
            </span>
            {stats.tier1Hot > 0 && (
              <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                &lt; 2h SLA
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-rose-700">{stats.tier1Hot}</div>
          <div className="text-[11px] text-rose-600/80 font-medium">High priority enterprise deals</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-amber-600 font-medium flex items-center justify-between">
            <span>Needs Reply</span>
            {stats.new > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.new}</div>
          <div className="text-[11px] text-slate-400">Pending initial response</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-emerald-600 font-medium">In Pipeline / Won</div>
          <div className="text-2xl font-bold text-slate-900">{stats.contacted + stats.converted}</div>
          <div className="text-[11px] text-slate-400">{stats.converted} qualified & converted</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT BLOCKS: Table & Detail Dossier (Matching Height: 600px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Block: Inquiries Table Card (7 cols, Fixed Height: 600px) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs h-[600px] flex flex-col justify-between overflow-hidden">
          {/* Fixed Card Header */}
          <div className="p-3.5 border-b border-slate-200 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, company..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Filters & Export */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="tier_1">🔥 Tier 1 • Hot (&ge;70)</option>
                <option value="tier_2">⚡ Tier 2 • Warm (40-69)</option>
                <option value="tier_3">📋 Tier 3 • Standard (&lt;40)</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="new">Needs Reply</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Discussion</option>
                <option value="converted">Qualified</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Download CSV to open in Excel"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3.5">Client & Company</th>
                  <th className="py-2.5 px-2 text-center">Score / Tier</th>
                  <th className="py-2.5 px-3">Advisory Need</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      No client inquiries found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLead?.id === lead.id;
                    const waLink = getWhatsAppUrl(lead.phone, lead.name, lead.business_need);
                    const score = lead.score !== undefined ? lead.score : 50;
                    const tier = lead.priority_tier || (score >= 70 ? 'tier_1' : score >= 40 ? 'tier_2' : 'tier_3');
                    const badge = getPriorityBadgeInfo(tier);

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#0779D1]/10 border-l-3 border-l-[#0779D1]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{lead.name}</span>
                            {tier === 'tier_1' && (
                              <span title="Tier 1 Hot Opportunity">
                                <Flame className="w-3.5 h-3.5 text-rose-600 inline shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {lead.company || formatPhone(lead.phone)}
                          </div>
                        </td>

                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {score} pts
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {badge.shortLabel}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          <span className="line-clamp-1 max-w-[140px]">{lead.business_need}</span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {lead.status === 'new' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              Needs Reply
                            </span>
                          )}
                          {lead.status === 'contacted' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Contacted
                            </span>
                          )}
                          {lead.status === 'in_progress' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#0779D1]/10 text-[#0779D1] border border-[#0779D1]/20">
                              Discussion
                            </span>
                          )}
                          {lead.status === 'converted' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Qualified
                            </span>
                          )}
                          {lead.status === 'closed' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                              Closed
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium transition-colors shadow-2xs"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="w-3 h-3" />
                            <span>WA</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Fixed Footer */}
          <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span>Showing {filteredLeads.length} of {leads.length} records</span>
            <div className="flex items-center gap-1">
              <button disabled className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-50">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button disabled className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-50">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Block: Selected Lead Detail Dossier (5 cols, Fixed Height: 600px) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[600px] flex flex-col justify-between overflow-hidden">
          {selectedLead ? (
            <>
              {/* Fixed Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    <span>{selectedLead.name}</span>
                    {selectedLeadScoring.priority_tier === 'tier_1' && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold">
                        HOT
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedLead.company || 'Business Client'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="new">Needs Reply</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Discussion</option>
                    <option value="converted">Qualified</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Dossier Content Body */}
              <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 text-xs">
                {/* 🌟 COMMERCIAL LEAD SCORE CARD 🌟 */}
                <div
                  className={`p-3 rounded-xl border ${selectedBadgeInfo.border} ${selectedBadgeInfo.bg} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Award className={`w-4 h-4 ${selectedBadgeInfo.text}`} />
                      <span className={`font-bold text-xs ${selectedBadgeInfo.text}`}>
                        {selectedLeadScoring.tier_label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black text-slate-900">
                        {selectedLeadScoring.score}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">/100</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedLeadScoring.score >= 70
                          ? 'bg-rose-600'
                          : selectedLeadScoring.score >= 40
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${selectedLeadScoring.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Target SLA:</span>
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedLeadScoring.target_sla}
                    </span>
                  </div>

                  {/* Collapsible Factor Breakdown */}
                  <div className="pt-1.5 border-t border-slate-200/60">
                    <button
                      onClick={() => setShowScoreFactors(!showScoreFactors)}
                      className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Scoring Factors Breakdown ({selectedLeadScoring.factors.length} criteria)</span>
                      {showScoreFactors ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {showScoreFactors && (
                      <div className="mt-2 space-y-1.5 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                        {selectedLeadScoring.factors.map((f, i) => (
                          <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-50 pb-1 last:border-none">
                            <div className="pr-1">
                              <span className="font-medium text-slate-800 block">{f.factor}</span>
                              <span className="text-[10px] text-slate-500">{f.description}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 shrink-0">
                              +{f.score}/{f.max}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Phone & Email */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">WhatsApp / Phone:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium">
                      <span>{formatPhone(selectedLead.phone)}</span>
                      <button
                        onClick={() => handleCopy(selectedLead.phone, 'phone')}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy phone"
                      >
                        {copiedId === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {selectedLead.email && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${selectedLead.email}`} className="text-[#0779D1] hover:underline font-mono">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Advisory Topic Box */}
                <div>
                  <span className="text-slate-500 block mb-1 font-medium">Advisory Scope Requested:</span>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedLead.business_need}
                  </p>
                </div>

                {/* Client's Original Challenge Box */}
                {selectedLead.notes && (
                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">Submitted Details:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                      &quot;{selectedLead.notes}&quot;
                    </p>
                  </div>
                )}

                {/* AI Chat Transcript Box */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0779D1]" />
                      <span>Chat Transcript</span>
                      {transcriptMessages.length > 0 && (
                        <span className="bg-[#0779D1]/10 text-[#0779D1] font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                          {transcriptMessages.length}
                        </span>
                      )}
                    </span>
                    {loadingTranscript && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Loading...
                      </span>
                    )}
                  </div>

                  {loadingTranscript ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center text-[11px] text-slate-400">
                      Loading conversation messages...
                    </div>
                  ) : transcriptMessages.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-2 p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80">
                      {transcriptMessages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col text-[11px] leading-relaxed ${
                            m.sender === 'user' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-slate-400 mb-0.5">
                            {m.sender === 'user' ? 'Client' : 'Inpartner AI'}
                          </span>
                          <div
                            className={`px-2.5 py-1.5 rounded-lg max-w-[92%] ${
                              m.sender === 'user'
                                ? 'bg-[#0779D1] text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                            }`}
                          >
                            <span className="whitespace-pre-wrap">{m.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-400 italic">
                      Direct form inquiry (No prior AI chat history).
                    </div>
                  )}
                </div>

                {/* Internal Consultant Notes */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 block">Consultant Internal Notes</span>
                  <textarea
                    rows={2}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Record notes from follow-up calls or meetings..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 text-slate-800 resize-none"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="w-full py-1.5 bg-[#0779D1] hover:bg-[#0668b3] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    {savingNote ? 'Saving Note...' : 'Save Notes'}
                  </button>
                </div>
              </div>

              {/* Fixed Footer: 1-Click WhatsApp Button */}
              <div className="pt-3 border-t border-slate-100 shrink-0">
                <a
                  href={getWhatsAppUrl(selectedLead.phone, selectedLead.name, selectedLead.business_need)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat Client on WhatsApp ({formatPhone(selectedLead.phone)})</span>
                </a>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Building className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
              <p className="font-semibold text-slate-700 text-xs">No Inquiry Selected</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                Click on any client inquiry row from the table to view contact details, advisory scope, score matrix, and notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
