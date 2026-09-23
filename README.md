# Inpartner AI Business Consultation Assistant (Inpartner Agent)

> Asisten Percakapan AI Resmi untuk Website [Inpartner](https://inpartner.id/) (PT Inpartner Optima Integra) — Berbasis Knowledge Retrieval-Augmented Generation (RAG) & Desain Minimalis Modern Inpartner Blue (`#0d5f8a`).

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-sky?logo=tailwindcss)
![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)

---

## 📌 Ringkasan Produk

**Inpartner Agent** adalah asisten konsultasi bisnis cerdas yang dirancang untuk mendampingi calon klien dan pengunjung website **[inpartner.id](https://inpartner.id/)**. Asisten ini mengubah navigasi website pasif menjadi dialog solutif terarah, mengidentifikasi tantangan bisnis pengunjung, merekomendasikan solusi tepat, dan memfasilitasi penjadwalan konsultasi resmi dengan tim konsultan Inpartner.

### 4 Pilar Layanan Utama Inpartner:
1. **📈 Business Growth & Market Expansion:** Strategi pertumbuhan, penetrasi pasar baru, dan roadmap penjualan.
2. **💰 Funding & Investment Advisory:** Kesiapan investasi, valuasi independen, financial model, dan penghubung jaringan investor institusional (VC, PE, Family Offices). *(Bukan direct lender/pinjol)*.
3. **📊 Profitability & Operational Excellence:** Bedah struktur biaya (COGS & OPEX), pemangkasan inefisiensi, dan pengembalian margin laba sehat.
4. **👥 Capacity Building (The Executive Business Program):** Pembinaan eksekutif, leadership coaching, dan penyelarasan KPI lintas divisi.

---

## 🎨 Tampilan & Desain
- **Skema Warna:** Inpartner Blue (`#0d5f8a` primary, `#083c5a` dark hover, soft blue tints).
- **Layout Minimalis:**
  - *Header:* Brand geometric icon Inpartner + drop-down opsi (*New conversation*, *Schedule consultation*, *Official WhatsApp*, *Visit inpartner.id*).
  - *Welcome Screen:* Headline terarah, Hero Card (`>_ Business Growth`), divider *"and more"*, serta kartu sekunder (*Funding & Profitability*, *Not sure what I need*).
  - *Active Chat Thread:* Bubble pesan biru Inpartner, badge layanan rekomendasi terverifikasi, chip pertanyaan lanjutan 1-klik, dan kartu CTA konsultasi.
  - *Input Bar:* Input melengkung dengan tombol kirim panah atas (↑) dan disclaimer kepatuhan AI.

---

## 🔌 Cara Integrasi ke Website yang Sudah Ada (`inpartner.id`)

Chatbot ini dirancang **100% plug-and-play**. Anda tidak perlu membongkar struktur website utama Inpartner yang sudah berjalan.

### Metode 1: Menggunakan Script Widget (Sangat Direkomendasikan)
Setelah projek ini di-deploy di subdomain (misal `https://chat.inpartner.id` atau Vercel), tim developer website utama cukup menambahkan 1 baris script sebelum tag penutup `</body>`:

```html
<!-- Inpartner AI Chatbot Widget -->
<script src="https://chat.inpartner.id/widget.js" defer></script>
```

> **Hasil:** Tombol bulat biru khas Inpartner otomatis melayang di pojok kanan bawah. Saat diklik, jendela konsultasi terbuka mulus, responsif untuk layar HP maupun desktop.

### Metode 2: Menggunakan iFrame Langsung
Jika ingin menyematkan chatbot di halaman tertentu (misalnya halaman `/konsultasi-ai`):

```html
<iframe 
  src="https://chat.inpartner.id/embed-view" 
  width="100%" 
  height="720" 
  frameborder="0"
  style="border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"
></iframe>
```

> 📖 **Panduan Lengkap Integrasi:** Lihat berkas [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) untuk petunjuk detail pada WordPress, Webflow, Laravel/PHP, dan React/Next.js.

---

## 🏛️ Arsitektur Sistem

```text
                     PENGUNJUNG WEBSITE (inpartner.id)
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
 [ Intent Detection ]                               [ Knowledge Retrieval (RAG) ]
(lib/intent.ts - 9 Intents)                        (lib/rag.ts - Tokenizer & Ranking)
        │                                                       │
        └───────────────────────────┬───────────────────────────┘
                                    ▼
                        [ Grounded AI Engine ]
                   (lib/ai.ts - Gemini / Offline RAG)
                                    │
                                    ▼
                      [ Local Database & Analytics ]
                     (data/db.json via lib/db.ts)
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
 [ Jawaban AI Terverifikasi ]                           [ Lead Capture CRM ]
(Layanan, Follow-ups, Link WA)                    (Nama, Perusahaan, Kontak, Kebutuhan)
```

---

## 📁 Struktur Direktori Proyek

```text
chatbot/
├── app/
│   ├── api/
│   │   ├── analytics/route.ts       # Endpoint logging KPI & metrik interaksi
│   │   ├── chat/route.ts            # Endpoint pemrosesan pesan chatbot & RAG
│   │   ├── conversations/route.ts   # Endpoint riwayat percakapan
│   │   ├── embed.js/route.ts        # Endpoint dinamis embed loader
│   │   ├── knowledge/route.ts       # Endpoint inspeksi knowledge base
│   │   └── leads/route.ts           # Endpoint penerimaan data prospek konsultasi
│   ├── embed-view/page.tsx          # Halaman iframe chatbot mandiri (zero-layout)
│   ├── favicon.ico
│   ├── globals.css                  # Style global Tailwind
│   ├── layout.tsx                   # Root HTML layout & fonts
│   └── page.tsx                     # Portal dashboard lengkap (Simulator, CRM, Analytics)
├── components/
│   └── ChatWidget.tsx               # Komponen utama chatbot (Inpartner Blue + Hostinger Layout)
├── data/
│   └── db.json                      # Penyimpanan lokal (percakapan, leads, analytics)
├── knowledge/                       # Basis data dokumen resmi untuk RAG (Format Markdown)
│   ├── company/company-profile.md   # Profil PT Inpartner Optima Integra, visi, misi, nilai
│   ├── contact/contact.md           # Alamat kantor Jakarta, Surabaya, telp, email, WA
│   ├── faq/faq.md                   # Tanya jawab umum calon klien
│   ├── projects/projects.md         # Rekam jejak & studi kasus proyek
│   ├── sectors/sectors.md           # 13 sektor industri fokus Inpartner
│   └── services/                    # Detail 4 pilar layanan
│       ├── capacity-building.md
│       ├── funding.md
│       ├── growth.md
│       └── profitability.md
├── lib/
│   ├── ai.ts                        # Orkestrasi AI (Gemini 1.5 Flash + Offline Grounded RAG)
│   ├── db.ts                        # Abstraksi database lokal (CRUD session, messages, leads)
│   ├── intent.ts                    # Algoritma klasifikasi intensi pengguna
│   └── rag.ts                       # Mesin parser markdown, chunking, & semantic scoring
├── public/
│   ├── widget.js                    # Script universal untuk embed di website mana pun
│   ├── inpartner_blue_chat.png      # Screenshot hasil verifikasi percakapan
│   └── inpartner_blue_welcome.png   # Screenshot hasil verifikasi welcome screen
├── .env.local.example               # Contoh variabel lingkungan
├── INTEGRATION_GUIDE.md             # Panduan teknis serah terima ke Web Developer
├── KNOWLEDGE_BASE_GUIDE.md          # Panduan update materi/data untuk tim internal
├── README.md                        # Dokumentasi utama proyek
└── package.json
```

---

## 🚀 Panduan Menjalankan Lokal

### 1. Prasyarat
- **Node.js**: Versi 18 ke atas (Direkomendasikan Node.js 20 LTS atau 22+)
- **npm**: Versi 9 ke atas

### 2. Instalasi & Jalankan Server
```bash
# Masuk ke folder proyek
cd chatbot

# Install dependencies (jika baru pertama kali)
npm install

# Jalankan server development
npm run dev
```

Server aktif di:
- **Landing & Simulator Portal:** [http://localhost:3000](http://localhost:3000)
- **Tampilan Embed Widget Langsung:** [http://localhost:3000/embed-view](http://localhost:3000/embed-view)

### 3. Konfigurasi Lingkungan (`.env.local`)
Secara *default*, sistem telah dilengkapi dengan **Intelligent Offline RAG Engine** yang dapat menjawab pertanyaan resmi Inpartner secara instan (< 200ms) tanpa memerlukan API key eksternal.

Jika ingin mengaktifkan model LLM cloud Google Gemini:
1. Salin `.env.local.example` menjadi `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Isi API Key Anda:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

---

## 🚢 Panduan Deployment ke Production

### Opsi A: Vercel (Paling Cepat & Gratis)
1. Push repository ini ke GitHub / GitLab.
2. Buka [vercel.com](https://vercel.com) dan impor repositori ini.
3. Klik **Deploy** (Pengaturan build Next.js otomatis terdeteksi).
4. Di menu Settings > Domains, arahkan domain/subdomain resmi perusahaan, contoh: `chat.inpartner.id`.

### Opsi B: VPS / Docker (Ubuntu / Linux)
```bash
# Build aplikasi untuk production
npm run build

# Jalankan dengan process manager (PM2)
pm2 start npm --name "inpartner-chatbot" -- start -- -p 3000
```

---

## 📚 Mengelola & Memperbarui Data (Knowledge Base)

Untuk memastikan chatbot selalu memberikan informasi terkini dan tidak berhalusinasi:
- Cukup edit berkas Markdown yang relevan di folder [`knowledge/`](./knowledge/).
- Contoh: Jika ada nomor kantor baru, ubah di [`knowledge/contact/contact.md`](./knowledge/contact/contact.md).
- Sistem RAG akan otomatis membaca pembaruan tersebut tanpa perlu kompilasi ulang kode.
- Baca panduan lengkapnya di [`KNOWLEDGE_BASE_GUIDE.md`](./KNOWLEDGE_BASE_GUIDE.md).

---

## 🔒 Privasi Data & Keamanan
- **Anti-Halusinasi:** AI dibatasi hanya menjawab dari dokumen resmi yang terdaftar di knowledge base.
- **Persetujuan Eksplisit (Consent):** Formulir kontak menyertakan klausul persetujuan privasi data sebelum disimpan.
- **Human Escalation:** Akses langsung ke WhatsApp resmi Inpartner (`0896 2831 0192`) tersedia di setiap percakapan.

---

## 📄 Lisensi
Hak Cipta © 2026 PT Inpartner Optima Integra (Inpartner). Seluruh hak cipta dilindungi undang-undang.
