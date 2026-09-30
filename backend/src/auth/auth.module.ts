import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionGuard } from "./session.guard";
import { SessionsService } from "./sessions.service";

/**
 * Exports `SessionGuard` (and the `SessionsService` it depends on) so feature
 * modules can protect routes by importing this module.
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionsService, SessionGuard],
  exports: [SessionsService, SessionGuard],
})
export class AuthModule {}
