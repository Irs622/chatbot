# 🧪 Panduan Mekanisme Pengujian (Testing Guide) — Inpartner AI

Dokumen ini menjelaskan arsitektur dan mekanisme pengujian otomatis (*Quality Assurance Suite*) untuk produk **Inpartner AI Business Consultation Assistant & CRM**.

---

## 🚀 Cara Menjalankan Pengujian

Tersedia tiga opsi perintah pengujian yang sangat cepat dan terstandarisasi (menggunakan native test runner Node.js v20+ tanpa dependensi berat):

### 1. Dashboard Eksekutif Berwarna (Rekomendasi Utama)
```bash
npm run test:report
```
*Menjalankan seluruh 14 test suite secara berurutan, menampilkan visual progress bar, waktu eksekusi milidetik, metrik kelulusan (Pass/Fail), dan ringkasan eksekutif secara rapi di terminal.*

### 2. Standard Test Runner (CI/CD Pipelines)
```bash
npm test
```
*Menjalankan semua test suite dengan native test reporter Node.js (ideal untuk automated pipeline di GitHub Actions atau GitLab CI).*

### 3. Pengecekan Konektivitas Database Supabase
```bash
npm run db:check
```
*Menguji langsung keterhubungan live ke ke-4 tabel Supabase Cloud (`leads`, `conversations`, `messages`, `analytics_events`), mengukur latensi jaringan, serta menghitung jumlah data aktual.*

---

## 📂 Struktur Lengkap Test Suite (14 Layer QA)

Semua file pengujian berada di folder `tests/` dan dibagi secara modular mencakup seluruh pilar aplikasi:

```text
tests/
├── config-knowledge.test.ts        # Layer 1: Integritas Konfigurasi & Knowledge Base
├── intent.test.ts                  # Layer 2: NLP Intent Recognition (ID / EN / KO)
├── rag.test.ts                     # Layer 3: RAG Semantic Retrieval & Tokenizer
├── validation-auth.test.ts         # Layer 4: Validasi Telepon (+62), Email & Keamanan Admin
├── db.test.ts                      # Layer 5: Operasi Supabase PostgreSQL, CRM & Analytics
├── lead-scoring.test.ts            # Layer 6: Mesin Penilaian Prospek & Matriks Prioritas SLA
├── analytics.test.ts               # Layer 7: Dinamika Funnel Konversi & Analisis Telemetri
├── client-confirmation.test.ts     # Layer 8: Kode Referensi Konsultasi & WhatsApp Handoff
├── enterprise-qualification.test.ts# Layer 9: Skema Kualifikasi Korporat (Skala, Sektor, Timeline)
├── consultative-diagnostic.test.ts # Layer 10: Alur Discovery & Diagnostik Strategis
├── crm-kanban-export.test.ts       # Layer 11: Pipeline CRM Kanban & Sanitasi Ekspor CSV
├── proactive-nudge.test.ts         # Layer 12: Trigger Dwell-Time & Nudge Exit-Intent
├── marketing-attribution.test.ts   # Layer 13: Pelacakan Kampanye Pemasaran (UTM Telemetry)
└── e2e-simulation.test.ts          # Layer 14: Simulasi Penuh Siklus Konsultasi Klien
```

---

## 🔍 Penjelasan Setiap Layer Pengujian

### 1. `config-knowledge.test.ts` (Configuration & Knowledge Integrity)
- **WhatsApp & Kontak:** Memastikan nomor WhatsApp menggunakan format resmi `+62 859 3454 8202` (kode negara `6285934548202`).
- **Alamat Kantor:** Memastikan kantor pusat terdaftar di Pakuwon Tower Unit J Lantai 10 Casablanca, Jakarta Selatan.
- **Integritas 5 Layanan Resmi:**
  1. `strategy-corporate-advisory.md`
  2. `investment-project-advisory.md`
  3. `market-access-expansion.md`
  4. `cross-border-technology.md`
  5. `human-capital-organization.md`
- **Pembersihan Data Usang:** Memvalidasi bahwa file layanan lama (*funding, growth, profitability, capacity-building*) telah dibersihkan.

### 2. `intent.test.ts` (AI Intent Classification & Multilingual Support)
- Menguji pengenalan niat konsultasi pengguna dalam **3 Bahasa**:
  - **Bahasa Indonesia (ID)**: M&A, restrukturisasi, feasibility study, ekspansi pasar, alih teknologi, executive search.
  - **Bahasa Inggris (EN)**: Corporate strategy, commercial valuation, market entry, cross-border JV, leadership coaching.
  - **Bahasa Korea (KO)**: 기업전략, M&A 인수합병, 사업타당성 연구, 비즈니스 매칭, 크로스보더 합작투자.
- **Handling Query Ambigu:** Memastikan teks acak/gibberish menghasilkan intent `unknown` dengan nilai *confidence* rendah agar memicu bantuan konsultan manusia.

### 3. `rag.test.ts` (RAG Knowledge Engine & Vector/Keyword Scoring)
- Memastikan pemecahan chunk markdown berjalan sempurna di 6 kategori (*services, company, sectors, projects, faq, contact*).
- Menguji akurasi pemeringkatan Top-K dokumen berdasarkan relevansi konteks pertanyaan klien.
- Menguji perluasan sinonim domain bisnis (*synonym expansion map*).

### 4. `validation-auth.test.ts` (Data Integrity & CRM Security)
- **Validasi Nomor WhatsApp (+62):**
  - Menerima format standar Indonesia: `08xx`, `+628xx`, `628xx`, spasi, atau tanda strip.
  - Menerima format nomor internasional valid (+1..., +82..., +65...).
  - Menolak input palsu: angka berulang (`081111111111`), angka berurutan (`081234567890`), huruf/simbol, atau nomor terlalu pendek/panjang.
- **Validasi Email:** Format standar RFC.
- **Keamanan Admin:** Enkripsi HMAC SHA-256 pada token sesi admin, *constant-time comparison* untuk mencegah *timing attack*, dan penolakan token yang diubah (*tampered token*).

### 5. `db.test.ts` (Database, Supabase Cloud & Analytics Pipeline)
- Verifikasi operasi sesi percakapan (`conversations`) dan penambahan pesan dialog (`messages`).
- Verifikasi pembuatan, pencarian, pembaruan status, dan penghapusan prospek (`leads`).
- Verifikasi agregasi metrik analytics (tingkat konversi, distribusi waktu interaksi 24 jam).
- **Verifikasi Supabase Health:** Menguji koneksi real-time ke Supabase Postgres via helper `checkSupabaseHealth()`.

### 6. `lead-scoring.test.ts` (Lead Scoring & Commercial Prioritization)
- Menguji algoritma kalkulasi skor prospek (0–100) berbasis 4 pilar bobot:
  1. *Company scale & structural profile*
  2. *Corporate email domain authenticity*
  3. *Advisory urgency & project timeline*
  4. *Diagnostic completion depth*
- Menguji segmentasi tingkat prioritas SLA: `Tier 1 Hot Opportunity` (< 2 jam), `Tier 2 Strategic Lead` (< 6 jam), dan `Tier 3 Standard Inquiry` (< 24 jam).

### 7. `analytics.test.ts` (Dynamic Funnel & Telemetry Analytics)
- Menguji perhitungan tingkat konversi tahapan funnel: *Opened → Engaged → Need Selected → Form Opened → Submitted*.
- Menguji distribusi interaksi per jam dalam zona waktu WIB.

### 8. `client-confirmation.test.ts` (Reference Code & WhatsApp Automation)
- Menguji pembuatan kode referensi konsultasi unik berkode awalan `INP-`.
- Menguji sintesis URL tautan WhatsApp 1-klik dengan pesan pengantar ramah sesuai bahasa yang dipilih klien (ID / EN / KO).

### 9. `enterprise-qualification.test.ts` (Enterprise Lead Qualification Schema)
- Menguji parsing dan validasi data kualifikasi tingkat korporat: ukuran modal, jumlah karyawan, sektor industri, dan rentang target waktu implementasi.

### 10. `consultative-diagnostic.test.ts` (Consultative Diagnostic Assessment)
- Menguji alur discovery assessment 2 menit bagi pengunjung yang belum yakin terhadap kebutuhannya.
- Menguji pemetaan pilar tantangan bisnis ke rekomendasi layanan Inpartner yang presisi.

### 11. `crm-kanban-export.test.ts` (Kanban Management & CSV Sanitization)
- Menguji drag-and-drop status prospek di antarmuka Kanban (`new` → `contacted` → `in_progress` → `proposal` → `converted`).
- Menguji ekspor file CSV dengan sanitasi CWE-1236 (mencegah formula injection `=,+,-,@` pada Excel / Google Sheets).

### 12. `proactive-nudge.test.ts` (Proactive Advisory Triggers & Exit-Intent)
- Menguji pemicu pesan bantuan proaktif berbasis waktu kunjung (*dwell-time*, default 25 detik).
- Menguji pemicu *exit-intent* saat kursor pengunjung bergerak ke luar layar atas browser.
- Memastikan aturan pembatasan frekuensi (*frequency capping*) maksimal 1 kali per sesi browser.

### 13. `marketing-attribution.test.ts` (Marketing Attribution & UTM Telemetry)
- Menguji ekstraksi otomatis parameter UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
- Menguji pelacakan kanal referral organik saat UTM tidak tersedia.
- Memastikan atribusi sentuhan pertama (*first-touch attribution*) tersimpan hingga form disubmit.

### 14. `e2e-simulation.test.ts` (End-to-End Client Lifecycle)
Simulasi komprehensif perjalanan klien:
1. Klien membuka sesi dan mengajukan pertanyaan strategi bisnis.
2. AI mendeteksi kebutuhan dan menyajikan rujukan resmi dari Knowledge Base.
3. Klien menyelesaikan diagnostik dan mengirimkan formulir kontak.
4. Data tersimpan di Supabase PostgreSQL, notifikasi terkirim, dan status diperbarui di dashboard CRM.

---

## 🛠️ Menambahkan Kasus Uji Baru

Jika menambahkan fitur baru, buat pengujian menggunakan modul bawaan Node.js `node:test` dan `node:assert/strict`:

```typescript
import test from 'node:test';
import assert from 'node:assert/strict';

test('Fitur Baru X', async (t) => {
  await t.test('Memverifikasi skenario sukses', () => {
    assert.equal(1 + 1, 2);
  });
});
```

Jalankan pengujian untuk memverifikasi:
```bash
npm run test:report
```
