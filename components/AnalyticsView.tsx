'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  PhoneCall,
  Activity,
  ArrowUpRight,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Activity className="w-6 h-6 animate-spin text-[#005DAD] mr-2" />
        <span>Memuat data analitik Inpartner...</span>
      </div>
    );
  }

  const { totals, kpis, eventsDistribution, recentEvents } = data;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Engagement Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Engagement Rate</span>
            <div className="p-2 rounded-xl bg-sky-50 text-[#005DAD]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-800">{kpis.engagementRate}%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {totals.conversations} percakapan dari pengunjung website
            </p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#005DAD] h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.engagementRate}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 2: Service Discovery Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Service Discovery Rate</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-800">{kpis.serviceDiscoveryRate}%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Visitor mengeksplorasi 4 pilar Inpartner
            </p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.serviceDiscoveryRate}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 3: Lead Capture Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lead Capture Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">{kpis.leadCaptureRate}%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {totals.leads} prospek bisnis terkumpul
            </p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.leadCaptureRate}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 4: Human Handoff Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Human Handoff Rate</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600">{kpis.humanHandoffRate}%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Klik kontak langsung WA / Email
            </p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.humanHandoffRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Grid: Events Distribution + Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#005DAD]" />
            Distribusi Event Chatbot (PRD Section 16)
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Chatbot Opened', key: 'chatbot_opened', color: 'bg-sky-500' },
              { label: 'Conversation Started', key: 'conversation_started', color: 'bg-[#005DAD]' },
              { label: 'Intent / Need Selected', key: 'intent_selected', color: 'bg-indigo-500' },
              { label: 'Question Asked', key: 'question_asked', color: 'bg-cyan-500' },
              { label: 'Service Viewed', key: 'service_viewed', color: 'bg-teal-500' },
              { label: 'Lead Form Opened', key: 'lead_form_opened', color: 'bg-amber-500' },
              { label: 'Lead Submitted', key: 'lead_submitted', color: 'bg-emerald-500' },
              { label: 'Contact Clicked (WA/Email)', key: 'contact_clicked', color: 'bg-violet-500' },
              { label: 'Human Handoff Triggered', key: 'human_handoff', color: 'bg-rose-500' }
            ].map((evt) => {
              const count = eventsDistribution[evt.key] || 0;
              const maxCount = Math.max(...Object.values(eventsDistribution as Record<string, number>), 1);
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <div key={evt.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{evt.label}</span>
                    <span className="font-bold text-slate-800">{count} event</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${evt.color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Aktivitas Terkini (Live Stream)
            </h3>
            <button
              onClick={fetchAnalytics}
              className="text-xs text-[#005DAD] hover:underline font-semibold"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.map((e: any) => (
                <div
                  key={e.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#005DAD] mt-1.5 shrink-0"></span>
                    <div>
                      <span className="font-semibold text-slate-800 capitalize">
                        {e.event_name.replace(/_/g, ' ')}
                      </span>
                      {e.metadata && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-mono">
                          {JSON.stringify(e.metadata)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Belum ada aktivitas tercatat. Coba buka chatbot dan ajukan pertanyaan untuk melihat analitik langsung.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
