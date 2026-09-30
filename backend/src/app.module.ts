import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { validate } from "./config/env.validation";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      // `.env.local` first, mirroring the frontend's convention; `.env` is the
      // fallback. Both are gitignored, `.env.example` is not.
      // prisma7.config.ts loads the same files in the same order.
      envFilePath: [".env.local", ".env"],
    }),
    // Per-IP, in memory — fine for one process. Behind a load balancer this
    // needs a shared store and Express `trust proxy`, or every client counts as
    // the proxy's IP. Routes tighten it with `@Throttle` (see AuthController).
    ThrottlerModule.forRoot({
      throttlers: [{ name: "default", ttl: 60_000, limit: 120 }],
      errorMessage: "Too many attempts. Wait a minute and try again.",
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
