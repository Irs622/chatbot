/**
 * INPARTNER AI — Consultative Diagnostic & Scoping Decision Tree Engine
 * PT Inpartner Optima Integra • Advisory Practice Discovery Framework
 */

export type DiagnosticPillarKey =
  | 'strategy_corporate'
  | 'investment_advisory'
  | 'market_access'
  | 'cross_border'
  | 'human_capital';

export interface DiagnosticOption {
  id: string;
  label_id: string;
  label_en: string;
  label_ko: string;
  detail_id?: string;
  detail_en?: string;
  detail_ko?: string;
}

export interface DiagnosticStep {
  step: 1 | 2;
  title_id: string;
  title_en: string;
  title_ko: string;
  question_id: string;
  question_en: string;
  question_ko: string;
  options: DiagnosticOption[];
}

export interface DiagnosticPillarTree {
  pillarKey: DiagnosticPillarKey;
  serviceName_id: string;
  serviceName_en: string;
  serviceName_ko: string;
  tagline_id: string;
  tagline_en: string;
  tagline_ko: string;
  step1: DiagnosticStep;
  step2: DiagnosticStep;
}

export interface DiagnosticDataRecord {
  pillar: DiagnosticPillarKey;
  pillar_name: string;
  step1_id: string;
  step1_question: string;
  step1_answer: string;
  step2_id: string;
  step2_question: string;
  step2_answer: string;
  scoping_summary: string;
  completed_at: string;
}

export const DIAGNOSTIC_DECISION_TREES: Record<DiagnosticPillarKey, DiagnosticPillarTree> = {
  strategy_corporate: {
    pillarKey: 'strategy_corporate',
    serviceName_id: 'Strategy & Corporate Advisory',
    serviceName_en: 'Strategy & Corporate Advisory',
    serviceName_ko: '기업전략 & 기업 자문',
    tagline_id: 'Perumusan arah strategis korporasi, transformasi bisnis, dan transaksi pasar modal.',
    tagline_en: 'Corporate strategic direction, business transformation, and capital market transactions.',
    tagline_ko: '기업 전략 방향 수립, 비즈니스 전환 및 자본시장 거래 자문.',
    step1: {
      step: 1,
      title_id: 'Fokus Strategis Korporasi',
      title_en: 'Strategic Corporate Focus',
      title_ko: '기업 전략 중점 분야',
      question_id: 'Apa fokus inisiatif strategis utama yang sedang dipersiapkan perusahaan Anda?',
      question_en: 'What is the primary strategic corporate initiative your enterprise is preparing for?',
      question_ko: '현재 귀사에서 중점적으로 추진 중인 주요 전략적 과제는 무엇입니까?',
      options: [
        {
          id: 'ma_divestment',
          label_id: 'Merger, Akuisisi (M&A) & Divestasi',
          label_en: 'Mergers, Acquisitions (M&A) & Divestment',
          label_ko: 'M&A(인수합병) 및 사업부 분할·매각',
          detail_id: 'Akuisisi target strategis atau penjualan unit bisnis',
          detail_en: 'Target acquisition or business unit divestment',
          detail_ko: '전략적 인수 대상 발굴 또는 사업 매각'
        },
        {
          id: 'ipo_capital_market',
          label_id: 'Advisory IPO & Pasar Modal',
          label_en: 'IPO & Capital Markets Readiness',
          label_ko: 'IPO(기업공개) 및 자본시장 상장 자문',
          detail_id: 'Kesiapan go-public dan pendampingan underwriter',
          detail_en: 'Public listing readiness & underwriter facilitation',
          detail_ko: '상장 예비 심사 및 주관사 선정 협력'
        },
        {
          id: 'business_transformation',
          label_id: 'Transformasi Bisnis & Roadmap Strategis',
          label_en: 'Business Transformation & Corporate Roadmap',
          label_ko: '비즈니스 전환 및 중장기 기업 로드맵',
          detail_id: 'Modernisasi model bisnis dan roadmap jangka panjang',
          detail_en: 'Business model overhaul and multi-year roadmap',
          detail_ko: '비즈니스 모델 혁신 및 중장기 성장 전략 수립'
        },
        {
          id: 'corporate_restructuring',
          label_id: 'Restrukturisasi Korporasi & Turnaround',
          label_en: 'Corporate Restructuring & Debt Turnaround',
          label_ko: '기업 구조조정 및 재무 턴어라운드',
          detail_id: 'Penyehatan operasional atau restrukturisasi kewajiban',
          detail_en: 'Operational turnaround or debt restructuring',
          detail_ko: '운영 효율화 및 채무 구조조정 자문'
        }
      ]
    },
    step2: {
      step: 2,
      title_id: 'Kesiapan & Tata Kelola Internal',
      title_en: 'Readiness & Governance Status',
      title_ko: '기업 준비도 및 거버넌스 현황',
      question_id: 'Bagaimana status tata kelola dan kesiapan data internal saat ini?',
      question_en: 'What is the current state of internal data readiness and financial governance?',
      question_ko: '현재 내부 재무 데이터 준비도 및 거버넌스 상태는 어떻습니까?',
      options: [
        {
          id: 'audited_ready',
          label_id: 'Laporan Keuangan Diaudit Tersedia (Audited Financials Ready)',
          label_en: 'Audited Financial Statements Available',
          label_ko: '감사 완료된 재무제표 보유 (즉시 착수 가능)',
          detail_id: 'Data keuangan 2-3 tahun terakhir siap di-review',
          detail_en: '2-3 years audited books ready for review',
          detail_ko: '최근 2~3개년 감사보고서 검토 준비 완료'
        },
        {
          id: 'in_progress',
          label_id: 'Draf Strategis Sedang Disusun (Drafting Phase)',
          label_en: 'Internal Concept Note / Drafting in Progress',
          label_ko: '내부 기획안 및 사업 계획 수립 중',
          detail_id: 'Memerlukan validasi dan penajaman konsultan independen',
          detail_en: 'Requires independent consulting validation and refining',
          detail_ko: '외부 전문 기관의 타당성 검증 및 고도화 필요'
        },
        {
          id: 'urgent_turnaround',
          label_id: 'Kebutuhan Mendesak (< 1 Bulan - High Urgency)',
          label_en: 'Immediate Turnaround Need (< 1 Month Urgency)',
          label_ko: '시급한 턴어라운드 실행 필요 (1개월 이내 착수)',
          detail_id: 'Memerlukan intervensi cepat konsultan senior',
          detail_en: 'Requires swift senior advisory intervention',
          detail_ko: '수석 자문위원의 신속한 현장 개입 필요'
        },
        {
          id: 'exploratory',
          label_id: 'Eksplorasi Tahap Awal (Preliminary Exploration)',
          label_en: 'Preliminary Exploratory & Diagnostic Stage',
          label_ko: '초기 사전 탐색 및 타당성 타진 단계',
          detail_id: 'Membutuhkan wawasan komparatif lanskap industri',
          detail_en: 'Seeking industry benchmark and diagnostic insights',
          detail_ko: '업계 벤치마크 및 전략적 인사이트 검토 희망'
        }
      ]
    }
  },

  investment_advisory: {
    pillarKey: 'investment_advisory',
    serviceName_id: 'Investment & Project Advisory',
    serviceName_en: 'Investment & Project Advisory',
    serviceName_ko: '투자 & 프로젝트 자문',
    tagline_id: 'Studi kelayakan bankable, analisis finansial & komersial, serta pengembangan proyek investasi.',
    tagline_en: 'Bankable feasibility studies, commercial & financial valuation, and capital project development.',
    tagline_ko: '금융권 제출용 타당성 연구(FS), 상업·재무 분석 및 프로젝트 개발 자문.',
    step1: {
      step: 1,
      title_id: 'Ruang Lingkup Proyek & Studi',
      title_en: 'Project & Advisory Scope',
      title_ko: '프로젝트 및 자문 범위',
      question_id: 'Apa kebutuhan utama analisis investasi atau pengembangan proyek Anda?',
      question_en: 'What is the primary requirement for your investment or project advisory mandate?',
      question_ko: '귀하의 투자 또는 프로젝트 자문 의뢰의 핵심 목적은 무엇입니까?',
      options: [
        {
          id: 'bankable_fs',
          label_id: 'Studi Kelayakan Bankable (Bankable Feasibility Study)',
          label_en: 'Bankable Feasibility Study (Bank/Investor Ready)',
          label_ko: '금융권·투자자 제출용 타당성 조사 (Bankable FS)',
          detail_id: 'Penyusunan FS komprehensif untuk pengajuan pembiayaan/investor',
          detail_en: 'Comprehensive FS for syndication / institutional capital',
          detail_ko: '프로젝트 파이낸싱 및 기관 투자 유치를 위한 종합 연구'
        },
        {
          id: 'financial_due_diligence',
          label_id: 'Analisis Komersial & Finansial (Due Diligence & Valuation)',
          label_en: 'Commercial & Financial Due Diligence / Valuation',
          label_ko: '상업·재무 실사(Due Diligence) 및 기업가치 평가',
          detail_id: 'Penilaian valuasi objektif dan analisis sensitivitas risiko',
          detail_en: 'Objective valuation modeling and financial sensitivity stress-test',
          detail_ko: '객관적 기업가치 평가 모델링 및 재무적 스트레스 테스트'
        },
        {
          id: 'project_development',
          label_id: 'Pengembangan Proyek Baru (Greenfield / Brownfield)',
          label_en: 'Capital Project Development (Greenfield / Brownfield)',
          label_ko: '신규 프로젝트 개발 (그린필드 / 브라운필드 확장)',
          detail_id: 'Penyusunan business plan dan struktur operasional proyek',
          detail_en: 'Structuring project masterplan, commercial model & operations',
          detail_ko: '프로젝트 마스터플랜 및 사업 모델 구축'
        },
        {
          id: 'opportunity_assessment',
          label_id: 'Penilaian Peluang Investasi Independen',
          label_en: 'Independent Investment Opportunity Assessment',
          label_ko: '독립적 투자 기회 및 타당성 사전 평가',
          detail_id: 'Review pihak ketiga sebelum komitmen modal disahkan',
          detail_en: 'Third-party independent review before capital commitment',
          detail_ko: '최종 투자 집행 전 제3자 독립 자문 검토'
        }
      ]
    },
    step2: {
      step: 2,
      title_id: 'Estimasi Nilai / Skala Investasi',
      title_en: 'Estimated Investment Ticket Size',
      title_ko: '예상 투자 규모 (Ticket Size)',
      question_id: 'Berapa perkiraan nilai belanja modal (CAPEX) atau tiket investasi proyek ini?',
      question_en: 'What is the estimated capital expenditure (CAPEX) or investment ticket size?',
      question_ko: '본 프로젝트의 예상 자본적 지출(CAPEX) 또는 투자 규모는 어느 정도입니까?',
      options: [
        {
          id: 'ticket_small',
          label_id: '< Rp 25 Miliar (< USD 1.5 Juta)',
          label_en: '< IDR 25 Billion (< USD 1.5 Million)',
          label_ko: '250억 루피아 미만 (약 150만 달러 미만)',
          detail_id: 'Skala menengah / ekspansi fasilitas awal',
          detail_en: 'Mid-scale expansion or initial facility pilot',
          detail_ko: '중견 규모 확장 또는 파일럿 프로젝트'
        },
        {
          id: 'ticket_mid',
          label_id: 'Rp 25 Miliar - 100 Miliar (USD 1.5M - 6M)',
          label_en: 'IDR 25 Billion - 100 Billion (USD 1.5M - 6M)',
          label_ko: '250억 - 1,000억 루피아 (약 150만 - 600만 달러)',
          detail_id: 'Proyek komersial terstruktur',
          detail_en: 'Structured commercial capital development',
          detail_ko: '정형화된 상업용 자본 개발 프로젝트'
        },
        {
          id: 'ticket_large',
          label_id: 'Rp 100 Miliar - 500 Miliar (USD 6M - 30M)',
          label_en: 'IDR 100 Billion - 500 Billion (USD 6M - 30M)',
          label_ko: '1,000억 - 5,000억 루피아 (약 600만 - 3,000만 달러)',
          detail_id: 'Investasi skala korporasi besar / sindikasi',
          detail_en: 'Large enterprise syndicated investment mandate',
          detail_ko: '대기업 신디케이트 투자 및 인프라 프로젝트'
        },
        {
          id: 'ticket_mega',
          label_id: '> Rp 500 Miliar (> USD 30 Juta / Mega Project)',
          label_en: '> IDR 500 Billion (> USD 30 Million / Mega Project)',
          label_ko: '5,000억 루피아 이상 (3,000만 달러 이상 / 대형 프로젝트)',
          detail_id: 'Mega proyek infrastruktur / industri strategis',
          detail_en: 'Mega infrastructure / national strategic priority asset',
          detail_ko: '메가 인프라 / 국가 전략 프로젝트 규모'
        }
      ]
    }
  },

  market_access: {
    pillarKey: 'market_access',
    serviceName_id: 'Market Access & Business Expansion',
    serviceName_en: 'Market Access & Business Expansion',
    serviceName_ko: '시장 접근 & 사업 확장',
    tagline_id: 'Riset pasar mendalam, strategi masuk pasar, dan fasilitasi jaringan distributor/mitra lokal.',
    tagline_en: 'Deep market intelligence, market entry strategy, and local distributor/partner facilitation.',
    tagline_ko: '심층 시장 조사, 시장 진입 전략 및 현지 유통 파트너 매칭.',
    step1: {
      step: 1,
      title_id: 'Target Wilayah & Arah Ekspansi',
      title_en: 'Expansion Territory & Target Market',
      title_ko: '목표 시장 및 확장 권역',
      question_id: 'Ke mana arah target ekspansi pasar yang sedang direncanakan perusahaan Anda?',
      question_en: 'What is the geographic scope of your enterprise expansion plans?',
      question_ko: '현재 추진 중인 시장 확장의 주요 대상 지역은 어디입니까?',
      options: [
        {
          id: 'domestic_regional',
          label_id: 'Ekspansi Domestik Regional (Antar-Pulau Indonesia)',
          label_en: 'Domestic Regional Expansion (Inter-Island Indonesia)',
          label_ko: '인도네시아 국내 권역 확장 (자바 외 도서 지역 진출)',
          detail_id: 'Penetrasi ke wilayah luar Jawa, Sumatra, Kalimantan, Sulawesi',
          detail_en: 'Penetration into outer-island Indonesian commercial hubs',
          detail_ko: '자바 외 주요 상업 거점 지역 유통망 확대'
        },
        {
          id: 'foreign_entry_indonesia',
          label_id: 'Perusahaan Asing Masuk Pasar Indonesia (Inbound Entry)',
          label_en: 'Foreign Enterprise Inbound Entry into Indonesia',
          label_ko: '해외 기업의 인도네시아 신규 진출 (Inbound PMA)',
          detail_id: 'Pendirian PT PMA, izin operasional, dan kepatuhan lokal',
          detail_en: 'Foreign direct investment setup (PT PMA) and local licensing',
          detail_ko: '외국인 투자법인(PT PMA) 설립 및 현지 규제 승인'
        },
        {
          id: 'export_international',
          label_id: 'Ekspansi Ekspor & Pasar Internasional (Outbound Global)',
          label_en: 'Export Growth & International Outbound Markets',
          label_ko: '인도네시아 기업의 해외 수출 및 글로벌 확장 (Outbound)',
          detail_id: 'Membuka akses ke pasar ASEAN, Asia Timur, Timur Tengah',
          detail_en: 'Accessing ASEAN, East Asia, and global commercial corridors',
          detail_ko: 'ASEAN 및 동아시아 등 해외 시장 판로 개척'
        }
      ]
    },
    step2: {
      step: 2,
      title_id: 'Tantangan Utama & Bantuan yang Dibutuhkan',
      title_en: 'Key Commercial Challenge & Required Support',
      title_ko: '핵심 과제 및 필요 지원 사항',
      question_id: 'Apa tantangan paling krusial yang memerlukan pendampingan konsultan?',
      question_en: 'What is the most critical hurdle where Inpartner advisory is needed?',
      question_ko: '인파트너의 전문 지원이 가장 절실한 핵심 과제는 무엇입니까?',
      options: [
        {
          id: 'intelligence_regulatory',
          label_id: 'Riset Intelijen Pasar & Fasilitasi Regulasi/Perizinan',
          label_en: 'Market Intelligence & Regulatory Licensing Facilitation',
          label_ko: '시장 인텔리전스 분석 및 인허가·규제 승인 지원',
          detail_id: 'Studi kompetitor, pemetaan regulasi, BPOM/Halal/SNI',
          detail_en: 'Competitor benchmarking, regulatory navigation, local compliance',
          detail_ko: '경쟁사 분석, 규제 환경 매핑 및 필수 인허가 취득'
        },
        {
          id: 'distributor_matching',
          label_id: 'Pencarian Mitra Distribusi & Business Matching',
          label_en: 'Local Distributor Matching & Strategic Partner Search',
          label_ko: '현지 총판·유통사 발굴 및 비즈니스 매칭',
          detail_id: 'Identifikasi distributor kredibel dan uji latar belakang komersial',
          detail_en: 'Vetting qualified distribution channels and commercial background checks',
          detail_ko: '신뢰할 수 있는 현지 총판 검증 및 파트너십 협상'
        },
        {
          id: 'full_gtm_execution',
          label_id: 'Eksekusi Go-To-Market (GTM) Terintegrasi',
          label_en: 'End-to-End Go-To-Market (GTM) Strategy & Execution',
          label_ko: '엔드투엔드 시장 진입(GTM) 전략 수립 및 실행',
          detail_id: 'Pendampingan terpadu dari strategi hingga peluncuran komersial',
          detail_en: 'Turnkey advisory from strategy formulation to commercial launch',
          detail_ko: '전략 수립부터 상업 론칭까지 턴키 자문 지원'
        }
      ]
    }
  },

  cross_border: {
    pillarKey: 'cross_border',
    serviceName_id: 'Cross-Border & Technology Advisory',
    serviceName_en: 'Cross-Border & Technology Advisory',
    serviceName_ko: '크로스보더 & 기술 자문',
    tagline_id: 'Kemitraan strategis lintas negara, Joint Venture (JV), alih teknologi, dan alih pengetahuan.',
    tagline_en: 'Cross-border strategic alliances, Joint Ventures (JV), technology transfer, and knowledge licensing.',
    tagline_ko: '국경 간 전략적 제휴, 합작투자(JV), 기술 이전 및 지식재산권 라이선싱 자문.',
    step1: {
      step: 1,
      title_id: 'Skema Kerjasama Lintas Batas',
      title_en: 'Cross-Border Structure & Mandate',
      title_ko: '크로스보더 협력 형태',
      question_id: 'Apa bentuk skema kemitraan lintas batas yang ingin diwujudkan?',
      question_en: 'What structural cross-border arrangement does your company envision?',
      question_ko: '귀사가 추진하고자 하는 국경 간 파트너십의 형태는 무엇입니까?',
      options: [
        {
          id: 'joint_venture',
          label_id: 'Pembentukan Joint Venture (JV) / Usaha Patungan',
          label_en: 'International Joint Venture (JV) Formation',
          label_ko: '국제 합작투자 법인(Joint Venture) 설립',
          detail_id: 'Struktur kepemilikan saham, shareholder agreement, tata kelola JV',
          detail_en: 'Equity split, shareholders agreement, and joint governance',
          detail_ko: '지분 구조 설계, 주주간 계약(SHA) 및 거버넌스 수립'
        },
        {
          id: 'tech_knowledge_transfer',
          label_id: 'Alih Teknologi & Alih Pengetahuan (Technology Transfer)',
          label_en: 'Technology & Knowledge Transfer Licensing',
          label_ko: '기술 이전, 라이선싱 및 노하우 전수',
          detail_id: 'Perjanjian lisensi paten, transfer proses manufaktur/SOP',
          detail_en: 'Patent licensing, manufacturing process transfer, and technical training',
          detail_ko: '특허 라이선스 계약, 제조 공정 및 기술 노하우 현지화'
        },
        {
          id: 'inbound_fdi',
          label_id: 'Pendampingan Investasi Asing Masuk (Inbound FDI)',
          label_en: 'Inbound Foreign Direct Investment (FDI) Advisory',
          label_ko: '외국인 직접투자(FDI) 유치 및 현지화 자문',
          detail_id: 'Struktur modal asing, kemitraan strategis dengan konglomerasi lokal',
          detail_en: 'Structuring foreign capital and alliance with domestic conglomerates',
          detail_ko: '외자 유치 구조화 및 현지 주요 그룹사와의 전략 제휴'
        },
        {
          id: 'outbound_partnership',
          label_id: 'Ekspansi Mitra Strategis ke Luar Negeri (Outbound)',
          label_en: 'Outbound Strategic Alliance & Overseas Expansion',
          label_ko: '국내 기업의 해외 파트너 발굴 및 진출 자문',
          detail_id: 'Menemukan mitra internasional untuk ekspansi korporasi Indonesia',
          detail_en: 'Securing international partners for Indonesian enterprise growth',
          detail_ko: '인도네시아 기업의 글로벌 파트너 발굴 및 현지 안착'
        }
      ]
    },
    step2: {
      step: 2,
      title_id: 'Asal Negara / Mitra Counterparty',
      title_en: 'Counterparty Origin / Target Geography',
      title_ko: '협력 대상 국가 및 파트너 권역',
      question_id: 'Dari kawasan negara mana asal mitra counterparty yang terlibat atau dicari?',
      question_en: 'What is the regional origin of the counterparty involved or sought?',
      question_ko: '협력 대상 파트너 또는 진출 대상 지역은 어느 권역입니까?',
      options: [
        {
          id: 'origin_apac',
          label_id: 'Asia Pasifik (Korea Selatan, Jepang, Tiongkok, Singapura, ASEAN)',
          label_en: 'Asia-Pacific (South Korea, Japan, China, Singapore, ASEAN)',
          label_ko: '아시아 태평양 (한국, 일본, 중국, 싱가포르, ASEAN)',
          detail_id: 'Koridor investasi dan alih teknologi paling aktif di Indonesia',
          detail_en: 'Most active technology transfer and investment corridor to Indonesia',
          detail_ko: '인도네시아 최대 투자 및 기술 이전 협력 권역'
        },
        {
          id: 'origin_west',
          label_id: 'Amerika Utara & Eropa (USA, UK, Jerman, Uni Eropa)',
          label_en: 'North America & Europe (USA, UK, Germany, European Union)',
          label_ko: '북미 및 유럽 (미국, 영국, 독일, 유럽연합)',
          detail_id: 'Standar tata kelola internasional dan teknologi tingkat tinggi',
          detail_en: 'High-tech solutions and stringent ESG / international compliance',
          detail_ko: '글로벌 선진 기술 및 엄격한 ESG·거버넌스 표준 준수'
        },
        {
          id: 'origin_middle_east',
          label_id: 'Timur Tengah & Kawasan Lainnya (UAE, Saudi Arabia)',
          label_en: 'Middle East & Other Corridors (UAE, Saudi Arabia)',
          label_ko: '중동 및 기타 지역 (UAE, 사우디아라비아 등)',
          detail_id: 'Sovereign wealth funds dan investasi modal energi/infrastruktur',
          detail_en: 'Sovereign wealth funds and energy / infrastructure capital',
          detail_ko: '국부펀드 및 에너지·인프라 대형 자본 협력'
        },
        {
          id: 'searching_counterparty',
          label_id: 'Belum Ada Mitra (Membutuhkan Identifikasi Mitra dari Nol)',
          label_en: 'No Counterparty Yet (Require Inpartner to Identify Partners)',
          label_ko: '파트너 미정 (인파트너를 통한 해외 파트너 발굴 희망)',
          detail_id: 'INPARTNER memfasilitasi kurasi dan business matching global',
          detail_en: 'INPARTNER facilitates global curation, screening & matching',
          detail_ko: '인파트너의 글로벌 네트워크를 통한 적격 파트너 추천'
        }
      ]
    }
  },

  human_capital: {
    pillarKey: 'human_capital',
    serviceName_id: 'Human Capital & Organization',
    serviceName_en: 'Human Capital & Organization',
    serviceName_ko: '인적 자원 & 조직 개발',
    tagline_id: 'Pencarian eksekutif (Executive Search), perancangan organisasi, dan pengembangan talenta pimpinan.',
    tagline_en: 'C-Suite executive headhunting, organization design, and leadership capacity building.',
    tagline_ko: 'C-레벨 임원 헤드헌팅, 조직 설계 및 핵심 리더십 역량 강화 자문.',
    step1: {
      step: 1,
      title_id: 'Fokus Solusi Human Capital',
      title_en: 'Human Capital Focus Area',
      title_ko: '인적 자원 자문 중점 영역',
      question_id: 'Apa fokus kebutuhan penguatan organisasi atau talenta korporasi Anda?',
      question_en: 'What is the primary human capital or organizational challenge you aim to solve?',
      question_ko: '귀사의 조직 강화 또는 핵심 인재 영입과 관련된 주요 과제는 무엇입니까?',
      options: [
        {
          id: 'executive_search',
          label_id: 'Pencarian Eksekutif (C-Suite & Board Headhunting)',
          label_en: 'Executive Search (C-Suite & Board Headhunting)',
          label_ko: '임원 영입 (C-Suite 및 이사회급 헤드헌팅)',
          detail_id: 'Perekrutan Direktur Utama, CFO, COO, Head of Business Unit',
          detail_en: 'Recruiting CEO, CFO, COO, and strategic practice leaders',
          detail_ko: '대표이사, CFO, 사업총괄 등 핵심 최고경영진 영입'
        },
        {
          id: 'organization_design',
          label_id: 'Desain Organisasi & Arsitektur Kinerja (KPI & Grading)',
          label_en: 'Organization Design & Performance Architecture',
          label_ko: '조직 재설계 및 성과 평가 체계(KPI/직급) 고도화',
          detail_id: 'Restrukturisasi struktur divisi, matriks peran, dan sistem insentif',
          detail_en: 'Divisional structuring, job grading, and performance incentive alignment',
          detail_ko: '조직도 개편, 직무 분석 및 성과 연동 인센티브 체계 정립'
        },
        {
          id: 'leadership_capacity',
          label_id: 'Program Pelatihan & Evaluasi Kepemimpinan Eksekutif',
          label_en: 'Executive Leadership Assessment & Capacity Building',
          label_ko: '리더십 역량 평가 및 임원 맞춤형 교육 프로그램',
          detail_id: 'Executive business program dan pembinaan suksesi kepemimpinan',
          detail_en: 'Executive coaching, succession planning, and strategic leadership programs',
          detail_ko: '경영진 코칭, 승계 계획 수립 및 전략적 리더십 교육'
        }
      ]
    },
    step2: {
      step: 2,
      title_id: 'Skala / Kedalaman Penugasan',
      title_en: 'Engagement Depth & Breadth',
      title_ko: '자문 범위 및 대상 규모',
      question_id: 'Berapa cakupan pimpinan atau skala organisasi yang akan tercakup?',
      question_en: 'What is the scope of leadership positions or organizational tiers involved?',
      question_ko: '프로젝트에 참여할 임원 직책 수 또는 대상 조직 범위는 어느 정도입니까?',
      options: [
        {
          id: 'key_executives',
          label_id: '1 - 3 Posisi Pimpinan Kunci (Critical Executive Roles)',
          label_en: '1 - 3 Critical Executive Roles',
          label_ko: '핵심 임원 1~3개 직책 (긴급 배치)',
          detail_id: 'Penempatan mendesak posisi pengambil keputusan vital',
          detail_en: 'Immediate placement for top strategic leadership',
          detail_ko: '의사결정 핵심 직책에 대한 신속한 영입'
        },
        {
          id: 'department_level',
          label_id: 'Tingkat Divisi / Direktorat Terpilih (Departmental Scope)',
          label_en: 'Specific Directorate / Departmental Scope',
          label_ko: '특정 본부 / 부서 단위 조직 개편',
          detail_id: 'Peningkatan efisiensi operasional unit bisnis spesifik',
          detail_en: 'Targeted modernization for selected strategic units',
          detail_ko: '특정 핵심 사업부의 조직 역량 최적화'
        },
        {
          id: 'enterprise_overhaul',
          label_id: 'Menyeluruh Seluruh Korporasi (Enterprise-Wide Overhaul)',
          label_en: 'Enterprise-Wide Strategic Transformation',
          label_ko: '전사적 조직 진단 및 전면적 혁신',
          detail_id: 'Transformasi budaya kerja, KPI, dan struktur seluruh grup usaha',
          detail_en: 'Company-wide restructuring of culture, grading, and talent matrix',
          detail_ko: '그룹 전사 차원의 조직 문화, 직무 체계 및 거버넌스 혁신'
        }
      ]
    }
  }
};

/**
 * Returns the diagnostic decision tree for a given advisory pillar.
 */
export function getDiagnosticTree(pillarKey: string): DiagnosticPillarTree | null {
  if (pillarKey in DIAGNOSTIC_DECISION_TREES) {
    return DIAGNOSTIC_DECISION_TREES[pillarKey as DiagnosticPillarKey];
  }
  return null;
}

/**
 * Returns all supported diagnostic pillar trees.
 */
export function getAllDiagnosticPillars(): DiagnosticPillarTree[] {
  return Object.values(DIAGNOSTIC_DECISION_TREES);
}

/**
 * Infers the diagnostic pillar key from query text, intent, or service name.
 */
export function detectDiagnosticPillar(textOrIntent: string): DiagnosticPillarKey | null {
  const clean = (textOrIntent || '').trim();
  if (clean in DIAGNOSTIC_DECISION_TREES) {
    return clean as DiagnosticPillarKey;
  }

  const query = clean.toLowerCase();

  if (/strategy|corporate[\s_-]*advisory|m&a|merger|akuisisi|ipo|pre-ipo|restrukturisasi|restructuring|turnaround|divestment/i.test(query)) {
    return 'strategy_corporate';
  }
  if (/feasibility|studi\s*kelayakan|investment|investasi|proyek|project[\s_-]*advisory|due\s*diligence|valuation|capex/i.test(query)) {
    return 'investment_advisory';
  }
  if (/market[\s_-]*access|ekspansi\s*bisnis|business[\s_-]*expansion|market[\s_-]*entry|masuk\s*pasar|distributor|business\s*matching|gtm/i.test(query)) {
    return 'market_access';
  }
  if (/cross[\s_-]*border|lintas\s*batas|joint\s*venture|jv|technology\s*transfer|alih\s*teknologi|foreign\s*investment|pt\s*pma|pma/i.test(query)) {
    return 'cross_border';
  }
  if (/human[\s_-]*capital|organization|organisasi|executive\s*search|head\s*hunting|recruitment|kepemimpinan|leadership|kpi|pelatihan/i.test(query)) {
    return 'human_capital';
  }

  return null;
}

/**
 * Generates an executive scoping synthesis from selected diagnostic choices.
 */
export function generateScopingSummary(
  pillarKey: DiagnosticPillarKey,
  step1ChoiceId: string,
  step2ChoiceId: string,
  lang: 'id' | 'en' | 'ko' = 'id'
): {
  scopingSummary: string;
  pillarName: string;
  step1Label: string;
  step2Label: string;
} {
  const tree = DIAGNOSTIC_DECISION_TREES[pillarKey];
  if (!tree) {
    return {
      scopingSummary: 'General Scoping Consultation',
      pillarName: 'Advisory Consultation',
      step1Label: step1ChoiceId,
      step2Label: step2ChoiceId
    };
  }

  const step1Opt = tree.step1.options.find((o) => o.id === step1ChoiceId);
  const step2Opt = tree.step2.options.find((o) => o.id === step2ChoiceId);

  const pillarName = lang === 'ko' ? tree.serviceName_ko : lang === 'en' ? tree.serviceName_en : tree.serviceName_id;
  const step1Label = step1Opt ? (lang === 'ko' ? step1Opt.label_ko : lang === 'en' ? step1Opt.label_en : step1Opt.label_id) : step1ChoiceId;
  const step2Label = step2Opt ? (lang === 'ko' ? step2Opt.label_ko : lang === 'en' ? step2Opt.label_en : step2Opt.label_id) : step2ChoiceId;

  let scopingSummary = '';
  if (lang === 'ko') {
    scopingSummary = `[${pillarName}] 중점: ${step1Label} • 자문 요건: ${step2Label}`;
  } else if (lang === 'en') {
    scopingSummary = `[${pillarName}] Focus: ${step1Label} • Mandate Scope: ${step2Label}`;
  } else {
    scopingSummary = `[${pillarName}] Fokus: ${step1Label} • Lingkup Kebutuhan: ${step2Label}`;
  }

  return {
    scopingSummary,
    pillarName,
    step1Label,
    step2Label
  };
}
