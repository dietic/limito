"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const {
    loading,
    userId,
    email,
    signInWithPassword,
    signUpWithPassword,
    sendMagicLink,
    signOut,
  } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              You&apos;re all set!
            </h1>
            <p className="mt-2 text-gray-600">{email}</p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => router.push(redirect)}
                className="btn-primary w-full py-3 text-base"
              >
                Continue to Dashboard
              </button>
              <Button
                variant="ghost"
                onClick={() => {
                  setMessage(null);
                  signOut();
                }}
                className="w-full"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      setMessage({
        type: "error",
        text: "Please enter email and password",
      });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const res = await signInWithPassword(form.email, form.password);
    setSubmitting(false);
    if (!res.ok) {
      setMessage({ type: "error", text: res.message || "Sign in failed" });
    } else {
      router.push(redirect);
    }
  };

  const handleSignUp = async () => {
    if (!form.email || !form.password) {
      setMessage({
        type: "error",
        text: "Please enter email and password",
      });
      return;
    }
    if (form.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const res = await signUpWithPassword(form.email, form.password);
    setSubmitting(false);
    if (res.ok) {
      setMessage({
        type: "success",
        text: "Check your email to confirm your account.",
      });
    } else {
      setMessage({ type: "error", text: res.message || "Sign up failed" });
    }
  };

  const handleMagicLink = async () => {
    if (!form.email) {
      setMessage({ type: "error", text: "Please enter your email" });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const res = await sendMagicLink(form.email);
    setSubmitting(false);
    if (res.ok) {
      setMessage({
        type: "success",
        text: "Magic link sent. Check your inbox.",
      });
    } else {
      setMessage({
        type: "error",
        text: res.message || "Could not send magic link",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-2xl font-bold text-white">Limi.to</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white">
              Links that know when to disappear
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Create expiring links with precision. Set time limits or click
              caps.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Time-based and click-based expiration",
              "Real-time analytics and tracking",
              "Custom fallback URLs",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-blue-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-blue-200">
          © 2025 Limi.to. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
              <span className="text-sm font-bold text-white">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Limi.to</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-600">
              Sign in to your account or create a new one
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {message && (
              <div
                className={`rounded-lg p-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === "success" ? (
                    <svg
                      className="h-5 w-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  disabled={loading || submitting}
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  disabled={loading || submitting}
                  className="mt-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                disabled={loading || submitting}
                onClick={handleSignIn}
                className="flex-1 py-3"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
              <Button
                variant="ghost"
                disabled={loading || submitting}
                onClick={handleSignUp}
                className="flex-1 border border-gray-300 py-3"
              >
                Sign up
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              disabled={loading || submitting}
              onClick={handleMagicLink}
              className="w-full border border-gray-300 py-3"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {submitting ? "Sending..." : "Email me a magic link"}
            </Button>

            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
