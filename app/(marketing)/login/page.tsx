'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'

export default function LoginPage() {
  const { loading, userId, email, signInWithPassword, signUpWithPassword, sendMagicLink, signOut } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState<string | null>(null)

  if (userId) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold">You are signed in</h1>
        <p className="mt-4 text-gray-700">{email}</p>
        <div className="mt-6 flex gap-3">
          <a href="/dashboard" className="btn-primary">Open Dashboard</a>
          <Button onClick={() => { setMessage(null); signOut() }}>Sign out</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-4 text-gray-700">Sign in or create an account.</p>
      <div className="mt-6 space-y-4">
        {message ? <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div> : null}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <Input type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <Input type="password" value={form.password} onChange={e => setForm(v => ({ ...v, password: e.target.value }))} placeholder="••••••••" />
        </div>
        <div className="flex gap-3">
          <Button disabled={loading} onClick={async () => {
            const res = await signInWithPassword(form.email, form.password)
            if (!res.ok) setMessage(res.message || 'Sign in failed')
          }}>Sign in</Button>
          <Button variant="accent" disabled={loading} onClick={async () => {
            const res = await signUpWithPassword(form.email, form.password)
            setMessage(res.ok ? 'Check your email to confirm.' : res.message || 'Sign up failed')
          }}>Sign up</Button>
        </div>
        <div>
          <Button variant="ghost" disabled={loading} onClick={async () => {
            const res = await sendMagicLink(form.email)
            setMessage(res.ok ? 'Magic link sent. Check your inbox.' : res.message || 'Could not send magic link')
          }}>Send magic link</Button>
        </div>
      </div>
    </main>
  )
}

