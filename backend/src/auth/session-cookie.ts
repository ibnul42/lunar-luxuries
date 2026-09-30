import type { CookieOptions, Request, Response } from "express";

export const SESSION_COOKIE = "ll_session";

/** "Remember me" — and every fresh registration — keeps the browser signed in. */
export const REMEMBERED_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
/** Without it the cookie dies with the browser, and the server gives up after a day. */
export const BROWSER_SESSION_MS = 24 * 60 * 60 * 1000;

/**
 * - `httpOnly`: page scripts, and so any XSS, cannot read the token.
 * - `sameSite: "lax"`: other sites cannot make the browser send it on a POST.
 *   The storefront on :3000 and the API on :4000 are the same *site* (ports
 *   don't count), so this does not get in the way of our own requests.
 * - `secure` only in production, because local dev runs over plain http.
 */
function baseOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  };
}

export function setSessionCookie(
  res: Response,
  token: string,
  options: { persistent: boolean; isProduction: boolean },
): void {
  res.cookie(SESSION_COOKIE, token, {
    ...baseOptions(options.isProduction),
    // Omitting maxAge makes it a browser-session cookie.
    ...(options.persistent ? { maxAge: REMEMBERED_SESSION_MS } : {}),
  });
}

export function clearSessionCookie(res: Response, isProduction: boolean): void {
  // Browsers only drop a cookie when path/domain/flags match the ones it was set with.
  res.clearCookie(SESSION_COOKIE, baseOptions(isProduction));
}

export function readSessionToken(req: Request): string | undefined {
  // cookie-parser types `req.cookies` as `any`; narrow before trusting it.
  const value: unknown = req.cookies?.[SESSION_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
