import type { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Default password if not configured in environment
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'inpartner2026';

// Warn if using insecure defaults in production
if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'inpartner2026')) {
  console.warn('[SECURITY CRITICAL] ADMIN_PASSWORD is unset or using default credentials in production environment.');
}

// Secret used to sign session cookies
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'inpartner_secret_key_2026_crm_security';

if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  console.warn('[SECURITY CRITICAL] AUTH_SECRET is unset in production environment. Sessions may be insecure.');
}

export const ADMIN_COOKIE_NAME = 'inpartner_admin_session';

// Session valid for 7 days
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// In-memory session revocation store (TTL-managed)
const revokedSessionIds = new Set<string>();

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
 * Generates a signed session token: sessionId.timestamp.signature
 */
export function generateAdminSessionToken(sessionId?: string): string {
  const sid = sessionId || `sid_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const timestamp = Date.now().toString();
  const payload = `${sid}:${timestamp}`;
  const signature = createSignature(payload);
  return `${sid}.${timestamp}.${signature}`;
}

/**
 * Explicitly revokes an admin session token (server-side invalidation on logout)
 */
export function revokeAdminSession(token?: string | null): void {
  if (!token) return;
  const parts = token.split('.');
  if (parts.length === 3) {
    const [sid] = parts;
    revokedSessionIds.add(sid);
  } else if (parts.length === 2) {
    // Legacy 2-part format
    revokedSessionIds.add(parts[1]);
  }
}

/**
 * Checks if a session has been revoked
 */
export function isSessionRevoked(token: string): boolean {
  const parts = token.split('.');
  if (parts.length === 3) {
    return revokedSessionIds.has(parts[0]);
  } else if (parts.length === 2) {
    return revokedSessionIds.has(parts[1]);
  }
  return false;
}

/**
 * Verifies if a given session token is valid, cryptographically intact, not expired, and not revoked
 */
export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;
  if (isSessionRevoked(token)) return false;

  const parts = token.split('.');

  // 1. Current format: sessionId.timestamp.signature
  if (parts.length === 3) {
    const [sid, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return false;

    // Check expiration (7 days)
    const now = Date.now();
    const ageMs = now - timestamp;
    if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
      return false;
    }

    const expectedSignature = createSignature(`${sid}:${timestampStr}`);
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

  // 2. Legacy format backward compatibility: timestamp.signature
  if (parts.length === 2) {
    const [timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return false;

    const now = Date.now();
    const ageMs = now - timestamp;
    if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
      return false;
    }

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

  return false;
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
