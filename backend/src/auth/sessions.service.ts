import { createHash, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { type PublicUser, publicUserSelect } from "./public-user";
import { BROWSER_SESSION_MS, REMEMBERED_SESSION_MS } from "./session-cookie";

/** SHA-256 is enough here: the input is 256 random bits, not a guessable password. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Opaque, database-backed sessions. Unlike a signed JWT, a row can be deleted,
 * so sign-out (and later "sign out everywhere", or an admin disabling an
 * account) takes effect on the very next request.
 */
@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the raw token — the only time it exists outside the cookie. */
  async create(userId: string, remember: boolean): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const lifetime = remember ? REMEMBERED_SESSION_MS : BROWSER_SESSION_MS;

    await this.prisma.session.create({
      data: {
        tokenHash: hashToken(token),
        userId,
        expiresAt: new Date(Date.now() + lifetime),
      },
    });

    return token;
  }

  async findUser(token: string): Promise<PublicUser | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { id: true, expiresAt: true, user: { select: publicUserSelect } },
    });
    if (!session) return null;

    if (session.expiresAt.getTime() <= Date.now()) {
      // Expired rows are pruned when they are next presented. A scheduled sweep
      // for the ones that never are can come with the job runner.
      await this.prisma.session.deleteMany({ where: { id: session.id } });
      return null;
    }

    return session.user;
  }

  /** Idempotent — revoking an unknown or already-revoked token is a no-op. */
  async revoke(token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
}
