#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const key = k.trim();
    const val = v.join('=').trim();
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !supabaseUrl) supabaseUrl = val;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !supabaseKey) supabaseKey = val;
    if (key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' && !supabaseKey) supabaseKey = val;
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = val;
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

console.log('\n============================================================');
console.log('  🔍 INPARTNER AI — SUPABASE DATABASE CONNECTIVITY CHECK');
console.log('============================================================');
console.log(`Endpoint Target : ${supabaseUrl}`);
console.log(`API Key Format  : ${supabaseKey.substring(0, 14)}...`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const tables = ['leads', 'conversations', 'messages', 'analytics_events'];

async function runCheck() {
  let allHealthy = true;

  for (const table of tables) {
    const start = Date.now();
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      const elapsed = Date.now() - start;

      if (error) {
        allHealthy = false;
        console.log(`❌ [Table: ${table.padEnd(16)}] Error (${elapsed}ms): ${error.message} [Code: ${error.code || 'N/A'}]`);
      } else {
        console.log(`✅ [Table: ${table.padEnd(16)}] Connected (${elapsed}ms) | Total records: ${count ?? (data ? data.length : 0)}`);
      }
    } catch (err) {
      allHealthy = false;
      console.log(`❌ [Table: ${table.padEnd(16)}] Exception: ${err.message}`);
    }
  }

  console.log('============================================================');
  if (allHealthy) {
    console.log('🎉 STATUS: ALL SUPABASE TABLES OPERATIONAL & VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('⚠️ STATUS: ONE OR MORE TABLES ENCOUNTERED AN ISSUE.\n');
    process.exit(1);
  }
}

runCheck();
