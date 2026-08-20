import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware: route guards + security headers.
 *
 * The guard here is a fast redirect based on cookie presence — it keeps signed
 * out users off dashboard URLs and avoids a flash of empty shell. It is NOT the
 * authorisation boundary: a forged cookie gets you a redirect-free page whose
 * every API call still fails at Django. Authorisation lives in the backend.
 */

const ACCESS_COOKIE = "xp_at";
const REFRESH_COOKIE = "xp_rt";
const SCOPE_COOKIE = "xp_scope";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/pay",
];

const MERCHANT_PREFIX = "/dashboard";
const ADMIN_PREFIX = "/admin";

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function securityHeaders(res: NextResponse, nonce: string) {
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    "default-src 'self'",
    // Next injects inline bootstrap scripts; the nonce lets us avoid
    // 'unsafe-inline' in production. Dev needs eval for fast refresh.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // Only our own origin — the API is reached through /api/proxy.
    `connect-src 'self'${isDev ? " ws: http://127.0.0.1:8000" : ""}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (!isDev) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return res;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const pass = () =>
    securityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      nonce,
    );

  // API routes handle their own auth; skip the redirect logic.
  if (pathname.startsWith("/api/")) return pass();

  const hasSession = Boolean(
    req.cookies.get(ACCESS_COOKIE)?.value ?? req.cookies.get(REFRESH_COOKIE)?.value,
  );
  const scope = req.cookies.get(SCOPE_COOKIE)?.value;

  const isProtected =
    pathname.startsWith(MERCHANT_PREFIX) || pathname.startsWith(ADMIN_PREFIX);

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return securityHeaders(NextResponse.redirect(url), nonce);
  }

  // Send each audience to its own portal rather than showing an empty shell.
  if (hasSession && scope === "staff" && pathname.startsWith(MERCHANT_PREFIX)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return securityHeaders(NextResponse.redirect(url), nonce);
  }

  if (hasSession && scope === "merchant" && pathname.startsWith(ADMIN_PREFIX)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return securityHeaders(NextResponse.redirect(url), nonce);
  }

  // Already signed in and staring at the login page — move them along.
  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = scope === "staff" ? "/admin" : "/dashboard";
    url.search = "";
    return securityHeaders(NextResponse.redirect(url), nonce);
  }

  if (isPublic(pathname)) return pass();

  return pass();
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
