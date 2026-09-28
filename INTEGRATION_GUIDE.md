# Inpartner AI Assistant Integration Guide (inpartner.id)

This technical guide is prepared for **Web Developers, Webmasters, and IT Teams** managing the primary corporate website at [inpartner.id](https://inpartner.id/).

---

## 🎯 Deployment Options

Three official integration methods are supported:

| Method | Ease of Implementation | Recommended Use Case |
| :--- | :---: | :--- |
| **Method 1: Script Widget (`widget.js`)** | ⭐ Extremely Easy (1 Line) | Injects a floating corporate chat launcher at the bottom-right corner across all web pages. |
| **Method 2: Embedded iFrame** | ⭐ Easy (Standard HTML) | Embeds the assistant directly inside a dedicated page container (e.g. `inpartner.id/ai-consultation`). |
| **Method 3: Direct React / Next.js Component** | ⭐⭐ Intermediate | If the main website is architected with Next.js or React. |

---

## 🚀 Method 1: Using the Script Widget (Highly Recommended)

This script behaves like enterprise concierge widgets (Intercom, Zendesk). Simply insert this snippet right before the closing `</body>` tag:

```html
<!-- Inpartner AI Business Consultation Assistant Widget -->
<script src="https://chat.inpartner.id/widget.js" defer></script>
```
*(Replace `https://chat.inpartner.id` with your live production deployment URL).*

### 🛠️ Platform-Specific Setup:

#### 1. WordPress
- **Option A (Via Plugin - Recommended):**
  1. Install a code manager such as **WPCode** or **Insert Headers and Footers**.
  2. Create a new snippet assigned to the **Footer** section.
  3. Paste the script snippet above, then click **Save & Activate**.
- **Option B (Via Theme):**
  Open `footer.php` of your active theme, paste the script directly above `</body>`.
- **Option C (Via Elementor):**
  Navigate to **Elementor > Custom Code > Add New**, select **End of <body>**, insert the script, and publish to Entire Site.

#### 2. Webflow
1. Open **Project Settings** in Webflow.
2. Select the **Custom Code** tab.
3. Under **Footer Code**, paste the `<script ...></script>` tag.
4. Click **Save Changes** and **Publish**.

#### 3. Standard HTML / PHP / Laravel
- Open your primary root layout file (e.g., `index.html`, `footer.php`, or `resources/views/layouts/app.blade.php`).
- Paste the script snippet directly before `</body>`.

---

## 🖼️ Method 2: Dedicated iFrame Embed

If you wish to embed the assistant within the body of a dedicated consultation page:

```html
<div style="width: 100%; max-width: 440px; height: 750px; margin: 0 auto; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.12);">
  <iframe
    src="https://chat.inpartner.id/embed-view"
    width="100%"
    height="100%"
    frameborder="0"
    allow="clipboard-write"
    title="Inpartner AI Assistant"
  ></iframe>
</div>
```

---

## ⚛️ Method 3: Direct Component Integration (Next.js / React)

If your primary website is built with Next.js App Router:
1. Copy [`components/ChatWidget.tsx`](./components/ChatWidget.tsx) into your component directory.
2. Copy [`lib/`](./lib/) and [`knowledge/`](./knowledge/).
3. Replicate backend API routes in your `app/api/` folder:
   - `app/api/chat/route.ts`
   - `app/api/leads/route.ts`
   - `app/api/analytics/route.ts`
4. Render the component on your target page:
   ```tsx
   import ChatWidget from '@/components/ChatWidget';

   export default function Page() {
     return (
       <main>
         <ChatWidget initialOpen={false} embeddedMode={false} />
       </main>
     );
   }
   ```

---

## 🌐 Custom Subdomain & Security Configuration

1. **Subdomain Recommendation:**
   - Configure a dedicated subdomain: `chat.inpartner.id` or `bot.inpartner.id`.
2. **DNS Configuration:**
   - Create a **CNAME** DNS record:
     - *Name:* `chat`
     - *Target:* `cname.vercel-dns.com` (for Vercel) or your host IP.
3. **CORS & iFrame Security Headers:**
   - The `/embed-view` endpoint is configured with permissive `Content-Security-Policy: frame-ancestors *` to allow seamless embedding on `inpartner.id`.
   - The `/admin` CRM dashboard is secured with `X-Frame-Options: DENY` to prevent clickjacking attacks.

---

## 📊 Automated Google Sheets Logging & Email Notifications

Using a single Google Apps Script webhook, inbound consultation inquiries are **automatically recorded in Google Sheets** and **dispatched instantly to the corporate advisory sales team**:

1. Create a new **Google Spreadsheet** with columns:
   `Timestamp | Full Name | Company | WhatsApp | Email | Advisory Need | Notes`
2. Open **Extensions > Apps Script** and paste this script:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     var lead = data.lead || {};
     
     // 1. Append record to Google Sheets
     sheet.appendRow([
       new Date(),
       lead.name,
       lead.company || '-',
       lead.phone,
       lead.email || '-',
       lead.business_need,
       lead.notes || '-'
     ]);

     // 2. Dispatch real-time executive email alert
     var targetEmail = "corporatesecretary@inpartner.id";
     var waLink = lead.whatsapp_link || ("https://wa.me/" + lead.phone.replace(/[^0-9]/g, ''));
     
     MailApp.sendEmail({
       to: targetEmail,
       subject: "🚨 New Business Lead (Inpartner Assistant): " + lead.name + " - " + lead.business_need,
       htmlBody: 
         "<div style='font-family:sans-serif; padding:18px; border:1px solid #e2e8f0; border-radius:12px; max-width:550px;'>" +
           "<h3 style='color:#005DAD; margin-top:0;'>New Corporate Advisory Consultation Request</h3>" +
           "<p><strong>Name:</strong> " + lead.name + "</p>" +
           "<p><strong>Company:</strong> " + (lead.company || "-") + "</p>" +
           "<p><strong>WhatsApp:</strong> <a href='" + waLink + "'>" + lead.phone + "</a></p>" +
           "<p><strong>Email:</strong> " + (lead.email || "-") + "</p>" +
           "<p><strong>Advisory Need:</strong> " + lead.business_need + "</p>" +
           "<p><strong>Project Scope / Notes:</strong> " + (lead.notes || "-") + "</p>" +
           "<br><a href='" + waLink + "' style='background:#005DAD; color:#fff; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;'>Engage Client via WhatsApp</a>" +
         "</div>"
     });

     return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Click **Deploy > New deployment > Web app**, select *Who has access: Anyone*.
4. Copy the deployment Web App URL and add it to your environment variables on Vercel:
   ```env
   LEAD_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
   ```
5. Done! Leads now stream live to your spreadsheet and sales inboxes simultaneously.

---

## 🧪 Post-Integration Verification Checklist

After adding the snippet to `inpartner.id`:
1. Open `inpartner.id` in a browser Incognito window.
2. Confirm that the `#005DAD` circular launcher appears at the bottom-right corner.
3. Click the launcher to verify:
   - Greeting window animates smoothly at 60 FPS.
   - Quick action prompt chips initiate the appropriate advisory diagnostic flow.
   - The streaming typewriter responds in real time.
   - The consultation lead modal submits successfully.
   - Responsive layout adapts cleanly on mobile screens (`dvh` viewport adaptation).
