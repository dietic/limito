import Faq from "@/components/faq-section";
import PricingSection from "@/components/pricing-section";
import SiteHeader from "@/components/site-header";
import { Suspense } from "react";

// Force dynamic rendering to avoid static export issues when client-only hooks run in nested components
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
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
