import test from 'node:test';
import assert from 'node:assert/strict';
import { detectIntent } from '../lib/intent.ts';
import { retrieveKnowledge } from '../lib/rag.ts';
import { validatePhoneNumber, validateEmail } from '../lib/validation.ts';
import {
  getOrCreateConversation,
  addMessage,
  createLead,
  getLeadById,
  updateLeadStatus,
  deleteLead
} from '../lib/db.ts';
import { INPARTNER_CONFIG } from '../lib/config.ts';

test('End-to-End Client Consultation Lifecycle Simulation', async (t) => {
  const sessionId = `sim_session_${Date.now()}`;
  let convId = '';
  let leadId = '';

  await t.test('Step 1: User asks consultation question and system identifies intent', () => {
    const userQuery = 'Perusahaan kami ingin melakukan ekspansi pasar dan mencari mitra distributor di Jawa Timur';
    const intentResult = detectIntent(userQuery);

    assert.equal(intentResult.intent, 'market_access');
    assert.ok(intentResult.confidence >= 0.5);
    assert.ok(intentResult.matchedKeywords.length > 0);
  });

  await t.test('Step 2: RAG retrieves grounded market access advisory chunks', () => {
    const userQuery = 'Perusahaan kami ingin melakukan ekspansi pasar dan mencari mitra distributor di Jawa Timur';
    const chunks = retrieveKnowledge(userQuery, 3);

    assert.ok(chunks.length > 0);
    const topChunk = chunks[0];
    assert.ok(topChunk.score > 0);
    const titles = chunks.map((c) => c.title.toLowerCase()).join(' ');
    assert.ok(titles.includes('market') || titles.includes('access') || titles.includes('expansion'));
  });

  await t.test('Step 3: Conversation session is initiated and message logged in CRM', () => {
    const conv = getOrCreateConversation(sessionId, 'market_access');
    convId = conv.id;
    assert.ok(convId.startsWith('conv_'));

    const userMsg = addMessage({
      conversation_id: convId,
      sender: 'user',
      message: 'Perusahaan kami ingin melakukan ekspansi pasar dan mencari mitra distributor di Jawa Timur',
      intent: 'market_access'
    });
    assert.equal(userMsg.conversation_id, convId);

    const botMsg = addMessage({
      conversation_id: convId,
      sender: 'bot',
      message: 'Inpartner mendampingi formulasi Go-To-Market (GTM) dan fasilitasi business matching...',
      metadata: {
        recommended_service: 'Market Access & Business Expansion',
        suggest_lead_capture: true
      }
    });
    assert.equal(botMsg.metadata?.suggest_lead_capture, true);
  });

  await t.test('Step 4: Lead form submission with validation and CRM capture', () => {
    const rawLeadInput = {
      name: 'Dewi Sartika',
      company: 'PT Global Niaga Sejahtera',
      email: 'dewi.s@globalniaga.co.id',
      phone: '+62 859 3454 8202',
      business_need: 'Market Access & Business Expansion',
      notes: 'Membutuhkan jaringan distributor FMCG untuk ekspansi ke 10 kota'
    };

    // Form validation
    const phoneVal = validatePhoneNumber(rawLeadInput.phone);
    assert.equal(phoneVal.isValid, true);
    assert.equal(phoneVal.cleanPhone, '085934548202');

    const emailVal = validateEmail(rawLeadInput.email);
    assert.equal(emailVal, true);

    // Save lead in CRM linked to conversation
    const savedLead = createLead({
      conversation_id: convId,
      name: rawLeadInput.name,
      company: rawLeadInput.company,
      email: rawLeadInput.email,
      phone: phoneVal.cleanPhone,
      business_need: rawLeadInput.business_need,
      notes: rawLeadInput.notes
    });

    leadId = savedLead.id;
    assert.ok(leadId.startsWith('lead_'));
    assert.equal(savedLead.status, 'new');
    assert.equal(savedLead.conversation_id, convId);
  });

  await t.test('Step 5: Corporate Consultant Follow-up workflow', () => {
    const lead = getLeadById(leadId);
    assert.ok(lead !== null);
    assert.equal(lead?.name, 'Dewi Sartika');

    // Consultant updates status to contacted after WhatsApp introduction
    const updated = updateLeadStatus(
      leadId,
      'contacted',
      `Telah dihubungi melalui WhatsApp resmi ${INPARTNER_CONFIG.whatsappDisplay}`
    );
    assert.equal(updated?.status, 'contacted');
    assert.match(updated?.notes || '', /859\s*3454\s*8202/);

    // Cleanup simulation lead
    const deleted = deleteLead(leadId);
    assert.equal(deleted, true);
  });
});
