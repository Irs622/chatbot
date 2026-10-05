# 📡 Inpartner AI Assistant & CRM — REST & Streaming API Reference

This document provides the official technical specification for all application programming interfaces (APIs) exposed by the **Inpartner AI Business Consultation Assistant & CRM**.

---

## 🌐 1. Global Conventions & Standards

### Base URL
- **Local Development:** `http://localhost:3000`
- **Production Server:** `https://chat.inpartner.id`

### Authentication Model
Protected corporate endpoints require administrator privileges verified via either:
1. **HTTP-only Cookie:** `inpartner_admin_token=<token>` (automatically sent in browser sessions).
2. **Authorization Header:** `Authorization: Bearer <token>`.

### Error Response Schema
All error responses adhere to standard HTTP status codes and return a consistent JSON payload:
```json
{
  "error": "Internal server error",
  "request_id": "req_1728100123_abc123"
}
```

---

## 🚦 2. Rate Limiting Policies

The server enforces an in-memory sliding-window rate limiter per client IP:

| Endpoint | Window | Max Requests | Exceeded Status Code |
| :--- | :---: | :---: | :---: |
| `POST /api/chat` | 1 minute | 30 requests | `429 Too Many Requests` |
| `POST /api/leads` | 10 minutes | 5 submissions | `429 Too Many Requests` |
| `POST /api/admin/login` | 15 minutes | 5 attempts | `429 Too Many Requests` |

---

## 💬 3. Chat & Conversational Stream Endpoints

### `POST /api/chat`
Streams real-time consultation responses via **Server-Sent Events (SSE)**, incorporating RAG context and intent detection.

- **Access:** Public (Rate-limited)
- **Content-Type:** `application/json`
- **Response Format:** `text/event-stream; charset=utf-8`

#### Request Body
```json
{
  "messages": [
    { "role": "user", "content": "Perusahaan kami butuh advisory untuk ekspansi pasar ke Jawa Timur." }
  ],
  "conversationId": "conv_1728100123_abc123",
  "visitorProfile": {
    "preferredLanguage": "id"
  }
}
```

#### SSE Event Chunks
The stream emits Server-Sent Events containing JSON fragments:
```text
data: {"type":"token","token":"Halo! "}
data: {"type":"token","token":"Inpartner dapat mendampingi ekspansi bisnis Anda..."}
data: {"type":"metadata","intent":"service_market_access","confidence":0.94,"citations":["services/market-access-expansion.md"]}
data: {"type":"follow_ups","options":["Bagaimana skema retainer?","Jadwalkan konsultasi"]}
data: [DONE]
```

---

## 📋 4. Lead Capture & CRM Pipeline Endpoints

### `POST /api/leads`
Captures, qualifies, scores, and stores a new client consultation inquiry. Dispatches instant alerts (Telegram / Email / Webhook).

- **Access:** Public (Rate-limited)
- **Headers:** `Content-Type: application/json`

#### Request Payload
```json
{
  "conversation_id": "conv_1728100123_abc123",
  "name": "Budi Santoso",
  "company": "PT Mega Logistik Nusantara",
  "job_title": "Chief Operating Officer",
  "company_scale": "51-200",
  "industry": "Logistics & Supply Chain",
  "timeline": "immediate",
  "email": "budi.santoso@megalogistik.co.id",
  "phone": "+6281234567890",
  "business_need": "Restrukturisasi biaya logistik dan penataan efisiensi rute operasional.",
  "diagnostic_summary": "Tantangan margin tertekan pada ekspansi gudang regional.",
  "attribution": {
    "source": "linkedin",
    "medium": "cpc",
    "campaign": "q4_operational_excellence"
  }
}
```

#### Response (`201 Created` or `200 OK`)
```json
{
  "success": true,
  "consultation_ref": "INP-20261005-A7B2",
  "lead": {
    "id": "lead_1728100234_xyz789",
    "name": "Budi Santoso",
    "company": "PT Mega Logistik Nusantara",
    "score": 90,
    "priority_tier": "tier_1_hot",
    "status": "new",
    "created_at": "2026-10-05T10:45:00.000Z"
  },
  "whatsapp_direct_url": "https://wa.me/6285934548202?text=Halo%20INPARTNER..."
}
```

---

### `GET /api/leads`
Retrieves all captured consultation leads.

- **Access:** Protected (Admin only)
- **Headers:** `Authorization: Bearer <token>` or Admin Session Cookie

#### Response (`200 OK`)
```json
{
  "success": true,
  "count": 42,
  "leads": [
    {
      "id": "lead_1728100234_xyz789",
      "name": "Budi Santoso",
      "company": "PT Mega Logistik Nusantara",
      "phone": "+6281234567890",
      "email": "budi.santoso@megalogistik.co.id",
      "status": "new",
      "score": 90,
      "priority_tier": "tier_1_hot",
      "created_at": "2026-10-05T10:45:00.000Z"
    }
  ]
}
```

---

### `GET /api/leads/:id`
Retrieves detailed information for a single lead, including full conversation transcripts.

- **Access:** Protected (Admin only)

#### Response (`200 OK`)
```json
{
  "success": true,
  "lead": {
    "id": "lead_1728100234_xyz789",
    "name": "Budi Santoso",
    "status": "new",
    "score": 90
  },
  "messages": [
    { "role": "user", "content": "Halo, apakah ada advisory untuk logistik?" },
    { "role": "assistant", "content": "Halo! Inpartner memiliki pilar Operational Excellence..." }
  ]
}
```

---

### `PATCH /api/leads/:id`
Updates lead Kanban status or adds internal consulting notes.

- **Access:** Protected (Admin only)
- **Request Body:**
```json
{
  "status": "scheduled",
  "notes": "Meeting konsultasi perdana dijadwalkan via Zoom hari Kamis pukul 14:00 WIB."
}
```
*Valid Status Values:* `'new'`, `'contacted'`, `'in_progress'`, `'proposal'`, `'converted'`, `'closed'`.

#### Response (`200 OK`)
```json
{
  "success": true,
  "lead": {
    "id": "lead_1728100234_xyz789",
    "status": "scheduled",
    "notes": "Meeting konsultasi perdana dijadwalkan via Zoom hari Kamis pukul 14:00 WIB."
  }
}
```

---

### `DELETE /api/leads/:id`
Permanently deletes a lead record.

- **Access:** Protected (Admin only)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Lead lead_1728100234_xyz789 successfully deleted."
}
```

---

## 🔒 5. Administrative Authentication Endpoints

### `POST /api/admin/login`
Authenticates an administrator with timing-safe comparison and issues a signed session cookie.

- **Access:** Public (Rate-limited: 5 attempts / 15 mins)
- **Request Body:**
```json
{
  "password": "your_secure_admin_password"
}
```
- **Response Headers:** `Set-Cookie: inpartner_admin_token=...; HttpOnly; SameSite=Lax; Path=/`

### `POST /api/admin/logout`
Invalidates the administrator session and clears authentication cookies.

- **Access:** Public
- **Response (`200 OK`):**
```json
{ "success": true, "message": "Successfully logged out." }
```

### `GET /api/admin/check`
Verifies whether the current request possesses a valid admin session.

- **Response (`200 OK`):**
```json
{ "authenticated": true }
```

### `GET /api/admin/export`
Exports filtered consultation leads into an RFC 4180 CSV file, sanitized against **CWE-1236 Formula Injection**.

- **Access:** Protected (Admin only)
- **Query Parameters:**
  - `startDate`: `YYYY-MM-DD` (Optional)
  - `endDate`: `YYYY-MM-DD` (Optional)
  - `status`: Filter by status (Optional)
  - `priority`: Filter by priority tier (`tier_1_hot`, `tier_2_warm`, `tier_3_standard`) (Optional)
- **Response Headers:** `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="inpartner-crm-leads-2026-10-05.csv"`

---

## 📊 6. Analytics & Telemetry Endpoints

### `GET /api/analytics`
Fetches high-level executive KPIs, funnel conversion rates, and conversational intent distribution.

- **Access:** Protected (Admin only)

#### Response (`200 OK`)
```json
{
  "success": true,
  "totalConversations": 1420,
  "totalLeads": 184,
  "conversionRate": 12.96,
  "topIntents": [
    { "intent": "service_strategy", "count": 480 },
    { "intent": "service_investment", "count": 395 },
    { "intent": "service_market_access", "count": 270 }
  ]
}
```

### `POST /api/analytics`
Logs interaction events (e.g. widget opened, nudge shown, consultation initiated).

- **Access:** Public
- **Request Body:**
```json
{
  "event_name": "widget_opened",
  "session_id": "sess_1728100_abc",
  "conversation_id": "conv_1728100_xyz",
  "metadata": { "page": "/services/investment" }
}
```

---

## 🩺 7. Health & Diagnostics Endpoints

### `GET /api/health`
Lightweight public liveness probe for load balancers and uptime monitoring.

- **Access:** Public

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "timestamp": "2026-10-05T10:45:00.000Z"
}
```

---

### `GET /api/admin/health`
Comprehensive diagnostic probe inspecting Supabase PostgreSQL connectivity, round-trip latency, and Gemini API engine status.

- **Access:** Protected (Admin only)

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "hasGeminiKey": true,
  "configuredModel": "gemini-3.8-flash",
  "activeCandidates": ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"],
  "database": {
    "provider": "supabase",
    "configured": true,
    "connected": true,
    "latencyMs": 42
  },
  "timestamp": "2026-10-05T10:45:00.000Z"
}
```

---

### `GET /api/knowledge`
Allows administrators to simulate RAG retrieval and inspect indexed knowledge chunks.

- **Access:** Protected (Admin only)
- **Query Parameter:** `?query=akuisisi+perusahaan`

#### Response (`200 OK`)
```json
{
  "query": "akuisisi perusahaan",
  "chunksFound": 3,
  "results": [
    {
      "source": "knowledge/services/strategy-corporate-advisory.md",
      "title": "Mergers & Acquisitions (M&A) and Joint Venture Advisory",
      "score": 0.88,
      "snippet": "Inpartner mendampingi proses buy-side & sell-side advisory..."
    }
  ]
}
```
