"use client";
import LinkForm from "@/components/link-form";
import { useLinks } from "@/hooks/use-links";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewLinkPage() {
  const { createLink } = useLinks();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-background/70 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Create Link
              </h1>
              <p className="mt-1 text-muted-foreground">
                Set up your expiring link with custom settings
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <NextLink
                href="/links"
                className="block rounded-lg border border-border bg-card px-4 py-2 text-center text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
              >
                ← Back to Links
              </NextLink>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Success State */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-success">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <span className="text-sm font-medium">
                Link created successfully!
              </span>
              <p className="mt-1 text-sm">Redirecting to your links...</p>
            </div>
          </div>
        )}

        {/* Error State */}
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
            <div className="flex-1">
              <span className="text-sm font-medium">Failed to create link</span>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Steps Indicator */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary text-primary-foreground shadow-lg shadow-primary/30">
              <span className="text-sm font-bold">1</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Destination
              </div>
              <div className="text-xs text-muted-foreground">
                Where to redirect
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent text-accent-foreground shadow-lg shadow-accent/30">
              <span className="text-sm font-bold">2</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Expiration
              </div>
              <div className="text-xs text-muted-foreground">
                When to expire
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-success to-success text-success-foreground shadow-lg shadow-success/30">
              <span className="text-sm font-bold">3</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Options
              </div>
              <div className="text-xs text-muted-foreground">
                Customize behavior
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Link Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in the information below
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <LinkForm
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                setError(null);
                setSuccess(false);
                const res = await createLink({ ...values });
                setLoading(false);
                if (res.ok) {
                  setSuccess(true);
                  setTimeout(() => {
                    router.push("/links");
                  }, 1500);
                } else {
                  setError(res.message || "Failed to create link");
                }
              }}
            />
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 rounded-2xl border border-info/30 bg-info/10 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-info text-info-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                Quick tips
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-info">•</span>
                  <span>
                    <strong>Time-based expiration:</strong> Link expires after a
                    specific date/time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-info">•</span>
                  <span>
                    <strong>Click-based expiration:</strong> Link expires after
                    a set number of clicks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-info">•</span>
                  <span>
                    <strong>Fallback URL:</strong> Where to redirect users after
                    link expires (optional)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
