import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Default password if not configured in environment
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'inpartner2026';

// Secret used to sign session cookies
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'inpartner_secret_key_2026_crm_security';

export const ADMIN_COOKIE_NAME = 'inpartner_admin_session';

// Session valid for 7 days
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * Creates an HMAC-SHA256 signature for a payload
 */
function createSignature(payload: string): string {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Generates a signed session token: timestamp:signature
 */
export function generateAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = createSignature(timestamp);
  return `${timestamp}.${signature}`;
}

/**
 * Verifies if a given session token is valid and not expired
 */
export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  const now = Date.now();
  const ageMs = now - timestamp;
  if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  // Verify HMAC signature
  const expectedSignature = createSignature(timestampStr);

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Validates admin password using constant-time comparison
 */
export function validateAdminPassword(inputPassword: string): boolean {
  const validPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (!inputPassword || typeof inputPassword !== 'string') {
    return false;
  }

  try {
    const inputBuf = Buffer.from(inputPassword);
    const validBuf = Buffer.from(validPassword);

    if (inputBuf.length !== validBuf.length) {
      // Avoid timing attacks while returning false
      crypto.timingSafeEqual(inputBuf, inputBuf);
      return false;
    }

    return crypto.timingSafeEqual(inputBuf, validBuf);
  } catch {
    return false;
  }
}

/**
 * Checks whether an incoming HTTP request is authenticated as admin
 */
export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
  return verifyAdminSessionToken(cookie?.value);
}

/**
 * Sets the admin session cookie on a NextResponse
 */
export function setAdminCookie(res: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/'
  });
}

/**
 * Clears the admin session cookie on a NextResponse
 */
export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}
