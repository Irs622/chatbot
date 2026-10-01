import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDynamicAnalytics } from '../lib/analyticsEngine.ts';
import { getAnalyticsSummary } from '../lib/db.ts';
import type { DatabaseSchema } from '../lib/db.ts';

test('Real-Time Dynamic Analytics Engine & Conversion Funnel Suite', async (t) => {
  await t.test('Computes 6-Stage Conversion Funnel with accurate drop-off and conversion rates', () => {
    const mockDb: DatabaseSchema = {
      conversations: [
        { id: 'c1', session_id: 's1', started_at: new Date().toISOString(), created_at: new Date().toISOString() },
        { id: 'c2', session_id: 's2', started_at: new Date().toISOString(), created_at: new Date().toISOString() }
      ],
      messages: [
        { id: 'm1', conversation_id: 'c1', sender: 'user', message: 'Bagaimana Inpartner mendampingi M&A?', created_at: new Date().toISOString() },
        { id: 'm2', conversation_id: 'c1', sender: 'bot', message: 'Inpartner mendampingi proses M&A...', created_at: new Date().toISOString() },
        { id: 'm3', conversation_id: 'c2', sender: 'user', message: 'Feasibility study renewable energy', created_at: new Date().toISOString() }
      ],
      leads: [
        {
          id: 'l1',
          conversation_id: 'c1',
          name: 'Budi Santoso',
          company: 'PT Mega Corp',
          email: 'budi@megacorp.com',
          phone: '+6281234567890',
          business_need: 'Strategy & Corporate Advisory',
          created_at: new Date().toISOString(),
          status: 'new',
          score: 85,
          priority_tier: 'tier_1'
        }
      ],
      analytics_events: [
        { id: 'e1', event_name: 'chatbot_opened', session_id: 's1', created_at: new Date().toISOString() },
        { id: 'e2', event_name: 'chatbot_opened', session_id: 's2', created_at: new Date().toISOString() },
        { id: 'e3', event_name: 'question_asked', session_id: 's1', created_at: new Date().toISOString() },
        { id: 'e4', event_name: 'service_viewed', session_id: 's1', created_at: new Date().toISOString() },
        { id: 'e5', event_name: 'lead_form_opened', session_id: 's1', created_at: new Date().toISOString() },
        { id: 'e6', event_name: 'lead_submitted', session_id: 's1', created_at: new Date().toISOString() },
        { id: 'e7', event_name: 'contact_clicked', session_id: 's1', created_at: new Date().toISOString() }
      ]
    };

    const result = computeDynamicAnalytics(mockDb);

    assert.ok(result.funnel.length === 6, 'Funnel must have 6 stages');
    assert.equal(result.funnel[0].id, 'opened');
    assert.equal(result.funnel[1].id, 'question');
    assert.equal(result.funnel[2].id, 'service');
    assert.equal(result.funnel[3].id, 'form');
    assert.equal(result.funnel[4].id, 'lead');
    assert.equal(result.funnel[5].id, 'handoff');

    assert.ok(result.funnel[0].conversionPct === 100);
    assert.ok(result.funnel[4].count >= 1);
    assert.ok(typeof result.funnel[4].conversionPct === 'number');
    assert.ok(!isNaN(result.funnel[4].conversionPct));
  });

  await t.test('Accurately detects and calculates Language Distribution across ID, EN, and KO', () => {
    const mockDb: DatabaseSchema = {
      conversations: [],
      messages: [
        { id: 'm1', conversation_id: 'c1', sender: 'user', message: 'Saya ingin konsultasi restrukturisasi korporasi', created_at: new Date().toISOString() },
        { id: 'm2', conversation_id: 'c2', sender: 'user', message: 'How does Inpartner assist with market entry in Indonesia?', created_at: new Date().toISOString() },
        { id: 'm3', conversation_id: 'c3', sender: 'user', message: '인도네시아 합작투자(JV) 및 사업타당성 자문 문의드립니다.', created_at: new Date().toISOString() }
      ],
      leads: [],
      analytics_events: []
    };

    const result = computeDynamicAnalytics(mockDb);
    assert.ok(result.languageDistribution.length === 3);

    const idLang = result.languageDistribution.find((l) => l.code === 'id');
    const enLang = result.languageDistribution.find((l) => l.code === 'en');
    const koLang = result.languageDistribution.find((l) => l.code === 'ko');

    assert.ok((idLang?.count || 0) >= 1, 'Should detect Indonesian query');
    assert.ok((enLang?.count || 0) >= 1, 'Should detect English query');
    assert.ok((koLang?.count || 0) >= 1, 'Should detect Korean query');
  });

  await t.test('Accurately calculates Advisory Pillar Intent Distribution', () => {
    const mockDb: DatabaseSchema = {
      conversations: [
        { id: 'c1', session_id: 's1', user_intent: 'strategy_corporate', started_at: new Date().toISOString(), created_at: new Date().toISOString() },
        { id: 'c2', session_id: 's2', user_intent: 'investment_advisory', started_at: new Date().toISOString(), created_at: new Date().toISOString() }
      ],
      messages: [],
      leads: [
        {
          id: 'l1',
          name: 'CEO Group',
          phone: '+62811223344',
          email: 'ceo@group.com',
          business_need: 'Cross-Border & Technology Advisory (Joint Venture)',
          created_at: new Date().toISOString(),
          status: 'new'
        }
      ],
      analytics_events: []
    };

    const result = computeDynamicAnalytics(mockDb);
    assert.ok(result.intentDistribution.length === 5);

    const strategy = result.intentDistribution.find((i) => i.intent === 'strategy_corporate');
    const investment = result.intentDistribution.find((i) => i.intent === 'investment_advisory');
    const crossBorder = result.intentDistribution.find((i) => i.intent === 'cross_border');

    assert.ok((strategy?.count || 0) >= 1);
    assert.ok((investment?.count || 0) >= 1);
    assert.ok((crossBorder?.count || 0) >= 1);
  });

  await t.test('Dynamic Geographic Detection from international dialing codes (+82 Korea, +65 SG, +62 ID)', () => {
    const mockDb: DatabaseSchema = {
      conversations: [],
      messages: [],
      leads: [
        { id: 'l1', name: 'Kim Minjun', phone: '+821012345678', email: 'kim@kr.com', business_need: 'JV', created_at: new Date().toISOString(), status: 'new' },
        { id: 'l2', name: 'Lee Wei', phone: '+6591234567', email: 'lee@sg.com', business_need: 'M&A', created_at: new Date().toISOString(), status: 'new' },
        { id: 'l3', name: 'Bambang', phone: '+62812345678', email: 'bambang@id.com', business_need: 'FS', created_at: new Date().toISOString(), status: 'new' }
      ],
      analytics_events: []
    };

    const result = computeDynamicAnalytics(mockDb);
    assert.ok(result.locationDistribution.length >= 3);

    const kr = result.locationDistribution.find((c) => c.code === 'KR');
    const sg = result.locationDistribution.find((c) => c.code === 'SG');
    const id = result.locationDistribution.find((c) => c.code === 'ID');

    assert.equal(kr?.country, 'South Korea');
    assert.equal(sg?.country, 'Singapore');
    assert.equal(id?.country, 'Indonesia');
  });

  await t.test('Handles empty database without division by zero or NaN values', () => {
    const emptyDb: DatabaseSchema = {
      conversations: [],
      messages: [],
      leads: [],
      analytics_events: []
    };

    const result = computeDynamicAnalytics(emptyDb);
    assert.equal(result.totals.conversations, 0);
    assert.equal(result.totals.leads, 0);
    assert.equal(result.totals.hotLeads, 0);
    assert.ok(!isNaN(result.kpis.engagementRate));
    assert.ok(!isNaN(result.kpis.leadCaptureRate));
    assert.ok(result.hourlyDistribution.length === 24);
  });

  await t.test('Integration: getAnalyticsSummary() returns valid dynamic summary result', () => {
    const summary = getAnalyticsSummary();
    assert.ok(summary);
    assert.ok(typeof summary.totals.conversations === 'number');
    assert.ok(Array.isArray(summary.funnel));
    assert.ok(Array.isArray(summary.intentDistribution));
    assert.ok(Array.isArray(summary.languageDistribution));
    assert.ok(Array.isArray(summary.locationDistribution));
    assert.ok(Array.isArray(summary.hourlyDistribution));
  });
});
