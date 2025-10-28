import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Understand how Limi.to collects, stores, and protects data for expiring links and analytics.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Limi.to Privacy Policy",
    description:
      "Learn how Limi.to handles account data, link analytics, and security for expiring links.",
    url: "/privacy",
  },
  twitter: {
    card: "summary",
    title: "Limi.to Privacy Policy",
    description:
      "Learn how Limi.to handles account data, link analytics, and security for expiring links.",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: October 20, 2025
        </p>
      </header>

      <section className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Your privacy matters. This policy explains what data we collect, why
          we collect it, and how we handle it when you use Limi.to to create and
          share expiring links.
        </p>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Information we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <span className="font-medium text-foreground">Account data:</span>{" "}
              email and basic profile details when you sign up.
            </li>
            <li>
              <span className="font-medium text-foreground">Link data:</span>{" "}
              destination URLs, fallback URLs, slugs, and expiration settings.
            </li>
            <li>
              <span className="font-medium text-foreground">Usage data:</span>{" "}
              click counts and timestamps, and limited event metadata like
              referrer and user agent for analytics.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            How we use information
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Provide and maintain the service (creating, managing, and
              redirecting links).
            </li>
            <li>
              Protect our service (rate limiting, abuse detection, and quality
              monitoring).
            </li>
            <li>
              Improve product experience (aggregated analytics and feature
              development).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Data retention
          </h2>
          <p className="mt-3">
            We retain link analytics for a limited time based on your plan. Free
            plan analytics may be trimmed after a short retention window.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Sharing</h2>
          <p className="mt-3">
            We don&apos;t sell personal data. We may share minimal data with
            trusted processors (for example, hosting and database providers)
            strictly to operate the service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Security</h2>
          <p className="mt-3">
            We take reasonable measures to protect your data. No method of
            transmission or storage is 100% secure, but we continually improve
            our safeguards.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Your choices</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Access or delete your account data by contacting support.</li>
            <li>Delete individual links at any time from your dashboard.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Contact</h2>
          <p className="mt-3">
            Questions about this policy? Reach us at{" "}
            <span className="font-medium text-foreground">support@limi.to</span>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
