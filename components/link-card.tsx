"use client";
import { LinkQrDialog } from "@/components/link-qr-dialog";
import { buttonVariants } from "@/components/ui/button";
import { UpgradePromptDialog } from "@/components/upgrade-prompt-dialog";
import { useLinkAnalytics } from "@/hooks/use-link-analytics";
import { isActivationExpired, isExpired } from "@/lib/expiration";
import { cn } from "@/lib/utils";
import type { Link as LinkType } from "@/types/link";
import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  link: LinkType;
  onCopy: (slug: string) => void;
  onDelete: (id: string) => void;
  copying?: boolean;
  deleting?: boolean;
  plan: "free" | "plus" | "pro";
  planLoading?: boolean;
};

export default function LinkCard({
  link,
  onCopy,
  onDelete,
  copying,
  deleting,
  plan,
  planLoading,
}: Props) {
  const { data: analytics } = useLinkAnalytics(link.id);
  const acts = useMemo(
    () => analytics?.activations ?? [],
    [analytics?.activations]
  );
  const currentIdx = useMemo(() => {
    if (!analytics?.current_activation_id) return 0;
    const idx = acts.findIndex((a) => a.id === analytics.current_activation_id);
    return idx >= 0 ? idx : 0;
  }, [analytics?.current_activation_id, acts]);
  const [index, setIndex] = useState<number>(currentIdx);
  const [qrOpen, setQrOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => setIndex(currentIdx), [currentIdx]);

  const displayed = acts[index] || null;
  const lifetimeClicks = analytics?.lifetime_clicks;

  const prev = () => {
    if (acts.length === 0) return;
    setIndex((i) => (i - 1 + acts.length) % acts.length);
  };
  const next = () => {
    if (acts.length === 0) return;
    setIndex((i) => (i + 1) % acts.length);
  };

  const canUseQr = plan === "plus" || plan === "pro";

  const handleQrClick = () => {
    if (planLoading) return;
    if (!canUseQr) {
      setUpgradeOpen(true);
      return;
    }
    setQrOpen(true);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl">
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <code className="rounded-lg bg-gradient-to-br from-muted to-background px-4 py-2 text-base font-semibold text-foreground shadow-sm">
                  /{link.slug}
                </code>
                {displayed ? (
                  !isActivationExpired({
                    mode: displayed.mode,
                    expires_at: displayed.expires_at,
                    click_limit: displayed.click_limit,
                    click_count: displayed.click_count,
                    deactivated_at: displayed.deactivated_at ?? null,
                  }) ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Expired
                    </span>
                  )
                ) : !isExpired(link) ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    Expired
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <span
                  className="truncate font-medium"
                  title={link.destination_url}
                >
                  {link.destination_url}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm sm:gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <svg
                      className="h-4 w-4 text-accent"
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
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                    <div className="font-semibold text-foreground">
                      {displayed ? displayed.click_count : link.click_count}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                    <svg
                      className="h-4 w-4 text-info"
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
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Mode</div>
                    <div className="font-semibold text-foreground">
                      {link.mode === "by_date" ? "Time-based" : "Click-based"}
                    </div>
                  </div>
                </div>
                {typeof lifetimeClicks === "number" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12h4l3 8 4-16 3 8h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Total clicks
                      </div>
                      <div className="font-semibold text-foreground">
                        {lifetimeClicks}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="ml-0 flex w-full flex-row gap-2 sm:ml-6 sm:w-auto sm:flex-col">
              <NextLink
                href={`/r/${link.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex flex-1 items-center justify-center gap-2 sm:flex-none"
                )}
                aria-label={`Open public link ${link.slug}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 3h7m0 0v7m0-7L10 14m-1 7H5a2 2 0 01-2-2v-4"
                  />
                </svg>
                View
              </NextLink>
              <NextLink
                href={`/links/${link.id}`}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "flex flex-1 items-center justify-center gap-2 sm:flex-none"
                )}
                aria-label={`Edit link ${link.slug}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4h2m-7 7h2m-2 4h8m2-9l3 3m0 0l-7 7H8l-1-4 7-7z"
                  />
                </svg>
                Edit
              </NextLink>
              <button
                onClick={() => onCopy(link.slug)}
                disabled={!!copying}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md disabled:opacity-50 sm:flex-none"
              >
                {copying ? (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleQrClick}
                disabled={planLoading}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none",
                  canUseQr
                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                    : "border-dashed border-primary text-primary hover:bg-primary/10"
                )}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 2h2m0 0h2m-2 0v-2m0 2v2"
                  />
                </svg>
                {canUseQr ? "QR code" : "Unlock QR"}
              </button>
              <button
                onClick={() => onDelete(link.id)}
                disabled={!!deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive bg-card px-4 py-2 text-sm font-medium text-destructive shadow-sm transition-all hover:bg-destructive/10 hover:shadow-md disabled:opacity-50 sm:flex-none"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="pointer-events-auto flex items-center gap-1 drop-shadow-sm">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
              disabled={acts.length <= 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-40"
              aria-label="Previous campaign"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.78 15.53a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06L9.31 10l3.47 3.47a.75.75 0 010 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
              disabled={acts.length <= 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-40"
              aria-label="Next campaign"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.22 4.47a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 11-1.06-1.06L10.69 10 7.22 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <span>
            {Math.min(index + 1, Math.max(1, acts.length || 1))} /{" "}
            {Math.max(1, acts.length || 1)}
          </span>
        </div>
      </div>
      <LinkQrDialog slug={link.slug} open={qrOpen} onOpenChange={setQrOpen} />
      <UpgradePromptDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
