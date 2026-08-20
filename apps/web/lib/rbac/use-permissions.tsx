"use client";

import * as React from "react";

import { useSession } from "@/lib/auth/session-provider";

/**
 * Permission gating.
 *
 * IMPORTANT: this is a usability layer, not a security boundary. Hiding a
 * button stops a colleague from clicking something they cannot do; it does not
 * stop anyone determined. Every one of these checks must also exist on the
 * Django view. Treat the frontend gate as a courtesy and the backend gate as
 * the law.
 */
export function usePermissions() {
  const { permissions, user } = useSession();

  return React.useMemo(() => {
    const has = (permission: string) =>
      permissions.has("*") || permissions.has(permission);

    const hasAny = (...list: string[]) => list.some(has);
    const hasAll = (...list: string[]) => list.every(has);

    /** True if the user holds any permission in a module, e.g. "refunds". */
    const canAccessModule = (module: string) => {
      if (permissions.has("*")) return true;
      for (const p of permissions) {
        if (p.startsWith(`${module}.`)) return true;
      }
      return false;
    };

    return { has, hasAny, hasAll, canAccessModule, permissions, user };
  }, [permissions, user]);
}

/**
 * Conditionally renders children when the user holds the permission(s).
 *
 * <Can I="refunds.approve"> … </Can>
 * <Can any={["refunds.approve", "refunds.reject"]}> … </Can>
 */
export function Can({
  I,
  any,
  all,
  fallback = null,
  children,
}: {
  I?: string;
  any?: string[];
  all?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { has, hasAny, hasAll } = usePermissions();

  let allowed = true;
  if (I) allowed = allowed && has(I);
  if (any?.length) allowed = allowed && hasAny(...any);
  if (all?.length) allowed = allowed && hasAll(...all);

  return <>{allowed ? children : fallback}</>;
}
