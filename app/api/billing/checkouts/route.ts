import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createCheckout, getRedirectUrls, getStoreId } from "@/lib/lemon";

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      plan?: "plus" | "pro";
      interval?: "monthly" | "annual" | "yearly";
    };
    const plan = body.plan;
    if (plan !== "plus" && plan !== "pro") {
      return jsonError("Invalid plan", 400);
    }
    // Normalize interval (default to monthly if unspecified)
    const intervalRaw = (body.interval ?? "monthly").toLowerCase();
    const interval = intervalRaw === "yearly" ? "annual" : intervalRaw; // accept both terms
    if (interval !== "monthly" && interval !== "annual") {
      return jsonError("Invalid interval", 400);
    }
    const storeId = getStoreId();
    // Prefer interval-specific envs; fall back to legacy single-variant ids if not provided
    let variantEnv: string | undefined;
    if (plan === "plus") {
      variantEnv =
        interval === "annual"
          ? process.env["LEMONSQUEEZY_PLUS_ANNUAL_VARIANT_ID"]
          : process.env["LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID"];
      if (!variantEnv) {
        variantEnv = process.env["LEMONSQUEEZY_PLUS_VARIANT_ID"]; // legacy fallback
      }
    } else {
      variantEnv =
        interval === "annual"
          ? process.env["LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID"]
          : process.env["LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID"];
      if (!variantEnv) {
        variantEnv = process.env["LEMONSQUEEZY_PRO_VARIANT_ID"]; // legacy fallback
      }
    }
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
