export type IntentType =
  | 'funding'
  | 'growth'
  | 'profitability'
  | 'capacity_building'
  | 'company_information'
  | 'service_information'
  | 'contact'
  | 'other'
  | 'unknown';

interface IntentRule {
  intent: IntentType;
  keywords: string[];
  patterns: RegExp[];
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'funding',
    keywords: [
      // English
      'funding', 'investment', 'investor', 'capital', 'loan', 'raise capital',
      'pitch deck', 'teaser', 'financing', 'equity', 'shares',
      'venture capital', 'private equity', 'valuation', 'fundraising', 'debt',
      // Indonesian
      'pendanaan', 'modal', 'modal kerja', 'investasi', 'investor', 'saham',
      'valuasi', 'pinjaman', 'pinjam', 'dana', 'pembiayaan', 'divestasi',
      'akuisisi', 'pitch deck', 'prospektus', 'cari modal', 'butuh dana',
      'butuh investor', 'suntikan dana', 'angel investor', 'restrukturisasi hutang',
      'financial model', 'cari investor', 'penggalangan dana', 'dividen'
    ],
    patterns: [
      /(raise|find|secure|need).*(capital|funding|investment|investor)/i,
      /investment readiness/i,
      /financial.*model/i,
      /pitch.*deck/i,
      /does inpartner (provide|lend|offer) (loans|money)/i,
      // Indonesian patterns
      /(butuh|cari|ajukan|perlu|mencari|mendapatkan).*(modal|pendanaan|investasi|investor|dana)/i,
      /kesiapan.*investasi/i,
      /valuasi.*(bisnis|perusahaan)/i,
      /apakah.*inpartner.*(meminjamkan|memberi|menyediakan).*(pinjaman|uang|modal)/i,
      /bantuan.*(dana|modal|pendanaan)/i
    ]
  },
  {
    intent: 'profitability',
    keywords: [
      // English
      'profit', 'margin', 'profitability', 'loss', 'revenue', 'cogs',
      'opex', 'efficiency', 'operating cost', 'leakage', 'lean',
      'cost', 'waste', 'cash flow', 'declining', 'drop', 'margin compression',
      // Indonesian
      'laba', 'margin', 'keuntungan', 'rugi', 'rugi laba', 'rugi-laba',
      'biaya operasional', 'biaya operasi', 'hpp', 'efisiensi', 'pemborosan',
      'kebocoran', 'arus kas', 'turun', 'anjlok', 'merosot', 'margin tertekan',
      'potong biaya', 'pemangkasan biaya', 'penurunan laba', 'tekan biaya',
      'restrukturisasi biaya', 'inefisiensi', 'biaya membengkak'
    ],
    patterns: [
      /profit.*(margin|dropping|declining|falling|down)/i,
      /revenue.*up.*profit.*down/i,
      /operational.*(cost|expenses|efficiency|waste)/i,
      /cost.*reduction/i,
      /operational.*excellence/i,
      /bottleneck.*process/i,
      // Indonesian patterns
      /(laba|margin|keuntungan).*(turun|anjlok|merosot|menurun|tipis|berkurang|jatuh)/i,
      /omset.*(naik|tinggi).*laba.*(turun|tipis|kecil|anjlok)/i,
      /omzet.*(naik|tinggi).*laba.*(turun|tipis|kecil|anjlok)/i,
      /biaya.*(operasional|bengkak|tinggi|meningkat|naik)/i,
      /(efisiensi|restrukturisasi|pengurangan).*biaya/i,
      /kebocoran.*(biaya|laba|margin|operasional)/i,
      /optimasi.*(biaya|operasional|laba)/i
    ]
  },
  {
    intent: 'growth',
    keywords: [
      // English
      'growth', 'grow', 'expansion', 'expand', 'market', 'scale',
      'strategy', 'branch', 'penetration', 'competitor', 'go to market',
      'business plan', 'strategic planning', 'strategic partnership', 'sales',
      // Indonesian
      'pertumbuhan', 'tumbuh', 'ekspansi', 'perluasan pasar', 'skala bisnis',
      'cabang baru', 'buka cabang', 'strategi', 'penjualan', 'omset', 'omzet',
      'target penjualan', 'mitra strategis', 'kemitraan', 'go-to-market',
      'pemasaran', 'riset pasar', 'kompetitor', 'pangsa pasar', 'scale up',
      'rencana bisnis', 'perluasan bisnis', 'ekspansi bisnis'
    ],
    patterns: [
      /market.*expansion/i,
      /increase.*sales/i,
      /strategic.*plan/i,
      /growth.*strategy/i,
      /open.*new.*branch/i,
      /go-to-market/i,
      // Indonesian patterns
      /(ekspansi|perluasan).*(pasar|bisnis|cabang|wilayah|daerah)/i,
      /(tingkatkan|meningkatkan|naikkan).*(penjualan|omset|omzet|omsetnya)/i,
      /rencana.*(strategis|bisnis)/i,
      /buka.*cabang.*baru/i,
      /strategi.*(pertumbuhan|ekspansi|pasar)/i,
      /scale.*up.*bisnis/i
    ]
  },
  {
    intent: 'capacity_building',
    keywords: [
      // English
      'capacity', 'building', 'training', 'mentoring', 'coaching',
      'workshop', 'executive', 'leadership', 'talent', 'employee', 'manager',
      'board', 'inpartner academy', 'corporate culture', 'skills', 'c-level',
      // Indonesian
      'pelatihan', 'training', 'coaching', 'mentoring', 'workshop', 'sdm',
      'karyawan', 'tim manajemen', 'eksekutif', 'kepemimpinan', 'leadership',
      'budaya kerja', 'kompetensi', 'the executive business program',
      'inpartner academy', 'peningkatan kapasitas', 'c-level', 'direktur',
      'pengembangan sdm', 'pelatihan sdm', 'pelatihan staf'
    ],
    patterns: [
      /executive.*business.*program/i,
      /training.*program/i,
      /employee.*training/i,
      /leadership.*coaching/i,
      /capacity.*building/i,
      /corporate.*academy/i,
      // Indonesian patterns
      /program.*(pelatihan|eksekutif|kepemimpinan)/i,
      /pelatihan.*(karyawan|manajemen|sdm|staf|pegawai)/i,
      /peningkatan.*kapasitas/i,
      /coaching.*(eksekutif|manajemen|direktur|pemimpin)/i,
      /pengembangan.*(sdm|kepemimpinan|tim)/i
    ]
  },
  {
    intent: 'contact',
    keywords: [
      // English
      'contact', 'call', 'phone', 'whatsapp', 'email', 'office',
      'address', 'location', 'meeting', 'schedule', 'book appointment',
      'pakuwon', 'surabaya', 'jakarta', 'office hours', 'inquiry',
      // Indonesian
      'kontak', 'hubungi', 'whatsapp', 'wa', 'telepon', 'nomor telepon',
      'no wa', 'alamat', 'kantor', 'lokasi', 'jadwal', 'meeting', 'pertemuan',
      'konsultasi', 'pakuwon', 'surabaya', 'jakarta', 'jam buka', 'jam kerja',
      'hubungi kami', 'alamat kantor', 'nomor hp'
    ],
    patterns: [
      /how.*to.*(contact|reach)/i,
      /phone.*number|whatsapp.*number/i,
      /office.*address|where.*located/i,
      /meet.*consultant/i,
      /schedule.*consultation/i,
      /book.*meeting/i,
      // Indonesian patterns
      /cara.*(menghubungi|kontak)/i,
      /nomor.*(whatsapp|telepon|wa|hp)/i,
      /alamat.*(kantor|inpartner)/i,
      /lokasi.*(kantor|jakarta|surabaya)/i,
      /jadwal.*konsultasi/i,
      /temu.*konsultan/i,
      /bicara.*dengan.*(konsultan|manusia|tim)/i
    ]
  },
  {
    intent: 'company_information',
    keywords: [
      // English
      'who is inpartner', 'about inpartner', 'profile', 'history', 'vision',
      'mission', 'values', 'directors', 'founded', 'track record', 'clients',
      'experience', 'projects', 'sectors', 'industry',
      // Indonesian
      'siapa inpartner', 'profil perusahaan', 'tentang inpartner', 'profil inpartner',
      'sejarah inpartner', 'visi', 'misi', 'direksi', 'pengalaman', 'klien',
      'sektor', 'industri', 'latar belakang', 'portofolio', 'kantor pusat',
      'berdiri sejak'
    ],
    patterns: [
      /who.*is.*inpartner/i,
      /company.*profile/i,
      /vision.*mission/i,
      /about.*inpartner/i,
      /when.*founded/i,
      // Indonesian patterns
      /siapa.*inpartner/i,
      /profil.*(perusahaan|inpartner)/i,
      /tentang.*inpartner/i,
      /kapan.*berdiri/i,
      /rekam.*jejak/i,
      /sejarah.*inpartner/i
    ]
  },
  {
    intent: 'service_information',
    keywords: [
      // English
      'services', 'service', 'advisory', 'scope', 'what do you do',
      'offerings', 'consulting pillars', 'solutions',
      // Indonesian
      'layanan', 'pilar', 'jasa konsultan', 'apa saja layanan', 'solusi',
      'bidang konsultasi', 'lingkup kerja', 'cakupan layanan', 'konsultasi bisnis',
      'produk layanan', 'layanan apa'
    ],
    patterns: [
      /what.*services/i,
      /inpartner.*services/i,
      /scope.*of.*work/i,
      /advisory.*areas/i,
      // Indonesian patterns
      /apa.*(layanan|jasa|solusi)/i,
      /layanan.*inpartner/i,
      /lingkup.*(kerja|layanan)/i,
      /bidang.*konsultasi/i,
      /apa.*saja.*layanan/i
    ]
  }
];

export function detectIntent(text: string): {
  intent: IntentType;
  confidence: number;
  matchedKeywords: string[];
} {
  const clean = text.toLowerCase().trim();
  if (!clean) {
    return { intent: 'unknown', confidence: 0, matchedKeywords: [] };
  }

  let bestIntent: IntentType = 'unknown';
  let bestScore = 0;
  let bestMatchedKeywords: string[] = [];

  for (const rule of INTENT_RULES) {
    let score = 0;
    const matched: string[] = [];

    // Pattern matching (high confidence)
    for (const pattern of rule.patterns) {
      if (pattern.test(clean)) {
        score += 3.0;
      }
    }

    // Keyword matching
    for (const kw of rule.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 1.0;
        matched.push(kw);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = rule.intent;
      bestMatchedKeywords = matched;
    }
  }

  if (bestScore === 0) {
    return { intent: 'unknown', confidence: 0.1, matchedKeywords: [] };
  }

  const confidence = Math.min(1.0, bestScore / 4.0);
  return {
    intent: bestIntent,
    confidence,
    matchedKeywords: bestMatchedKeywords
  };
}
