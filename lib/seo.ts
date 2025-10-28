import type { FaqItem, PricingPlan } from "./marketing-content";

export function createOrganizationJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Limi.to",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [] as string[],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@limi.to",
        availableLanguage: ["English"],
      },
    ],
  } as const;
}

export function createWebsiteJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Limi.to",
    url: baseUrl,
  } as const;
}

export function createSoftwareApplicationJsonLd(
  baseUrl: string,
  plans: readonly PricingPlan[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Limi.to",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: plans.map((plan) => ({
      "@type": "Offer",
      url: `${baseUrl}/pricing`,
      priceCurrency: "USD",
      price: plan.yearlyPrice > 0 ? plan.yearlyPrice : plan.monthlyPrice,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceCurrency: "USD",
        price: plan.monthlyPrice,
        referenceQuantity: {
          "@type": "QuantitativeValue",
          unitCode: "MON",
        },
      },
      name: `${plan.name} plan`,
      availability: "https://schema.org/InStock",
    })),
  } as const;
}

export function createFaqJsonLd(faqs: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  } as const;
}
