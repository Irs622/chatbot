/**
 * INPARTNER AI — Lead Priority Scoring & Commercial Triage Engine
 * PT Inpartner Optima Integra • Business Development Operational SLA Matrix
 *
 * NOTE ON METHODOLOGY:
 * This score is a deterministic rule-based HEURISTIC PRIORITY SCORE (0 - 100),
 * not an empirical statistical deal closing probability.
 * It qualifies inbound inquiries to assign BD response SLAs (e.g. Tier 1 < 2h, Tier 2 < 6h).
 */

import type { CompanyScale, IndustrySector, ProjectTimeline } from './qualification.ts';

export type PriorityTier = 'tier_1' | 'tier_2' | 'tier_3';

export interface ScoreFactor {
  factor: string;
  score: number;
  max: number;
  description: string;
}

export interface LeadScoreResult {
  score: number;
  priority_tier: PriorityTier;
  tier_label: string;
  target_sla: string;
  factors: ScoreFactor[];
}

export interface LeadScoringInput {
  name?: string;
  company?: string;
  job_title?: string;
  company_scale?: CompanyScale;
  industry?: IndustrySector;
  timeline?: ProjectTimeline;
  email?: string;
  phone?: string;
  business_need?: string;
  notes?: string;
  diagnostic_summary?: string;
  has_completed_diagnostic?: boolean;
  conversation_messages?: Array<{ sender: string; message?: string; text?: string }>;
}

const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.id',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'ymail.com',
  'aol.com',
  'zoho.com',
  'gmx.com'
]);

const CORPORATE_SUFFIX_REGEX = /\b(pt|pt\.|cv|cv\.|corp|corporation|inc|incorporated|llc|ltd|limited|gmbh|bhd|holdings|holding|group|tbk|tbk\.|co\.|co|firm|enterprise|enterprises|주식회사|\(주\))\b/i;

/**
 * Calculates a heuristic Lead Priority Score (0 - 100) and assigns an operational SLA triage tier.
 */
export function calculateLeadScore(input: LeadScoringInput): LeadScoreResult {
  const factors: ScoreFactor[] = [];
  let totalScore = 0;

  const combinedText = [
    input.business_need || '',
    input.notes || '',
    input.company || '',
    input.name || '',
    ...(input.conversation_messages?.map((m) => m.message || m.text || '') || [])
  ].join(' ').toLowerCase();

  // 1. Core Advisory Pillar Assessment (Max: 30 pts)
  let pillarScore = 10;
  let pillarDesc = 'General advisory inquiry';

  const isStrategyOrInvestment =
    /strategy|corporate\s*advisory|m&a|merger|akuisisi|ipo|pre-ipo|restrukturisasi|restructuring|turnaround|feasibility|kelayakan|valuation|valuasi|project\s*development|financial\s*model/i.test(
      combinedText
    );

  const isCrossBorder =
    /cross-border|cross\s*border|joint\s*venture|jv|technology\s*transfer|fdi|pma|foreign\s*investment|lintas\s*negara|international/i.test(
      combinedText
    );

  const isMarketAccessOrHC =
    /market\s*access|market\s*entry|gtm|distributor|business\s*matching|executive\s*search|head\s*hunting|organization\s*development|executive\s*business\s*program/i.test(
      combinedText
    );

  if (isStrategyOrInvestment) {
    pillarScore = 30;
    pillarDesc = 'High-conviction demand in Strategy & Corporate Advisory or Investment/FS';
  } else if (isCrossBorder) {
    pillarScore = 25;
    pillarDesc = 'Strategic interest in Cross-Border Advisory, Joint Venture, or PMA setup';
  } else if (isMarketAccessOrHC) {
    pillarScore = 20;
    pillarDesc = 'Demand in Market Access / Distribution or Executive Search / Human Capital';
  }

  factors.push({
    factor: 'Advisory Pillar Alignment',
    score: pillarScore,
    max: 30,
    description: pillarDesc
  });
  totalScore += pillarScore;

  // 2. Corporate Entity Verification (Max: 20 pts)
  let companyScore = 0;
  let companyDesc = 'Individual or unverified entity';
  const rawCompany = (input.company || '').trim();

  if (rawCompany && rawCompany !== '-' && rawCompany !== 'Individual' && rawCompany.length >= 2) {
    if (CORPORATE_SUFFIX_REGEX.test(rawCompany) || CORPORATE_SUFFIX_REGEX.test(combinedText)) {
      companyScore = 20;
      companyDesc = `Verified corporate entity structure: "${rawCompany}"`;
    } else if (rawCompany.length >= 3) {
      companyScore = 12;
      companyDesc = `Named commercial business entity: "${rawCompany}"`;
    }
  } else if (CORPORATE_SUFFIX_REGEX.test(combinedText)) {
    companyScore = 10;
    companyDesc = 'Corporate affiliation mentioned in consultation notes';
  }

  factors.push({
    factor: 'Corporate Entity Attribution',
    score: companyScore,
    max: 20,
    description: companyDesc
  });
  totalScore += companyScore;

  // 3. International / Foreign Sponsor Attribution (Max: 20 pts)
  let intlScore = 0;
  let intlDesc = 'Domestic Indonesian business inquiry';
  const cleanPhone = (input.phone || '').replace(/[^0-9+]/g, '');

  const isForeignPhone =
    (cleanPhone.startsWith('+') && !cleanPhone.startsWith('+62')) ||
    (cleanPhone.startsWith('00') && !cleanPhone.startsWith('0062')) ||
    (cleanPhone.length >= 10 && !cleanPhone.startsWith('08') && !cleanPhone.startsWith('62') && !cleanPhone.startsWith('+62'));

  const hasKoreanHangul = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(
    [input.name, input.company, input.notes, input.business_need].join(' ')
  );

  const isFdiKeywords =
    /foreign\s*client|korean\s*company|japanese\s*investor|singapore\s*holding|pt\s*pma|fdi|overseas\s*expansion|penanaman\s*modal\s*asing/i.test(
      combinedText
    );

  if (hasKoreanHangul || (isForeignPhone && isFdiKeywords)) {
    intlScore = 20;
    intlDesc = 'Foreign institutional / cross-border client (Foreign origin verified)';
  } else if (isForeignPhone) {
    intlScore = 15;
    intlDesc = `International dialing contact prefix (${cleanPhone.slice(0, 4)}...)`;
  } else if (isFdiKeywords || isCrossBorder) {
    intlScore = 10;
    intlDesc = 'FDI / International market entry context';
  }

  factors.push({
    factor: 'International / Foreign Sponsor',
    score: intlScore,
    max: 20,
    description: intlDesc
  });
  totalScore += intlScore;

  // 4. Corporate Domain Verification (Max: 15 pts)
  let domainScore = 0;
  let domainDesc = 'Public / free webmail domain';
  const email = (input.email || '').trim().toLowerCase();

  if (email && email.includes('@')) {
    const domain = email.split('@')[1];
    if (domain && domain.includes('.') && !PUBLIC_EMAIL_DOMAINS.has(domain)) {
      domainScore = 15;
      domainDesc = `Verified corporate domain: @${domain}`;
    } else if (domain) {
      domainScore = 3;
      domainDesc = `Standard personal email provider: @${domain}`;
    }
  }

  factors.push({
    factor: 'Corporate Domain Verification',
    score: domainScore,
    max: 15,
    description: domainDesc
  });
  totalScore += domainScore;

  // 5. Engagement Depth & Diagnostic Interaction (Max: 10 pts)
  let depthScore = 2;
  let depthDesc = 'Direct single-touch submission';
  const msgCount = input.conversation_messages?.length || 0;
  const notesLength = (input.notes || '').trim().length;

  if (input.has_completed_diagnostic || (input.diagnostic_summary && input.diagnostic_summary.trim())) {
    depthScore = 10;
    depthDesc = 'Completed structured consultative discovery diagnostic';
  } else if (msgCount >= 4) {
    depthScore = 10;
    depthDesc = `Deep consultation engagement (${msgCount} messages exchanged)`;
  } else if (msgCount >= 2) {
    depthScore = 6;
    depthDesc = `Active diagnostic dialogue (${msgCount} messages exchanged)`;
  } else if (notesLength >= 50) {
    depthScore = 8;
    depthDesc = 'Comprehensive business requirement notes provided';
  } else if (notesLength >= 15) {
    depthScore = 4;
    depthDesc = 'Detailed preliminary challenge notes provided';
  }

  factors.push({
    factor: 'Engagement & Diagnostic Depth',
    score: depthScore,
    max: 10,
    description: depthDesc
  });
  totalScore += depthScore;

  // 6. Direct Contact Validity (Max: 10 pts)
  let contactScore = 0;
  let contactDesc = 'Unverified contact format';
  const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');

  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    contactScore = 10;
    contactDesc = 'Validated corporate mobile / direct WhatsApp number';
  } else if (digitsOnly.length >= 8) {
    contactScore = 5;
    contactDesc = 'Short contact number provided';
  }

  factors.push({
    factor: 'Direct Contact Validity',
    score: contactScore,
    max: 10,
    description: contactDesc
  });
  totalScore += contactScore;

  // 7. Enterprise Scale, Decision-Maker Authority & Urgency (Max: 25 pts)
  let enterpriseScore = 0;
  const enterpriseNotes: string[] = [];

  // 7a. Decision-Maker Seniority & Authority
  const rawJobTitle = (input.job_title || '').trim().toLowerCase();
  if (rawJobTitle) {
    if (/\b(c-level|cxo|ceo|cfo|coo|cto|cmo|cro|direktur|director|presiden|president|komisaris|commissioner|founder|owner|pemilik|partner)\b/i.test(rawJobTitle)) {
      enterpriseScore += 10;
      enterpriseNotes.push(`Executive C-Level / Director authority ("${input.job_title}")`);
    } else if (/\b(vp|vice president|head|gm|general manager|manager|manajer|lead|kadiv|kepala divisi)\b/i.test(rawJobTitle)) {
      enterpriseScore += 7;
      enterpriseNotes.push(`Senior practice management authority ("${input.job_title}")`);
    } else {
      enterpriseScore += 3;
      enterpriseNotes.push(`Corporate title stated ("${input.job_title}")`);
    }
  }

  // 7b. Enterprise Classification Scale
  if (input.company_scale) {
    if (input.company_scale === 'large_enterprise' || input.company_scale === 'multinational') {
      enterpriseScore += 10;
      enterpriseNotes.push('Large conglomerate or multinational FDI sponsor');
    } else if (input.company_scale === 'state_owned') {
      enterpriseScore += 9;
      enterpriseNotes.push('State-Owned Enterprise (BUMN) or public institution');
    } else if (input.company_scale === 'mid_market') {
      enterpriseScore += 7;
      enterpriseNotes.push('Established mid-market commercial corporation');
    } else if (input.company_scale === 'msme') {
      enterpriseScore += 4;
      enterpriseNotes.push('Emerging enterprise / growth company');
    }
  }

  // 7c. Target Engagement Timeline Urgency
  if (input.timeline) {
    if (input.timeline === 'immediate') {
      enterpriseScore += 5;
      enterpriseNotes.push('Immediate urgency (< 1 Month execution window)');
    } else if (input.timeline === '1_to_3_months') {
      enterpriseScore += 3;
      enterpriseNotes.push('Near-term engagement (1 - 3 Months)');
    } else if (input.timeline === 'gt_3_months_planning') {
      enterpriseScore += 1;
      enterpriseNotes.push('Annual strategic planning horizon (> 3 Months)');
    }
  }

  if (enterpriseNotes.length > 0) {
    factors.push({
      factor: 'Enterprise Profile & Commercial Urgency',
      score: enterpriseScore,
      max: 25,
      description: enterpriseNotes.join('; ')
    });
    totalScore += enterpriseScore;
  }

  // Cap total score within 0 - 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Priority Tier & SLA
  let priority_tier: PriorityTier = 'tier_3';
  let tier_label = 'Tier 3 (Standard / Exploratory)';
  let target_sla = 'Standard Response (Within 24 business hours)';

  if (finalScore >= 70) {
    priority_tier = 'tier_1';
    tier_label = 'Tier 1 (Hot / Urgent Opportunity)';
    target_sla = 'Immediate Follow-up (< 2 business hours)';
  } else if (finalScore >= 40) {
    priority_tier = 'tier_2';
    tier_label = 'Tier 2 (Warm / Strategic Lead)';
    target_sla = 'Priority Follow-up (< 12 business hours)';
  }

  return {
    score: finalScore,
    priority_tier,
    tier_label,
    target_sla,
    factors
  };
}

/**
 * Returns UI metadata (color classes, badge text, SLA) for a given priority tier.
 */
export function getPriorityBadgeInfo(tier?: PriorityTier) {
  switch (tier) {
    case 'tier_1':
      return {
        label: 'Tier 1 • Urgent',
        shortLabel: 'T1 Urgent',
        sla: '< 2h SLA',
        bg: 'bg-rose-50/70',
        text: 'text-rose-800',
        border: 'border-rose-200',
        badgeBg: 'bg-slate-900',
        ring: 'ring-slate-900/10'
      };
    case 'tier_2':
      return {
        label: 'Tier 2 • Strategic',
        shortLabel: 'T2 Strategic',
        sla: '< 12h SLA',
        bg: 'bg-amber-50/70',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badgeBg: 'bg-slate-700',
        ring: 'ring-slate-700/10'
      };
    case 'tier_3':
    default:
      return {
        label: 'Tier 3 • Standard',
        shortLabel: 'T3 Standard',
        sla: '24h SLA',
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        badgeBg: 'bg-slate-500',
        ring: 'ring-slate-500/10'
      };
  }
}
