'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/db';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
        if (!selectedLead && data.leads.length > 0) {
          setSelectedLead(data.leads[0]);
          setInternalNote(data.leads[0].notes || '');
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setInternalNote(lead.notes || '');
  };

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
        body: JSON.stringify({ status: selectedLead.status, notes: internalNote })
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        l.phone.includes(q) ||
        l.business_need.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [leads, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted' || l.status === 'in_progress').length,
      converted: leads.filter((l) => l.status === 'converted').length
    };
  }, [leads]);

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = ['Date', 'Client Name', 'Company', 'Phone', 'Email', 'Topic', 'Status', 'Notes'];
    const rows = filteredLeads.map((l) => [
      new Date(l.created_at).toLocaleDateString('en-GB'),
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.company || '-').replace(/"/g, '""')}"`,
      `="${l.phone}"`,
      l.email || '-',
      `"${l.business_need.replace(/"/g, '""')}"`,
      l.status,
      `"${(l.notes || '-').replace(/"/g, '""')}"`
    ].join(','));

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inpartner-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER: Section Title & Global Actions */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Client Inquiries</h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Inbound Pipeline</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming corporate advisory leads, consultation requests, and client follow-ups.
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
          <div className="text-[11px] text-slate-400">All website leads</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-rose-600 font-medium flex items-center justify-between">
            <span>Needs Reply</span>
            {stats.new > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.new}</div>
          <div className="text-[11px] text-slate-400">Requires follow-up</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-sky-600 font-medium">In Discussion</div>
          <div className="text-2xl font-bold text-slate-900">{stats.contacted}</div>
          <div className="text-[11px] text-slate-400">Active pipeline</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-emerald-600 font-medium">Qualified / Won</div>
          <div className="text-2xl font-bold text-slate-900">{stats.converted}</div>
          <div className="text-[11px] text-slate-400">Proposal stage</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT BLOCKS: Table & Detail Dossier (Matching Height: 580px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Block: Inquiries Table Card (7 cols, Fixed Height: 580px) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs h-[580px] flex flex-col justify-between overflow-hidden">
          {/* Fixed Card Header */}
          <div className="p-3.5 border-b border-slate-200 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, company, phone..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Filter & Export */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                  <th className="py-2.5 px-3">Advisory Need</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400">
                      No client inquiries found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLead?.id === lead.id;
                    const waLink = getWhatsAppUrl(lead.phone, lead.name, lead.business_need);

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50/70 border-l-3 border-l-sky-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500">{lead.company || formatPhone(lead.phone)}</div>
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          <span className="line-clamp-1 max-w-[170px]">{lead.business_need}</span>
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
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
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

        {/* Right Block: Selected Lead Detail Dossier (5 cols, Fixed Height: 580px) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[580px] flex flex-col justify-between overflow-hidden">
          {selectedLead ? (
            <>
              {/* Fixed Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedLead.company || 'Business Client'}</span>
                  </p>
                </div>

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
              </div>

              {/* Scrollable Dossier Content Body */}
              <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 text-xs">
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
                      <a href={`mailto:${selectedLead.email}`} className="text-sky-600 hover:underline">
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
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
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
                Click on any client inquiry row from the table to view contact details, advisory scope, and notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
