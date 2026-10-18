import { createHash, randomBytes } from "node:crypto";

import type { Request, Response } from "express";

export const CART_COOKIE = "ll_cart";
export const CART_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

/** Same scheme as sessions: the cookie holds the token, the table its hash. */
export function hashCartToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newCartToken(): string {
  return randomBytes(32).toString("base64url");
}

export function readCartToken(req: Request): string | undefined {
  const value: unknown = req.cookies?.[CART_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function setCartCookie(
  res: Response,
  token: string,
  isProduction: boolean,
): void {
  res.cookie(CART_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: CART_LIFETIME_MS,
  });
}

export function clearCartCookie(res: Response, isProduction: boolean): void {
  res.clearCookie(CART_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}
