"use client";
import LinkForm from "@/components/link-form";
import Button, { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const [link, setLink] = useState<Link | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState<string>("");

  // Reactivate dialog state
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateMode, setReactivateMode] = useState<"by_date" | "by_clicks">(
    "by_date"
  );
  const [reactivateDate, setReactivateDate] = useState<string>("");
  const [reactivateClicks, setReactivateClicks] = useState<string>("10");
  const [reactivateError, setReactivateError] = useState<string>("");

  // Load link details
  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Unauthorized");
        }
        const res = await fetch(`/api/links/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.message || "Failed to load link");
        }
        if (!canceled) {
          const l = payload.data as Link;
          setLink(l);
          // seed reactivate defaults from existing
          if (l.mode === "by_date") {
            const def = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 16);
            setReactivateDate(def);
            setReactivateMode("by_date");
          } else {
            setReactivateClicks(String(l.click_limit ?? 10));
            setReactivateMode("by_clicks");
          }
        }
      } catch (e) {
        if (!canceled) {
          setMessageText((e as Error).message || "Failed to load link");
          setMessageOpen(true);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    if (params?.id) load();
    return () => {
      canceled = true;
    };
  }, [params?.id, getAccessToken]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading link…</span>
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

  const expired = link ? isExpired(link) : false;

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
              {link && (
                <p className="mt-1 text-muted-foreground">/{link.slug}</p>
              )}
            </div>
            <div className="flex gap-3">
              <NextLink
                href="/links"
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
              >
                ← Back to Links
              </NextLink>
              <Button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-destructive text-destructive hover:bg-destructive/10"
                )}
                disabled={!link}
              >
                Delete
              </Button>
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
            {loading || !link ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : expired ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-warning">
                  You cannot edit an expired link. Reactivate to create a new
                  campaign while keeping the slug.
                </div>
                <div className="grid gap-3 sm:flex">
                  <Button
                    type="button"
                    onClick={() => {
                      setReactivateError("");
                      setReactivateOpen(true);
                    }}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "bg-success text-success-foreground hover:bg-success/90"
                    )}
                  >
                    Reactivate (keep slug)
                  </Button>
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
                initialValues={
                  link
                    ? {
                        destination_url: link.destination_url,
                        fallback_url: link.fallback_url ?? undefined,
                        mode: link.mode,
                        expires_at: link.expires_at ?? undefined,
                        click_limit: link.click_limit ?? undefined,
                        slug: link.slug,
                      }
                    : {}
                }
                submitLabel="Save"
                loading={saving}
                onSubmit={async (values) => {
                  setSaving(true);
                  const normalized = {
                    ...values,
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
                    setMessageText(res.message || "Failed to save changes");
                    setMessageOpen(true);
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

      {/* Reactivate Dialog */}
      <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <DialogHeader>
          <DialogTitle>Reactivate link (keep slug)</DialogTitle>
          <DialogDescription>
            Set a new expiration configuration for this campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-1">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={reactivateMode === "by_date" ? "default" : "ghost"}
              onClick={() => setReactivateMode("by_date")}
            >
              By date
            </Button>
            <Button
              type="button"
              variant={reactivateMode === "by_clicks" ? "default" : "ghost"}
              onClick={() => setReactivateMode("by_clicks")}
            >
              By clicks
            </Button>
          </div>
          {reactivateMode === "by_date" ? (
            <div>
              <label className="block text-sm font-medium text-foreground">
                Expires at
              </label>
              <Input
                type="datetime-local"
                className="mt-1"
                value={reactivateDate}
                onChange={(e) => setReactivateDate(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be a future date/time.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground">
                Click limit
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                className="mt-1"
                value={reactivateClicks}
                onChange={(e) => setReactivateClicks(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be a positive integer.
              </p>
            </div>
          )}
          {reactivateError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
              {reactivateError}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setReactivateOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (!link) return;
                setReactivateError("");
                if (reactivateMode === "by_date") {
                  if (!reactivateDate) {
                    setReactivateError("Please pick a date/time.");
                    return;
                  }
                  const iso = new Date(reactivateDate).toISOString();
                  if (!isValidFutureIso(iso)) {
                    setReactivateError("Please enter a future date/time.");
                    return;
                  }
                  setSaving(true);
                  const res = await updateLink(link.id, {
                    reactivate: true,
                    mode: "by_date",
                    expires_at: iso,
                  });
                  setSaving(false);
                  if (!res.ok) {
                    setMessageText(res.message || "Failed to reactivate link");
                    setMessageOpen(true);
                    return;
                  }
                  setLink(res.data as Link);
                  setReactivateOpen(false);
                  await refresh();
                } else {
                  const n = Number(reactivateClicks);
                  if (!Number.isFinite(n) || n <= 0) {
                    setReactivateError(
                      "Click limit must be a positive number."
                    );
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
                    setMessageText(res.message || "Failed to reactivate link");
                    setMessageOpen(true);
                    return;
                  }
                  setLink(res.data as Link);
                  setReactivateOpen(false);
                  await refresh();
                }
              } catch (e) {
                setSaving(false);
                setMessageText(
                  (e as Error).message || "Failed to reactivate link"
                );
                setMessageOpen(true);
              }
            }}
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-success text-success-foreground hover:bg-success/90"
            )}
          >
            Save & Reactivate
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogHeader>
          <DialogTitle>Delete link</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the link
            and its campaign history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={async () => {
              if (!link) return;
              const res = await deleteLink(link.id);
              if (!res.ok) {
                setMessageText(res.message || "Failed to delete link");
                setMessageOpen(true);
                return;
              }
              await refresh();
              router.push("/links");
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Message Dialog (errors/info) */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogHeader>
          <DialogTitle>Notice</DialogTitle>
        </DialogHeader>
        <div className="px-1 text-sm text-foreground">{messageText}</div>
        <DialogFooter>
          <Button onClick={() => setMessageOpen(false)}>OK</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}

function isValidFutureIso(ts: string): boolean {
  const d = Date.parse(ts);
  return Number.isFinite(d) && d > Date.now();
}
