import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { generateSlug, isValidCustomSlug } from "@/lib/slug";
import { isExpired } from "@/lib/expiration";
import { getServiceClient } from "@/lib/supabase";
import { sanitizeUrl } from "@/lib/url";
import { updateLinkSchema } from "@/lib/validators/link";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = await requireAuth(request);
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("links")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", userId)
      .single();
    if (error || !data) return jsonError("Not found", 404);
    return jsonSuccess(data);
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = await requireAuth(request);
    const body = await request.json();
    const parsed = updateLinkSchema.safeParse(body);
    if (!parsed.success)
      return jsonError(parsed.error.errors[0]?.message || "Invalid input", 400);
    const sb = getServiceClient();

    const { data: existing, error: getErr } = await sb
      .from("links")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", userId)
      .single();
    if (getErr || !existing) return jsonError("Not found", 404);

    // Disallow editing expired links to keep history consistent.
    if (isExpired(existing)) {
      return jsonError(
        "Cannot edit an expired link. Please duplicate it instead.",
        409
      );
    }

    const payload: Record<string, unknown> = {};
    if (parsed.data.destination_url) {
      const dest = sanitizeUrl(parsed.data.destination_url);
      if (!dest) return jsonError("Invalid destination URL", 400);
      payload["destination_url"] = dest;
    }
    if (parsed.data.fallback_url !== undefined) {
      const fb = parsed.data.fallback_url
        ? sanitizeUrl(parsed.data.fallback_url)
        : null;
      if (parsed.data.fallback_url && !fb)
        return jsonError("Invalid fallback URL", 400);
      payload["fallback_url"] = fb;
    }
    if (parsed.data.slug !== undefined) {
      const raw = parsed.data.slug;
      if (raw === "") {
        // Regenerate a new random slug
        payload["slug"] = generateSlug();
      } else {
        if (!isValidCustomSlug(raw)) return jsonError("Invalid slug", 400);
        payload["slug"] = raw;
      }
    }
    if (parsed.data.mode) payload["mode"] = parsed.data.mode;
    if (parsed.data.expires_at !== undefined)
      payload["expires_at"] = parsed.data.expires_at;
    if (parsed.data.click_limit !== undefined)
      payload["click_limit"] = parsed.data.click_limit;
    if (parsed.data.is_active !== undefined)
      payload["is_active"] = parsed.data.is_active;

    const { data, error } = await sb
      .from("links")
      .update(payload)
      .eq("id", params.id)
      .eq("owner_id", userId)
      .select("*")
      .single();
    if (error) return jsonError("Failed to update link", 500);
    return jsonSuccess(data);
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = await requireAuth(request);
    const sb = getServiceClient();
    const { error } = await sb
      .from("links")
      .delete()
      .eq("id", params.id)
      .eq("owner_id", userId);
    if (error) return jsonError("Failed to delete link", 500);
    return jsonSuccess({ id: params.id });
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}
