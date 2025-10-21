// Server component (no hooks). Uses theme tokens and Tailwind utilities.
// Renders a product composite: Create form + Recent link card + tiny callouts.
export default function HeroVisual() {
  return (
    <div className="absolute inset-0">
      {/* Soft gradient background (keeps current aesthetic) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/15 to-info/15" />
      {/* Subtle grid mask for texture */}
      <div className="absolute inset-0 grid grid-cols-12 opacity-15 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-l border-border/60" />
        ))}
      </div>

      {/* Create Link form card */}
  <div className="absolute left-1/2 top-[6%] w-[90%] max-w-[520px] -translate-x-1/2 rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-sm sm:left-[6%] sm:top-[10%] sm:w-[46%] sm:translate-x-0">
        <div className="mb-3 text-sm font-semibold text-card-foreground">
          Create link
        </div>
        <div className="space-y-3">
          <label className="block">
            <div className="mb-1 text-xs text-muted-foreground">
              Destination URL
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
              https://example.com/
            </div>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode</span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <span className="bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                By clicks
              </span>
              <span className="px-3 py-1.5 text-xs text-muted-foreground">
                By date
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Click limit</span>
              <div className="w-14 rounded-md border border-border bg-background px-2 py-1 text-center text-xs">
                5
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              Optional slug (auto-generated if empty)
            </div>
            <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Flow hint removed per feedback (keep scene minimal and clean) */}

      {/* Recent Links card */}
  <div className="absolute bottom-[6%] left-1/2 w-[90%] max-w-[500px] -translate-x-1/2 rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-sm sm:bottom-[10%] sm:left-auto sm:right-[6%] sm:w-[44%] sm:translate-x-0">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-card-foreground">
            Recent link
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-muted px-2 py-1 text-foreground">
              /launch
            </code>
            <span className="truncate text-muted-foreground">
              → https://example.com/
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 15l-2 5L9 9l11 4-5 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              4 clicks
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M12 8v4l3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Auto-expire after 5 clicks
            </span>
          </div>
          {/* Tiny sparkline */}
          <svg
            className="mt-2 h-8 w-full"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="hsl(var(--info))"
              strokeWidth="2"
              points="0,20 15,18 25,14 35,16 45,10 55,8 65,12 75,9 85,6 95,8 100,5"
            />
          </svg>
        </div>
      </div>

      {/* Callouts */}
      <div className="absolute left-[8%] top-[4%] hidden rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur sm:block">
        Edge-fast redirects
      </div>
      <div className="absolute bottom-[6%] right-[8%] hidden rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur sm:block">
        Auto-expire
      </div>
    </div>
  );
}
