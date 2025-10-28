"use client";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type MeResponse = {
  success: true;
  data: {
    plan: string;
    activeSubscription: null | {
      provider: string;
      provider_subscription_id: string | null;
      status: string | null;
      is_active: boolean | null;
      current_period_end: string | null;
      renews_at: string | null;
      ends_at: string | null;
      variant_id: number | null;
    };
  };
};

export default function BillingPage() {
  const { userId, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse["data"] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/billing/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as
          | MeResponse
          | { error: true; message: string }
          | { success: false };
        if (!mounted) return;
        if (
          !res.ok ||
          ("error" in json && json.error) ||
          ("success" in json && !json.success)
        ) {
          setError("Failed to load billing info");
        } else {
          setMe((json as MeResponse).data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getAccessToken, userId]);

  async function changePlan(target: "free" | "plus" | "pro") {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: target }),
      });
      const json = (await res.json()) as
        | { success: true; data: { changed?: boolean; url?: string } }
        | { error: true; message: string };
      if (!res.ok || ("error" in json && json.error)) return;
      if ("success" in json && json.success && json.data?.url) {
        window.location.href = json.data.url;
        return;
      }
      // Soft-refresh for changed=true cases
      window.location.reload();
    } catch {}
  }

  async function cancelSubscription() {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      window.location.reload();
    } catch {}
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
      {loading ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-destructive">{error}</p>
      ) : me ? (
        <div className="mt-6 space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Current plan</div>
              <div className="text-lg font-medium text-foreground capitalize">
                {me.plan}
              </div>
            </div>
            {me.activeSubscription ? (
              <span className="text-xs text-muted-foreground">
                Status: {me.activeSubscription.status ?? "unknown"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                No active subscription
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Upgrade/Downgrade actions */}
            {me.plan === "plus" && (
              <>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "default" }))}
                  onClick={() => changePlan("pro")}
                >
                  Upgrade to Pro
                </button>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() => changePlan("free")}
                >
                  Downgrade to Free
                </button>
                {me.activeSubscription && (
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                    onClick={cancelSubscription}
                  >
                    Cancel subscription
                  </button>
                )}
              </>
            )}
            {me.plan === "pro" && (
              <>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "default" }))}
                  onClick={() => changePlan("plus")}
                >
                  Downgrade to Plus
                </button>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() => changePlan("free")}
                >
                  Downgrade to Free
                </button>
                {me.activeSubscription && (
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                    onClick={cancelSubscription}
                  >
                    Cancel subscription
                  </button>
                )}
              </>
            )}
            {me.plan !== "plus" && me.plan !== "pro" && (
              <>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "default" }))}
                  onClick={() => changePlan("plus")}
                >
                  Upgrade to Plus
                </button>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() => changePlan("pro")}
                >
                  Upgrade to Pro
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
