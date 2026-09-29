# 🧪 Panduan Mekanisme Pengujian (Testing Guide) — Inpartner AI

Dokumen ini menjelaskan arsitektur dan mekanisme pengujian otomatis (*Quality Assurance Suite*) untuk produk **Inpartner AI Business Consultation Assistant**.

---

## 🚀 Cara Menjalankan Pengujian

Tersedia dua opsi perintah pengujian yang sangat cepat dan ringan (menggunakan native test runner Node.js v20+ tanpa dependensi berat):

### 1. Dashboard Eksekutif Berwarna (Rekomendasi)
```bash
npm run test:report
```
*Menampilkan visual progress bar, metrik keberhasilan (Pass/Fail), timing latensi, dan ringkasan eksekutif secara rapi di terminal.*

### 2. Standard Test Runner (CI/CD)
```bash
npm test
```
*Menjalankan semua test suite dengan native reporter Node.js (ideal untuk GitHub Actions atau automated pipelines).*

---

## 📂 Struktur Test Suite

Semua file pengujian berada di folder `tests/` dan dibagi secara modular berdasarkan arsitektur aplikasi:

```text
tests/
├── config-knowledge.test.ts   # Layer 1: Integritas Konfigurasi & Knowledge Base
├── intent.test.ts             # Layer 2: NLP Intent Recognition (ID / EN / KO)
├── rag.test.ts                # Layer 3: RAG Retrieval, Scoring & Keyword Expansion
├── validation-auth.test.ts    # Layer 4: Validasi Telepon (+62), Email & Keamanan Admin
├── db.test.ts                 # Layer 5: Operasi Database Flat-File, CRM & Analytics
└── e2e-simulation.test.ts     # Layer 6: Simulasi Alur End-to-End Siklus Konsultasi
```

---

## 🔍 Penjelasan Layer Pengujian

### 1. `config-knowledge.test.ts` (Configuration & Knowledge Integrity)
- **WhatsApp & Kontak:** Memastikan nomor WhatsApp menggunakan format resmi `+62 859 3454 8202` (kode negara `6285934548202`), bukan nomor dummy lama.
- **Alamat Kantor:** Memastikan kantor pusat terdaftar di Pakuwon Tower Unit J Lantai 10 Casablanca, Jakarta Selatan (kantor lama di Surabaya sudah tidak ada).
- **Integritas 5 Layanan Resmi:**
  1. `strategy-corporate-advisory.md`
  2. `investment-project-advisory.md`
  3. `market-access-expansion.md`
  4. `cross-border-technology.md`
  5. `human-capital-organization.md`
- **Pembersihan Data Lama:** Memvalidasi bahwa 4 file pilar lama (*funding, growth, profitability, capacity-building*) sudah tidak ada di sistem.

### 2. `intent.test.ts` (AI Intent Classification & Multilingual Support)
- Menguji pengenalan niat konsultasi pengguna dalam **3 Bahasa**:
  - **Bahasa Indonesia (ID)**: M&A, restrukturisasi, feasibility study, ekspansi pasar, alih teknologi, executive search.
  - **Bahasa Inggris (EN)**: Corporate strategy, commercial valuation, market entry, cross-border JV, leadership coaching.
  - **Bahasa Korea (KO)**: 기업전략, M&A 인수합병, 사업타당성 연구, 비즈니스 매칭, 크로스보더 합작투자.
- **Handling Query Ambigu:** Memastikan teks acak/gibberish menghasilkan intent `unknown` dengan nilai *confidence* rendah agar memicu bantuan konsultan.

### 3. `rag.test.ts` (RAG Knowledge Engine & Vector/Keyword Scoring)
- Memastikan pemecahan chunk markdown berjalan sempurna di 6 kategori (*services, company, sectors, projects, faq, contact*).
- Menguji akurasi pemeringkatan Top-K dokumen berdasarkan relevansi konteks pertanyaan klien.
- Menguji perluasan sinonim domain bisnis (*synonym expansion map*).

### 4. `validation-auth.test.ts` (Data Integrity & CRM Security)
- **Validasi Nomor WhatsApp (+62):**
  - Menerima format standar Indonesia: `08xx`, `+628xx`, `628xx`, spasi, atau tanda strip.
  - Menerima format nomor internasional valid (+1..., +82..., +65...).
  - Menolak input palsu: angka berulang (`081111111111`), angka berurutan (`081234567890`), huruf/simbol, atau nomor terlalu pendek/panjang.
- **Validasi Email:** Format standar korporat (RFC).
- **Keamanan Admin:**
  - Enkripsi HMAC SHA-256 pada token sesi admin.
  - Constant-time comparison untuk pencegahan *timing attack*.
  - Deteksi pemalsuan token (*tampered token rejection*).

### 5. `db.test.ts` (Database & Analytics Pipeline)
- Verifikasi pencatatan prospek (*Leads*) dengan status: `new`, `contacted`, `in_progress`, `converted`.
- Verifikasi sesi percakapan (*Conversations*) dan riwayat pesan (*Messages*).
- Menjamin database baru selalu bersih (0 prospek dummy).
- Verifikasi agregasi metrik analytics (tingkat konversi, distribusi waktu WIB).

### 6. `e2e-simulation.test.ts` (End-to-End Client Lifecycle)
Simulasi penuh perjalanan calon klien korporat:
1. Klien mengirim pertanyaan konsultasi bisnis.
2. AI mendeteksi niat konsultasi (*Market Access*).
3. RAG mengambil rujukan pengetahuan resmi.
4. Sesi obrolan dicatat di database CRM.
5. Klien mengisi formulir kontak eksekutif.
6. Prospek tersimpan rapi dan tim konsultan menandai status kontak.

---

## 🛠️ Menambahkan Kasus Uji Baru

Jika Anda menambahkan materi pengetahuan atau layanan baru di masa mendatang, cukup tambahkan kasus uji di file yang relevan:

```typescript
// Contoh menambahkan uji intent di tests/intent.test.ts:
await t.test('Mengenali layanan baru X', () => {
  const result = detectIntent('Pertanyaan spesifik mengenai layanan baru...');
  assert.equal(result.intent, 'intent_baru');
  assert.ok(result.confidence >= 0.5);
});
```

---

## 🔄 Integrasi GitHub Actions (Opsional)

Untuk menjalankan pengujian otomatis setiap kali ada `git push`, buat file `.github/workflows/test.yml`:

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```
