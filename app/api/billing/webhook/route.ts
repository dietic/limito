import {
  getOrder,
  getSubscriptionWithCustomer,
  mapVariantToPlan,
  verifyWebhook,
} from "@/lib/lemon";
import { updatePlanAndEnforce } from "@/lib/plans";
import { getServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signature =
    request.headers.get("X-Signature") ||
    request.headers.get("X-Webhook-Signature");
  const raw = await request.text();
  const verified = await verifyWebhook(raw, signature);
  if (!verified.ok || !verified.event) {
    return NextResponse.json(
      { error: true, message: verified.reason ?? "invalid" },
      { status: 400 }
    );
  }
  const ev = verified.event;
  if (!ev.data || ev.data.type !== "subscriptions") {
    return NextResponse.json({ success: true });
  }
  const subId = ev.data.id;
  const attrs = ev.data.attributes;
  const sb = getServiceClient();

  const variantId = attrs.variant_id ?? null;
  const plan = mapVariantToPlan(variantId ?? null);

  // Attempt to extract our custom user_id if available via related payloads in the future.
  // Since Lemon Squeezy does not echo custom fields on subscription events consistently,
  // we rely on upserting by provider_subscription_id and leave user linkage to the first time we can infer it.

  // Upsert subscription by provider_subscription_id; user_id remains unchanged once set.
  const { data: existing } = await sb
    .from("billing_subscriptions")
    .select("id, user_id")
    .eq("provider_subscription_id", subId)
    .maybeSingle();

  // We cannot trust user email here to map to a user safely; require mapping from checkout custom user_id set at purchase time
  // which should be filled by a future order/checkout webhook. For now, keep user_id as-is if present.

  const status = (attrs.status ?? "").toLowerCase();
  const isActive = status === "active" || status === "on_trial";
  const payload = {
    provider: "lemonsqueezy",
    provider_subscription_id: subId,
    provider_customer_id: attrs.customer_id ? String(attrs.customer_id) : null,
    variant_id: variantId ? Number(variantId) : null,
    status,
    is_active: isActive,
    current_period_end: attrs.current_period_end
      ? new Date(attrs.current_period_end).toISOString()
      : null,
    renews_at: attrs.renews_at ? new Date(attrs.renews_at).toISOString() : null,
    ends_at: attrs.ends_at ? new Date(attrs.ends_at).toISOString() : null,
  };

  let linkedUserId: string | null = existing?.user_id ?? null;
  if (!linkedUserId) {
    // Try to resolve via order custom.user_id or by customer email
    try {
      const details = await getSubscriptionWithCustomer(subId);
      if (attrs.order_id) {
        const ord = await getOrder(Number(attrs.order_id));
        if (ord.customUserId) linkedUserId = ord.customUserId;
      }
      if (!linkedUserId && details.customerEmail) {
        // Use Supabase Admin API to map email -> user id
        const sbAdmin = getServiceClient();
        const list = await sbAdmin.auth.admin.listUsers();
        const found = list.data?.users?.find(
          (u) => u.email === details.customerEmail
        );
        if (found?.id) linkedUserId = found.id;
      }
    } catch {}
  }

  if (existing) {
    await sb
      .from("billing_subscriptions")
      .update({ ...payload, user_id: linkedUserId ?? existing.user_id })
      .eq("id", existing.id);
  } else {
    // Insert new record, even if user is not linked yet
    await sb
      .from("billing_subscriptions")
      .insert({ ...payload, user_id: linkedUserId });
  }

  // If we know the user, update their plan to match mapping when active; downgrade to free when not
  if (linkedUserId) {
    const newPlan = isActive ? plan : "free";
    try {
      await updatePlanAndEnforce(linkedUserId, newPlan, { client: sb });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update plan";
      return NextResponse.json({ error: true, message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
