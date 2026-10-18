import {
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import type { Role } from "../generated/prisma/client";
import { SessionGuard, type AuthenticatedRequest } from "./session.guard";
import { SessionsService } from "./sessions.service";

export const STAFF_ROLES: readonly Role[] = ["STAFF", "ADMIN"];

/**
 * `SessionGuard` plus a role check: every `/admin` route sits behind this.
 * A signed-out request is 401, a signed-in customer 403.
 */
@Injectable()
export class AdminGuard extends SessionGuard {
  constructor(sessions: SessionsService) {
    super(sessions);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!STAFF_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        "You don't have access to the admin console.",
      );
    }
    return true;
  }
}
