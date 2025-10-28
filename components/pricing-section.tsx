"use client";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useAbVariant } from "@/lib/ab";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PricingSection() {
  const { userId, getAccessToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const autoRanRef = useRef(false);
  const priceDefault = useAbVariant(
    "pricing_default",
    ["monthly", "yearly"],
    "yearly"
  );
  const [yearly, setYearly] = useState(priceDefault === "yearly");
  useEffect(() => {
    setYearly(priceDefault === "yearly");
  }, [priceDefault]);

  const plans = [
    {
      name: "Free",
      monthly: 0,
      yearly: 0,
      description: "Everything you need to create and manage expiring links.",
      features: [
        "Create time or click-based links",
        "Basic analytics",
        "Smart fallback URL",
        "Reasonable limits",
      ],
      cta: { label: "Start for free", href: "/login" },
      highlight: false,
    },
    {
      name: "Plus",
      monthly: 6,
      yearly: 60,
      description: "More headroom for active projects and campaigns.",
      features: [
        "Higher limits",
        "Priority redirect capacity",
        "Click trends (24h)",
        "Email support (soon)",
      ],
      cta: { label: "Upgrade to Plus", href: "/api/upgrade/plus" },
      highlight: true,
    },
    {
      name: "Pro",
      monthly: 12,
      yearly: 120,
      description: "For power users and teams who need higher limits.",
      features: [
        "Max limits",
        "Fastest redirects",
        "Advanced analytics (soon)",
        "Priority support (soon)",
      ],
      cta: { label: "Upgrade to Pro", href: "/api/upgrade/pro" },
      highlight: false,
    },
  ];

  const startCheckout = useCallback(
    async (plan: "plus" | "pro") => {
      if (!userId) {
        const redirect = encodeURIComponent(`/pricing?upgrade=${plan}`);
        router.push(`/login?redirect=${redirect}`);
        return;
      }
      const token = await getAccessToken();
      if (!token) {
        const redirect = encodeURIComponent(`/pricing?upgrade=${plan}`);
        router.push(`/login?redirect=${redirect}`);
        return;
      }
      const res = await fetch("/api/billing/checkouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { url: string };
        message?: string;
      };
      if (!res.ok || !json.success || !json.data) {
        const message =
          json?.message || "Unable to start checkout. Please try again.";
        toast({
          title: "Checkout error",
          description: message,
          variant: "destructive",
          durationMs: 4000,
        });
        return;
      }
      window.location.href = json.data.url;
    },
    [userId, getAccessToken, router, toast]
  );

  // Auto-start checkout if we were redirected back with ?upgrade=plus|pro and the user is authenticated
  useEffect(() => {
    if (autoRanRef.current) return;
    const u =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("upgrade")
        : null;
    if (!u) return;
    if (!userId) return; // will run after login
    if (u !== "plus" && u !== "pro") return;
    autoRanRef.current = true;
    startCheckout(u);
  }, [userId, startCheckout]);

  return (
    <section
      id="pricing"
      className="border-t border-border bg-muted/40 px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-pressed={!yearly}
            className={cn(
              buttonVariants({ variant: yearly ? "outline" : "default" }),
              "px-5"
            )}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={yearly}
            className={cn(
              buttonVariants({ variant: yearly ? "default" : "outline" }),
              "px-5"
            )}
            onClick={() => setYearly(true)}
          >
            Yearly
          </button>
          {yearly && (
            <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
              2 months free
            </span>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const price = yearly ? p.yearly : p.monthly;
            const suffix = yearly ? "/year" : "/mo";
            return (
              <div
                key={p.name}
                className={cn(
                  "relative rounded-2xl border border-border bg-card p-8 shadow-sm",
                  p.highlight && "ring-1 ring-primary/40 shadow-primary/10"
                )}
              >
                {p.highlight && (
                  <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-card-foreground">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price !== 0 && (
                    <span className="pb-1 text-sm text-muted-foreground">
                      {suffix}
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {p.name === "Free" ? (
                    <a
                      href={p.cta.href}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full"
                      )}
                    >
                      {p.cta.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startCheckout(p.name.toLowerCase() as "plus" | "pro")
                      }
                      className={cn(
                        buttonVariants({
                          variant: p.highlight ? "default" : "outline",
                          size: "lg",
                        }),
                        "w-full"
                      )}
                    >
                      {p.cta.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
