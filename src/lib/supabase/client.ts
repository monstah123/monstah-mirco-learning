import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zumzahponrhqbdiuykch.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_EqdfYm_oqSwD9GKyaQQb6w_Ppq11J6s';

  return createBrowserClient(url, anonKey);
}
