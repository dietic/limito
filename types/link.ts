export type LinkMode = 'by_date' | 'by_clicks'

export interface Link {
  id: string
  owner_id: string
  slug: string
  destination_url: string
  fallback_url: string | null
  mode: LinkMode
  expires_at: string | null
  click_limit: number | null
  click_count: number
  last_clicked_at: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ClickEvent {
  id: string
  link_id: string
  clicked_at: string
  referrer: string | null
  user_agent: string | null
}

