import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const sb = getServiceClient();
    const [{ data: profile }, { data: subs }] = await Promise.all([
      sb.from("profiles").select("plan").eq("id", userId).maybeSingle(),
      sb
        .from("billing_subscriptions")
        .select(
          "provider, provider_subscription_id, status, is_active, current_period_end, renews_at, ends_at, variant_id"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    const plan = profile?.plan ?? "free";
    const active = subs?.find((s) => s.is_active) ?? null;
    return jsonSuccess({ plan, activeSubscription: active });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 400);
  }
}
