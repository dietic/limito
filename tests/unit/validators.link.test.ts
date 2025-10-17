import { describe, it, expect } from 'vitest'
import { createLinkSchema, updateLinkSchema } from '@/lib/validators/link'

describe('createLinkSchema', () => {
  it('accepts by_date with future expires_at', () => {
    const res = createLinkSchema.safeParse({
      destination_url: 'https://example.com',
      mode: 'by_date',
      expires_at: new Date(Date.now() + 60_000).toISOString()
    })
    expect(res.success).toBe(true)
  })
  it('rejects by_clicks without limit', () => {
    const res = createLinkSchema.safeParse({ destination_url: 'https://example.com', mode: 'by_clicks' })
    expect(res.success).toBe(false)
  })
})

describe('updateLinkSchema', () => {
  it('accepts partial fields', () => {
    const res = updateLinkSchema.safeParse({ destination_url: 'https://example.org' })
    expect(res.success).toBe(true)
  })
})

