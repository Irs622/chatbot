/**
 * ============================================================================
 * INPARTNER AGENT — GOOGLE SHEETS & EMAIL NOTIFICATION SYNC SCRIPT
 * ============================================================================
 * 
 * Script Google Apps Script ini bertugas untuk:
 * 1. Menerima data prospek (Lead) baru yang masuk dari chatbot website inpartner.id.
 * 2. Mencatat otomatis sebagai baris baru di Google Spreadsheet tim Business Development.
 * 3. Mengirimkan notifikasi seketika ke Email resmi Inpartner (corporatesecretary@inpartner.id).
 * 
 * CARA PEMASANGAN (Hanya butuh 2 menit, 100% Gratis):
 * 1. Buka Google Drive (https://drive.google.com), buat Google Spreadsheet baru.
 * 2. Beri nama spreadsheet, misal: "Inpartner - Database Leads Chatbot".
 * 3. Pada Baris 1 (Header), buat kolom:
 *    A1: Waktu Masuk
 *    B1: Nama Lengkap
 *    C1: Perusahaan
 *    D1: Nomor WhatsApp
 *    E1: Alamat Email
 *    F1: Kebutuhan Layanan
 *    G1: Catatan Kebutuhan
 * 4. Klik menu: Extensions > Apps Script (Ekstensi > Apps Script).
 * 5. Hapus kode default, lalu tempelkan SELURUH isi script ini.
 * 6. Klik tombol "Deploy" (Terapkan) di pojok kanan atas > "New deployment" (Penerapan baru).
 * 7. Pilih type: "Web app" (Aplikasi web).
 *    - Description: "Inpartner Lead Webhook"
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING!
 * 8. Klik "Deploy", izinkan akses Google saat diminta, lalu salin "Web App URL".
 * 9. Tempelkan URL tersebut ke file .env.local atau Vercel Environment Variables:
 *    LEAD_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 * 
 * Selesai! Setiap prospek baru otomatis tercatat & email notifikasi langsung masuk.
 */

// Konfigurasi Email Penerima Notifikasi
var TARGET_NOTIFICATION_EMAIL = "corporatesecretary@inpartner.id";

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var lead = data.lead || {};
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var timestamp = new Date();
    var name = lead.name || "-";
    var company = lead.company || "-";
    var phone = lead.phone || "-";
    var email = lead.email || "-";
    var businessNeed = lead.business_need || "-";
    var notes = lead.notes || "-";
    
    // 1. Simpan Baris Baru ke Google Sheets
    sheet.appendRow([
      timestamp,
      name,
      company,
      phone,
      email,
      businessNeed,
      notes
    ]);

    // Format nomor WhatsApp untuk link langsung
    var cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.indexOf("0") === 0) {
      cleanPhone = "62" + cleanPhone.substring(1);
    }
    var waUrl = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent("Halo " + name + ", terima kasih telah menghubungi Inpartner. Kami siap mendampingi kebutuhan bisnis Anda.");

    var formattedDate = Utilities.formatDate(timestamp, "Asia/Jakarta", "dd MMMM yyyy, HH:mm 'WIB'");

    // 2. Kirim Notifikasi Email Otomatis ke Tim Inpartner
    var emailSubject = "🚨 Prospek Baru (Inpartner Agent): " + name + " (" + company + ") - " + businessNeed;
    
    var emailBody = 
      "<div style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>" +
        "<div style='display: flex; align-items: center; margin-bottom: 20px;'>" +
          "<div style='background: #005DAD; color: #ffffff; font-weight: bold; padding: 8px 12px; border-radius: 8px; font-size: 14px;'>INPARTNER</div>" +
          "<span style='margin-left: 12px; color: #64748b; font-size: 13px; font-weight: 500;'>Website Lead Alert</span>" +
        "</div>" +
        
        "<h2 style='color: #0f172a; margin: 0 0 8px 0; font-size: 18px;'>Prospek Klien Baru Masuk dari Website</h2>" +
        "<p style='color: #64748b; font-size: 13px; margin: 0 0 20px 0;'>Calon klien baru saja mengisi formulir konsultasi melalui Inpartner Agent:</p>" +
        
        "<table style='width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6; margin-bottom: 24px;'>" +
          "<tr style='border-bottom: 1px solid #f1f5f9;'>" +
            "<td style='padding: 10px 0; color: #64748b; width: 140px;'>Nama Lengkap:</td>" +
            "<td style='padding: 10px 0; font-weight: bold; color: #0f172a;'>" + name + "</td>" +
          "</tr>" +
          "<tr style='border-bottom: 1px solid #f1f5f9;'>" +
            "<td style='padding: 10px 0; color: #64748b;'>Perusahaan:</td>" +
            "<td style='padding: 10px 0; font-weight: bold; color: #0f172a;'>" + company + "</td>" +
          "</tr>" +
          "<tr style='border-bottom: 1px solid #f1f5f9;'>" +
            "<td style='padding: 10px 0; color: #64748b;'>Nomor WhatsApp:</td>" +
            "<td style='padding: 10px 0; font-weight: bold; color: #005DAD;'><a href='" + waUrl + "' style='color: #005DAD; text-decoration: underline;'>" + phone + " (Chat WA Langsung)</a></td>" +
          "</tr>" +
          "<tr style='border-bottom: 1px solid #f1f5f9;'>" +
            "<td style='padding: 10px 0; color: #64748b;'>Alamat Email:</td>" +
            "<td style='padding: 10px 0; color: #0f172a;'>" + email + "</td>" +
          "</tr>" +
          "<tr style='border-bottom: 1px solid #f1f5f9;'>" +
            "<td style='padding: 10px 0; color: #64748b;'>Kebutuhan Layanan:</td>" +
            "<td style='padding: 10px 0; font-weight: bold; color: #005DAD;'>" + businessNeed + "</td>" +
          "</tr>" +
          "<tr>" +
            "<td style='padding: 10px 0; color: #64748b;'>Catatan / Tantangan:</td>" +
            "<td style='padding: 10px 0; color: #334155;'>" + notes + "</td>" +
          "</tr>" +
        "</table>" +
        
        "<div style='margin-bottom: 24px; text-align: center;'>" +
          "<a href='" + waUrl + "' style='display: inline-block; background-color: #005DAD; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0, 93, 173, 0.3);'>" +
            "Hubungi Klien via WhatsApp" +
          "</a>" +
        "</div>" +
        
        "<div style='border-top: 1px solid #f1f5f9; padding-top: 14px; font-size: 11px; color: #94a3b8; text-align: center;'>" +
          "Waktu Masuk: " + formattedDate + " • Inpartner AI Business Consultation Assistant" +
        "</div>" +
      "</div>";

    MailApp.sendEmail({
      to: TARGET_NOTIFICATION_EMAIL,
      subject: emailSubject,
      htmlBody: emailBody
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Lead recorded to Google Sheets and notification email dispatched."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
