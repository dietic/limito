import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createCheckout, getRedirectUrls, getStoreId } from "@/lib/lemon";

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      plan?: "plus" | "pro";
    };
    const plan = body.plan;
    if (plan !== "plus" && plan !== "pro") {
      return jsonError("Invalid plan", 400);
    }
    const storeId = getStoreId();
    const variantEnv =
      plan === "plus"
        ? process.env["LEMONSQUEEZY_PLUS_VARIANT_ID"]
        : process.env["LEMONSQUEEZY_PRO_VARIANT_ID"];
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
