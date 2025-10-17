import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: string
}

function service(): SupabaseClient {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, global: { fetch } })
}

export async function allowAndIncrement(scope: string, key: string, limit: number, windowMs: number, sb?: SupabaseClient): Promise<RateLimitResult> {
  const client = sb ?? service()
  const now = new Date()
  const { data: rows } = await client.from('rate_limits').select('*').eq('scope', scope).eq('key', key).limit(1)
  const row = rows && rows.length > 0 ? rows[0] : undefined
  if (!row) {
    const resetAt = new Date(now.getTime() + windowMs).toISOString()
    await client.from('rate_limits').upsert({ scope, key, count: 1, window_expires_at: resetAt }).eq('scope', scope).eq('key', key)
    return { allowed: true, remaining: Math.max(0, limit - 1), limit, resetAt }
  }
  if (new Date(row.window_expires_at).getTime() <= now.getTime()) {
    const resetAt = new Date(now.getTime() + windowMs).toISOString()
    await client.from('rate_limits').update({ count: 1, window_expires_at: resetAt }).eq('scope', scope).eq('key', key)
    return { allowed: true, remaining: Math.max(0, limit - 1), limit, resetAt }
  }
  const current = Number(row.count) || 0
  if (current >= limit) {
    return { allowed: false, remaining: 0, limit, resetAt: row.window_expires_at }
  }
  const next = current + 1
  await client.from('rate_limits').update({ count: next }).eq('scope', scope).eq('key', key)
  return { allowed: true, remaining: Math.max(0, limit - next), limit, resetAt: row.window_expires_at }
}

export function ipFromRequestHeaders(headers: Headers): string {
  const direct = (headers.get('x-real-ip') || '').trim()
  if (direct) return direct
  const fwd = headers.get('x-forwarded-for') || ''
  if (fwd) {
    const first = fwd.split(',')[0] ?? ''
    return first.trim()
  }
  return 'unknown'
}
