/**
 * INPARTNER AI — Consultative Diagnostic & Scoping Flow Test Suite
 * PT Inpartner Optima Integra • Multi-Layer Automated QA
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DIAGNOSTIC_DECISION_TREES,
  getDiagnosticTree,
  getAllDiagnosticPillars,
  detectDiagnosticPillar,
  generateScopingSummary
} from '../lib/diagnostic.ts';
import type { DiagnosticPillarKey } from '../lib/diagnostic.ts';
import { createLead, getAllLeads } from '../lib/db.ts';
import { calculateLeadScore } from '../lib/leadScoring.ts';
import {
  buildClientConfirmationEmailContent,
  generateConsultationRef
} from '../lib/notifications.ts';

describe('Consultative Diagnostic & Discovery Flow (Issue #6)', () => {
  // Test 1: Decision Tree Architecture Integrity
  test('Decision Trees - Complete coverage for all 5 official pillars', () => {
    const requiredPillars: DiagnosticPillarKey[] = [
      'strategy_corporate',
      'investment_advisory',
      'market_access',
      'cross_border',
      'human_capital'
    ];

    const allPillars = getAllDiagnosticPillars();
    assert.equal(allPillars.length, 5, 'Should have exactly 5 core advisory pillars');

    for (const key of requiredPillars) {
      const tree = getDiagnosticTree(key);
      assert.ok(tree, `Tree for pillar ${key} must exist`);
      assert.equal(tree?.pillarKey, key);

      // Verify Trilingual Pillar Names
      assert.ok(tree?.serviceName_id.length > 0, `${key} missing serviceName_id`);
      assert.ok(tree?.serviceName_en.length > 0, `${key} missing serviceName_en`);
      assert.ok(tree?.serviceName_ko.length > 0, `${key} missing serviceName_ko`);

      // Verify Step 1
      assert.equal(tree?.step1.step, 1);
      assert.ok(tree?.step1.question_id.length > 0, `${key} step 1 missing question_id`);
      assert.ok(tree?.step1.question_en.length > 0, `${key} step 1 missing question_en`);
      assert.ok(tree?.step1.question_ko.length > 0, `${key} step 1 missing question_ko`);
      assert.ok(tree?.step1.options.length >= 3, `${key} step 1 should have at least 3 options`);

      // Verify Step 2
      assert.equal(tree?.step2.step, 2);
      assert.ok(tree?.step2.question_id.length > 0, `${key} step 2 missing question_id`);
      assert.ok(tree?.step2.question_en.length > 0, `${key} step 2 missing question_en`);
      assert.ok(tree?.step2.question_ko.length > 0, `${key} step 2 missing question_ko`);
      assert.ok(tree?.step2.options.length >= 3, `${key} step 2 should have at least 3 options`);

      // Verify Options Trilingual Consistency
      for (const opt of [...tree!.step1.options, ...tree!.step2.options]) {
        assert.ok(opt.id.length > 0, 'Option ID must not be empty');
        assert.ok(opt.label_id.length > 0, `Option ${opt.id} missing label_id`);
        assert.ok(opt.label_en.length > 0, `Option ${opt.id} missing label_en`);
        assert.ok(opt.label_ko.length > 0, `Option ${opt.id} missing label_ko`);
      }
    }
  });

  // Test 2: Contextual Pillar Detection from User Query or Intent
  test('Pillar Detection Engine - Accurate classification across languages', () => {
    // Strategy & Corporate
    assert.equal(detectDiagnosticPillar('strategy_corporate'), 'strategy_corporate');
    assert.equal(detectDiagnosticPillar('Kami berencana melakukan M&A dan akuisisi anak usaha.'), 'strategy_corporate');
    assert.equal(detectDiagnosticPillar('Looking for IPO capital market readiness advisory.'), 'strategy_corporate');

    // Investment & Project Advisory
    assert.equal(detectDiagnosticPillar('investment_advisory'), 'investment_advisory');
    assert.equal(detectDiagnosticPillar('Butuh penyusunan studi kelayakan (bankable FS) untuk pabrik baru.'), 'investment_advisory');
    assert.equal(detectDiagnosticPillar('Commercial and financial valuation due diligence.'), 'investment_advisory');

    // Market Access & Business Expansion
    assert.equal(detectDiagnosticPillar('market_access'), 'market_access');
    assert.equal(detectDiagnosticPillar('Rencana ekspansi bisnis dan penetrasi pasar domestik luar Jawa.'), 'market_access');
    assert.equal(detectDiagnosticPillar('Need distributor matching and local market intelligence.'), 'market_access');

    // Cross-Border & Technology
    assert.equal(detectDiagnosticPillar('cross_border'), 'cross_border');
    assert.equal(detectDiagnosticPillar('Pembentukan joint venture (JV) dengan investor Korea.'), 'cross_border');
    assert.equal(detectDiagnosticPillar('International technology transfer and PT PMA setup.'), 'cross_border');

    // Human Capital & Organization
    assert.equal(detectDiagnosticPillar('human_capital'), 'human_capital');
    assert.equal(detectDiagnosticPillar('Kebutuhan executive search posisi Direktur Utama.'), 'human_capital');
    assert.equal(detectDiagnosticPillar('Organization design, job grading, and leadership capacity.'), 'human_capital');
  });

  // Test 3: Trilingual Scoping Synthesis Generator
  test('Scoping Synthesis - Formats cohesive discovery summaries in ID, EN, KO', () => {
    // Indonesian
    const synthId = generateScopingSummary('market_access', 'domestic_regional', 'intelligence_regulatory', 'id');
    assert.equal(synthId.pillarName, 'Market Access & Business Expansion');
    assert.ok(synthId.scopingSummary.includes('Ekspansi Domestik Regional'));
    assert.ok(synthId.scopingSummary.includes('Riset Intelijen Pasar'));

    // English
    const synthEn = generateScopingSummary('strategy_corporate', 'ma_divestment', 'audited_ready', 'en');
    assert.equal(synthEn.pillarName, 'Strategy & Corporate Advisory');
    assert.ok(synthEn.scopingSummary.includes('Mergers, Acquisitions'));
    assert.ok(synthEn.scopingSummary.includes('Audited Financial Statements Available'));

    // Korean
    const synthKo = generateScopingSummary('cross_border', 'joint_venture', 'origin_apac', 'ko');
    assert.equal(synthKo.pillarName, '크로스보더 & 기술 자문');
    assert.ok(synthKo.scopingSummary.includes('합작투자 법인'));
    assert.ok(synthKo.scopingSummary.includes('아시아 태평양'));
  });

  // Test 4: Database Persistence with Diagnostic Data Record
  test('Data Layer - Preserves diagnostic summary and structured records', () => {
    const testLead = createLead({
      name: 'Dr. Hendra Gunawan',
      company: 'PT Nusantara Agro Lestari',
      job_title: 'Chief Investment Officer',
      email: 'hendra.gunawan@nusantara-agro.co.id',
      phone: '081298765432',
      business_need: 'Investment & Project Advisory',
      notes: 'Rencana investasi pabrik hilirisasi baru.',
      diagnostic_summary: '[Investment & Project Advisory] Fokus: Studi Kelayakan Bankable • Lingkup: Rp 100 - 500 Miliar',
      diagnostic_data: {
        pillar: 'investment_advisory',
        pillar_name: 'Investment & Project Advisory',
        step1_id: 'bankable_fs',
        step1_question: 'Apa kebutuhan utama analisis investasi?',
        step1_answer: 'Studi Kelayakan Bankable',
        step2_id: 'ticket_large',
        step2_question: 'Berapa perkiraan nilai CAPEX?',
        step2_answer: 'Rp 100 Miliar - 500 Miliar',
        scoping_summary: '[Investment & Project Advisory] Fokus: Studi Kelayakan Bankable • Lingkup: Rp 100 - 500 Miliar',
        completed_at: new Date().toISOString()
      },
      status: 'new'
    });

    assert.ok(testLead.id.startsWith('lead_'));
    assert.equal(testLead.diagnostic_summary, '[Investment & Project Advisory] Fokus: Studi Kelayakan Bankable • Lingkup: Rp 100 - 500 Miliar');
    assert.equal(testLead.diagnostic_data?.pillar, 'investment_advisory');
    assert.equal(testLead.diagnostic_data?.step1_id, 'bankable_fs');

    const all = getAllLeads();
    const retrieved = all.find((l) => l.id === testLead.id);
    assert.ok(retrieved);
    assert.equal(retrieved?.diagnostic_data?.step2_id, 'ticket_large');
  });

  // Test 5: Lead Scoring Factor 5 Boost on Diagnostic Completion
  test('Lead Scoring - Awards full Factor 5 engagement boost for completed discovery', () => {
    const resultWithDiag = calculateLeadScore({
      name: 'Rudi Hartono',
      company: 'PT Global Distribusi',
      email: 'rudi@globaldistribusi.com',
      phone: '08119887766',
      business_need: 'Market Access & Business Expansion',
      diagnostic_summary: '[Market Access] Fokus: Ekspansi Domestik Regional • Lingkup: Pencarian Distributor',
      has_completed_diagnostic: true
    });

    const factor5 = resultWithDiag.factors.find((f) => f.factor === 'Engagement & Diagnostic Depth');
    assert.ok(factor5);
    assert.equal(factor5?.score, 10, 'Should award maximum 10 points for completed diagnostic');
    assert.equal(factor5?.description, 'Completed structured consultative discovery diagnostic');
  });

  // Test 6: Client Confirmation Email includes Diagnostic Scoping
  test('Notifications - Client confirmation email renders discovery scoping row', () => {
    const mockLead = {
      id: 'lead_diag_test_99',
      name: 'Ir. Bambang Wijaya',
      company: 'PT Semen Perkasa Tbk',
      job_title: 'VP Strategic Planning',
      email: 'bambang@semenperkasa.co.id',
      phone: '081233445566',
      business_need: 'Strategy & Corporate Advisory',
      diagnostic_summary: '[Strategy & Corporate Advisory] Fokus: Transformasi Bisnis • Lingkup: Laporan Keuangan Diaudit',
      status: 'new' as const,
      created_at: new Date().toISOString()
    };

    const emailContent = buildClientConfirmationEmailContent(mockLead, { lang: 'id', refCode: 'INP-20261001-TEST' });
    assert.ok(emailContent.html.includes('Diagnostik Awal'), 'Email should include Diagnostik Awal label');
    assert.ok(emailContent.html.includes('Transformasi Bisnis'), 'Email should display the synthesized scoping text');
    assert.ok(emailContent.html.includes('Laporan Keuangan Diaudit'), 'Email should display the synthesized scoping status');
  });
});
