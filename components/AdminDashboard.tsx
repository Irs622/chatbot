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
  ChevronRight
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
      {/* 1. Simple Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">Total Inquiries</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-rose-600 font-medium flex items-center justify-between">
            <span>Needs Reply</span>
            {stats.new > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{stats.new}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-sky-600 font-medium">In Discussion</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.contacted}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-emerald-600 font-medium">Qualified / Won</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.converted}</div>
        </div>
      </div>

      {/* 2. Main Content: Table + Side Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Area (7 cols on large, full on small) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Table Header Tools */}
          <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No inquiries found.
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
                          isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500">{lead.company || formatPhone(lead.phone)}</div>
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          <span className="line-clamp-1 max-w-[180px]">{lead.business_need}</span>
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium transition-colors"
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
        </div>

        {/* Selected Lead Details Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          {selectedLead ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">{selectedLead.name}</h3>
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

              {/* Contact Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Phone / WA</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-800">
                    <span>{formatPhone(selectedLead.phone)}</span>
                    <button
                      onClick={() => handleCopy(selectedLead.phone, 'phone')}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {copiedId === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {selectedLead.email && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Email</span>
                    <a href={`mailto:${selectedLead.email}`} className="text-sky-600 hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                )}

                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Advisory Topic:</span>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedLead.business_need}
                  </p>
                </div>

                {selectedLead.notes && (
                  <div className="py-1">
                    <span className="text-slate-500 block mb-1">Client&apos;s Message:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      &quot;{selectedLead.notes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Direct Actions */}
              <div className="pt-2">
                <a
                  href={getWhatsAppUrl(selectedLead.phone, selectedLead.name, selectedLead.business_need)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat Client on WhatsApp</span>
                </a>
              </div>

              {/* Internal Notes */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-medium text-slate-700">Internal Consultant Notes</span>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add notes from your discussion..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 text-slate-800"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {savingNote ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select an inquiry from the list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
