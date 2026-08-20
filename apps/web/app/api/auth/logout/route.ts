import { NextResponse } from "next/server";

import { endpoints } from "@/lib/api/endpoints";
import { callBackend } from "@/lib/server/backend";
import { clearSessionCookies, getRefreshToken } from "@/lib/server/session";

/**
 * Logout.
 *
 * Blacklists the refresh token upstream when possible, then clears cookies
 * regardless — a failed upstream call must never leave the browser logged in.
 */
export async function POST() {
  const refresh = await getRefreshToken();

  if (refresh) {
    await callBackend(endpoints.auth.logout, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => null);
  }

  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
