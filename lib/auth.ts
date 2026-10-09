import type { SupabaseClient } from '@supabase/supabase-js'

export async function getUserSafe(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getSession()
  return { data: { user: data.session?.user ?? null } }
}