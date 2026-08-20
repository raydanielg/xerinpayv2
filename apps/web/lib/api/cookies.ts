export const CSRF_COOKIE_NAME = "xp_csrf";
export const SCOPE_COOKIE_NAME = "xp_scope";

/** Reads a non-httpOnly cookie in the browser. Returns null on the server. */
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
