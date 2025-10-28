import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Access your Limi.to dashboard to manage expiring links, analytics, and subscriptions.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Sign in to Limi.to",
    description:
      "Log in to create, manage, and analyze expiring links for your campaigns.",
    url: "/login",
  },
  twitter: {
    card: "summary",
    title: "Sign in to Limi.to",
    description:
      "Log in to create, manage, and analyze expiring links for your campaigns.",
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
