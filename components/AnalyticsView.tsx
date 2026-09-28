'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  PhoneCall,
  Activity,
  RefreshCw,
  Clock,
  MapPin,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  BarChart2,
  Globe,
  Building2,
  Compass
} from 'lucide-react';

interface HourlyData {
  hour: number;
  label: string;
  count: number;
  percentage: number;
}

interface TimeSlot {
  label: string;
  count: number;
  pct: number;
  isPeak?: boolean;
}

interface LocationData {
  country: string;
  code: string;
  flag: string;
  region: string;
  hub: string;
  scope: string;
  inquiries: number;
  pct: number;
}

interface TimezoneData {
  zone: string;
  label: string;
  offset: string;
  hours: string;
  share: string;
}

interface ClientQuestion {
  id: string;
  conversation_id: string;
  question: string;
  intent: string;
  created_at: string;
  bot_answer_preview?: string;
}

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedIntentFilter, setSelectedIntentFilter] = useState('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyQuestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = useMemo(() => {
    if (!data?.questions || !Array.isArray(data.questions)) return [];
    return data.questions.filter((q: ClientQuestion) => {
      const qText = (q.question || '').toLowerCase();
      const qIntent = (q.intent || '').toLowerCase();
      const search = questionSearch.toLowerCase().trim();

      const matchSearch =
        !search ||
        qText.includes(search) ||
        qIntent.includes(search);

      let matchIntent = true;
      if (selectedIntentFilter === 'funding') {
        matchIntent = qIntent.includes('funding') || qIntent.includes('invest');
      } else if (selectedIntentFilter === 'profitability') {
        matchIntent = qIntent.includes('profit') || qIntent.includes('margin') || qIntent.includes('cost');
      } else if (selectedIntentFilter === 'growth') {
        matchIntent = qIntent.includes('growth') || qIntent.includes('market') || qIntent.includes('pma');
      } else if (selectedIntentFilter === 'capacity') {
        matchIntent = qIntent.includes('capacity') || qIntent.includes('executive') || qIntent.includes('program');
      }

      return matchSearch && matchIntent;
    });
  }, [data?.questions, questionSearch, selectedIntentFilter]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 text-xs">
        <Activity className="w-5 h-5 animate-spin mr-2 text-slate-900" />
        <span>Loading analytics data...</span>
      </div>
    );
  }

  const { totals, kpis, hourlyDistribution, timeSlots, locationDistribution, timezones, questions } = data;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR: Section Title & Global Action */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Analytics Overview</h2>
            <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>International & Inbound</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-border visitor inquiries, global traffic volume, and consultation conversion metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. PRIMARY HERO BLOCK: Client Questions Log (Fixed Height: 480px) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs h-[480px] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <span>Client Questions & Inquiries Log</span>
              </h3>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {filteredQuestions.length} logged
              </span>
            </div>

            {/* Fixed Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search in questions or topics..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Topic Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'funding', label: 'Funding & Investment' },
              { id: 'profitability', label: 'Profitability & Margin' },
              { id: 'growth', label: 'Business Growth & Market Entry' },
              { id: 'capacity', label: 'Executive Program' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedIntentFilter(pill.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedIntentFilter === pill.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Questions List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredQuestions.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No questions found matching your search or filter.
            </div>
          ) : (
            filteredQuestions.map((item: ClientQuestion, idx: number) => {
              const isExpanded = expandedQuestionId === item.id;
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) + ' SGT/WIB'
                : '-';

              return (
                <div key={item.id || idx} className="p-3 hover:bg-slate-50/70 rounded-lg transition-colors text-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.intent}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{dateStr}</span>
                      </div>
                      <p className="font-medium text-slate-900 text-xs sm:text-sm leading-relaxed">
                        &quot;{item.question}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyQuestion(item.question, item.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
                        title="Copy question text"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {item.bot_answer_preview && (
                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : item.id)}
                          className="text-xs text-sky-600 hover:underline flex items-center gap-0.5 p-1 font-medium cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide' : 'Answer'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Bot Answer Preview */}
                  {isExpanded && item.bot_answer_preview && (
                    <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed font-sans animate-in fade-in">
                      <strong className="text-slate-900 block mb-1">AI Assistant Answer:</strong>
                      {item.bot_answer_preview}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span>Showing {filteredQuestions.length} of {data?.questions?.length || 0} client inquiries</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Visitor Stream
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SECONDARY LEVEL: 4 Uniform KPI Cards (Fixed Height: 110px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[110px] flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Conversations</div>
          <div className="text-2xl font-bold text-slate-900">{totals.conversations}</div>
          <div className="text-[11px] text-slate-400">{kpis.engagementRate}% engagement rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[110px] flex flex-col justify-between">
          <div className="text-xs text-emerald-600 font-medium">Advisory Inquiries</div>
          <div className="text-2xl font-bold text-emerald-600">{totals.leads}</div>
          <div className="text-[11px] text-slate-400">{kpis.leadCaptureRate}% capture rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[110px] flex flex-col justify-between">
          <div className="text-xs text-sky-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Peak Consultation Hours</span>
          </div>
          <div className="text-xl font-bold text-slate-900">14:00 - 18:00</div>
          <div className="text-[11px] text-slate-400">SGT / WIB (APAC & EMEA)</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[110px] flex flex-col justify-between">
          <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Top International Hub</span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <span>🇸🇬 Singapore</span>
          </div>
          <div className="text-[11px] text-slate-400">32% of cross-border inquiries</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TERTIARY LEVEL: 2 Balanced Analytics Cards (Matching Height: 460px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: Hourly Traffic Across Global Timezones (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[460px] flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>24-Hour Global Inbound Traffic (SGT / WIB)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hourly activity by prospective clients and international investors
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Peak: 14:00 - 18:00 SGT
            </span>
          </div>

          {/* 24-Hour Bar Chart Body */}
          <div className="py-2">
            <div className="h-28 flex items-end justify-between gap-1 px-1">
              {hourlyDistribution?.map((item: HourlyData) => {
                const isPeak = item.hour >= 13 && item.hour <= 18;
                return (
                  <div
                    key={item.hour}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                      {item.label} SGT: {item.count} messages
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t h-20 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          item.count === 0
                            ? 'h-0'
                            : isPeak
                            ? 'bg-sky-600 hover:bg-sky-700'
                            : 'bg-slate-400 hover:bg-slate-500'
                        }`}
                        style={{ height: `${Math.max(item.percentage, item.count > 0 ? 12 : 0)}%` }}
                      />
                    </div>

                    {/* Hour Label */}
                    <span className="text-[9px] text-slate-400 font-mono">
                      {item.hour % 3 === 0 ? item.hour : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span>00:00 (Midnight)</span>
              <span>12:00 (Noon)</span>
              <span>23:00 (Night)</span>
            </div>
          </div>

          {/* Global Timezones Chips Footer */}
          <div className="pt-2 border-t border-slate-100 shrink-0 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              <span>Inbound Timezone Activity:</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {timezones?.map((tz: TimezoneData, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="truncate pr-1">
                    <span className="font-semibold text-slate-900 block text-[11px] truncate">{tz.zone}</span>
                    <span className="text-[10px] text-slate-500 truncate">{tz.label}</span>
                  </div>
                  <span className="font-bold text-slate-700 text-xs bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {tz.share}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: International Locations Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[460px] flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>International Client Locations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cross-border advisory & FDI market entry hubs
              </p>
            </div>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Global
            </span>
          </div>

          {/* Location Progress List */}
          <div className="space-y-3 py-1 overflow-y-auto">
            {locationDistribution?.map((loc: LocationData, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900 truncate">
                    <span className="text-sm">{loc.flag}</span>
                    <span className="truncate">{loc.country}</span>
                    <span className="text-[10px] text-slate-400 font-normal truncate">({loc.hub})</span>
                  </div>
                  <span className="font-semibold text-slate-700 shrink-0 ml-1">{loc.pct}%</span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-sky-600'
                        : idx === 1
                        ? 'bg-slate-900'
                        : idx === 2
                        ? 'bg-rose-600'
                        : idx === 3
                        ? 'bg-indigo-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${loc.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box Footer */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 shrink-0 space-y-1">
            <strong className="text-slate-900 block text-[11px] font-semibold">
              🌐 Key International Inbound Takeaway:
            </strong>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Singapore and East Asian corporate entities (Japan & Korea) represent <strong>58% of cross-border demand</strong>, focusing on FDI entity setup (PT PMA) and regional M&A.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
