'use client'
import NextLink from 'next/link'
import { useLinks } from '@/hooks/use-links'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Link as LinkType } from '@/types/link'

export default function LinksPage() {
  const router = useRouter()
  const { userId, loading: authLoading } = useAuth()
  const { items, loading, error, deleteLink } = useLinks()
  const [copying, setCopying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  if (authLoading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="text-center text-gray-600">Loading...</div>
      </main>
    )
  }

  if (!userId) {
    router.push('/login')
    return null
  }

  const copyToClipboard = async (slug: string) => {
    setCopying(slug)
    const url = `${window.location.origin}/r/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setTimeout(() => setCopying(null), 2000)
    } catch {
      setCopying(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link? This action cannot be undone.')) return
    setDeleting(id)
    const result = await deleteLink(id)
    if (!result.ok) {
      alert(result.message || 'Failed to delete link')
    }
    setDeleting(null)
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Links</h1>
        <NextLink href="/links/new" className="btn-primary">Create Link</NextLink>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-600">Loading links...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <h2 className="text-lg font-medium text-gray-900">No links yet</h2>
          <p className="mt-2 text-gray-600">Create your first expiring link to get started.</p>
          <div className="mt-6">
            <NextLink href="/links/new" className="btn-primary">Create Your First Link</NextLink>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Clicks
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((link: LinkType) => (
                <tr key={link.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    <code className="rounded bg-gray-100 px-2 py-1">{link.slug}</code>
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600">
                    {link.destination_url}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {link.mode === 'by_date' ? 'By Date' : 'By Clicks'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {link.is_active ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {link.click_count}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => copyToClipboard(link.slug)}
                        className="text-primary hover:text-blue-700"
                        disabled={copying === link.slug}
                      >
                        {copying === link.slug ? '✓ Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deleting === link.id}
                      >
                        {deleting === link.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
