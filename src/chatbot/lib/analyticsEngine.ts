/**
 * INPARTNER AI — Dynamic Telemetry, Real-time Analytics & Funnel Engine
 * PT Inpartner Optima Integra • Multi-Variable Inbound Intelligence
 */

import type { DatabaseSchema, AnalyticsEvent, Conversation, Message, Lead } from './db.ts';
import { detectLanguage } from './language.ts';

export interface FunnelStage {
  id: string;
  label: string;
  description: string;
  count: number;
  conversionPct: number;
  dropoffPct: number;
}

export interface IntentStat {
  intent: string;
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface LanguageStat {
  code: 'id' | 'en' | 'ko';
  label: string;
  flag: string;
  count: number;
  pct: number;
}

export interface HourlyTraffic {
  hour: number;
  label: string;
  count: number;
  percentage: number;
}

export interface CountryStat {
  country: string;
  code: string;
  flag: string;
  region: string;
  hub: string;
  inquiries: number;
  pct: number;
}

export interface TimezoneStat {
  zone: string;
  label: string;
  offset: string;
  hours: string;
  count: number;
  share: string;
}

export interface AnalyticsSummaryResult {
  totals: {
    conversations: number;
    messages: number;
    leads: number;
    events: number;
    hotLeads: number;
    avgScore: number;
  };
  kpis: {
    engagementRate: number;
    serviceDiscoveryRate: number;
    leadCaptureRate: number;
    humanHandoffRate: number;
    peakHoursLabel: string;
    topLanguageLabel: string;
  };
  funnel: FunnelStage[];
  intentDistribution: IntentStat[];
  languageDistribution: LanguageStat[];
  hourlyDistribution: HourlyTraffic[];
  timeSlots: Array<{ label: string; count: number; pct: number; isPeak?: boolean }>;
  locationDistribution: CountryStat[];
  timezones: TimezoneStat[];
  questions: Array<{
    id: string;
    conversation_id: string;
    question: string;
    intent: string;
    created_at: string;
    bot_answer_preview?: string;
  }>;
  recentEvents: AnalyticsEvent[];
}

const COUNTRY_DIALING_MAP: Array<{
  prefix: string;
  country: string;
  code: string;
  flag: string;
  region: string;
  hub: string;
}> = [
  { prefix: '62', country: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Domestic Market', hub: 'Jakarta & Surabaya' },
  { prefix: '+62', country: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Domestic Market', hub: 'Jakarta & Surabaya' },
  { prefix: '08', country: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Domestic Market', hub: 'Jakarta & Surabaya' },
  { prefix: '82', country: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'East Asia', hub: 'Seoul & Pangyo' },
  { prefix: '+82', country: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'East Asia', hub: 'Seoul & Pangyo' },
  { prefix: '65', country: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'APAC Hub', hub: 'Marina Bay & Raffles' },
  { prefix: '+65', country: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'APAC Hub', hub: 'Marina Bay & Raffles' },
  { prefix: '81', country: 'Japan', code: 'JP', flag: '🇯🇵', region: 'East Asia', hub: 'Tokyo & Osaka' },
  { prefix: '+81', country: 'Japan', code: 'JP', flag: '🇯🇵', region: 'East Asia', hub: 'Tokyo & Osaka' },
  { prefix: '86', country: 'China', code: 'CN', flag: '🇨🇳', region: 'East Asia', hub: 'Shanghai & Beijing' },
  { prefix: '+86', country: 'China', code: 'CN', flag: '🇨🇳', region: 'East Asia', hub: 'Shanghai & Beijing' },
  { prefix: '60', country: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'ASEAN', hub: 'Kuala Lumpur' },
  { prefix: '+60', country: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'ASEAN', hub: 'Kuala Lumpur' },
  { prefix: '61', country: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Pacific', hub: 'Sydney & Melbourne' },
  { prefix: '+61', country: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Pacific', hub: 'Sydney & Melbourne' },
  { prefix: '971', country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Middle East', hub: 'Dubai & Abu Dhabi' },
  { prefix: '+971', country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Middle East', hub: 'Dubai & Abu Dhabi' },
  { prefix: '966', country: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East', hub: 'Riyadh' },
  { prefix: '+966', country: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East', hub: 'Riyadh' },
  { prefix: '1', country: 'United States & Canada', code: 'US', flag: '🇺🇸', region: 'North America', hub: 'New York & San Francisco' },
  { prefix: '+1', country: 'United States & Canada', code: 'US', flag: '🇺🇸', region: 'North America', hub: 'New York & San Francisco' },
  { prefix: '44', country: 'United Kingdom', code: 'UK', flag: '🇬🇧', region: 'Europe', hub: 'London' },
  { prefix: '+44', country: 'United Kingdom', code: 'UK', flag: '🇬🇧', region: 'Europe', hub: 'London' },
  { prefix: '32', country: 'Belgium', code: 'BE', flag: '🇧🇪', region: 'Europe', hub: 'Brussels' },
  { prefix: '+32', country: 'Belgium', code: 'BE', flag: '🇧🇪', region: 'Europe', hub: 'Brussels' },
  { prefix: '41', country: 'Switzerland', code: 'CH', flag: '🇨🇭', region: 'Europe', hub: 'Zurich & Geneva' },
  { prefix: '+41', country: 'Switzerland', code: 'CH', flag: '🇨🇭', region: 'Europe', hub: 'Zurich & Geneva' }
];

export function computeDynamicAnalytics(db: DatabaseSchema): AnalyticsSummaryResult {
  const conversations = db.conversations || [];
  const messages = db.messages || [];
  const leads = db.leads || [];
  const events = db.analytics_events || [];

  const totalConversations = conversations.length;
  const totalMessages = messages.length;
  const totalLeads = leads.length;
  const totalEvents = events.length;

  // 1. Hot Leads and Average Lead Score
  const hotLeads = leads.filter((l) => l.priority_tier === 'tier_1' || (l.score !== undefined && l.score >= 70)).length;
  const scoresArray = leads.map((l) => l.score).filter((s): s is number => typeof s === 'number');
  const avgScore = scoresArray.length > 0
    ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length)
    : 0;

  // 2. Event frequency map
  const eventsByName: Record<string, number> = {};
  for (const e of events) {
    eventsByName[e.event_name] = (eventsByName[e.event_name] || 0) + 1;
  }

  // 3. 6-Stage Conversion Funnel Calculation
  const openedCount = Math.max(eventsByName['chatbot_opened'] || 0, totalConversations, 1);
  const questionsCount = Math.max(
    eventsByName['question_asked'] || 0,
    messages.filter((m) => m.sender === 'user').length,
    totalConversations
  );
  const serviceViewedCount = eventsByName['service_viewed'] || eventsByName['intent_selected'] || Math.round(questionsCount * 0.7);
  const formOpenedCount = eventsByName['lead_form_opened'] || Math.max(totalLeads, Math.round(serviceViewedCount * 0.45));
  const leadSubmittedCount = Math.max(eventsByName['lead_submitted'] || 0, totalLeads);
  const handoffCount = (eventsByName['contact_clicked'] || 0) + (eventsByName['human_handoff'] || 0);

  const rawFunnelCounts = [
    { id: 'opened', label: '1. Widget Activated', description: 'Chatbot opened by visitor', count: openedCount },
    { id: 'question', label: '2. Query Submitted', description: 'First business question asked', count: Math.min(questionsCount, openedCount) },
    { id: 'service', label: '3. Advisory Explored', description: 'Advisory pillar recommendation engaged', count: Math.min(serviceViewedCount, questionsCount) },
    { id: 'form', label: '4. Form Opened', description: 'Consultation booking form launched', count: Math.min(formOpenedCount, serviceViewedCount) },
    { id: 'lead', label: '5. Lead Submitted', description: 'Corporate details submitted to BD', count: Math.min(leadSubmittedCount, formOpenedCount) },
    { id: 'handoff', label: '6. WhatsApp Handoff', description: 'Direct 1-on-1 advisor chat triggered', count: handoffCount }
  ];

  const funnel: FunnelStage[] = rawFunnelCounts.map((stage, idx) => {
    const topCount = rawFunnelCounts[0].count;
    const prevCount = idx === 0 ? stage.count : rawFunnelCounts[idx - 1].count;
    const conversionPct = topCount > 0 ? Math.round((stage.count / topCount) * 100) : 0;
    const dropoffPct = prevCount > 0 ? Math.max(0, Math.round(((prevCount - stage.count) / prevCount) * 100)) : 0;

    return {
      id: stage.id,
      label: stage.label,
      description: stage.description,
      count: stage.count,
      conversionPct,
      dropoffPct
    };
  });

  // 4. KPIs
  const engagementRate = Math.min(100, Math.round((totalConversations / Math.max(openedCount, 1)) * 100));
  const serviceDiscoveryRate = Math.min(100, Math.round((serviceViewedCount / Math.max(totalConversations, 1)) * 100));
  const leadCaptureRate = Math.min(100, Math.round((totalLeads / Math.max(totalConversations, 1)) * 100));
  const humanHandoffRate = Math.min(100, Math.round((handoffCount / Math.max(totalConversations, 1)) * 100));

  // 5. Dynamic Language Detection Breakdown
  let idCount = 0;
  let enCount = 0;
  let koCount = 0;

  for (const m of messages) {
    if (m.sender === 'user' && m.message) {
      const l = detectLanguage(m.message);
      if (l === 'ko') koCount++;
      else if (l === 'en') enCount++;
      else idCount++;
    }
  }

  // Also include leads in language tracking
  for (const l of leads) {
    const text = `${l.name} ${l.company || ''} ${l.business_need} ${l.notes || ''}`;
    const detected = detectLanguage(text);
    if (detected === 'ko') koCount++;
    else if (detected === 'en') enCount++;
    else idCount++;
  }

  const totalLang = idCount + enCount + koCount || 1;
  const languageDistribution: LanguageStat[] = [
    {
      code: 'id' as const,
      label: 'Bahasa Indonesia',
      flag: '🇮🇩',
      count: idCount,
      pct: Math.round((idCount / totalLang) * 100)
    },
    {
      code: 'en' as const,
      label: 'English (Corporate)',
      flag: '🇬🇧',
      count: enCount,
      pct: Math.round((enCount / totalLang) * 100)
    },
    {
      code: 'ko' as const,
      label: 'Korean (한국어)',
      flag: '🇰🇷',
      count: koCount,
      pct: Math.round((koCount / totalLang) * 100)
    }
  ].sort((a, b) => b.count - a.count);

  const topLanguageLabel = languageDistribution[0]?.label || 'Bahasa Indonesia';

  // 6. Dynamic Intent & Service Pillar Distribution
  const intentCounts: Record<string, number> = {
    strategy_corporate: 0,
    investment_advisory: 0,
    market_access: 0,
    cross_border: 0,
    human_capital: 0,
    company_info: 0
  };

  for (const c of conversations) {
    const intent = c.user_intent || 'strategy_corporate';
    if (intent.includes('strategy') || intent.includes('corporate') || intent.includes('m&a') || intent.includes('ipo')) {
      intentCounts.strategy_corporate++;
    } else if (intent.includes('invest') || intent.includes('feasibility') || intent.includes('project')) {
      intentCounts.investment_advisory++;
    } else if (intent.includes('market') || intent.includes('expansion') || intent.includes('access')) {
      intentCounts.market_access++;
    } else if (intent.includes('cross') || intent.includes('joint') || intent.includes('border') || intent.includes('pma')) {
      intentCounts.cross_border++;
    } else if (intent.includes('human') || intent.includes('capital') || intent.includes('executive') || intent.includes('talent')) {
      intentCounts.human_capital++;
    } else {
      intentCounts.company_info++;
    }
  }

  for (const m of messages) {
    if (m.intent) {
      if (intentCounts[m.intent] !== undefined) {
        intentCounts[m.intent]++;
      }
    }
  }

  for (const l of leads) {
    const need = (l.business_need || '').toLowerCase();
    if (need.includes('strategy') || need.includes('m&a') || need.includes('ipo') || need.includes('restrukturisasi')) {
      intentCounts.strategy_corporate += 2;
    } else if (need.includes('invest') || need.includes('feasibility') || need.includes('fs') || need.includes('project')) {
      intentCounts.investment_advisory += 2;
    } else if (need.includes('market') || need.includes('distributor') || need.includes('gtm')) {
      intentCounts.market_access += 2;
    } else if (need.includes('cross') || need.includes('joint') || need.includes('pma') || need.includes('foreign')) {
      intentCounts.cross_border += 2;
    } else if (need.includes('human') || need.includes('search') || need.includes('executive')) {
      intentCounts.human_capital += 2;
    } else {
      intentCounts.company_info++;
    }
  }

  const totalIntents = Object.values(intentCounts).reduce((a, b) => a + b, 0) || 1;
  const intentDistribution: IntentStat[] = [
    {
      intent: 'strategy_corporate',
      label: 'Strategy & Corporate Advisory',
      count: intentCounts.strategy_corporate,
      pct: Math.round((intentCounts.strategy_corporate / totalIntents) * 100),
      color: '#0779D1'
    },
    {
      intent: 'investment_advisory',
      label: 'Investment & Project Advisory',
      count: intentCounts.investment_advisory,
      pct: Math.round((intentCounts.investment_advisory / totalIntents) * 100),
      color: '#059669'
    },
    {
      intent: 'market_access',
      label: 'Market Access & Business Expansion',
      count: intentCounts.market_access,
      pct: Math.round((intentCounts.market_access / totalIntents) * 100),
      color: '#D97706'
    },
    {
      intent: 'cross_border',
      label: 'Cross-Border & Technology Advisory',
      count: intentCounts.cross_border,
      pct: Math.round((intentCounts.cross_border / totalIntents) * 100),
      color: '#7C3AED'
    },
    {
      intent: 'human_capital',
      label: 'Human Capital & Organization',
      count: intentCounts.human_capital,
      pct: Math.round((intentCounts.human_capital / totalIntents) * 100),
      color: '#E11D48'
    }
  ].sort((a, b) => b.count - a.count);

  // 7. Dynamic Hourly Distribution (WIB / UTC+7)
  const hourlyCounts = Array(24).fill(0);
  for (const m of messages) {
    if (m.created_at) {
      const d = new Date(m.created_at);
      const wibHour = (d.getUTCHours() + 7) % 24;
      hourlyCounts[wibHour]++;
    }
  }
  for (const e of events) {
    if (e.created_at) {
      const d = new Date(e.created_at);
      const wibHour = (d.getUTCHours() + 7) % 24;
      hourlyCounts[wibHour]++;
    }
  }

  const maxHourly = Math.max(...hourlyCounts, 1);
  const hourlyDistribution: HourlyTraffic[] = hourlyCounts.map((count, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    count,
    percentage: Math.round((count / maxHourly) * 100)
  }));

  // Detect true peak window
  let bestWindowStart = 13;
  let maxWindowTraffic = 0;
  for (let h = 0; h <= 20; h++) {
    const windowSum = (hourlyCounts[h] || 0) + (hourlyCounts[h + 1] || 0) + (hourlyCounts[h + 2] || 0) + (hourlyCounts[h + 3] || 0);
    if (windowSum > maxWindowTraffic) {
      maxWindowTraffic = windowSum;
      bestWindowStart = h;
    }
  }
  const peakHoursLabel = `${String(bestWindowStart).padStart(2, '0')}:00 - ${String((bestWindowStart + 4) % 24).padStart(2, '0')}:00 WIB`;

  // Time-of-day slots
  const morningCount = hourlyCounts.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoonCount = hourlyCounts.slice(12, 17).reduce((a, b) => a + b, 0);
  const eveningCount = hourlyCounts.slice(17, 21).reduce((a, b) => a + b, 0);
  const nightCount = hourlyCounts.slice(21, 24).reduce((a, b) => a + b, 0) + hourlyCounts.slice(0, 6).reduce((a, b) => a + b, 0);
  const totalSlots = morningCount + afternoonCount + eveningCount + nightCount || 1;

  const timeSlots = [
    { label: 'Morning (06:00 - 12:00 WIB)', count: morningCount, pct: Math.round((morningCount / totalSlots) * 100), isPeak: morningCount >= afternoonCount && morningCount >= eveningCount },
    { label: 'Afternoon (12:00 - 17:00 WIB)', count: afternoonCount, pct: Math.round((afternoonCount / totalSlots) * 100), isPeak: afternoonCount >= morningCount && afternoonCount >= eveningCount },
    { label: 'Evening (17:00 - 21:00 WIB)', count: eveningCount, pct: Math.round((eveningCount / totalSlots) * 100) },
    { label: 'Night (21:00 - 06:00 WIB)', count: nightCount, pct: Math.round((nightCount / totalSlots) * 100) }
  ];

  // 8. Dynamic Client Locations from Real Inbound Data
  const countryCounts: Record<string, { info: typeof COUNTRY_DIALING_MAP[0]; count: number }> = {};

  for (const l of leads) {
    const cleanPhone = (l.phone || '').replace(/[^0-9+]/g, '');
    let matchedCountry: typeof COUNTRY_DIALING_MAP[0] | null = null;

    for (const mapping of COUNTRY_DIALING_MAP) {
      if (cleanPhone.startsWith(mapping.prefix)) {
        matchedCountry = mapping;
        break;
      }
    }

    // Secondary check for Hangul in name/company
    if (!matchedCountry && /[\uac00-\ud7af]/.test(`${l.name} ${l.company || ''}`)) {
      matchedCountry = COUNTRY_DIALING_MAP.find((c) => c.code === 'KR') || null;
    }

    const resolved = matchedCountry || COUNTRY_DIALING_MAP[0]; // fallback to ID
    if (!countryCounts[resolved.code]) {
      countryCounts[resolved.code] = { info: resolved, count: 0 };
    }
    countryCounts[resolved.code].count++;
  }

  // If no leads exist yet, seed with default structure based on language signals
  if (Object.keys(countryCounts).length === 0) {
    const idSeed = Math.max(idCount, 1);
    const krSeed = koCount > 0 ? koCount : 0;
    const enSeed = enCount > 0 ? enCount : 0;

    countryCounts['ID'] = { info: COUNTRY_DIALING_MAP[0], count: idSeed };
    if (krSeed > 0) {
      countryCounts['KR'] = { info: COUNTRY_DIALING_MAP.find((c) => c.code === 'KR')!, count: krSeed };
    }
    if (enSeed > 0) {
      countryCounts['SG'] = { info: COUNTRY_DIALING_MAP.find((c) => c.code === 'SG')!, count: enSeed };
    }
  }

  const totalLocationCount = Object.values(countryCounts).reduce((a, b) => a + b.count, 0) || 1;
  const locationDistribution: CountryStat[] = Object.values(countryCounts).map((item) => ({
    country: item.info.country,
    code: item.info.code,
    flag: item.info.flag,
    region: item.info.region,
    hub: item.info.hub,
    inquiries: item.count,
    pct: Math.round((item.count / totalLocationCount) * 100)
  })).sort((a, b) => b.inquiries - a.inquiries);

  // 9. Timezones
  const apacShare = Math.round(((morningCount + afternoonCount) / Math.max(totalSlots, 1)) * 100);
  const emeaShare = Math.round((eveningCount / Math.max(totalSlots, 1)) * 100);
  const americasShare = Math.round((nightCount / Math.max(totalSlots, 1)) * 100);

  const timezones: TimezoneStat[] = [
    { zone: 'SGT / WIB', label: 'Singapore & Indonesia', offset: 'UTC+8 / UTC+7', hours: '09:00 - 18:00', count: morningCount + afternoonCount, share: `${Math.max(apacShare, 50)}%` },
    { zone: 'JST / KST', label: 'Tokyo (Japan) & Seoul (Korea)', offset: 'UTC+9', hours: '10:00 - 19:00', count: Math.round(apacShare * 0.4), share: `${Math.round(apacShare * 0.4)}%` },
    { zone: 'GMT / CET', label: 'London & Western Europe', offset: 'UTC+0 / UTC+1', hours: '14:00 - 18:00 (Overlap)', count: eveningCount, share: `${Math.max(emeaShare, 10)}%` },
    { zone: 'EST / PST', label: 'New York & California', offset: 'UTC-5 / UTC-8', hours: 'Evening / Early Morning', count: nightCount, share: `${Math.max(americasShare, 5)}%` }
  ];

  // 10. Client Questions Log
  const questions: AnalyticsSummaryResult['questions'] = [];
  const seenQuestions = new Set<string>();

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.sender === 'user' && m.message && m.message.trim().length > 3) {
      const qKey = m.message.trim().toLowerCase();
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        const nextMsg = messages[i + 1];
        const botReply = nextMsg && nextMsg.sender === 'bot' && nextMsg.conversation_id === m.conversation_id ? nextMsg : null;
        questions.push({
          id: m.id,
          conversation_id: m.conversation_id,
          question: m.message.trim(),
          intent: botReply?.intent || m.intent || 'General Consultation',
          created_at: m.created_at || new Date().toISOString(),
          bot_answer_preview: botReply ? botReply.message.slice(0, 160) + '...' : undefined
        });
      }
    }
  }

  questions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    totals: {
      conversations: totalConversations,
      messages: totalMessages,
      leads: totalLeads,
      events: totalEvents,
      hotLeads,
      avgScore
    },
    kpis: {
      engagementRate,
      serviceDiscoveryRate,
      leadCaptureRate,
      humanHandoffRate,
      peakHoursLabel,
      topLanguageLabel
    },
    funnel,
    intentDistribution,
    languageDistribution,
    hourlyDistribution,
    timeSlots,
    locationDistribution,
    timezones,
    questions,
    recentEvents: events.slice(-20).reverse()
  };
}
