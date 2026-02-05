import { createClient } from "@supabase/supabase-js"

/**
 * Service Role 클라이언트 (RPC, RLS 우회용)
 * Server Actions, API Routes에서만 사용. 클라이언트에 노출 금지.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE."
    )
  }

  return createClient(url, serviceRoleKey)
}
