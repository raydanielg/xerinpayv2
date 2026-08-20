import { NextResponse } from "next/server";

import { endpoints } from "@/lib/api/endpoints";
import type { User } from "@/lib/api/types";
import { callBackend } from "@/lib/server/backend";
import { clearSessionCookies, ensureCsrfToken } from "@/lib/server/session";

/**
 * Returns the signed-in user plus a CSRF token for subsequent writes.
 * A 401 here is the client's cue to redirect to /login.
 */
export async function GET() {
  const res = await callBackend(endpoints.auth.me);

  if (res.status === 401 || res.status === 403) {
    await clearSessionCookies();
    return NextResponse.json({ user: null }, { status: 401 });
  }

  if (res.status >= 400) {
    return NextResponse.json(
      { user: null, detail: "Could not load session." },
      { status: res.status },
    );
  }

  const csrfToken = await ensureCsrfToken();

  return NextResponse.json(
    { user: res.body as User, csrfToken },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const dynamic = "force-dynamic";
