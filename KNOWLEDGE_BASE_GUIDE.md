# Panduan Pengelolaan Knowledge Base Inpartner Agent

Panduan ini ditujukan bagi **Tim Internal Inpartner (Business Development, Konsultan, Marketing, & Admin)** untuk mengupdate data, layanan, kontak, dan studi kasus agar AI Chatbot selalu akurat, terkini, dan tidak memberikan informasi yang salah (*hallucination*).

---

## 📂 Di Mana Data Disimpan?

Seluruh pengetahuan chatbot disimpan dalam folder [`knowledge/`](./knowledge/) dalam bentuk file teks sederhana berformat **Markdown (`.md`)**.

```text
knowledge/
├── company/
│   └── company-profile.md       # Profil resmi, visi, misi, nilai, komitmen ESG
├── services/
│   ├── growth.md                # Detail layanan Business Growth & Ekspansi Pasar
│   ├── funding.md               # Detail layanan Funding & Kesiapan Investasi
│   ├── profitability.md         # Detail layanan Profitability & Audit Biaya
│   └── capacity-building.md     # Detail The Executive Business Program
├── sectors/
│   └── sectors.md               # 13 sektor industri fokus pendampingan
├── projects/
│   └── projects.md              # Rekam jejak, portofolio, dan studi kasus
├── faq/
│   └── faq.md                   # Tanya jawab umum seputar cara kerja sama
└── contact/
    └── contact.md               # Alamat kantor, nomor WhatsApp, email, jam kerja
```

---

## ✍️ Cara Menambah atau Mengubah Data

### 1. Mengubah Kontak / Alamat Kantor
Buka file [`knowledge/contact/contact.md`](./knowledge/contact/contact.md).
- Jika ada nomor WhatsApp PIC baru atau alamat kantor baru, cukup perbarui nomor di berkas ini.
- AI akan langsung merujuk pada nomor baru tersebut saat pengunjung menanyakan kontak atau tombol WhatsApp.

### 2. Menambah Studi Kasus / Portofolio Baru
Buka file [`knowledge/projects/projects.md`](./projects/projects.md).
Tambahkan poin baru dengan struktur:
```markdown
### 5. [Judul Studi Kasus / Sektor Klien]
- **Konteks:** [Masalah yang dihadapi klien, misal: biaya operasional membengkak 30%]
- **Peran Inpartner:** [Langkah pendampingan yang dilakukan tim konsultan]
- **Hasil:** [Hasil konkret yang tercapai, misal: efisiensi biaya tercapai 18% dalam 6 bulan]
```

### 3. Menambah Pertanyaan Baru yang Sering Muncul (FAQ)
Buka file [`knowledge/faq/faq.md`](./knowledge/faq/faq.md).
Tambahkan di bagian paling bawah:
```markdown
## Pertanyaan: [Tulis pertanyaan di sini]
**Jawaban:** [Tulis jawaban resmi yang disetujui manajemen di sini]
```

---

## 💡 Prinsip Menulis Materi untuk AI (Agar Tidak "Ngawur")

1. **Gunakan Judul Sub-bab yang Jelas (`##` atau `###`):**
   Sistem RAG memecah dokumen berdasarkan heading (`##`). Semakin jelas judulnya (misal: `## Skema Biaya Konsultasi`), semakin mudah AI menemukan jawaban yang tepat.
2. **Tuliskan Batasan Tegas (*What We Don't Do*):**
   Jika Inpartner tidak menyediakan layanan tertentu (contoh: *Inpartner bukan bank dan tidak memberikan pinjaman langsung*), tuliskan secara gamblang di dokumen agar AI tegas menolaknya.
3. **Hindari Menuliskan Angka Harga Pasti Jika Bersifat Kustom:**
   Jika biaya konsultasi bergantung pada skala problem klien, tuliskan:
   *"Biaya investasi ditentukan setelah sesi diagnostik awal dan disesuaikan dengan ruang lingkup pendampingan."*
4. **Gunakan Bahasa Indonesia Baku & Profesional:**
   AI akan meniru nada dan gaya bahasa dari dokumen sumber.

---

## 🔄 Kapan Perubahan Mulai Berlaku?

- Di lingkungan **Local Development**: Perubahan pada file markdown langsung aktif pada percakapan berikutnya (tanpa perlu restart server).
- Di lingkungan **Production**: Cukup lakukan `git commit` dan `push` file markdown yang diubah, sistem hosting (seperti Vercel) akan otomatis memperbarui versi online dalam 1–2 menit.
