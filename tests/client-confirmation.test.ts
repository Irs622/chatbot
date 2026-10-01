import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateConsultationRef,
  generateClientWhatsAppUrl,
  buildClientConfirmationEmailContent,
  sendClientConfirmationEmail
} from '../lib/notifications.ts';
import type { Lead } from '../lib/db.ts';

test('Automated Client Inbound Receipt Confirmation & WhatsApp Handoff Suite', async (t) => {
  await t.test('generateConsultationRef: generates valid institutional code with YYYYMMDD and suffix', () => {
    const fixedDate = new Date('2026-10-15T10:30:00Z');
    const refWithId = generateConsultationRef('lead_abc123xyz890', fixedDate);

    assert.ok(refWithId.startsWith('INP-20261015-'));
    assert.equal(refWithId, 'INP-20261015-Z890');

    // Without lead ID, should generate a 4-character alphanumeric suffix
    const refRandom = generateConsultationRef(undefined, fixedDate);
    assert.match(refRandom, /^INP-20261015-[A-Z0-9]{4}$/);

    // Default date should use current day
    const refNow = generateConsultationRef();
    assert.match(refNow, /^INP-\d{8}-[A-Z0-9]{4}$/);
  });

  await t.test('generateClientWhatsAppUrl: builds official deep link with encoded reference code in Indonesian', () => {
    const lead = {
      name: 'Budi Santoso',
      business_need: 'Strategy & Corporate Advisory'
    };
    const refCode = 'INP-20261015-X890';
    const waUrl = generateClientWhatsAppUrl(lead, refCode, 'id');

    assert.ok(waUrl.startsWith('https://wa.me/6285934548202?text='));
    const decoded = decodeURIComponent(waUrl.replace('https://wa.me/6285934548202?text=', ''));

    assert.ok(decoded.includes('Halo tim penasihat Inpartner'));
    assert.ok(decoded.includes('Budi Santoso'));
    assert.ok(decoded.includes(refCode));
    assert.ok(decoded.includes('Strategy & Corporate Advisory'));
  });

  await t.test('generateClientWhatsAppUrl: builds localized English and Korean pre-filled messages', () => {
    const enLead = { name: 'Sarah Jenkins', business_need: 'Cross-Border Advisory' };
    const enRef = 'INP-20261015-E111';
    const enUrl = generateClientWhatsAppUrl(enLead, enRef, 'en');
    const enDecoded = decodeURIComponent(enUrl.replace('https://wa.me/6285934548202?text=', ''));

    assert.ok(enDecoded.includes('Hello Inpartner Advisory Team'));
    assert.ok(enDecoded.includes('Sarah Jenkins'));
    assert.ok(enDecoded.includes(enRef));

    const koLead = { name: '김민준', business_need: 'Market Access & Business Expansion' };
    const koRef = 'INP-20261015-K222';
    const koUrl = generateClientWhatsAppUrl(koLead, koRef, 'ko');
    const koDecoded = decodeURIComponent(koUrl.replace('https://wa.me/6285934548202?text=', ''));

    assert.ok(koDecoded.includes('안녕하세요 인파트너 자문팀'));
    assert.ok(koDecoded.includes('김민준'));
    assert.ok(koDecoded.includes(koRef));
  });

  await t.test('buildClientConfirmationEmailContent: creates compliant Indonesian institutional receipt', () => {
    const lead: Lead = {
      id: 'lead_test_001',
      name: 'Aditya Pratama',
      company: 'PT Nusantara Solusi Prima',
      email: 'aditya@nusantara.co.id',
      phone: '+628123456789',
      business_need: 'Investment & Project Advisory (Studi Kelayakan FS)',
      notes: 'Rencana ekspansi pabrik baru di Cikarang seluas 5 hektar.',
      score: 85,
      priority_tier: 'tier_1',
      score_breakdown: {
        score: 85,
        priority_tier: 'tier_1',
        tier_label: 'Tier 1 - High Priority Hot Lead',
        target_sla: '< 2 Jam Kerja',
        factors: []
      },
      created_at: new Date().toISOString(),
      status: 'new'
    };

    const email = buildClientConfirmationEmailContent(lead, { lang: 'id', refCode: 'INP-20261015-T001' });

    assert.equal(email.refCode, 'INP-20261015-T001');
    assert.equal(email.lang, 'id');
    assert.ok(email.subject.includes('[INPARTNER] Konfirmasi Penerimaan Konsultasi Bisnis'));
    assert.ok(email.subject.includes('INP-20261015-T001'));

    // HTML Content Validation
    assert.ok(email.html.includes('Yth. Bapak/Ibu Aditya Pratama'));
    assert.ok(email.html.includes('PT Nusantara Solusi Prima'));
    assert.ok(email.html.includes('INP-20261015-T001'));
    assert.ok(email.html.includes('Pakuwon Tower, Unit J, Lantai 10'));
    assert.ok(email.html.includes('Jl. Raya Casablanca Kav. 88, Jakarta Selatan 12870'));
    assert.ok(email.html.includes('&lt; 2 Jam Kerja'));
    assert.ok(email.html.includes('https://wa.me/6285934548202?text='));
    assert.ok(email.html.includes('Mutual NDA'));
  });

  await t.test('buildClientConfirmationEmailContent: creates compliant English receipt for multinational client', () => {
    const lead: Lead = {
      id: 'lead_test_002',
      name: 'David Sterling',
      company: 'Sterling Global Ventures Ltd',
      email: 'd.sterling@sterlingglobal.com',
      phone: '+447911123456',
      business_need: 'Cross-Border & Technology Advisory',
      score: 90,
      priority_tier: 'tier_1',
      score_breakdown: {
        score: 90,
        priority_tier: 'tier_1',
        tier_label: 'Tier 1 - High Priority Hot Lead',
        target_sla: '< 2 Jam Kerja',
        factors: []
      },
      created_at: new Date().toISOString(),
      status: 'new'
    };

    const email = buildClientConfirmationEmailContent(lead, { lang: 'en', refCode: 'INP-20261015-ENG1' });

    assert.equal(email.lang, 'en');
    assert.ok(email.subject.includes('[INPARTNER] Official Consultation Inquiry Receipt'));
    assert.ok(email.html.includes('Dear David Sterling,'));
    assert.ok(email.html.includes('Sterling Global Ventures Ltd'));
    assert.ok(email.html.includes('Exploratory Diagnostic Session'));
    assert.ok(email.html.includes('Pakuwon Tower, Unit J, Lantai 10'));
    assert.ok(email.html.includes('Non-Disclosure Agreement (NDA) standards'));
  });

  await t.test('buildClientConfirmationEmailContent: creates compliant Korean receipt for East Asian investment sponsor', () => {
    const lead: Lead = {
      id: 'lead_test_003',
      name: '박지훈',
      company: '한국 신재생에너지 인프라',
      email: 'jhpark@korean-energy.kr',
      phone: '+821012345678',
      business_need: 'Investment & Project Advisory',
      status: 'new',
      created_at: new Date().toISOString()
    };

    const email = buildClientConfirmationEmailContent(lead, { lang: 'ko', refCode: 'INP-20261015-KOR1' });

    assert.equal(email.lang, 'ko');
    assert.ok(email.subject.includes('[INPARTNER] 경영 자문 상담 접수 확인 안내'));
    assert.ok(email.html.includes('박지훈 귀하,'));
    assert.ok(email.html.includes('한국 신재생에너지 인프라'));
    assert.ok(email.html.includes('접수 내역 요약'));
    assert.ok(email.html.includes('비밀유지협약(Mutual NDA)'));
  });

  await t.test('sendClientConfirmationEmail: guards against missing email or unconfigured Resend credentials', async () => {
    // 1. Missing email
    const noEmailLead: Lead = {
      id: 'lead_no_email',
      name: 'Tanpa Email',
      email: '',
      phone: '08123456789',
      business_need: 'General Advisory',
      status: 'new',
      created_at: new Date().toISOString()
    };

    const noEmailResult = await sendClientConfirmationEmail(noEmailLead);
    assert.equal(noEmailResult.success, false);
    assert.equal(noEmailResult.error, 'No client email provided');

    // 2. Missing RESEND_API_KEY environment variable (when unset)
    const originalKey = process.env.RESEND_API_KEY;
    try {
      delete process.env.RESEND_API_KEY;
      const leadWithEmail: Lead = {
        id: 'lead_with_email',
        name: 'Ada Email',
        email: 'client@example.com',
        phone: '08123456789',
        business_need: 'General Advisory',
        status: 'new',
        created_at: new Date().toISOString()
      };
      const noKeyResult = await sendClientConfirmationEmail(leadWithEmail);
      assert.equal(noKeyResult.success, false);
      assert.ok(noKeyResult.error?.includes('RESEND_API_KEY environment variable not configured'));
    } finally {
      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      }
    }
  });
});
