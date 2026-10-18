import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { variantLabel } from "../catalog/product-card";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";
import { CART_LIFETIME_MS, hashCartToken } from "./cart-cookie";

/** One line can hold at most this many, stock permitting. */
export const MAX_LINE_QTY = 20;

/** Whose cart a request is about: a member's, or a guest token's. */
export type CartOwner = { userId: string } | { token: string } | null;

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              status: true,
              compareAtPriceCents: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true, alt: true },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartRow = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export interface CartLine {
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string | null;
  image: { url: string; alt: string } | null;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
  /** The most this line may be set to right now. 0 when unavailable. */
  maxQty: number;
  /** False when the product was retired or sold out after it was added. */
  available: boolean;
}

export interface CartView {
  items: CartLine[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingThresholdCents: number;
  currency: string;
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  private whereFor(
    owner: Exclude<CartOwner, null>,
  ): Prisma.CartWhereUniqueInput {
    return "userId" in owner
      ? { userId: owner.userId }
      : { tokenHash: hashCartToken(owner.token) };
  }

  private async find(owner: CartOwner): Promise<CartRow | null> {
    if (!owner) return null;
    const cart = await this.prisma.cart.findUnique({
      where: this.whereFor(owner),
      include: cartInclude,
    });
    if (cart && cart.expiresAt.getTime() <= Date.now() && "token" in owner) {
      await this.prisma.cart.delete({ where: { id: cart.id } });
      return null;
    }
    return cart;
  }

  private async findOrCreate(
    owner: Exclude<CartOwner, null>,
  ): Promise<CartRow> {
    const expiresAt = new Date(Date.now() + CART_LIFETIME_MS);
    const key =
      "userId" in owner
        ? { userId: owner.userId }
        : { tokenHash: hashCartToken(owner.token) };
    return this.prisma.cart.upsert({
      where: key,
      update: { expiresAt },
      create: { ...key, expiresAt },
      include: cartInclude,
    });
  }

  async view(owner: CartOwner): Promise<CartView> {
    return this.toView(await this.find(owner));
  }

  async add(
    owner: Exclude<CartOwner, null>,
    variantId: string,
    qty: number,
  ): Promise<CartView> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQty: true, product: { select: { status: true } } },
    });
    if (
      !variant ||
      variant.product.status !== "ACTIVE" ||
      variant.stockQty < 1
    ) {
      throw new ConflictException("That item is no longer available.");
    }

    const cart = await this.findOrCreate(owner);
    const existing = cart.items.find((item) => item.variantId === variantId);
    const limit = Math.min(variant.stockQty, MAX_LINE_QTY);
    const next = Math.min((existing?.qty ?? 0) + qty, limit);

    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { qty: next },
      create: { cartId: cart.id, variantId, qty: next },
    });

    return this.view(owner);
  }

  async setQty(
    owner: CartOwner,
    itemId: string,
    qty: number,
  ): Promise<CartView> {
    const item = await this.ownedItem(owner, itemId);
    const limit = Math.min(item.variant.stockQty, MAX_LINE_QTY);
    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { qty: Math.max(1, Math.min(qty, limit)) },
    });
    return this.view(owner);
  }

  async remove(owner: CartOwner, itemId: string): Promise<CartView> {
    const item = await this.ownedItem(owner, itemId);
    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.view(owner);
  }

  /**
   * Folds a guest cart into the member's on sign-in. Quantities add up, capped
   * by stock; the guest cart is deleted either way.
   */
  async mergeGuestCart(token: string, userId: string): Promise<void> {
    const guest = await this.prisma.cart.findUnique({
      where: { tokenHash: hashCartToken(token) },
      include: {
        items: { include: { variant: { select: { stockQty: true } } } },
      },
    });
    if (!guest) return;

    if (guest.items.length > 0) {
      const target = await this.findOrCreate({ userId });
      for (const item of guest.items) {
        const existing = target.items.find(
          (t) => t.variantId === item.variantId,
        );
        const qty = Math.min(
          (existing?.qty ?? 0) + item.qty,
          item.variant.stockQty,
          MAX_LINE_QTY,
        );
        if (qty < 1) continue;
        await this.prisma.cartItem.upsert({
          where: {
            cartId_variantId: { cartId: target.id, variantId: item.variantId },
          },
          update: { qty },
          create: { cartId: target.id, variantId: item.variantId, qty },
        });
      }
    }

    await this.prisma.cart.delete({ where: { id: guest.id } });
  }

  /** Row-level check: the item must sit in this requester's own cart. */
  private async ownedItem(owner: CartOwner, itemId: string) {
    const cart = await this.find(owner);
    const item = cart?.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException("That item isn't in your cart.");
    return item;
  }

  private async toView(cart: CartRow | null): Promise<CartView> {
    const settings = await this.settings.getAll();

    const items: CartLine[] = (cart?.items ?? []).map((item) => {
      const { variant } = item;
      const { product } = variant;
      const available = product.status === "ACTIVE" && variant.stockQty > 0;
      const maxQty = available ? Math.min(variant.stockQty, MAX_LINE_QTY) : 0;
      // A line that outgrew its stock shows (and is charged) at what is left.
      const qty = available ? Math.min(item.qty, maxQty) : item.qty;

      return {
        id: item.id,
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: variantLabel(variant),
        image: product.images[0] ?? null,
        unitPriceCents: variant.priceCents,
        qty,
        lineTotalCents: available ? variant.priceCents * qty : 0,
        maxQty,
        available,
      };
    });

    const subtotalCents = items.reduce(
      (sum, line) => sum + line.lineTotalCents,
      0,
    );
    const shippingCents = this.settings.shippingFor(subtotalCents, settings);

    return {
      items,
      itemCount: items
        .filter((line) => line.available)
        .reduce((sum, line) => sum + line.qty, 0),
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      freeShippingThresholdCents: settings.freeShippingThresholdCents,
      currency: settings.currency,
    };
  }
}
