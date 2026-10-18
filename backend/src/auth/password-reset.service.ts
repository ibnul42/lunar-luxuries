import { createHash, randomBytes } from "node:crypto";

import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";

import type { Env } from "../config/env.validation";
import { PrismaService } from "../prisma/prisma.service";
import { SessionsService } from "./sessions.service";

const RESET_LIFETIME_MS = 60 * 60 * 1000;
const EXPIRED =
  "This reset link has expired or was already used. Request a new one.";

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

/**
 * Single-use, one-hour reset links. Only the token's SHA-256 is stored.
 *
 * There is no mailer yet (README §1 — Resend). Until there is, the link is
 * written to the API log in development and dropped in production, so the
 * flow can be exercised end to end without pretending an email was sent.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly frontendOrigin: string;
  private readonly isProduction: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    config: ConfigService<Env, true>,
  ) {
    this.frontendOrigin = config.get("FRONTEND_ORIGIN", { infer: true });
    this.isProduction =
      config.get("NODE_ENV", { infer: true }) === "production";
  }

  /** Says nothing about whether the address has an account (README §8). */
  async request(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) return;

    const token = randomBytes(32).toString("base64url");

    await this.prisma.$transaction([
      // A new link retires every older one.
      this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_LIFETIME_MS),
        },
      }),
    ]);

    const link = `${this.frontendOrigin}/reset-password?token=${token}`;
    if (this.isProduction) {
      this.logger.warn(
        "Password reset requested, but no mailer is configured.",
      );
    } else {
      this.logger.log(`Password reset link for ${email}: ${link}`);
    }
  }

  async reset(token: string, password: string): Promise<void> {
    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException({
        statusCode: 400,
        message: EXPIRED,
        errors: { token: EXPIRED },
      });
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Whoever knew the old password is signed out everywhere.
    await this.sessions.revokeAllFor(row.userId);
  }
}
