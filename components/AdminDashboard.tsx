'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/db';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadConversation, setSelectedLeadConversation] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  const fetchLeadsAndConversations = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, convsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/conversations')
      ]);

      const leadsData = await leadsRes.json();
      const convsData = await convsRes.json();

      if (leadsData.leads) setLeads(leadsData.leads);
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

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: internalNote || undefined })
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

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setInternalNote(lead.notes || '');

    if (lead.conversation_id) {
      const matched = conversations.find((c) => c.conversation.id === lead.conversation_id);
      setSelectedLeadConversation(matched || null);
    } else {
      setSelectedLeadConversation(null);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      l.name.toLowerCase().includes(q) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.business_need.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            New Lead
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-500" />
            Contacted
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
            In Progress
          </span>
        );
      case 'converted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Converted
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 w-fit">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Inpartner Leads & Consultation CRM</h2>
            <span className="bg-[#0d5f8a]/10 text-[#0d5f8a] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Internal Team
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kelola prospek calon klien dan riwayat konsultasi bisnis dari chatbot website inpartner.id.
          </p>
        </div>

        <button
          onClick={fetchLeadsAndConversations}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setFilterStatus('all')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'all'
              ? 'bg-[#0d5f8a] text-white border-[#0d5f8a] shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">Total Leads</div>
          <div className="text-2xl font-bold mt-1">{leads.length}</div>
        </div>

        <div
          onClick={() => setFilterStatus('new')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'new'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="text-xs font-medium text-rose-500">New Leads</div>
          <div className="text-2xl font-bold mt-1 text-rose-600">
            {leads.filter((l) => l.status === 'new').length}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('contacted')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'contacted'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-xs font-medium text-amber-500">Contacted</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">
            {leads.filter((l) => l.status === 'contacted').length}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('in_progress')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'in_progress'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="text-xs font-medium text-blue-500">In Progress</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {leads.filter((l) => l.status === 'in_progress').length}
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('converted')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'converted'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-medium text-emerald-500">Converted</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">
            {leads.filter((l) => l.status === 'converted').length}
          </div>
        </div>
      </div>

      {/* Main Grid: Leads Table + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leads Table (Left) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, perusahaan, kebutuhan..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0d5f8a]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0d5f8a] bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Calon Klien & Perusahaan</th>
                  <th className="py-3 px-4">Kebutuhan Bisnis</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Tidak ada data lead yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLead?.id === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50/70 border-l-4 border-l-[#0d5f8a]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            {lead.company || 'Perusahaan Pribadi'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700 line-clamp-1">
                            {lead.business_need}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(lead.status)}</td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(lead.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Detail & Conversation Transcript (Right) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col">
          {selectedLead ? (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-[#0d5f8a]" />
                    {selectedLead.company || 'Perusahaan Mandiri'}
                  </p>
                </div>
                <div>{getStatusBadge(selectedLead.status)}</div>
              </div>

              {/* Action Buttons: WhatsApp & Email */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=Halo%20Bapak/Ibu%20${encodeURIComponent(
                    selectedLead.name
                  )},%20kami%20dari%20tim%20konsultan%20Inpartner%20(PT%20Inpartner%20Optima%20Integra)%20mengenai%20kebutuhan%20${encodeURIComponent(
                    selectedLead.business_need
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Hubungi via WhatsApp
                </a>

                {selectedLead.email ? (
                  <a
                    href={`mailto:${selectedLead.email}?subject=Konsultasi%20Bisnis%20Inpartner%20-%20${encodeURIComponent(
                      selectedLead.name
                    )}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0d5f8a] hover:bg-[#083c5a] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Kirim Email
                  </a>
                ) : (
                  <div className="flex items-center justify-center px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs">
                    Email tidak dicantumkan
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nomor Telepon:</span>
                  <span className="font-semibold text-slate-800">{selectedLead.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedLead.email || '-'}</span>
                </div>
                <div className="border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 block mb-1">Kebutuhan Bisnis:</span>
                  <span className="font-semibold text-[#0d5f8a]">{selectedLead.business_need}</span>
                </div>
                {selectedLead.notes && (
                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-slate-500 block mb-1">Catatan Klien:</span>
                    <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                      "{selectedLead.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update & Internal Notes */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Update Status Follow-up:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['new', 'contacted', 'in_progress', 'converted', 'closed'] as LeadStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedLead.id, st)}
                        disabled={updatingStatus}
                        className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition-all ${
                          selectedLead.status === st
                            ? 'bg-[#0d5f8a] text-white border-[#0d5f8a] font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Associated Chat Conversation History */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0d5f8a]" />
                    Transkrip Obrolan Chatbot:
                  </h4>
                  {selectedLeadConversation && (
                    <span className="text-[10px] text-slate-400">
                      {selectedLeadConversation.messages.length} pesan
                    </span>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  {selectedLeadConversation && selectedLeadConversation.messages.length > 0 ? (
                    selectedLeadConversation.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-lg text-[11px] leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-[#0d5f8a]/10 text-slate-800 ml-4'
                            : 'bg-white text-slate-700 border border-slate-200 mr-4'
                        }`}
                      >
                        <span className="font-bold text-[10px] text-slate-500 block mb-0.5">
                          {m.sender === 'user' ? 'Visitor' : 'Inpartner Assistant'}:
                        </span>
                        <div className="whitespace-pre-line">{m.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      Tidak ada log percakapan terhubung untuk lead ini (atau form diisi langsung).
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-sm text-slate-600">Pilih salah satu prospek</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Klik salah satu baris lead di tabel sebelah kiri untuk melihat detail kontak, status follow-up, dan transkrip chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
