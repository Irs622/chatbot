# Panduan Integrasi Inpartner Agent ke Website Utama (inpartner.id)

Panduan teknis ini ditujukan untuk **Web Developer, Webmaster, atau Tim IT** yang mengelola website utama [inpartner.id](https://inpartner.id/).

---

## 🎯 Pilihan Cara Pemasangan

Terdapat dua metode integrasi yang didukung secara resmi:

| Metode | Tingkat Kemudahan | Rekomendasi Penggunaan |
| :--- | :---: | :--- |
| **Metode 1: Widget Script (`widget.js`)** | ⭐ Sangat Mudah (1 Baris) | Untuk menampilkan floating chat button di pojok kanan bawah di seluruh halaman website. |
| **Metode 2: Embedded iFrame** | ⭐ Mudah (HTML Tag) | Untuk menampilkan chatbot langsung di dalam body halaman tertentu (misal: `inpartner.id/konsultasi-ai`). |
| **Metode 3: Komponen React / Next.js** | ⭐⭐ Menengah | Jika website utama inpartner.id dibangun dengan Next.js / React. |

---

## 🚀 Metode 1: Menggunakan Script Widget (Sangat Direkomendasikan)

Script ini bekerja layaknya widget chat modern (Intercom, Zendesk, Tawk.to). Cukup sisipkan script ini sebelum tag penutup `</body>`:

```html
<!-- Inpartner AI Business Consultation Assistant Widget -->
<script src="https://chat.inpartner.id/widget.js" defer></script>
```
*(Ganti `https://chat.inpartner.id` dengan URL production tempat chatbot ini di-deploy).*

### 🛠️ Panduan Pasang Berdasarkan Platform Website:

#### 1. WordPress
- **Opsi A (Via Plugin - Paling Aman):**
  1. Pasang plugin seperti **WPCode** atau **Insert Headers and Footers**.
  2. Tambahkan snippet baru di bagian **Footer**.
  3. Masukkan script di atas, lalu klik **Save & Activate**.
- **Opsi B (Via Tema):**
  Buka file `footer.php` tema aktif Anda, tempelkan kode script tepat di atas `</body>`.
- **Opsi C (Via Elementor):**
  Buka **Elementor > Custom Code > Add New**, pilih lokasi **End of <body>**, masukkan script dan Publish ke Entire Site.

#### 2. Webflow
1. Buka **Project Settings** di Webflow.
2. Masuk ke tab **Custom Code**.
3. Di bagian **Footer Code**, tempelkan kode `<script ...></script>` di atas.
4. Klik **Save Changes** dan **Publish**.

#### 3. Website HTML / PHP / Laravel
- Buka file layout utama (misal: `index.html`, `footer.php`, atau `resources/views/layouts/app.blade.php`).
- Tempelkan kode script tepat sebelum tag `</body>`.

---

## 🖼️ Metode 2: Menggunakan iFrame Langsung

Jika Anda ingin chatbot tampil tersemat di tengah halaman tertentu (misalnya halaman dedicated *"Konsultasi Bisnis"*):

```html
<div style="width: 100%; max-width: 440px; height: 750px; margin: 0 auto; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.12);">
  <iframe
    src="https://chat.inpartner.id/embed-view"
    width="100%"
    height="100%"
    frameborder="0"
    allow="clipboard-write"
    title="Inpartner Agent"
  ></iframe>
</div>
```

---

## ⚛️ Metode 3: Integrasi Direct Komponen (Jika Website Utama Menggunakan Next.js / React)

Jika website utama Anda juga menggunakan Next.js App Router:
1. Salin folder komponen [`components/ChatWidget.tsx`](./components/ChatWidget.tsx) ke dalam projek website utama.
2. Salin folder [`lib/`](./lib/) dan [`knowledge/`](./knowledge/).
3. Salin route backend API ke dalam folder `app/api/`:
   - `app/api/chat/route.ts`
   - `app/api/leads/route.ts`
   - `app/api/analytics/route.ts`
4. Panggil komponen di halaman yang diinginkan:
   ```tsx
   import ChatWidget from '@/components/ChatWidget';

   export default function Page() {
     return (
       <main>
         {/* Halaman Anda */}
         <ChatWidget initialOpen={false} embeddedMode={false} />
       </main>
     );
   }
   ```

---

## 🌐 Konfigurasi Subdomain & Keamanan (Domain Setup)

1. **Rekomendasi Penamaan Subdomain:**
   - Gunakan subdomain `chat.inpartner.id` atau `bot.inpartner.id`.
2. **Pengaturan DNS:**
   - Buat record **CNAME**:
     - *Name:* `chat`
     - *Target:* `cname.vercel-dns.com` (jika menggunakan Vercel) atau IP server Anda.
3. **CORS & Iframe Header (Security):**
   - Halaman `/embed-view` sudah diatur agar mengizinkan penyematan iframe dari domain utama `inpartner.id`.
   - Tidak diperlukan konfigurasi CORS rumit karena pemanggilan API dilakukan secara internal oleh iframe `/embed-view`.

---

## 🧪 Pengujian Setelah Integrasi

Setelah kode dipasang di website:
1. Buka website utama `inpartner.id` di peramban (gunakan *Incognito* / *Private Window*).
2. Periksa apakah tombol lingkaran biru `#0d5f8a` muncul di pojok kanan bawah.
3. Klik tombol tersebut dan pastikan:
   - Jendela sambutan terbuka mulus.
   - Opsi *"Business Growth"*, *"Funding & Profitability"*, dan *"Not sure what I need"* dapat diklik.
   - Pesan balasan AI keluar secara solutif dan terarah.
   - Coba buka dari layar smartphone untuk memverifikasi responsivitas mobile (tampilan akan menyesuaikan layar penuh secara nyaman).

Jika ada kendala teknis atau pertanyaan integrasi, silakan hubungi tim pengembang AI Inpartner.
