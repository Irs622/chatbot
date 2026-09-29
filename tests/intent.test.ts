import test from 'node:test';
import assert from 'node:assert/strict';
import { detectIntent, getAllSupportedIntents } from '../lib/intent.ts';

test('Intent Recognition & Multilingual NLP Suite', async (t) => {
  await t.test('Supported intents list contains all official 5 services plus utility intents', () => {
    const intents = getAllSupportedIntents();
    assert.ok(intents.includes('strategy_corporate'));
    assert.ok(intents.includes('investment_advisory'));
    assert.ok(intents.includes('market_access'));
    assert.ok(intents.includes('cross_border'));
    assert.ok(intents.includes('human_capital'));
    assert.ok(intents.includes('company_information'));
    assert.ok(intents.includes('contact'));
    assert.ok(intents.includes('unknown'));
  });

  await t.test('Service 1: Strategy & Corporate Advisory recognition across languages', () => {
    // Indonesian
    const idRes1 = detectIntent('Kami membutuhkan pendampingan restrukturisasi korporasi dan M&A');
    assert.equal(idRes1.intent, 'strategy_corporate');
    assert.ok(idRes1.confidence >= 0.5);

    const idRes2 = detectIntent('Perusahaan kami bersiap untuk go public dan IPO di bursa efek');
    assert.equal(idRes2.intent, 'strategy_corporate');

    // English
    const enRes1 = detectIntent('We want advisory on corporate strategy and business transformation');
    assert.equal(enRes1.intent, 'strategy_corporate');
    assert.ok(enRes1.confidence >= 0.5);

    const enRes2 = detectIntent('Can you help with post-merger integration and strategic planning?');
    assert.equal(enRes2.intent, 'strategy_corporate');

    // Korean
    const koRes = detectIntent('기업 전략 및 M&A 인수합병 자문이 필요합니다');
    assert.equal(koRes.intent, 'strategy_corporate');
  });

  await t.test('Service 2: Investment & Project Advisory recognition across languages', () => {
    // Indonesian
    const idRes1 = detectIntent('Kami membutuhkan feasibility study untuk proyek energi baru terbarukan');
    assert.equal(idRes1.intent, 'investment_advisory');

    const idRes2 = detectIntent('Bagaimana analisis komersial dan valuasi finansial untuk investasi pabrik?');
    assert.equal(idRes2.intent, 'investment_advisory');

    // English
    const enRes = detectIntent('We need an independent commercial feasibility study and financial valuation');
    assert.equal(enRes.intent, 'investment_advisory');

    // Korean
    const koRes = detectIntent('프로젝트 사업타당성 연구와 투자 자문을 요청합니다');
    assert.equal(koRes.intent, 'investment_advisory');
  });

  await t.test('Service 3: Market Access & Business Expansion recognition across languages', () => {
    // Indonesian
    const idRes1 = detectIntent('Kami butuh riset pasar dan mencari distributor untuk penetrasi pasar Indonesia');
    assert.equal(idRes1.intent, 'market_access');

    const idRes2 = detectIntent('Apakah Inpartner menyediakan layanan business matching dengan calon pembeli?');
    assert.equal(idRes2.intent, 'market_access');

    // English
    const enRes = detectIntent('We want to formulate a Go-To-Market strategy and find local distributor partners');
    assert.equal(enRes.intent, 'market_access');

    // Korean
    const koRes = detectIntent('신규 시장 진입 전략 및 비즈니스 매칭 파트너 발굴이 필요합니다');
    assert.equal(koRes.intent, 'market_access');
  });

  await t.test('Service 4: Cross-Border & Technology Advisory recognition across languages', () => {
    // Indonesian
    const idRes1 = detectIntent('Kami mencari mitra lokal Indonesia untuk joint venture aliansi strategis');
    assert.equal(idRes1.intent, 'cross_border');

    const idRes2 = detectIntent('Perusahaan asing kami ingin alih teknologi (technology transfer) ke Asia Tenggara');
    assert.equal(idRes2.intent, 'cross_border');

    // English
    const enRes = detectIntent('Looking for cross-border strategic partnership and joint venture setup in Indonesia');
    assert.equal(enRes.intent, 'cross_border');

    // Korean
    const koRes = detectIntent('해외 기업과의 기술이전 및 크로스보더 합작투자(JV) 자문이 필요합니다');
    assert.equal(koRes.intent, 'cross_border');
  });

  await t.test('Service 5: Human Capital & Organization recognition across languages', () => {
    // Indonesian
    const idRes1 = detectIntent('Kami mencari kandidat Direktur Keuangan melalui executive search headhunting');
    assert.equal(idRes1.intent, 'human_capital');

    const idRes2 = detectIntent('Ingin mendaftarkan jajaran direksi ke The Executive Business Program');
    assert.equal(idRes2.intent, 'human_capital');

    // English
    const enRes = detectIntent('We need executive search for C-level leadership and organization development');
    assert.equal(enRes.intent, 'human_capital');

    // Korean
    const koRes = detectIntent('경영진 임원 채용 및 C-Level 역량 강화 교육 프로그램 문의');
    assert.equal(koRes.intent, 'human_capital');
  });

  await t.test('Contact & Office Location recognition', () => {
    const res1 = detectIntent('Di mana alamat kantor Inpartner di Jakarta?');
    assert.equal(res1.intent, 'contact');

    const res2 = detectIntent('Nomor telepon dan WhatsApp resmi Inpartner berapa?');
    assert.equal(res2.intent, 'contact');

    const res3 = detectIntent('Where is your corporate headquarters located?');
    assert.equal(res3.intent, 'contact');
  });

  await t.test('Company profile & history recognition', () => {
    const res1 = detectIntent('Siapa pendiri dan bagaimana sejarah berdirinya PT Inpartner Optima Integra?');
    assert.equal(res1.intent, 'company_information');

    const res2 = detectIntent('Tell me about Inpartner company profile, vision and mission');
    assert.equal(res2.intent, 'company_information');
  });

  await t.test('Ambiguous / Gibberish queries return unknown or other with low confidence', () => {
    const gibberish = detectIntent('asdfghjklqwerty zxcvbnm');
    assert.equal(gibberish.intent, 'unknown');
    assert.ok(gibberish.confidence <= 0.2);

    const greeting = detectIntent('Halo selamat pagi');
    assert.ok(greeting.intent === 'unknown' || greeting.confidence < 0.5);
  });
});
