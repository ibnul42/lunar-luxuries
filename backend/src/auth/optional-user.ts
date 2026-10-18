import type { Request } from "express";

import type { PublicUser } from "./public-user";
import { readSessionToken } from "./session-cookie";
import type { SessionsService } from "./sessions.service";

/**
 * The signed-in user if there is one, else null — for routes that serve guests
 * and members alike (the cart). Routes that need a user use `SessionGuard`.
 */
export async function optionalUser(
  req: Request,
  sessions: SessionsService,
): Promise<PublicUser | null> {
  const token = readSessionToken(req);
  return token ? sessions.findUser(token) : null;
}
