/**
 * INPARTNER AI — Enterprise Lead CSV & Dataset Export Engine
 * PT Inpartner Optima Integra • Multi-Attribute Data Serialization
 */

import type { Lead } from './db.ts';
import { getCompanyScaleLabel, getIndustryLabel, getTimelineLabel } from './qualification.ts';
import { getLeadStatusLabel } from './crmPipeline.ts';

export interface CsvExportFilterOptions {
  startDate?: string;
  endDate?: string;
  status?: string;
  priority?: string;
}

export function filterLeadsForExport(leads: Lead[], options: CsvExportFilterOptions = {}): Lead[] {
  return leads.filter((lead) => {
    if (options.status && options.status !== 'all' && lead.status !== options.status) {
      return false;
    }
    if (options.priority && options.priority !== 'all' && lead.priority_tier !== options.priority) {
      return false;
    }
    if (options.startDate) {
      const start = new Date(options.startDate).getTime();
      const leadDate = new Date(lead.created_at).getTime();
      if (!isNaN(start) && leadDate < start) return false;
    }
    if (options.endDate) {
      let end = new Date(options.endDate).getTime();
      if (options.endDate.length === 10) {
        end += 24 * 60 * 60 * 1000 - 1;
      }
      const leadDate = new Date(lead.created_at).getTime();
      if (!isNaN(end) && leadDate > end) return false;
    }
    return true;
  });
}

export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  return `"${str.replace(/"/g, '""')}"`;
}

export function generateLeadsCsv(leads: Lead[]): string {
  const headers = [
    'Reference ID',
    'Date Submitted',
    'Client Name',
    'Company Name',
    'Job Title / Role',
    'Company Scale',
    'Industry Sector',
    'Target Timeline',
    'Phone / WhatsApp',
    'Email Address',
    'Advisory Need',
    'Diagnostic Pillar',
    'Diagnostic Step 1',
    'Diagnostic Step 2',
    'Diagnostic Summary',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Referrer URL',
    'Landing Page',
    'Lead Score',
    'Priority Tier',
    'Target SLA',
    'Lead Status',
    'Consultant Notes'
  ];

  const rows = leads.map((lead) => {
    const scaleLabel = lead.company_scale ? getCompanyScaleLabel(lead.company_scale) : '-';
    const industryLabel = lead.industry ? getIndustryLabel(lead.industry) : '-';
    const timelineLabel = lead.timeline ? getTimelineLabel(lead.timeline) : '-';
    const scoreVal = lead.score !== undefined ? String(lead.score) : '-';
    const tierVal = lead.priority_tier
      ? lead.priority_tier === 'tier_1'
        ? 'Tier 1 (Hot)'
        : lead.priority_tier === 'tier_2'
        ? 'Tier 2 (Warm)'
        : 'Tier 3 (Standard)'
      : '-';
    const slaVal = lead.score_breakdown?.target_sla || '-';
    const statusLabel = getLeadStatusLabel(lead.status);

    const step1Detail = lead.diagnostic_data
      ? `${lead.diagnostic_data.step1_question || 'Step 1'}: ${lead.diagnostic_data.step1_answer || '-'}`
      : '-';

    const step2Detail = lead.diagnostic_data
      ? `${lead.diagnostic_data.step2_question || 'Step 2'}: ${lead.diagnostic_data.step2_answer || '-'}`
      : '-';

    return [
      escapeCsvField(lead.id),
      escapeCsvField(lead.created_at ? new Date(lead.created_at).toISOString() : '-'),
      escapeCsvField(lead.name),
      escapeCsvField(lead.company || '-'),
      escapeCsvField(lead.job_title || '-'),
      escapeCsvField(scaleLabel),
      escapeCsvField(industryLabel),
      escapeCsvField(timelineLabel),
      lead.phone ? `="${lead.phone.replace(/"/g, '""')}"` : '""',
      escapeCsvField(lead.email || '-'),
      escapeCsvField(lead.business_need),
      escapeCsvField(lead.diagnostic_data?.pillar || '-'),
      escapeCsvField(step1Detail),
      escapeCsvField(step2Detail),
      escapeCsvField(lead.diagnostic_summary || '-'),
      escapeCsvField(lead.attribution?.utm_source || '-'),
      escapeCsvField(lead.attribution?.utm_medium || '-'),
      escapeCsvField(lead.attribution?.utm_campaign || '-'),
      escapeCsvField(lead.attribution?.referrer_url || '-'),
      escapeCsvField(lead.attribution?.landing_page || '-'),
      escapeCsvField(scoreVal),
      escapeCsvField(tierVal),
      escapeCsvField(slaVal),
      escapeCsvField(statusLabel),
      escapeCsvField(lead.notes || '-')
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

