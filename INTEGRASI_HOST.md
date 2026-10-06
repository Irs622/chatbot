# 🚀 Panduan Integrasi Inpartner AI Chatbot ke Website Utama (`inpartner`)

> **Dokumen Target:** Integrasi Modul Chatbot ke Web Platform `inpartner`  
> **Target Framework:** Next.js **13.2.4** (Pages Router) • React **18.2.0** • Bootstrap **5.2.3**  
> **Status Keamanan:** ✅ **ZERO-TOUCH MySQL 8 (Aman 100% Tanpa Perubahan Skema Database Host)**

---

## 📑 Daftar Isi
1. [Arsitektur & Peta Alokasi File](#1-arsitektur--peta-alokasi-file)
2. [Langkah 1: Tambahkan Dependencies ke `package.json`](#langkah-1-tambahkan-dependencies-ke-packagejson)
3. [Langkah 2: Salin File dari Modul Chatbot ke `inpartner`](#langkah-2-salin-file-dari-modul-chatbot-ke-inpartner)
4. [Langkah 3: Konfigurasi Tailwind Scoped di `tailwind.config.js`](#langkah-3-konfigurasi-tailwind-scoped-di-tailwindconfigjs)
5. [Langkah 4: Pasang Widget di `src/pages/_app.tsx`](#langkah-4-pasang-widget-di-srcpages_apptsx)
6. [Langkah 5: Konfigurasi Environment Variables (`.env`)](#langkah-5-konfigurasi-environment-variables-env)
7. [Langkah 6: Verifikasi Keamanan Database (Zero-Touch MySQL)](#langkah-6-verifikasi-keamanan-database-zero-touch-mysql)
8. [Langkah 7: Uji Coba Integrasi](#langkah-7-uji-coba-integrasi)

---

## 1. Arsitektur & Peta Alokasi File

Seluruh kode chatbot telah disesuaikan dan dikelompokkan ke dalam folder `src/` yang siap disalin atau di-*merge* langsung ke struktur folder project `inpartner`:

```
inpartner/
├── src/
│   ├── components/
│   │   └── Chatbot/                     <-- Komponen UI Chatbot
│   │       ├── ChatWidget.tsx           # Widget Utama (Isolasi CSS #inpartner-chatbot-container)
│   │       ├── ChatbotMount.tsx         # Client Mount aman Next.js 13 (SSR: false)
│   │       ├── ChatbotIcon.tsx          # Icon Avatar Resmi
│   │       └── index.ts                 # Entrypoint export
│   │
│   ├── chatbot/                         <-- Engine AI, RAG & Data
│   │   ├── knowledge/                   # Dokumen Knowledge Base Resmi
│   │   │   ├── company.md               # Profil PT Inpartner, visi & track record
│   │   │   ├── services.md              # 5 Layanan Utama & 4 Pilar Diagnostik
│   │   │   ├── sectors.md               # 14 Sektor Industri & Regulasi PMA/OSS
│   │   │   ├── faq.md                   # Tanya-Jawab bilateral Korea-Indonesia
│   │   │   ├── contact.md               # Kontak kantor Pakuwon Tower
│   │   │   └── projects.md              # Portofolio proyek korporat
│   │   │
│   │   └── lib/                         # Engine Logika Chatbot
│   │       ├── ai.ts                    # Google Gemini SDK & Grounded RAG Prompt
│   │       ├── rag.ts                   # Search & Chunking Engine RAG
│   │       ├── intent.ts                # NLP Intent Detector (ID/EN/KO)
│   │       ├── leadScoring.ts           # Matrix Scoring Lead (HIGH/MEDIUM/LOW)
│   │       ├── attribution.ts           # UTM Telemetry & First-Touch Tracker
│   │       ├── rateLimit.ts             # Proteksi IP rate limiter (Pages Router safe)
│   │       ├── db.ts                    # Supabase Cloud Client & Fail-safe Cache
│   │       ├── diagnostic.ts            # 4-Pillar Diagnostic Decision Trees
│   │       ├── qualification.ts         # Enterprise Qualification Schema
│   │       ├── validation.ts            # Validasi Telepon & Email
│   │       ├── proactiveNudge.ts        # Trigger Dwell Time (25s) & Exit Intent
│   │       ├── notifications.ts         # Async Notification (WhatsApp / Email)
│   │       ├── language.ts              # Trilingual Language Detector
│   │       ├── auth.ts                  # Admin session verification (dual-runtime)
│   │       ├── crmPipeline.ts           # CRM Pipeline Stages
│   │       ├── analyticsEngine.ts       # Dynamic Analytics Engine
│   │       └── supabaseClient.ts        # Supabase Client Singleton
│   │
│   ├── pages/
│   │   └── api/
│   │       ├── chat.ts                  # Endpoint Streaming SSE (NextApiRequest/NextApiResponse)
│   │       └── leads.ts                 # Endpoint Capture Leads (NextApiRequest/NextApiResponse)
│   │
│   └── styles/
│       └── chatbot.css                  # CSS Tailwind terisolasi (No Preflight)
│
└── tailwind.host.config.js              # Template Konfigurasi Tailwind Scoped Host
```

---

## Langkah 1: Tambahkan Dependencies ke `package.json`

Di dalam folder website utama `inpartner`, install 3 library pendukung chatbot berikut:

```bash
npm install @google/generative-ai @supabase/supabase-js lucide-react
```

*Catatan: React 18, Next 13, TypeScript, dan Tailwind sudah ada di website host sehingga tidak perlu diinstall ulang.*

---

## Langkah 2: Salin File dari Modul Chatbot ke `inpartner`

Jika melakukan penyalinan manual (atau `git cherry-pick`), salin folder-folder berikut dari repositori chatbot ini ke root website `inpartner`:

1. Salin `src/components/Chatbot/` ➡️ `inpartner/src/components/Chatbot/`
2. Salin `src/chatbot/` ➡️ `inpartner/src/chatbot/`
3. Salin `src/pages/api/chat.ts` ➡️ `inpartner/src/pages/api/chat.ts`
4. Salin `src/pages/api/leads.ts` ➡️ `inpartner/src/pages/api/leads.ts`
5. Salin `src/styles/chatbot.css` ➡️ `inpartner/src/styles/chatbot.css`

---

## Langkah 3: Konfigurasi Styling (CSS Terisolasi)

File `src/styles/chatbot.css` telah **di-compile secara mandiri (standalone)** dengan prefix `#inpartner-chatbot-container` dan tanpa `preflight`. 

Artinya:
- Website `inpartner` **TIDAK PERLU** memasang atau mengkonfigurasi build Tailwind khusus jika tidak diinginkan!
- Cukup salin `src/styles/chatbot.css` dan import di `_app.tsx`.
- Namun jika website `inpartner` ingin mengompilasi ulang Tailwind sendiri, gunakan konfigurasi `tailwind.config.js` berikut:

```javascript
// inpartner/tailwind.config.js
module.exports = {
  content: [
    './src/components/Chatbot/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false, // WAJIB FALSE agar tidak merusak CSS reset Bootstrap 5!
  },
  important: '#inpartner-chatbot-container', // Semua class Tailwind dibungkus ID ini
  theme: {
    extend: {
      colors: {
        inpartner: {
          primary: '#0779D1',
          dark: '#0668b3',
          accent: '#d4af37',
        },
      },
    },
  },
  plugins: [],
};
```

---

## Langkah 4: Pasang Widget di `src/pages/_app.tsx`

Buka file `src/pages/_app.tsx` pada website `inpartner`, lalu cukup tambahkan 2 baris:

```tsx
// src/pages/_app.tsx
import type { AppProps } from 'next/app';

// 1. Import CSS terisolasi chatbot
import '@/styles/chatbot.css';

// 2. Import komponen mount chatbot (client-side dynamic mount aman)
import { ChatbotMount } from '@/components/Chatbot';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      
      {/* 3. Render widget chatbot */}
      <ChatbotMount />
    </>
  );
}
```

---

## Langkah 5: Konfigurasi Environment Variables & Supabase DDL
 
1. **Jalankan Skema Database di Supabase:**
   - Buka SQL Editor di dashboard Supabase proyek Anda.
   - Buka file `supabase/schema.sql` pada modul ini, salin isinya, lalu jalankan (**Run**).
   - Tabel `leads`, `conversations`, `messages`, dan `analytics_events` akan terbuat secara instan lengkap dengan RLS (Row Level Security).

2. **Tambahkan Environment Variables ke `.env` / `.env.local`:**
   Tambahkan variabel berikut ke file `.env` server `inpartner`:

```ini
# ==========================================
# INPARTNER AI CHATBOT CONFIGURATION
# ==========================================

# 1. Google Gemini AI Engine
GEMINI_API_KEY=AIzaSy...

# 2. Supabase Cloud (Durabilitas Leads & History Chat)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 3. Notifikasi Konsultan (Opsional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_NOTIFICATION_EMAIL=corporatesecretary@inpartner.id
```

---

## Langkah 6: Verifikasi Keamanan Database (Zero-Touch MySQL)

> [!CAUTION]
> **JAMINAN KEAMANAN PRODUKSI:**
> Modul chatbot **TIDAK MENGGUNAKAN** MySQL atau Sequelize host.
> - Tidak ada tabel baru yang dibuat di database MySQL `inpartner`.
> - Tidak ada migrasi Sequelize yang dijalankan (`sequelize-cli db:migrate`).
> - Penyimpanan leads dan riwayat chat secara eksklusif menggunakan **Supabase PostgreSQL** di cloud.
> - Jika Supabase belum dikonfigurasi, sistem secara otomatis menyimpan fallback ke cache lokal `/tmp/leads-cache.json` tanpa mengganggu database MySQL produksi.

---

## Langkah 7: Uji Coba Integrasi

Setelah integrasi dipasang:
1. Jalankan website host: `npm run dev`.
2. Buka `http://localhost:3000` di browser.
3. **Verifikasi Tampilan:**
   - Balon launcher chatbot muncul di pojok kanan bawah tanpa merusak layout navbar atau grid Bootstrap 5.
   - Sapaan proaktif (proactive nudge) muncul otomatis setelah 25 detik (atau 10 detik untuk returning visitor).
4. **Verifikasi Fitur:**
   - Uji chat interaktif (Bahasa Indonesia, English, Korean).
   - Uji 4-Pilar Asesmen Diagnostik Bisnis.
   - Uji pengisian form konsultasi lead capture (pastikan No. Referensi `INP-...` dan deep link WhatsApp terbuat).

