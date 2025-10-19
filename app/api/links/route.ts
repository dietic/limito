import { requireAuth } from "@/lib/auth";
import { config } from "@/lib/config";
import { jsonError, jsonSuccess } from "@/lib/http";
import { allowAndIncrement } from "@/lib/rate-limit";
import { generateSlug, isValidCustomSlug } from "@/lib/slug";
import { getServiceClient } from "@/lib/supabase";
import { sanitizeUrl } from "@/lib/url";
import { createLinkSchema } from "@/lib/validators/link";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);
    let sb;
    try {
      sb = getServiceClient();
    } catch (e) {
      const msg = (e as Error).message || "";
      if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
        return jsonError(
          process.env.NODE_ENV === "production"
            ? "Server error"
            : "Server not configured: SUPABASE_SERVICE_ROLE_KEY is missing",
          500
        );
      }
      return jsonError("Server error", 500);
    }
    const { data, error } = await sb
      .from("links")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      const errMsg = String((error as { message?: string }).message || "");
      const isMissingTable =
        (errMsg.toLowerCase().includes("relation") &&
          errMsg.toLowerCase().includes("links")) ||
        errMsg.toLowerCase().includes("schema cache");
      return jsonError(
        process.env.NODE_ENV === "production"
          ? "Failed to fetch links"
          : isMissingTable
          ? "Database not initialized: run Supabase migrations"
          : `Failed to fetch links${errMsg ? ": " + errMsg : ""}`,
        500
      );
    }
    return jsonSuccess(data);
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success)
      return jsonError(parsed.error.errors[0]?.message || "Invalid input", 400);

    let sb;
    try {
      sb = getServiceClient();
    } catch (e) {
      const msg = (e as Error).message || "";
      if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
        return jsonError(
          process.env.NODE_ENV === "production"
            ? "Server error"
            : "Server not configured: SUPABASE_SERVICE_ROLE_KEY is missing",
          500
        );
      }
      return jsonError("Server error", 500);
    }

    const { count: activeCount } = await sb
      .from("links")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("is_active", true);

    if ((activeCount ?? 0) >= config.plans.free.maxActiveLinks) {
      return jsonError("Free plan limit reached", 403);
    }

    const rl = await allowAndIncrement(
      "create_link",
      `user:${userId}`,
      config.plans.free.dailyCreations,
      24 * 60 * 60 * 1000,
      sb
    );
    if (!rl.allowed)
      return jsonError("Daily creation limit reached", {
        status: 429,
        headers: { "Retry-After": "86400" },
      });

    let slug = parsed.data.slug?.toLowerCase().trim() || "";
    if (slug && !isValidCustomSlug(slug)) return jsonError("Invalid slug", 400);
    if (!slug) slug = generateSlug();

    const dest = sanitizeUrl(parsed.data.destination_url);
    if (!dest) return jsonError("Invalid destination URL", 400);

    const fallback = parsed.data.fallback_url
      ? sanitizeUrl(parsed.data.fallback_url)
      : null;
    if (parsed.data.fallback_url && !fallback)
      return jsonError("Invalid fallback URL", 400);

    const insertPayload = {
      owner_id: userId,
      slug,
      destination_url: dest,
      fallback_url: fallback,
      mode: parsed.data.mode,
      expires_at:
        parsed.data.mode === "by_date" ? parsed.data.expires_at : null,
      click_limit:
        parsed.data.mode === "by_clicks" ? parsed.data.click_limit : null,
      click_count: 0,
      last_clicked_at: null,
      is_active: true,
    };

    const { data, error } = await sb
      .from("links")
      .insert(insertPayload)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") return jsonError("Slug already exists", 409);
      return jsonError("Failed to create link", 500);
    }
    return jsonSuccess(data, 201);
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}
