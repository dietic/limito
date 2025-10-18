"use client";
import { useAuth } from "@/hooks/use-auth";
import { useLinks } from "@/hooks/use-links";
import type { Link as LinkType } from "@/types/link";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LinksPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const { items, loading, error, deleteLink } = useLinks();
  const [copying, setCopying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading your links...</span>
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

  const copyToClipboard = async (slug: string) => {
    setCopying(slug);
    const url = `${window.location.origin}/r/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setTimeout(() => setCopying(null), 2000);
    } catch {
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

  const filteredItems = items.filter((link) => {
    if (filter === "active") return link.is_active;
    if (filter === "expired") return !link.is_active;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-white/50 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Links</h1>
              <p className="mt-1 text-gray-600">
                {items.length} {items.length === 1 ? "link" : "links"} total
              </p>
            </div>
            <div className="flex gap-3">
              <NextLink
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                ← Dashboard
              </NextLink>
              <NextLink
                href="/links/new"
                className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/30"
              >
                + Create Link
              </NextLink>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading links...</span>
            </div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/30">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
              className="btn-primary mt-6 inline-flex px-8 py-3 shadow-lg shadow-primary/30"
            >
              Create Your First Link
            </NextLink>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filter === "active"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Active ({items.filter((l) => l.is_active).length})
              </button>
              <button
                onClick={() => setFilter("expired")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filter === "expired"
                    ? "bg-gray-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Expired ({items.filter((l) => !l.is_active).length})
              </button>
            </div>

            {/* Links Grid */}
            <div className="space-y-3">
              {filteredItems.map((link: LinkType) => (
                <div
                  key={link.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Slug & Status */}
                        <div className="flex items-center gap-3">
                          <code className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 px-4 py-2 text-base font-semibold text-gray-900 shadow-sm">
                            /{link.slug}
                          </code>
                          {link.is_active ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600"></span>
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Destination URL */}
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="truncate font-medium">{link.destination_url}</span>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Clicks</div>
                              <div className="font-semibold text-gray-900">{link.click_count}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Mode</div>
                              <div className="font-semibold text-gray-900">
                                {link.mode === "by_date" ? "Time-based" : "Click-based"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex flex-col gap-2">
                        <button
                          onClick={() => copyToClipboard(link.slug)}
                          disabled={copying === link.slug}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50"
                        >
                          {copying === link.slug ? (
                            <>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          disabled={deleting === link.id}
                          className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow-md disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleting === link.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No {filter} links
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Try changing the filter or create a new link
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
