import { randomBytes } from "node:crypto";

import {
  ConflictException,
  Injectable,
  type OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon2 from "argon2";

import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { RegisterDto } from "./auth.dto";
import { type PublicUser, publicUserSelect, toPublicUser } from "./public-user";

/** One message for unknown email, wrong password and OAuth-only accounts. */
const INVALID_CREDENTIALS = "Incorrect email or password.";
const EMAIL_TAKEN = "An account with this email already exists.";

@Injectable()
export class AuthService implements OnModuleInit {
  /**
   * Verified against when the email is unknown, so that path costs the same
   * Argon2 run as a wrong password and response timing does not reveal which
   * addresses have accounts (README §8).
   */
  private dummyHash = "";

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await argon2.hash(randomBytes(32));
  }

  /**
   * Argon2id with the library defaults (64 MiB, t=3, p=4) — above the OWASP
   * floor. `argon2.verify` reads the parameters back out of each stored hash,
   * so raising them later does not lock anyone out.
   */
  async register(input: RegisterDto): Promise<PublicUser> {
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    try {
      return await this.prisma.user.create({
        data: { name: input.name, email: input.email, passwordHash },
        select: publicUserSelect,
      });
    } catch (error) {
      // Rely on the unique index rather than a lookup first: two concurrent
      // sign-ups with one address cannot both pass a check-then-insert.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // Registration necessarily says whether an address is taken; the
        // per-IP rate limit on this route is what keeps that from being bulk-
        // harvested. Login and (later) password reset never say it.
        throw new ConflictException({
          statusCode: 409,
          message: EMAIL_TAKEN,
          errors: { email: EMAIL_TAKEN },
        });
      }
      throw error;
    }
  }

  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, passwordHash: true },
    });

    const valid = await argon2
      .verify(user?.passwordHash ?? this.dummyHash, password)
      .catch(() => false);

    if (!user?.passwordHash || !valid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return toPublicUser(user);
  }
}
