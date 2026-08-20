"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeOff, Loader2, X } from "lucide-react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";

import { ApiError } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { api } from "@/lib/api/client";

/**
 * Password rules are shown as you type rather than thrown at you on submit.
 * Django will re-validate all of this — the client copy exists to make the
 * requirement legible, not to enforce it.
 */
const RULES = [
  { id: "length", label: "At least 12 characters", test: (v: string) => v.length >= 12 },
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "digit", label: "One number", test: (v: string) => /\d/.test(v) },
  {
    id: "symbol",
    label: "One symbol",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const passed = RULES.filter((rule) => rule.test(password)).length;
  const strong = passed === RULES.length;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!strong) {
      setError("Please choose a password that meets every requirement.");
      return;
    }

    if (!accepted) {
      setError("You need to accept the terms to create an account.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setPending(true);

    try {
      await api.post(endpoints.auth.register, {
        first_name: String(form.get("first_name") ?? "").trim(),
        last_name: String(form.get("last_name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim().toLowerCase(),
        phone: String(form.get("phone") ?? "").trim(),
        business_name: String(form.get("business_name") ?? "").trim(),
        password,
      });

      const email = String(form.get("email") ?? "").trim().toLowerCase();
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setError(err.detail);
      } else {
        setError("Could not reach the server. Check your connection.");
      }
    } finally {
      setPending(false);
    }
  }

  const fieldError = (name: string) => fieldErrors[name]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" required disabled={pending} />
          {fieldError("first_name") ? (
            <p className="text-xs text-destructive">{fieldError("first_name")}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" required disabled={pending} />
          {fieldError("last_name") ? (
            <p className="text-xs text-destructive">{fieldError("last_name")}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_name">Business name</Label>
        <Input
          id="business_name"
          name="business_name"
          required
          placeholder="Sokoni Commerce Ltd"
          disabled={pending}
        />
        {fieldError("business_name") ? (
          <p className="text-xs text-destructive">{fieldError("business_name")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@company.com"
          disabled={pending}
        />
        {fieldError("email") ? (
          <p className="text-xs text-destructive">{fieldError("email")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+255 712 345 678"
          disabled={pending}
        />
        {fieldError("phone") ? (
          <p className="text-xs text-destructive">{fieldError("phone")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* strength meter */}
        <div className="flex gap-1" aria-hidden>
          {RULES.map((rule, i) => (
            <span
              key={rule.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < passed
                  ? passed === RULES.length
                    ? "bg-emerald-500"
                    : passed >= 3
                      ? "bg-amber-500"
                      : "bg-destructive"
                  : "bg-muted",
              )}
            />
          ))}
        </div>

        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {RULES.map((rule) => {
            const ok = rule.test(password);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                )}
              >
                {ok ? <Check className="size-3" /> : <X className="size-3" />}
                {rule.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-start gap-2.5">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
          disabled={pending}
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
          I agree to the Terms of Service and Privacy Policy, and confirm I am
          authorised to act for this business.
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Create account
      </Button>
    </form>
  );
}
