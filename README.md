# Inpartner AI Business Consultation Assistant

> Asisten Percakapan AI Resmi untuk Website [Inpartner](https://inpartner.id/) (PT Inpartner Optima Integra) — Berbasis PRD & Knowledge Retrieval-Augmented Generation (RAG).

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-sky)
![Status](https://img.shields.io/badge/PRD%20Compliance-100%25-emerald)

---

## 📌 Ringkasan Produk

Sistem **Inpartner AI Business Consultation Assistant** adalah solusi chatbot cerdas yang dirancang untuk membantu pengunjung website **https://inpartner.id/** memahami empat area layanan utama bisnis Inpartner:
1. **💰 Funding & Investment Advisory**
2. **📈 Business Growth & Market Expansion**
3. **📊 Profitability & Operational Excellence**
4. **👥 Capacity Building (The Executive Business Program)**

Asisten ini mengubah pengalaman navigasi website yang statis menjadi percakapan interaktif (*conversational layer*), menjawab pertanyaan seputar konsultasi bisnis berbasis data resmi tanpa halusinasi, melakukan kualifikasi awal kebutuhan visitor, dan mengonversinya menjadi prospek klien (*qualified leads*) untuk ditindaklanjuti oleh tim internal Inpartner.

---

## 🎯 Pemenuhan Kebutuhan PRD (Feature Checklist)

| Kode PRD | Kebutuhan Fungsional | Status | Penjelasan Implementasi |
| :--- | :--- | :---: | :--- |
| **FR-01** | **Chatbot Widget** | ✅ Selesai | Floating widget responsif di desktop & mobile, dengan launcher elegan bertema branding Inpartner. |
| **FR-02** | **Welcome Message** | ✅ Selesai | Pesan pembuka ramah otomatis dengan 4 pilihan cepat: Funding, Growth, Profitability, Capacity Building. |
| **FR-03** | **Intent Detection** | ✅ Selesai | Deteksi 9 kategori intent: funding, growth, profitability, capacity_building, company_info, service_info, contact, other, unknown. |
| **FR-04** | **Service Recommendation** | ✅ Selesai | Rekomendasi layanan terarah yang sesuai dengan problem klien (misal: laba turun dialihkan ke Profitability). |
| **FR-05** | **Knowledge-Based Answer** | ✅ Selesai | Jawaban AI murni berbasis RAG dokumen resmi Inpartner (9 modul markdown di folder `knowledge/`). |
| **FR-06** | **Follow-up Questions** | ✅ Selesai | Rekomendasi pertanyaan lanjutan 1-klik untuk memperdalam kebutuhan visitor secara minim hambatan. |
| **FR-07** | **Lead Capture** | ✅ Selesai | Form penangkapan prospek (Nama, Perusahaan, WhatsApp/Email, Kebutuhan Bisnis, Catatan) dengan persetujuan privasi eksplisit. |
| **FR-08** | **Conversation Persistence** | ✅ Selesai | Penyimpanan sesi percakapan, transkrip, dan pesan pada database lokal aman (`data/db.json`). |
| **FR-09** | **Human Handoff** | ✅ Selesai | Tombol langsung WhatsApp resmi (`0896 2831 0192`), Email (`corporatesecretary@inpartner.id`), dan alamat kantor Pakuwon Tower & Surabaya. |
| **FR-10** | **Transparent Fallback** | ✅ Selesai | Menolak berhalusinasi jika data tidak ada di knowledge base, dan langsung menawarkan bantuan tim manusia. |
| **Sec 15**| **Admin / CRM Dashboard** | ✅ Selesai | Dashboard internal untuk melihat lead baru, status follow-up (`new`, `contacted`, `converted`, dll), serta transkrip chat terkait. |
| **Sec 16**| **Analytics & KPI Tracker** | ✅ Selesai | Penghitungan otomatis Engagement Rate, Service Discovery Rate, Lead Capture Rate, dan Human Handoff Rate. |

---

## 🏛️ Arsitektur Sistem

```text
                      PENGUNJUNG WEBSITE (inpartner.id)
                                    │
                                    ▼
                         [ CHATBOT WIDGET ]
                    (Floating Drawer / Embed Script)
                                    │
                                    ▼
                        POST /api/chat (Next.js)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            [ Intent Detection ]           [ RAG Knowledge Retrieval ]
         (lib/intent.ts - 9 Intents)       (lib/rag.ts - BM25 & Semantic)
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                         [ Grounded AI Engine ]
                     (lib/ai.ts - Gemini / Offline RAG)
                                    │
                                    ▼
                      [ Conversation Manager & DB ]
                      (data/db.json: convs, leads, msgs)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         [ Jawaban Terarah & CTAs ]      [ Lead Capture Modal ]
         (Layanan, Follow-ups, WA Link)   (Nama, Perusahaan, Kontak)
                                                    │
                                                    ▼
                                       [ Tim BD Inpartner / CRM ]
                                       (Admin Dashboard & Follow-up)
```

---

## 📂 Struktur Knowledge Base (`knowledge/`)

Knowledge base disusun secara modular sesuai PRD Bagian 10 dan bersumber dari website resmi Inpartner:
- `knowledge/company/company-profile.md` — Profil PT Inpartner Optima Integra (berdiri sejak 2009), visi, misi, nilai (*Go Beyond than Just Consultancy*), dan komitmen ESG.
- `knowledge/services/funding.md` — Layanan kesiapan investasi, valuasi, pitch deck, dan penghubung investor (VC, PE, Family Offices). Penegasan bahwa Inpartner bukan *direct lender*.
- `knowledge/services/growth.md` — Strategi pertumbuhan bisnis, penetrasi pasar, studi segmen industri, ekspansi geografis, dan kemitraan.
- `knowledge/services/profitability.md` — Solusi paradoks omzet naik tapi profit turun, audit kebocoran OPEX/COGS, optimalisasi alur kerja, dan Lean operations.
- `knowledge/services/capacity-building.md` — The Executive Business Program (Inpartner Academy), pelatihan eksekutif, leadership coaching, dan mentoring.
- `knowledge/sectors/sectors.md` — 13 sektor industri: ESG, F&B, Industrial Gas, Pendidikan, Energi Terbarukan, Bioteknologi, EV, Properti, IT, dll.
- `knowledge/projects/projects.md` — Rekam jejak: Kebijakan ESG Fund Level, ICT-BTF, Capacity Building eksekutif, dll.
- `knowledge/faq/faq.md` — Tanya jawab resmi seputar skema kerja sama, kantor, dan biaya jasa.
- `knowledge/contact/contact.md` — Alamat Pakuwon Tower Lt. 10 Jakarta Selatan, Jemur Sari Surabaya, WhatsApp 0896 2831 0192, dan email.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18+ (Sudah teruji di Node v25)
- npm versi 9+

### 2. Instalasi & Menjalankan Development Server
```bash
# Clone atau buka direktori proyek
cd /Users/mac/Downloads/chatbot

# Jalankan server Next.js (port 3000)
npm run dev
```

Buka peramban di: **`http://localhost:3000`**

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🌐 Cara Memasang Widget di Website `https://inpartner.id/`

Chatbot ini menyediakan script embed mandiri. Tim pengembang website Inpartner cukup menambahkan 1 baris script sebelum tag penutup `</body>`:

```html
<!-- INPARTNER AI BUSINESS CONSULTATION ASSISTANT -->
<script 
  src="https://[DOMAIN_CHATBOT]/api/embed.js" 
  defer
></script>
```

Widget akan otomatis muncul di pojok kanan bawah website, responsif untuk mobile dan desktop, tanpa mengganggu layout dan navigasi utama inpartner.id.

---

## 📊 Tampilan Aplikasi Multi-Tab

Aplikasi ini dilengkapi 6 modul terpadu yang dapat diakses langsung dari navigasi atas:

1. **🌐 Website Simulator (`inpartner.id`):**
   Simulasi langsung tampilan homepage Inpartner dengan tombol widget asisten terapung di pojok kanan bawah.
2. **💬 Fullscreen Assistant:**
   Layar konsultasi penuh untuk pengalaman interaktif mendalam.
3. **👥 Leads CRM & Transkrip:**
   Manajemen prospek untuk tim Business Development Inpartner (filter status, catatan internal, satu-klik hubungi via WhatsApp, dan transkrip chat).
4. **📈 Analitik & KPI:**
   Monitor *Engagement Rate*, *Service Discovery Rate*, *Lead Capture Rate*, *Human Handoff Rate*, dan log aktivitas live.
5. **📚 Knowledge Base & RAG Tester:**
   Pemeriksa seluruh dokumen sumber dan pengujian live algoritma pencarian semantik RAG.
6. **🔌 Panduan Embed:**
   Instruksi integrasi teknis dan kode embed.

---

## 🔒 Keamanan & Kebijakan Privasi
- **Zero Client Credential:** Frontend tidak menyimpan API Key apa pun.
- **Persetujuan Eksplisit:** Formulir Lead Capture memiliki checkbox consent sesuai regulasi privasi data.
- **Integritas Konsultasi:** Sistem tidak memberikan janji persentase profit atau jaminan investasi, melainkan mengarahkan ke audit dan konsultasi resmi.
