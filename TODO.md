# TODO — Limi.to MVP

This is the implementation checklist for MVP (v1). Each feature has a focused, verifiable task list. Items marked [x] are done.

## MVP Readiness Checklist (invite users when all are checked)

- [x] Links: add details/edit page and wire Dashboard "View" action
  - Implement `app/(dashboard)/links/[id]/page.tsx` to fetch, prefill, update (PATCH), and delete (DELETE)
- [x] Accurate expiry in UI
  - Compute with `isExpired(link)` in lists/filters/badges; optionally also hard-set `is_active=false` in redirect handler when an expiration is detected
- [x] robots.txt and sitemap.xml
  - Add `app/robots.ts` and `app/sitemap.ts` with basic entries for marketing routes
- [x] SEO metadata baseline
  - Title/description and OG tags in `app/layout.tsx` and marketing pages
- [x] Enable Vercel Analytics (basic telemetry only)
- [ ] Tests for confidence
  - Integration: CRUD routes (happy/invalid/unauthorized)
  - E2E (Playwright): login → create link → redirect → click count increases
- [ ] Brand polish
  - Replace placeholder logo/favicon; finalize Privacy & Terms copy
- [ ] Ops hygiene (optional for invite, recommended)
  - TTL cleanup for `rate_limits` windows; sweep old `click_events` beyond free-plan retention

## 1) Auth

- [x] Login/signup/reset with Supabase Auth (client hook + UI)
- [ ] Add server-side session retrieval for server components when needed
- [x] Protect dashboard routes (redirect to login when no session)
- [x] Basic error/empty/loading states on auth views

## 2) Links CRUD

- [x] Create/List routes with Zod validation and JSON standard
- [x] Update/Delete routes
- [x] URL sanitization for destination/fallback
- [x] Reserved slugs check + auto slug generation
- [x] Fix use-links.ts authHeaders implementation (critical bug - useMemo with async)
- [x] Create /links/page.tsx to display user's links list
- [x] Edit page UI (prefill form, save)
- [x] Copy-to-clipboard with visual feedback
- [x] Pagination on links list
- [x] Filter tabs: All / Active / Expired
- [x] Empty/Loading/Error UI states wired to hooks
      -> Done: Details/edit page added and expired filtering uses `isExpired()`.
      -> Done: Server-side pagination + filtering with URL sync (limit/offset/filter)
      -> Done: Server-side counts for All/Active/Expired tabs

## 3) Redirects

- [x] Edge route `/r/:slug` with expiration handling
- [x] Fallback redirect or branded expired page
- [x] Click counting and last_clicked_at update
- [ ] Optimize redirect for <100ms (minimal data fields, early return)

## 4) Rate Limiting

- [x] DB-backed counters table with TTL windows
- [x] Enforce create per user/day
- [x] Enforce redirects per IP/min and global per slug/min
- [x] Return informative `429` JSON for API requests (create link)
- [x] Expose `Retry-After` header where relevant (create & redirects)
- [ ] Background cleanup: delete expired `rate_limits` windows (cron or Supabase scheduled task)

## 5) Analytics

- [x] Basic analytics endpoint (click_count, last_clicked_at)
- [x] Dashboard card: total clicks
- [x] Show last click date (latest across links) in dashboard
- [ ] Add small trends: last 24h count (optional v1)

## 6) UI/UX

- [x] Base layout and styles with Tailwind
- [x] Legal pages placeholders (Privacy, Terms)
- [x] Minimal dashboard pages and LinkForm
- [x] Add route protection middleware for dashboard routes
- [x] Add loading/error states to dashboard and links pages
- [x] Improve landing page with better copy and CTAs (modern SaaS hero/features/CTA)
- [x] Pricing section with monthly/yearly toggle
- [x] Tokenize pages to theme tokens (no hardcoded colors)
- [x] Theme toggle (light/dark)
- [ ] Mobile-first pass at 360px viewport
- [ ] Branded expired page content polish (use theme tokens, match branding)
- [x] Accessible form labels, focus states, and keyboard navigation
      -> MVP: ensure nav “View” works, expired badges reflect real state, and marketing pages have baseline SEO metadata.

## 7) Validation & Types

- [x] Zod validators for create/update link
- [x] Strict TypeScript configuration (no `any`, strict mode)
- [x] Add schema types for API responses

## 8) Testing

- [x] Unit: expiration logic
- [x] Unit: validators
- [ ] Integration: CRUD routes (happy/invalid/unauthorized)
- [ ] E2E (Playwright): login → create link → redirect → counts

## 9) Database & Security

- [x] Supabase schema + RLS for profiles, links, click_events
- [x] Indexes for slug and owner_id
- [x] rate_limits table (service role access only)
- [ ] Confirm RLS policies with real auth context in staging

## 10) Monitoring & Ops

- [x] Vercel Analytics enabled
- [ ] Optional Sentry instrumentation (server only)
- [ ] Health/uptime plan (Vercel checks, alerting)

## 11) Content & Branding

- [x] App icon placeholder
- [ ] Logo + favicon (replace placeholder)
- [x] Landing blurb polishing
- [ ] Expired-page copy (tone, clarity)
- [ ] Privacy & ToS final copy
      -> MVP: logo/favicon + final Privacy/ToS.

## 12) Payments (Deferred v2)

- [ ] Stripe Checkout plan setup (free → pro)
- [ ] Webhook receiver and tests
- [ ] Feature flag limits by plan

## 13) Email (Deferred v2)

- [ ] Resend integration
- [ ] Optional notifications (limit reached, link expired)

## 14) Public API (Deferred v2)

- [ ] Token-based endpoints for programmatic link creation
- [ ] API keys management UI

## 15) Custom Domains (Deferred v2)

-

## 16) Chores & Docs

- [x] Always-on instructions aligned (Copilot + AGENTS)
- [x] Commit gating policy documented and enforced
- [x] Extend color tokens: success, warning, info
- [x] Add Playwright artifacts to .gitignore
- [x] Middleware protects `/dashboard` and `/links` via Supabase Auth
- [x] Standardize API responses across routes (jsonSuccess/jsonError)
- [x] Env var sanity checks for service clients
- [ ] Add "Definition of Done" to instructions
- [ ] Add "Token usage primer" to instructions

- [ ] Domain verification flow
- [ ] Redirect route handling for custom hostnames

## 17) SEO

- [x] robots.txt (`app/robots.ts`)
- [x] sitemap.xml (`app/sitemap.ts`)
- [x] Baseline metadata/OG tags for marketing pages

## 18) Recently Completed Chores (for release notes)

- [x] README: Supabase setup and migrations instructions
- [x] API DX: clearer dev error messages (missing service role key / schema not initialized)
- [x] Real server-side pagination for links (API + hook + UI)
- [x] Server-side filtering for links (API + hook + UI) and URL synchronization
- [x] Typed API response contracts (`types/api.ts`) and `use-links` refactor to use them
