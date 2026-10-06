import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientIp, checkRateLimit } from '../lib/rateLimit.ts';
import { isAdminAuthenticated, generateAdminSessionToken, ADMIN_COOKIE_NAME } from '../lib/auth.ts';
import { loadAllKnowledgeChunks } from '../lib/rag.ts';
import chatHandler from '../src/pages/api/chat.ts';
import leadsHandler from '../src/pages/api/leads.ts';

// Mock Node.js NextApiRequest and NextApiResponse helpers
function createMockRequest(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  socketRemoteAddress?: string;
}) {
  const listeners: Record<string, (() => void)[]> = {};
  return {
    method: options.method || 'GET',
    body: options.body || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    socket: { remoteAddress: options.socketRemoteAddress || '127.0.0.1' },
    on(event: string, cb: () => void) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }
  } as any;
}

function createMockResponse() {
  const headers: Record<string, string | string[]> = {};
  let statusCode = 200;
  let bodyData = '';
  let ended = false;
  const writtenChunks: string[] = [];

  const res = {
    statusCode,
    headersSent: false,
    setHeader(key: string, val: string | string[]) {
      headers[key.toLowerCase()] = val;
    },
    getHeader(key: string) {
      return headers[key.toLowerCase()];
    },
    status(code: number) {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    write(chunk: any) {
      res.headersSent = true;
      writtenChunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
      return true;
    },
    json(data: any) {
      res.headersSent = true;
      bodyData = JSON.stringify(data);
      ended = true;
      return res;
    },
    end(finalChunk?: any) {
      if (finalChunk) {
        writtenChunks.push(typeof finalChunk === 'string' ? finalChunk : finalChunk.toString());
      }
      res.headersSent = true;
      ended = true;
      return res;
    },
    getWrittenChunks: () => writtenChunks,
    getResponseBody: () => (bodyData ? JSON.parse(bodyData) : null),
    isEnded: () => ended,
    getStatusCode: () => statusCode
  };

  return res as any;
}

test('Next.js Pages Router Adapter & Dual-Runtime Compatibility Suite', async (t) => {
  await t.test('getClientIp: extracts IP correctly from Node/Express req.headers object', () => {
    // 1. Cloudflare header
    const reqCF = createMockRequest({ headers: { 'cf-connecting-ip': '203.0.113.195' } });
    assert.equal(getClientIp(reqCF), '203.0.113.195');

    // 2. X-Forwarded-For header with multiple hops
    const reqXFF = createMockRequest({ headers: { 'x-forwarded-for': '198.51.100.42, 10.0.0.1' } });
    assert.equal(getClientIp(reqXFF), '198.51.100.42');

    // 3. Socket remoteAddress fallback
    const reqSocket = createMockRequest({ socketRemoteAddress: '192.168.1.100' });
    assert.equal(getClientIp(reqSocket), '192.168.1.100');
  });

  await t.test('isAdminAuthenticated: authenticates with Pages Router plain req.cookies object', () => {
    const validToken = generateAdminSessionToken();
    const reqAuth = createMockRequest({ cookies: { [ADMIN_COOKIE_NAME]: validToken } });
    assert.equal(isAdminAuthenticated(reqAuth), true);

    const reqUnauth = createMockRequest({ cookies: {} });
    assert.equal(isAdminAuthenticated(reqUnauth), false);
  });

  await t.test('RAG Knowledge: loads and indexes canonical knowledge from src/chatbot/knowledge', () => {
    const chunks = loadAllKnowledgeChunks();
    assert.ok(chunks.length > 0, 'Knowledge chunks must not be empty');

    // Must index corporate strategy and cross border topics
    const hasStrategy = chunks.some((c) => c.category === 'services' || c.content.includes('Strategy'));
    assert.ok(hasStrategy, 'Strategy practice must be indexed');

    const hasPMA = chunks.some((c) => c.content.includes('PMA') || c.content.includes('Korea'));
    assert.ok(hasPMA, 'Cross-border Korea / PMA regulations must be indexed');
  });

  await t.test('Pages Router /api/leads: rejects non-POST/GET methods with 405', async () => {
    const req = createMockRequest({ method: 'PUT' });
    const res = createMockResponse();

    await leadsHandler(req, res);
    assert.equal(res.getStatusCode(), 405);
  });

  await t.test('Pages Router /api/leads: accepts PRD-formatted lead submission and returns leadId', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        name: 'Kim Min-soo',
        email: 'minsoo@example.kr',
        phone: '+82 10 1234 5678',
        company: 'Seoul Green Tech Ltd',
        country: 'South Korea',
        serviceInterest: 'Market Expansion & Investment',
        diagnosticScore: {
          strategy: 80,
          finance: 65
        },
        utm: {
          source: 'google',
          campaign: 'korea-expansion'
        }
      }
    });
    const res = createMockResponse();

    await leadsHandler(req, res);
    assert.equal(res.getStatusCode(), 201);
    const body = res.getResponseBody();
    assert.equal(body.success, true);
    assert.ok(body.leadId, 'Response must include leadId according to PRD');
    assert.ok(body.scoreCategory, 'Response must include scoreCategory');
    assert.ok(body.ref_code, 'Response must include ref_code');
    assert.match(body.message, /Lead successfully recorded/i);
  });

  await t.test('Pages Router /api/chat: rejects non-POST methods with 405', async () => {
    const req = createMockRequest({ method: 'GET' });
    const res = createMockResponse();

    await chatHandler(req, res);
    assert.equal(res.getStatusCode(), 405);
  });

  await t.test('Pages Router /api/chat: sets SSE headers and streams consultation chunks', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        messages: [
          { role: 'user', content: 'Bagaimana prosedur mendirikan PMA di Indonesia untuk perusahaan Korea?' }
        ],
        locale: 'id',
        sessionId: `test_sess_${Date.now()}`
      }
    });
    const res = createMockResponse();

    await chatHandler(req, res);
    assert.equal(res.getHeader('content-type'), 'text/event-stream; charset=utf-8');
    assert.equal(res.getHeader('cache-control'), 'no-cache, no-transform');
    assert.equal(res.getHeader('connection'), 'keep-alive');
    assert.equal(res.getHeader('x-accel-buffering'), 'no');

    const chunks = res.getWrittenChunks();
    assert.ok(chunks.length > 0, 'Must have written SSE data chunks');
    assert.ok(chunks.some((c: string) => c.startsWith('data: ')), 'Chunks must adhere to SSE data format');
    assert.equal(res.isEnded(), true, 'Response must be closed with res.end()');
  });
});

