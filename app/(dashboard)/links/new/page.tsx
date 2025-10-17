"use client"
import LinkForm from '@/components/link-form'
import { useLinks } from '@/hooks/use-links'
import { useRouter } from 'next/navigation'

export default function NewLinkPage() {
  const { createLink } = useLinks()
  const router = useRouter()
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Create Link</h1>
      <div className="mt-6">
        <LinkForm onSubmit={async (values) => {
          const res = await createLink(values)
          if (res.ok) router.push('/links')
        }} />
      </div>
    </main>
  )
}
