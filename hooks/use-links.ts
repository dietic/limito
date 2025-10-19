"use client";
import { useAuth } from "@/hooks/use-auth";
import type { CreateLinkInput, UpdateLinkInput } from "@/lib/validators/link";
import type { Link } from "@/types/link";
import { useCallback, useEffect, useState } from "react";

interface LinksState {
  loading: boolean;
  error: string | null;
  items: Link[];
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

type FetchOptions = { limit?: number; offset?: number };

export function useLinks(initial?: FetchOptions) {
  const { getAccessToken, userId } = useAuth();
  const [state, setState] = useState<LinksState>({
    loading: false,
    error: null,
    items: [],
  });

  const getAuthHeaders = useCallback(async (): Promise<
    Record<string, string>
  > => {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getAccessToken]);

  const refresh = useCallback(async (opts?: FetchOptions) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      const limit = opts?.limit ?? initial?.limit;
      const offset = opts?.offset ?? initial?.offset;
      if (limit) params.set("limit", String(limit));
      if (typeof offset === "number" && offset > 0)
        params.set("offset", String(offset));
      const url = params.toString()
        ? `/api/links?${params.toString()}`
        : "/api/links";
      const res = await fetch(url, { headers });
      const payload = await res.json();
      if (!res.ok) {
        setState({
          loading: false,
          error: payload.message || "Failed to load",
          items: [],
        });
        return;
      }
      // Back-compat: payload.data can be an array (old) or an object with items
      const data = payload.data;
      if (Array.isArray(data)) {
        setState({ loading: false, error: null, items: data });
      } else {
        setState({
          loading: false,
          error: null,
          items: (data.items as Link[]) ?? [],
          total: data.total as number,
          limit: data.limit as number,
          offset: data.offset as number,
          hasMore: data.hasMore as boolean,
        });
      }
    } catch {
      setState({ loading: false, error: "Network error", items: [] });
    }
  }, [getAuthHeaders, initial?.limit, initial?.offset]);

  useEffect(() => {
    if (!userId) return;
    refresh(initial);
  }, [userId, refresh, initial]);

  const createLink = useCallback(
    async (input: CreateLinkInput) => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json();
      if (!res.ok) return { ok: false, message: payload.message as string };
      await refresh(initial);
      return { ok: true, data: payload.data as Link };
    },
    [getAuthHeaders, refresh, initial]
  );

  const updateLink = useCallback(
    async (id: string, input: UpdateLinkInput) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json();
      if (!res.ok) return { ok: false, message: payload.message as string };
      await refresh(initial);
      return { ok: true, data: payload.data as Link };
    },
    [getAuthHeaders, refresh, initial]
  );

  const deleteLink = useCallback(
    async (id: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        headers,
      });
      const payload = await res.json();
      if (!res.ok) return { ok: false, message: payload.message as string };
      await refresh(initial);
      return { ok: true, data: payload.data };
    },
    [getAuthHeaders, refresh, initial]
  );

  return { ...state, refresh, createLink, updateLink, deleteLink };
}
