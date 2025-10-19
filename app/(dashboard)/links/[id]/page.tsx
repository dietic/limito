"use client";
import LinkForm, { type LinkFormValues } from "@/components/link-form";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLinks } from "@/hooks/use-links";
import { cn } from "@/lib/utils";
import type { Link } from "@/types/link";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LinkDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { userId, loading: authLoading } = useAuth();
  const { updateLink, deleteLink, refresh } = useLinks();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<Link | null>(null);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/links/${params.id}`);
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || "Failed to load");
        if (!canceled) setLink(payload.data as Link);
      } catch (e) {
        if (!canceled) setError((e as Error).message);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    if (params?.id) load();
    return () => {
      canceled = true;
    };
  }, [params?.id]);

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
              <h1 className="text-3xl font-bold text-foreground">Edit Link</h1>
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
                  Link Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update destination, expiration, and options
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <LinkForm
              initialValues={initial}
              submitLabel="Save"
              loading={saving}
              onSubmit={async (values) => {
                setSaving(true);
                const res = await updateLink(link.id, values);
                setSaving(false);
                if (!res.ok) {
                  alert(res.message || "Failed to save changes");
                  return;
                }
                await refresh();
                router.push("/links");
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
