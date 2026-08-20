import "server-only";

import { cookies } from "next/headers";

/**
 * Token storage strategy
 * ----------------------
 * Access and refresh tokens are kept in httpOnly, SameSite=Lax, Secure cookies
 * written by our own route handlers. They are never exposed to client-side
 * JavaScript, so an XSS bug cannot exfiltrate a session — the single most
 * common way payment dashboards get drained.
 */

export const ACCESS_COOKIE = "xp_at";
export const REFRESH_COOKIE = "xp_rt";
export const SCOPE_COOKIE = "xp_scope";
export const CSRF_COOKIE = "xp_csrf";

const isProd = process.env.NODE_ENV === "production";

const BASE = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
} as const;

/** Access tokens are short-lived; keep the cookie lifetime close to the JWT's. */
const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export type SessionScope = "merchant" | "staff";

export async function setSessionCookies({
  access,
  refresh,
  scope,
}: {
  access: string;
  refresh?: string | null;
  scope?: SessionScope | null;
}) {
  const jar = await cookies();

  jar.set(ACCESS_COOKIE, access, { ...BASE, maxAge: ACCESS_MAX_AGE });

  if (refresh) {
    jar.set(REFRESH_COOKIE, refresh, { ...BASE, maxAge: REFRESH_MAX_AGE });
  }

  if (scope) {
    // Readable by middleware for routing decisions. Not httpOnly-sensitive:
    // it carries no authority, only a hint about which shell to render.
    jar.set(SCOPE_COOKIE, scope, {
      ...BASE,
      httpOnly: false,
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export async function clearSessionCookies() {
  const jar = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SCOPE_COOKIE, CSRF_COOKIE]) {
    jar.set(name, "", { ...BASE, httpOnly: name !== SCOPE_COOKIE, maxAge: 0 });
  }
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

/**
 * Double-submit CSRF token.
 *
 * The proxy requires unsafe methods to carry an `x-xp-csrf` header matching the
 * `xp_csrf` cookie. Because a cross-site attacker can send the cookie but
 * cannot read it to build the header, forged writes are rejected.
 */
export async function ensureCsrfToken() {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID().replace(/-/g, "");
  jar.set(CSRF_COOKIE, token, {
    ...BASE,
    httpOnly: false,
    maxAge: REFRESH_MAX_AGE,
  });
  return token;
}
