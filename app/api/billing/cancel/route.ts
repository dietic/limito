import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { cancelSubscription } from "@/lib/lemon";
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
    if (error) return jsonError("Failed to fetch subscription", 500);
    const sub = rows?.[0];
    if (!sub || !sub.provider_subscription_id) {
      return jsonError("No active subscription", 400);
    }
    await cancelSubscription(sub.provider_subscription_id);
    // Mark as not active; webhook will later set final status and dates
    const { error: upErr } = await sb
      .from("billing_subscriptions")
      .update({ is_active: false, status: "cancelled" })
      .eq("id", sub.id);
    if (upErr) return jsonError("Failed to update subscription", 500);
    // Downgrade plan to free at period end: leaving to webhook for accuracy.
    return jsonSuccess({ cancelled: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 400);
  }
}
