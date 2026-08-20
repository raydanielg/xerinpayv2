"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { User } from "@/lib/api/types";

interface SessionPayload {
  user: User | null;
  csrfToken?: string;
}

interface SessionContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True when the account is XerinPay internal staff rather than a merchant. */
  isStaff: boolean;
  permissions: Set<string>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

async function fetchSession(): Promise<SessionPayload> {
  const res = await fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (res.status === 401) return { user: null };
  if (!res.ok) throw new Error("Could not load session");
  return res.json();
}

export function SessionProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    initialData: initialUser ? { user: initialUser } : undefined,
    staleTime: 60_000,
    // Re-checking on focus means a session revoked from another device stops
    // working here as soon as the tab is looked at again.
    refetchOnWindowFocus: true,
    retry: false,
  });

  const user = data?.user ?? null;

  const permissions = React.useMemo(() => {
    if (!user) return new Set<string>();
    // A superuser implicitly holds everything; the backend enforces the same.
    const list = user.is_superuser
      ? ["*"]
      : [...(user.permissions ?? []), ...user.roles.flatMap((r) => r.permissions ?? [])];
    return new Set(list);
  }, [user]);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => null);
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  const refresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = React.useMemo<SessionContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isStaff: user?.scope === "staff",
      permissions,
      refresh,
      logout,
    }),
    [user, isLoading, permissions, refresh, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return ctx;
}
