'use client'
import { useLinks } from '@/hooks/use-links'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { userId, email, loading: authLoading } = useAuth()
  const { items, loading } = useLinks()

  if (authLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="text-center text-gray-600">Loading...</div>
      </main>
    )
  }

  if (!userId) {
    router.push('/login')
    return null
  }

  const activeLinks = items.filter(link => link.is_active)
  const totalClicks = items.reduce((sum, link) => sum + (link.click_count || 0), 0)

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {email}</p>

      {loading ? (
        <div className="mt-6 text-gray-600">Loading stats...</div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-sm font-medium text-gray-600">Total Links</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{items.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-sm font-medium text-gray-600">Active Links</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">{activeLinks.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-sm font-medium text-gray-600">Total Clicks</div>
            <div className="mt-2 text-3xl font-semibold text-primary">{totalClicks}</div>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <NextLink href="/links/new" className="btn-primary">
          Create New Link
        </NextLink>
        <NextLink href="/links" className="btn-ghost border border-gray-300">
          View All Links
        </NextLink>
      </div>

      {!loading && items.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Recent Links</h2>
          <div className="mt-4 divide-y rounded-lg border border-gray-200">
            {items.slice(0, 5).map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm">{link.slug}</code>
                    {link.is_active ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-sm text-gray-600">{link.destination_url}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {link.click_count} clicks · {link.mode === 'by_date' ? 'Expires by date' : 'Expires by clicks'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

