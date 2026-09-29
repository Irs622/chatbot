import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { INPARTNER_CONFIG, getWhatsAppUrl } from '../lib/config.ts';

test('Configuration & Knowledge Base Suite', async (t) => {
  await t.test('INPARTNER_CONFIG has verified production values', () => {
    assert.equal(INPARTNER_CONFIG.companyName, 'PT Inpartner Optima Integra');
    assert.equal(INPARTNER_CONFIG.whatsappNumber, '6285934548202');
    assert.equal(INPARTNER_CONFIG.whatsappDisplay, '+62 859 3454 8202');
    assert.equal(INPARTNER_CONFIG.email, 'corporatesecretary@inpartner.id');
    assert.match(INPARTNER_CONFIG.addressJakarta, /Pakuwon Tower.*Unit J.*10th Floor/i);
    assert.match(INPARTNER_CONFIG.operatingHours, /09:00.*17:00.*WIB/i);
  });

  await t.test('getWhatsAppUrl generates correct link with phone and message', () => {
    const urlWithoutMsg = getWhatsAppUrl();
    assert.equal(urlWithoutMsg, 'https://wa.me/6285934548202');

    const urlWithMsg = getWhatsAppUrl('Halo Inpartner');
    assert.equal(urlWithMsg, 'https://wa.me/6285934548202?text=Halo%20Inpartner');
  });

  await t.test('Knowledge base services folder contains exactly the 5 official services', () => {
    const servicesDir = path.join(process.cwd(), 'knowledge', 'services');
    assert.ok(fs.existsSync(servicesDir), 'knowledge/services directory must exist');

    const expectedServices = [
      'strategy-corporate-advisory.md',
      'investment-project-advisory.md',
      'market-access-expansion.md',
      'cross-border-technology.md',
      'human-capital-organization.md'
    ];

    for (const file of expectedServices) {
      const filePath = path.join(servicesDir, file);
      assert.ok(fs.existsSync(filePath), `Expected service file ${file} does not exist`);
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(content.length > 200, `Service file ${file} is unexpectedly short`);
    }

    const legacyFiles = [
      'funding.md',
      'growth.md',
      'profitability.md',
      'capacity-building.md'
    ];

    for (const legacy of legacyFiles) {
      const filePath = path.join(servicesDir, legacy);
      assert.ok(!fs.existsSync(filePath), `Legacy file ${legacy} must NOT exist`);
    }
  });

  await t.test('Knowledge base company profile has 2026 data and integrity rules', () => {
    const profilePath = path.join(process.cwd(), 'knowledge', 'company', 'company-profile.md');
    assert.ok(fs.existsSync(profilePath), 'company-profile.md must exist');

    const content = fs.readFileSync(profilePath, 'utf-8');
    assert.match(content, /PT Inpartner Optima Integra/);
    assert.match(content, /Unleash The Power Of Your Business/);
    assert.match(content, /Bridging Markets, Investment & Business Opportunities/);
    assert.match(content, /2009/);
    assert.match(content, /2019/);
  });

  await t.test('Contact knowledge file has updated office and WhatsApp info', () => {
    const contactPath = path.join(process.cwd(), 'knowledge', 'contact', 'contact.md');
    assert.ok(fs.existsSync(contactPath), 'contact.md must exist');

    const content = fs.readFileSync(contactPath, 'utf-8');
    assert.match(content, /859\s*3454\s*8202/);
    assert.match(content, /Unit J/);
    assert.ok(!content.includes('089628310192'), 'Old WhatsApp number must not exist in contact.md');
  });
});
