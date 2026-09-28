'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  PhoneCall,
  Activity,
  RefreshCw,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCircle2
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
      <div className="flex items-center justify-center p-16 text-[#8B8B8B] text-xs">
        <Activity className="w-5 h-5 animate-spin text-[#5FA0BE] mr-2" />
        <span>Loading consultation analytics...</span>
      </div>
    );
  }

  const { totals, kpis, eventsDistribution, recentEvents } = data;

  // Format metadata into friendly human readable sentence for non-devs
  const formatEventMetadata = (eventName: string, metadata?: any): string => {
    if (!metadata) return 'Visitor interacted with chatbot';
    if (metadata.query) return `Client asked: "${metadata.query}"`;
    if (metadata.initial_intent) return `Selected topic: ${metadata.initial_intent.replace(/_/g, ' ')}`;
    if (metadata.service) return `Explored: ${metadata.service}`;
    if (metadata.name) return `Inquiry submitted by ${metadata.name}`;
    if (metadata.channel) return `Contacted via ${metadata.channel}`;
    return 'Website visitor interaction';
  };

  const formatEventName = (name: string): string => {
    switch (name) {
      case 'chatbot_opened':
        return 'Chatbot Opened by Visitor';
      case 'conversation_started':
        return 'Conversation Started';
      case 'intent_selected':
        return 'Advisory Need Selected';
      case 'question_asked':
        return 'Client Question Asked';
      case 'service_viewed':
        return 'Service Pillar Viewed';
      case 'lead_form_opened':
        return 'Consultation Form Opened';
      case 'lead_submitted':
        return 'Consultation Lead Submitted';
      case 'contact_clicked':
        return 'WhatsApp / Email Clicked';
      case 'human_handoff':
        return 'Transferred to Consultant';
      default:
        return name.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-5">
      {/* 4 Overview Metric Cards (Figma #F5F5F5 style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Engagement Rate */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[130px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#747374]">Visitor Engagement</span>
            <div className="w-7 h-7 rounded-[5px] bg-[#CEEBF9] text-[#5FA0BE] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#5FA0BE]">{kpis.engagementRate}%</div>
            <p className="text-[11px] text-[#8B8B8B] mt-0.5">
              {totals.conversations} conversations started
            </p>
          </div>
          <div className="w-full bg-[#D9D9D9] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#5FA0BE] h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.engagementRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Service Discovery Rate */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[130px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#747374]">Service Exploration</span>
            <div className="w-7 h-7 rounded-[5px] bg-[#F5ECE1] text-[#BE905F] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#BE905F]">{kpis.serviceDiscoveryRate}%</div>
            <p className="text-[11px] text-[#8B8B8B] mt-0.5">
              Visitors exploring 4 advisory pillars
            </p>
          </div>
          <div className="w-full bg-[#D9D9D9] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#BE905F] h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.serviceDiscoveryRate}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Lead Capture Rate */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[130px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#747374]">Lead Conversion</span>
            <div className="w-7 h-7 rounded-[5px] bg-[#DCF1DD] text-[#3E7A41] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#3E7A41]">{kpis.leadCaptureRate}%</div>
            <p className="text-[11px] text-[#8B8B8B] mt-0.5">
              {totals.leads} inquiries submitted
            </p>
          </div>
          <div className="w-full bg-[#D9D9D9] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#3E7A41] h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.leadCaptureRate}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Human Handoff Rate */}
        <div className="bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E3E3E3] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[130px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#747374]">Direct Partner Outreach</span>
            <div className="w-7 h-7 rounded-[5px] bg-[#DCF1DD] text-[#3E7A41] flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#3E7A41]">{kpis.humanHandoffRate}%</div>
            <p className="text-[11px] text-[#8B8B8B] mt-0.5">
              Direct clicks to WhatsApp advisory
            </p>
          </div>
          <div className="w-full bg-[#D9D9D9] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#3E7A41] h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.humanHandoffRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Visitor Behavior Breakdown + Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Event Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-[#F5F5F5] rounded-[10px] p-5 border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="border-b border-[#E3E3E3] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#747374] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#5FA0BE]" />
                <span>Visitor Interaction Stages</span>
              </h3>
              <p className="text-[11px] text-[#8B8B8B] mt-0.5">
                How visitors move through the consultation funnel
              </p>
            </div>
            <span className="text-[10px] text-[#8B8B8B]">Total Funnel</span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Chatbot Opened', key: 'chatbot_opened', color: 'bg-[#5FA0BE]' },
              { label: 'Conversation Started', key: 'conversation_started', color: 'bg-[#558BA4]' },
              { label: 'Advisory Need Selected', key: 'intent_selected', color: 'bg-[#BE905F]' },
              { label: 'Specific Question Asked', key: 'question_asked', color: 'bg-[#94839D]' },
              { label: 'Service Details Explored', key: 'service_viewed', color: 'bg-[#5CA65F]' },
              { label: 'Consultation Form Opened', key: 'lead_form_opened', color: 'bg-[#BE905F]' },
              { label: 'Consultation Lead Submitted', key: 'lead_submitted', color: 'bg-[#3E7A41]' },
              { label: 'WhatsApp / Call Clicked', key: 'contact_clicked', color: 'bg-[#3E7A41]' }
            ].map((evt) => {
              const count = eventsDistribution[evt.key] || 0;
              const maxCount = Math.max(...Object.values(eventsDistribution as Record<string, number>), 1);
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <div key={evt.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#747374] text-[11px]">{evt.label}</span>
                    <span className="font-bold text-[#747374] text-xs">{count}</span>
                  </div>
                  <div className="w-full bg-[#D9D9D9] rounded-full h-2 overflow-hidden">
                    <div
                      className={`${evt.color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Activity Live Stream (6 cols) */}
        <div className="lg:col-span-6 bg-[#F5F5F5] rounded-[10px] p-5 border border-[#E3E3E3] shadow-[0px_4px_8px_rgba(0,0,0,0.06),0px_0px_4px_rgba(0,0,0,0.04)] flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3">
            <div>
              <h3 className="font-bold text-xs text-[#747374] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3E7A41]" />
                <span>Live Visitor Activity Feed</span>
              </h3>
              <p className="text-[11px] text-[#8B8B8B] mt-0.5">
                Real-time actions by website visitors
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="text-xs text-[#5FA0BE] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2 pr-1">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.map((e: any) => (
                <div
                  key={e.id}
                  className="p-3 bg-white hover:bg-[#EAEAEA]/60 rounded-[8px] border border-[#E3E3E3] text-xs transition-colors flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5FA0BE] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#747374] block">
                        {formatEventName(e.event_name)}
                      </span>
                      <p className="text-[11px] text-[#8B8B8B] mt-0.5 leading-relaxed">
                        {formatEventMetadata(e.event_name, e.metadata)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8B8B8B] whitespace-nowrap font-mono">
                    {new Date(e.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#8B8B8B] text-xs">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
