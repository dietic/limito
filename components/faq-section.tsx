"use client";

export default function FaqSection() {
  const faqs = [
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
  ];

  return (
    <section id="faq" className="border-t border-border bg-muted/40 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Quick answers to common questions
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card p-6"
            >
              <summary className="cursor-pointer list-none font-semibold text-card-foreground">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" />
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
