"use client"
import { useState } from 'react'
import LinkForm from '@/components/link-form'
import { useLinks } from '@/hooks/use-links'
import { useRouter } from 'next/navigation'

export default function NewLinkPage() {
  const { createLink } = useLinks()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Create Link</h1>
      <p className="mt-2 text-gray-600">Create a new expiring link with custom settings.</p>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="mt-6">
        <LinkForm 
          loading={loading}
          onSubmit={async (values) => {
            setLoading(true)
            setError(null)
            const res = await createLink({ ...values })
            setLoading(false)
            if (res.ok) {
              router.push('/links')
            } else {
              setError(res.message || 'Failed to create link')
            }
          }} 
        />
      </div>
    </main>
  )
}
