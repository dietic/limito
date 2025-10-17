import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export interface AuthResult {
  userId: string
}

export async function requireAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    throw new Error('Unauthorized')
  }
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { fetch }
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) {
    throw new Error('Unauthorized')
  }
  return { userId: data.user.id }
}

