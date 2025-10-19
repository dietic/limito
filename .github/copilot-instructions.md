# Limi.to Development Instructions

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

- **shadcn/ui components** - Use exclusively from `@/components/ui/*`
- **CSS Variables** - Theme defined in `styles/globals.css` with HSL values
- **Utility merging** - Use `cn()` from `@/lib/utils` to merge Tailwind classes
- **Color system**: Primary (blue), Secondary (gray), Muted, Accent, Destructive
- **Mobile-first**: Use `sm:`, `lg:` breakpoints, test at 360px minimum
- **Consistent spacing**: Follow shadcn/ui spacing conventions
- **Professional aesthetics**: Clean, minimal, inspired by Linear/Bitly/Linkly

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

### Commit Approval Policy

- Do not commit immediately after making changes.
- After implementing changes, run `pnpm run lint`, `pnpm build`, and `pnpm test` locally.
- Provide a concise summary of changes, verification results (lint/build/tests), and a diff overview if helpful.
- Wait for explicit user approval before staging and committing.
- When approved, commit atomically with a descriptive message and reference any related tasks.

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

## Key Files Reference

- `middleware.ts` - Route protection for authenticated pages
- `hooks/use-auth.ts` - Client-side auth state management
- `hooks/use-links.ts` - CRUD operations for links (fixed async bug with useCallback)
- `lib/validators/link.ts` - Zod schemas for link creation/updates
- `lib/expiration.ts` - Link expiration logic (by date or clicks)
- `app/api/links/route.ts` - Create/list links endpoints
- `app/r/[slug]/route.ts` - Edge runtime redirect handler

## Design Philosophy

Build for **simplicity, speed, and premium feel**:

- Gradients, smooth shadows, subtle animations
- Clear, benefit-driven copy (not clever, but confident)
- Every view answers: "What can I do here?"
- Launch before perfection - MVP first, iterate fast

**Golden Rule**: If unsure about anything, ask - do not assume.
