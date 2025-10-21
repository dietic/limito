"use client";
import LinkForm, { type LinkFormValues } from "@/components/link-form";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLinks } from "@/hooks/use-links";
import { isExpired } from "@/lib/expiration";
import { cn } from "@/lib/utils";
import type { Link } from "@/types/link";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LinkDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { userId, loading: authLoading, getAccessToken } = useAuth();
  const { updateLink, deleteLink, refresh } = useLinks();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<Link | null>(null);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        // Wait for auth to be ready and require a token
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Unauthorized");
        }
        const res = await fetch(`/api/links/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || "Failed to load");
        if (!canceled) setLink(payload.data as Link);
      } catch (e) {
        if (!canceled) setError((e as Error).message);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    if (!params?.id) return;
    if (authLoading) return; // wait for auth ready
    if (!userId) {
      setLoading(false);
      return;
    }
    load();
    return () => {
      canceled = true;
    };
  }, [params?.id, authLoading, userId, getAccessToken]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading link...</span>
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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
          <NextLink
            href="/links"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
          >
            ← Back to Links
          </NextLink>
        </div>
      </main>
    );
  }

  if (!link) return null;

  const expired = isExpired(link);

  const initial: Partial<LinkFormValues> = {
    destination_url: link.destination_url,
    fallback_url: link.fallback_url ?? undefined,
    mode: link.mode,
    expires_at: link.expires_at ?? undefined,
    click_limit: link.click_limit ?? undefined,
    slug: link.slug,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-background/70 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {expired ? "Link Expired" : "Edit Link"}
              </h1>
              <p className="mt-1 text-muted-foreground">/{link.slug}</p>
            </div>
            <div className="flex gap-3">
              <NextLink
                href="/links"
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
              >
                ← Back to Links
              </NextLink>
              <button
                onClick={async () => {
                  if (
                    !confirm("Delete this link? This action cannot be undone.")
                  )
                    return;
                  const res = await deleteLink(link.id);
                  if (!res.ok) {
                    alert(res.message || "Failed to delete");
                    return;
                  }
                  await refresh();
                  router.push("/links");
                }}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-destructive text-destructive hover:bg-destructive/10"
                )}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {saving && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-info/30 bg-info/10 p-4 text-info">
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
                d="M12 8v4l3 3"
              />
            </svg>
            <span className="text-sm">Saving changes...</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <svg
                  className="h-6 w-6 text-primary-foreground"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {expired ? "Expired Link" : "Link Details"}
                </h2>
                {expired ? (
                  <p className="text-sm text-muted-foreground">
                    This link has expired. Reactivate it to keep the same slug
                    and start a new campaign. Your previous campaign metrics
                    will be preserved in history.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Update destination, expiration, and options
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {expired ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-warning">
                  You cannot edit an expired link. Reactivate to create a new
                  campaign while keeping the slug.
                </div>
                <div className="grid gap-3 sm:flex">
                  <button
                    onClick={async () => {
                      // Reactivate flow: prompt for new expiration config based on current mode
                      try {
                        if (link.mode === "by_date") {
                          const def = new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                          ).toISOString();
                          const input = prompt(
                            "Set a new expiration date (ISO, e.g., 2025-11-01T12:00:00Z)",
                            def
                          );
                          if (!input) return;
                          const ts = Date.parse(input);
                          if (!Number.isFinite(ts) || ts <= Date.now()) {
                            alert("Please enter a future ISO datetime.");
                            return;
                          }
                          setSaving(true);
                          const res = await updateLink(link.id, {
                            reactivate: true,
                            mode: "by_date",
                            expires_at: new Date(ts).toISOString(),
                          });
                          setSaving(false);
                          if (!res.ok) {
                            alert(res.message || "Failed to reactivate link");
                            return;
                          }
                          setLink(res.data as Link);
                          await refresh();
                        } else {
                          const def = String(link.click_limit ?? 10);
                          const input = prompt(
                            "Set a new click limit (> 0)",
                            def
                          );
                          if (!input) return;
                          const n = Number(input);
                          if (!Number.isFinite(n) || n <= 0) {
                            alert("Click limit must be a positive number.");
                            return;
                          }
                          setSaving(true);
                          const res = await updateLink(link.id, {
                            reactivate: true,
                            mode: "by_clicks",
                            click_limit: Math.floor(n),
                          });
                          setSaving(false);
                          if (!res.ok) {
                            alert(res.message || "Failed to reactivate link");
                            return;
                          }
                          setLink(res.data as Link);
                          await refresh();
                        }
                      } catch (e) {
                        setSaving(false);
                        alert(
                          (e as Error).message || "Failed to reactivate link"
                        );
                      }
                    }}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-success text-success hover:bg-success/10"
                    )}
                  >
                    Reactivate (keep slug)
                  </button>
                  <NextLink
                    href="/links"
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
                  >
                    Back to Links
                  </NextLink>
                </div>
              </div>
            ) : (
              <LinkForm
                initialValues={initial}
                submitLabel="Save"
                loading={saving}
                onSubmit={async (values) => {
                  setSaving(true);
                  const normalized = {
                    ...values,
                    // If user leaves slug empty => request regeneration by sending empty string
                    slug:
                      values.slug === undefined
                        ? undefined
                        : values.slug.trim().length > 0
                        ? values.slug.trim()
                        : "",
                  };
                  const res = await updateLink(link.id, normalized);
                  setSaving(false);
                  if (!res.ok) {
                    alert(res.message || "Failed to save changes");
                    return;
                  }
                  await refresh();
                  router.push("/links");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
