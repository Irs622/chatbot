/**
 * Language detection utility for Bahasa Indonesia, English, and Korean.
 */
export function detectLanguage(text: string): 'id' | 'en' | 'ko' {
  if (!text) return 'id';

  // Check for Korean Hangul first
  if (/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(text)) {
    return 'ko';
  }

  const lower = text.toLowerCase();
  const idMarkers = [
    'yang', 'untuk', 'dengan', 'saya', 'kami', 'bisa', 'bagaimana', 'apakah', 'apa',
    'halo', 'hai', 'hei', 'hi', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'terima', 'kasih',
    'butuh', 'ingin', 'mau', 'tanya', 'konsultasi', 'laba', 'modal', 'dana',
    'pendanaan', 'biaya', 'operasional', 'perusahaan', 'bisnis', 'ekspansi',
    'cabang', 'omset', 'omzet', 'pelatihan', 'karyawan', 'kantor', 'alamat',
    'hubungi', 'solusi', 'masalah', 'turun', 'naik', 'rugi', 'keuntungan', 'pt',
    'kamu', 'anda', 'siapa', 'bantu', 'ngapain', 'gimana', 'kok', 'dong', 'nih', 'ya', 'yah', 'dong'
  ];

  const enMarkers = [
    'the', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 'where', 'who',
    'can', 'could', 'would', 'should', 'you', 'your', 'we', 'our', 'my', 'about',
    'which', 'services', 'please', 'help', 'looking', 'corporate', 'need'
  ];

  let idMatches = 0;
  for (const marker of idMarkers) {
    if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) {
      idMatches++;
    }
  }

  let enMatches = 0;
  for (const marker of enMarkers) {
    if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) {
      enMatches++;
    }
  }

  if (enMatches > idMatches) {
    return 'en';
  }
  return 'id';
}
