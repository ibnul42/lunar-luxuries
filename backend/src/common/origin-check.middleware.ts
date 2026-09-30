import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF backstop. CORS only stops another site *reading* a response — a plain
 * HTML form can still POST here and have it run. The session cookie's
 * SameSite=Lax covers requests that need a session, but not login itself,
 * where a forged form could sign a victim into an attacker's account.
 *
 * Browsers attach `Origin` to every POST, so rejecting a mismatched one closes
 * that. Requests with no `Origin` are not from a browser page (curl, server-
 * to-server) and cannot carry a victim's cookies, so they pass.
 */
export function originCheck(allowedOrigin: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    if (SAFE_METHODS.has(req.method) || !origin || origin === allowedOrigin) {
      next();
      return;
    }

    res.status(403).json({
      statusCode: 403,
      message: "Cross-origin request rejected.",
    });
  };
}
