import { config } from "@/lib/config";
import { getServiceClient } from "@/lib/supabase";

type PlanName = "free" | "plus" | "pro";

type PlanLimits = (typeof config.plans)[PlanName];

type ServiceClient = ReturnType<typeof getServiceClient>;

const TRIM_BATCH_SIZE = 100;

export function resolvePlan(plan: string | null | undefined): PlanName {
  const normalized = (plan ?? "").toLowerCase();
  if (normalized === "plus" || normalized === "pro") return normalized;
  return "free";
}

export function getPlanLimits(plan: PlanName): PlanLimits {
  return config.plans[plan];
}

function assertClient(client: ServiceClient | undefined): ServiceClient {
  return client ?? getServiceClient();
}

export async function enforceActiveLinkLimit(
  userId: string,
  plan: PlanName,
  options?: { client?: ServiceClient }
): Promise<{ trimmed: number }> {
  const limits = getPlanLimits(plan);
  if (!Number.isFinite(limits.maxActiveLinks)) {
    return { trimmed: 0 };
  }

  const max = Math.max(0, Math.floor(limits.maxActiveLinks));

  const sb = assertClient(options?.client);

  const { count, error: countErr } = await sb
    .from("links")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("is_active", true);

  if (countErr) {
    throw new Error(
      countErr.message
        ? `Failed to count links for enforcement: ${countErr.message}`
        : "Failed to count links for enforcement"
    );
  }

  const totalActive = count ?? 0;
  if (totalActive <= max) {
    return { trimmed: 0 };
  }

  let remaining = totalActive - max;
  let trimmed = 0;

  while (remaining > 0) {
    const fetchSize = Math.min(remaining, TRIM_BATCH_SIZE);
    const { data: batch, error: fetchErr } = await sb
      .from("links")
      .select("id,current_activation_id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .order("updated_at", { ascending: true, nullsFirst: true })
      .limit(fetchSize);

    if (fetchErr) {
      throw new Error(
        fetchErr.message
          ? `Failed to fetch links for enforcement: ${fetchErr.message}`
          : "Failed to fetch links for enforcement"
      );
    }

    if (!batch || batch.length === 0) {
      break;
    }

    const linkIds = batch.map((row) => row.id);
    const nowIso = new Date().toISOString();
    const { error: updateErr } = await sb
      .from("links")
      .update({
        is_active: false,
        current_activation_id: null,
        updated_at: nowIso,
      })
      .in("id", linkIds);

    if (updateErr) {
      throw new Error(
        updateErr.message
          ? `Failed to deactivate excess links: ${updateErr.message}`
          : "Failed to deactivate excess links"
      );
    }

    const activationIds = batch
      .map((row) => row.current_activation_id)
      .filter((id): id is string => Boolean(id));

    if (activationIds.length > 0) {
      const { error: activationErr } = await sb
        .from("link_activations")
        .update({ deactivated_at: nowIso, ended_reason: "plan_downgrade" })
        .in("id", activationIds);

      if (activationErr) {
        throw new Error(
          activationErr.message
            ? `Failed to update link activations: ${activationErr.message}`
            : "Failed to update link activations"
        );
      }
    }

    trimmed += linkIds.length;
    remaining -= linkIds.length;

    if (linkIds.length < fetchSize) {
      break;
    }
  }

  return { trimmed };
}

export async function updatePlanAndEnforce(
  userId: string,
  plan: PlanName,
  options?: { client?: ServiceClient }
): Promise<{ trimmed: number }> {
  const sb = assertClient(options?.client);
  const { error } = await sb.from("profiles").update({ plan }).eq("id", userId);

  if (error) {
    throw new Error(
      error.message
        ? `Failed to update plan: ${error.message}`
        : "Failed to update plan"
    );
  }

  return enforceActiveLinkLimit(userId, plan, { client: sb });
}
