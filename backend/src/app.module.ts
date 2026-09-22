import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { validate } from "./config/env.validation";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      // `.env.local` first, mirroring the frontend's convention; `.env` is the
      // fallback. Both are gitignored, `.env.example` is not.
      envFilePath: [".env.local", ".env"],
    }),
    HealthModule,
  ],
})
export class AppModule {}
