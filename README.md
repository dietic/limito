# Limi.to

The cleanest way to create links that expire when you want.

Limi.to is a simple, premium‑feeling service for creating links that automatically expire on your terms. Choose a date or a click limit, share a single short link, and when time’s up it can gracefully redirect to a page you choose or show a friendly “link expired” message. Manage everything from a lightweight dashboard and see at‑a‑glance stats like total clicks and the last time a link was used.

Perfect for time‑limited offers, launch previews, job applications, private documents, event RSVPs, and anything that shouldn’t live forever. Fast, clean, and distraction‑free—so your links do exactly what you expect, no clutter, just control.

## Supabase setup

To run locally you must provide Supabase credentials and apply the database schema:

1) Environment variables (create `.env`):

```
NEXT_PUBLIC_SUPABASE_URL=...       # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=...      # Service role key (server API routes)
APP_URL=http://localhost:3000
```

2) Apply migrations (one of):

- SQL Editor (no CLI): open Supabase → SQL Editor and run the files in `supabase/migrations` in order:
	- `0001_init.sql`
	- `0002_rate_limits.sql`

- CLI:
	```zsh
	supabase link --project-ref <your-project-ref>
	supabase db push
	```

If you see “Database not initialized: run Supabase migrations” in the app, it means step 2 hasn’t been done yet.
