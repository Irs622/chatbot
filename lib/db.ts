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
        leads: [
          {
            id: 'lead-sample-1',
            name: 'Budi Santoso',
            company: 'PT Sentosa Logistik Indonesia',
            email: 'budi.santoso@sentosalogistik.co.id',
            phone: '081234567890',
            business_need: 'Profitability & Operational Process Optimization',
            notes: 'Omzet naik 30% tahun ini tapi profit margin turun akibat OPEX logistik tinggi.',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: 'new'
          },
          {
            id: 'lead-sample-2',
            name: 'Siti Rahmawati',
            company: 'PT Bio Farma Prima',
            email: 'siti.r@biopharmaprima.com',
            phone: '081987654321',
            business_need: 'Funding & Investment Readiness',
            notes: 'Mencari investor strategis untuk perluasan fasilitas laboratorium bioteknologi.',
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            status: 'contacted'
          }
        ],
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

export function updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Lead | null {
  const db = initDb();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.status = status;
  if (notes) lead.notes = notes;
  saveDb(db);
  return lead;
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
    eventsDistribution: eventsCountByName,
    recentEvents: db.analytics_events.slice(-20).reverse()
  };
}
