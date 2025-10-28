import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { cancelSubscription } from "@/lib/lemon";
import { updatePlanAndEnforce } from "@/lib/plans";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const sb = getServiceClient();
    const { data: rows, error } = await sb
      .from("billing_subscriptions")
      .select("id, provider_subscription_id, status, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1);
    if (error) {
      return jsonError(
        `DB error: ${error.message ?? "Failed to fetch subscription"}`,
        500
      );
    }
    const sub = rows?.[0];
    if (!sub || !sub.provider_subscription_id) {
      return jsonError("No active subscription", 400);
    }
    try {
      await cancelSubscription(sub.provider_subscription_id);
    } catch (lemonErr) {
      const msg =
        lemonErr instanceof Error
          ? lemonErr.message
          : "Failed to cancel with provider";
      return jsonError(msg, 500);
    }
    // Mark as not active; webhook will later set final status and dates
    const { error: upErr } = await sb
      .from("billing_subscriptions")
      .update({ is_active: false, status: "cancelled" })
      .eq("id", sub.id);
    if (upErr) {
      return jsonError(
        `DB error: ${upErr.message ?? "Failed to update subscription"}`,
        500
      );
    }
    // Immediately downgrade locally and enforce limits to provide instant feedback.
    try {
      await updatePlanAndEnforce(userId, "free", { client: sb });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to enforce plan limits";
      return jsonError(msg, 500);
    }
    return jsonSuccess({ cancelled: true, downgraded: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
}
