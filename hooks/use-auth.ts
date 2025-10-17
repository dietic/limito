'use client'
import { useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'

interface AuthState {
  loading: boolean
  userId: string | null
  email: string | null
  error: string | null
}

export function useAuth() {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [state, setState] = useState<AuthState>({ loading: true, userId: null, email: null, error: null })

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const u = data.session?.user ?? null
      setState({ loading: false, userId: u?.id ?? null, email: u?.email ?? null, error: null })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setState(s => ({ ...s, userId: u?.id ?? null, email: u?.email ?? null }))
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  async function getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  }

  async function signUpWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  }

  async function sendMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { ...state, getAccessToken, signInWithPassword, signUpWithPassword, sendMagicLink, signOut }
}

