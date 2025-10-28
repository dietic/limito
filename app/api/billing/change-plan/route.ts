import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import {
  changeSubscriptionVariant,
  createCheckout,
  getRedirectUrls,
  getStoreId,
  getSubscriptionWithCustomer,
} from "@/lib/lemon";
import { updatePlanAndEnforce } from "@/lib/plans";
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
      return jsonError(
        `DB error: ${subErr.message ?? "Failed to fetch subscription"}`,
        500
      );
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
      // If there's no active subscription record, just update the plan locally.
      if (!active?.provider_subscription_id) {
        try {
          await updatePlanAndEnforce(userId, "free", { client: sb });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to update plan";
          return jsonError(message, 500);
        }
        return jsonSuccess({ changed: true });
      }

      // Downgrade to free means cancel the active subscription first.
      try {
        const { cancelSubscription } = await import("@/lib/lemon");
        await cancelSubscription(active.provider_subscription_id);
      } catch (lemonErr) {
        const msg =
          lemonErr instanceof Error
            ? lemonErr.message
            : "Failed to cancel with provider";
        return jsonError(msg, 500);
      }
      await sb
        .from("billing_subscriptions")
        .update({ is_active: false, status: "cancelled" })
        .eq("id", active.id);

      try {
        await updatePlanAndEnforce(userId, "free", { client: sb });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update plan";
        return jsonError(message, 500);
      }

      return jsonSuccess({ changed: true });
    }

    // Helper to resolve the desired variant using MONTHLY/YEARLY envs
    const pickVariant = (
      targetPlan: "plus" | "pro",
      interval: "monthly" | "yearly"
    ): number | null => {
      const envName =
        targetPlan === "plus"
          ? interval === "yearly"
            ? "LEMONSQUEEZY_PLUS_YEARLY_VARIANT_ID"
            : "LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID"
          : interval === "yearly"
          ? "LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID"
          : "LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID";
      const v = process.env[envName];
      const n = Number(v);
      return v && !Number.isNaN(n) ? n : null;
    };

    if (active?.provider_subscription_id) {
      // In-place swap (upgrade/downgrade between Plus/Pro), preserve interval
      // Determine current interval by inspecting current variant id
      let interval: "monthly" | "yearly" = "monthly";
      try {
        const sub = await getSubscriptionWithCustomer(
          active.provider_subscription_id
        );
        const currentVariant = sub.variantId ?? null;
        const plusMonthly = Number(
          process.env["LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID"] ?? NaN
        );
        const plusYearly = Number(
          process.env["LEMONSQUEEZY_PLUS_YEARLY_VARIANT_ID"] ?? NaN
        );
        const proMonthly = Number(
          process.env["LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID"] ?? NaN
        );
        const proYearly = Number(
          process.env["LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID"] ?? NaN
        );
        if (
          currentVariant !== null &&
          (currentVariant === plusYearly || currentVariant === proYearly)
        ) {
          interval = "yearly";
        } else if (
          currentVariant !== null &&
          (currentVariant === plusMonthly || currentVariant === proMonthly)
        ) {
          interval = "monthly";
        }
      } catch {
        // default to monthly if we can't determine
      }
      const variantId =
        pickVariant(plan, interval) ?? pickVariant(plan, "monthly");
      if (!variantId) {
        return jsonError("Billing not configured (variant ids)", 500);
      }
      // Perform swap
      try {
        await changeSubscriptionVariant(
          active.provider_subscription_id,
          variantId
        );
      } catch (lemonErr) {
        const msg =
          lemonErr instanceof Error
            ? lemonErr.message
            : "Failed to change plan with provider";
        return jsonError(msg, 500);
      }
      try {
        await updatePlanAndEnforce(userId, plan, { client: sb });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update plan";
        return jsonError(message, 500);
      }
      return jsonSuccess({ changed: true });
    }

    // No active sub: start a checkout flow (default monthly)
    try {
      const storeId = getStoreId();
      const { redirectUrl, cancelUrl } = getRedirectUrls(plan);
      const variantId =
        pickVariant(plan, "monthly") ?? pickVariant(plan, "yearly");
      if (!variantId) {
        return jsonError("Billing not configured (variant ids)", 500);
      }
      const checkout = await createCheckout({
        storeId,
        variantId,
        custom: { user_id: userId },
        redirectUrl,
        cancelUrl,
      });
      return jsonSuccess({ url: checkout.url });
    } catch (lemonErr) {
      const msg =
        lemonErr instanceof Error
          ? lemonErr.message
          : "Failed to create checkout";
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
