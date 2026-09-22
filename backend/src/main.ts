import "reflect-metadata";

import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import type { Env } from "./config/env.validation";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // The `true` type argument marks the config as validated, so `get()` returns
  // a defined value rather than `T | undefined` at every call site.
  const config = app.get(ConfigService<Env, true>);

  // Namespacing every route keeps the API clear of paths a reverse proxy or a
  // future webhook endpoint might want at the root.
  app.setGlobalPrefix("api");

  // `credentials` is deliberate groundwork: the httpOnly session cookie the API
  // will issue once auth lands cannot cross origins without it.
  app.enableCors({
    origin: config.get("FRONTEND_ORIGIN", { infer: true }),
    credentials: true,
  });

  // `forbidNonWhitelisted` turns an unexpected field into a 400 instead of
  // silently dropping it — mass-assignment protection in place before the first
  // DTO exists, so no endpoint ever ships without it.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Lets `onModuleDestroy` / `onApplicationShutdown` run on SIGTERM, so
  // in-flight requests finish and pools close cleanly on redeploy.
  app.enableShutdownHooks();

  const port = config.get("PORT", { infer: true });
  await app.listen(port);

  Logger.log(`API listening on http://localhost:${port}/api`, "Bootstrap");
}

void bootstrap();
