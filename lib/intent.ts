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
      'funding', 'modal', 'investasi', 'investor', 'capital', 'pinjaman',
      'pitch deck', 'teaser', 'dana', 'pembiayaan', 'equity', 'saham',
      'venture capital', 'private equity', 'valuation', 'valuasi'
    ],
    patterns: [
      /cari (investor|modal|dana)/i,
      /butuh (pendanaan|investasi|investor)/i,
      /investment readiness/i,
      /apakah inpartner (memberikan|menyediakan) pinjaman/i
    ]
  },
  {
    intent: 'profitability',
    keywords: [
      'profit', 'laba', 'margin', 'profitability', 'rugi', 'omzet', 'cogs',
      'hpp', 'opex', 'efisiensi', 'biaya operasional', 'kebocoran', 'lean',
      'cost', 'boros', 'arus kas', 'cash flow', 'menurun', 'tekor'
    ],
    patterns: [
      /profit.*menurun/i,
      /margin.*turun/i,
      /omzet.*naik.*laba.*turun/i,
      /biaya.*operasional.*membengkak/i,
      /efisiensi.*proses/i,
      /operational.*excellence/i
    ]
  },
  {
    intent: 'growth',
    keywords: [
      'growth', 'tumbuh', 'pertumbuhan', 'ekspansi', 'pasar', 'market',
      'strategi', 'cabang', 'penetrasi', 'kompetitor', 'go to market',
      'rencana bisnis', 'strategic planning', 'mitra strategis', 'omset'
    ],
    patterns: [
      /ekspansi.*pasar/i,
      /meningkatkan.*penjualan/i,
      /rencana.*strategis/i,
      /strategi.*pertumbuhan/i,
      /buka.*cabang/i
    ]
  },
  {
    intent: 'capacity_building',
    keywords: [
      'capacity', 'building', 'pelatihan', 'training', 'mentoring', 'coaching',
      'workshop', 'executive', 'leadership', 'sdm', 'karyawan', 'manajer',
      'direksi', 'inpartner academy', 'budaya kerja', 'keterampilan'
    ],
    patterns: [
      /executive.*business.*program/i,
      /program.*pelatihan/i,
      /training.*karyawan/i,
      /leadership.*coaching/i,
      /capacity.*building/i
    ]
  },
  {
    intent: 'contact',
    keywords: [
      'kontak', 'hubungi', 'telepon', 'whatsapp', 'wa', 'email', 'kantor',
      'alamat', 'lokasi', 'meeting', 'jadwal', 'konsultasi langsung',
      'pakuwon', 'surabaya', 'jakarta', 'jam buka', 'nomor'
    ],
    patterns: [
      /cara.*menghubungi/i,
      /nomor.*whatsapp/i,
      /alamat.*kantor/i,
      /mau.*ketemu/i,
      /jadwal.*konsultasi/i
    ]
  },
  {
    intent: 'company_information',
    keywords: [
      'siapa inpartner', 'tentang inpartner', 'profil', 'sejarah', 'visi',
      'misi', 'values', 'direksi', 'kapan berdiri', 'berdiri', 'klien',
      'pengalaman', 'proyek', 'sektor', 'industri'
    ],
    patterns: [
      /siapa.*inpartner/i,
      /profil.*perusahaan/i,
      /visi.*misi/i,
      /tentang.*inpartner/i,
      /kapan.*berdiri/i
    ]
  },
  {
    intent: 'service_information',
    keywords: [
      'layanan', 'service', 'jasa', 'scope', 'apa saja layanan',
      'bantuan bisnis', 'konsultan apa', 'pilar'
    ],
    patterns: [
      /apa.*saja.*layanan/i,
      /layanan.*inpartner/i,
      /scope.*pekerjaan/i
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
