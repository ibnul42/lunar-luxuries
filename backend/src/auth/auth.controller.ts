import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import type { Env } from "../config/env.validation";
import { LoginDto, RegisterDto } from "./auth.dto";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import type { PublicUser } from "./public-user";
import {
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from "./session-cookie";
import { SessionGuard } from "./session.guard";
import { SessionsService } from "./sessions.service";

interface UserResponse {
  user: PublicUser;
}

const MINUTE = 60_000;

@Controller("auth")
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    config: ConfigService<Env, true>,
  ) {
    this.isProduction =
      config.get("NODE_ENV", { infer: true }) === "production";
  }

  /** Creates the account and signs it straight in. */
  @Post("register")
  @Throttle({ default: { limit: 5, ttl: MINUTE } })
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponse> {
    const user = await this.auth.register(body);
    await this.startSession(req, res, user.id, true);
    return { user };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE } })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponse> {
    const user = await this.auth.verifyCredentials(body.email, body.password);
    await this.startSession(req, res, user.id, body.remember ?? false);
    return { user };
  }

  /** Always 204 — signing out twice, or while signed out, is not an error. */
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = readSessionToken(req);
    if (token) await this.sessions.revoke(token);
    clearSessionCookie(res, this.isProduction);
  }

  @Get("me")
  @UseGuards(SessionGuard)
  me(@CurrentUser() user: PublicUser): UserResponse {
    return { user };
  }

  /**
   * Any session the browser already held is revoked first, so a token planted
   * before sign-in (session fixation) never becomes an authenticated one.
   */
  private async startSession(
    req: Request,
    res: Response,
    userId: string,
    remember: boolean,
  ): Promise<void> {
    const previous = readSessionToken(req);
    if (previous) await this.sessions.revoke(previous);

    const token = await this.sessions.create(userId, remember);
    setSessionCookie(res, token, {
      persistent: remember,
      isProduction: this.isProduction,
    });
  }
}
