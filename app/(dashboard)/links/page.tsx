'use client'
import NextLink from 'next/link'
import { useLinks } from '@/hooks/use-links'

export default function LinksPage() {
  const { items, loading, error, deleteLink } = useLinks()
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Links</h1>
        <NextLink href="/links/new" className="btn-primary">New Link</NextLink>
      </div>
      {loading ? (
        <p className="mt-6 text-gray-700">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-gray-700">No links yet.</p>
      ) : (
        <div className="mt-6 divide-y rounded-md border">
          {items.map(l => (
            <div key={l.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="truncate text-sm text-gray-900">/r/{l.slug}</div>
                <div className="truncate text-xs text-gray-600">{l.destination_url}</div>
              </div>
              <div className="flex items-center gap-2">
                <NextLink href={`/r/${l.slug}`} className="btn-ghost underline" target="_blank">Open</NextLink>
                <button className="btn-ghost text-red-600" onClick={() => deleteLink(l.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
