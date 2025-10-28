"use client";
import Dialog, {
  DialogActions,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type CommandAction = {
  id: string;
  label: string;
  href?: string;
  description?: string;
  onSelect?: () => void;
  shortcut?: string;
};

export function CommandMenu({
  open,
  onOpenChange,
  actions,
  placeholder = "Search actions...",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.description ? a.description.toLowerCase().includes(q) : false)
    );
  }, [actions, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Quick actions</DialogTitle>
        <DialogDescription>
          Type to search or use shortcuts. Press Esc to close.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <Input
          autoFocus
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              No results
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {filtered.map((a) => (
                <li key={a.id} className="bg-card/50">
                  {a.href ? (
                    <Link
                      href={a.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                      )}
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {a.label}
                        </div>
                        {a.description && (
                          <div className="text-xs text-muted-foreground">
                            {a.description}
                          </div>
                        )}
                      </div>
                      {a.shortcut && (
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {a.shortcut}
                        </kbd>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        a.onSelect?.();
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
                      )}
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {a.label}
                        </div>
                        {a.description && (
                          <div className="text-xs text-muted-foreground">
                            {a.description}
                          </div>
                        )}
                      </div>
                      {a.shortcut && (
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {a.shortcut}
                        </kbd>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <DialogActions>
        <div className="flex-1 text-left text-xs text-muted-foreground">
          Tip: Press Ctrl/Cmd + K
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
}
