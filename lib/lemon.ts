import { env } from "./env";

type NonEmptyString = string & { readonly __nonEmpty: unique symbol };

function requireNonEmpty(
  name: string,
  value: string | undefined
): NonEmptyString {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing env: ${name}`);
  }
  return value as NonEmptyString;
}

// Minimal JSON:API shapes we care about
export interface LemonCheckoutRequest {
  storeId: number;
  variantId: number;
  custom?: Record<string, string>;
  email?: string;
  name?: string;
  redirectUrl?: string;
  cancelUrl?: string;
}

export interface LemonCheckoutResponse {
  url: string;
  id: string;
}

export interface LemonSubscriptionEvent {
  meta: {
    event_name: string;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status?: string;
      renews_at?: string | null;
      ends_at?: string | null;
      current_period_end?: string | null;
      customer_id?: number | null;
      order_id?: number | null;
      product_id?: number | null;
      variant_id?: number | null;
      user_email?: string | null;
    };
  };
}

const API_BASE = "https://api.lemonsqueezy.com/v1";

function getApiKey(): NonEmptyString {
  // Accept both spellings to be resilient (some setups use LEMON_SQUEEZY_API_KEY)
  const v =
    process.env["LEMONSQUEEZY_API_KEY"] ?? process.env["LEMON_SQUEEZY_API_KEY"];
  return requireNonEmpty("LEMONSQUEEZY_API_KEY", v);
}

export async function createCheckout(
  req: LemonCheckoutRequest
): Promise<LemonCheckoutResponse> {
  const apiKey = getApiKey();
  const body = {
    data: {
      type: "checkouts",
      relationships: {
        store: {
          data: { type: "stores", id: String(req.storeId) },
        },
        variant: {
          data: { type: "variants", id: String(req.variantId) },
        },
      },
      attributes: {
        // Limit to the selected variant and set redirect URL via product_options per LS API
        product_options: {
          redirect_url: req.redirectUrl,
          enabled_variants: [req.variantId],
        },
        checkout_data: {
          email: req.email,
          name: req.name,
          custom: req.custom ?? {},
        },
      },
    },
  };
  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LemonSqueezy: failed to create checkout (${res.status}): ${text}`
    );
  }
  const json: { data: { id: string; attributes: { url: string } } } =
    await res.json();
  return { id: json.data.id, url: json.data.attributes.url };
}

export async function cancelSubscription(
  providerSubscriptionId: string
): Promise<void> {
  const apiKey = getApiKey();
  const body = {
    data: {
      type: "subscriptions",
      id: providerSubscriptionId,
      attributes: {
        cancelled: true,
      },
    },
  };
  const res = await fetch(
    `${API_BASE}/subscriptions/${providerSubscriptionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LemonSqueezy: failed to cancel subscription (${res.status}): ${text}`
    );
  }
}

export async function changeSubscriptionVariant(
  providerSubscriptionId: string,
  newVariantId: number
): Promise<void> {
  const apiKey = getApiKey();
  const body = {
    data: {
      type: "subscriptions",
      id: providerSubscriptionId,
      attributes: {
        // Lemon Squeezy allows swapping to another variant of the product
        variant_id: newVariantId,
      },
    },
  };
  const res = await fetch(
    `${API_BASE}/subscriptions/${providerSubscriptionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LemonSqueezy: failed to change subscription variant (${res.status}): ${text}`
    );
  }
}

export interface VerifiedWebhook<T = unknown> {
  ok: boolean;
  event: T | null;
  reason?: string;
}

export async function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null
): Promise<VerifiedWebhook<LemonSubscriptionEvent>> {
  const secret = process.env["LEMONSQUEEZY_WEBHOOK_SECRET"] ?? "";
  if (!secret) return { ok: false, event: null, reason: "missing secret" };
  if (!signatureHeader)
    return { ok: false, event: null, reason: "missing signature" };
  // HMAC SHA256 in hex
  const crypto = await import("node:crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const safeEqual = (a: string, b: string) => {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(new Uint8Array(bufA), new Uint8Array(bufB));
  };
  if (!safeEqual(expected, signatureHeader)) {
    return { ok: false, event: null, reason: "invalid signature" };
  }
  const parsed = JSON.parse(rawBody) as LemonSubscriptionEvent;
  return { ok: true, event: parsed };
}

export function mapVariantToPlan(
  variantId: number | null | undefined
): "free" | "plus" | "pro" {
  const plusId = Number(process.env["LEMONSQUEEZY_PLUS_VARIANT_ID"] ?? NaN);
  const proId = Number(process.env["LEMONSQUEEZY_PRO_VARIANT_ID"] ?? NaN);
  if (variantId && !Number.isNaN(plusId) && variantId === plusId) return "plus";
  if (variantId && !Number.isNaN(proId) && variantId === proId) return "pro";
  return "free";
}

export function getStoreId(): number {
  const v = process.env["LEMONSQUEEZY_STORE_ID"];
  if (!v) throw new Error("Missing env: LEMONSQUEEZY_STORE_ID");
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error("Invalid LEMONSQUEEZY_STORE_ID");
  return n;
}

export function getRedirectUrls(plan?: "plus" | "pro"): {
  redirectUrl: string;
  cancelUrl: string;
} {
  const base = env.APP_URL;
  return {
    redirectUrl: plan
      ? `${base}/dashboard?upgraded=${plan}`
      : `${base}/dashboard`,
    cancelUrl: `${base}/pricing`,
  };
}

export interface LemonSubscriptionDetails {
  id: string;
  status: string;
  variantId: number | null;
  customerId: number | null;
  customerEmail: string | null;
}

export async function getSubscriptionWithCustomer(
  subscriptionId: string
): Promise<LemonSubscriptionDetails> {
  const apiKey = getApiKey();
  const res = await fetch(
    `${API_BASE}/subscriptions/${subscriptionId}?include=customer`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LemonSqueezy: failed to fetch subscription (${res.status}): ${text}`
    );
  }
  const json = (await res.json()) as {
    data: {
      id: string;
      attributes?: {
        status?: string;
        variant_id?: number;
        customer_id?: number;
      };
    };
    included?: Array<{ type: string; attributes?: { email?: string } }>;
  };
  const data = json.data;
  const included = Array.isArray(json.included) ? json.included : [];
  const customer = included.find((i) => i.type === "customers");
  const email: string | null =
    customer && customer.attributes ? customer.attributes.email ?? null : null;
  return {
    id: data.id,
    status: data.attributes?.status ?? "unknown",
    variantId: data.attributes?.variant_id ?? null,
    customerId: data.attributes?.customer_id ?? null,
    customerEmail: email,
  };
}

export interface LemonOrderDetails {
  id: string;
  customUserId: string | null;
}

export async function getOrder(orderId: number): Promise<LemonOrderDetails> {
  const apiKey = getApiKey();
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LemonSqueezy: failed to fetch order (${res.status}): ${text}`
    );
  }
  const json = (await res.json()) as {
    data: {
      id: string;
      attributes?: {
        meta?: { checkout_data?: { custom?: Record<string, unknown> } };
      };
    };
  };
  const custom = json.data.attributes?.meta?.checkout_data?.custom ?? null;
  const customUserId =
    custom && typeof custom["user_id"] === "string"
      ? (custom["user_id"] as string)
      : null;
  return { id: json.data.id, customUserId };
}
