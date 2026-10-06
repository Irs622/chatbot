/**
 * INPARTNER AI — CRM Pipeline, Kanban Lifecycle & CSV Export Test Suite
 * PT Inpartner Optima Integra • Quality Assurance Matrix
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  PIPELINE_STAGES,
  getPipelineStage,
  getLeadStatusLabel,
  checkLeadSlaStatus
} from '../lib/crmPipeline.ts';
import type { SLAStatus } from '../lib/crmPipeline.ts';

import {
  filterLeadsForExport,
  escapeCsvField,
  generateLeadsCsv
} from '../lib/exportCsv.ts';

import {
  createLead,
  getAllLeads,
  updateLeadStatus,
  getLeadById,
  deleteLead
} from '../lib/db.ts';
import type { Lead, LeadStatus } from '../lib/db.ts';

describe('1. CRM Pipeline Stages Configuration', () => {
  test('should define exactly 6 institutional advisory lifecycle stages', () => {
    assert.equal(PIPELINE_STAGES.length, 6);
    const keys = PIPELINE_STAGES.map((s) => s.key);
    assert.deepEqual(keys, ['new', 'contacted', 'in_progress', 'proposal', 'converted', 'closed']);
  });

  test('should provide correct labels and stage descriptors for each stage', () => {
    assert.equal(getLeadStatusLabel('new'), 'Intake (New Inbound)');
    assert.equal(getLeadStatusLabel('contacted'), 'Qualification (Contacted)');
    assert.equal(getLeadStatusLabel('in_progress'), 'Discovery (Diagnostic)');
    assert.equal(getLeadStatusLabel('proposal'), 'Proposal (NDA / ToR)');
    assert.equal(getLeadStatusLabel('converted'), 'Retained (Agreement Executed)');
    assert.equal(getLeadStatusLabel('closed'), 'Archived (Closed)');

    const proposalStage = getPipelineStage('proposal');
    assert.equal(proposalStage.stageName, 'Proposal');
    assert.ok(proposalStage.subtitle.includes('ToR'));
  });
});

describe('2. SLA Response Warning Indicator Engine', () => {
  test('should flag leads remaining in new status for over 24 hours as overdue', () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    const result: SLAStatus = checkLeadSlaStatus(twentyFiveHoursAgo, 'new', 24);

    assert.equal(result.isOverdue, true);
    assert.equal(result.ageHours, 25);
    assert.ok(result.label.includes('SLA Overdue'));
    assert.ok(result.badgeText.includes('rose'));
  });

  test('should not flag new leads created recently (< 24 hours)', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const result: SLAStatus = checkLeadSlaStatus(threeHoursAgo, 'new', 24);

    assert.equal(result.isOverdue, false);
    assert.equal(result.ageHours, 3);
    assert.ok(result.label.includes('21h remaining'));
  });

  test('should not flag leads in contacted or subsequent stages as overdue', () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const result: SLAStatus = checkLeadSlaStatus(twoDaysAgo, 'contacted', 24);

    assert.equal(result.isOverdue, false);
    assert.equal(result.ageHours, 48);
  });
});

describe('3. CSV Data Export Engine & Excel BOM Formatting', () => {
  const sampleLeads: Lead[] = [
    {
      id: 'lead_test_001',
      name: 'Dr. Hendra Gunawan',
      company: 'PT Nusantara Holding Group',
      job_title: 'Chief Financial Officer',
      company_scale: 'large_enterprise',
      industry: 'financial_services',
      timeline: 'immediate',
      email: 'hendra.gunawan@nusantaraholding.co.id',
      phone: '+6281234567890',
      business_need: 'Tax Optimization & M&A Restructuring',
      diagnostic_summary: 'Target restructuring PT subsidiary with cross-border tax incentives.',
      diagnostic_data: {
        pillar: 'strategy_corporate',
        pillar_name: 'Strategy & Corporate Advisory',
        step1_id: 'ma_reorg',
        step1_question: 'Focus area',
        step1_answer: 'M&A & Corporate Reorganization',
        step2_id: 't_1_3m',
        step2_question: 'Target timeline',
        step2_answer: '1-3 months',
        scoping_summary: 'Target restructuring PT subsidiary with cross-border tax incentives.',
        completed_at: new Date().toISOString()
      },
      created_at: '2026-09-30T10:00:00.000Z',
      status: 'proposal',
      score: 90,
      priority_tier: 'tier_1',
      score_breakdown: {
        tier_label: 'Tier 1 • Hot Lead',
        target_sla: '< 2 jam',
        factors: []
      },
      notes: 'Requested NDA and ToR draft prior to partner call.'
    },
    {
      id: 'lead_test_002',
      name: 'Siti Rahmawati',
      company: 'CV Berkah Sentosa',
      job_title: 'Finance Manager',
      company_scale: 'msme',
      industry: 'consumer_retail',
      timeline: '1_to_3_months',
      email: 'siti@berkahsentosa.id',
      phone: '081987654321',
      business_need: 'SOP Akuntansi & Payroll',
      created_at: '2026-10-01T08:00:00.000Z',
      status: 'new',
      score: 45,
      priority_tier: 'tier_2',
      score_breakdown: {
        tier_label: 'Tier 2 • Warm Lead',
        target_sla: '< 12 jam',
        factors: []
      }
    }
  ];

  test('should generate clean UTF-8 CSV with BOM for Excel compatibility', () => {
    const csv = generateLeadsCsv(sampleLeads);

    assert.equal(csv.charCodeAt(0), 0xFEFF);

    assert.ok(csv.includes('Reference ID'));
    assert.ok(csv.includes('Client Name'));
    assert.ok(csv.includes('Company Name'));
    assert.ok(csv.includes('Job Title / Role'));
    assert.ok(csv.includes('Company Scale'));
    assert.ok(csv.includes('Industry Sector'));
    assert.ok(csv.includes('Target Timeline'));
    assert.ok(csv.includes('Phone / WhatsApp'));
    assert.ok(csv.includes('Email Address'));
    assert.ok(csv.includes('Diagnostic Pillar'));
    assert.ok(csv.includes('Diagnostic Summary'));
    assert.ok(csv.includes('Lead Score'));
    assert.ok(csv.includes('Priority Tier'));
    assert.ok(csv.includes('Lead Status'));
  });

  test('should escape quotes, format phone numbers for Excel, and preserve enterprise metadata', () => {
    const csv = generateLeadsCsv(sampleLeads);

    assert.ok(csv.includes('="+6281234567890"'));
    assert.ok(csv.includes('="081987654321"'));

    assert.ok(csv.includes('Dr. Hendra Gunawan'));
    assert.ok(csv.includes('PT Nusantara Holding Group'));
    assert.ok(csv.includes('Chief Financial Officer'));
    assert.ok(csv.includes('Tier 1 (Hot)'));
    assert.ok(csv.includes('Proposal (NDA / ToR)'));
    assert.ok(csv.includes('Target restructuring PT subsidiary with cross-border tax incentives.'));
  });

  test('should accurately filter leads for CSV export by status, priority, and date range', () => {
    const filteredByStatus = filterLeadsForExport(sampleLeads, { status: 'proposal' });
    assert.equal(filteredByStatus.length, 1);
    assert.equal(filteredByStatus[0].id, 'lead_test_001');

    const filteredByPriority = filterLeadsForExport(sampleLeads, { priority: 'tier_2' });
    assert.equal(filteredByPriority.length, 1);
    assert.equal(filteredByPriority[0].id, 'lead_test_002');

    const filteredByDate = filterLeadsForExport(sampleLeads, {
      startDate: '2026-10-01',
      endDate: '2026-10-01'
    });
    assert.equal(filteredByDate.length, 1);
    assert.equal(filteredByDate[0].id, 'lead_test_002');
  });

  test('should properly escape quotes and commas using escapeCsvField', () => {
    assert.equal(escapeCsvField('PT "Inpartner" Optima, Integra'), '"PT ""Inpartner"" Optima, Integra"');
    assert.equal(escapeCsvField(null), '""');
    assert.equal(escapeCsvField(undefined), '""');
    assert.equal(escapeCsvField(100), '"100"');
  });
});

describe('4. Pipeline Stage Transitions & Database Synchronization', () => {
  let createdLeadId: string;

  test('should create a lead and allow transition to proposal status', () => {
    const lead = createLead({
      name: 'Bambang Soedarmono',
      company: 'PT Global Indo Solusi',
      email: 'bambang@globalsolusi.com',
      phone: '081299887766',
      business_need: 'Audit Kepatuhan Pajak & Feasibility Study',
      status: 'new'
    });

    createdLeadId = lead.id;
    assert.ok(createdLeadId);
    assert.equal(lead.status, 'new');

    const updated = updateLeadStatus(createdLeadId, 'proposal', 'NDA signed, sent preliminary ToR');
    assert.ok(updated);
    assert.equal(updated.status, 'proposal');
    assert.equal(updated.notes, 'NDA signed, sent preliminary ToR');

    const fetched = getLeadById(createdLeadId);
    assert.ok(fetched);
    assert.equal(fetched.status, 'proposal');
  });

  test('should cleanup test lead from database', () => {
    if (createdLeadId) {
      const deleted = deleteLead(createdLeadId);
      assert.equal(deleted, true);
      const afterDelete = getLeadById(createdLeadId);
      assert.equal(afterDelete, null);
    }
  });
});

