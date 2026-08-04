import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let cached: SupabaseClient<Database> | null = null;

/**
 * Server-only Supabase client using the service-role key (bypasses RLS).
 * Used exclusively inside server functions / server routes. Returns null when
 * credentials are not configured so callers can fall back to defaults.
 */
export function getServerClient(): SupabaseClient<Database> | null {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !key) return null;

  if (!cached) {
    cached = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
