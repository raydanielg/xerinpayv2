import { NextRequest, NextResponse } from "next/server";

import { callBackend } from "@/lib/server/backend";
import { CSRF_COOKIE } from "@/lib/server/session";

/**
 * Server-side API proxy.
 *
 * The browser calls /api/proxy/<django-path>; this handler attaches the access
 * token from the httpOnly cookie and forwards the request. Consequences:
 *
 *   • No token ever reaches client-side JavaScript.
 *   • The Django origin is never exposed to the browser, so no CORS surface.
 *   • Every write is CSRF-checked in one place.
 */

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Headers we refuse to forward upstream. */
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "cookie",
  "authorization",
  "x-xp-csrf",
]);

/** Headers we refuse to pass back to the browser. */
const STRIPPED_RESPONSE_HEADERS = new Set([
  "set-cookie",
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

function forwardableHeaders(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) out[key] = value;
  });
  return out;
}

function csrfOk(req: NextRequest): boolean {
  if (!UNSAFE.has(req.method)) return true;
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  const header = req.headers.get("x-xp-csrf");
  return Boolean(cookie && header && cookie === header);
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;

  if (!csrfOk(req)) {
    return NextResponse.json(
      { detail: "CSRF verification failed." },
      { status: 403 },
    );
  }

  const search = req.nextUrl.search;
  // Django's APPEND_SLASH expects a trailing slash on collection routes.
  const target = `/${path.join("/")}${path.length ? "/" : ""}`.replace(
    /\/{2,}/g,
    "/",
  );

  const hasBody = UNSAFE.has(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const res = await callBackend(`${target}${search}`, {
    method: req.method,
    headers: forwardableHeaders(req),
    body: body && body.byteLength > 0 ? body : undefined,
  });

  const headers = new Headers();
  res.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("Cache-Control", "no-store");

  if (res.body === null) {
    return new NextResponse(null, { status: res.status, headers });
  }

  if (typeof res.body === "string") {
    return new NextResponse(res.body, { status: res.status, headers });
  }

  return NextResponse.json(res.body, { status: res.status, headers });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;

export const dynamic = "force-dynamic";
