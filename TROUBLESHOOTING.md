# 🛠️ Troubleshooting & Incident Runbook — Inpartner Agent

This document provides systematic diagnosis steps and resolution playbooks for common operational, deployment, and integration challenges encountered with the **Inpartner AI Business Consultation Assistant & CRM**.

---

## ⚡ 1. Rapid Diagnostic Triage (5-Second Health Check)

Whenever an operational anomaly is suspected, run these three quick commands:

```bash
# 1. Check live database connectivity and latency:
npm run db:check

# 2. Query application health endpoint:
curl -s http://localhost:3000/api/health | jq .

# 3. Verify all 14 test layers pass:
npm test
```

---

## 🗄️ 2. Database & Supabase Anomalies

### Issue A: "Connection Failed" / Application Falling Back to Local JSON
- **Symptom:** Logs show `[Supabase] Offline / Unconfigured fallback activated` or leads are writing only to `data/db.json`.
- **Root Causes:**
  1. `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing or contains leading/trailing whitespace.
  2. Network firewall or DNS lookup blocking outbound requests to `*.supabase.co`.
- **Resolution:**
  1. Inspect `.env.local` or hosting provider environment variables. Ensure values do not contain quotes or spaces.
  2. Test raw connectivity via cURL:
     ```bash
     curl -I https://your-project.supabase.co
     ```
  3. Run the automated check: `npm run db:check`.

### Issue B: "Postgres error: relation 'leads' does not exist"
- **Root Cause:** Supabase project was created, but the initial table schema has not been executed.
- **Resolution:**
  1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
  2. Navigate to **SQL Editor > New Query**.
  3. Copy and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
  4. Verify with: `npm run db:check`.

### Issue C: "Permission denied for table leads (RLS violation)"
- **Root Cause:** Row-Level Security policy restricts client mutations.
- **Resolution:**
  The schema in `supabase/schema.sql` includes policies permitting anonymous inserts for lead generation and public event logging. Re-apply the RLS policies defined in `supabase/schema.sql`.

---

## 🤖 3. Generative AI & Gemini API Issues

### Issue A: "429 Too Many Requests" / Quota Exhaustion
- **Symptom:** The console reports `GoogleGenerativeAIError: Resource has been exhausted (e.g. check quota)`.
- **System Behavior:** **The chatbot DOES NOT crash.** The fail-safe AI layer (`lib/ai.ts`) automatically falls back to **Grounded Offline RAG mode**, answering with verified text extracted directly from markdown knowledge files.
- **Resolution:**
  1. Check your Gemini API usage quota in Google Cloud / Google AI Studio.
  2. Enable billing or request a quota tier upgrade.
  3. You may rotate models via `GEMINI_MODEL=gemini-3.5-flash` or `gemini-flash-latest` in `.env.local`.

### Issue B: Chatbot Responds "Mohon maaf, informasi belum tersedia..."
- **Root Cause:** Anti-hallucination thresholding pruned context chunks because the inquiry is completely outside Inpartner's advisory domain (e.g. asking for medical, political, or personal opinions).
- **Resolution:**
  If the inquiry *is* a valid corporate advisory subject that Inpartner handles:
  1. Add a new section or bullet point to the relevant file in `knowledge/services/` or `knowledge/faq/`.
  2. Verify retrieval with `npm test tests/rag.test.ts`.

---

## 🔌 4. Website Widget Integration Issues

### Issue A: Floating Launcher Button Does Not Appear on `inpartner.id`
- **Root Causes:**
  1. The `<script>` tag is inserted into the `<head>` without the `defer` attribute.
  2. Content Blocker / AdBlocker extension blocking script injection.
  3. JavaScript syntax error from another third-party script on the host page halting execution.
- **Resolution:**
  1. Move the script tag to the bottom of the page right before `</body>`:
     ```html
     <script src="https://chat.inpartner.id/widget.js" defer></script>
     ```
  2. Open Chrome DevTools Console (`F12`) on the host website and verify no uncaught errors from other plugins.

### Issue B: Iframe Container Appears Blank or Blocked
- **Root Cause:** Host website or CDN blocking iframe embedding via `X-Frame-Options` or strict `Content-Security-Policy`.
- **Resolution:**
  1. Verify the assistant server's CSP header in `next.config.mjs` allows the host domain:
     ```javascript
     {
       key: 'Content-Security-Policy',
       value: "frame-ancestors 'self' https://inpartner.id https://*.inpartner.id;"
     }
     ```
  2. Ensure the host page is served over **HTTPS** (mixed-content blocking occurs if host is HTTP and embed is HTTPS).

### Issue C: Chat Widget Clashes with WhatsApp Button or Page Elements
- **Resolution:**
  Modify CSS offsets in `public/widget.js`:
  ```javascript
  // Adjust bottom distance to clear existing floating buttons
  launcher.style.bottom = '90px'; // default is 24px
  launcher.style.right = '24px';
  launcher.style.zIndex = '999999';
  ```

---

## 🔔 5. Sales Lead Alerts & Notification Failures

### Issue A: Lead Saved in CRM, but No Telegram Alert Received
- **Resolution:**
  1. Verify bot token format in `.env.local`: `TELEGRAM_BOT_TOKEN=123456789:ABC...`.
  2. Ensure the bot has been started: Open Telegram, search for your bot, and send `/start`.
  3. Ensure `TELEGRAM_CHAT_ID` matches your group or channel ID (group chat IDs typically begin with `-` or `-100`).
  4. Test sending manually via cURL:
     ```bash
     curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
       -d "chat_id=<CHAT_ID>&text=Test alert"
     ```

### Issue B: Resend Email Notifications Not Delivered
- **Resolution:**
  1. Verify your `RESEND_API_KEY` starts with `re_`.
  2. Ensure the sender domain (`inpartner.id`) has verified SPF, DKIM, and DMARC DNS records in the Resend dashboard.
  3. Check spam/junk folders for `corporatesecretary@inpartner.id`.

---

## 🔐 6. Admin CRM Access Issues

### Issue A: "The password or PIN you entered is incorrect"
- **Resolution:**
  Ensure the password matches `ADMIN_PASSWORD` in your `.env.local` or Vercel environment variables. Restart the Next.js process after changing environment variables.

### Issue B: "Too many login attempts. Administrative access locked"
- **Root Cause:** In-memory sliding-window brute-force defense triggered after 5 failed attempts.
- **Resolution:**
  Wait 15 minutes for the window to reset, or restart the server process / Docker container to clear the in-memory rate limiter cache.

---

## 🧪 7. Test Suite Warnings

### Notice: `[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type... is not specified`
- **Explanation:** This is an informational warning emitted by Node.js v20+ when executing TypeScript files via `--experimental-strip-types` without `"type": "module"` declared in `package.json`.
- **Impact:** **Zero impact on runtime functionality or test validity.** All 107 tests execute and pass 100%.
