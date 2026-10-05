# 🗄️ Supabase PostgreSQL Database Architecture & Operations Guide

Panduan teknis resmi ini mendokumentasikan arsitektur basis data, skema tabel, indeks performa, kebijakan keamanan Row-Level Security (RLS), alur sinkronisasi data, serta prosedur operasional untuk **Inpartner AI Business Consultation Assistant & CRM**.

---

## 🏗️ 1. Arsitektur Basis Data (Database Architecture)

Sistem menggunakan **Supabase PostgreSQL** sebagai penyimpanan data cloud primer yang otoritatif dan tersentralisasi. Untuk menjamin ketersediaan tinggi (*high availability*) dan keandalan saat cold start atau kendala jaringan, lapisan abstraksi basis data (`lib/db.ts`) dirancang dengan prinsip **dual-mode fail-safe**.

```mermaid
flowchart TD
    subgraph Client Applications
        Visitor[Pengunjung Website / Chatbot Widget]
        Admin[Tim Corporate Advisory / CRM Admin Dashboard]
    end

    subgraph NextJS Application Server
        APIEndpoints["API Routes (/api/chat, /api/leads, /api/analytics, /api/health)"]
        DBLayer["lib/db.ts (Data Access Layer - Async)"]
        ClientLayer["lib/supabaseClient.ts (Dynamic Evaluator & Health Check)"]
        LocalCache["Fallback Cache (data/db.json / Memory)"]
    end

    subgraph Supabase PostgreSQL Cloud
        direction TB
        TLeads[(public.leads)]
        TConversations[(public.conversations)]
        TMessages[(public.messages)]
        TEvents[(public.analytics_events)]
    end

    Visitor --> APIEndpoints
    Admin --> APIEndpoints
    APIEndpoints --> DBLayer
    DBLayer --> ClientLayer
    ClientLayer -->|Koneksi Online (Primary)| Supabase
    DBLayer -.->|Jaringan Offline / Unconfigured (Fallback)| LocalCache
    ClientLayer --> TLeads
    ClientLayer --> TConversations
    ClientLayer --> TMessages
    ClientLayer --> TEvents
```

### Prinsip Operasional Kunci:
1. **Otoritatif**: Saat variabel lingkungan Supabase terkonfigurasi, seluruh operasi baca (*read*) dan tulis (*write*) dieksekusi secara asinkron (`Async`) langsung ke Supabase PostgreSQL.
2. **Graceful Degradation**: Jika terjadi gangguan koneksi internet atau environment belum terkonfigurasi, sistem secara mulus beralih ke cache lokal tanpa membuat bot berhenti merespons pengunjung.
3. **Data Integrity**: ID entitas menggunakan format unik berkode awalan (`conv_*`, `msg_*`, `lead_*`, `evt_*`) berbasis timestamp dan acak string untuk mencegah benturan kunci primer.

---

## 📊 2. Skema & Definisi Tabel (Schema DDL)

Skema database tersimpan di [`supabase/schema.sql`](./supabase/schema.sql) dan terdiri dari 4 tabel utama:

### A. Tabel `public.leads`
Menampung prospek konsultasi korporat masuk (*sales inquiry & pipeline CRM*).

| Kolom | Tipe Data | Nullable | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `TEXT` | NOT NULL | **Primary Key** (format `lead_<timestamp>_<rand>`) |
| `conversation_id` | `TEXT` | YES | Relasi ke sesi obrolan awal |
| `name` | `TEXT` | NOT NULL | Nama lengkap calon klien |
| `company` | `TEXT` | YES | Nama entitas bisnis / perusahaan |
| `job_title` | `TEXT` | YES | Jabatan / posisi struktural |
| `company_scale` | `TEXT` | YES | Skala bisnis (`startup`, `sme`, `mid_market`, `enterprise`) |
| `industry` | `TEXT` | YES | Sektor industri bisnis klien |
| `timeline` | `TEXT` | YES | Rencana durasi implementasi |
| `email` | `TEXT` | NOT NULL | Alamat email korporat |
| `phone` | `TEXT` | NOT NULL | Nomor WhatsApp / telepon terverifikasi (+62) |
| `business_need` | `TEXT` | NOT NULL | Kategori kebutuhan konsultasi |
| `notes` | `TEXT` | YES | Catatan ruang lingkup proyek / tantangan |
| `diagnostic_summary` | `TEXT` | YES | Ringkasan hasil tes diagnostik konsultatif |
| `diagnostic_data` | `JSONB` | YES | Detail jawaban pilar diagnostik terstruktur |
| `attribution` | `JSONB` | YES | Telemetri pemasaran (UTM Source, Medium, Campaign) |
| `status` | `TEXT` | NOT NULL | Status pipeline CRM (`new`, `contacted`, `in_progress`, dll.) |
| `score` | `INTEGER` | YES | Skor potensi komersial otomatis (0–100) |
| `priority_tier` | `TEXT` | YES | Tingkatan prioritas SLA (`tier_1`, `tier_2`, `tier_3`) |
| `score_breakdown` | `JSONB` | YES | Rincian faktor bobot penilaian prospek |
| `created_at` | `TIMESTAMPTZ`| YES | Waktu pendaftaran prospek (default: `NOW()`) |

### B. Tabel `public.conversations`
Menyimpan sesi interaksi obrolan konsultasi bisnis.

| Kolom | Tipe Data | Nullable | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `TEXT` | NOT NULL | **Primary Key** (format `conv_<timestamp>_<rand>`) |
| `session_id` | `TEXT` | NOT NULL | Token sesi penjelajah pengunjung |
| `started_at` | `TIMESTAMPTZ`| YES | Waktu mulai sesi konsultasi |
| `ended_at` | `TIMESTAMPTZ`| YES | Waktu sesi ditutup / diakhiri |
| `user_intent` | `TEXT` | YES | Intent dominan percakapan |
| `summary` | `TEXT` | YES | Ringkasan otomatis jalannya konsultasi |
| `created_at` | `TIMESTAMPTZ`| YES | Waktu inisialisasi sesi |

### C. Tabel `public.messages`
Menyimpan transkrip lengkap percakapan antara klien dan AI Assistant.

| Kolom | Tipe Data | Nullable | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `TEXT` | NOT NULL | **Primary Key** (format `msg_<timestamp>_<rand>`) |
| `conversation_id` | `TEXT` | NOT NULL | **Foreign Key** `public.conversations(id)` ON DELETE CASCADE |
| `sender` | `TEXT` | NOT NULL | Pengirim pesan: `'user'`, `'bot'`, atau `'system'` |
| `message` | `TEXT` | NOT NULL | Konten teks dialog |
| `intent` | `TEXT` | YES | Intent deteksi spesifik pesan |
| `metadata` | `JSONB` | YES | Metadata kontekstual (quick actions, sumber RAG) |
| `created_at` | `TIMESTAMPTZ`| YES | Waktu pesan dikirimkan |

### D. Tabel `public.analytics_events`
Mencatat telemetri interaksi pengguna dan conversion funnel.

| Kolom | Tipe Data | Nullable | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `TEXT` | NOT NULL | **Primary Key** (format `evt_<timestamp>_<rand>`) |
| `event_name` | `TEXT` | NOT NULL | Nama event (`chatbot_opened`, `lead_submitted`, dll.) |
| `session_id` | `TEXT` | NOT NULL | ID sesi browser |
| `conversation_id` | `TEXT` | YES | Relasi ke percakapan (jika ada) |
| `metadata` | `JSONB` | YES | Parameter tambahan pendukung analisis |
| `created_at` | `TIMESTAMPTZ`| YES | Waktu pencatatan event |

---

## ⚡ 3. Indeks Performa (Performance Indexes)

Untuk menjamin waktu respons query di bawah 50ms bahkan pada volume data besar, tabel dilengkapi indeks strategis:

```sql
-- Optimalisasi query pipeline CRM dan sorting waktu
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON public.leads(priority_tier);

-- Optimalisasi pencarian riwayat obrolan berdasarkan percakapan
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Optimalisasi agregasi metrik analytics dan conversion funnel
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
```

---

## 🔒 4. Keamanan, Row-Level Security (RLS) & Migrasi Policy Lama

Semua tabel CRM publik dilindungi dengan **Row-Level Security (RLS)** yang di-*force* di level PostgreSQL:

```sql
-- 1. Drop Kebijakan Permisif Lama (Wajib dijalankan jika pernah deploy schema awal)
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow full access for service key and anon" ON public.leads;
DROP POLICY IF EXISTS "Allow public insert on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow full access on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public insert on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow full access on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public insert on analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow full access on analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow full access for service key and anon on admin_sessions" ON public.admin_sessions;

-- 2. Force RLS pada seluruh tabel
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions FORCE ROW LEVEL SECURITY;

-- 3. Cabut seluruh hak akses langsung dari anon dan authenticated
REVOKE ALL ON TABLE public.leads FROM anon, authenticated;
REVOKE ALL ON TABLE public.conversations FROM anon, authenticated;
REVOKE ALL ON TABLE public.messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.analytics_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_sessions FROM anon, authenticated;

-- 4. Berikan izin eksklusif kepada service_role
GRANT ALL ON TABLE public.leads TO service_role;
GRANT ALL ON TABLE public.conversations TO service_role;
GRANT ALL ON TABLE public.messages TO service_role;
GRANT ALL ON TABLE public.analytics_events TO service_role;
GRANT ALL ON TABLE public.admin_sessions TO service_role;
```

### Kueri Verifikasi di Supabase SQL Editor:
Pastikan tidak ada policy yang tersisa untuk `anon`:
```sql
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('leads', 'conversations', 'messages', 'analytics_events', 'admin_sessions')
ORDER BY tablename, policyname;
```

Dan pastikan `anon` tidak memiliki grant di tabel-tabel tersebut:
```sql
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee = 'anon'
  AND table_name IN ('leads', 'conversations', 'messages', 'analytics_events', 'admin_sessions');
```

---

## ⚙️ 5. Konfigurasi Environment (`.env.local`)

Untuk menghubungkan aplikasi ke proyek Supabase Anda:

```env
# 1. Supabase Database Configuration:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key

# 2. Wajib untuk Produksi: Kunci Service Role Backend (Server-Side Persistence & CRM):
SUPABASE_SERVICE_ROLE_KEY=your_secret_service_role_key

# 3. Kredensial Keamanan Admin CRM & Session Secret:
ADMIN_PASSWORD=your_secure_admin_password
AUTH_SECRET=your_high_entropy_32_char_secret_key

# 4. Distributed Rate Limiter (Optional - Upstash Redis REST):
UPSTASH_REDIS_REST_URL=https://your-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```

---

## 🛠️ 6. Tooling & Skrip Perawatan Database

### 1. Pengecekan Konektivitas Database (`npm run db:check`)
Memeriksa status keterhubungan ke tabel secara otomatis:
```bash
npm run db:check
```

### 2. Migrasi Data Lokal ke Supabase (`npm run db:migrate`)
Jika Anda memiliki data cadangan lokal pada `data/db.json` dan ingin memindahkannya ke Supabase Cloud:
```bash
npm run db:migrate
```

### 3. Pemantauan via Health API
- **Public Health Check (`/api/health`):**
  Mengembalikan status minimal yang aman untuk public uptime monitoring (UptimeRobot, status page) tanpa membocorkan infrastruktur internal:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-05T16:30:00.000Z"
  }
  ```
- **Authenticated Diagnostic Telemetry (`/api/admin/health`):**
  Memerlukan autentikasi admin. Mengembalikan metrik latensi database Supabase, penggunaan memori (RSS), status model AI, dan uptime sistem.


---

## 📋 7. Panduan Pemecahan Masalah (Troubleshooting)

| Gejala Masalah | Penyebab Umum | Solusi Perbaikan |
| :--- | :--- | :--- |
| `error.code === '42P01'` | Tabel belum dibuat di database Postgres Supabase | Buka **Supabase Dashboard > SQL Editor**, salin seluruh isi [supabase/schema.sql](./supabase/schema.sql) dan klik **Run**. |
| `latencyMs` tinggi (> 3000ms) | Wilayah (*Region*) Supabase jauh dari server Next.js | Pilih region terdekat saat membuat proyek Supabase (disarankan: **Singapore / ap-southeast-1** untuk target pengguna Indonesia). |
| `401 Unauthorized` pada API REST | API Key salah, kedaluwarsa, atau format URL tidak lengkap | Periksa nilai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada file `.env.local`. |
| Data baru tidak muncul di dashboard | RLS memblokir query SELECT anonim | Gunakan fungsi query asinkron di backend (`getAllLeadsAsync()`) yang mengakses data melalui API resmi server. |
