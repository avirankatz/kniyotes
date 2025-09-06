import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
