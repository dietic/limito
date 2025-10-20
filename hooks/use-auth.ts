"use client";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AuthState {
  loading: boolean;
  userId: string | null;
  email: string | null;
  error: string | null;
}

export function useAuth() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [state, setState] = useState<AuthState>({
    loading: true,
    userId: null,
    email: null,
    error: null,
  });

  function setAuthCookie(token: string | null, expiresAt?: number | null) {
    try {
      if (typeof document === "undefined") return;
      const name = "sb-localhost-auth-token";
      if (!token) {
        document.cookie = `${name}=; path=/; max-age=0`;
        return;
      }
      const maxAge =
        expiresAt && expiresAt > 0
          ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
          : 60 * 60;
      const secure = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `${name}=${encodeURIComponent(
        token
      )}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
    } catch {}
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const u = data.session?.user ?? null;
      const token = data.session?.access_token ?? null;
      const exp = data.session?.expires_at ?? null;
      setAuthCookie(token, exp);
      setState({
        loading: false,
        userId: u?.id ?? null,
        email: u?.email ?? null,
        error: null,
      });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      const token = session?.access_token ?? null;
      const exp = session?.expires_at ?? null;
      setAuthCookie(token ?? null, exp ?? null);
      setState((s) => ({
        ...s,
        userId: u?.id ?? null,
        email: u?.email ?? null,
      }));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    },
    [supabase]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, redirectTo?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    },
    [supabase]
  );

  const sendMagicLink = useCallback(
    async (email: string, redirectTo?: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthCookie(null);
  }, [supabase]);

  return {
    ...state,
    getAccessToken,
    signInWithPassword,
    signUpWithPassword,
    sendMagicLink,
    signOut,
  };
}
