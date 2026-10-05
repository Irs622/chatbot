import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseCredentials {
  url: string;
  key: string;
}

export interface SupabaseHealthResult {
  ok: boolean;
  configured: boolean;
  latencyMs?: number;
  url?: string;
  error?: string;
}

let supabaseInstance: SupabaseClient | null = null;
let lastUsedKey: string = '';

export function getSupabaseCredentials(): SupabaseCredentials {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  // In production backend runtime, service role key is strictly recommended
  if (process.env.NODE_ENV === 'production' && !serviceKey && typeof window === 'undefined') {
    console.warn('[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY is not defined in backend runtime. Database access may fail under strict RLS policies.');
  }

  const key = serviceKey || anonKey;
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('xxxxxxxx') &&
    !url.includes('your-project-ref')
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, key } = getSupabaseCredentials();

  // Re-instantiate if key changed (e.g. dynamically provided or swapped)
  if (!supabaseInstance || lastUsedKey !== key) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    lastUsedKey = key;
  }

  return supabaseInstance;
}

/**
 * Validates real-time connectivity to Supabase by executing a lightweight HEAD check on the leads table.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      configured: false,
      error: 'Supabase credentials not configured in environment'
    };
  }

  const { url } = getSupabaseCredentials();
  const client = getSupabase();
  if (!client) {
    return {
      ok: false,
      configured: false,
      url,
      error: 'Failed to initialize Supabase client instance'
    };
  }

  const start = Date.now();
  try {
    const { error } = await client.from('leads').select('id', { count: 'exact', head: true });
    const latencyMs = Date.now() - start;

    if (error) {
      return {
        ok: false,
        configured: true,
        url,
        latencyMs,
        error: error.message
      };
    }

    return {
      ok: true,
      configured: true,
      url,
      latencyMs
    };
  } catch (err: any) {
    return {
      ok: false,
      configured: true,
      url,
      latencyMs: Date.now() - start,
      error: err.message || 'Unknown network error'
    };
  }
}
