# Inpartner AI Business Consultation Assistant (Inpartner Agent)

> Official AI Conversational Assistant for [Inpartner](https://inpartner.id/) (PT Inpartner Optima Integra) — Powered by Grounded Knowledge Retrieval-Augmented Generation (RAG) and Modern Corporate Inpartner Blue (`#005DAD`) Design.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-sky?logo=tailwindcss)
![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![Tests](https://img.shields.io/badge/Tests-107%20Passed-emerald)
![License](https://img.shields.io/badge/License-Proprietary-blue)
![Docs](https://img.shields.io/badge/Docs-Complete-success)

---

## 📌 Executive Product Summary

**Inpartner Agent** is an intelligent corporate advisory consultation assistant engineered to engage enterprise leaders, business owners, and institutional visitors navigating **[inpartner.id](https://inpartner.id/)**. It transforms passive website browsing into high-value diagnostic conversations, identifies specific organizational bottlenecks, recommends appropriate advisory pillars, and streamlines formal consultation scheduling with the Inpartner partner team.

### 5 Core Advisory Pillars:
1. **📈 Strategy & Corporate Advisory:** Corporate growth roadmap, M&A advisory, business model restructuring, and Go-to-Market strategies.
2. **💰 Investment & Project Advisory:** Feasibility studies, investment readiness, independent business valuation, and capital connection (VC, PE, Family Offices). *(Strictly an independent advisory firm — not a direct balance-sheet lender)*.
3. **🌐 Market Access & Business Expansion:** New market penetration, distributor matching, B2B commercial partnering, and regional market entry.
4. **🔬 Cross-Border & Technology Advisory:** Global Joint Ventures (JV), technology transfer, and Foreign Direct Investment (FDI) advisory.
5. **👥 Human Capital & Organization:** Executive leadership programs, corporate coaching, executive search, and organizational redesign.

---

## 📚 Official Documentation Hub

This repository maintains a comprehensive *enterprise-grade* documentation ecosystem tailored for software engineers, DevOps specialists, business consultants, and leadership:

| Document | Category | Audience & Purpose |
| :--- | :--- | :--- |
| [**`README.md`**](./README.md) | Overview | Quickstart, repository structure, and high-level product summary. |
| [**`ARCHITECTURE.md`**](./ARCHITECTURE.md) | Engineering | End-to-end Mermaid diagrams, request lifecycle, RAG scoring, and database fail-safe architecture. |
| [**`API_REFERENCE.md`**](./API_REFERENCE.md) | Engineering | Full REST & SSE streaming API endpoint specifications, payloads, status codes, and rate limits. |
| [**`DATABASE_GUIDE.md`**](./DATABASE_GUIDE.md) | Database | Supabase PostgreSQL architecture, schema DDL, RLS policies, indexing, and health checks. |
| [**`DEPLOYMENT_GUIDE.md`**](./DEPLOYMENT_GUIDE.md) | DevOps | Production deployment manuals for Vercel, Docker multi-stage containers, and Linux PM2/Nginx VPS. |
| [**`ADMIN_GUIDE.md`**](./ADMIN_GUIDE.md) | Business / CRM | Operational manual for Inpartner BD & consultants managing the Kanban CRM, lead scoring, and 1-click WhatsApp. |
| [**`INTEGRATION_GUIDE.md`**](./INTEGRATION_GUIDE.md) | Webmasters | Technical handover guide for embedding `widget.js` or iframe into WordPress, Webflow, Laravel, and React. |
| [**`KNOWLEDGE_BASE_GUIDE.md`**](./KNOWLEDGE_BASE_GUIDE.md) | Consultants | Guidelines for consultants to update company facts, services, track records, and FAQ in `knowledge/`. |
| [**`TESTING_GUIDE.md`**](./TESTING_GUIDE.md) | QA / Testing | 14-layer Quality Assurance suite documentation (`npm test` & `npm run test:report`). |
| [**`TROUBLESHOOTING.md`**](./TROUBLESHOOTING.md) | Operations | Incident runbook for resolving Supabase, Gemini quota, widget styling, and notification issues. |
| [**`SECURITY.md`**](./SECURITY.md) | Governance | Security policies, vulnerability disclosure SLA, CWE-1236 defense, and Indonesian UU PDP compliance. |
| [**`CONTRIBUTING.md`**](./CONTRIBUTING.md) | Governance | Developer contribution standards, branch naming, Conventional Commits, and code review rules. |
| [**`CODE_OF_CONDUCT.md`**](./CODE_OF_CONDUCT.md) | Governance | Contributor Covenant v2.1 professional collaboration standards. |
| [**`CHANGELOG.md`**](./CHANGELOG.md) | Release History | Keep a Changelog & SemVer release history for version releases. |
| [**`LICENSE`**](./LICENSE) | Legal | Official Proprietary and Confidential Software License Agreement (PT Inpartner Optima Integra). |
| [**`PRD.md`**](./PRD.md) | Product | Non-technical Product Requirements Document for directors, management, and stakeholders. |

---

## 🎨 Design & Aesthetic System
- **Color Palette:** Inpartner Blue (`#005DAD` primary, `#004785` dark hover, soft sky accents).
- **Executive Layout Architecture:**
  - *Header:* Official brand geometric icon + multi-action menu (*New consultation*, *Schedule meeting*, *Official WhatsApp*, *Visit inpartner.id*).
  - *Diagnostic Welcome Screen:* Hero card (*Business Growth & Market Expansion*), curated advisory divider, and secondary diagnostic cards (*Funding & Margin Optimization*, *Business Needs Diagnosis*).
  - *Active Chat Stream:* Real-time typewriter response, verified service badges, 1-click follow-up prompt chips, and lead capture CTAs.
  - *Interaction Bar:* Clean input field with send/stop buttons, character counter, and corporate compliance disclaimer.

---

## 🔌 Integration into Existing Website (`inpartner.id`)

The assistant is architected to be **100% plug-and-play**. No modifications to the existing website codebase or backend infrastructure are required.

### Method 1: Using the Universal Script Widget (Recommended)
Add this single script tag right before the closing `</body>` tag on `inpartner.id`:

```html
<!-- Inpartner AI Assistant Widget -->
<script src="https://chat.inpartner.id/widget.js" defer></script>
```

> **Result:** The floating `#005DAD` launcher button appears at the bottom-right corner. When clicked, the consultation assistant expands smoothly at 60 FPS, with dynamic viewport height adaptation on mobile devices.

### Method 2: Dedicated iFrame Embed
For a dedicated consultation landing page (e.g. `/ai-consultation`):

```html
<iframe 
  src="https://chat.inpartner.id/embed-view" 
  width="100%" 
  height="720" 
  frameborder="0" 
  style="border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"
></iframe>
```

> 📖 **Comprehensive Integration Guide:** Refer to [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) for WordPress, Webflow, Laravel, and React deployment instructions.

---

## 🏛️ System Architecture

```text
                     WEBSITE VISITOR (inpartner.id)
                                    │
                                    ▼
                   [ Widget Loader: public/widget.js ]
                                    │
                                    ▼
               [ Iframe View: app/embed-view/page.tsx ]
                                    │
                                    ▼
                    [ Chat UI: components/ChatWidget.tsx ]
                                    │
                                    ▼ (POST /api/chat)
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  [ Intent Classifier ]                               [ Knowledge Retrieval (RAG) ]
 (lib/intent.ts - 9 Intents)                         (lib/rag.ts - Tokenizer & Ranking)
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     ▼
                         [ Grounded AI Engine ]
                    (lib/ai.ts - Gemini / Offline RAG)
                                     │
                                     ▼
                   [ Supabase Cloud Postgres & Analytics ]
              (PostgreSQL via lib/supabaseClient.ts & lib/db.ts)
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  [ Verified AI Advisory ]                              [ Lead Capture CRM ]
 (Pillars, Follow-ups, WA Link)                   (Name, Company, Contact, Scope)
```

> 📖 **In-Depth Engineering Architecture:** See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for full Mermaid sequence diagrams, state machines, and threat models.

---

## 📁 Repository Structure

```text
chatbot/
├── app/
│   ├── admin/page.tsx               # Internal Admin CRM login & overview
│   ├── api/
│   │   ├── admin/                   # Secure authentication, session, & CSV export
│   │   ├── analytics/route.ts       # Interaction KPI & telemetry event logging
│   │   ├── chat/route.ts            # SSE streaming chat & RAG retrieval
│   │   ├── conversations/route.ts   # Conversation history management
│   │   ├── embed.js/route.ts        # Dynamic cross-origin embed loader
│   │   ├── health/route.ts          # System health check & Supabase latency probe
│   │   ├── knowledge/route.ts       # Knowledge base inspection (authenticated)
│   │   └── leads/                   # Lead ingestion, status management, & CRM
│   ├── embed-view/page.tsx          # Standalone iframe view
│   ├── globals.css                  # Hardware-accelerated animations & Tailwind CSS
│   ├── layout.tsx                   # Root HTML layout with self-hosted Google Font
│   └── page.tsx                     # Production simulator & full chat portal
├── components/
│   ├── AdminDashboard.tsx           # Lead management CRM & CSV exporter
│   ├── AnalyticsView.tsx            # Real-time funnel & intent analytics
│   ├── ChatWidget.tsx               # Primary corporate consultation component
│   └── KnowledgeView.tsx            # Live RAG semantic retrieval tester
├── data/
│   └── db.json                      # Seed & fallback database (leads, sessions, metrics)
├── knowledge/                       # Ground truth markdown knowledge base
│   ├── company/company-profile.md   # Corporate credentials, vision, mission, ESG
│   ├── contact/contact.md           # Jakarta office, WhatsApp, email, hours
│   ├── faq/faq.md                   # Engagement models & consulting FAQ
│   ├── projects/projects.md         # Track record & corporate case studies
│   ├── sectors/sectors.md           # 13 priority industry verticals
│   └── services/                    # 5 core advisory pillars
├── lib/
│   ├── ai.ts                        # Gemini & Grounded RAG multi-model reasoning
│   ├── attribution.ts               # UTM campaign tracking & organic channels
│   ├── auth.ts                      # Admin authentication & high-entropy sessions
│   ├── db.ts                        # Dual-mode database layer (Supabase + fallback)
│   ├── exportCsv.ts                 # Sanitized CSV generation (CWE-1236 defense)
│   ├── intent.ts                    # Trilingual NLP intent classifier (ID, EN, KO)
│   ├── notifications.ts             # Webhook, Telegram, and Resend email alerts
│   ├── rag.ts                       # Markdown tokenizer, chunking, & scoring
│   ├── rateLimit.ts                 # Sliding-window IP rate limiter
│   ├── scoring.ts                   # Lead scoring engine & priority matrix
│   ├── supabaseClient.ts            # Dynamic Supabase client & health telemetry
│   └── validation.ts                # Phone (+62 / Int) & Email RFC validation
├── public/
│   ├── widget.js                    # Universal lightweight script embed (<15 KB)
│   ├── demo-website.html            # Local testbed simulating host website
│   ├── chaboot.svg                  # Official brand geometric icon
│   └── inpartner-icon.svg           # Brand logo vector
├── scripts/
│   ├── check-supabase.mjs           # Live Supabase table connectivity tester
│   ├── migrate-to-supabase.mjs      # Data migration script to Supabase
│   └── test-runner.mjs              # Terminal visual QA test runner
├── supabase/
│   └── schema.sql                   # Supabase PostgreSQL DDL, indexes, and RLS policies
├── tests/                           # 14-Layer Automated QA Suite (107 Tests)
├── Dockerfile                       # Multi-stage production container configuration
├── .dockerignore                    # Docker build context exclusions
├── .env.local.example               # Template environment configuration
├── ADMIN_GUIDE.md                   # CRM operations manual for BD & consultants
├── API_REFERENCE.md                 # Complete REST & SSE streaming API documentation
├── ARCHITECTURE.md                  # Detailed software & systems architecture
├── CHANGELOG.md                     # Release history (Keep a Changelog / SemVer)
├── CODE_OF_CONDUCT.md               # Contributor Covenant v2.1 standards
├── CONTRIBUTING.md                  # Developer & consultant contribution guidelines
├── DATABASE_GUIDE.md                # Supabase architecture, schema DDL & operations
├── DEPLOYMENT_GUIDE.md              # Deployment manual for Vercel, Docker, & Linux VPS
├── INTEGRATION_GUIDE.md             # Technical handover guide for webmasters
├── KNOWLEDGE_BASE_GUIDE.md          # Internal guide for corporate knowledge updates
├── LICENSE                          # Proprietary & Confidential Software License Agreement
├── PRD.md                           # Product Requirements Document
├── SECURITY.md                      # Security policy, disclosure, & data protection
├── TESTING_GUIDE.md                 # 14-layer Quality Assurance & test runner suite
├── TROUBLESHOOTING.md               # Incident runbook & error diagnosis
└── README.md                        # Primary project documentation
```

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js**: Version 20 LTS recommended (v18+ supported)
- **npm**: Version 9 or higher

### 2. Installation & Startup
```bash
# Clone and enter the repository
cd chatbot

# Install dependencies
npm install

# Start development server
npm run dev
```

Access endpoints locally:
- **Chat Assistant Portal:** [http://localhost:3000](http://localhost:3000)
- **Embed iFrame View:** [http://localhost:3000/embed-view](http://localhost:3000/embed-view)
- **Internal Admin CRM:** [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Environment Variables (`.env.local`)
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Configure production credentials:
```env
# 1. Supabase PostgreSQL Database (Required):
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key

# 2. Admin CRM Security & Authentication (Required for Production):
ADMIN_PASSWORD=your_secure_password_here
AUTH_SECRET=your_high_entropy_secret_here

# 3. Generative AI Engine (Optional - Grounded Offline RAG fallback active):
GEMINI_API_KEY=AIzaSy...

# 4. Automated Sales Lead Alerts:
LEAD_WEBHOOK_URL=https://...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
RESEND_API_KEY=re_...
LEAD_NOTIFICATION_EMAIL=corporatesecretary@inpartner.id
```

### 4. Quality Assurance & Diagnostics
```bash
# Verify connection to all Supabase PostgreSQL tables:
npm run db:check

# Run executive terminal QA test report:
npm run test:report

# Run standard test runner:
npm test
```

---

## 🚢 Production Deployment

The application supports multiple deployment environments:
- **Vercel Cloud (Recommended):** Zero-configuration serverless deployment with edge headers.
- **Docker Multi-Stage Containers:** Cloud Run, AWS ECS, or Kubernetes via [`Dockerfile`](./Dockerfile).
- **Linux VPS (Ubuntu/Debian):** Bare-metal or VPS deployment with Node.js, PM2, and Nginx reverse proxy.

> 📖 **Full Deployment Instructions:** Refer to [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for step-by-step setup, Nginx SSE buffering rules, and domain DNS setup.

---

## 🔒 Security & Data Privacy
- **Anti-Hallucination Guardrails:** AI responses are strictly anchored in official verified markdown knowledge base files.
- **Prompt Injection Defense:** User inputs are XML-delimited with strict system directives disallowing role overrides.
- **Sliding Window Rate Limiting:** In-memory sliding window rate limits protect against API spam on `/api/chat`, `/api/leads`, and `/api/admin/login`.
- **CWE-1236 & XSS Sanitization:** Neutralizes spreadsheet formula injection in CSV lead exports and HTML sanitization in automated email dispatches.
- **Indonesian UU PDP Compliance:** Lead submission requires explicit opt-in consent to privacy and consultation communication policies.

> 📖 **Full Security Policy:** Refer to [`SECURITY.md`](./SECURITY.md) for vulnerability reporting and encryption details.

---

## 📄 License
This software is proprietary and confidential.  
Copyright © 2026 PT Inpartner Optima Integra. All rights reserved.  
Refer to [`LICENSE`](./LICENSE) for official terms and conditions.
