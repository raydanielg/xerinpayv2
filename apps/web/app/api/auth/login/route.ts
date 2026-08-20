import { NextRequest, NextResponse } from "next/server";

import { endpoints } from "@/lib/api/endpoints";
import { rawBackendFetch } from "@/lib/server/backend";
import { ensureCsrfToken, setSessionCookies } from "@/lib/server/session";

/**
 * Login.
 *
 * Credentials go straight through to Django; only the resulting tokens are kept
 * here, in httpOnly cookies. If the backend answers with an MFA challenge we
 * pass that back untouched and set no session — the client then posts to
 * /api/auth/mfa with the challenge token.
 */

interface LoginBody {
  access?: string;
  refresh?: string;
  mfa_required?: boolean;
  mfa_token?: string;
  user?: { scope?: "merchant" | "staff" };
  detail?: string;
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  const res = await rawBackendFetch(endpoints.auth.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Pass the client IP through so Django's throttling and audit log see the
      // real origin rather than the Next.js server.
      "X-Forwarded-For":
        req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
      "User-Agent": req.headers.get("user-agent") ?? "",
    },
    body: JSON.stringify(payload),
  });

  const body = res.body as LoginBody | null;

  if (res.status >= 400 || !body) {
    // Deliberately opaque: never reveal whether the email exists.
    return NextResponse.json(body ?? { detail: "Invalid credentials." }, {
      status: res.status || 401,
    });
  }

  if (body.mfa_required) {
    return NextResponse.json(
      { mfa_required: true, mfa_token: body.mfa_token },
      { status: 200 },
    );
  }

  if (!body.access) {
    return NextResponse.json(
      { detail: "Authentication service returned an unexpected response." },
      { status: 502 },
    );
  }

  await setSessionCookies({
    access: body.access,
    refresh: body.refresh,
    scope: body.user?.scope ?? "merchant",
  });
  await ensureCsrfToken();

  return NextResponse.json({ ok: true, scope: body.user?.scope ?? "merchant" });
}

export const dynamic = "force-dynamic";
