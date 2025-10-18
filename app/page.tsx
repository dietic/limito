export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <span className="text-sm font-bold text-primary-foreground">
                  L
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">Limi.to</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </a>
              <a
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent/90"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Free for individuals
            </div>
            <h1 className="bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl">
              Links that know when to disappear
            </h1>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Create expiring links with precision. Set time limits or click
              caps, track performance, and control exactly when your links stop
              working.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition hover:bg-accent/90 sm:w-auto"
              >
                Start creating links
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-background px-8 py-4 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted sm:w-auto"
              >
                See how it works
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · Free forever for basic use
            </p>
          </div>

          {/* Visual Element */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to manage expiring links
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple, powerful, and designed for modern link sharing
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Time-based expiration",
                description:
                  "Set precise expiry dates and times. Perfect for limited offers, events, or time-sensitive content.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                ),
                title: "Click-based limits",
                description:
                  "Expire links after a specific number of clicks. Great for exclusive content and limited access.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: "Real-time analytics",
                description:
                  "Track clicks, view performance metrics, and understand your link engagement at a glance.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "Lightning fast",
                description:
                  "Edge-optimized redirects under 100ms. Your users won't even notice they're being redirected.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
                title: "Secure & private",
                description:
                  "Your data is encrypted, your links are protected, and we never sell your information.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ),
                title: "Custom fallbacks",
                description:
                  "Redirect expired links to custom URLs instead of showing an error page.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg ${
                    i % 3 === 0
                      ? "bg-gradient-to-br from-primary to-primary/80 shadow-primary/30"
                      : i % 3 === 1
                      ? "bg-gradient-to-br from-accent to-accent/80 shadow-accent/30"
                      : "bg-gradient-to-br from-info to-info/80 shadow-info/30"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Create your first link in seconds
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to start managing expiring links
            </p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your link",
                desc: "Enter your destination URL and choose how it should expire",
              },
              {
                step: "02",
                title: "Share anywhere",
                desc: "Copy your short link and share it via email, social, or anywhere",
              },
              {
                step: "03",
                title: "Track & manage",
                desc: "Monitor clicks and let your link expire automatically",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-muted/50">
                  {item.step}
                </div>
                <h3 className="-mt-10 ml-16 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="ml-16 mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-br from-primary via-primary to-accent px-6 py-24 text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to take control of your links?
          </h2>
          <p className="mt-6 text-xl text-primary-foreground/90">
            Join thousands using Limi.to to create smarter, safer links
          </p>
          <div className="mt-10">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-background px-8 py-4 text-base font-semibold text-foreground shadow-xl transition hover:bg-background/90"
            >
              Start for free
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-primary to-primary/80">
                <span className="text-xs font-bold text-primary-foreground">
                  L
                </span>
              </div>
              <span className="font-semibold text-foreground">Limi.to</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground">
                Privacy
              </a>
              <a href="/terms" className="hover:text-foreground">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 Limi.to. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
