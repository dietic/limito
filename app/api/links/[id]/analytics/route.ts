import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { getServiceClient } from "@/lib/supabase";
import { NextRequest } from "next/server";

// Returns analytics for a link including campaign activations and lifetime clicks
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { userId } = await requireAuth(request);
    const sb = getServiceClient();

    // Ensure link exists and belongs to the user
    const { data: link, error: linkErr } = await sb
      .from("links")
      .select(
        "id,current_activation_id,click_count,last_clicked_at,mode,expires_at,click_limit"
      )
      .eq("id", params.id)
      .eq("owner_id", userId)
      .single();
    if (linkErr || !link) return jsonError("Not found", 404);

    // Fetch activations (campaigns) newest first
    const { data: activations, error: actsErr } = await sb
      .from("link_activations")
      .select(
        "id,activated_at,deactivated_at,mode,expires_at,click_limit,click_count,ended_reason"
      )
      .eq("link_id", link.id)
      .order("activated_at", { ascending: false });
    if (actsErr) {
      const msg = (actsErr as { message?: string }).message || "";
      const isMissing = msg.toLowerCase().includes("link_activations");
      return jsonError(
        process.env.NODE_ENV === "production"
          ? "Failed to fetch analytics"
          : isMissing
          ? "Database not initialized: run Supabase migrations (link_activations missing)"
          : `Failed to fetch analytics${msg ? ": " + msg : ""}`,
        500
      );
    }

    const lifetime = (activations || []).reduce(
      (sum, a) => sum + (a.click_count ?? 0),
      0
    );

    return jsonSuccess({
      current_activation_id: link.current_activation_id,
      current_clicks: link.click_count ?? 0,
      last_clicked_at: link.last_clicked_at,
      lifetime_clicks: lifetime,
      activations: activations ?? [],
    });
  } catch (e) {
    if ((e as Error).message === "Unauthorized")
      return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}
