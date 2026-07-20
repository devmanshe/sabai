import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Use a lazily-initialised client so that importing this module during
// Next.js build-time static analysis (when env vars may be absent) does
// not throw at module-evaluation time.  The error is still surfaced the
// first time any property on `supabase` is actually accessed at runtime.
let _client: SupabaseClient<any, any, any> | null = null;

function getClient(): SupabaseClient<any, any, any> {
  if (_client) return _client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  _client = createClient(supabaseUrl, supabaseKey);
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient<any, any, any>, {
  get(_target, prop: string) {
    return (getClient() as any)[prop];
  },
});