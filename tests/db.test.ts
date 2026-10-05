import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
  getOrCreateConversation,
  addMessage,
  getMessagesByConversationId,
  logAnalyticsEvent,
  getAnalyticsSummary
} from '../lib/db.ts';
import { isSupabaseConfigured, checkSupabaseHealth } from '../lib/supabaseClient.ts';

test('Database, CRM & Analytics Engine Suite', async (t) => {
  const testSessionId = `test_sess_${Date.now()}`;
  let createdLeadId = '';
  let createdConvId = '';

  await t.test('Conversation session creation and message appending', () => {
    const conv = getOrCreateConversation(testSessionId, 'strategy_corporate');
    assert.ok(conv.id.startsWith('conv_'));
    assert.equal(conv.session_id, testSessionId);
    assert.equal(conv.user_intent, 'strategy_corporate');
    createdConvId = conv.id;

    // Retrieve same conversation with same sessionId
    const sameConv = getOrCreateConversation(testSessionId);
    assert.equal(sameConv.id, conv.id);

    // Add user message
    const msg1 = addMessage({
      conversation_id: conv.id,
      sender: 'user',
      message: 'Kami ingin konsultasi strategi restrukturisasi'
    });
    assert.ok(msg1.id.startsWith('msg_'));
    assert.equal(msg1.conversation_id, conv.id);

    // Add bot response message
    const msg2 = addMessage({
      conversation_id: conv.id,
      sender: 'bot',
      message: 'Tentu, Inpartner mendampingi restrukturisasi korporasi...',
      metadata: { recommended_service: 'Strategy & Corporate Advisory' }
    });
    assert.ok(msg2.id.startsWith('msg_'));

    // Verify messages retrieved
    const messages = getMessagesByConversationId(conv.id);
    assert.equal(messages.length >= 2, true);
    assert.equal(messages[0].sender, 'user');
    assert.equal(messages[1].sender, 'bot');
  });

  await t.test('Lead creation, retrieval, status updates and deletion', () => {
    const leadData = {
      conversation_id: createdConvId,
      name: 'Rudi Hermawan',
      company: 'PT Nusantara Agro Lestari',
      email: 'rudi.h@nusantaraagro.co.id',
      phone: '085934548202',
      business_need: 'Strategy & Corporate Advisory',
      notes: 'Ekspansi perkebunan dan rencana merger dengan mitra strategis'
    };

    const newLead = createLead(leadData);
    assert.ok(newLead.id.startsWith('lead_'));
    assert.equal(newLead.name, leadData.name);
    assert.equal(newLead.status, 'new');
    createdLeadId = newLead.id;

    // Retrieve by ID
    const fetchedLead = getLeadById(createdLeadId);
    assert.ok(fetchedLead !== null);
    assert.equal(fetchedLead?.company, 'PT Nusantara Agro Lestari');

    // Update status to 'contacted'
    const updated = updateLeadStatus(createdLeadId, 'contacted', 'Sudah dijadwalkan sesi diagnostik zoom');
    assert.equal(updated?.status, 'contacted');
    assert.equal(updated?.notes, 'Sudah dijadwalkan sesi diagnostik zoom');

    // Verify list includes updated lead
    const allLeads = getAllLeads();
    const found = allLeads.find((l) => l.id === createdLeadId);
    assert.equal(found?.status, 'contacted');

    // Clean up test lead
    const deleted = deleteLead(createdLeadId);
    assert.equal(deleted, true);
    assert.equal(getLeadById(createdLeadId), null);
  });

  await t.test('Analytics event tracking and summary generation', () => {
    logAnalyticsEvent({
      event_name: 'chatbot_opened',
      session_id: testSessionId
    });

    logAnalyticsEvent({
      event_name: 'service_viewed',
      session_id: testSessionId,
      metadata: { service: 'Strategy & Corporate Advisory' }
    });

    const summary = getAnalyticsSummary();
    assert.ok(summary.totals.conversations >= 1);
    assert.ok(summary.totals.messages >= 1);
    assert.ok(summary.totals.events >= 1);
    assert.ok(Array.isArray(summary.hourlyDistribution));
    assert.equal(summary.hourlyDistribution.length, 24);
  });

  await t.test('Supabase client configuration and health verification', async () => {
    // When environment variables are set, isSupabaseConfigured() must be true
    assert.equal(typeof isSupabaseConfigured(), 'boolean');
    if (isSupabaseConfigured()) {
      const health = await checkSupabaseHealth();
      assert.equal(health.configured, true);
      assert.equal(health.ok, true);
      assert.ok(typeof health.latencyMs === 'number');
    }
  });
});
