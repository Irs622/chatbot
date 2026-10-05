# 🚀 Production Deployment & DevOps Guide — Inpartner Agent

This technical guide provides comprehensive, production-grade instructions for deploying, scaling, and maintaining the **Inpartner AI Business Consultation Assistant & CRM** across modern hosting environments.

---

## 🏗️ 1. Production Topology Overview

In production, the application operates as an independent micro-frontend service communicating with the primary corporate website:

```text
Host Website:         https://inpartner.id               (WordPress / Webflow / Custom HTML)
                      │
                      ▼ (Loads public/widget.js)
Assistant Service:    https://chat.inpartner.id          (Next.js 14 / Docker / Vercel)
                      ├── /embed-view                    (Iframe consultation client)
                      ├── /admin                         (Internal Corporate CRM)
                      └── /api/*                         (SSE Stream, RAG, Leads, Supabase)
                      │
                      ▼
Cloud Storage:        Supabase Cloud PostgreSQL          (authoritative data persistence)
```

---

## ☁️ 2. Option A: Vercel Cloud Serverless (Recommended)

Vercel provides native zero-configuration hosting for Next.js 14 App Router with global Edge CDN caching and automated SSL.

### Step-by-Step Instructions:
1. **Push to GitHub / GitLab:**
   Ensure your code is pushed to your corporate Git repository.
2. **Import Project to Vercel:**
   - Log in to your [Vercel Dashboard](https://vercel.com/).
   - Click **Add New > Project** and select the `chatbot` repository.
   - Framework Preset will automatically detect **Next.js**.
3. **Configure Environment Variables:**
   Under **Settings > Environment Variables**, add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ADMIN_PASSWORD=your_secure_admin_password
   AUTH_SECRET=your_high_entropy_secret_64_chars
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-3.8-flash
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_CHAT_ID=...
   RESEND_API_KEY=re_...
   LEAD_NOTIFICATION_EMAIL=corporatesecretary@inpartner.id
   ```
4. **Deploy:** Click **Deploy**. Vercel will build the application in ~60 seconds.
5. **Attach Custom Subdomain:**
   - Go to **Project Settings > Domains**.
   - Add `chat.inpartner.id`.
   - Add the resulting `CNAME` record in your DNS manager (e.g. Cloudflare / cPanel):
     ```text
     Type:  CNAME
     Name:  chat
     Value: cname.vercel-dns.com
     TTL:   Auto / 300
     ```

---

## 🐳 3. Option B: Docker Container Deployment

For on-premise servers, AWS ECS, GCP Cloud Run, or Kubernetes, utilize the included multi-stage [`Dockerfile`](./Dockerfile).

### 1. Build Docker Image:
```bash
docker build -t inpartner-chat:1.0.0 .
```

### 2. Run Container with Environment File:
```bash
docker run -d \
  --name inpartner-chat \
  --restart always \
  -p 3000:3000 \
  --env-file .env.production \
  -v inpartner_data:/app/data \
  inpartner-chat:1.0.0
```

### 3. Docker Compose (`docker-compose.yml`):
Create a `docker-compose.yml` file for unified multi-container setups:

```yaml
version: '3.8'

services:
  chatbot:
    image: inpartner-chat:1.0.0
    build:
      context: .
      dockerfile: Dockerfile
    container_name: inpartner-chat
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - AUTH_SECRET=${AUTH_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - crm_cache:/app/data
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s

volumes:
  crm_cache:
```

Launch with:
```bash
docker compose up -d
```

---

## 🖥️ 4. Option C: Linux VPS (Ubuntu 22.04 LTS) with PM2 & Nginx

For standalone virtual private servers (DigitalOcean, Linode, AWS EC2, Alibaba Cloud).

### Step 1: Install Node.js 20 LTS & PM2
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### Step 2: Clone and Build
```bash
# Clone to /var/www/
sudo mkdir -p /var/www/inpartner-chat
sudo chown -R $USER:$USER /var/www/inpartner-chat
cd /var/www/inpartner-chat
git clone https://github.com/inpartner/chatbot.git .

# Install dependencies and build
npm ci
cp .env.local.example .env.local
# Edit .env.local with production keys:
nano .env.local

npm run build
```

### Step 3: Run with PM2
```bash
pm2 start npm --name "inpartner-chat" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx with SSE Streaming Buffering Disabled
Create `/etc/nginx/sites-available/chat.inpartner.id`:

```nginx
server {
    server_name chat.inpartner.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Essential HTTP Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CRITICAL for SSE (Server-Sent Events) Typewriter Streaming:
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        chunked_transfer_encoding on;
    }

    # Restrict Iframe Embedding exclusively to inpartner.id
    add_header Content-Security-Policy "frame-ancestors 'self' https://inpartner.id https://*.inpartner.id;" always;
}
```

Enable site & reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/chat.inpartner.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Issue Free SSL via Let's Encrypt Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d chat.inpartner.id
```

---

## 📋 5. Production Environment Variables Checklist

Ensure all variables are configured in `.env.production` or your hosting dashboard:

| Variable | Required | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase Project Cloud URL | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase Anonymous Client Key | `eyJhbGciOi...` |
| `ADMIN_PASSWORD` | **Yes** | Secret password for CRM access | `SuperSecureCorporatePass2026!` |
| `AUTH_SECRET` | **Yes** | Secret key for signing session tokens | `64_char_hex_random_key` |
| `GEMINI_API_KEY` | Recommended | Google AI Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Optional | Target Gemini Model identifier | `gemini-3.8-flash` |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram Bot Token for lead alerts | `7123456789:AAH...` |
| `TELEGRAM_CHAT_ID` | Optional | Telegram Channel / Group Chat ID | `-1001234567890` |
| `RESEND_API_KEY` | Optional | Resend API key for corporate email | `re_123456789` |
| `LEAD_NOTIFICATION_EMAIL`| Optional | Recipient email for new leads | `corporatesecretary@inpartner.id` |
| `LEAD_WEBHOOK_URL` | Optional | Webhook endpoint for CRM sync | `https://hooks.zapier.com/...` |

---

## 🩺 6. Verification & Post-Deployment Smoke Test

Immediately following deployment, run these validation checks:

1. **Health Check Probe:**
   ```bash
   curl -s https://chat.inpartner.id/api/health | jq .
   ```
   *Expected response:* `"status": "ok"` with `"connected": true` for Supabase.

2. **Iframe Header Test:**
   ```bash
   curl -I https://chat.inpartner.id/embed-view
   ```
   *Verify CSP `frame-ancestors` permits `https://inpartner.id`.*

3. **Database Check Script:**
   ```bash
   npm run db:check
   ```
