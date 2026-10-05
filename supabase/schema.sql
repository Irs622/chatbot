-- =========================================================================
-- INPARTNER AI & CRM - SECURED SUPABASE POSTGRESQL SCHEMA DDL
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

-- 5. Table: admin_sessions (Server-side Session Revocation Tracking)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id TEXT PRIMARY KEY,
  session_token_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
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
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Architecture Model:
--   - Browser/Client talks exclusively to Next.js API Gateway.
--   - Next.js Server uses SUPABASE_SERVICE_ROLE_KEY to perform CRM operations.
--   - Public 'anon' role is strictly denied SELECT, UPDATE, DELETE on all CRM tables.
-- =========================================================================

-- Enable and Force RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions FORCE ROW LEVEL SECURITY;

-- Revoke all direct privileges on sensitive CRM tables from anon
REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.conversations FROM anon;
REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.analytics_events FROM anon;
REVOKE ALL ON public.admin_sessions FROM anon;
