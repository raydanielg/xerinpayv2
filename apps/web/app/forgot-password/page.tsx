"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

import { AuthShell } from "@/components/auth/auth-shell";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);

    try {
      await api.post(endpoints.auth.forgotPassword, {
        email: String(form.get("email") ?? "").trim().toLowerCase(),
      });
    } catch {
      // Intentionally swallowed. Showing "no such account" would let anyone
      // test which emails are registered.
    } finally {
      setPending(false);
      setSent(true);
    }
  }

  return (
    <AuthShell
      title={sent ? "Check your email" : "Reset your password"}
      subtitle={
        sent
          ? undefined
          : "Enter the email on your account and we'll send you a reset link."
      }
      footer={
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            <p className="text-sm text-muted-foreground">
              If that email belongs to a XerinPay account, a reset link is on its
              way. The link expires in 30 minutes and can be used once.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@company.com"
              disabled={pending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
