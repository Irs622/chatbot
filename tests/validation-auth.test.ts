import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePhoneNumber, validateEmail } from '../lib/validation.ts';
import {
  validateAdminPassword,
  generateAdminSessionToken,
  verifyAdminSessionToken,
  DEFAULT_ADMIN_PASSWORD
} from '../lib/auth.ts';

test('Validation, Security & Authentication Suite', async (t) => {
  await t.test('validatePhoneNumber: valid Indonesian formats', () => {
    // Standard 08xx
    const r1 = validatePhoneNumber('081234567899');
    assert.equal(r1.isValid, true);
    assert.equal(r1.cleanPhone, '081234567899');

    // +628xx
    const r2 = validatePhoneNumber('+6285934548202');
    assert.equal(r2.isValid, true);
    assert.equal(r2.cleanPhone, '085934548202');

    // 628xx without plus
    const r3 = validatePhoneNumber('6281987654321');
    assert.equal(r3.isValid, true);
    assert.equal(r3.cleanPhone, '081987654321');

    // Formatted with dashes and spaces
    const r4 = validatePhoneNumber('0859 - 3454 - 8202');
    assert.equal(r4.isValid, true);
    assert.equal(r4.cleanPhone, '085934548202');
  });

  await t.test('validatePhoneNumber: valid international formats', () => {
    const usPhone = validatePhoneNumber('+14155552671');
    assert.equal(usPhone.isValid, true);

    const krPhone = validatePhoneNumber('+821012345678');
    assert.equal(krPhone.isValid, true);

    const sgPhone = validatePhoneNumber('+6591234567');
    assert.equal(sgPhone.isValid, true);
  });

  await t.test('validatePhoneNumber: rejects invalid phone inputs', () => {
    // Empty & null
    assert.equal(validatePhoneNumber('').isValid, false);
    assert.equal(validatePhoneNumber(null).isValid, false);

    // Alpha characters
    assert.equal(validatePhoneNumber('0812abc3456').isValid, false);

    // Too short
    const shortPhone = validatePhoneNumber('0812345');
    assert.equal(shortPhone.isValid, false);
    assert.match(shortPhone.error || '', /too short/i);

    // Too long
    const longPhone = validatePhoneNumber('08123456789012345');
    assert.equal(longPhone.isValid, false);
    assert.match(longPhone.error || '', /too long/i);

    // Dummy sequential
    const dummyPhone = validatePhoneNumber('081234567890');
    assert.equal(dummyPhone.isValid, false);

    // Repeating fake digits
    const repeatPhone = validatePhoneNumber('081111111111');
    assert.equal(repeatPhone.isValid, false);
  });

  await t.test('validateEmail: valid and invalid RFC checks', () => {
    assert.equal(validateEmail('client@inpartner.id'), true);
    assert.equal(validateEmail('managing.partner@consulting.co.id'), true);
    assert.equal(validateEmail('exec@global-firm.com'), true);

    assert.equal(validateEmail(''), false);
    assert.equal(validateEmail(null), false);
    assert.equal(validateEmail('invalid-email'), false);
    assert.equal(validateEmail('user@'), false);
    assert.equal(validateEmail('@domain.com'), false);
    assert.equal(validateEmail('user@domain'), false);
  });

  await t.test('validateAdminPassword: authentication verification', () => {
    assert.equal(validateAdminPassword(DEFAULT_ADMIN_PASSWORD), true);
    assert.equal(validateAdminPassword('wrongpassword'), false);
    assert.equal(validateAdminPassword(''), false);
    assert.equal(validateAdminPassword('admin'), false);
  });

  await t.test('Admin Session Token: issuance and verification', () => {
    const token = generateAdminSessionToken();
    assert.ok(typeof token === 'string');
    assert.ok(token.includes('.'));

    // Valid token
    assert.equal(verifyAdminSessionToken(token), true);

    // Tampered token
    const tampered = token.slice(0, -4) + '0000';
    assert.equal(verifyAdminSessionToken(tampered), false);

    // Malformed token
    assert.equal(verifyAdminSessionToken('not-a-valid-token'), false);
    assert.equal(verifyAdminSessionToken(''), false);
    assert.equal(verifyAdminSessionToken(null), false);
  });
});
