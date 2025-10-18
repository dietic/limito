"use client";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLinks } from "@/hooks/use-links";
import { cn } from "@/lib/utils";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { userId, email, loading: authLoading } = useAuth();
  const { items, loading } = useLinks();

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading your dashboard...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    router.push("/login");
    return null;
  }

  const activeLinks = items.filter((link) => link.is_active);
  const totalClicks = items.reduce(
    (sum, link) => sum + (link.click_count || 0),
    0
  );
  const expiredLinks = items.filter((link) => !link.is_active);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-white/50 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-gray-600">Welcome back, {email}</p>
            </div>
            <div className="flex gap-3">
              <NextLink
                href="/links"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                All Links
              </NextLink>
              <NextLink
                href="/links/new"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "px-6 py-2 text-sm shadow-lg shadow-primary/30"
                )}
              >
                + Create Link
              </NextLink>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Links */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <svg
                    className="h-6 w-6 text-white"
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
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600">
                  Total Links
                </div>
                <div className="mt-2 text-4xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-10 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    items.length
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Links */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600">
                  Active Links
                </div>
                <div className="mt-2 text-4xl font-bold text-green-600">
                  {loading ? (
                    <div className="h-10 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    activeLinks.length
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Clicks */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
                  <svg
                    className="h-6 w-6 text-white"
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
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600">
                  Total Clicks
                </div>
                <div className="mt-2 text-4xl font-bold text-purple-600">
                  {loading ? (
                    <div className="h-10 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    totalClicks.toLocaleString()
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expired Links */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 opacity-10 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                  <svg
                    className="h-6 w-6 text-white"
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
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600">Expired</div>
                <div className="mt-2 text-4xl font-bold text-orange-600">
                  {loading ? (
                    <div className="h-10 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    expiredLinks.length
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Links */}
        {!loading && items.length > 0 && (
          <div className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recent Links</h2>
              <NextLink
                href="/links"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all →
              </NextLink>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {items.slice(0, 5).map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-6 transition-all hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <code className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900">
                          /{link.slug}
                        </code>
                        {link.is_active ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="mt-2 truncate text-sm text-gray-600">
                        → {link.destination_url}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
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
                          {link.click_count} clicks
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
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
                          {link.mode === "by_date"
                            ? "Time-based"
                            : "Click-based"}
                        </span>
                      </div>
                    </div>
                    <NextLink
                      href={`/links/${link.id}`}
                      className="ml-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
                    >
                      View
                    </NextLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/30">
              <svg
                className="h-12 w-12 text-white"
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
            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              No links yet
            </h3>
            <p className="mt-2 text-gray-600">
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
          </div>
        )}
      </div>
    </main>
  );
}
