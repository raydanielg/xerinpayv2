import { NextRequest, NextResponse } from "next/server";

import { endpoints } from "@/lib/api/endpoints";
import { rawBackendFetch } from "@/lib/server/backend";
import { ensureCsrfToken, setSessionCookies } from "@/lib/server/session";

/** Second factor: exchanges an MFA challenge token + OTP for a real session. */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  const res = await rawBackendFetch(endpoints.auth.mfaVerify, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For":
        req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
    },
    body: JSON.stringify(payload),
  });

  const body = res.body as
    | { access?: string; refresh?: string; user?: { scope?: "merchant" | "staff" } }
    | null;

  if (res.status >= 400 || !body?.access) {
    return NextResponse.json(body ?? { detail: "Invalid code." }, {
      status: res.status || 401,
    });
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
