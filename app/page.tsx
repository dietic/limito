export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Limi.to
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            The cleanest way to create links that expire when you want.
          </p>
          <p className="mt-4 text-lg text-gray-500">
            Control your links — decide when they vanish.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a href="/login" className="btn-primary px-6 py-3 text-lg">
              Get Started Free
            </a>
            <a href="/dashboard" className="btn-ghost border border-gray-300 px-6 py-3 text-lg">
              View Dashboard
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Time-Based Expiration</h3>
            <p className="mt-2 text-sm text-gray-600">
              Set links to expire at a specific date and time. Perfect for limited-time offers.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Click-Based Limits</h3>
            <p className="mt-2 text-sm text-gray-600">
              Expire links after a set number of clicks. Ideal for exclusive content.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Basic Analytics</h3>
            <p className="mt-2 text-sm text-gray-600">
              Track clicks and monitor link performance with simple, clear metrics.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-center text-2xl font-semibold text-gray-900">How It Works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                1
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Create Link</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your destination URL and choose how it expires
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                2
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Share Link</h3>
              <p className="mt-2 text-sm text-gray-600">
                Copy your short link and share it anywhere
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                3
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Auto-Expire</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your link automatically stops working when conditions are met
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <div className="flex justify-center gap-6">
            <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
          </div>
          <p className="mt-4">© 2025 Limi.to. Simple, safe, and beautiful.</p>
        </footer>
      </div>
    </main>
  )
}

