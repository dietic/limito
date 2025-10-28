import Faq from "@/components/faq-section";
import PricingSection from "@/components/pricing-section";
import SeoJsonLd from "@/components/seo-jsonld";
import SiteHeader from "@/components/site-header";
import { env } from "@/lib/env";
import { pricingPlans } from "@/lib/marketing-content";
import type { Metadata } from "next";
import { Suspense } from "react";

const baseUrl = env.APP_URL.replace(/\/$/, "");
const canonical = `${baseUrl}/pricing`;
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: canonical,
    },
  ],
} as const;

const pricingOffersJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Limi.to pricing",
  url: canonical,
  itemListElement: pricingPlans.map((plan, index) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: `${plan.name} plan`,
      description: plan.description,
    },
    priceSpecification: {
      "@type": "PriceSpecification",
      price: plan.monthlyPrice,
      priceCurrency: "USD",
    },
    position: index + 1,
  })),
} as const;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare Limi.to plans. Start free and upgrade to Plus or Pro for higher limits, QR codes, and expanded analytics.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Limi.to Pricing",
    description:
      "Transparent plans for expiring links. Start free, upgrade when campaigns scale.",
    url: "/pricing",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Limi.to Pricing",
    description:
      "Transparent plans for expiring links. Start free, upgrade when campaigns scale.",
    images: ["/og-image.svg"],
  },
};

// Force dynamic rendering to avoid static export issues when client-only hooks run in nested components
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoJsonLd id="pricing-breadcrumb" data={breadcrumbJsonLd} />
      <SeoJsonLd id="pricing-offers" data={pricingOffersJsonLd} />
      <SiteHeader />
      <main className="px-6 pb-24 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade to Plus or Pro when you need more.
          </p>
        </div>
      </main>
      <Suspense fallback={null}>
        <PricingSection />
      </Suspense>
      <Faq />
    </div>
  );
}
