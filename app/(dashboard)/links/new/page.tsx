import LinkForm from '@/components/link-form'

export default function NewLinkPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Create Link</h1>
      <div className="mt-6">
        <LinkForm />
      </div>
    </main>
  )
}

