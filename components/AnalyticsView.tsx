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
  Compass,
  Flame,
  ArrowRight,
  Filter,
  Layers,
  Award,
  Zap
} from 'lucide-react';

interface FunnelStage {
  id: string;
  label: string;
  description: string;
  count: number;
  conversionPct: number;
  dropoffPct: number;
}

interface IntentStat {
  intent: string;
  label: string;
  count: number;
  pct: number;
  color: string;
}

interface LanguageStat {
  code: 'id' | 'en' | 'ko';
  label: string;
  flag: string;
  count: number;
  pct: number;
}

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
  inquiries: number;
  pct: number;
}

interface TimezoneData {
  zone: string;
  label: string;
  offset: string;
  hours: string;
  count: number;
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
      if (selectedIntentFilter === 'strategy') {
        matchIntent = qIntent.includes('strategy') || qIntent.includes('corporate') || qIntent.includes('m&a');
      } else if (selectedIntentFilter === 'investment') {
        matchIntent = qIntent.includes('invest') || qIntent.includes('feasibility') || qIntent.includes('project');
      } else if (selectedIntentFilter === 'market') {
        matchIntent = qIntent.includes('market') || qIntent.includes('expansion') || qIntent.includes('access');
      } else if (selectedIntentFilter === 'cross_border') {
        matchIntent = qIntent.includes('cross') || qIntent.includes('joint') || qIntent.includes('pma');
      } else if (selectedIntentFilter === 'human_capital') {
        matchIntent = qIntent.includes('human') || qIntent.includes('capital') || qIntent.includes('executive');
      }

      return matchSearch && matchIntent;
    });
  }, [data?.questions, questionSearch, selectedIntentFilter]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 text-xs">
        <Activity className="w-5 h-5 animate-spin mr-2 text-slate-900" />
        <span>Loading dynamic analytics telemetry...</span>
      </div>
    );
  }

  const {
    totals,
    kpis,
    funnel = [],
    intentDistribution = [],
    languageDistribution = [],
    hourlyDistribution = [],
    timeSlots = [],
    locationDistribution = [],
    timezones = []
  } = data;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR: Section Title & Global Action */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Real-Time Inbound Analytics</h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry Engine</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic conversion funnel, real visitor language breakdown, and advisory demand distribution.
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
      {/* 2. TOP METRICS ROW: 4 Uniform KPI Cards (Fixed Height: 105px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Total Conversations</div>
          <div className="text-2xl font-bold text-slate-900">{totals.conversations}</div>
          <div className="text-[11px] text-slate-400">{kpis.engagementRate}% engagement rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-emerald-600 font-medium">Advisory Inquiries</div>
          <div className="text-2xl font-bold text-emerald-600">{totals.leads}</div>
          <div className="text-[11px] text-slate-400">{kpis.leadCaptureRate}% capture rate</div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs h-[105px] flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/30">
          <div className="text-xs text-rose-700 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Hot Opportunities (T1)</span>
            </span>
            <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">
              Avg {totals.avgScore} pts
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-700">{totals.hotLeads}</div>
          <div className="text-[11px] text-rose-600/80 font-medium">Score &ge; 70 (&lt; 2h SLA)</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-[105px] flex flex-col justify-between">
          <div className="text-xs text-[#0779D1] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Peak Traffic Window</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 truncate">
            {kpis.peakHoursLabel}
          </div>
          <div className="text-[11px] text-slate-400">Primary: {kpis.topLanguageLabel}</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MIDDLE LEVEL: 6-Stage Funnel & Service Demand (Matching: 460px) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: 6-Stage Client Inbound Funnel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[460px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0779D1]" />
                <span>6-Stage Client Inbound Conversion Funnel</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step-by-step conversion from visitor arrival to corporate advisor handoff
              </p>
            </div>
            <span className="text-[10px] font-semibold bg-[#0779D1]/10 text-[#0779D1] px-2 py-0.5 rounded border border-[#0779D1]/20">
              {kpis.leadCaptureRate}% Lead Rate
            </span>
          </div>

          {/* Funnel Steps Body */}
          <div className="py-2 space-y-2.5 overflow-y-auto">
            {funnel.map((stage: FunnelStage, idx: number) => {
              const stepColors = [
                'bg-slate-700',
                'bg-[#0779D1]',
                'bg-indigo-600',
                'bg-amber-600',
                'bg-emerald-600',
                'bg-rose-600'
              ];
              const color = stepColors[idx % stepColors.length];

              return (
                <div key={stage.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{stage.label}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">({stage.description})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-800">{stage.count}</span>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                        {stage.conversionPct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${Math.max(stage.conversionPct, stage.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>

                  {idx > 0 && stage.dropoffPct > 0 && (
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <span>Step drop-off:</span>
                      <span className="text-rose-500 font-medium font-mono">-{stage.dropoffPct}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Funnel Footer */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 shrink-0 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Conversion Optimization:</span>
            </span>
            <span className="font-bold text-slate-800">
              {kpis.humanHandoffRate}% Direct WhatsApp Hand-offs
            </span>
          </div>
        </div>

        {/* Right Card: Advisory Pillar & Language Demand (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[460px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#0779D1]" />
                <span>Advisory Pillars & Languages</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of client demand across core competencies
              </p>
            </div>
          </div>

          {/* 5 Pillars Progress Bars */}
          <div className="space-y-2.5 py-1 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Inbound Advisory Pillar Share:
            </span>
            {intentDistribution.map((item: IntentStat) => (
              <div key={item.intent} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate max-w-[190px]">{item.label}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-400">{item.count} inq</span>
                    <span className="font-bold text-slate-700">{item.pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.pct, item.count > 0 ? 6 : 0)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Language Share Breakdown Footer */}
          <div className="pt-2.5 border-t border-slate-100 shrink-0 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Session Language Telemetry:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {languageDistribution.map((lang: LanguageStat) => (
                <div key={lang.code} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-base mb-0.5">{lang.flag}</div>
                  <span className="font-bold text-slate-900 block text-xs">{lang.pct}%</span>
                  <span className="text-[9px] text-slate-400 block truncate">{lang.code.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TRAFFIC & LOCATIONS: Hourly Activity & Geographic Distribution */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: 24-Hour Inbound Traffic (7 cols, Fixed Height: 440px) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[440px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0779D1]" />
                <span>24-Hour Traffic Distribution (WIB / UTC+7)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hourly message distribution from prospective clients and investors
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Peak: {kpis.peakHoursLabel}
            </span>
          </div>

          {/* 24-Hour Bar Chart */}
          <div className="py-2">
            <div className="h-28 flex items-end justify-between gap-1 px-1">
              {hourlyDistribution.map((item: HourlyData) => {
                const isPeak = item.hour >= 13 && item.hour <= 17;
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                      {item.label} WIB: {item.count} messages
                    </div>
                    <div className="w-full bg-slate-100 rounded-t h-20 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          item.count === 0
                            ? 'h-0'
                            : isPeak
                            ? 'bg-[#0779D1] hover:bg-[#0668b3]'
                            : 'bg-slate-400 hover:bg-slate-500'
                        }`}
                        style={{ height: `${Math.max(item.percentage, item.count > 0 ? 12 : 0)}%` }}
                      />
                    </div>
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

          {/* Timezone Activity Footer */}
          <div className="pt-2 border-t border-slate-100 shrink-0 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              <span>Inbound Timezone Activity:</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {timezones.map((tz: TimezoneData, i: number) => (
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

        {/* Right Card: International Inbound Locations (5 cols, Fixed Height: 440px) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-[440px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#0779D1]" />
                <span>Client Geographic Origin</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Derived dynamically from contact prefixes and inbound telemetry
              </p>
            </div>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          {/* Location Progress List */}
          <div className="space-y-3 py-1 overflow-y-auto">
            {locationDistribution.map((loc: LocationData, idx: number) => (
              <div key={loc.code || idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900 truncate">
                    <span className="text-sm">{loc.flag}</span>
                    <span className="truncate">{loc.country}</span>
                    <span className="text-[10px] text-slate-400 font-normal truncate">({loc.region})</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-400">{loc.inquiries} inq</span>
                    <span className="font-bold text-slate-700">{loc.pct}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-[#0779D1]'
                        : idx === 1
                        ? 'bg-emerald-600'
                        : idx === 2
                        ? 'bg-rose-600'
                        : idx === 3
                        ? 'bg-indigo-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(loc.pct, loc.inquiries > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Geographic Summary Footer */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 shrink-0 space-y-1">
            <strong className="text-slate-900 block text-[11px] font-semibold">
              🌐 Inbound Telemetry Summary:
            </strong>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Data reflects real-time telemetry from active client inquiries, regional contact codes, and trilingual chat interactions.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. PRIMARY INQUIRIES LOG: Client Questions Log (Fixed Height: 480px) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs h-[480px] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#0779D1]" />
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
              { id: 'strategy', label: 'Strategy & Corporate' },
              { id: 'investment', label: 'Investment & Feasibility' },
              { id: 'market', label: 'Market Access & GTM' },
              { id: 'cross_border', label: 'Cross-Border & JV' },
              { id: 'human_capital', label: 'Executive Program & HC' }
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
                  }) + ' WIB'
                : '-';

              return (
                <div key={item.id || idx} className="p-3 hover:bg-slate-50/70 rounded-lg transition-colors text-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
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
                          className="text-xs text-[#0779D1] hover:underline flex items-center gap-0.5 p-1 font-medium cursor-pointer"
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
    </div>
  );
}
