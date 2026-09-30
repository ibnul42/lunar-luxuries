import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { PublicUser } from "./public-user";
import type { AuthenticatedRequest } from "./session.guard";

/** The signed-in user. Only meaningful on a route behind `SessionGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PublicUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
