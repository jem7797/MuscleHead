import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Missing env: client is created with empty strings; configure EXPO_PUBLIC_* for realtime/DB.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      apikey: supabaseAnonKey,
    },
  },
});

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
