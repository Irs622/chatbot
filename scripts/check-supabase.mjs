import { createClient } from '@supabase/supabase-js';

const url = 'https://vfcttowwcqzaqvioxrnq.supabase.co';
const key = 'sb_publishable_lwHRse-eMn2iPGHL6n2Akg_XdmRVW9Z';

const supabase = createClient(url, key);

async function check() {
  console.log('Checking connection to Supabase at:', url);
  try {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) {
      console.log('Supabase Response Error:', error.message, '| Code:', error.code);
      if (error.code === '42P01') {
        console.log('NOTE: Table "leads" does not exist yet. Please run the SQL schema script in Supabase SQL Editor!');
      }
    } else {
      console.log('SUCCESS! Connected to Supabase leads table. Rows:', data.length);
    }
  } catch (err) {
    console.error('Connection failure:', err.message);
  }
}

check();
