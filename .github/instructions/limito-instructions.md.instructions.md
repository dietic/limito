---
applyTo: "**"
---

# Limi.to Development Instructions

This repository uses Copilot Development Instructions. These files are always loaded and must be followed:

- `.github/instructions/limito-instructions.md.instructions.md` (this file)
- `.github/instructions/AGENTS.md` (additional blueprint and design rules)

## Architecture Overview

Limi.to is a Next.js 15 SaaS for creating expiring links. Architecture follows a clean separation:

- **Frontend**: Next.js App Router (client components in `app/`) + Tailwind CSS + shadcn/ui
- **UI Components**: shadcn/ui (Radix UI primitives with CSS variables)
- **Backend**: Next.js Route Handlers (`app/api/`) + Edge runtime for redirects (`app/r/[slug]`)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Auth (email/password + magic links)

### Key Data Flow

1. User creates link → `useLinks` hook → `POST /api/links` → Supabase insert with RLS
2. Public redirect → Edge function `GET /r/[slug]` → checks expiration → redirects or shows expired page
3. Auth state → `useAuth` hook → Supabase session → middleware protects `/dashboard` and `/links` routes

## Critical Patterns

### Next.js 15 Dynamic Routes

All dynamic routes use **async params** (breaking change from Next.js 14):

```typescript
// ✅ Correct (Next.js 15)
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;
}

// ❌ Wrong (Next.js 14 style)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Breaks in Next.js 15
}
```

See: `app/api/links/[id]/route.ts`, `app/r/[slug]/route.ts`

### Client Components with Hooks

All pages using `useAuth`, `useLinks`, `useState`, `useRouter` MUST be client components:

```typescript
"use client"; // Required at top of file
import { useAuth } from "@/hooks/use-auth";
import { useLinks } from "@/hooks/use-links";
```

See: `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/links/page.tsx`

### Supabase Client Usage

- **Browser**: `lib/supabase-browser.ts` - uses `process.env['NEXT_PUBLIC_SUPABASE_URL']` (direct access required)
- **Server**: `lib/supabase.ts` - uses service role key for RLS bypass in API routes
- **Never** import `lib/env.ts` in browser code (causes build errors)

### Authentication Flow

1. `middleware.ts` checks all `/dashboard/*` and `/links/*` routes
2. Redirects unauthenticated users to `/login?redirect=<path>`
3. `useAuth` hook manages session state client-side
4. API routes use `requireAuth()` from `lib/auth.ts` for server-side validation

## Code Standards (Strictly Enforced)

### Naming Conventions

- **Files/folders**: `kebab-case` (`link-form.tsx`, `use-links.ts`)
- **Components**: `PascalCase` (`LinkForm`, `Button`)
- **Functions/variables**: `camelCase` (`createLink`, `userId`)
- **Database**: `snake_case` (`user_id`, `created_at`)

### TypeScript Rules

- **No `any` types** - ESLint enforces `@typescript-eslint/no-explicit-any: error`
- **No empty interfaces** - Use `type` instead: `type InputProps = InputHTMLAttributes<HTMLInputElement>`
- All inputs validated with Zod before DB operations (see `lib/validators/link.ts`)

### React/JSX

- Escape apostrophes: `You&apos;re` not `You're` (ESLint `react/no-unescaped-entities`)
- No inline comments, no `console.log` (use structured error handling)
- Loading and error states required for all async operations

### Styling

- **shadcn/ui components (application-wide)** - Use exclusively from `@/components/ui/*`; do not introduce ad-hoc UI outside shadcn unless added as a proper tokenized component under `components/ui/`
- **CSS Variables** - Theme defined in `styles/globals.css` with HSL values
- **Utility merging** - Use `cn()` from `@/lib/utils` to merge Tailwind classes
- **Color system**: Primary (blue), Secondary (gray), Muted, Accent, Success, Warning, Info, Destructive
- **Mobile-first**: Use `sm:`, `lg:` breakpoints, test at 360px minimum
- **Consistent spacing**: Follow shadcn/ui spacing conventions
- **Professional aesthetics**: Clean, minimal, inspired by Linear/Bitly/Linkly

### UX Principles

- UI must be intuitive, playful but professional; users should immediately understand "What can I do here?"
- Clear information architecture and discoverability: sections, actions, and navigation must be obvious.
- Always include loading, empty, and error states; ensure accessible color contrast and keyboard navigation.
- Use light/dark themes via CSS variables; no hardcoded colors. Prefer token utilities like `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, etc.

## Development Workflow

### Commands

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build (must pass before commit)
pnpm run lint         # ESLint with strict Next.js rules
pnpm test             # Run Vitest unit tests
```

### Pre-Commit Checklist

1. Run `pnpm run lint` - must pass with 0 errors
2. Run `pnpm build` - must compile successfully
3. Verify no unused imports, no TODOs, no console.logs
4. Atomic commits: `feat:`, `fix:`, `refactor:`, `chore:`

### Backlog and TODO tracking

- Maintain `TODO.md` as the single-source backlog: list features, bugs, and chores.
- When a feature is completed, update `TODO.md` in the same PR (mark done/move to Done section) before requesting commit approval.
- Keep this file and `.github/instructions/AGENTS.md` in sync: any change to rules or design guidance here must be mirrored in AGENTS.md in the same PR.

### Commit Approval Policy

- Do not commit immediately after making changes.
- After implementing changes, run `pnpm run lint`, `pnpm build`, and `pnpm test` locally.
- Provide a concise summary of changes, verification results (lint/build/tests), and a diff overview if helpful.
- Wait for explicit user approval before staging and committing.
- When approved, commit atomically with a descriptive message and reference any related tasks.

### Branching and PR Hygiene

- Branch naming: `feature/*`, `fix/*`, `chore/*`.
- Open PRs with a concise purpose, screenshots for UI changes, and a checklist of what was verified.

### Database Migrations

- All schema changes via `supabase/migrations/*.sql`
- Never modify production DB directly
- Enable RLS on all tables (`owner_id` check for user data)

## API Response Format

All API routes return consistent JSON:

```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "error": true, "message": "..." }
```

HTTP codes: 200/201 (success), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

## Testing Strategy

- **Unit tests**: `tests/unit/` - validation logic, expiration calculations
- **Integration tests**: `tests/integration/` - API routes (planned)
- **E2E tests**: Playwright for redirect flows (planned)
- No inline test code - all tests in `/tests` directory

### Environment Variables Checklist

Define these in local env and Vercel before running or deploying:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
APP_URL=https://limi.to
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Key Files Reference

- `middleware.ts` - Route protection for authenticated pages
- `hooks/use-auth.ts` - Client-side auth state management
- `hooks/use-links.ts` - CRUD operations for links (fixed async bug with useCallback)
- `lib/validators/link.ts` - Zod schemas for link creation/updates
- `lib/expiration.ts` - Link expiration logic (by date or clicks)
- `app/api/links/route.ts` - Create/list links endpoints
- `app/r/[slug]/route.ts` - Edge runtime redirect handler
- `components/pricing-section.tsx` - Landing pricing with monthly/yearly toggle
- `components/faq-section.tsx` - Landing FAQ accordion
- `lib/ab.ts` - Minimal client A/B testing helper (query override + localStorage)
- `components/theme-toggle.tsx`, `components/theme-provider.tsx` - Light/dark theme and toggle

## Design Philosophy

Build for **simplicity, speed, and premium feel**:

- Gradients, smooth shadows, subtle animations
- Clear, benefit-driven copy (not clever, but confident)
- Every view answers: "What can I do here?"
- Landing must include Pricing and FAQ sections for clarity and conversion. Pricing supports a monthly/yearly toggle and may default via A/B testing (`useAbVariant`).
- Launch before perfection - MVP first, iterate fast

## Role Expectations and Quality Bar

- Copywriting: When writing copy (landing, UI text, microcopy), act as a professional copywriter with 10+ years of experience. Favor clarity, confidence, and benefit-driven messaging.
- UI implementation: When building UI, act as a FAANG-level frontend/design/UX tech lead with 10+ years of experience. Prioritize accessibility, responsive design, and premium SaaS feel.
- Logic & architecture: When implementing logic/backend, act as a senior tech lead with 10+ years of experience. Keep code simple, type-safe, and well-structured.

## Additional Notes

- Always use shadcn/ui and theme tokens across the entire app; avoid `text-white`, `bg-white`, `text-gray-*`, `bg-gray-*`, etc.
- Prefer reusable, tokenized components; avoid duplicating styles inline.
- If unsure, ask before proceeding. Maintain small, focused changes to avoid oversized diffs.

**Golden Rule**: If unsure about anything, ask - do not assume.
**Golden Rule**: If unsure about anything, ask - do not assume.
**Golden Rule**: If unsure about anything, ask - do not assume.
**Golden Rule**: If unsure about anything, ask - do not assume.
**Golden Rule**: If unsure about anything, ask - do not assume.
