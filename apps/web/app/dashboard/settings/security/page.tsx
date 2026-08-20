"use client";

import * as React from "react";
import {
  Fingerprint,
  Laptop,
  Loader2,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { PageHeader } from "@/components/shared/page-header";
import { ApiError, api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/auth/session-provider";
import { formatDate, formatRelative } from "@/lib/format";
import type { AuthSession } from "@/lib/api/types";

/**
 * Account security.
 *
 * Two things live here that matter more than anything else on the account:
 * turning on a second factor, and being able to see — and kill — every session
 * that is currently signed in.
 */
export default function SecuritySettingsPage() {
  const { user, refresh } = useSession();
  const queryClient = useQueryClient();

  const sessions = useQuery<{ results: AuthSession[] }, ApiError>({
    queryKey: ["auth-sessions"],
    queryFn: () => api.get(endpoints.auth.sessions),
  });

  /* ------------------------------------------------------------- password */
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [changing, setChanging] = React.useState(false);

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (next !== confirm) {
      toast.error("The two new passwords don't match.");
      return;
    }
    setChanging(true);
    try {
      await api.post(endpoints.auth.changePassword, {
        current_password: current,
        new_password: next,
      });
      toast.success("Password changed. Other sessions have been signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
      void queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.detail : "Could not change password.");
    } finally {
      setChanging(false);
    }
  }

  /* ------------------------------------------------------------------ mfa */
  const [enrolling, setEnrolling] = React.useState(false);

  async function startEnrollment() {
    setEnrolling(true);
    try {
      await api.post(endpoints.auth.mfaEnroll);
      toast.success("Check your authenticator app to finish setup.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.detail : "Could not start enrolment.");
    } finally {
      setEnrolling(false);
    }
  }

  async function revokeSession(id: string) {
    try {
      await api.delete(endpoints.auth.session(id));
      toast.success("Session signed out");
      void queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.detail : "Could not revoke session.");
    }
  }

  return (
    <>
      <PageHeader
        title="Security"
        description="Your password, second factor, and the devices signed in to this account."
      />

      {!user?.mfa_enabled ? (
        <Alert>
          <ShieldAlert className="size-4" />
          <AlertTitle>Two-factor authentication is off</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>
              A password alone is one leak away from someone else holding your
              money. Turn on a second factor.
            </span>
            <Button size="sm" onClick={startEnrollment} disabled={enrolling}>
              {enrolling ? <Loader2 className="size-4 animate-spin" /> : null}
              Set up now
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Second factor */}
        <Card className="gap-0 p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <Fingerprint className="size-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold tracking-tight">
                Two-factor authentication
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A code from your authenticator app, required on every sign-in from
                a new device.
              </p>
            </div>
            {user?.mfa_enabled ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                On
              </Badge>
            ) : (
              <Badge variant="outline">Off</Badge>
            )}
          </div>

          <div className="mt-5 flex gap-2 border-t border-border/60 pt-5">
            {user?.mfa_enabled ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/proxy${endpoints.auth.mfaRecoveryCodes}`} download>
                    Recovery codes
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    try {
                      await api.post(endpoints.auth.mfaDisable);
                      toast.success("Two-factor turned off");
                      await refresh();
                    } catch (error) {
                      toast.error(
                        error instanceof ApiError ? error.detail : "Could not disable.",
                      );
                    }
                  }}
                >
                  Turn off
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={startEnrollment} disabled={enrolling}>
                <ShieldCheck className="size-4" />
                Turn on
              </Button>
            )}
          </div>
        </Card>

        {/* Password */}
        <Card className="gap-0 p-5">
          <h2 className="text-base font-semibold tracking-tight">Change password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Changing your password signs out every other device.
          </p>

          <form onSubmit={changePassword} className="mt-5 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={changing}>
              {changing ? <Loader2 className="size-4 animate-spin" /> : null}
              Change password
            </Button>
          </form>
        </Card>
      </div>

      {/* Sessions */}
      <Card className="gap-0 p-5">
        <h2 className="text-base font-semibold tracking-tight">Active sessions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anything here can act as you. If you don&apos;t recognise a device, sign
          it out and change your password.
        </p>

        <div className="mt-5">
          {sessions.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {sessions.data?.results.map((session) => (
                <li key={session.id} className="flex items-center gap-4 py-3.5">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {/Mobile|Android|iPhone/i.test(session.user_agent) ? (
                      <Smartphone className="size-4 text-muted-foreground" />
                    ) : (
                      <Laptop className="size-4 text-muted-foreground" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium">
                      {session.device ?? session.user_agent ?? "Unknown device"}
                      {session.is_current ? (
                        <Badge variant="secondary" className="shrink-0">
                          This device
                        </Badge>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.ip_address}
                      {session.location ? ` · ${session.location}` : ""} · last seen{" "}
                      {formatRelative(session.last_seen_at)}
                    </p>
                  </div>

                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {formatDate(session.created_at)}
                  </span>

                  {!session.is_current ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => revokeSession(session.id)}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </>
  );
}
