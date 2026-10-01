import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCompanyScaleLabel,
  getIndustryLabel,
  getTimelineLabel,
  COMPANY_SCALE_OPTIONS,
  INDUSTRY_OPTIONS,
  TIMELINE_OPTIONS
} from '../lib/qualification.ts';
import type { CompanyScale, IndustrySector, ProjectTimeline } from '../lib/qualification.ts';
import { calculateLeadScore } from '../lib/leadScoring.ts';
import { createLead, getAllLeads } from '../lib/db.ts';

test('Enriched Enterprise Lead Qualification Schema and Form UX Suite', async (t) => {
  await t.test('Schema & Options: All enterprise qualification constants and options are defined', () => {
    assert.equal(COMPANY_SCALE_OPTIONS.length, 5);
    assert.equal(INDUSTRY_OPTIONS.length, 10);
    assert.equal(TIMELINE_OPTIONS.length, 3);

    // Verify option values are valid
    const scaleValues = COMPANY_SCALE_OPTIONS.map((o) => o.value);
    assert.ok(scaleValues.includes('large_enterprise'));
    assert.ok(scaleValues.includes('multinational'));
    assert.ok(scaleValues.includes('state_owned'));
    assert.ok(scaleValues.includes('mid_market'));
    assert.ok(scaleValues.includes('msme'));

    const timelineValues = TIMELINE_OPTIONS.map((o) => o.value);
    assert.ok(timelineValues.includes('immediate'));
    assert.ok(timelineValues.includes('1_to_3_months'));
    assert.ok(timelineValues.includes('gt_3_months_planning'));
  });

  await t.test('Trilingual Localization: Translates labels accurately across ID, EN, and KO', () => {
    // Indonesian
    assert.ok(getCompanyScaleLabel('large_enterprise', 'id').includes('Grup Konglomerasi'));
    assert.ok(getIndustryLabel('financial_services', 'id').includes('Perbankan'));
    assert.ok(getTimelineLabel('immediate', 'id').includes('Mendesak'));

    // English
    assert.ok(getCompanyScaleLabel('large_enterprise', 'en').includes('Large Enterprise'));
    assert.ok(getIndustryLabel('mining_resources', 'en').includes('Mining & Natural Resources'));
    assert.ok(getTimelineLabel('immediate', 'en').includes('Immediate (< 1 Month)'));

    // Korean
    assert.ok(getCompanyScaleLabel('multinational', 'ko').includes('외국인투자법인'));
    assert.ok(getIndustryLabel('tech_ai', 'ko').includes('소프트웨어·인공지능'));
    assert.ok(getTimelineLabel('immediate', 'ko').includes('긴급'));

    // Fallbacks
    assert.equal(getCompanyScaleLabel(undefined), '-');
    assert.equal(getIndustryLabel(undefined), '-');
    assert.equal(getTimelineLabel(undefined), '-');
  });

  await t.test('Scoring Engine: Awards decision-maker authority boost for executive C-Level / Director roles', () => {
    const resultExecutive = calculateLeadScore({
      name: 'Ir. Hartono Wibowo',
      company: 'PT Nusantara Megah Perkasa Tbk',
      job_title: 'Direktur Utama / Chief Executive Officer',
      email: 'hartono@megahperkasa.co.id',
      phone: '08111223344',
      business_need: 'Strategy & Corporate Advisory'
    });

    const qualFactor = resultExecutive.factors.find((f) => f.factor === 'Enterprise Profile & Commercial Urgency');
    assert.ok(qualFactor, 'Expected Enterprise Profile factor to be present');
    assert.ok(qualFactor.score >= 10, 'Expected executive authority score boost');
    assert.ok(qualFactor.description.includes('Executive C-Level / Director authority'));
  });

  await t.test('Scoring Engine: Factors enterprise scale and urgent timeline into commercial prioritization', () => {
    const enterpriseScale: CompanyScale = 'large_enterprise';
    const urgentTimeline: ProjectTimeline = 'immediate';
    const industry: IndustrySector = 'mining_resources';

    const result = calculateLeadScore({
      name: 'Alexander Lee',
      company: 'Indo Nickel Mining Consortium',
      job_title: 'VP Corporate Strategy & Business Development',
      company_scale: enterpriseScale,
      industry,
      timeline: urgentTimeline,
      email: 'a.lee@nickelconsortium.com',
      phone: '+628123456789',
      business_need: 'Investment & Project Advisory (FS & Smelter Expansion)',
      notes: 'Seeking advisory on feasibility studies and debt syndication for high-pressure acid leaching plant.'
    });

    assert.equal(result.priority_tier, 'tier_1');
    assert.ok(result.score >= 80, `Expected score >= 80 for C-Level in Conglomerate with Immediate timeline, got ${result.score}`);

    const qualFactor = result.factors.find((f) => f.factor === 'Enterprise Profile & Commercial Urgency');
    assert.ok(qualFactor);
    assert.ok(qualFactor.score >= 20); // Senior role (7) + Large Enterprise (10) + Immediate (5) = 22 pts
    assert.ok(qualFactor.description.includes('Senior practice management authority'));
    assert.ok(qualFactor.description.includes('Large conglomerate or multinational FDI sponsor'));
    assert.ok(qualFactor.description.includes('Immediate urgency'));
  });

  await t.test('Scoring Engine: Backward compatibility when enterprise qualification is not provided', () => {
    const baselineResult = calculateLeadScore({
      name: 'Rudi Hermawan',
      company: 'Toko Elektronik Sukses',
      email: 'rudi@gmail.com',
      phone: '08123456789',
      business_need: 'Market Access & Business Expansion',
      notes: 'Mencari distributor baru di Jawa Timur.'
    });

    // Enterprise factor should NOT be added if none of the 4 fields are set
    const qualFactor = baselineResult.factors.find((f) => f.factor === 'Enterprise Profile & Commercial Urgency');
    assert.equal(qualFactor, undefined);
    assert.ok(baselineResult.score > 0);
  });

  await t.test('Database Pipeline: Stores and retrieves complete enterprise qualification record', () => {
    const lead = createLead({
      name: 'Dr. Maria Kusuma',
      company: 'PT Global Farmasi Medika',
      job_title: 'Chief Financial Officer (CFO)',
      company_scale: 'mid_market',
      industry: 'healthcare',
      timeline: '1_to_3_months',
      email: 'maria.kusuma@globalfarmasi.co.id',
      phone: '+6281399887766',
      business_need: 'Strategy & Corporate Advisory (Pre-IPO Structuring)',
      notes: 'Persiapan IPO di Bursa Efek Indonesia tahun depan.',
      status: 'new'
    });

    assert.ok(lead.id.startsWith('lead_'));
    assert.equal(lead.job_title, 'Chief Financial Officer (CFO)');
    assert.equal(lead.company_scale, 'mid_market');
    assert.equal(lead.industry, 'healthcare');
    assert.equal(lead.timeline, '1_to_3_months');
    assert.ok(lead.score && lead.score >= 70);

    const allLeads = getAllLeads();
    const retrieved = allLeads.find((l) => l.id === lead.id);
    assert.ok(retrieved);
    assert.equal(retrieved.job_title, 'Chief Financial Officer (CFO)');
    assert.equal(retrieved.company_scale, 'mid_market');
    assert.equal(retrieved.industry, 'healthcare');
  });
});
