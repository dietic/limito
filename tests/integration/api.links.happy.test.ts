import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'

type QueryResult = { data: unknown; error: unknown; count?: number | null }
type Builder = {
  select: (..._args: unknown[]) => Builder
  eq: (..._args: unknown[]) => Builder
  order: (..._args: unknown[]) => Builder
  range: (..._args: unknown[]) => Builder
  single: () => Builder
  insert: (..._args: unknown[]) => Builder
  update: (..._args: unknown[]) => Builder
  delete: () => Builder
  then: (resolve: (v: QueryResult) => void) => void
}

function makeSupabaseQueue(responses: unknown[]) {
  function builder(): Builder {
    return {
      select: () => builder(),
      eq: () => builder(),
      order: () => builder(),
      range: () => builder(),
      single: () => builder(),
      insert: () => builder(),
      update: () => builder(),
      delete: () => builder(),
      then: (resolve) => {
        const next = (responses.shift() as QueryResult | undefined) ?? { data: [], error: null, count: null }
        resolve(next)
      }
    }
  }
  return {
    from: (_table: string) => builder()
  }
}

const sampleLink = {
  id: 'l1', owner_id: 'u1', slug: 'abc1234', destination_url: 'https://example.com',
  fallback_url: null, mode: 'by_clicks', click_limit: 10, click_count: 0, last_clicked_at: null,
  expires_at: null, is_active: true, created_at: '2024-01-01T00:00:00.000Z'
}

describe('api/links happy paths', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('GET /api/links returns paginated items and counts', async () => {
    vi.doMock('@/lib/auth', () => ({ requireAuth: async () => ({ userId: 'u1' }) }))
    // Queue order: main list (with count), then counts for all/active/expired
    const queue = [
      { data: [sampleLink], error: null, count: 1 },
      { data: null, error: null, count: 1 }, // all
      { data: null, error: null, count: 1 }, // active
      { data: null, error: null, count: 0 }  // expired
    ]
    vi.doMock('@/lib/supabase', () => ({ getServiceClient: () => makeSupabaseQueue(queue) }))
    const { GET } = await import('@/app/api/links/route')
  const res = await GET(new Request('http://localhost/api/links?limit=10&offset=0&filter=all') as unknown as NextRequest)
    expect(res.status).toBe(200)
    const json = await (res as Response).json()
    expect(json.success).toBe(true)
    expect(json.data.items.length).toBe(1)
    expect(json.data.total).toBe(1)
    expect(json.data.counts).toEqual({ all: 1, active: 1, expired: 0 })
  })

  it('POST /api/links creates a link', async () => {
    vi.doMock('@/lib/auth', () => ({ requireAuth: async () => ({ userId: 'u1' }) }))
    vi.doMock('@/lib/rate-limit', () => ({ allowAndIncrement: async () => ({ allowed: true, remaining: 9, limit: 10, resetAt: new Date().toISOString() }) }))
    // active count head query, then insert returning created link
    const queue = [
      { data: null, error: null, count: 0 },
      { data: { ...sampleLink }, error: null }
    ]
    vi.doMock('@/lib/supabase', () => ({ getServiceClient: () => makeSupabaseQueue(queue) }))
    const { POST } = await import('@/app/api/links/route')
    const body = {
      destination_url: 'https://example.com',
      mode: 'by_clicks',
      click_limit: 5
    }
  const res = await POST(new Request('http://localhost/api/links', { method: 'POST', body: JSON.stringify(body) }) as unknown as NextRequest)
    expect(res.status).toBe(201)
    const json = await (res as Response).json()
    expect(json.success).toBe(true)
    expect(json.data.slug).toBeDefined()
  })
})
