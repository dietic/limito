import type { Link } from '@/types/link'

export type Expirable = Pick<
  Link,
  'is_active' | 'mode' | 'expires_at' | 'click_limit' | 'click_count'
>

export function isExpired(link: Expirable, now: Date = new Date()): boolean {
  if (!link.is_active) return true
  if (link.mode === 'by_date') {
    if (!link.expires_at) return false
    return new Date(link.expires_at).getTime() <= now.getTime()
  }
  if (link.mode === 'by_clicks') {
    if (link.click_limit == null) return false
    return (link.click_count ?? 0) >= link.click_limit
  }
  return false
}

