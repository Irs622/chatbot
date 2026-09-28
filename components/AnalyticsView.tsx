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
  BarChart2
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
  region: string;
  inquiries: number;
  pct: number;
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
    if (!data?.questions) return [];
    return data.questions.filter((q: ClientQuestion) => {
      const matchSearch =
        !questionSearch.trim() ||
        q.question.toLowerCase().includes(questionSearch.toLowerCase().trim()) ||
        q.intent.toLowerCase().includes(questionSearch.toLowerCase().trim());
      const matchIntent =
        selectedIntentFilter === 'all' ||
        q.intent.toLowerCase().includes(selectedIntentFilter.toLowerCase());
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

  const { totals, kpis, hourlyDistribution, timeSlots, locationDistribution, questions } = data;

  return (
    <div className="space-y-6">
      {/* 1. Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Analytics Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Chatbot visitor volume, engagement, and conversion metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Top Summary Metrics (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Conversations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totals.conversations}</div>
          <div className="text-[11px] text-slate-400 mt-1">{kpis.engagementRate}% engagement rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-emerald-600 font-medium">Client Inquiries</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totals.leads}</div>
          <div className="text-[11px] text-slate-400 mt-1">{kpis.leadCaptureRate}% capture rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-sky-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Peak Hours</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">14:00 - 18:00</div>
          <div className="text-[11px] text-slate-400 mt-1">WIB (Business Afternoon)</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Top Region</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">Jabodetabek</div>
          <div className="text-[11px] text-slate-400 mt-1">52% of total inquiries</div>
        </div>
      </div>

      {/* 3. Graphical Section: Traffic by Hour (Kapan) & Geography (Dimana) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hourly Traffic Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>Hourly Visitor Access Distribution (WIB)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                When visitors ask questions and seek corporate advisory
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded self-start sm:self-auto">
              Peak: 14:00 - 18:00 WIB
            </span>
          </div>

          {/* 24-Hour Bar Chart Visualization */}
          <div className="pt-2">
            <div className="h-32 flex items-end justify-between gap-1 px-1">
              {hourlyDistribution?.map((item: HourlyData) => {
                const isPeak = item.hour >= 13 && item.hour <= 18;
                return (
                  <div
                    key={item.hour}
                    className="flex-1 flex flex-col items-center gap-1.5 group relative"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                      {item.label}: {item.count} messages
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t h-24 flex items-end overflow-hidden">
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

                    {/* Hour Label (show every 3 hours for readability) */}
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

          {/* Time Slot Aggregation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            {timeSlots?.map((slot: TimeSlot, i: number) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-xs ${
                  slot.isPeak
                    ? 'bg-sky-50/70 border-sky-200 text-sky-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-[10px] font-medium opacity-80">{slot.label.split('(')[0]}</div>
                <div className="text-sm font-bold mt-0.5">{slot.count} inquiries</div>
                <div className="text-[10px] opacity-70 mt-0.5">{slot.pct}% of total</div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Origin / Location (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Visitor & Inquiry Location Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Geographic origin of corporate advisory requests
            </p>
          </div>

          {/* Location Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {locationDistribution?.map((loc: LocationData, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{loc.region}</span>
                  <span className="font-semibold text-slate-600">{loc.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-slate-900'
                        : idx === 1
                        ? 'bg-sky-600'
                        : idx === 2
                        ? 'bg-amber-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${loc.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Device & Channel Context */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <span className="text-[11px] font-semibold text-slate-500 block">Access Channels:</span>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span>Mobile Smartphone (WhatsApp / Web)</span>
              <strong className="text-slate-800 font-semibold">68%</strong>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Desktop (Corporate Office / Laptop)</span>
              <strong className="text-slate-800 font-semibold">32%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real List of Questions Asked by Clients (Apa Aja List Pertanyaannya) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
        {/* Header, Search & Topic Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <span>Client Questions Log</span>
              </h3>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {filteredQuestions.length} questions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact questions and inquiries typed by website visitors to the AI Assistant
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              placeholder="Search in questions..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'profitability', label: 'Profitability & Margin' },
            { id: 'funding', label: 'Funding & Investment' },
            { id: 'growth', label: 'Business Growth' },
            { id: 'capacity', label: 'Executive Program' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedIntentFilter(pill.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedIntentFilter === pill.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No questions found matching your filter.
            </div>
          ) : (
            filteredQuestions.slice(0, 30).map((item: ClientQuestion, idx: number) => {
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
                <div key={item.id || idx} className="p-3.5 hover:bg-slate-50/70 transition-colors text-xs space-y-2">
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
                        className="text-slate-400 hover:text-slate-600 p-1 rounded"
                        title="Copy question"
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
                          className="text-xs text-sky-600 hover:underline flex items-center gap-0.5 p-1 font-medium"
                        >
                          <span>{isExpanded ? 'Hide Answer' : 'View Answer'}</span>
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
      </div>
    </div>
  );
}
