import { CSRF_COOKIE_NAME, readCookie } from "@/lib/api/cookies";

/**
 * Browser-side API client.
 *
 * Every request goes to our own /api/proxy route, which attaches the access
 * token server-side. This module therefore never touches a credential — the
 * only thing it carries is the double-submit CSRF token.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly data: unknown,
    message?: string,
  ) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
  }

  /** Field-level errors as returned by DRF serializers. */
  get fieldErrors(): Record<string, string[]> {
    if (!this.data || typeof this.data !== "object") return {};
    const out: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(this.data as Record<string, unknown>)) {
      if (key === "detail" || key === "non_field_errors") continue;
      if (Array.isArray(value)) out[key] = value.map(String);
      else if (typeof value === "string") out[key] = [value];
    }
    return out;
  }

  get detail(): string {
    if (typeof this.data === "string" && this.data) return this.data;
    if (this.data && typeof this.data === "object") {
      const d = this.data as Record<string, unknown>;
      if (typeof d.detail === "string") return d.detail;
      if (Array.isArray(d.non_field_errors) && d.non_field_errors.length) {
        return String(d.non_field_errors[0]);
      }
    }
    return this.status === 403
      ? "You do not have permission to perform this action."
      : "Something went wrong. Please try again.";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  /** Sent as Idempotency-Key. Generated automatically for POSTs when omitted. */
  idempotencyKey?: string;
  /** Retry idempotent requests on network/5xx failures. Default 2. */
  retries?: number;
  signal?: AbortSignal;
}

const PROXY_PREFIX = "/api/proxy";
const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = `${PROXY_PREFIX}${clean}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    query,
    body,
    idempotencyKey,
    retries = 2,
    headers,
    method = "GET",
    ...rest
  } = options;

  const url = buildUrl(path, query);
  const isUnsafe = UNSAFE.has(method.toUpperCase());
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(isFormData ? {} : body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  if (isUnsafe) {
    const csrf = readCookie(CSRF_COOKIE_NAME);
    if (csrf) finalHeaders["x-xp-csrf"] = csrf;
  }

  // Idempotency keys make a retried "create payment" safe: the backend returns
  // the original result instead of charging a customer twice.
  if (method.toUpperCase() === "POST") {
    finalHeaders["Idempotency-Key"] =
      idempotencyKey ?? globalThis.crypto?.randomUUID?.() ?? String(Date.now());
  }

  const init: RequestInit = {
    ...rest,
    method,
    headers: finalHeaders,
    credentials: "same-origin",
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  };

  // Only retry requests that are safe to repeat.
  const retryable = !isUnsafe || Boolean(finalHeaders["Idempotency-Key"]);
  const maxAttempts = retryable ? retries + 1 : 1;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);

      if (res.status === 401) {
        // The proxy already tried to refresh; a 401 here means the session is
        // truly gone.
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          const next = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          window.location.assign(`/login?next=${next}`);
        }
        throw new ApiError(401, await safeJson(res), "Session expired.");
      }

      if (res.status >= 500 && attempt < maxAttempts - 1) {
        await sleep(2 ** attempt * 300);
        continue;
      }

      if (!res.ok) throw new ApiError(res.status, await safeJson(res));

      if (res.status === 204) return undefined as T;
      return (await safeJson(res)) as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError) throw error;
      if (attempt < maxAttempts - 1) {
        await sleep(2 ** attempt * 300);
        continue;
      }
    }
  }

  throw new ApiError(0, lastError, "Network request failed.");
}

async function safeJson(res: Response): Promise<unknown> {
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return res.json().catch(() => null);
  return res.text().catch(() => null);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
