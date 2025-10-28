export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: October 20, 2025
        </p>
      </header>

      <section className="mt-8 space-y-6 text-muted-foreground">
        <p>
          These Terms govern your use of Limi.to. By creating an account or
          using the service, you agree to these Terms.
        </p>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Use of service
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              You&apos;re responsible for the content you link to and must
              comply with applicable laws.
            </li>
            <li>No abusive behavior, spam, malware, or infringement.</li>
            <li>
              We may throttle or suspend accounts to protect service integrity.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Accounts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Keep your credentials secure. You are responsible for activity
              under your account.
            </li>
            <li>
              We may contact you about important changes or security notices.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Subscriptions</h2>
          <p className="mt-3">
            Some features may require a paid plan (handled via Lemon Squeezy).
            Pricing and inclusions may change with notice.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Termination</h2>
          <p className="mt-3">
            You can stop using the service at any time. We may suspend or
            terminate accounts for violations of these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Liability</h2>
          <p className="mt-3">
            The service is provided “as is”. To the maximum extent permitted by
            law, we disclaim warranties and limit liability.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Changes</h2>
          <p className="mt-3">
            We may update these Terms. We&apos;ll post the effective date above.
            Continued use means you accept the updated Terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Contact</h2>
          <p className="mt-3">
            Questions? Reach us at{" "}
            <span className="font-medium text-foreground">support@limi.to</span>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
