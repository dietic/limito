# Limi.to

The cleanest way to create links that expire when you want.

Limi.to is a simple, premium‑feeling service for creating links that automatically expire on your terms. Choose a date or a click limit, share a single short link, and when time’s up it can gracefully redirect to a page you choose or show a friendly “link expired” message. Manage everything from a lightweight dashboard and see at‑a‑glance stats like total clicks and the last time a link was used.

Perfect for time‑limited offers, launch previews, job applications, private documents, event RSVPs, and anything that shouldn’t live forever. Fast, clean, and distraction‑free—so your links do exactly what you expect, no clutter, just control.

## Supabase setup

To run locally you must provide Supabase credentials and apply the database schema:

1. Environment variables (create `.env`):

```
NEXT_PUBLIC_SUPABASE_URL=...       # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=...      # Service role key (server API routes)
APP_URL=http://localhost:3000
```

2. Apply migrations (one of):

- SQL Editor (no CLI): open Supabase → SQL Editor and run the files in `supabase/migrations` in order:

  - `0001_init.sql`
  - `0002_rate_limits.sql`

- CLI:
  ```zsh
  supabase link --project-ref <your-project-ref>
  supabase db push
  ```

If you see “Database not initialized: run Supabase migrations” in the app, it means step 2 hasn’t been done yet.

## Billing (Lemon Squeezy)

Subscriptions are handled via Lemon Squeezy. To enable billing:

1. Create two subscription variants in Lemon Squeezy for Plus and Pro (or adjust naming to your plans) and note their Variant IDs and your Store ID.
2. Add the following to your `.env` (see `.env.example`):

```ini
# Either spelling is accepted; prefer LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_API_KEY=sk_test_...
# LEMON_SQUEEZY_API_KEY=sk_test_...  # alternative env name also supported
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...
LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID=111111
LEMONSQUEEZY_PLUS_YEARLY_VARIANT_ID=111112
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=222221
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=222222
```

3. Configure a webhook in Lemon Squeezy pointing to:

- `https://YOUR_DOMAIN/api/billing/webhook`
- Subscribe to subscription events (e.g. `subscription_created`, `subscription_updated`, `subscription_cancelled`). The app verifies the `X-Signature` header using the `LEMONSQUEEZY_WEBHOOK_SECRET`.

4. Pricing and billing UI:

- Marketing Pricing page: `/pricing` (header and hero link to it)
- Dashboard Billing page: `/settings/billing` (shows current plan and lets users upgrade/downgrade or cancel)

5. API routes involved:

- `POST /api/billing/checkouts` → returns a checkout URL for Plus/Pro when no active subscription
- `POST /api/billing/change-plan` → upgrades/downgrades in place by swapping the Lemon Squeezy subscription variant (preserves monthly/yearly interval); downgrading to Free cancels the subscription
- `POST /api/billing/cancel` → cancels the current active subscription
- `POST /api/billing/webhook` → webhook receiver to upsert subscription status and map to users

Plan-based limits are enforced server-side via `profiles.plan`. You can optionally override defaults with env vars like `PLUS_PLAN_MAX_ACTIVE_LINKS`, `PRO_PLAN_MAX_ACTIVE_LINKS` (supports `unlimited`), etc. (see `.env.example`).

## E2E workflow (Playwright)

You can run E2E tests against a running dev server or let Playwright start one.

Reuse an existing dev server:

```zsh
pnpm dev
PW_NO_WEBSERVER=1 APP_URL="http://localhost:3000" E2E_EMAIL="you@example.com" E2E_PASSWORD="yoursecret" pnpm test:e2e --reporter=list
```

Let Playwright manage the server (dev by default):

```zsh
E2E_EMAIL="you@example.com" E2E_PASSWORD="yoursecret" pnpm test:e2e --reporter=list
```

To keep the created link for manual inspection, set:

```zsh
E2E_KEEP=1 E2E_EMAIL="you@example.com" E2E_PASSWORD="yoursecret" pnpm test:e2e --reporter=list
```
