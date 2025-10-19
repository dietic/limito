import { config } from "@/lib/config";
import { isExpired } from "@/lib/expiration";
import { allowAndIncrement, ipFromRequestHeaders } from "@/lib/rate-limit";
import { getServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function expiredHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Link expired</title><style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;margin:0;padding:2rem;background:#fff;color:#111} .c{max-width:36rem;margin:4rem auto;text-align:center} .a{display:inline-flex;align-items:center;justify-content:center;padding:.5rem 1rem;border-radius:.5rem;background:#2d5dc5;color:#fff;text-decoration:none}</style></head><body><main class="c"><h1>Link expired</h1><p>This link is no longer available.</p><a class="a" href="/">Go to Limi.to</a></main></body></html>`;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const sb = getServiceClient();
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
  const { data: link } = await sb
    .from("links")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!link) {
    return new NextResponse(expiredHtml(), {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

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

  return NextResponse.redirect(link.destination_url, { status: 302 });
}
