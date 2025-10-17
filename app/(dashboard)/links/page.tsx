import Link from 'next/link'

export default function LinksPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Links</h1>
        <Link href="/links/new" className="btn-primary">New Link</Link>
      </div>
      <p className="mt-6 text-gray-700">Links will appear here after creation.</p>
    </main>
  )
}

