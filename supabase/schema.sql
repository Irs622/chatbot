-- =========================================================================
-- INPARTNER AI & CRM - SUPABASE POSTGRESQL SCHEMA DDL
-- Project: https://vfcttowwcqzaqvioxrnq.supabase.co
-- =========================================================================

-- 1. Table: leads (Inbound corporate advisory inquiries & CRM pipeline)
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  name TEXT NOT NULL,
  company TEXT,
  job_title TEXT,
  company_scale TEXT,
  industry TEXT,
  timeline TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_need TEXT NOT NULL,
  notes TEXT,
  diagnostic_summary TEXT,
  diagnostic_data JSONB,
  attribution JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  score INTEGER DEFAULT 50,
  priority_tier TEXT DEFAULT 'tier_2',
  score_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: conversations (Chatbot advisory sessions)
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  user_intent TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: messages (Full conversation dialogue transcripts)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  intent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: analytics_events (Funnel telemetry & interaction metrics)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  conversation_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR HIGH-THROUGHPUT RETRIEVAL & SLA TRACKING
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON public.leads(priority_tier);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts (for website visitor inquiries & chat)
CREATE POLICY "Allow public insert on leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on messages" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on analytics_events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Allow public read/update/delete for chatbot and backend API access
CREATE POLICY "Allow full access for service key and anon" ON public.leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access on conversations" ON public.conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access on messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access on analytics_events" ON public.analytics_events
  FOR ALL USING (true) WITH CHECK (true);
