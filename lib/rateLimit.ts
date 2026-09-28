import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (per serverless instance)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;           // Maximum allowed requests in window
  windowMs: number;        // Window duration in milliseconds
  identifier?: string;     // Unique namespace, e.g., 'chat', 'leads', 'login'
}

/**
 * Extracts best-effort client IP from headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Checks if a request exceeds rate limit thresholds.
 * Returns { isAllowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(req: NextRequest, options: RateLimitOptions): {
  isAllowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const ip = getClientIp(req);
  const key = `${options.identifier || 'default'}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    });
    return {
      isAllowed: true,
      remaining: options.limit - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000)
    };
  }

  if (record.count >= options.limit) {
    // Exceeded
    return {
      isAllowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
    };
  }

  // Increment within window
  record.count += 1;
  return {
    isAllowed: true,
    remaining: options.limit - record.count,
    resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
  };
}
