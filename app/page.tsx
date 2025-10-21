import Brand from "@/components/brand";
import Faq from "@/components/faq-section";
import HeroVisual from "@/components/hero-visual";
import Pricing from "@/components/pricing-section";
import ThemeToggle from "@/components/theme-toggle";
export default function Page() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-info/10 blur-2xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Brand height={16} className="flex items-center" priority />
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                FAQ
              </a>
              <a
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent/90"
              >
                Get Started
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 to-background" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" />
              New: Click or date-based expiration, your choice
            </div>
            <h1 className="bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl">
              Create links that know when to stop
            </h1>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Share smarter. Set a time or click limit, track engagement, and
              let your links retire themselves — beautifully.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 sm:w-auto"
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 py-4 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted sm:w-auto"
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

          {/* Social proof */}
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="grid grid-cols-2 items-center gap-6 text-center text-sm text-muted-foreground sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                Fast setup
              </div>
              <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                Edge redirects
              </div>
              <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                Zero tracking bloat
              </div>
              <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                Privacy first
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <HeroVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/40 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful controls. Minimal effort.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Time-based expiration",
                description:
                  "Choose an exact date and time. For launches, promos, and events.",
                color: "from-primary to-primary/80",
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
              },
              {
                title: "Click-based limits",
                description:
                  "Expire after N clicks. Great for limited access and exclusives.",
                color: "from-accent to-accent/80",
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
              },
              {
                title: "Real-time analytics",
                description:
                  "See clicks and last activity instantly — no heavy dashboards.",
                color: "from-info to-info/80",
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
              {
                title: "Edge-fast redirects",
                description:
                  "Global edge network. Sub-100ms target for redirects.",
                color: "from-success to-success/80",
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
              },
              {
                title: "Privacy by default",
                description:
                  "No pixel soup. Just what you need to manage links.",
                color: "from-muted to-muted/80",
                iconText: "text-foreground",
                ring: true,
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
              },
              {
                title: "Smart fallbacks",
                description:
                  "Send users to a helpful destination after expiry.",
                color: "from-warning to-warning/80",
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
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${
                    f.color
                  } ${f.iconText ?? "text-primary-foreground"} shadow-lg ${
                    f.ring ? "ring-1 ring-border/70" : ""
                  }`}
                >
                  {f.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-card-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* FAQ Section */}
      <Faq />

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
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create",
                desc: "Paste your destination and pick expiration mode",
              },
              {
                step: "2",
                title: "Share",
                desc: "Copy your short link and send it anywhere",
              },
              {
                step: "3",
                title: "Track",
                desc: "See clicks and let it expire automatically",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border bg-card p-6 transition hover:shadow-md"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary text-primary-foreground shadow-sm">
                  <span className="text-sm font-bold">{s.step}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                  {s.title}
                </h3>
                <p className="mt-1 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border bg-gradient-to-br from-primary/90 via-primary to-accent/90 px-6 py-24 text-primary-foreground">
        <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="mx-auto h-full max-w-7xl">
            <div className="grid h-full grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="border-l border-primary-foreground/20"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to take control of your links?
          </h2>
          <p className="mt-6 text-xl text-primary-foreground/90">
            Join creators and teams using Limi.to for smarter link sharing
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
            <Brand height={22} className="flex items-center" />
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
