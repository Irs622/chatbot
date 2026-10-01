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
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    accentBorder: 'border-t-rose-500',
    headerBg: 'bg-rose-50/60',
    columnBg: 'bg-rose-50/20',
    dotColor: 'bg-rose-500'
  },
  {
    key: 'contacted',
    title: 'Qualification: Contacted',
    stageName: 'Qualification',
    subtitle: 'Initial review & qualification outreach',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    accentBorder: 'border-t-amber-500',
    headerBg: 'bg-amber-50/60',
    columnBg: 'bg-amber-50/20',
    dotColor: 'bg-amber-500'
  },
  {
    key: 'in_progress',
    title: 'Discovery & Diagnostic',
    stageName: 'Discovery',
    subtitle: 'Consultative scoping & exploratory session',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    accentBorder: 'border-t-sky-500',
    headerBg: 'bg-sky-50/60',
    columnBg: 'bg-sky-50/20',
    dotColor: 'bg-sky-500'
  },
  {
    key: 'proposal',
    title: 'Proposal & ToR',
    stageName: 'Proposal',
    subtitle: 'NDA executed & formal proposal / ToR delivered',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    accentBorder: 'border-t-indigo-500',
    headerBg: 'bg-indigo-50/60',
    columnBg: 'bg-indigo-50/20',
    dotColor: 'bg-indigo-500'
  },
  {
    key: 'converted',
    title: 'Onboarding: Retained',
    stageName: 'Retained',
    subtitle: 'Advisory agreement executed & retained',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    accentBorder: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50/60',
    columnBg: 'bg-emerald-50/20',
    dotColor: 'bg-emerald-500'
  },
  {
    key: 'closed',
    title: 'Archived: Closed',
    stageName: 'Archived',
    subtitle: 'Non-viable or postponed engagements',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    accentBorder: 'border-t-slate-400',
    headerBg: 'bg-slate-100/70',
    columnBg: 'bg-slate-50/40',
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
