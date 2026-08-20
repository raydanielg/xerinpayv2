"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Label } from "@workspace/ui/components/label";

/**
 * Two-stage sign in.
 *
 * Stage 1 posts credentials to /api/auth/login. If the backend answers
 * `mfa_required`, we hold the returned challenge token in component state only
 * — it is never persisted — and render the OTP step. No session cookie exists
 * until the second factor succeeds.
 */

type Stage = "credentials" | "mfa";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [stage, setStage] = React.useState<Stage>("credentials");
  const [mfaToken, setMfaToken] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const redirect = React.useCallback(
    (scope: string) => {
      const target = next ?? (scope === "staff" ? "/admin" : "/dashboard");
      // replace() so the back button does not return to the login screen.
      router.replace(target);
      router.refresh();
    },
    [next, router],
  );

  async function onCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: String(form.get("email") ?? "").trim().toLowerCase(),
          password: String(form.get("password") ?? ""),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Uniform message: revealing "no such account" lets anyone enumerate
        // your merchant list.
        setError(
          res.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : (data?.detail ?? "Incorrect email or password."),
        );
        return;
      }

      if (data?.mfa_required) {
        setMfaToken(data.mfa_token ?? null);
        setStage("mfa");
        return;
      }

      redirect(data?.scope ?? "merchant");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  const submitOtp = React.useCallback(
    async (code: string) => {
      setError(null);
      setPending(true);
      try {
        const res = await fetch("/api/auth/mfa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ mfa_token: mfaToken, code }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setOtp("");
          setError(data?.detail ?? "That code is not valid. Try again.");
          return;
        }

        toast.success("Signed in");
        redirect(data?.scope ?? "merchant");
      } catch {
        setError("Could not reach the server. Check your connection.");
      } finally {
        setPending(false);
      }
    },
    [mfaToken, redirect],
  );

  if (stage === "mfa") {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to finish signing
            in.
          </p>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (value.length === 6) void submitOtp(value);
            }}
            disabled={pending}
            autoFocus
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {pending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Verifying…
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setStage("credentials");
            setOtp("");
            setError(null);
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onCredentials} className="space-y-5" noValidate>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={pending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}
