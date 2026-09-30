import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

import type { PublicUser } from "./public-user";
import { readSessionToken } from "./session-cookie";
import { SessionsService } from "./sessions.service";

export interface AuthenticatedRequest extends Request {
  user: PublicUser;
}

/**
 * Requires a live session and attaches its user to the request. Pair it with
 * `@CurrentUser()` — and scope every query by that user's id, never by an id
 * taken from the URL or body (README §8, row-level authorization).
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readSessionToken(request);
    const user = token ? await this.sessions.findUser(token) : null;

    if (!user) throw new UnauthorizedException("Sign in to continue.");

    request.user = user;
    return true;
  }
}
