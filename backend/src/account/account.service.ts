import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as argon2 from "argon2";

import { type PublicUser, publicUserSelect } from "../auth/public-user";
import { SessionsService } from "../auth/sessions.service";
import { Prisma } from "../generated/prisma/client";
import {
  orderDetailInclude,
  orderSummarySelect,
  toOrderDetail,
  toOrderSummary,
} from "../orders/order-view";
import { PrismaService } from "../prisma/prisma.service";
import type {
  AddressDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "./account.dto";

const EMAIL_TAKEN = "An account with this email already exists.";
const WRONG_PASSWORD = "That password isn't right.";

const addressSelect = {
  id: true,
  label: true,
  firstName: true,
  lastName: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  isDefault: true,
} satisfies Prisma.AddressSelect;

/**
 * Everything here is scoped by the signed-in user's id. An id from the URL is
 * only ever used *together with* that user id, never on its own (README §8).
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
  ) {}

  async updateProfile(
    userId: string,
    input: UpdateProfileDto,
  ): Promise<PublicUser> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { name: input.name, email: input.email },
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException({
          statusCode: 409,
          message: EMAIL_TAKEN,
          errors: { email: EMAIL_TAKEN },
        });
      }
      throw error;
    }
  }

  /** Signs every *other* browser out; the one making the change stays in. */
  async changePassword(
    userId: string,
    input: ChangePasswordDto,
    currentToken: string | undefined,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true },
    });
    const valid =
      user.passwordHash !== null &&
      (await argon2
        .verify(user.passwordHash, input.currentPassword)
        .catch(() => false));
    if (!valid) {
      throw new BadRequestException({
        statusCode: 400,
        message: WRONG_PASSWORD,
        errors: { currentPassword: WRONG_PASSWORD },
      });
    }

    const passwordHash = await argon2.hash(input.newPassword, {
      type: argon2.argon2id,
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await this.sessions.revokeAllFor(userId, currentToken);
  }

  addresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: addressSelect,
    });
  }

  async createAddress(userId: string, input: AddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    // The first address is the default whether or not it was asked for.
    const isDefault = count === 0 || (input.isDefault ?? false);

    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: { ...this.addressData(input), userId, isDefault },
        select: addressSelect,
      });
    });
  }

  async updateAddress(userId: string, id: string, input: AddressDto) {
    const existing = await this.ownedAddress(userId, id);
    // Unticking "default" on the default address would leave none; keep it.
    const isDefault = existing.isDefault || (input.isDefault ?? false);

    return this.prisma.$transaction(async (tx) => {
      if (isDefault && !existing.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id: existing.id },
        data: { ...this.addressData(input), isDefault },
        select: addressSelect,
      });
    });
  }

  async setDefaultAddress(userId: string, id: string) {
    const existing = await this.ownedAddress(userId, id);
    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: existing.id },
        data: { isDefault: true },
      }),
    ]);
  }

  /** Deleting the default promotes the oldest remaining address. */
  async deleteAddress(userId: string, id: string): Promise<void> {
    const existing = await this.ownedAddress(userId, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: existing.id } });
      if (!existing.isDefault) return;
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (next) {
        await tx.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    });
  }

  async orders(userId: string) {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      select: orderSummarySelect,
    });
    return rows.map(toOrderSummary);
  }

  async order(userId: string, number: string) {
    const order = await this.prisma.order.findFirst({
      where: { number, userId },
      include: orderDetailInclude,
    });
    if (!order) throw new NotFoundException("We couldn't find that order.");
    return toOrderDetail(order);
  }

  private async ownedAddress(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException("We couldn't find that address.");
    return address;
  }

  private addressData(input: AddressDto) {
    return {
      label: input.label,
      firstName: input.firstName,
      lastName: input.lastName,
      line1: input.line1,
      line2: input.line2 ?? null,
      city: input.city,
      state: input.state ?? null,
      postalCode: input.postalCode,
      country: input.country,
      phone: input.phone ?? null,
    };
  }
}
