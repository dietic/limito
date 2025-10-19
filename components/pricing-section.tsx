"use client";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PricingSection() {
  const [yearly, setYearly] = useState(true);

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
      name: "Pro",
      monthly: 12,
      yearly: 120,
      description: "For power users and teams who need higher limits.",
      features: [
        "Higher limits",
        "Priority redirects",
        "Advanced analytics (soon)",
        "Priority support (soon)",
      ],
      cta: { label: "Join waitlist", href: "/login" },
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="border-t border-border bg-muted/40 px-6 py-24">
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {plans.map((p) => {
            const price = yearly ? p.yearly : p.monthly;
            const suffix = yearly ? "/year" : "/mo";
            return (
              <div
                key={p.name}
                className={cn(
                  "relative rounded-2xl border border-border bg-card p-8 shadow-sm",
                  p.highlight &&
                    "ring-1 ring-primary/40 shadow-primary/10"
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
                  <a
                    href={p.cta.href}
                    className={cn(
                      buttonVariants({ variant: p.highlight ? "default" : "outline", size: "lg" }),
                      "w-full"
                    )}
                  >
                    {p.cta.label}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
