"use client";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse["data"] | null>(null);
  function fmt(d?: string | null) {
    if (!d) return null;
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

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
          const errorMsg =
            "error" in json && json.error && json.message
              ? json.message
              : "Failed to load billing info";
          setError(errorMsg);
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
      if (!token) {
        toast({
          title: "Not authenticated",
          description: "Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Processing...",
        description: "Updating your plan.",
        variant: "info",
      });

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

      if (!res.ok || ("error" in json && json.error)) {
        const errorMsg =
          "error" in json && json.error && json.message
            ? json.message
            : "Failed to change plan";
        toast({
          title: "Failed to change plan",
          description: errorMsg,
          variant: "destructive",
          durationMs: 4000,
        });
        return;
      }

      if ("success" in json && json.success && json.data?.url) {
        toast({
          title: "Redirecting to checkout...",
          description: "You'll be redirected to complete your upgrade.",
          variant: "info",
        });
        window.location.href = json.data.url;
        return;
      }

      // Soft-refresh for changed=true cases
      toast({
        title: "Plan updated!",
        description: `Successfully changed to ${target.toUpperCase()}.`,
        variant: "success",
        durationMs: 3000,
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  // Cancellation path handled via changePlan('free') for immediate downgrade + enforcement

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted">
      {/* Page Header */}
      <div className="border-b border-border/40 bg-background/30 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription and billing settings
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {loading ? (
          <p className="mt-6 text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="mt-6 text-destructive">{error}</p>
        ) : me ? (
          <div className="mt-6 space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Current plan
                </div>
                <div className="text-lg font-medium text-foreground capitalize">
                  {me.plan}
                </div>
              </div>
              {me.activeSubscription ? (
                <span className="text-xs text-muted-foreground">
                  Status:{" "}
                  {me.activeSubscription.status ??
                    (me.activeSubscription.is_active ? "active" : "inactive")}
                </span>
              ) : me.plan === "plus" || me.plan === "pro" ? (
                <span className="text-xs text-muted-foreground">
                  Status: active (syncing)
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No active subscription
                </span>
              )}
            </div>
            {(me.activeSubscription ||
              me.plan === "plus" ||
              me.plan === "pro") && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {me.activeSubscription?.renews_at && (
                  <li>
                    Renews on:{" "}
                    <span className="text-foreground">
                      {fmt(me.activeSubscription.renews_at)}
                    </span>
                  </li>
                )}
                {!me.activeSubscription?.renews_at &&
                  me.activeSubscription?.current_period_end && (
                    <li>
                      Current period ends:{" "}
                      <span className="text-foreground">
                        {fmt(me.activeSubscription.current_period_end)}
                      </span>
                    </li>
                  )}
                {me.activeSubscription?.ends_at && (
                  <li>
                    Ends on:{" "}
                    <span className="text-foreground">
                      {fmt(me.activeSubscription.ends_at)}
                    </span>
                  </li>
                )}
                {!me.activeSubscription &&
                  (me.plan === "plus" || me.plan === "pro") && (
                    <li>
                      Subscription details are syncing. You can still manage
                      your plan below.
                    </li>
                  )}
              </ul>
            )}
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
                    Cancel Subscription
                  </button>
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
                    Cancel Subscription
                  </button>
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
      </div>
    </main>
  );
}
