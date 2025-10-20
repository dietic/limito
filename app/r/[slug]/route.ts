import { config } from "@/lib/config";
import { isExpired } from "@/lib/expiration";
import { allowAndIncrement, ipFromRequestHeaders } from "@/lib/rate-limit";
import { getServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function expiredHtml(): string {
  // Inline themed, accessible page (uses same tokens as globals.css)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>This link has expired • Limi.to</title>
    <meta name="color-scheme" content="light dark" />
    <style>
      :root {
        --background: 0 0% 100%;
        --foreground: 222.2 47.4% 11.2%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 47.4% 11.2%;
        --primary: 226 71% 55%;
        --primary-foreground: 210 40% 98%;
        --muted-foreground: 220 10% 40%;
        --border: 220 16% 90%;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --background: 224 14% 10%;
          --foreground: 210 40% 98%;
          --card: 224 14% 10%;
          --card-foreground: 210 40% 98%;
          --primary: 226 70% 60%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --muted-foreground: 215 20.2% 65.1%;
          --border: 224 14% 18%;
        }
      }
      * { box-sizing: border-box; }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .wrap { display: grid; place-items: center; min-height: 100%; padding: 2rem; }
      .card {
        width: 100%;
        max-width: 36rem;
        background: hsl(var(--card));
        color: hsl(var(--card-foreground));
        border: 1px solid hsl(var(--border));
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      }
      h1 { margin: 0 0 .5rem; font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; }
      p { margin: 0 0 1.25rem; color: hsl(var(--muted-foreground)); }
      .actions { display: flex; gap: .75rem; justify-content: center; }
      .btn {
        display: inline-flex; align-items: center; justify-content: center;
        height: 2.5rem; padding: 0 .875rem; border-radius: .5rem;
        text-decoration: none; font-weight: 600; border: 1px solid transparent;
        transition: transform .06s ease, box-shadow .2s ease, background-color .2s ease;
        will-change: transform;
      }
      .btn:active { transform: translateY(1px); }
      .btn-primary { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
      .btn-outline { background: transparent; color: hsl(var(--foreground)); border-color: hsl(var(--border)); }
      .brand { display: inline-block; margin-bottom: .75rem; color: hsl(var(--muted-foreground)); font-size: .875rem; }
    </style>
  </head>
  <body>
    <main class="wrap" role="main">
      <section class="card" aria-labelledby="expired-title">
        <span class="brand">Limi.to</span>
        <h1 id="expired-title">This link has expired</h1>
        <p>The link you’re trying to open is no longer available. It may have reached its time limit or the maximum number of allowed clicks.</p>
        <p style="margin-top:.5rem">You can head back to Limi.to or create your own expiring link in seconds.</p>
        <div class="actions">
          <a class="btn btn-primary" href="/">Go to Limi.to</a>
          <a class="btn btn-outline" href="/login">Create your own link</a>
        </div>
      </section>
    </main>
  </body>
  </html>`;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const sb = getServiceClient();
  // 1) Fetch the link first to avoid unnecessary rate-limit writes for unknown slugs
  const { data: link } = await sb
    .from("links")
    .select(
      "id,destination_url,fallback_url,mode,expires_at,click_limit,click_count,is_active"
    )
    .eq("slug", params.slug)
    .single();
  if (!link) {
    return new NextResponse(expiredHtml(), {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // 2) Apply rate limits only for existing slugs
  const ip = ipFromRequestHeaders(request.headers);
  const perIp = await allowAndIncrement(
    "redirect_ip",
    `ip:${ip}:slug:${params.slug}`,
    config.rateLimit.redirectsPerIpPerMin,
    60_000,
    sb
  );
  if (!perIp.allowed)
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  const global = await allowAndIncrement(
    "redirect_slug",
    `slug:${params.slug}`,
    config.rateLimit.globalPerSlugPerMin,
    60_000,
    sb
  );
  if (!global.allowed)
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });

  const expired = isExpired(link);
  if (expired) {
    if (link.fallback_url) {
      return NextResponse.redirect(link.fallback_url, { status: 302 });
    }
    return new NextResponse(expiredHtml(), {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const referrer = request.headers.get("referer") || null;
  const userAgent = request.headers.get("user-agent") || null;

  const newCount = (link.click_count ?? 0) + 1;
  const nowIso = new Date().toISOString();

  await Promise.all([
    sb
      .from("links")
      .update({ click_count: newCount, last_clicked_at: nowIso })
      .eq("id", link.id),
    sb.from("click_events").insert({
      link_id: link.id,
      clicked_at: nowIso,
      referrer,
      user_agent: userAgent,
    }),
  ]);

  // Cleanup is now handled by a scheduled job (pg_cron). No opportunistic deletions here.

  return NextResponse.redirect(link.destination_url, { status: 302 });
}
