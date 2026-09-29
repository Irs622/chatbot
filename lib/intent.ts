export type IntentType =
  | 'strategy_corporate'
  | 'investment_advisory'
  | 'market_access'
  | 'cross_border'
  | 'human_capital'
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
    intent: 'strategy_corporate',
    keywords: [
      // English
      'strategy', 'corporate strategy', 'business strategy', 'transformation',
      'business transformation', 'restructuring', 'corporate restructuring',
      'merger', 'acquisition', 'm&a', 'mergers and acquisitions',
      'ipo', 'initial public offering', 'capital market', 'rights issue',
      'pre-ipo', 'listing', 'strategic planning', 'corporate direction',
      'divestiture', 'spin-off', 'turnaround', 'organizational redesign',
      // Indonesian
      'strategi bisnis', 'strategi korporat', 'strategi perusahaan',
      'transformasi bisnis', 'restrukturisasi', 'restrukturisasi perusahaan',
      'merger', 'akuisisi', 'm&a', 'go public', 'ipo', 'penawaran umum',
      'pasar modal', 'rights issue', 'pre-ipo', 'listing bursa',
      'perencanaan strategis', 'arah perusahaan', 'divestasi', 'spin-off',
      'turnaround', 'pembenahan perusahaan',
      // Korean
      '전략', '기업전략', '사업전략', '비즈니스변혁', '기업변혁', '구조조정',
      '합병', '인수', 'M&A', '인수합병', 'IPO', '기업공개', '자본시장',
      '유상증자', '상장', '전략계획', '사업재편', '터너라운드'
    ],
    patterns: [
      /corporate\s*(strategy|direction|restructur)/i,
      /business\s*(strategy|transformation|restructur)/i,
      /(merger|acquisition|m&a|mergers\s*and\s*acquisitions)/i,
      /(ipo|initial\s*public\s*offering|pre-ipo|capital\s*market)/i,
      /rights?\s*issue/i,
      /strategic\s*(plan|planning|direction)/i,
      /turnaround\s*strategy/i,
      // Indonesian
      /(strategi|transformasi|restrukturisasi)\s*(bisnis|perusahaan|korporat)/i,
      /(merger|akuisisi|go\s*public|ipo|divestasi)/i,
      /(pasar\s*modal|penawaran\s*umum|listing\s*bursa)/i,
      /(perencanaan|arah)\s*(strategis|perusahaan)/i,
      // Korean
      /(기업|사업|전략).*(전략|변혁|구조조정)/i,
      /(합병|인수|M&A|IPO|기업공개|상장)/i,
      /전략.*계획/i
    ]
  },
  {
    intent: 'investment_advisory',
    keywords: [
      // English
      'investment', 'investor', 'capital', 'funding', 'finance', 'financing',
      'feasibility study', 'feasibility', 'financial analysis', 'commercial analysis',
      'valuation', 'due diligence', 'project development', 'investment advisory',
      'investment opportunity', 'investment assessment', 'financial model',
      'pitch deck', 'teaser', 'equity', 'debt', 'venture capital', 'private equity',
      'alternative investment', 'project finance', 'capital deployment',
      // Indonesian
      'investasi', 'investor', 'modal', 'pendanaan', 'pembiayaan', 'permodalan',
      'studi kelayakan', 'feasibility study', 'analisis keuangan', 'analisis komersial',
      'valuasi', 'due diligence', 'pengembangan proyek', 'konsultasi investasi',
      'peluang investasi', 'penilaian investasi', 'model keuangan',
      'pitch deck', 'teaser investasi', 'ekuitas', 'hutang', 'pendanaan proyek',
      'dana alternatif', 'modal ventura', 'private equity',
      // Korean
      '투자', '투자자', '자본', '자금', '펀딩', '금융', '사업타당성',
      '재무분석', '상업분석', '기업가치', '실사', '프로젝트개발', '투자자문',
      '투자기회', '투자평가', '재무모델', '피치덱', '대안투자', '벤처캐피탈', '사모펀드'
    ],
    patterns: [
      /(feasibility\s*stud|investment\s*advis|investment\s*opportun|investment\s*assess)/i,
      /(commercial|financial)\s*(analysis|due\s*diligence|model)/i,
      /(raise|secure|need|find|attract).*(capital|funding|investment|investor)/i,
      /project\s*(development|finance|funding)/i,
      /(venture\s*capital|private\s*equity|alternative\s*invest)/i,
      // Indonesian
      /(studi\s*kelayakan|analisis\s*keuangan|analisis\s*komersial)/i,
      /(butuh|cari|perlu|mencari).*(modal|pendanaan|investasi|investor|dana)/i,
      /(penilaian|peluang|konsultasi)\s*investasi/i,
      /pengembangan\s*proyek/i,
      // Korean
      /(사업타당성|재무분석|투자자문|투자평가)/i,
      /(투자|자금|펀딩|자본).*(유치|조달|필요|구함)/i,
      /프로젝트.*개발/i
    ]
  },
  {
    intent: 'market_access',
    keywords: [
      // English
      'market access', 'market entry', 'market research', 'market intelligence',
      'market expansion', 'business expansion', 'business matching',
      'partner identification', 'distributor', 'distribution network',
      'go to market', 'go-to-market', 'gtm', 'market penetration',
      'market strategy', 'new market', 'expansion strategy', 'scale',
      'growth', 'growth strategy', 'sales', 'revenue growth',
      // Indonesian
      'akses pasar', 'masuk pasar', 'riset pasar', 'intelijen pasar',
      'ekspansi pasar', 'ekspansi bisnis', 'perluasan pasar', 'perluasan bisnis',
      'business matching', 'identifikasi mitra', 'distributor', 'jaringan distribusi',
      'go-to-market', 'penetrasi pasar', 'strategi pasar', 'pasar baru',
      'strategi ekspansi', 'scale up', 'pertumbuhan', 'strategi pertumbuhan',
      'penjualan', 'omset', 'omzet', 'pertumbuhan revenue',
      // Korean
      '시장접근', '시장진입', '시장조사', '시장정보', '시장확장', '사업확장',
      '비즈니스매칭', '파트너발굴', '유통망', '유통전략', '시장침투',
      '시장전략', '신규시장', '확장전략', '성장', '성장전략', '매출성장'
    ],
    patterns: [
      /market\s*(access|entry|research|intelligence|expansion|penetration|strategy)/i,
      /(business\s*matching|partner\s*identification|distributor\s*search)/i,
      /(go.to.market|gtm\s*strategy)/i,
      /(new\s*market|enter.*market|expand.*market)/i,
      /(growth|expansion)\s*strategy/i,
      // Indonesian
      /(akses|masuk|riset|ekspansi|penetrasi)\s*pasar/i,
      /(ekspansi|perluasan)\s*(pasar|bisnis)/i,
      /(identifikasi|cari)\s*(mitra|distributor|partner)/i,
      /strategi\s*(pasar|pertumbuhan|ekspansi)/i,
      // Korean
      /(시장|사업).*(접근|진입|조사|확장|침투)/i,
      /(파트너|유통).*(발굴|탐색|전략)/i,
      /성장.*전략/i
    ]
  },
  {
    intent: 'cross_border',
    keywords: [
      // English
      'cross-border', 'cross border', 'international', 'global',
      'joint venture', 'jv', 'technology transfer', 'knowledge transfer',
      'international partnership', 'foreign partner', 'international expansion',
      'overseas', 'abroad', 'export', 'import', 'international business development',
      'foreign direct investment', 'fdi', 'global market',
      // Indonesian
      'lintas batas', 'internasional', 'global', 'joint venture', 'jv',
      'alih teknologi', 'transfer teknologi', 'transfer pengetahuan',
      'kemitraan internasional', 'mitra asing', 'ekspansi internasional',
      'luar negeri', 'ekspor', 'impor', 'bisnis internasional',
      'investasi asing', 'pasar global', 'perusahaan asing',
      // Korean
      '국경간', '국제', '글로벌', '합작투자', 'JV', '기술이전', '지식이전',
      '국제파트너십', '해외파트너', '국제확장', '해외진출', '수출', '수입',
      '국제비즈니스', '외국인직접투자', '글로벌시장'
    ],
    patterns: [
      /(cross.border|international)\s*(partner|business|expansion|advisor)/i,
      /joint\s*venture/i,
      /(technology|knowledge)\s*transfer/i,
      /(international|global|overseas|foreign)\s*(market|partner|expansion|business)/i,
      /(foreign\s*direct\s*investment|fdi)/i,
      // Indonesian
      /(lintas\s*batas|internasional|global)\s*(bisnis|kemitraan|ekspansi)/i,
      /(joint\s*venture|jv)\s*(internasional|asing|luar\s*negeri)/i,
      /(alih|transfer)\s*(teknologi|pengetahuan)/i,
      /(mitra|ekspansi|bisnis)\s*(asing|internasional|luar\s*negeri)/i,
      // Korean
      /(국제|글로벌|해외).*(파트너|비즈니스|진출|확장)/i,
      /합작투자|JV/i,
      /(기술|지식).*이전/i
    ]
  },
  {
    intent: 'human_capital',
    keywords: [
      // English
      'executive search', 'headhunting', 'head hunting', 'talent', 'recruitment',
      'organization development', 'org development', 'leadership development',
      'talent advisory', 'training', 'capacity building', 'coaching', 'mentoring',
      'workshop', 'executive program', 'executive business program', 'leadership',
      'human capital', 'human resources', 'hr', 'people development',
      'succession planning', 'c-suite', 'ceo', 'cfo', 'coo',
      // Indonesian
      'executive search', 'headhunting', 'cari eksekutif', 'rekrutmen',
      'pengembangan organisasi', 'kepemimpinan', 'pengembangan kepemimpinan',
      'pelatihan', 'capacity building', 'coaching', 'mentoring', 'workshop',
      'program eksekutif', 'executive business program', 'sdm', 'karyawan',
      'sumber daya manusia', 'pengembangan sdm', 'pengembangan talenta',
      'perencanaan suksesi', 'direktur', 'manajer',
      // Korean
      '임원채용', '헤드헌팅', '인재', '채용', '조직개발', '리더십개발',
      '인재자문', '교육', '역량강화', '코칭', '멘토링', '워크숍',
      '임원프로그램', '리더십', '인사', '인적자원', '인재개발', '승계계획'
    ],
    patterns: [
      /(executive\s*search|head\s*hunting|headhunting)/i,
      /(organization|org)\s*development/i,
      /leadership\s*(development|coaching|training)/i,
      /(training|capacity\s*building)\s*program/i,
      /executive\s*business\s*program/i,
      /(coaching|mentoring)\s*(program|executive|leader)/i,
      /talent\s*(advisory|management|development)/i,
      /succession\s*plan/i,
      // Indonesian
      /(cari|rekrut)\s*(eksekutif|direktur|manajer)/i,
      /pengembangan\s*(organisasi|kepemimpinan|sdm|talenta)/i,
      /pelatihan\s*(karyawan|eksekutif|sdm|manajemen)/i,
      /(coaching|mentoring)\s*(eksekutif|manajemen|pemimpin)/i,
      /program\s*(eksekutif|pelatihan|kepemimpinan)/i,
      // Korean
      /(임원|인재|리더십).*(채용|개발|훈련|코칭)/i,
      /(조직|역량).*(개발|강화)/i,
      /임원.*프로그램/i
    ]
  },
  {
    intent: 'contact',
    keywords: [
      // English
      'contact', 'call', 'phone', 'whatsapp', 'email', 'office',
      'address', 'location', 'meeting', 'schedule', 'book appointment',
      'pakuwon', 'jakarta', 'office hours', 'inquiry', 'reach',
      '+62 859', 'corporatesecretary',
      // Indonesian
      'kontak', 'hubungi', 'whatsapp', 'wa', 'telepon', 'nomor telepon',
      'no wa', 'alamat', 'kantor', 'lokasi', 'jadwal', 'meeting', 'pertemuan',
      'konsultasi', 'pakuwon', 'jakarta', 'jam buka', 'jam kerja',
      'hubungi kami', 'alamat kantor', 'nomor hp',
      // Korean
      '연락처', '전화', '이메일', '사무실', '주소', '위치', '상담예약', '미팅',
      '자카르타', '영업시간', '문의', '연락'
    ],
    patterns: [
      /how.*to.*(contact|reach)/i,
      /phone.*number|whatsapp.*number/i,
      /office.*address|where.*located/i,
      /meet.*consultant/i,
      /schedule.*consultation/i,
      /book.*meeting/i,
      // Indonesian
      /cara.*(menghubungi|kontak)/i,
      /nomor.*(whatsapp|telepon|wa|hp)/i,
      /alamat.*(kantor|inpartner)/i,
      /lokasi.*(kantor|jakarta)/i,
      /jadwal.*konsultasi/i,
      /bicara.*dengan.*(konsultan|manusia|tim)/i,
      // Korean
      /(연락처|전화번호|이메일|위치|사무실).*(알려|어디|문의)/i,
      /(상담|미팅).*(예약|신청|가능)/i
    ]
  },
  {
    intent: 'company_information',
    keywords: [
      // English
      'who is inpartner', 'about inpartner', 'profile', 'history', 'vision',
      'mission', 'values', 'founded', 'track record', 'clients',
      'experience', 'projects', 'sectors', 'industry', 'tagline',
      'competitive advantage', 'geographic coverage', 'global reach',
      // Indonesian
      'siapa inpartner', 'profil perusahaan', 'tentang inpartner', 'profil inpartner',
      'sejarah inpartner', 'visi', 'misi', 'pengalaman', 'klien',
      'sektor', 'industri', 'latar belakang', 'portofolio', 'kantor pusat',
      'berdiri sejak', 'keunggulan', 'jangkauan global',
      // Korean
      '인파트너', '회사소개', '회사개요', '비전', '미션', '설립', '연혁',
      '고객사', '실적', '파트너', '경쟁우위', '글로벌커버리지'
    ],
    patterns: [
      /who.*is.*inpartner/i,
      /company.*profile/i,
      /vision.*mission/i,
      /about.*inpartner/i,
      /when.*founded/i,
      /track\s*record/i,
      /competitive\s*advantage/i,
      // Indonesian
      /siapa.*inpartner/i,
      /profil.*(perusahaan|inpartner)/i,
      /tentang.*inpartner/i,
      /kapan.*berdiri/i,
      /rekam.*jejak/i,
      /sejarah.*inpartner/i,
      // Korean
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
      'offerings', 'consulting', 'solutions', 'capabilities',
      'strategy advisory', 'investment advisory', 'market access', 'cross border',
      'human capital', 'all services', 'list of services',
      // Indonesian
      'layanan', 'jasa konsultan', 'apa saja layanan', 'solusi',
      'bidang konsultasi', 'lingkup kerja', 'cakupan layanan', 'konsultasi bisnis',
      'layanan apa', 'semua layanan', 'daftar layanan', 'layanan inpartner',
      // Korean
      '서비스', '자문', '컨설팅분야', '어떤서비스', '솔루션', '업무범위',
      '모든서비스', '서비스목록'
    ],
    patterns: [
      /what.*services/i,
      /inpartner.*services/i,
      /scope.*of.*work/i,
      /advisory.*areas/i,
      /list\s*of\s*services/i,
      // Indonesian
      /apa.*(layanan|jasa|solusi)/i,
      /layanan.*inpartner/i,
      /lingkup.*(kerja|layanan)/i,
      /bidang.*konsultasi/i,
      // Korean
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
