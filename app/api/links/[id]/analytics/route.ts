import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { getServiceClient } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = await requireAuth(request);
    const sb = getServiceClient();
    const { data: link, error } = await sb
      .from("links")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", userId)
      .single();
    if (error || !link) return jsonError("Not found", 404);
    const stats = {
      click_count: link.click_count ?? 0,
      last_clicked_at: link.last_clicked_at,
    };
    return jsonSuccess(stats);
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}
