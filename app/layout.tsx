import ThemeProvider from "@/components/theme-provider";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import "../styles/globals.css";

export const metadata = {
  metadataBase: new URL(process.env["APP_URL"] || "http://localhost:3000"),
  title: {
    default: "Limi.to — Expiring links, done right",
    template: "%s — Limi.to",
  },
  description:
    "Create links that automatically expire by date or clicks. Simple, fast, privacy-first.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
  },
  openGraph: {
    title: "Limi.to — Expiring links, done right",
    description:
      "Create links that automatically expire by date or clicks. Simple, fast, privacy-first.",
    url: "/",
    siteName: "Limi.to",
    images: [
      { url: "/og-image.svg", width: 1200, height: 630, alt: "Limi.to" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Limi.to — Expiring links, done right",
    description:
      "Create links that automatically expire by date or clicks. Simple, fast, privacy-first.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const k = 'theme';
    const stored = localStorage.getItem(k);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const t = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  } catch {}
})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <Toaster />
            {process.env["NEXT_RUNTIME"] !== "edge" && <Analytics />}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
