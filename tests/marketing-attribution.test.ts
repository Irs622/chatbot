import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseUtmParameters,
  captureMarketingAttribution,
  getPersistedAttribution,
  formatAttributionBadge,
  ATTRIBUTION_STORAGE_KEY
} from '../lib/attribution.ts';
import type { AttributionData } from '../lib/attribution.ts';
import { createLead, getAllLeads } from '../lib/db.ts';
import { generateLeadsCsv } from '../lib/exportCsv.ts';

// In-memory Mock Storage for unit tests
class MockStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

test('Marketing Attribution & UTM Campaign Telemetry Tracking Suite', async (t) => {
  await t.test('UTM Parameter Parser: Extracts and sanitizes query parameters from full URL and query string', () => {
    // Standard full URL with all UTM parameters
    const url = 'https://inpartner.id/advisory?utm_source=linkedin&utm_medium=cpc&utm_campaign=q4_corporate_restructuring&utm_term=ma_advisory&utm_content=carousel_v2&other_param=123';
    const parsed = parseUtmParameters(url);

    assert.equal(parsed.utm_source, 'linkedin');
    assert.equal(parsed.utm_medium, 'cpc');
    assert.equal(parsed.utm_campaign, 'q4_corporate_restructuring');
    assert.equal(parsed.utm_term, 'ma_advisory');
    assert.equal(parsed.utm_content, 'carousel_v2');

    // Partial query string
    const partialQuery = '?utm_source=google&utm_medium=search';
    const parsedPartial = parseUtmParameters(partialQuery);
    assert.equal(parsedPartial.utm_source, 'google');
    assert.equal(parsedPartial.utm_medium, 'search');
    assert.equal(parsedPartial.utm_campaign, undefined);

    // Empty or non-UTM query
    const emptyQuery = 'https://inpartner.id/about?ref=homepage';
    const parsedEmpty = parseUtmParameters(emptyQuery);
    assert.deepEqual(parsedEmpty, {});

    // Malformed input fails gracefully
    const malformed = parseUtmParameters('invalid-uri-%%#@$');
    assert.ok(typeof malformed === 'object');
  });

  await t.test('Attribution Engine: Resolves organic referrer channels when UTM tags are absent', () => {
    const storage = new MockStorage();

    // Google organic search
    const googleResult = captureMarketingAttribution(
      'https://inpartner.id/services/corporate-finance',
      'https://www.google.com/search?q=inpartner+consulting+indonesia',
      storage as unknown as Storage
    );
    assert.equal(googleResult.utm_source, 'google');
    assert.equal(googleResult.utm_medium, 'organic');
    assert.ok(googleResult.referrer_url?.includes('google.com'));

    // LinkedIn referral
    const storage2 = new MockStorage();
    const linkedinResult = captureMarketingAttribution(
      'https://inpartner.id/contact',
      'https://www.linkedin.com/feed/',
      storage2 as unknown as Storage
    );
    assert.equal(linkedinResult.utm_source, 'linkedin');
    assert.equal(linkedinResult.utm_medium, 'social');

    // Direct visit (no referrer, no UTM)
    const storage3 = new MockStorage();
    const directResult = captureMarketingAttribution(
      'https://inpartner.id/',
      '',
      storage3 as unknown as Storage
    );
    assert.equal(directResult.utm_source, 'direct');
    assert.equal(directResult.utm_medium, 'none');
  });

  await t.test('First-Touch Persistence: Preserves initial campaign touchpoint across navigation sessions', () => {
    const storage = new MockStorage();

    // First touch: Paid campaign on landing page
    const firstTouch = captureMarketingAttribution(
      'https://inpartner.id/landing?utm_source=meta_ads&utm_medium=paid_social&utm_campaign=tax_planning_2026',
      'https://instagram.com/',
      storage as unknown as Storage
    );

    assert.equal(firstTouch.utm_source, 'meta_ads');
    assert.equal(firstTouch.utm_campaign, 'tax_planning_2026');

    // Verify stored in storage
    const rawStored = storage.getItem(ATTRIBUTION_STORAGE_KEY);
    assert.ok(rawStored, 'Expected attribution to be serialized into storage');

    // Subsequent navigation to another page with NO UTM parameters
    const secondTouch = captureMarketingAttribution(
      'https://inpartner.id/advisory/governance',
      'https://inpartner.id/landing',
      storage as unknown as Storage
    );

    // Attribution MUST remain first-touch (meta_ads, tax_planning_2026)
    assert.equal(secondTouch.utm_source, 'meta_ads');
    assert.equal(secondTouch.utm_medium, 'paid_social');
    assert.equal(secondTouch.utm_campaign, 'tax_planning_2026');

    // Direct helper check
    const retrieved = getPersistedAttribution(storage as unknown as Storage);
    assert.equal(retrieved?.utm_campaign, 'tax_planning_2026');
  });

  await t.test('Badge Formatter: Formats attribution summaries into readable pills', () => {
    const attrPaid: AttributionData = {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'merger_acquisition_2026'
    };
    assert.equal(formatAttributionBadge(attrPaid), 'google / cpc');

    const attrOrganic: AttributionData = {
      utm_source: 'linkedin',
      utm_medium: 'social'
    };
    assert.equal(formatAttributionBadge(attrOrganic), 'linkedin / social');

    const attrDirect: AttributionData = {
      utm_source: 'direct',
      utm_medium: 'none'
    };
    assert.equal(formatAttributionBadge(attrDirect), 'direct');

    assert.equal(formatAttributionBadge(undefined), 'Direct');
  });

  await t.test('Database Integration: Persists attribution telemetry with newly created lead', () => {
    const testAttribution: AttributionData = {
      utm_source: 'linkedin_ads',
      utm_medium: 'cpc',
      utm_campaign: 'enterprise_restructuring_h1',
      utm_term: 'tax_advisory',
      utm_content: 'banner_blue',
      referrer_url: 'https://linkedin.com/ad/12345',
      landing_page: '/services/restructuring'
    };

    const lead = createLead({
      name: 'Budi Kusuma Santoso',
      phone: '081299887766',
      email: 'budi.santoso@indocorp.com',
      company: 'PT Indo Corp International',
      business_need: 'Restructuring & Governance',
      attribution: testAttribution
    });

    assert.ok(lead.id);
    assert.ok(lead.attribution);
    assert.equal(lead.attribution.utm_source, 'linkedin_ads');
    assert.equal(lead.attribution.utm_campaign, 'enterprise_restructuring_h1');
    assert.equal(lead.attribution.landing_page, '/services/restructuring');

    // Retrieve all leads and confirm persistence
    const all = getAllLeads();
    const found = all.find((l) => l.id === lead.id);
    assert.ok(found);
    assert.equal(found.attribution?.utm_source, 'linkedin_ads');
    assert.equal(found.attribution?.utm_medium, 'cpc');
  });

  await t.test('CSV Export Pipeline: Generates 5 dedicated attribution columns with sanitized escaping', () => {
    const sampleLeads = [
      {
        id: 'lead-attr-01',
        name: 'Siti Rahmawati',
        phone: '081234567890',
        email: 'siti@holding.co.id',
        company: 'PT Citra Holding',
        business_need: 'Tax Strategy',
        notes: 'Needs quick advice',
        status: 'new' as const,
        created_at: new Date().toISOString(),
        score: 85,
        priority_tier: 'tier_1' as const,
        attribution: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'tax_reform_2026',
          referrer_url: 'https://google.com',
          landing_page: '/tax'
        }
      },
      {
        id: 'lead-attr-02',
        name: 'Ahmad Fauzi',
        phone: '081399998888',
        email: 'fauzi@direct.id',
        company: 'CV Direct Mandiri',
        business_need: 'Accounting Audit',
        notes: 'Direct inquiry',
        status: 'contacted' as const,
        created_at: new Date().toISOString(),
        score: 45,
        priority_tier: 'tier_2' as const
      }
    ];

    const csv = generateLeadsCsv(sampleLeads);

    // Verify CSV Headers
    assert.ok(csv.includes('UTM Source'));
    assert.ok(csv.includes('UTM Medium'));
    assert.ok(csv.includes('UTM Campaign'));
    assert.ok(csv.includes('Referrer URL'));
    assert.ok(csv.includes('Landing Page'));

    // Verify Data Row 1 (Attributed)
    assert.ok(csv.includes('"google"'));
    assert.ok(csv.includes('"cpc"'));
    assert.ok(csv.includes('"tax_reform_2026"'));
    assert.ok(csv.includes('"https://google.com"'));
    assert.ok(csv.includes('"/tax"'));

    // Verify Data Row 2 (Unattributed fallback to "-")
    const lines = csv.split('\n');
    assert.equal(lines.length, 3); // Header + 2 data rows
  });
});
