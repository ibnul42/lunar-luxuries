import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { readCartToken, clearCartCookie } from "../cart/cart-cookie";
import { CartService } from "../cart/cart.service";
import type { Env } from "../config/env.validation";
import { STAFF_ROLES } from "./admin.guard";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";
import { AuthService, INVALID_CREDENTIALS } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import type { PublicUser } from "./public-user";
import {
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from "./session-cookie";
import { PasswordResetService } from "./password-reset.service";
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
    private readonly cart: CartService,
    private readonly passwordReset: PasswordResetService,
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

  /**
   * The admin console's sign-in. Same credentials check, but a customer
   * account is refused *before* a session exists, with the same message as a
   * wrong password — the console does not confirm which addresses are staff.
   */
  @Post("admin/login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: MINUTE } })
  async adminLogin(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponse> {
    const user = await this.auth.verifyCredentials(body.email, body.password);
    if (!STAFF_ROLES.includes(user.role)) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    await this.startSession(req, res, user.id, body.remember ?? false);
    return { user };
  }

  /** Always 204, whether or not the address has an account (README §8). */
  @Post("forgot-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: MINUTE } })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    await this.passwordReset.request(body.email);
  }

  /** Sets the new password and signs the account out everywhere. */
  @Post("reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: MINUTE } })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    await this.passwordReset.reset(body.token, body.password);
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

    // Whatever a guest put in their bag comes with them into the account.
    const cartToken = readCartToken(req);
    if (cartToken) {
      await this.cart.mergeGuestCart(cartToken, userId);
      clearCartCookie(res, this.isProduction);
    }
  }
}
