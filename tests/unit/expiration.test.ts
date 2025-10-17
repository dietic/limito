import { describe, it, expect } from 'vitest'
import { isExpired } from '@/lib/expiration'
import type { Link } from '@/types/link'

function baseLink(): Link {
  return {
    id: '1',
    owner_id: 'u',
    slug: 's',
    destination_url: 'https://example.com',
    fallback_url: null,
    mode: 'by_date',
    expires_at: null,
    click_limit: null,
    click_count: 0,
    last_clicked_at: null,
    is_active: true
  }
}

describe('isExpired', () => {
  it('active by_date not expired when no date', () => {
    const link = baseLink()
    link.mode = 'by_date'
    link.expires_at = null
    expect(isExpired(link, new Date())).toBe(false)
  })
  it('active by_date expired when past date', () => {
    const link = baseLink()
    link.mode = 'by_date'
    link.expires_at = new Date(Date.now() - 1000).toISOString()
    expect(isExpired(link, new Date())).toBe(true)
  })
  it('active by_clicks expired when count >= limit', () => {
    const link = baseLink()
    link.mode = 'by_clicks'
    link.click_limit = 3
    link.click_count = 3
    expect(isExpired(link, new Date())).toBe(true)
  })
  it('inactive always expired', () => {
    const link = baseLink()
    link.is_active = false
    expect(isExpired(link, new Date())).toBe(true)
  })
})

