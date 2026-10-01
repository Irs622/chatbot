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

import { calculateLeadScore } from './leadScoring.ts';
import type { PriorityTier, ScoreFactor } from './leadScoring.ts';
import { computeDynamicAnalytics } from './analyticsEngine.ts';
import type { CompanyScale, IndustrySector, ProjectTimeline, EnterpriseQualification } from './qualification.ts';
import type { DiagnosticDataRecord, DiagnosticPillarKey } from './diagnostic.ts';
import { getSupabase, isSupabaseConfigured } from './supabaseClient.ts';

export type { CompanyScale, IndustrySector, ProjectTimeline, EnterpriseQualification, DiagnosticDataRecord, DiagnosticPillarKey };

export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'proposal' | 'converted' | 'closed';

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer_url?: string;
  landing_page?: string;
  captured_at?: string;
}

export interface Lead {
  id: string;
  conversation_id?: string;
  name: string;
  company?: string;
  job_title?: string;
  company_scale?: CompanyScale;
  industry?: IndustrySector;
  timeline?: ProjectTimeline;
  email: string;
  phone: string;
  business_need: string;
  notes?: string;
  diagnostic_summary?: string;
  diagnostic_data?: DiagnosticDataRecord;
  attribution?: AttributionData;
  created_at: string;
  status: LeadStatus;
  score?: number;
  priority_tier?: PriorityTier;
  score_breakdown?: {
    score?: number;
    priority_tier?: PriorityTier;
    tier_label: string;
    target_sla: string;
    factors: ScoreFactor[];
  };
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

export interface DatabaseSchema {
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

function asyncSupabaseSync(syncFn: (supabase: NonNullable<ReturnType<typeof getSupabase>>) => PromiseLike<any>): void {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  if (!supabase) return;
  Promise.resolve(syncFn(supabase)).catch((err) => {
    console.warn('[Supabase Sync Exception]', err);
  });
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

    const createdConv = conversation;
    asyncSupabaseSync((sb) => sb.from('conversations').upsert(createdConv));
  }

  return conversation;
}

export function updateConversationIntent(conversationId: string, intent: string): void {
  const db = initDb();
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.user_intent = intent;
    saveDb(db);
    asyncSupabaseSync((sb) => sb.from('conversations').update({ user_intent: intent }).eq('id', conversationId));
  }
}

export function updateConversationSummary(conversationId: string, summary: string): void {
  const db = initDb();
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.summary = summary;
    saveDb(db);
    asyncSupabaseSync((sb) => sb.from('conversations').update({ summary }).eq('id', conversationId));
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

  asyncSupabaseSync((sb) => sb.from('messages').insert(msg));

  return msg;
}

export function getMessagesByConversationId(conversationId: string): Message[] {
  const db = initDb();
  return db.messages.filter((m) => m.conversation_id === conversationId);
}

// Lead helpers
export function createLead(data: Omit<Lead, 'id' | 'created_at' | 'status'> & { status?: LeadStatus }): Lead {
  const db = initDb();
  
  // Calculate automated lead score and priority tier if not provided
  let score = data.score;
  let priority_tier = data.priority_tier;
  let score_breakdown = data.score_breakdown;

  if (score === undefined || priority_tier === undefined) {
    const conversationMsgs = data.conversation_id
      ? db.messages.filter((m) => m.conversation_id === data.conversation_id)
      : [];

    const scoringResult = calculateLeadScore({
      name: data.name,
      company: data.company,
      job_title: data.job_title,
      company_scale: data.company_scale,
      industry: data.industry,
      timeline: data.timeline,
      email: data.email,
      phone: data.phone,
      business_need: data.business_need,
      notes: data.notes,
      diagnostic_summary: data.diagnostic_summary,
      has_completed_diagnostic: Boolean(data.diagnostic_data || data.diagnostic_summary),
      conversation_messages: conversationMsgs
    });

    score = scoringResult.score;
    priority_tier = scoringResult.priority_tier;
    score_breakdown = {
      tier_label: scoringResult.tier_label,
      target_sla: scoringResult.target_sla,
      factors: scoringResult.factors
    };
  }

  const lead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    status: data.status || 'new',
    score,
    priority_tier,
    score_breakdown,
    ...data
  };
  db.leads.push(lead);
  saveDb(db);

  // Sync to Supabase in background
  asyncSupabaseSync((sb) => sb.from('leads').upsert(lead));

  // Track analytics: lead_submitted
  if (lead.conversation_id) {
    const conv = db.conversations.find((c) => c.id === lead.conversation_id);
    logAnalyticsEvent({
      event_name: 'lead_submitted',
      session_id: conv?.session_id || 'unknown',
      conversation_id: lead.conversation_id,
      metadata: {
        lead_id: lead.id,
        business_need: lead.business_need,
        company: lead.company,
        score: lead.score,
        priority_tier: lead.priority_tier,
        has_diagnostic: Boolean(lead.diagnostic_data || lead.diagnostic_summary),
        diagnostic_pillar: lead.diagnostic_data?.pillar
      }
    });
  }

  return lead;
}

export async function createLeadAsync(data: Parameters<typeof createLead>[0]): Promise<Lead> {
  const lead = createLead(data);
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('leads').upsert(lead);
      } catch (err) {
        console.warn('[Supabase Sync Exception in createLeadAsync]', err);
      }
    }
  }
  return lead;
}

export function getAllLeads(): Lead[] {
  const db = initDb();
  return db.leads.slice().reverse();
}

/**
 * Asynchronously retrieves leads from Supabase PostgreSQL if online,
 * automatically falling back to local memory database.
 */
export async function getAllLeadsAsync(): Promise<Lead[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data as Lead[];
        }
      } catch (err) {
        console.warn('[Supabase Fetch Exception] Falling back to local db:', err);
      }
    }
  }
  return getAllLeads();
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

  asyncSupabaseSync((sb) =>
    sb.from('leads').update({ status: lead.status, notes: lead.notes }).eq('id', lead.id)
  );

  return lead;
}

export async function updateLeadStatusAsync(leadId: string, status?: LeadStatus, notes?: string): Promise<Lead | null> {
  const lead = updateLeadStatus(leadId, status, notes);
  if (lead && isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('leads')
          .update({ status: lead.status, notes: lead.notes })
          .eq('id', lead.id);
      } catch (err) {
        console.warn('[Supabase Sync Exception in updateLeadStatusAsync]', err);
      }
    }
  }
  return lead;
}

export function deleteLead(leadId: string): boolean {
  const db = initDb();
  const initialLength = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== leadId);
  if (db.leads.length !== initialLength) {
    saveDb(db);

    asyncSupabaseSync((sb) => sb.from('leads').delete().eq('id', leadId));

    return true;
  }
  return false;
}

export async function deleteLeadAsync(leadId: string): Promise<boolean> {
  const ok = deleteLead(leadId);
  if (ok && isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('leads').delete().eq('id', leadId);
      } catch (err) {
        console.warn('[Supabase Sync Exception in deleteLeadAsync]', err);
      }
    }
  }
  return ok;
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

  asyncSupabaseSync((sb) => sb.from('analytics_events').insert(newEvent));

  return newEvent;
}

export function getAnalyticsSummary() {
  const db = initDb();
  return computeDynamicAnalytics(db);
}
