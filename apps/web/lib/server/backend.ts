import "server-only";

import { endpoints } from "@/lib/api/endpoints";
import {
  getAccessToken,
  getRefreshToken,
  setSessionCookies,
} from "@/lib/server/session";

export const API_BASE_URL = (
  process.env.API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

/** Requests that never complete are worse than requests that fail loudly. */
const DEFAULT_TIMEOUT_MS = 20_000;

export interface BackendResponse {
  status: number;
  body: unknown;
  headers: Headers;
}

export class BackendError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`Backend responded ${status}`);
    this.name = "BackendError";
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const type = res.headers.get("content-type") ?? "";
  if (res.status === 204) return null;
  if (type.includes("application/json")) {
    return res.json().catch(() => null);
  }
  return res.text().catch(() => null);
}

/**
 * Raw call to Django. Does not attach credentials — used for login/refresh and
 * by `callBackend` below once it has resolved a token.
 */
export async function rawBackendFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<BackendResponse> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(rest.headers as Record<string, string> | undefined),
      },
    });

    return { status: res.status, body: await parseBody(res), headers: res.headers };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Exchange the refresh token for a new access token.
 *
 * Returns the new access token, or null when the refresh token is dead — in
 * which case the caller should surface a 401 so the client can re-authenticate.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  const res = await rawBackendFetch(endpoints.auth.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (res.status >= 400) return null;

  const body = res.body as { access?: string; refresh?: string } | null;
  if (!body?.access) return null;

  await setSessionCookies({ access: body.access, refresh: body.refresh ?? refresh });
  return body.access;
}

/**
 * Authenticated call to Django with one transparent refresh-and-retry on 401.
 *
 * `retryOn401` guards against an infinite loop when the backend keeps rejecting
 * a freshly minted token.
 */
export async function callBackend(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
  { retryOn401 = true }: { retryOn401?: boolean } = {},
): Promise<BackendResponse> {
  const token = await getAccessToken();

  const withAuth = (bearer: string | null): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
  });

  let res = await rawBackendFetch(path, withAuth(token));

  if (res.status === 401 && retryOn401) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      res = await rawBackendFetch(path, withAuth(fresh));
    }
  }

  return res;
}

/** Convenience wrapper for server components that want typed data or a throw. */
export async function backendJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await callBackend(path, init);
  if (res.status >= 400) throw new BackendError(res.status, res.body);
  return res.body as T;
}
