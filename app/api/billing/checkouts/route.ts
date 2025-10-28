import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createCheckout, getRedirectUrls, getStoreId } from "@/lib/lemon";

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      plan?: "plus" | "pro";
      interval?: "monthly" | "yearly" | "annual"; // accept legacy 'annual' but normalize to 'yearly'
    };
    const plan = body.plan;
    if (plan !== "plus" && plan !== "pro") {
      return jsonError("Invalid plan", 400);
    }
    // Normalize interval (default to monthly if unspecified)
    const intervalRaw = (body.interval ?? "monthly").toLowerCase();
    const interval = intervalRaw === "annual" ? "yearly" : intervalRaw;
    if (interval !== "monthly" && interval !== "yearly") {
      return jsonError("Invalid interval", 400);
    }
    const storeId = getStoreId();
    // Select variant strictly via MONTHLY/YEARLY envs (no legacy fallbacks)
    const variantEnv =
      plan === "plus"
        ? interval === "yearly"
          ? process.env["LEMONSQUEEZY_PLUS_YEARLY_VARIANT_ID"]
          : process.env["LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID"]
        : interval === "yearly"
        ? process.env["LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID"]
        : process.env["LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID"];
    const variantId = Number(variantEnv);
    if (!variantEnv || Number.isNaN(variantId)) {
      return jsonError("Billing not configured (missing variant id).", 500);
    }
    const { redirectUrl, cancelUrl } = getRedirectUrls(plan);
    const checkout = await createCheckout({
      storeId,
      variantId,
      custom: { user_id: userId },
      redirectUrl,
      cancelUrl,
    });
    return jsonSuccess({ url: checkout.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 400);
  }
}
