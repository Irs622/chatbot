import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAllKnowledgeChunks, retrieveKnowledge } from '../lib/rag.ts';

test('RAG Knowledge Retrieval Engine Suite', async (t) => {
  await t.test('loadAllKnowledgeChunks loads chunks across all categories', () => {
    const chunks = loadAllKnowledgeChunks();
    assert.ok(chunks.length > 5, `Expected multiple knowledge chunks, got ${chunks.length}`);

    const categories = new Set(chunks.map((c) => c.category));
    assert.ok(categories.has('services'), 'Must include services category');
    assert.ok(categories.has('company'), 'Must include company category');
    assert.ok(categories.has('contact'), 'Must include contact category');
    assert.ok(categories.has('faq'), 'Must include faq category');
    assert.ok(categories.has('sectors'), 'Must include sectors category');
    assert.ok(categories.has('projects'), 'Must include projects category');

    for (const chunk of chunks) {
      assert.ok(chunk.id, 'Chunk must have an ID');
      assert.ok(chunk.title, 'Chunk must have a title');
      assert.ok(chunk.content.length > 0, 'Chunk content must not be empty');
      assert.ok(Array.isArray(chunk.keywords), 'Keywords must be an array');
    }
  });

  await t.test('Retrieves relevant Strategy chunk for M&A and restructuring queries', () => {
    const results = retrieveKnowledge('Kami berencana melakukan restrukturisasi korporasi dan merger akuisisi', 3);
    assert.ok(results.length > 0);
    const topResult = results[0];
    assert.ok(topResult.score > 0);
    const titles = results.map((r) => r.title.toLowerCase()).join(' ');
    assert.ok(
      titles.includes('strategy') || titles.includes('corporate') || titles.includes('advisory'),
      `Expected strategy related chunk in top results, got: ${titles}`
    );
  });

  await t.test('Retrieves Investment Advisory chunk for feasibility study inquiries', () => {
    const results = retrieveKnowledge('Feasibility study dan analisis kelayakan investasi proyek', 3);
    assert.ok(results.length > 0);
    const titles = results.map((r) => r.title.toLowerCase()).join(' ');
    assert.ok(
      titles.includes('investment') || titles.includes('feasibility') || titles.includes('project'),
      `Expected investment/project related chunk, got: ${titles}`
    );
  });

  await t.test('Retrieves Market Access chunk for market entry and distributor searches', () => {
    const results = retrieveKnowledge('Strategi market entry dan mencari mitra distributor di Indonesia', 3);
    assert.ok(results.length > 0);
    const titles = results.map((r) => r.title.toLowerCase()).join(' ');
    assert.ok(
      titles.includes('market') || titles.includes('expansion') || titles.includes('access'),
      `Expected market access chunk, got: ${titles}`
    );
  });

  await t.test('Retrieves Human Capital chunk for executive search and leadership coaching', () => {
    const results = retrieveKnowledge('Layanan executive search dan program The Executive Business Program', 3);
    assert.ok(results.length > 0);
    const titles = results.map((r) => r.title.toLowerCase()).join(' ');
    assert.ok(
      titles.includes('human') || titles.includes('capital') || titles.includes('organization'),
      `Expected human capital chunk, got: ${titles}`
    );
  });

  await t.test('Retrieves Contact chunk for office address inquiries', () => {
    const results = retrieveKnowledge('Di mana alamat kantor Pakuwon Tower dan nomor kontak resmi?', 3);
    assert.ok(results.length > 0);
    const titles = results.map((r) => r.title.toLowerCase()).join(' ');
    assert.ok(
      titles.includes('contact') || titles.includes('office') || titles.includes('hubungi') || titles.includes('faq'),
      `Expected contact or faq chunk, got: ${titles}`
    );
  });

  await t.test('Handles empty and whitespace-only queries gracefully without throwing', () => {
    const emptyRes = retrieveKnowledge('', 3);
    assert.ok(Array.isArray(emptyRes));
    assert.equal(emptyRes.length, 3);

    const spaceRes = retrieveKnowledge('    ', 2);
    assert.ok(Array.isArray(spaceRes));
    assert.equal(spaceRes.length, 2);
  });
});
