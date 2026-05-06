import "server-only";

import { createClient } from "@supabase/supabase-js";

let adminClient: any = undefined;

export function getSupabaseAdminClient(): any {
  if (adminClient !== undefined) {
    return adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? null;

  if (!url || !key) {
    adminClient = null;
    return adminClient;
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}
