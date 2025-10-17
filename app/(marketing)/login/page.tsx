'use client'
import { Suspense, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { loading, userId, email, signInWithPassword, signUpWithPassword, sendMagicLink, signOut } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (userId) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">You are signed in</h1>
          <p className="mt-4 text-gray-700">{email}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => router.push(redirect)} className="btn-primary">
              Continue to App
            </button>
            <Button variant="ghost" onClick={() => { setMessage(null); signOut() }}>
              Sign out
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      setMessage({ type: 'error', text: 'Please enter email and password' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    const res = await signInWithPassword(form.email, form.password)
    setSubmitting(false)
    if (!res.ok) {
      setMessage({ type: 'error', text: res.message || 'Sign in failed' })
    } else {
      router.push(redirect)
    }
  }

  const handleSignUp = async () => {
    if (!form.email || !form.password) {
      setMessage({ type: 'error', text: 'Please enter email and password' })
      return
    }
    if (form.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    const res = await signUpWithPassword(form.email, form.password)
    setSubmitting(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
    } else {
      setMessage({ type: 'error', text: res.message || 'Sign up failed' })
    }
  }

  const handleMagicLink = async () => {
    if (!form.email) {
      setMessage({ type: 'error', text: 'Please enter your email' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    const res = await sendMagicLink(form.email)
    setSubmitting(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Magic link sent. Check your inbox.' })
    } else {
      setMessage({ type: 'error', text: res.message || 'Could not send magic link' })
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-gray-600">Sign in to your account or create a new one.</p>
        
        <div className="mt-6 space-y-4">
          {message && (
            <div className={`rounded-md p-3 text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
              placeholder="you@example.com"
              disabled={loading || submitting}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={e => setForm(v => ({ ...v, password: e.target.value }))}
              placeholder="••••••••"
              disabled={loading || submitting}
              className="mt-1"
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              disabled={loading || submitting} 
              onClick={handleSignIn}
              className="flex-1"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Button 
              variant="accent" 
              disabled={loading || submitting} 
              onClick={handleSignUp}
              className="flex-1"
            >
              {submitting ? 'Creating...' : 'Sign up'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            disabled={loading || submitting} 
            onClick={handleMagicLink}
            className="w-full border border-gray-300"
          >
            {submitting ? 'Sending...' : 'Send magic link'}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-md p-6">
        <div className="text-center text-gray-600">Loading...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}

