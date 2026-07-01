const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE') || !supabaseUrl.startsWith('http');
const isPlaceholderKey = !supabaseKey || supabaseKey.includes('YOUR_SUPABASE');

if (isPlaceholderUrl || isPlaceholderKey) {
  console.warn('----------------------------------------------------------------------');
  console.warn('Warning: SUPABASE_URL or SUPABASE_KEY has placeholder values in .env!');
  console.warn('Please update server/.env with your real Supabase credentials.');
  console.warn('----------------------------------------------------------------------');
}

// Fallback to placeholder URL and key if not configured, preventing crash on startup
const safeUrl = isPlaceholderUrl ? 'https://placeholder.supabase.co' : supabaseUrl;
const safeKey = isPlaceholderKey ? 'placeholder-anon-key' : supabaseKey;

const supabase = createClient(safeUrl, safeKey);

module.exports = supabase;
