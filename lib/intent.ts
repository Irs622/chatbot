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
      'financial model', 'cari investor', 'penggalangan dana', 'dividen',
      // Korean
      '투자', '펀딩', '자금', '투자자', '자본', '대출', '피치덱', '기업가치', '가치평가',
      '증자', '벤처캐피탈', '사모펀드', '인수합병', '엔젤투자', '투자유치', '재무모델',
      '자금조달', '배당'
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
      /bantuan.*(dana|modal|pendanaan)/i,
      // Korean patterns
      /(투자|자금|펀딩|자본).*(유치|조달|필요|구함|받기)/i,
      /(기업|회사).*(가치평가|밸류에이션)/i,
      /(피치덱|투자제안서)/i,
      /인파트너.*(대출|투자)/i
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
      'restrukturisasi biaya', 'inefisiensi', 'biaya membengkak',
      // Korean
      '수익성', '마진', '이익', '손실', '적자', '매출원가', '운영비용', '원가절감',
      '효율성', '비용', '현금흐름', '마진축소', '이익감소', '비용절감', '비용부담',
      '경영효율화', '영업이익'
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
      /optimasi.*(biaya|operasional|laba)/i,
      // Korean patterns
      /(마진|수익|영업이익).*(감소|하락|축소|줄어|악화|낮)/i,
      /(비용|원가).*(절감|효율화|증가|부담)/i,
      /매출.*(증가|상승).*이익.*(감소|하락)/i,
      /운영.*효율/i
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
      'rencana bisnis', 'perluasan bisnis', 'ekspansi bisnis',
      // Korean
      '성장', '확장', '시장', '스케일업', '전략', '지사', '해외진출', '경쟁사',
      '사업계획', '시장확대', '매출증대', '파트너십', '신규사업', '마케팅'
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
      /scale.*up.*bisnis/i,
      // Korean patterns
      /(시장|사업|해외).*(확장|진출|확대)/i,
      /(매출|성장).*(전략|증대|극대화)/i,
      /사업계획.*수립/i,
      /신규.*시장/i
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
      'pengembangan sdm', 'pelatihan sdm', 'pelatihan staf',
      // Korean
      '역량강화', '교육', '트레이닝', '멘토링', '코칭', '워크숍', '임원',
      '리더십', '인재', '직원', '매니저', '기업문화', '인파트너 아카데미', '경영진 교육'
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
      /pengembangan.*(sdm|kepemimpinan|tim)/i,
      // Korean patterns
      /(임원|경영진|직원|리더십).*(교육|훈련|코칭|역량)/i,
      /역량.*강화/i,
      /인파트너.*아카데미/i
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
      'hubungi kami', 'alamat kantor', 'nomor hp',
      // Korean
      '연락처', '전화', '이메일', '사무실', '주소', '위치', '상담예약', '미팅',
      '자카르타', '수라바야', '영업시간', '문의', '연락'
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
      /bicara.*dengan.*(konsultan|manusia|tim)/i,
      // Korean patterns
      /(연락처|전화번호|이메일|위치|사무실).*(알려|어디|문의)/i,
      /(상담|미팅|미팅일정).*(예약|신청|가능)/i,
      /상담원.*연결/i
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
      'berdiri sejak',
      // Korean
      '인파트너', '회사소개', '회사개요', '비전', '미션', '설립', '연혁', '대표',
      '고객사', '실적', '파트너'
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
      /sejarah.*inpartner/i,
      // Korean patterns
      /인파트너.*(소개|회사|어떤|역사|연혁)/i,
      /회사.*소개/i,
      /비전.*미션/i
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
      'produk layanan', 'layanan apa',
      // Korean
      '서비스', '자문', '컨설팅분야', '어떤서비스', '솔루션', '업무범위'
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
      /apa.*saja.*layanan/i,
      // Korean patterns
      /어떤.*(서비스|자문|컨설팅)/i,
      /인파트너.*서비스/i,
      /자문.*분야/i
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
