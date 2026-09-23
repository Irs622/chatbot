# Dokumen Persyaratan Produk (PRD)
## Inpartner Agent — Asisten Konsultasi Bisnis AI

> **Versi Dokumen:** 1.0 (Final)  
> **Target Pembaca:** Manajemen, Direksi, Tim Business Development (BD), Marketing, dan Tim IT  
> **Bahasa:** Bahasa Indonesia Sederhana (Non-Teknis)  
> **Status:** Siap Rilis (*Production Ready*)

---

## 1. Ringkasan Eksekutif (Executive Summary)

**Inpartner Agent** adalah asisten percakapan cerdas (AI Chatbot) yang dipasang pada website resmi **[inpartner.id](https://inpartner.id/)**. 

Fungsinya mirip seperti **"Resepsionis & Konsultan Bisnis Digital 24 Jam"**. Asisten ini bertugas menyapa setiap pengunjung website, mendengarkan tantangan bisnis mereka, merekomendasikan solusi yang tepat dari Inpartner dalam waktu kurang dari 2 menit, dan mengajak mereka untuk menjadwalkan sesi konsultasi resmi atau terhubung langsung via WhatsApp.

---

## 2. Masalah yang Ingin Diselesaikan (The Problem)

Saat ini, pengunjung website perusahaan konsultan umumnya menghadapi kendala:
1. **Website Statis & Membingungkan:** Calon klien sering bingung harus membaca halaman mana yang sesuai dengan permasalahan perusahaannya.
2. **Pengunjung Datang Lalu Pergi:** Banyak calon klien yang mengunjungi website, tetapi pergi begitu saja tanpa meninggalkan nama atau nomor kontak (*leads hilang*).
3. **Keterbatasan Jam Kerja:** Pengunjung yang membuka website di luar jam kerja (malam hari atau akhir pekan) tidak mendapatkan respon langsung.
4. **Kekhawatiran Salah Layanan:** Pemilik bisnis sering ragu apakah masalahnya (misal: laba menurun atau butuh modal) bisa ditangani oleh Inpartner atau tidak.

---

## 3. Tujuan Produk & Dampak Bisnis (Business Goals)

Dengan adanya Inpartner Agent, perusahaan menargetkan:
- **Meningkatkan Konversi Prospek (*Leads*):** Mengubah pengunjung biasa menjadi calon klien nyata yang meninggalkan nama, perusahaan, dan nomor WhatsApp.
- **Kualifikasi Cepat (< 2 Menit):** Membantu calon klien menemukan 1 dari 4 pilar layanan Inpartner yang paling cocok dengan tantangannya.
- **Respon Instan 24/7:** Memberikan respon ramah, profesional, dan solutif kapan pun pengunjung mengakses website.
- **Memperkuat Citra Profesional:** Menampilkan Inpartner sebagai perusahaan konsultan modern yang adaptif terhadap teknologi terkini.

---

## 4. Siapa Pengguna Chatbot Ini? (User Persona)

Chatbot ini dirancang untuk melayani 3 profil utama calon klien:

1. **Pemilik Bisnis / Pengusaha (*Business Owner*):**
   - *Tantangan:* Omzet bisnis naik tapi keuntungan bersih tidak terasa, atau ingin ekspansi ke kota baru namun butuh modal dan strategi.
   - *Kebutuhan:* Solusi praktis, terpercaya, dan arahan langkah konkret tanpa bahasa teori rumit.

2. **Direktur & Pimpinan Eksekutif Korporasi (*C-Level / Management*):**
   - *Tantangan:* Membutuhkan restrukturisasi biaya, kesiapan investasi institusional, atau tata kelola ESG berstandar global.
   - *Kebutuhan:* Kredibilitas konsultan, rekam jejak industri, dan kerahasiaan data terjamin.

3. **Manajer HR / Operasional Perusahaan:**
   - *Tantangan:* Kapasitas tim manajemen belum sejalan dengan target agresif pemilik perusahaan.
   - *Kebutuhan:* Program pelatihan kepemimpinan eksekutif (*The Executive Business Program*).

---

## 5. Cakupan Layanan yang Dikuasai Chatbot

Chatbot dibekali pengetahuan resmi seputar **4 Pilar Utama Inpartner**:

```text
                                INPARTNER AGENT
                                       │
        ┌──────────────┬───────────────┴───────────────┬──────────────┐
        ▼              ▼                               ▼              ▼
   [ GROWTH ]     [ FUNDING ]                   [ PROFITABILITY ] [ CAPACITY ]
Ekspansi Pasar,   Kesiapan Investasi,           Bedah Struktur    Program Pelatihan
Riset Segmen,     Valuasi Wajar, &              Biaya, Pemotongan Eksekutif & Coaching
Roadmap Sales.    Akses Jejaring Investor.      Pemborosan Laba.  Manajerial Tim.
                  (Bukan Pinjol / Bank)
```

---

## 6. Fitur-Fitur Utama (Dijelaskan Secara Sederhana)

### A. Tampilan Bersih & Elegan (*Clean Minimalist Design*)
- Memakai warna resmi **Biru Khas Inpartner** (`#0d5f8a`) yang terkesan profesional, tenang, dan terpercaya.
- Tombol mengapung (*floating button*) di pojok kanan bawah yang ramah digunakan di layar handphone maupun laptop.

### B. Layar Sambutan Cepat (*Welcome Screen*)
- Begitu dibuka, pengunjung langsung disajikan pilihan masalah bisnis umum:
  - **Pilihan Utama:** *"Business Growth — I'll scale my business"* (untuk yang ingin ekspansi pasar).
  - **Pilihan Sekunder 1:** *"Funding & Profitability"* (untuk yang butuh modal atau ingin perbaiki laba).
  - **Pilihan Sekunder 2:** *"Not sure what I need"* (untuk yang bingung harus mulai dari mana).

### C. Teknologi "Anti-Ngawur" (*Strict Knowledge-Based RAG*)
- Chatbot **TIDAK AKAN MENGARANG JAWABAN**.
- Chatbot hanya membaca dokumen resmi perusahaan (Company Profile, data layanan, FAQ resmi).
- Jika ada hal yang tidak tercatat di buku panduan (misal: pengunjung bertanya hal di luar bisnis), chatbot akan jujur berkata belum memiliki info resmi dan mengarahkan untuk berdiskusi langsung dengan konsultan manusia.

### D. Penegasan Batasan Tegas (*Scope Guardrails*)
- Bot otomatis menegaskan bahwa Inpartner **bukan lembaga pinjaman online/bank**, melainkan konsultan yang membantu membenahi pembukuan dan menghubungkan ke investor resmi.
- Bot tidak menjanjikan angka return investasi pasti untuk menjaga reputasi dan kepatuhan hukum perusahaan.

### E. Formulir Jadwal Konsultasi (*Lead Capture Form*)
- Saat pengunjung tertarik, bot memunculkan formulir ringkas:
  - Nama Lengkap
  - Nama Perusahaan
  - Nomor WhatsApp / Telepon
  - Alamat Email
  - Kebutuhan Bisnis Utama & Catatan Singkat
- Data ini langsung tersimpan rapi untuk ditindaklanjuti oleh tim Business Development.

### F. Tombol Cepat ke WhatsApp Resmi
- Di setiap akhir percakapan, tersedia tombol 1-klik menuju **WhatsApp Resmi Inpartner** (`0896 2831 0192`) bagi calon klien yang ingin obrolan langsung manusia.

### G. Penyimpanan Otomatis ke Google Sheets & Notifikasi Email — ✨ Fitur Terintegrasi
- Setiap kali calon klien menekan tombol *"Kirim Informasi"* pada formulir konsultasi, sistem langsung menjalankan 2 aksi otomatis:
  1. **Tercatat Otomatis ke Google Sheets:** Seluruh data prospek (Nama, Perusahaan, WhatsApp, Email, Kebutuhan Layanan, Catatan, dan Waktu) langsung tercatat menjadi baris baru di **Google Spreadsheet** tim Business Development. Tim internal tidak perlu lagi melakukan rekap manual.
  2. **Notifikasi Instan Masuk ke Email:** Sistem otomatis mengirimkan email pemberitahuan ke email resmi Inpartner (`corporatesecretary@inpartner.id` / tim Sales), berisi profil lengkap calon klien dan tautan tombol 1-klik untuk langsung membuka chat WhatsApp dengan klien.

---

## 7. Alur Perjalanan Pengunjung (User Journey)

Berikut gambaran alur yang dialami calon klien dari awal hingga ditindaklanjuti oleh tim:

```text
[1. Pengunjung Buka inpartner.id]
               │
               ▼
[2. Klik Tombol Chatbot Biru di Pojok Kanan]
               │
               ▼
[3. Memilih Masalah / Mengetik Keluhan Bisnis]
Contoh: "Omzet kami meningkat tapi laba bersih justru turun drastis."
               │
               ▼
[4. AI Memberikan Analisis Ringkas & Solutif]
AI mendiagnosis problem inefisiensi biaya operasional dan menyarankan pilar Profitability.
               │
               ▼
[5. Penawaran Konsultasi Lebih Lanjut]
AI menawarkan: "Ingin mendiskusikan masalah ini dengan konsultan Inpartner?"
               │
        ┌──────┴──────────────────────────┐
        ▼                                 ▼
[Opsi A: Isi Form Konsultasi]    [Opsi B: Klik Chat WhatsApp]
Data nama & no WA diisi klien.    Langsung terhubung ke PIC Inpartner.
        │                                 │
        ▼                                 │
[6. Data Otomatis Tersimpan ke           │
 Google Sheets & Email Alert Terkirim]    │
        │                                 │
        └────────────────┬────────────────┘
                         ▼
        [7. Tim Sales/BD Membuka Email & Hubungi Klien]
        Klien dijadwalkan sesi meeting diagnostik awal dalam < 1x24 jam.
```

---

## 8. Ukuran Keberhasilan (Key Performance Indicators)

Bagaimana manajemen mengukur keberhasilan proyek ini?

| Indikator | Cara Mengukur | Target yang Diharapkan |
| :--- | :--- | :--- |
| **Interaksi Pengunjung (*Engagement Rate*)** | Jumlah pengunjung website yang membuka dan mencoba chat. | > 10% dari total visitor web |
| **Penangkapan Prospek (*Lead Capture Rate*)** | Jumlah orang yang mengisi formulir konsultasi setelah chat. | > 15% dari total yang chat |
| **Kesesuaian Jawaban (*Accuracy Rate*)** | Bot tidak salah informasi mengenai layanan dan alamat kantor. | 100% Sesuai Data Resmi |
| **Kecepatan Tindak Lanjut (*Response SLA*)** | Waktu yang dibutuhkan tim BD internal untuk menghubungi leads baru. | Maksimal 1x24 jam kerja |

---

## 9. Rencana Pembagian Tugas Tim (Action Plan)

Untuk mengaktifkan chatbot ini secara resmi di website, berikut pembagian tugasnya:

1. **Manajemen / Pimpinan:**
   - Menyetujui dokumen PRD ini.
   - Mengonfirmasi nomor WhatsApp dan PIC internal yang bertugas menerima prospek.

2. **Tim Pemasaran & Business Development (Marketing/BD):**
   - Menyiapkan Company Profile atau daftar FAQ terbaru untuk dimasukkan ke data chatbot.
   - Bersiap menindaklanjuti calon klien yang mengisi formulir dari website.

3. **Tim IT / Web Developer:**
   - Menaruh chatbot ini di hosting/subdomain (misal: `chat.inpartner.id`).
   - Menyisipkan 1 baris kode script (`widget.js`) ke website utama `inpartner.id` sesuai panduan di [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md).

---

## 10. Kesimpulan

Inpartner Agent bukan sekadar pelengkap estetika website, melainkan **alat bisnis strategis** yang bekerja otomatis 24 jam untuk menjaring calon klien baru, menyaring kebutuhan mereka secara cerdas, dan mengalirkannya ke tim konsultan Inpartner demi mendorong pertumbuhan bisnis perusahaan.
