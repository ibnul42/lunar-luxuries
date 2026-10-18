import { Module } from "@nestjs/common";

import { SessionsService } from "../auth/sessions.service";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

/**
 * Exports `CartService` so the auth module can merge a guest cart on sign-in.
 * `SessionsService` is provided directly rather than by importing AuthModule,
 * which itself imports this module.
 */
@Module({
  controllers: [CartController],
  providers: [CartService, SessionsService],
  exports: [CartService],
})
export class CartModule {}
