import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AccountModule } from "./account/account.module";
import { AdminModule } from "./admin/admin.module";
import { AuditModule } from "./audit/audit.service";
import { AuthModule } from "./auth/auth.module";
import { CartModule } from "./cart/cart.module";
import { CatalogModule } from "./catalog/catalog.module";
import { validate } from "./config/env.validation";
import { ContactModule } from "./contact/contact.module";
import { HealthModule } from "./health/health.module";
import { NewsletterModule } from "./newsletter/newsletter.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SettingsModule } from "./settings/settings.module";
import { WishlistModule } from "./wishlist/wishlist.module";

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
    SettingsModule,
    AuditModule,
    HealthModule,
    AuthModule,
    ContactModule,
    NewsletterModule,
    CatalogModule,
    CartModule,
    WishlistModule,
    AccountModule,
    OrdersModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
