"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive" | "success" | "info";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number; // default 2000
};

type ToastItem = Required<ToastOptions> & { id: string; createdAt: number };

type ToastContextValue = {
  toast: (opts: ToastOptions) => string;
  remove: (id: string) => void;
  toasts: ToastItem[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback((opts: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ToastItem = {
      id,
      title: opts.title ?? "",
      description: opts.description ?? "",
      variant: opts.variant ?? "default",
      durationMs: opts.durationMs ?? 2000,
      createdAt: Date.now(),
    };
    setToasts((prev) => [...prev, item]);
    const tm = setTimeout(() => remove(id), item.durationMs);
    timers.current.set(id, tm);
    return id;
  }, [remove]);

  useEffect(() => () => {
    // cleanup on unmount
    timers.current.forEach((tm) => clearTimeout(tm));
    timers.current.clear();
  }, []);

  const value = useMemo(() => ({ toast, remove, toasts }), [toast, remove, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function Toaster() {
  const { toasts, remove } = useToast();
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:top-6 sm:right-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-xl border p-3 shadow-lg transition-all",
            "bg-card text-card-foreground border-border",
            t.variant === "destructive" && "border-destructive/40 bg-destructive/10 text-destructive",
            t.variant === "success" && "border-success/40 bg-success/10 text-success",
            t.variant === "info" && "border-info/40 bg-info/10 text-info"
          )}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {t.title && <div className="font-semibold leading-snug">{t.title}</div>}
              {t.description && (
                <div className="mt-0.5 text-sm text-muted-foreground">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="rounded-md border border-transparent px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
