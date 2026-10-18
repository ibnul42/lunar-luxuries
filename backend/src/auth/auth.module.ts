import { Module } from "@nestjs/common";

import { CartModule } from "../cart/cart.module";
import { AdminGuard } from "./admin.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordResetService } from "./password-reset.service";
import { SessionGuard } from "./session.guard";
import { SessionsService } from "./sessions.service";

/**
 * Exports `SessionGuard` / `AdminGuard` (and the `SessionsService` they depend
 * on) so feature modules can protect routes by importing this module.
 */
@Module({
  imports: [CartModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionsService,
    SessionGuard,
    AdminGuard,
    PasswordResetService,
  ],
  exports: [AuthService, SessionsService, SessionGuard, AdminGuard],
})
export class AuthModule {}
