---
applyTo: "**"
---

# Limi.to — MVP (v1) Development Blueprint

> **Tagline:** “The cleanest way to create links that expire when you want.”
> **Goal:** Launch a simple, fast, and monetizable SaaS that can reach $500 MRR with minimal complexity.

---

## 🧭 Overview

## 🖌️ Visual Design Rules

- **Light and Dark themes** using shadcn/ui CSS variables.
- Keep layout **minimal** but **visually professional** — clean shadows, subtle borders.
- Use a **professional color palette** based on shadcn/ui defaults:
  - Primary: Blue (`hsl(221.2 83.2% 53.3%)`)
  - Secondary: Gray (`hsl(210 40% 96.1%)`)
  - Muted: Light gray for backgrounds
  - Border: Subtle gray borders
- Typography: Inter (clean, geometric, professional).
- Use meaningful icons from `lucide-react` — not decoration for decoration's sake.
- Ensure accessibility: proper contrast, keyboard navigation, and semantic HTML.
- Design inspiration: Linear.app, Bitly.com, Linklyhq.com — clean, minimal, conversion-focused.ts users create **expiring links** (by date or click count), view basic analytics, and optionally redirect expired links to a fallback URL.

Your mission: **build something clean, fast, and scalable**, not big and complicated.

---

## 🧱 Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **UI Components:** shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Backend:** Next.js Route Handlers (Edge runtime for redirects, Node for app logic)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password + magic link)
- **Email:** Resend + React Email (optional for notifications)
- **Payments:** Lemon Squeezy (subscriptions via API + webhook)
- **Hosting:** Vercel (frontend + backend), Supabase (DB)
- **Monitoring:** Sentry (optional), Vercel Analytics

---

## 🗂️ Project Structure Rules

Codex should **create a clean, modular structure**.
No single-file blobs. No unstructured folders.

**General organization:**

- All application logic inside `/app`
- Components grouped logically (not alphabetically)
- Shared utilities go in `/lib`
- Types live in `/types`
- Styles under `/styles`
- Tests separated into `/tests/unit`, `/tests/integration`, `/tests/e2e`

**General hierarchy example (not strict):**

```
/limito
├── app/ → Routes, pages, API endpoints
├── components/ → Reusable UI components (buttons, inputs, etc.)
├── lib/ → Supabase client, validators, helpers
├── emails/ → React Email templates
├── types/ → Global TypeScript interfaces
├── styles/ → Tailwind and global CSS
├── tests/ → All automated tests
└── README.md
```

**Key principles for structure:**

- One purpose per file.
- One domain per folder (e.g., `/api/links` for all link endpoints).
- Keep files short, simple, and type-safe.
- No mixed concerns (e.g., don’t mix DB and UI in one file).

---

## ⚙️ Coding Rules

### 🧩 General (applies to both frontend and backend)

1. **No inline comments** — code must be self-documenting.
2. **No console logs** — use structured error handling or logging utilities.
3. **No playground or temporary files** — all test or debug code must live in `/tests`.
4. **No unused imports, no dead code, no TODOs.**
5. **No `any` type** — always use explicit TypeScript types or interfaces.
6. **Validate all user input with Zod** before inserting or updating data.
7. **Every API route must return a valid HTTP code and consistent JSON structure.**
8. **All environment variables must come from `process.env`.**
9. **Avoid hardcoded values.** Use constants, enums, or configuration files.
10. **Strict mode enabled** in both TypeScript and Next.js.
11. **Run lint and tests before every commit.**
12. **Keep commits atomic and descriptive** (`feat:`, `fix:`, `refactor:`, `chore:`).
13. **Never push broken builds** or untested code to `main`.
14. **GOLDEN RULE: IF YOU'RE NOT SURE ABOUT ANYTHING, ASK, DO NOT ASSUME A THING.**

---

### 🎨 Frontend Rules

1. **Framework:** Next.js (App Router) + React + Tailwind CSS + shadcn/ui.
2. **UI Components:** Use shadcn/ui components exclusively. Import from `@/components/ui/*`.
3. **Component naming:** `PascalCase` (e.g., `LinkForm.tsx`, `ButtonPrimary.tsx`).
4. **Hook names:** `useCamelCase` (e.g., `useCopyToClipboard.ts`).
5. **Utility functions:** `camelCase` (e.g., `formatDate.ts`).
6. **File and folder names:** `kebab-case` (e.g., `link-form.tsx`, `link-table.tsx`).
7. **CSS:** Use Tailwind utilities + shadcn/ui CSS variables. No external CSS frameworks.
8. **Styling helper:** Use `cn()` from `@/lib/utils` to merge Tailwind classes.
9. **No business logic in components.**
   - Components should only handle UI and minor state.
   - Move side effects, validation, and data fetching into hooks or server actions.
10. **Use React Server Components** whenever possible; avoid unnecessary client components.
    Note (Next.js 15 CSR/Suspense): If a client component needs `useSearchParams()`/`usePathname()` and the page may be prerendered, either read from `window.location` inside a `useEffect`, or ensure the usage site is wrapped in `<Suspense>` and, when appropriate, mark the page as dynamic (`export const dynamic = 'force-dynamic'`; `export const revalidate = 0`). Keep hook order stable and do redirects inside effects.
11. **Always validate props with TypeScript interfaces.**
12. **Mobile-first design:**
    - Test at 360px width minimum.
    - Keep spacing and typography consistent.
13. **Error and loading states required** for all async UI sections.
14. **No direct calls to Supabase or API endpoints inside UI components.**
    - Use custom hooks or actions for data fetching.
15. **GOLDEN RULE: IF YOU'RE NOT SURE ABOUT ANYTHING, ASK, DO NOT ASSUME A THING.**

---

### ⚙️ Backend Rules

1. **Language:** TypeScript with Next.js Route Handlers.
2. **Function naming:** `camelCase` (e.g., `createLink`, `getLinkStats`).
3. **File names:** `kebab-case` (e.g., `create-link.ts`, `redirect-link.ts`).
4. **Database interaction:**
   - All queries through Supabase SDK or `pg` with prepared statements.
   - No direct SQL strings in UI code.
5. **Input validation:** All route handlers must validate body/query with Zod before processing.
6. **Response standardization:**
   - Success → `{ "success": true, "data": ... }`
   - Error → `{ "error": true, "message": "..." }`
7. **Error handling:**
   - Use try/catch in all route handlers.
   - Return proper HTTP codes:
     - 200/201 (OK / Created)
     - 400 (Bad Request)
     - 401 (Unauthorized)
     - 403 (Forbidden)
     - 404 (Not Found)
     - 500 (Server Error)
8. **Database schema updates:**
   - Always via Supabase migrations.
   - Never modify DB structure directly in production.
9. **Security:**
   - Enforce RLS on all tables.
   - Never expose Supabase service key in the client.
   - Sanitize all URLs before redirecting.
10. **Logging:**
    - Use structured logs for server errors (Sentry or Vercel logs).
    - Do not log sensitive data (tokens, emails, etc.).
11. **GOLDEN RULE: IF YOU'RE NOT SURE ABOUT ANYTHING, ASK, DO NOT ASSUME A THING.**

---

### 🧱 Naming & Typing Summary

| Layer                   | Files & Folders | Functions & Variables | Components | Classes / Interfaces |
| ----------------------- | --------------- | --------------------- | ---------- | -------------------- |
| **Frontend**            | kebab-case      | camelCase             | PascalCase | PascalCase           |
| **Backend**             | kebab-case      | camelCase             | N/A        | PascalCase           |
| **Database (Supabase)** | snake_case      | snake_case            | N/A        | N/A                  |

---

## 🧩 Features (v1)

**Core**

- Create link → input destination URL, set expiration (date or click count).
- Redirect logic → if expired → fallback URL or expired page.
- Dashboard → list, edit, delete, and copy links.
- Basic analytics → total clicks + last click date.
- Auth → login/register/reset via Supabase.

**Support**

- Rate limiting for link creation & redirects.
- URL validation.
- Responsive UI.
- Branded “link expired” page.
- Copy/QR functionality.
- Plus & Pro QR experience:
  - Add a QR trigger on link cards and detail drawers for Plus and Pro users.
  - Generate high-resolution codes for `https://limi.to/r/{slug}` with copy/download options.
  - Free users see an upgrade prompt that deep-links into the Lemon Squeezy checkout flow.
  - Cover QR helpers with unit tests and UI flow with integration/Playwright coverage.
- Light/dark theme toggle.
- Pricing section on landing page with Monthly/Yearly toggle. Keep copy simple and benefits-driven. Use shadcn tokens and accessible contrast. Keep CTAs wired to /login or checkout when available.
- FAQ section with 5–7 concise questions (limits, analytics, redirects speed, privacy, expiry behavior). Use lightweight accordion and tokenized styles.
- A/B testing: it’s acceptable to default Pricing toggle via a simple client-side variant (`useAbVariant`) with query param overrides (`?ab_pricing_default=yearly|monthly`) and localStorage persistence.

**Deferred (v2)**

- Email notifications.
- Stripe subscription.
- Public API.
- Custom domains.

---

## 🧩 Database Design

- **profiles**
  - `id` (UUID, FK auth.users)
  - `plan` (free | pro)
  - `created_at`
- **links**
  - `id`, `owner_id`, `slug`
  - `destination_url`
  - `fallback_url`
  - `mode` (by_date | by_clicks)
  - `expires_at`, `click_limit`
  - `click_count`, `last_clicked_at`
  - `is_active`
- **click_events**
  - `id`, `link_id`
  - `clicked_at`, `referrer`, `user_agent`

Rules:

- Enable RLS.
- Only link owner can read/write their data.
- Index `slug` and `owner_id`.

---

## 🌐 API Guidelines

| Endpoint                   | Method | Description                          |
| -------------------------- | ------ | ------------------------------------ |
| `/api/links`               | POST   | Create new link                      |
| `/api/links`               | GET    | List all user links                  |
| `/api/links/:id`           | PATCH  | Update existing link                 |
| `/api/links/:id`           | DELETE | Delete link                          |
| `/api/links/:id/analytics` | GET    | Return link stats                    |
| `/r/:slug`                 | GET    | Public redirect route (Edge runtime) |

Billing endpoints (payments):

| Endpoint                   | Method | Description                                         |
| -------------------------- | ------ | --------------------------------------------------- |
| `/api/billing/checkouts`   | POST   | Create checkout for Plus/Pro (returns checkout URL) |
| `/api/billing/change-plan` | POST   | Upgrade/downgrade (swap variant) or cancel to Free  |
| `/api/billing/cancel`      | POST   | Cancel active subscription                          |
| `/api/billing/webhook`     | POST   | Webhook receiver (HMAC verified)                    |

**Response format:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error format:**

```json
{
  "error": true,
  "message": "Invalid input"
}
```

---

## 🎨 UI Rules

- Use shadcn/ui components for all UI elements.
- Follow shadcn/ui's CSS variable-based theming system.
- Color palette defined in `styles/globals.css` using HSL values:
  - Primary: Blue-based (`--primary`)
  - Secondary: Neutral gray (`--secondary`)
  - Muted: Subtle backgrounds (`--muted`)
  - Accent: Interactive highlights (`--accent`)
  - Destructive: Error states (`--destructive`)
- Clean spacing using Tailwind's spacing scale.
- Use `cn()` utility from `@/lib/utils` for class merging.
- No external UI libraries beyond shadcn/ui.
- Mobile responsive from day one.
- Include loading and error states.
- Professional, minimal design inspired by Linear, Bitly, and Linkly.

---

## 🎨 Design & UX Direction

The product design should **feel like a premium SaaS** — clean, modern, and conversion-optimized.

### Reference Designs

Use these as stylistic and UX benchmarks:

- [https://linklyhq.com](https://linklyhq.com) — clear copy, friendly tone, smart whitespace, simple CTAs.
- [https://www.rebrandly.com](https://www.rebrandly.com) — strong SaaS identity, dynamic hero layout, great feature storytelling.
- [https://bitly.com](https://bitly.com) — concise interface, trust-driven design.
- Optional inspiration: [https://posthog.com](https://posthog.com) (modern product dashboard aesthetics).

---

## 🖌️ Visual Design Rules

- **Light and Dark themes** required from day one.
- Keep layout **minimal** but **visually premium** — use gradients, smooth shadows, and subtle motion.
- Use a **2–3 color palette**, primarily:
  - `#2d5dc5` (Primary Blue)
  - `#f26749` (Accent Coral)
  - `#f1ede5` (Neutral background)
- Typography: clean and geometric (Inter, Work Sans, or Poppins).
- Use meaningful icons (Lucide, Heroicons) — not decoration for decoration’s sake.
- Ensure accessibility: proper contrast, keyboard navigation, and semantic HTML.

---

## ✍️ Copywriting & Messaging Tone

The UI copy, landing pages, and dashboard text must reflect:

- **Clarity over cleverness**
- **Confidence over complexity**
- **Trust, privacy, and control**

**Tone:**
Friendly, trustworthy, and slightly conversational — like you’re talking to a smart, busy user who values clarity.

### Example Style

> “Create links that expire when you want. Simple, safe, and beautiful.”

> “Control your links — decide when they vanish.”

> “The fastest way to share links that know when to stop working.”

Keep microcopy short, sharp, and benefit-driven (like Linkly or Rebrandly).

---

## 🧭 Design Goals

1. Feel **modern and startup-grade**, not corporate.
2. Prioritize **user confidence and transparency**.
3. Every view should answer one question instantly: _“What can I do here?”_
4. Animate only where it improves clarity.
5. Minimal friction from landing to action — maximum polish.

---

---

## 🧪 Testing Rules

- All tests inside `/tests`.
- Unit → validation, expiration logic.
- Integration → CRUD routes.
- E2E → redirect + dashboard flow.
- No inline testing, no mock playgrounds.
- Use Playwright for browser tests.
- CI pipeline runs tests before deployment.

---

## 📦 Deployment Rules

1. Deploy DB schema to Supabase.
2. Set environment variables in Vercel.
3. Deploy Next.js to Vercel (Edge runtime enabled).
4. Verify:
   - Auth works
   - Redirect latency < 100ms
   - Expiration logic triggers correctly

---

## ⚙️Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
APP_URL=https://limi.to

# Lemon Squeezy (payments)
# Either spelling is accepted for the API key; prefer LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_API_KEY=
# LEMON_SQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_PLUS_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=

# Optional plan limits overrides
FREE_PLAN_MAX_ACTIVE_LINKS=
FREE_PLAN_ANALYTICS_RETENTION_DAYS=
PLUS_PLAN_MAX_ACTIVE_LINKS=
PLUS_PLAN_ANALYTICS_RETENTION_DAYS=
PRO_PLAN_MAX_ACTIVE_LINKS=
PRO_PLAN_ANALYTICS_RETENTION_DAYS=
```

---

## 💡 Development Workflow

- Before finishing up a feature please run `pnpm dev` or `pnpm build` to check if there are any errors.
- Create a **TODO list** for each feature that you're going to implement and as soon as that list is complete, commit the feature.
- **Branch naming:** `feature/*`, `fix/*`, `chore/*`
- Each feature should be committed
- **Commits:** Must be atomic and descriptive.
- **Pull Requests:** Always include purpose and screenshots for UI.
- **Pre-deploy checks:** run `pnpm run lint && pnpm run test`.
- **No direct pushes** to `main`.

### Instructions Sync

- Keep `.github/instructions/limito-instructions.md.instructions.md` and this file in sync. Any change to rules or design guidance in one must be mirrored in the other in the same PR.

### Commit Gating (Approval Required)

- After changes are implemented, do not commit immediately.
- First run: `pnpm run lint`, `pnpm build`, and `pnpm test` to ensure zero errors.
- Share a short summary of edits and verification status with the user.
- Proceed to commit only after explicit user approval.

---

## 🧠 Quality Principles

- Code must be clear enough to explain itself.
- Fewer lines over fancy abstractions.
- Simplicity is a feature.
- Launch before perfection.
- If you can explain it in one sentence — it’s good code.

---

# 👤 Developer Context & Design Philosophy

## 👨‍💻 Developer Profile

You are a **Senior Full-Stack Developer** with 10+ years of experience building SaaS products.
Your expertise includes **React, Next.js, TypeScript, Supabase, and Tailwind CSS**, as well as **marketing, copywriting, and conversion-driven UI/UX**.

You understand both code and business — you know that every design decision affects retention, trust, and conversions.
You write **clean, scalable, and production-grade code**, and you think like a **product marketer** as much as a developer.

### Your Mindset

- Build for simplicity, speed, and usability — ship quickly but elegantly.
- Write UI copy that **sells clarity and confidence**, not complexity.
- Prioritize code readability and maintainability.
- Every feature should feel premium, even in an MVP.

---

## 🚀 Launch Checklist

- [ ] All routes tested and working.
- [ ] Lighthouse score > 90.
- [ ] No unused imports.
- [ ] Mobile UI validated.
- [ ] Privacy & ToS pages added.
- [ ] Analytics dashboard loads fast.
- [ ] Redirects verified in production.
- [ ] Clean domain: `limi.to`.

---

**Final note:** Keep the implementation **structured, type-safe, and minimalist**.
The goal is not to impress with features, but to deliver a clean SaaS that _feels_ premium.

> 🎯 The developer must think and act like a **marketer, designer, and engineer in one.**
> Write every line of code and copy as if thousands of users will see it tomorrow.

**GOLDEN RULE: IF YOU'RE NOT SURE ABOUT ANYTHING, ASK, DO NOT ASSUME A THING.**
**GOLDEN RULE: IF YOU'RE NOT SURE ABOUT ANYTHING, ASK, DO NOT ASSUME A THING.**
**GOLDEN RULE: IF YOU'RE NOT SURE ABOUT ANYTHING, ASK, DO NOT ASSUME A THING.**
