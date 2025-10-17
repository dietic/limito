import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export function getServiceClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { fetch }
  })
}

