import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLeadScore, getPriorityBadgeInfo } from '../lib/leadScoring.ts';
import { createLead, getAllLeads, getLeadById } from '../lib/db.ts';

test('Automated Lead Scoring Engine & Commercial Prioritization Matrix Suite', async (t) => {
  await t.test('Tier 1 Hot Opportunity: High-value Indonesian corporate M&A with custom domain', () => {
    const result = calculateLeadScore({
      name: 'Budi Santoso',
      company: 'PT Mega Integra Capital Tbk',
      email: 'budi.santoso@megacapital.co.id',
      phone: '+6281234567890',
      business_need: 'Strategy & Corporate Advisory (M&A Advisory & Restrukturisasi Korporasi)',
      notes: 'Kami berencana melakukan akuisisi strategis dan restrukturisasi holding company sebelum akhir tahun.',
      conversation_messages: [
        { sender: 'user', message: 'Bagaimana Inpartner mendampingi M&A dan due diligence?' },
        { sender: 'bot', message: 'Inpartner mendampingi dari target screening hingga deal structuring...' },
        { sender: 'user', message: 'Apakah mencakup valuasi DCF dan integrasi pasca akuisisi?' },
        { sender: 'bot', message: 'Tentu, tim penasihat senior kami menyediakan model valuasi...' }
      ]
    });

    assert.ok(result.score >= 70, `Expected score >= 70 for Tier 1, got ${result.score}`);
    assert.equal(result.priority_tier, 'tier_1');
    assert.ok(result.tier_label.includes('Tier 1'));
    assert.ok(result.target_sla.includes('< 2'));

    // Verify factors are detailed
    assert.ok(result.factors.length >= 6);
    const pillarFactor = result.factors.find((f) => f.factor === 'Advisory Pillar Alignment');
    assert.equal(pillarFactor?.score, 30);

    const companyFactor = result.factors.find((f) => f.factor === 'Corporate Entity Attribution');
    assert.equal(companyFactor?.score, 20);

    const domainFactor = result.factors.find((f) => f.factor === 'Corporate Domain Verification');
    assert.equal(domainFactor?.score, 15);
  });

  await t.test('Tier 1 Hot Opportunity: International foreign investor from Korea for Joint Venture', () => {
    const result = calculateLeadScore({
      name: '김민준 (Minjun Kim)',
      company: 'Seoul Green Energy Corp',
      email: 'minjun.kim@seoulenergy.kr',
      phone: '+821098765432',
      business_need: 'Cross-Border & Technology Advisory (Joint Venture & PMA Setup)',
      notes: 'We are seeking local strategic partners in Indonesia for solar IPP project development and PT PMA establishment.'
    });

    assert.ok(result.score >= 70, `Expected score >= 70 for foreign sponsor, got ${result.score}`);
    assert.equal(result.priority_tier, 'tier_1');

    const intlFactor = result.factors.find((f) => f.factor === 'International / Foreign Sponsor');
    assert.equal(intlFactor?.score, 20);
  });

  await t.test('Tier 2 Warm / Strategic Lead: Mid-market distributor search with generic Gmail', () => {
    const result = calculateLeadScore({
      name: 'Hendra Gunawan',
      company: 'Toko Sukses Sejahtera',
      email: 'hendra.gunawan99@gmail.com',
      phone: '081345678912',
      business_need: 'Market Access & Business Expansion (Distributor Identification)',
      notes: 'Mencari jaringan distributor untuk produk FMCG di wilayah Jawa Timur.'
    });

    assert.ok(result.score >= 40 && result.score < 70, `Expected score 40-69 for Tier 2, got ${result.score}`);
    assert.equal(result.priority_tier, 'tier_2');
    assert.ok(result.tier_label.includes('Tier 2'));
    assert.ok(result.target_sla.includes('< 12'));
  });

  await t.test('Tier 3 Standard Inquiry: Minimal personal inquiry with generic email and no company', () => {
    const result = calculateLeadScore({
      name: 'User Inquirer',
      company: '',
      email: 'user123@yahoo.com',
      phone: '0812345678',
      business_need: 'Informasi Umum Konsultasi',
      notes: 'Tanya info'
    });

    assert.ok(result.score < 40, `Expected score < 40 for Tier 3, got ${result.score}`);
    assert.equal(result.priority_tier, 'tier_3');
    assert.ok(result.tier_label.includes('Tier 3'));
  });

  await t.test('Score bounds: score is strictly constrained between 0 and 100', () => {
    const maxResult = calculateLeadScore({
      name: '박지훈 CEO',
      company: 'PT Samsung Global Energy Holdings Tbk (주)',
      email: 'ceo@samsungglobal.com',
      phone: '+821012345678',
      business_need: 'Strategy & Corporate Advisory (M&A and Pre-IPO) & Cross-Border Joint Venture',
      notes: 'Full multi-year strategic advisory engagement with foreign FDI capital injection of $50M USD.',
      conversation_messages: Array(10).fill({ sender: 'user', message: 'Detailed multi-turn advisory query' })
    });

    assert.ok(maxResult.score <= 100, `Max score cannot exceed 100, got ${maxResult.score}`);
    assert.equal(maxResult.score, 100);

    const minResult = calculateLeadScore({});
    assert.ok(minResult.score >= 0, `Min score cannot be less than 0, got ${minResult.score}`);
  });

  await t.test('Priority Badge helper returns valid CSS metadata', () => {
    const t1Badge = getPriorityBadgeInfo('tier_1');
    assert.ok(t1Badge.bg.includes('rose'));
    assert.ok(t1Badge.sla.includes('2h'));

    const t2Badge = getPriorityBadgeInfo('tier_2');
    assert.ok(t2Badge.bg.includes('amber'));
    assert.ok(t2Badge.sla.includes('12h'));

    const t3Badge = getPriorityBadgeInfo('tier_3');
    assert.ok(t3Badge.bg.includes('slate'));
    assert.ok(t3Badge.sla.includes('24h'));
  });

  await t.test('Integration with createLead(): automatically populates score and priority_tier', () => {
    const testLead = createLead({
      name: 'Ahmad Fauzi',
      company: 'PT Nusantara Agro Lestari',
      email: 'ahmad.fauzi@nusantara-agro.co.id',
      phone: '+6281122334455',
      business_need: 'Investment & Project Advisory (Bankable Feasibility Study)',
      notes: 'Penyusunan Feasibility Study dan Financial Model untuk pembangunan pabrik kelapa sawit baru.'
    });

    assert.ok(testLead.id);
    assert.ok(typeof testLead.score === 'number');
    assert.ok(testLead.score >= 70, `Expected Tier 1 score for corporate FS inquiry, got ${testLead.score}`);
    assert.equal(testLead.priority_tier, 'tier_1');
    assert.ok(testLead.score_breakdown);
    assert.ok(testLead.score_breakdown.factors.length >= 6);

    const retrieved = getLeadById(testLead.id);
    assert.ok(retrieved);
    assert.equal(retrieved?.score, testLead.score);
    assert.equal(retrieved?.priority_tier, testLead.priority_tier);
  });
});
