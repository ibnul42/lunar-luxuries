import "reflect-metadata";

import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { originCheck } from "./common/origin-check.middleware";
import { validationExceptionFactory } from "./common/validation-errors";
import type { Env } from "./config/env.validation";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // The `true` type argument marks the config as validated, so `get()` returns
  // a defined value rather than `T | undefined` at every call site.
  const config = app.get(ConfigService<Env, true>);

  // Namespacing every route keeps the API clear of paths a reverse proxy or a
  // future webhook endpoint might want at the root.
  app.setGlobalPrefix("api");

  const frontendOrigin = config.get("FRONTEND_ORIGIN", { infer: true });

  // `credentials` lets the storefront's fetches carry the httpOnly session
  // cookie (`src/auth/session-cookie.ts`) across origins.
  app.enableCors({ origin: frontendOrigin, credentials: true });

  // After CORS, so preflights are answered before this sees them.
  app.use(originCheck(frontendOrigin));
  app.use(cookieParser());

  // `forbidNonWhitelisted` turns an unexpected field into a 400 instead of
  // silently dropping it — mass-assignment protection on every DTO.
  // `stopAtFirstError` keeps one message per field, which is all a form shows.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: validationExceptionFactory,
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
