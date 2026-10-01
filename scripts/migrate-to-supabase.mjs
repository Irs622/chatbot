#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const val = v.join('=').trim();
    if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
    if (k.trim() === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' && !supabaseKey) supabaseKey = val;
    if (k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = val;
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting Data Migration to Supabase:', supabaseUrl);
  
  const dbFile = path.resolve(process.cwd(), 'data', 'db.json');
  if (!fs.existsSync(dbFile)) {
    console.log('⚠️ No data/db.json file found to migrate.');
    return;
  }

  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  // 1. Migrate Conversations
  if (db.conversations && db.conversations.length > 0) {
    console.log(`\n📦 Migrating ${db.conversations.length} conversations...`);
    const { error } = await supabase.from('conversations').upsert(db.conversations);
    if (error) {
      console.error('❌ Failed to migrate conversations:', error.message);
    } else {
      console.log('✅ Conversations migrated successfully.');
    }
  }

  // 2. Migrate Messages
  if (db.messages && db.messages.length > 0) {
    console.log(`\n💬 Migrating ${db.messages.length} messages...`);
    const { error } = await supabase.from('messages').upsert(db.messages);
    if (error) {
      console.error('❌ Failed to migrate messages:', error.message);
    } else {
      console.log('✅ Messages migrated successfully.');
    }
  }

  // 3. Migrate Leads
  if (db.leads && db.leads.length > 0) {
    console.log(`\n👥 Migrating ${db.leads.length} leads...`);
    const { error } = await supabase.from('leads').upsert(db.leads);
    if (error) {
      console.error('❌ Failed to migrate leads:', error.message);
    } else {
      console.log('✅ Leads migrated successfully.');
    }
  }

  // 4. Migrate Analytics Events
  if (db.analytics_events && db.analytics_events.length > 0) {
    console.log(`\n📊 Migrating ${db.analytics_events.length} analytics events...`);
    const { error } = await supabase.from('analytics_events').upsert(db.analytics_events);
    if (error) {
      console.error('❌ Failed to migrate analytics events:', error.message);
    } else {
      console.log('✅ Analytics events migrated successfully.');
    }
  }

  console.log('\n🎉 Supabase Database Migration Completed!');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
