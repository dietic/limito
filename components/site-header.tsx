"use client";
import Brand from "@/components/brand";
import { CommandMenu, type CommandAction } from "@/components/command-menu";
import ThemeToggle from "@/components/theme-toggle";
import Dialog, { DialogActions } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function SiteHeader() {
  const { email, userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [path, setPath] = useState<string>("/");

  // Read path safely in CSR to avoid Next 15 prerender constraints
  useEffect(() => {
    try {
      setPath(window.location.pathname);
    } catch {}
  }, []);

  const isActive = (href: string) => {
    if (!path) return false;
    if (href === "/") return path === "/";
    return path.startsWith(href);
  };

  const navItems = useMemo(() => {
    if (userId) {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Links", href: "/links" },
        { label: "Pricing", href: "/pricing" },
      ];
    }
    return [
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "#faq" },
    ];
  }, [userId]);

  const supabase = useMemo(() => createBrowserClient(), []);

  const actions: CommandAction[] = useMemo(() => {
    const base: CommandAction[] = [
      {
        id: "pricing",
        label: "Pricing",
        href: "/pricing",
        description: "Plans & features",
        shortcut: "G P",
      },
    ];
    if (userId) {
      base.unshift(
        {
          id: "new",
          label: "Create New Link",
          href: "/links/new",
          description: "Open the link creator",
          shortcut: "N",
        },
        {
          id: "links",
          label: "Links",
          href: "/links",
          description: "Manage your links",
          shortcut: "G L",
        },
        {
          id: "dash",
          label: "Dashboard",
          href: "/dashboard",
          description: "Overview & stats",
          shortcut: "G D",
        },
        {
          id: "billing",
          label: "Billing",
          href: "/settings/billing",
          description: "Manage subscription",
          shortcut: "G B",
        },
        {
          id: "profile",
          label: "Profile Settings",
          href: "/settings/profile",
          description: "Account & security",
          shortcut: "G S",
        }
      );
      base.push({
        id: "signout",
        label: "Sign out",
        onSelect: async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        },
      });
    } else {
      base.unshift({
        id: "login",
        label: "Sign in",
        href: "/login",
        shortcut: "G L",
      });
      base.push({ id: "get-started", label: "Get Started", href: "/login" });
    }
    return base;
  }, [supabase, userId]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href={userId ? "/dashboard" : "/"} className="flex-shrink-0">
            <Brand responsive className="flex items-center" priority />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-2 -bottom-1 block h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Command trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-muted md:flex"
              aria-label="Open command menu"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <span>Search</span>
              <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            {userId ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                  aria-label="Open user menu"
                >
                  <span className="text-sm font-semibold text-primary-foreground">
                    {email?.[0]?.toUpperCase() || "U"}
                  </span>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                      <div className="border-b border-border bg-muted/30 p-4">
                        <div className="text-sm font-medium text-foreground">
                          {email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Signed in
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/settings/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        >
                          <svg
                            className="h-4 w-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Profile
                        </Link>
                        <Link
                          href="/settings/billing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        >
                          <svg
                            className="h-4 w-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          Billing
                        </Link>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/login";
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md md:inline-flex"
              >
                Get Started
              </a>
            )}

            {/* Mobile actions */}
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <Brand responsive className="flex items-center" />
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Close menu"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {userId ? (
            <div className="space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Dashboard
              </Link>
              <Link
                href="/links"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Links
              </Link>
              <Link
                href="/settings/billing"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Billing
              </Link>
              <Link
                href="/settings/profile"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Profile
              </Link>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Pricing
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="block w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Pricing
              </Link>
              <a
                href="#faq"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                FAQ
              </a>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          )}
          <DialogActions className="justify-stretch pt-2">
            {userId ? (
              <Link
                href="/links/new"
                onClick={() => setOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Create New Link
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Get Started
              </Link>
            )}
          </DialogActions>
        </div>
      </Dialog>

      {/* Command menu */}
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} actions={actions} />
    </nav>
  );
}
