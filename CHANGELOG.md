# 📜 Changelog

All notable changes to the **Inpartner AI Business Consultation Assistant & CRM** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-05

### 🚀 Added
- **Grounded RAG Engine:** Multi-factor keyword and semantic scoring retrieval engine (`lib/rag.ts`) indexing official markdown knowledge bases across company background, 5 advisory pillars, 13 industrial sectors, track records, and FAQ.
- **Multilingual NLP Intent Classifier:** Trilingual support (Indonesian, English, Korean) recognizing inquiries for Strategy, Investment, Market Access, Cross-Border Tech, and Human Capital.
- **Dual-Mode Fail-Safe Database Layer:** Seamless data access abstraction (`lib/db.ts`) with Supabase PostgreSQL as authoritative cloud storage and automatic fallback to localized caching (`data/db.json`) during cold-starts or network interruptions.
- **Executive Admin CRM Dashboard:** Full internal portal (`/admin`) featuring:
  - Kanban pipeline stages: *New Lead*, *Contacted*, *Meeting Scheduled*, *Proposal Sent*, *Engagement Closed*.
  - Lead prioritization matrix: 🔥 **Tier 1 Hot**, ⚡ **Tier 2 Warm**, 📋 **Tier 3 Standard**.
  - One-click direct WhatsApp engagement shortcut with pre-filled consultative greeting.
  - Interactive RAG Knowledge Base Retrieval Tester.
  - Real-time interaction funnel analytics and conversation intent breakdown.
- **Marketing Attribution & UTM Telemetry:** Automated capture of campaign parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and organic channel attribution.
- **Proactive Consultative Nudges:** Smart behavioral triggers with session frequency capping, dwell time recognition, exit-intent prompts, and return visitor acknowledgment.
- **Enterprise Lead Qualification Modal:** In-chat consultative lead capture collecting company name, employee scale, annual revenue band, advisory scope, and valid contact information (+62 and international E.164).
- **Universal Embed Widget (`widget.js`):** Lightweight (<15 KB), zero-dependency floating launcher with hardware-accelerated 60 FPS transitions and dynamic mobile viewport height adjustment.
- **Dedicated Iframe Portal (`/embed-view`):** Seamless standalone embed target for webmasters on WordPress, Webflow, and custom PHP websites.
- **Automated Lead Alerts:** Instant push dispatchers supporting Telegram Bot alerts, Resend HTML emails, and generic webhooks.
- **14-Layer Automated QA Suite:** Comprehensive native test suite covering 107 test cases across intent classification, RAG ranking, lead scoring, database pipelines, and security mechanisms.

### 🛡️ Security
- **CWE-1236 Formula Injection Neutralization:** Automatic single-quote escaping for spreadsheet export values starting with dangerous formula operators (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Prompt Injection Defense:** Strict XML boundary wrapping (`<visitor_query>`, `<context>`) and anti-jailbreak directives preventing system prompt override.
- **Sliding-Window Rate Limiting:** In-memory request throttling protecting `/api/chat` (30 req/min), `/api/leads` (10 req/5min), and `/api/admin/login` (5 attempts/10min).
- **Session Authentication:** Cryptographically strong session tokens (`AUTH_SECRET`) and timing-safe password validation.
- **Row-Level Security (RLS):** Declarative access control policies for all Supabase PostgreSQL tables.
- **UU PDP (Indonesian Data Protection) Compliance:** Explicit consent checkboxes, minimal data collection, and TLS 1.3 transit encryption.

### 📚 Documentation
- Added official corporate **`LICENSE`** (Proprietary & Confidential Software License Agreement).
- Added comprehensive **`SECURITY.md`** with vulnerability disclosure SLA and security defense architecture.
- Added **`CONTRIBUTING.md`** and **`CODE_OF_CONDUCT.md`** for development standards and professional collaboration.
- Added **`ARCHITECTURE.md`** with end-to-end Mermaid diagrams, request lifecycle, and data flow specifications.
- Added **`API_REFERENCE.md`** documenting all 12 REST and SSE streaming endpoints.
- Added **`DEPLOYMENT_GUIDE.md`** covering Vercel, Docker multi-stage containerization, and Linux PM2/Nginx VPS setups.
- Added **`ADMIN_GUIDE.md`** serving as an operational manual for Inpartner consultants and BD executives.
- Added **`TROUBLESHOOTING.md`** incident runbook for database, AI quota, widget, and notification troubleshooting.
- Synchronized **`README.md`** with a unified Documentation Hub and aligned 5 core advisory pillars.

---

## [0.1.0] - 2026-09-15
### 🐣 Initial Prototype
- Initial Next.js 14 App Router project setup.
- Basic conversational chat interface with Tailwind CSS.
- Static file knowledge base proof-of-concept.
- Initial lead ingestion endpoint with local JSON storage.
