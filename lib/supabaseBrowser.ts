import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

// Use a lazily-initialised client so that importing this module during
// Next.js build-time static analysis (when env vars may be absent) does
// not throw at module-evaluation time.
let _client: SupabaseClient<any, any, any> | null = null;

function getBrowserClient(): SupabaseClient<any, any, any> {
  if (_client) return _client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
    );
  }
  _client = createBrowserClient(supabaseUrl, supabaseKey);
  return _client;
}

export const supabaseBrowser = new Proxy({} as SupabaseClient<any, any, any>, {
  get(_target, prop: string) {
    return (getBrowserClient() as any)[prop];
  },
});