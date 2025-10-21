import type { Link } from "@/types/link";

export type Expirable = Pick<
  Link,
  "is_active" | "mode" | "expires_at" | "click_limit" | "click_count"
>;

export function isExpired(link: Expirable, now: Date = new Date()): boolean {
  // Primary, source-of-truth checks based on configuration
  if (link.mode === "by_date") {
    if (link.expires_at) {
      if (new Date(link.expires_at).getTime() <= now.getTime()) return true;
    }
  } else if (link.mode === "by_clicks") {
    if (link.click_limit != null) {
      if ((link.click_count ?? 0) >= link.click_limit) return true;
    }
  }
  // Fallback: if explicitly marked inactive and no rule says it's expired yet, treat as expired
  if (link.is_active === false) return true;
  return false;
}

export type ActivationExpirable = {
  mode: Link["mode"];
  expires_at: Link["expires_at"];
  click_limit: Link["click_limit"];
  click_count: Link["click_count"];
  deactivated_at: string | null;
};

export function isActivationExpired(
  a: ActivationExpirable,
  now: Date = new Date()
): boolean {
  if (a.deactivated_at) return true;
  if (a.mode === "by_date") {
    if (a.expires_at) return new Date(a.expires_at).getTime() <= now.getTime();
    return false;
  }
  if (a.mode === "by_clicks") {
    if (a.click_limit == null) return false;
    return (a.click_count ?? 0) >= a.click_limit;
  }
  return false;
}
