export interface FaqItem {
  q: string;
  a: string;
}

export interface PricingPlan {
  slug: "free" | "plus" | "pro";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: readonly string[];
  highlight?: boolean;
}

export const landingFaqs: readonly FaqItem[] = [
  {
    q: "How do expiring links work?",
    a: "You set an expiration rule — by date/time or by total clicks. Once the rule is met, the link stops working or redirects to your fallback URL.",
  },
  {
    q: "What happens after expiry?",
    a: "If you set a fallback URL, visitors are redirected there. Otherwise they see a clean ‘link expired’ page.",
  },
  {
    q: "Do you track users?",
    a: "We collect minimal, privacy-conscious metrics — total clicks and last activity. No pixel bloat or cross-site tracking.",
  },
  {
    q: "Can I change or delete a link?",
    a: "Yes. You can edit, pause, or delete your links anytime from the dashboard.",
  },
  {
    q: "How fast are redirects?",
    a: "We aim for sub-100ms using edge runtime and a global network.",
  },
] as const;

export const pricingPlans: readonly (PricingPlan & {
  cta: { label: string; href?: string };
})[] = [
  {
    slug: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Set up a couple of expiring links and try Limi.to risk-free.",
    features: [
      "Up to 2 active links",
      "Time or click-based expirations",
      "7-day analytics history",
      "limi.to domain included",
    ],
    cta: { label: "Start for free", href: "/login" },
  },
  {
    slug: "plus",
    name: "Plus",
    monthlyPrice: 6,
    yearlyPrice: 60,
    description: "Headroom for campaigns, QR handouts, and a custom domain.",
    features: [
      "Up to 50 active links",
      "Standard QR codes for every link",
      "90-day analytics history",
      "1 custom domain + email support (24h)",
    ],
    highlight: true,
    cta: { label: "Upgrade to Plus" },
  },
  {
    slug: "pro",
    name: "Pro",
    monthlyPrice: 12,
    yearlyPrice: 120,
    description: "Unlimited links for teams and agencies that need scale.",
    features: [
      "Unlimited active links",
      "Standard QR codes",
      "365-day analytics history",
      "Up to 5 custom domains + priority support",
    ],
    cta: { label: "Upgrade to Pro" },
  },
] as const;
