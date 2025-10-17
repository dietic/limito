export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mt-10 text-center">
        <h1 className="text-3xl font-semibold">Limi.to</h1>
        <p className="mt-4 text-gray-700">The cleanest way to create links that expire when you want.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/dashboard" className="btn-primary">Open Dashboard</a>
          <a href="/r/demo" className="btn-accent">Try a Demo Link</a>
        </div>
      </div>
    </main>
  )
}

