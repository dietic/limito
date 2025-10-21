"use client";
import Brand from "@/components/brand";
import ThemeToggle from "@/components/theme-toggle";
import Dialog, { DialogActions } from "@/components/ui/dialog";
import { useState } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-2">
          <Brand responsive className="flex items-center" priority />

          {/* Desktop nav */}
          <div className="hidden items-center gap-4 sm:flex">
            <a
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign in
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              FAQ
            </a>
            <a
              href="/login"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent/90"
            >
              Get Started
            </a>
            <ThemeToggle />
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <Brand responsive className="flex items-center" />
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card"
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
          <a
            href="/login"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
          >
            Sign in
          </a>
          <a
            href="#pricing"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
          >
            FAQ
          </a>
          <DialogActions className="justify-between">
            <a
              href="/login"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90"
            >
              Get Started
            </a>
          </DialogActions>
        </div>
      </Dialog>
    </nav>
  );
}
