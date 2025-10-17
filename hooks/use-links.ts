'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Link } from '@/types/link'
import { useAuth } from '@/hooks/use-auth'

interface LinksState {
  loading: boolean
  error: string | null
  items: Link[]
}

export function useLinks() {
  const { getAccessToken, userId } = useAuth()
  const [state, setState] = useState<LinksState>({ loading: false, error: null, items: [] })

  const authHeaders = useMemo(async () => {
    const token = await getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [getAccessToken])

  const refresh = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const headers = await authHeaders
      const res = await fetch('/api/links', { headers })
      const payload = await res.json()
      if (!res.ok) {
        setState({ loading: false, error: payload.message || 'Failed to load', items: [] })
        return
      }
      setState({ loading: false, error: null, items: payload.data as Link[] })
    } catch {
      setState({ loading: false, error: 'Network error', items: [] })
    }
  }, [authHeaders])

  useEffect(() => {
    if (!userId) return
    refresh()
  }, [userId, refresh])

  const createLink = useCallback(async (input: Record<string, unknown>) => {
    const headers = await authHeaders
    const res = await fetch('/api/links', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(input) })
    const payload = await res.json()
    if (!res.ok) return { ok: false, message: payload.message as string }
    await refresh()
    return { ok: true, data: payload.data as Link }
  }, [authHeaders, refresh])

  const updateLink = useCallback(async (id: string, input: Record<string, unknown>) => {
    const headers = await authHeaders
    const res = await fetch(`/api/links/${id}`, { method: 'PATCH', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(input) })
    const payload = await res.json()
    if (!res.ok) return { ok: false, message: payload.message as string }
    await refresh()
    return { ok: true, data: payload.data as Link }
  }, [authHeaders, refresh])

  const deleteLink = useCallback(async (id: string) => {
    const headers = await authHeaders
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE', headers })
    const payload = await res.json()
    if (!res.ok) return { ok: false, message: payload.message as string }
    await refresh()
    return { ok: true, data: payload.data }
  }, [authHeaders, refresh])

  return { ...state, refresh, createLink, updateLink, deleteLink }
}

