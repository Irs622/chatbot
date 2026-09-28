'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, PhoneCall, Activity, RefreshCw } from 'lucide-react';

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
      <div className="flex items-center justify-center p-16 text-slate-400 text-xs">
        <Activity className="w-5 h-5 animate-spin mr-2 text-sky-600" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  const { totals, kpis, recentEvents } = data;

  const formatEvent = (e: any) => {
    if (e.metadata?.query) return `Asked: "${e.metadata.query}"`;
    if (e.metadata?.name) return `Inquiry by ${e.metadata.name}`;
    if (e.event_name === 'conversation_started') return 'New conversation started on website';
    if (e.event_name === 'lead_submitted') return 'Consultation inquiry submitted';
    if (e.event_name === 'contact_clicked') return 'Clicked direct WhatsApp contact';
    return e.event_name.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Analytics Overview</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Chatbot visitor volume, engagement, and conversion metrics.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Conversations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totals.conversations}</div>
          <div className="text-[11px] text-slate-400 mt-1">{kpis.engagementRate}% engagement</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Client Inquiries</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totals.leads}</div>
          <div className="text-[11px] text-slate-400 mt-1">{kpis.leadCaptureRate}% capture rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Service Exploration</div>
          <div className="text-2xl font-bold text-sky-600 mt-1">{kpis.serviceDiscoveryRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Explored 4 pillars</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Direct WhatsApp</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{kpis.humanHandoffRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct outreach clicks</div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Recent Visitor Activity</h3>
          <button
            onClick={fetchAnalytics}
            className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-2">
          {recentEvents && recentEvents.length > 0 ? (
            recentEvents.slice(0, 15).map((e: any) => (
              <div
                key={e.id}
                className="py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100/70 text-xs flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span className="line-clamp-1">{formatEvent(e)}</span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
