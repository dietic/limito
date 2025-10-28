import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import {
  changeSubscriptionVariant,
  createCheckout,
  getRedirectUrls,
  getStoreId,
} from "@/lib/lemon";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as unknown;
    if (plan !== "plus" && plan !== "pro" && plan !== "free") {
      return jsonError("Invalid plan", 400);
    }

    const sb = getServiceClient();

    // Get current active subscription (if any)
    const { data: subs, error: subErr } = await sb
      .from("billing_subscriptions")
      .select("id, provider_subscription_id, is_active")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (subErr) {
      return jsonError(`DB error: ${subErr.message ?? "Failed to fetch subscription"}`, 500);
    }

    const active =
      (
        subs as Array<{
          id: string;
          provider_subscription_id: string | null;
          is_active: boolean;
        }> | null
      )?.find((s) => s.is_active) ?? null;

    if (plan === "free") {
      // Downgrade to free means cancel if there is an active subscription
      if (!active?.provider_subscription_id)
        return jsonSuccess({ changed: false });
      // Reuse cancel endpoint logic indirectly by deactivating here; using lemon helper is simpler to avoid duplication
      try {
        const { cancelSubscription } = await import("@/lib/lemon");
        await cancelSubscription(active.provider_subscription_id);
      } catch (lemonErr) {
        const msg = lemonErr instanceof Error ? lemonErr.message : "Failed to cancel with provider";
        return jsonError(msg, 500);
      }
      await sb
        .from("billing_subscriptions")
        .update({ is_active: false, status: "cancelled" })
        .eq("id", active.id);
      await sb.from("profiles").update({ plan: "free" }).eq("id", userId);
      return jsonSuccess({ changed: true });
    }

    // We have a paid target plan
    const variantEnv =
      plan === "plus"
        ? process.env["LEMONSQUEEZY_PLUS_VARIANT_ID"]
        : process.env["LEMONSQUEEZY_PRO_VARIANT_ID"];
    const variantId = Number(variantEnv);
    if (!variantEnv || Number.isNaN(variantId)) {
      return jsonError("Billing not configured (missing variant id).", 500);
    }

    if (active?.provider_subscription_id) {
      // In-place swap (upgrade/downgrade between Plus/Pro)
      try {
        await changeSubscriptionVariant(
          active.provider_subscription_id,
          variantId
        );
      } catch (lemonErr) {
        const msg = lemonErr instanceof Error ? lemonErr.message : "Failed to change plan with provider";
        return jsonError(msg, 500);
      }
      return jsonSuccess({ changed: true });
    }

    // No active sub: start a checkout flow
    try {
      const storeId = getStoreId();
      const { redirectUrl, cancelUrl } = getRedirectUrls(plan);
      const checkout = await createCheckout({
        storeId,
        variantId,
        custom: { user_id: userId },
        redirectUrl,
        cancelUrl,
      });
      return jsonSuccess({ url: checkout.url });
    } catch (lemonErr) {
      const msg = lemonErr instanceof Error ? lemonErr.message : "Failed to create checkout";
      return jsonError(msg, 500);
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    return jsonError(message, 500);
  }
}
