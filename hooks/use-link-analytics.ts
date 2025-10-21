"use client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback, useEffect, useState } from "react";

export interface LinkActivation {
  id: string;
  activated_at: string;
  deactivated_at: string | null;
  mode: "by_date" | "by_clicks";
  expires_at: string | null;
  click_limit: number | null;
  click_count: number;
  ended_reason: string | null;
}

export interface LinkAnalytics {
  current_activation_id: string | null;
  current_clicks: number;
  last_clicked_at: string | null;
  lifetime_clicks: number;
  activations: LinkActivation[];
}

export function useLinkAnalytics(linkId: string | null | undefined) {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState<LinkAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!linkId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/links/${linkId}/analytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || "Failed to load");
      setData(payload.data as LinkAnalytics);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, linkId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
