"use client";
import Brand from "@/components/brand";
import ThemeToggle from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { email, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: "Links",
      href: "/links",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const userMenuItems = [
    {
      name: "Profile",
      href: "/settings/profile",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: "Billing",
      href: "/settings/billing",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      {/* Ambient top gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex-shrink-0">
              <Brand responsive className="flex items-center" priority />
            </Link>

            {/* Desktop nav - clean gradient active states */}
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 text-foreground shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "transition-all",
                        isActive
                          ? "text-primary drop-shadow-sm"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Create Link CTA - desktop only */}
            <Link
              href="/links/new"
              className="group relative hidden overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 md:inline-flex md:items-center md:gap-2"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <svg className="relative h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative">Create Link</span>
            </Link>

            {/* User menu - desktop */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="group inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-card hover:shadow-md"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-bold text-primary ring-1 ring-primary/30">
                  {email?.[0]?.toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-muted-foreground group-hover:text-foreground">
                  {email}
                </span>
                <svg
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-all group-hover:text-foreground",
                    userMenuOpen && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/10">
                    {/* Header */}
                    <div className="border-b border-border bg-gradient-to-br from-muted/50 to-transparent px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-bold text-primary ring-2 ring-primary/30">
                          {email?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            Signed in as
                          </div>
                          <div className="truncate text-sm font-semibold text-foreground">
                            {email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      {userMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all",
                              isActive
                                ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <span
                              className={cn(
                                isActive ? "text-primary" : "text-muted-foreground"
                              )}
                            >
                              {item.icon}
                            </span>
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border py-2">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                          router.push("/");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-all hover:shadow-md active:scale-95 md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: mobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="animate-in slide-in-from-top-2 border-t border-border py-4 md:hidden">
            <div className="space-y-1">
              {/* Main nav */}
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-br from-primary/10 to-accent/10 text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}

              {/* Create Link CTA */}
              <Link
                href="/links/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-primary to-primary/90 px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Link
              </Link>
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-border" />

            {/* User section */}
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-bold text-primary ring-1 ring-primary/30">
                {email?.[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium text-foreground">
                  {email}
                </div>
              </div>
            </div>

            {/* Settings nav */}
            <div className="space-y-1">
              {userMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}

              {/* Sign out */}
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  router.push("/");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
