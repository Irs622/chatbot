// Rate limiting engine supporting both Next.js App Router and Pages Router

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (per runtime instance)
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

export interface RateLimitResult {
  isAllowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Validates whether an IP address string has a valid IPv4 or IPv6 shape
 */
function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  // IPv4 basic check
  const ipv4Pattern = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (ipv4Pattern.test(trimmed)) return true;
  // IPv6 basic check
  if (trimmed.includes(':') && trimmed.length <= 45) return true;
  return false;
}

function getHeader(req: any, headerName: string): string | null {
  if (!req || !req.headers) return null;
  if (typeof req.headers.get === 'function') {
    return req.headers.get(headerName);
  }
  const val = req.headers[headerName.toLowerCase()] ?? req.headers[headerName];
  if (Array.isArray(val)) return val[0] || null;
  if (typeof val === 'string') return val;
  return null;
}

/**
 * Extracts client IP with support for trusted edge proxy headers
 * Priority: CF-Connecting-IP > True-Client-IP > X-Real-IP > X-Forwarded-For > Socket / RemoteAddress > Fallback
 */
export function getClientIp(req: any): string {
  // 1. Cloudflare edge header (high trust when behind Cloudflare)
  const cfConnectingIp = getHeader(req, 'cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  // 2. Akamai / Cloudflare Enterprise
  const trueClientIp = getHeader(req, 'true-client-ip');
  if (trueClientIp && isValidIp(trueClientIp.trim())) {
    return trueClientIp.trim();
  }

  // 3. Nginx / Reverse Proxy header
  const realIp = getHeader(req, 'x-real-ip');
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // 4. Standard X-Forwarded-For: parse first IP and sanitize
  const forwarded = getHeader(req, 'x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded.split(',')[0].trim();
    if (isValidIp(candidate)) {
      return candidate;
    }
  }

  // 5. Node.js socket remote address fallback (Pages Router / Express)
  const socketIp = req?.socket?.remoteAddress || req?.connection?.remoteAddress;
  if (socketIp && typeof socketIp === 'string') {
    const sanitizedSocket = socketIp.replace(/^.*:/, ''); // strip IPv6 prefix if mapped IPv4
    if (isValidIp(sanitizedSocket)) return sanitizedSocket;
    if (isValidIp(socketIp)) return socketIp;
  }

  return '127.0.0.1';
}

/**
 * Synchronous in-memory rate limiter check
 */
export function checkRateLimit(req: any, options: RateLimitOptions): RateLimitResult {
  const ip = getClientIp(req);
  const key = `${options.identifier || 'default'}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
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
    return {
      isAllowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
    };
  }

  record.count += 1;
  return {
    isAllowed: true,
    remaining: options.limit - record.count,
    resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
  };
}

/**
 * Distributed fixed-window rate limiter with TTL.
 * Supports Upstash Redis REST when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * are configured, with automatic graceful fallback to the local runtime memory store.
 */
export async function checkRateLimitAsync(req: any, options: RateLimitOptions): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const ip = getClientIp(req);
      const key = `ratelimit:${options.identifier || 'default'}:${ip}`;
      const windowSec = Math.ceil(options.windowMs / 1000);

      // Fixed-window counter with TTL (EXPIRE NX ensures window is not reset on every hit)
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSec, 'NX']
        ])
      });

      if (res.ok) {
        const data = await res.json();
        const currentCount = Number(data[0]?.result || 1);
        const isAllowed = currentCount <= options.limit;
        const remaining = Math.max(0, options.limit - currentCount);

        return {
          isAllowed,
          remaining,
          resetInSeconds: windowSec
        };
      }
    } catch (err) {
      console.warn('[Distributed Rate Limiter fallback to in-memory]', err);
    }
  }

  return checkRateLimit(req, options);
}

