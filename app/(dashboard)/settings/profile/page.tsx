"use client";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ProfileSettingsPage() {
  const supabase = createBrowserClient();
  const { email } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function changePassword() {
    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast({
        title: "Could not update password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPassword("");
      toast({ title: "Password updated", variant: "success" });
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
      <div className="mt-6 space-y-6 rounded-lg border border-border bg-card p-6">
        <div>
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="text-lg font-medium text-foreground">
            {email ?? ""}
          </div>
        </div>
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-foreground"
          >
            New password
          </label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            placeholder="••••••••"
          />
          <button
            onClick={changePassword}
            disabled={submitting}
            className={cn(buttonVariants({ variant: "default" }), "mt-3")}
          >
            Change password
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          Subscription settings are in{" "}
          <a href="/settings/billing" className="text-primary hover:underline">
            Billing
          </a>
          .
        </div>
      </div>
    </main>
  );
}
