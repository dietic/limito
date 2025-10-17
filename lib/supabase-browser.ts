import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export function createBrowserClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { fetch }
  })
}

