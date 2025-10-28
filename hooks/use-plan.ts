"use client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback, useEffect, useState } from "react";

type UserPlan = "free" | "plus" | "pro";

interface PlanState {
  loading: boolean;
  plan: UserPlan | null;
  error: string | null;
}

export function usePlan() {
  const { userId, getAccessToken } = useAuth();
  const [state, setState] = useState<PlanState>({
    loading: true,
    plan: null,
    error: null,
  });

  const fetchPlan = useCallback(async () => {
    if (!userId) {
      setState({ loading: false, plan: null, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const token = await getAccessToken();
      if (!token) {
        setState({ loading: false, plan: null, error: "Unauthorized" });
        return;
      }
      const res = await fetch("/api/billing/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        const message = payload?.message || "Failed to load plan";
        setState({ loading: false, plan: null, error: message });
        return;
      }
      const planRaw = String(payload?.data?.plan ?? "free").toLowerCase();
      const plan: UserPlan =
        planRaw === "plus" || planRaw === "pro" ? planRaw : "free";
      setState({ loading: false, plan, error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load plan";
      setState({ loading: false, plan: null, error: message });
    }
  }, [userId, getAccessToken]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const refresh = useCallback(() => {
    void fetchPlan();
  }, [fetchPlan]);

  return {
    ...state,
    refresh,
    isPaid: state.plan === "plus" || state.plan === "pro",
    isPlus: state.plan === "plus",
    isPro: state.plan === "pro",
  };
}
