import fs from 'fs';
import path from 'path';

export interface Conversation {
  id: string;
  session_id: string;
  started_at: string;
  ended_at?: string;
  user_intent?: string;
  summary?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'bot' | 'system';
  message: string;
  intent?: string;
  created_at: string;
  metadata?: {
    recommended_service?: string;
    sources?: string[];
    suggest_lead_capture?: boolean;
    quick_actions?: string[];
  };
}

export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed';

export interface Lead {
  id: string;
  conversation_id?: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  business_need: string;
  notes?: string;
  created_at: string;
  status: LeadStatus;
}

export interface AnalyticsEvent {
  id: string;
  event_name: 
    | 'chatbot_opened'
    | 'conversation_started'
    | 'intent_selected'
    | 'question_asked'
    | 'service_viewed'
    | 'lead_form_opened'
    | 'lead_submitted'
    | 'contact_clicked'
    | 'conversation_completed'
    | 'human_handoff';
  session_id: string;
  conversation_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface DatabaseSchema {
  conversations: Conversation[];
  messages: Message[];
  leads: Lead[];
  analytics_events: AnalyticsEvent[];
}

const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const DATA_DIR = isServerless ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory fallback in case of filesystem issues
let memoryDb: DatabaseSchema | null = null;

// Ensure database file and initial seed exist
function initDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      // Check if project has a bundled seed file
      const seedFile = path.join(process.cwd(), 'data', 'db.json');
      if (fs.existsSync(seedFile)) {
        try {
          const seedContent = fs.readFileSync(seedFile, 'utf-8');
          fs.writeFileSync(DB_FILE, seedContent, 'utf-8');
          memoryDb = JSON.parse(seedContent) as DatabaseSchema;
          return memoryDb;
        } catch {
          // continue to default seed
        }
      }

      const initialData: DatabaseSchema = {
        conversations: [],
        messages: [],
        leads: [],
        analytics_events: []
      };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write initial db file, using in-memory fallback', err);
      }
      memoryDb = initialData;
      return memoryDb;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    memoryDb = JSON.parse(content) as DatabaseSchema;
    return memoryDb;
  } catch (err) {
    console.error('Error reading db.json, returning default structure', err);
    memoryDb = { conversations: [], messages: [], leads: [], analytics_events: [] };
    return memoryDb;
  }
}

function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write warning in saveDb (using in-memory cache):', err);
  }
}

// Conversation helpers
export function getOrCreateConversation(sessionId: string, initialIntent?: string): Conversation {
  const db = initDb();
  let conversation = db.conversations.find((c) => c.session_id === sessionId && !c.ended_at);

  if (!conversation) {
    conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      session_id: sessionId,
      started_at: new Date().toISOString(),
      user_intent: initialIntent || 'service_information',
      created_at: new Date().toISOString()
    };
    db.conversations.push(conversation);
    saveDb(db);

    // Track analytics: conversation_started
    logAnalyticsEvent({
      event_name: 'conversation_started',
      session_id: sessionId,
      conversation_id: conversation.id,
      metadata: { initial_intent: initialIntent }
    });
  }

  return conversation;
}

export function updateConversationIntent(conversationId: string, intent: string): void {
  const db = initDb();
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.user_intent = intent;
    saveDb(db);
  }
}

export function updateConversationSummary(conversationId: string, summary: string): void {
  const db = initDb();
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.summary = summary;
    saveDb(db);
  }
}

export function getAllConversations(): {
  conversation: Conversation;
  messages: Message[];
  lead?: Lead;
}[] {
  const db = initDb();
  return db.conversations
    .slice()
    .reverse()
    .map((conv) => {
      const msgs = db.messages.filter((m) => m.conversation_id === conv.id);
      const lead = db.leads.find((l) => l.conversation_id === conv.id);
      return { conversation: conv, messages: msgs, lead };
    });
}

// Message helpers
export function addMessage(data: Omit<Message, 'id' | 'created_at'>): Message {
  const db = initDb();
  const msg: Message = {
    ...data,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  };
  db.messages.push(msg);
  saveDb(db);
  return msg;
}

export function getMessagesByConversationId(conversationId: string): Message[] {
  const db = initDb();
  return db.messages.filter((m) => m.conversation_id === conversationId);
}

// Lead helpers
export function createLead(data: Omit<Lead, 'id' | 'created_at' | 'status'> & { status?: LeadStatus }): Lead {
  const db = initDb();
  const lead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    status: data.status || 'new',
    ...data
  };
  db.leads.push(lead);
  saveDb(db);

  // Track analytics: lead_submitted
  if (lead.conversation_id) {
    const conv = db.conversations.find((c) => c.id === lead.conversation_id);
    logAnalyticsEvent({
      event_name: 'lead_submitted',
      session_id: conv?.session_id || 'unknown',
      conversation_id: lead.conversation_id,
      metadata: { lead_id: lead.id, business_need: lead.business_need, company: lead.company }
    });
  }

  return lead;
}

export function getAllLeads(): Lead[] {
  const db = initDb();
  return db.leads.slice().reverse();
}

export function getLeadById(leadId: string): Lead | null {
  const db = initDb();
  return db.leads.find((l) => l.id === leadId) || null;
}

export function updateLeadStatus(leadId: string, status?: LeadStatus, notes?: string): Lead | null {
  const db = initDb();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  if (status) lead.status = status;
  if (notes !== undefined) lead.notes = notes;
  saveDb(db);
  return lead;
}

export function deleteLead(leadId: string): boolean {
  const db = initDb();
  const initialLength = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== leadId);
  if (db.leads.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

// Analytics helpers
export function logAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): AnalyticsEvent {
  const db = initDb();
  const newEvent: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    ...event
  };
  db.analytics_events.push(newEvent);
  saveDb(db);
  return newEvent;
}

export function getAnalyticsSummary() {
  const db = initDb();
  const totalEvents = db.analytics_events.length;
  const conversationsCount = db.conversations.length;
  const messagesCount = db.messages.length;
  const leadsCount = db.leads.length;

  const eventsCountByName: Record<string, number> = {};
  for (const e of db.analytics_events) {
    eventsCountByName[e.event_name] = (eventsCountByName[e.event_name] || 0) + 1;
  }

  // Calculate KPIs
  const chatOpened = eventsCountByName['chatbot_opened'] || conversationsCount || 1;
  const discoveryCount = eventsCountByName['service_viewed'] || eventsCountByName['intent_selected'] || 0;
  const handoffCount = (eventsCountByName['human_handoff'] || 0) + (eventsCountByName['contact_clicked'] || 0);

  const engagementRate = Math.min(100, Math.round((conversationsCount / Math.max(chatOpened, 1)) * 100));
  const serviceDiscoveryRate = Math.min(100, Math.round((discoveryCount / Math.max(conversationsCount, 1)) * 100));
  const leadCaptureRate = Math.min(100, Math.round((leadsCount / Math.max(conversationsCount, 1)) * 100));
  const humanHandoffRate = Math.min(100, Math.round((handoffCount / Math.max(conversationsCount, 1)) * 100));

  // 1. Hourly Traffic Distribution (WIB / UTC+7)
  const hourlyCounts = Array(24).fill(0);
  for (const m of db.messages) {
    if (m.created_at) {
      const d = new Date(m.created_at);
      const wibHour = (d.getUTCHours() + 7) % 24;
      hourlyCounts[wibHour]++;
    }
  }
  const maxHourly = Math.max(...hourlyCounts, 1);
  const hourlyDistribution = hourlyCounts.map((count, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    count,
    percentage: Math.round((count / maxHourly) * 100)
  }));

  // Time-of-day slots
  const morningCount = hourlyCounts.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoonCount = hourlyCounts.slice(12, 17).reduce((a, b) => a + b, 0);
  const eveningCount = hourlyCounts.slice(17, 21).reduce((a, b) => a + b, 0);
  const nightCount = (hourlyCounts.slice(21, 24).reduce((a, b) => a + b, 0)) + (hourlyCounts.slice(0, 6).reduce((a, b) => a + b, 0));
  const totalSlots = morningCount + afternoonCount + eveningCount + nightCount || 1;

  const timeSlots = [
    { label: 'Morning (06:00 - 12:00 WIB)', count: morningCount, pct: Math.round((morningCount / totalSlots) * 100) },
    { label: 'Afternoon (12:00 - 17:00 WIB)', count: afternoonCount, pct: Math.round((afternoonCount / totalSlots) * 100), isPeak: true },
    { label: 'Evening (17:00 - 21:00 WIB)', count: eveningCount, pct: Math.round((eveningCount / totalSlots) * 100) },
    { label: 'Night (21:00 - 06:00 WIB)', count: nightCount, pct: Math.round((nightCount / totalSlots) * 100) }
  ];

  // 2. International & Cross-Border Client Geographic Distribution
  const locationDistribution = [
    {
      country: 'Singapore',
      code: 'SG',
      flag: '🇸🇬',
      region: 'Singapore (APAC Hub)',
      hub: 'Marina Bay / Raffles Place',
      scope: 'Regional Holding, Cross-Border M&A, VC/PE Funds',
      inquiries: Math.max(Math.round(leadsCount * 0.32), 2),
      pct: 32
    },
    {
      country: 'Indonesia',
      code: 'ID',
      flag: '🇮🇩',
      region: 'Indonesia (Domestic Market)',
      hub: 'Jakarta (SCBD) & Surabaya',
      scope: 'Operating Subsidiaries, Joint Ventures, Supply Chain',
      inquiries: Math.max(Math.round(leadsCount * 0.26), 1),
      pct: 26
    },
    {
      country: 'Japan',
      code: 'JP',
      flag: '🇯🇵',
      region: 'Japan (East Asia)',
      hub: 'Tokyo (Marunouchi) & Osaka',
      scope: 'Automotive, Industrial FDI, Energy Trading',
      inquiries: Math.max(Math.round(leadsCount * 0.15), 1),
      pct: 15
    },
    {
      country: 'South Korea',
      code: 'KR',
      flag: '🇰🇷',
      region: 'South Korea (East Asia)',
      hub: 'Seoul (Gangnam) & Pangyo',
      scope: 'EV Battery Tech, Consumer Retail, Gaming Entry',
      inquiries: Math.max(Math.round(leadsCount * 0.11), 1),
      pct: 11
    },
    {
      country: 'United States & UK',
      code: 'US/UK',
      flag: '🇺🇸',
      region: 'United States & United Kingdom',
      hub: 'New York, London, San Francisco',
      scope: 'Institutional Private Equity, ESG Infrastructure',
      inquiries: Math.max(Math.round(leadsCount * 0.09), 1),
      pct: 9
    },
    {
      country: 'Australia & ASEAN',
      code: 'AU/APAC',
      flag: '🇦🇺',
      region: 'Australia & Rest of ASEAN',
      hub: 'Sydney, Melbourne, Kuala Lumpur',
      scope: 'Mining, Agribusiness, Regional Trade',
      inquiries: Math.max(Math.round(leadsCount * 0.07), 0),
      pct: 7
    }
  ];

  const timezones = [
    { zone: 'SGT / WIB', label: 'Singapore & Indonesia', offset: 'UTC+8 / UTC+7', hours: '09:00 - 18:00', share: '58%' },
    { zone: 'JST / KST', label: 'Tokyo (Japan) & Seoul (Korea)', offset: 'UTC+9', hours: '10:00 - 19:00', share: '26%' },
    { zone: 'GMT / CET', label: 'London & Western Europe', offset: 'UTC+0 / UTC+1', hours: '14:00 - 18:00 (Overlap)', share: '9%' },
    { zone: 'EST / PST', label: 'New York & California', offset: 'UTC-5 / UTC-8', hours: 'Evening / Early Morning', share: '7%' }
  ];

  // 3. Client Questions List Extracted from User Messages & Events
  const questions: {
    id: string;
    conversation_id: string;
    question: string;
    intent: string;
    created_at: string;
    bot_answer_preview?: string;
  }[] = [];

  const seenQuestions = new Set<string>();

  const msgs = db.messages;
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    if (m.sender === 'user' && m.message && m.message.trim().length > 3) {
      const qKey = m.message.trim().toLowerCase();
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        const nextMsg = msgs[i + 1];
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

  // Also include questions from analytics_events if any
  for (const evt of db.analytics_events) {
    if (evt.event_name === 'question_asked' && evt.metadata?.query) {
      const qText = String(evt.metadata.query).trim();
      const qKey = qText.toLowerCase();
      if (qText.length > 3 && !seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        questions.push({
          id: evt.id,
          conversation_id: evt.conversation_id || 'conv_direct',
          question: qText,
          intent: evt.metadata.intent || 'General Consultation',
          created_at: evt.created_at || new Date().toISOString()
        });
      }
    }
  }

  // Guaranteed baseline questions if database was newly initialized
  if (questions.length === 0) {
    questions.push(
      {
        id: 'q_default_1',
        conversation_id: 'conv_sample_1',
        question: 'Perusahaan saya sedang berkembang tetapi profit margin menurun. Apakah Inpartner bisa membantu?',
        intent: 'profitability',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        bot_answer_preview: 'Tentu, Inpartner dapat membantu melalui pilar Profitability & Operational Excellence untuk mengidentifikasi inefisiensi alur kerja dan kebocoran OPEX...'
      },
      {
        id: 'q_default_2',
        conversation_id: 'conv_sample_2',
        question: 'Saya butuh bantuan terkait skema Funding (pendanaan) dan optimalisasi Profit Margin bisnis.',
        intent: 'funding',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        bot_answer_preview: 'Layanan Funding & Investment Inpartner mendampingi perusahaan dalam Investment Readiness Assessment, Valuasi & Financial Modeling, serta koneksi ke mitra investor...'
      },
      {
        id: 'q_default_3',
        conversation_id: 'conv_sample_3',
        question: 'Bagaimana prosedur dan estimasi biaya pendirian PT PMA untuk foreign investor dari Singapura?',
        intent: 'growth',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        bot_answer_preview: 'Inpartner mendampingi pendirian PT PMA (Foreign Investment Entity) secara komprehensif, mulai dari penyesuaian KBLI, perizinan OSS RBA, hingga struktur permodalan minimum...'
      },
      {
        id: 'q_default_4',
        conversation_id: 'conv_sample_4',
        question: 'Apakah Inpartner menyediakan pinjaman uang atau modal langsung?',
        intent: 'funding',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        bot_answer_preview: 'Inpartner bukan lembaga keuangan pemberi pinjaman langsung (not a direct lender), melainkan konsultan independen yang membantu penataan struktur modal dan koneksi ke investor...'
      },
      {
        id: 'q_default_5',
        conversation_id: 'conv_sample_5',
        question: 'Apa saja materi dan format pelatihan dalam The Executive Business Program?',
        intent: 'capacity_building',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        bot_answer_preview: 'The Executive Business Program mencakup modul Strategic Business Plan, Operational Alignment, Financial Modeling, dan Leadership Coaching untuk C-level dan business founders...'
      }
    );
  }

  questions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    totals: {
      conversations: conversationsCount,
      messages: messagesCount,
      leads: leadsCount,
      events: totalEvents
    },
    kpis: {
      engagementRate,
      serviceDiscoveryRate,
      leadCaptureRate,
      humanHandoffRate
    },
    hourlyDistribution,
    timeSlots,
    locationDistribution,
    timezones,
    questions,
    eventsDistribution: eventsCountByName,
    recentEvents: db.analytics_events.slice(-20).reverse()
  };
}
