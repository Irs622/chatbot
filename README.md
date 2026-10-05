# Inpartner AI Business Consultation Assistant (Inpartner Agent)

> Official AI Conversational Assistant for [Inpartner](https://inpartner.id/) (PT Inpartner Optima Integra) — Powered by Grounded Knowledge Retrieval-Augmented Generation (RAG) and Modern Corporate Inpartner Blue (`#005DAD`) Design.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-sky?logo=tailwindcss)
![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)

---

## 📌 Executive Product Summary

**Inpartner Agent** is an intelligent corporate advisory consultation assistant engineered to engage enterprise leaders, business owners, and institutional visitors navigating **[inpartner.id](https://inpartner.id/)**. It transforms passive website browsing into high-value diagnostic conversations, identifies specific organizational bottlenecks, recommends appropriate advisory pillars, and streamlines formal consultation scheduling with the Inpartner partner team.

### 4 Core Advisory Pillars:
1. **📈 Business Growth & Market Expansion:** Corporate growth roadmap, new market penetration, revenue scaling, and Go-to-Market strategies.
2. **💰 Funding & Investment Advisory:** Investment readiness, independent valuation, institutional capital connection (VC, PE, Family Offices). *(Strictly an independent advisory firm — not a direct balance-sheet lender)*.
3. **📊 Profitability & Operational Excellence:** Deep cost structure audits (COGS & OPEX), operational margin restoration, and efficiency re-engineering.
4. **👥 Capacity Building (The Executive Business Program):** Executive coaching, leadership mastery, and cross-functional managerial alignment.

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

---

## 📁 Repository Structure

```text
chatbot/
├── app/
│   ├── admin/page.tsx               # Internal Admin CRM login & overview
│   ├── api/
│   │   ├── admin/                   # Secure authentication & session validation
│   │   ├── analytics/route.ts       # Interaction KPI & metrics logging
│   │   ├── chat/route.ts            # SSE streaming chat & RAG retrieval
│   │   ├── conversations/route.ts   # Conversation history management
│   │   ├── embed.js/route.ts        # Dynamic cross-origin embed loader
│   │   ├── knowledge/route.ts       # Knowledge base inspection (authenticated)
│   │   └── leads/                   # Lead ingestion & status management
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
│   └── db.json                      # Seed database (leads, sessions, metrics)
├── knowledge/                       # Ground truth markdown knowledge base
│   ├── company/company-profile.md   # Corporate credentials, vision, mission, ESG
│   ├── contact/contact.md           # Jakarta & Surabaya offices, WhatsApp, email
│   ├── faq/faq.md                   # Engagement models & consulting FAQ
│   ├── projects/projects.md         # Track record & corporate case studies
│   ├── sectors/sectors.md           # 13 priority industry verticals
│   └── services/                    # 5 core advisory pillars
├── lib/
│   ├── ai.ts                        # Gemini & Grounded RAG multi-model reasoning
│   ├── db.ts                        # Dual-mode database layer (Supabase + fallback)
│   ├── supabaseClient.ts            # Dynamic Supabase client & health telemetry
│   ├── notifications.ts             # Webhook, Telegram, and Resend email alerts
│   ├── rag.ts                       # Markdown tokenizer, chunking, & scoring
│   └── rateLimit.ts                 # Sliding-window IP rate limiter
├── public/
│   ├── widget.js                    # Universal lightweight script embed
│   ├── demo-website.html            # Local testbed simulating host website
│   └── chaboot.svg                  # Official brand geometric icon
├── supabase/
│   └── schema.sql                   # Supabase PostgreSQL DDL, indexes, and RLS policies
├── .env.local.example               # Template environment configuration
├── DATABASE_GUIDE.md                # Supabase architecture, schema DDL & operations
├── INTEGRATION_GUIDE.md             # Technical handover guide for webmasters
├── KNOWLEDGE_BASE_GUIDE.md          # Internal guide for knowledge updates
├── TESTING_GUIDE.md                 # 14-layer Quality Assurance & test runner suite
├── PRD.md                           # Product Requirements Document
└── README.md                        # Primary project documentation
```

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js**: Version 18 or higher (Node.js 20 LTS recommended)
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

# 3. Generative AI Engine (Optional):
GEMINI_API_KEY=AIzaSy...

# 4. Automated Sales Lead Alerts:
LEAD_WEBHOOK_URL=https://...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
RESEND_API_KEY=re_...
LEAD_NOTIFICATION_EMAIL=corporatesecretary@inpartner.id
```

### 4. Verify Database Connectivity
```bash
# Verify connection to all Supabase PostgreSQL tables:
npm run db:check
```

---

## 🚢 Production Deployment

### Option A: Vercel (Recommended)
1. Push the repository to GitHub.
2. Import the project into [vercel.com](https://vercel.com).
3. Set the required Environment Variables (`ADMIN_PASSWORD`, `GEMINI_API_KEY`, etc.).
4. Click **Deploy**.
5. Connect your custom domain/subdomain under **Settings > Domains** (e.g. `chat.inpartner.id`).

---

## 🔒 Security & Data Privacy
- **Anti-Hallucination Guardrails:** AI responses are strictly anchored in official verified markdown knowledge base files.
- **Prompt Injection Defense:** User inputs are XML-delimited with strict system directives disallowing role overrides.
- **Sliding Window Rate Limiting:** In-memory sliding window rate limits protect against API spam on `/api/chat`, `/api/leads`, and `/api/admin/login`.
- **CWE-1236 & XSS Sanitization:** Neutralizes spreadsheet formula injection in CSV lead exports and HTML sanitization in automated email dispatches.
- **Explicit Consent:** Lead submission requires user opt-in to privacy and consultation communication policies.

---

## 📄 License
Copyright © 2026 PT Inpartner Optima Integra. All rights reserved.
