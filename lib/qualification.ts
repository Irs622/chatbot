/**
 * INPARTNER AI — Enterprise Lead Qualification Schema & Localization
 * PT Inpartner Optima Integra • Commercial Practice Management
 */

export type CompanyScale =
  | 'msme'
  | 'mid_market'
  | 'large_enterprise'
  | 'state_owned'
  | 'multinational';

export type IndustrySector =
  | 'financial_services'
  | 'capital_markets'
  | 'manufacturing'
  | 'mining_resources'
  | 'tech_ai'
  | 'healthcare'
  | 'consumer_retail'
  | 'renewable_energy'
  | 'infrastructure_realestate'
  | 'other';

export type ProjectTimeline =
  | 'immediate'
  | '1_to_3_months'
  | 'gt_3_months_planning';

export interface EnterpriseQualification {
  job_title?: string;
  company_scale?: CompanyScale;
  industry?: IndustrySector;
  timeline?: ProjectTimeline;
}

export interface QualificationOption<T> {
  value: T;
  label: {
    id: string;
    en: string;
    ko: string;
  };
}

export const COMPANY_SCALE_OPTIONS: QualificationOption<CompanyScale>[] = [
  {
    value: 'large_enterprise',
    label: {
      id: 'Korporasi Skala Besar / Grup Konglomerasi',
      en: 'Large Enterprise / Conglomerate Group',
      ko: '대기업 / 대규모 기업집단'
    }
  },
  {
    value: 'multinational',
    label: {
      id: 'Perusahaan Multinasional / PT PMA Asing',
      en: 'Multinational Corporation / PT PMA Foreign Investment',
      ko: '다국적기업 / 외국인투자법인 (PT PMA)'
    }
  },
  {
    value: 'state_owned',
    label: {
      id: 'BUMN / BUMD / Lembaga Publik',
      en: 'State-Owned Enterprise (BUMN) / Public Institution',
      ko: '국영기업 (BUMN) / 공공기관'
    }
  },
  {
    value: 'mid_market',
    label: {
      id: 'Korporasi Menengah (Mid-Market)',
      en: 'Mid-Market Corporation',
      ko: '중견기업 (Mid-Market)'
    }
  },
  {
    value: 'msme',
    label: {
      id: 'UMKM / Usaha Berkembang (Emerging)',
      en: 'MSME / Emerging Enterprise',
      ko: '중소기업 / 스타트업 (MSME)'
    }
  }
];

export const INDUSTRY_OPTIONS: QualificationOption<IndustrySector>[] = [
  {
    value: 'financial_services',
    label: {
      id: 'Perbankan & Jasa Keuangan',
      en: 'Banking & Financial Services',
      ko: '금융 및 은행업'
    }
  },
  {
    value: 'capital_markets',
    label: {
      id: 'Pasar Modal & Sekuritas',
      en: 'Capital Markets & Securities',
      ko: '자본시장 및 증권'
    }
  },
  {
    value: 'manufacturing',
    label: {
      id: 'Manufaktur & Industri Berat',
      en: 'Manufacturing & Heavy Industry',
      ko: '제조업 및 중공업'
    }
  },
  {
    value: 'mining_resources',
    label: {
      id: 'Energi, Tambang & SDA',
      en: 'Energy, Mining & Natural Resources',
      ko: '에너지·광업·천연자원'
    }
  },
  {
    value: 'tech_ai',
    label: {
      id: 'Teknologi, Software & AI',
      en: 'Technology, Software & AI',
      ko: 'IT·소프트웨어·인공지능'
    }
  },
  {
    value: 'renewable_energy',
    label: {
      id: 'Energi Terbarukan & Keberlanjutan (ESG)',
      en: 'Renewable Energy & Sustainability (ESG)',
      ko: '신재생에너지 및 ESG'
    }
  },
  {
    value: 'infrastructure_realestate',
    label: {
      id: 'Infrastruktur, Properti & EPC',
      en: 'Infrastructure, Real Estate & EPC',
      ko: '인프라·부동산·건설'
    }
  },
  {
    value: 'healthcare',
    label: {
      id: 'Kesehatan, Farmasi & Medis',
      en: 'Healthcare, Pharma & Life Sciences',
      ko: '헬스케어·제약·바이오'
    }
  },
  {
    value: 'consumer_retail',
    label: {
      id: 'Konsumer, FMCG & Ritel',
      en: 'Consumer Goods, FMCG & Retail',
      ko: '소비재·FMCG·유통'
    }
  },
  {
    value: 'other',
    label: {
      id: 'Sektor Industri Lainnya',
      en: 'Other Industry Sector',
      ko: '기타 산업 분야'
    }
  }
];

export const TIMELINE_OPTIONS: QualificationOption<ProjectTimeline>[] = [
  {
    value: 'immediate',
    label: {
      id: 'Mendesak / Segera (< 1 Bulan)',
      en: 'Immediate (< 1 Month)',
      ko: '긴급 (< 1개월 이내)'
    }
  },
  {
    value: '1_to_3_months',
    label: {
      id: '1 - 3 Bulan ke Depan',
      en: '1 - 3 Months',
      ko: '1 - 3개월 이내'
    }
  },
  {
    value: 'gt_3_months_planning',
    label: {
      id: '> 3 Bulan / Perencanaan Strategis Tahunan',
      en: '> 3 Months / Annual Strategic Planning',
      ko: '3개월 이상 / 연간 전략 수립'
    }
  }
];

export function getCompanyScaleLabel(scale?: CompanyScale, lang: 'id' | 'en' | 'ko' = 'id'): string {
  if (!scale) return '-';
  const found = COMPANY_SCALE_OPTIONS.find((opt) => opt.value === scale);
  return found ? found.label[lang] : scale;
}

export function getIndustryLabel(industry?: IndustrySector, lang: 'id' | 'en' | 'ko' = 'id'): string {
  if (!industry) return '-';
  const found = INDUSTRY_OPTIONS.find((opt) => opt.value === industry);
  return found ? found.label[lang] : industry;
}

export function getTimelineLabel(timeline?: ProjectTimeline, lang: 'id' | 'en' | 'ko' = 'id'): string {
  if (!timeline) return '-';
  const found = TIMELINE_OPTIONS.find((opt) => opt.value === timeline);
  return found ? found.label[lang] : timeline;
}
