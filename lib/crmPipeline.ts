/**
 * INPARTNER AI — CRM Pipeline Architecture & Deal Lifecycle Engine
 * PT Inpartner Optima Integra • Multi-Stage Institutional Advisory Funnel
 */

import type { LeadStatus } from './db.ts';

export type PipelineStageKey = LeadStatus;

export interface PipelineStageConfig {
  key: PipelineStageKey;
  title: string;
  stageName: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBorder: string;
  headerBg: string;
  columnBg: string;
  dotColor: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    key: 'new',
    title: 'Intake: New Inbound',
    stageName: 'Intake',
    subtitle: 'Fresh inquiries awaiting first response',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    accentBorder: 'border-t-[#0779D1]',
    headerBg: 'bg-slate-50',
    columnBg: 'bg-slate-50/60',
    dotColor: 'bg-[#0779D1]'
  },
  {
    key: 'contacted',
    title: 'Qualification: Contacted',
    stageName: 'Qualification',
    subtitle: 'Initial review & qualification outreach',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    accentBorder: 'border-t-slate-400',
    headerBg: 'bg-slate-50',
    columnBg: 'bg-slate-50/60',
    dotColor: 'bg-slate-500'
  },
  {
    key: 'in_progress',
    title: 'Discovery & Diagnostic',
    stageName: 'Discovery',
    subtitle: 'Consultative scoping & exploratory session',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    accentBorder: 'border-t-blue-600',
    headerBg: 'bg-slate-50',
    columnBg: 'bg-slate-50/60',
    dotColor: 'bg-blue-600'
  },
  {
    key: 'proposal',
    title: 'Proposal & ToR',
    stageName: 'Proposal',
    subtitle: 'NDA executed & formal proposal / ToR delivered',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    accentBorder: 'border-t-indigo-600',
    headerBg: 'bg-slate-50',
    columnBg: 'bg-slate-50/60',
    dotColor: 'bg-indigo-600'
  },
  {
    key: 'converted',
    title: 'Onboarding: Retained',
    stageName: 'Retained',
    subtitle: 'Advisory agreement executed & retained',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    accentBorder: 'border-t-emerald-600',
    headerBg: 'bg-slate-50',
    columnBg: 'bg-slate-50/60',
    dotColor: 'bg-emerald-600'
  },
  {
    key: 'closed',
    title: 'Archived: Closed',
    stageName: 'Archived',
    subtitle: 'Non-viable or postponed engagements',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-200',
    accentBorder: 'border-t-slate-300',
    headerBg: 'bg-slate-50',
    columnBg: 'bg-slate-50/60',
    dotColor: 'bg-slate-400'
  }
];

export function getPipelineStage(status: LeadStatus): PipelineStageConfig {
  const found = PIPELINE_STAGES.find((s) => s.key === status);
  if (found) return found;
  return PIPELINE_STAGES[0];
}

export function getLeadStatusLabel(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'Intake (New Inbound)';
    case 'contacted':
      return 'Qualification (Contacted)';
    case 'in_progress':
      return 'Discovery (Diagnostic)';
    case 'proposal':
      return 'Proposal (NDA / ToR)';
    case 'converted':
      return 'Retained (Agreement Executed)';
    case 'closed':
      return 'Archived (Closed)';
    default:
      return status;
  }
}

export interface SLAStatus {
  isOverdue: boolean;
  ageHours: number;
  label: string;
  badgeText: string;
  badgeBg: string;
  badgeBorder: string;
}

/**
 * Evaluates whether a lead has breached SLA response targets.
 * Standard corporate SLA rule: Any lead remaining in 'new' for over 24 hours triggers an overdue alert.
 */
export function checkLeadSlaStatus(
  createdAt: string,
  status: LeadStatus,
  thresholdHours = 24
): SLAStatus {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdTime);
  const ageHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (status === 'new' && ageHours >= thresholdHours) {
    return {
      isOverdue: true,
      ageHours,
      label: `SLA Overdue (${ageHours}h > ${thresholdHours}h)`,
      badgeText: 'text-rose-700',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-300'
    };
  }

  if (status === 'new') {
    const hoursRemaining = Math.max(0, thresholdHours - ageHours);
    return {
      isOverdue: false,
      ageHours,
      label: `${hoursRemaining}h remaining`,
      badgeText: 'text-amber-700',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200'
    };
  }

  return {
    isOverdue: false,
    ageHours,
    label: ageHours < 1 ? '< 1h ago' : `${ageHours}h ago`,
    badgeText: 'text-slate-600',
    badgeBg: 'bg-slate-50',
    badgeBorder: 'border-slate-200'
  };
}

