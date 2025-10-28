"use client";
import LinkCard from "@/components/link-card";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useLinks } from "@/hooks/use-links";
import { usePlan } from "@/hooks/use-plan";
import { cn } from "@/lib/utils";
import type { Link as LinkType } from "@/types/link";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function LinksPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const initialLimit = (() => {
    const v = Number(search.get("limit") ?? 10);
    return Number.isFinite(v) && v > 0 && v <= 100 ? v : 10;
  })();
  const { userId, loading: authLoading } = useAuth();
  const { plan: userPlan, loading: planLoading, error: planError } = usePlan();
  const planErrorShown = useRef(false);
  const {
    items,
    loading,
    error,
    deleteLink,
    refresh,
    total,
    offset,
    hasMore,
    counts,
  } = useLinks({
    limit: initialLimit,
    filter:
      (search.get("filter") as "all" | "active" | "expired" | null) ?? "all",
    offset: Number(search.get("offset") ?? 0),
  });
  const [copying, setCopying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "expired">(
    (search.get("filter") as "all" | "active" | "expired") || "all"
  );
  const [pageSize, setPageSize] = useState<number>(initialLimit);
  useEffect(() => {
    if (planError && !planErrorShown.current) {
      toast({
        title: "Plan info unavailable",
        description: planError,
        variant: "destructive",
      });
      planErrorShown.current = true;
    }
    if (!planError) {
      planErrorShown.current = false;
    }
  }, [planError, toast]);

  // Keep URL in sync when filter, offset or page size changes
  useEffect(() => {
    const params = new URLSearchParams(search.toString());
    if (filter && filter !== "all") params.set("filter", filter);
    else params.delete("filter");
    if (typeof offset === "number" && offset > 0)
      params.set("offset", String(offset));
    else params.delete("offset");
    if (typeof pageSize === "number" && pageSize > 0)
      params.set("limit", String(pageSize));
    const qs = params.toString();
    const next = qs ? `/links?${qs}` : "/links";
    // Only replace if the URL would actually change, to avoid redundant navigations
    if (typeof window !== "undefined") {
      const current = window.location.pathname + window.location.search;
      if (current !== next) router.replace(next);
    } else {
      router.replace(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, offset, pageSize]);

  const copyToClipboard = async (slug: string) => {
    setCopying(slug);
    const url = `${window.location.origin}/r/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied",
        description: "Link URL copied to clipboard",
        variant: "success",
      });
      setTimeout(() => setCopying(null), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "We couldn't copy the URL",
        variant: "destructive",
      });
      setCopying(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this link? This action cannot be undone.")) return;
    setDeleting(id);
    const result = await deleteLink(id);
    if (!result.ok) {
      alert(result.message || "Failed to delete link");
    }
    setDeleting(null);
  };

  const shownItems = items; // server already applied filter & pagination

  const pageFrom = (offset ?? 0) + (shownItems.length > 0 ? 1 : 0);
  const pageTo = (offset ?? 0) + shownItems.length;

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>Loading your links...</span>
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted">
      {/* Page Header */}
      <div className="border-b border-border/40 bg-background/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Your Links</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === "all" && typeof total === "number"
                  ? `${total} ${total === 1 ? "link" : "links"} total`
                  : `${shownItems.length} ${
                      shownItems.length === 1 ? "result" : "results"
                    } on this page`}
              </p>
            </div>
            <NextLink
              href="/links/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "inline-flex items-center gap-2 shadow-lg shadow-primary/30"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Link
            </NextLink>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex w-full items-center justify-between gap-3">
              <div className="text-sm">
                <div>{error}</div>
                {(/Database not initialized/i.test(error) ||
                  /schema cache/i.test(error)) && (
                  <div className="mt-2 text-xs text-destructive/90">
                    Tip: Apply Supabase migrations to create required tables.
                    You can use the Supabase SQL editor to run the files in{" "}
                    <code className="rounded bg-destructive/20 px-1 py-0.5">
                      supabase/migrations
                    </code>
                    . Schema cache may take up to ~30s to refresh.
                  </div>
                )}
              </div>
              <button
                onClick={() => refresh()}
                className="rounded-md border border-destructive/30 bg-destructive/20 px-3 py-1.5 text-sm font-medium text-destructive shadow-sm transition-colors hover:bg-destructive/25"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading state moved below tabs */}
        {/* Filter Tabs (always visible) */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1 shadow-sm sm:flex-nowrap">
          <button
            onClick={() => {
              setFilter("all");
              refresh({ limit: pageSize, offset: 0, filter: "all" });
            }}
            disabled={loading}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 sm:px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-60",
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All{typeof counts?.all === "number" ? ` (${counts.all})` : ""}
          </button>
          <button
            onClick={() => {
              setFilter("active");
              refresh({ limit: pageSize, offset: 0, filter: "active" });
            }}
            disabled={loading}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 sm:px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-60",
              filter === "active"
                ? "bg-success text-success-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Active
            {typeof counts?.active === "number" ? ` (${counts.active})` : ""}
          </button>
          <button
            onClick={() => {
              setFilter("expired");
              refresh({ limit: pageSize, offset: 0, filter: "expired" });
            }}
            disabled={loading}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 sm:px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-60",
              filter === "expired"
                ? "bg-muted text-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Expired
            {typeof counts?.expired === "number" ? ` (${counts.expired})` : ""}
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading links...</span>
            </div>
          </div>
        )}

        {/* Empty states tailored to filter */}
        {!loading && items.length === 0 && (
          <div className="mt-12 text-center">
            {filter === "all" ? (
              <>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
                  <svg
                    className="h-12 w-12 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">
                  No links yet
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Create your first expiring link to get started
                </p>
                <NextLink
                  href="/links/new"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "mt-6 inline-flex shadow-lg shadow-primary/30"
                  )}
                >
                  Create Your First Link
                </NextLink>
              </>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No {filter} links
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another filter or create a new link
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setFilter("all");
                      refresh({ limit: pageSize, offset: 0, filter: "all" });
                    }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted"
                  >
                    View all
                  </button>
                  <NextLink
                    href="/links/new"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "px-4 py-2 text-sm"
                    )}
                  >
                    + Create Link
                  </NextLink>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links Grid (server-paginated) */}
        {!loading && items.length > 0 && (
          <>
            <div className="space-y-3">
              {shownItems.map((link: LinkType) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onCopy={copyToClipboard}
                  onDelete={handleDelete}
                  copying={copying === link.slug}
                  deleting={deleting === link.id}
                  plan={userPlan ?? "free"}
                  planLoading={planLoading}
                />
              ))}
            </div>

            {/* Pagination Controls (server) */}
            {shownItems.length > 0 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm shadow-sm sm:flex-row">
                <div className="text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {pageFrom || 0}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-foreground">
                    {pageTo}
                  </span>
                  {filter === "all" && typeof total === "number" && (
                    <>
                      {" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {total}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="text-muted-foreground">Rows:</span>
                    <div className="flex overflow-hidden rounded-lg border border-border bg-card">
                      {[10, 25, 50].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setPageSize(n);
                            refresh({ limit: n, offset: 0, filter });
                          }}
                          className={cn(
                            "px-3 py-2 text-foreground transition-colors hover:bg-muted",
                            n === pageSize && "bg-muted font-semibold"
                          )}
                          aria-pressed={n === pageSize}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const nextOffset = Math.max(0, (offset ?? 0) - pageSize);
                      refresh({
                        limit: pageSize,
                        offset: nextOffset,
                        filter,
                      });
                    }}
                    disabled={loading || (offset ?? 0) === 0}
                    className={cn(
                      "rounded-lg border border-border bg-card px-3 py-2 font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    aria-label="Previous page"
                  >
                    ← Prev
                  </button>
                  <div className="rounded-lg border border-border bg-background px-3 py-2 text-muted-foreground">
                    {typeof total === "number" &&
                    typeof pageSize === "number" ? (
                      <>
                        Page{" "}
                        <span className="font-semibold text-foreground">
                          {Math.floor((offset ?? 0) / pageSize + 1)}
                        </span>{" "}
                        / {Math.max(1, Math.ceil(total / pageSize))}
                      </>
                    ) : (
                      <>Page</>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const nextOffset = (offset ?? 0) + pageSize;
                      refresh({
                        limit: pageSize,
                        offset: nextOffset,
                        filter,
                      });
                    }}
                    disabled={loading || !hasMore}
                    className={cn(
                      "rounded-lg border border-border bg-card px-3 py-2 font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function LinksPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading links...</span>
            </div>
          </div>
        </main>
      }
    >
      <LinksPageInner />
    </Suspense>
  );
}
