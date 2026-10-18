import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { AuditService } from "../audit/audit.service";
import { variantLabel } from "../catalog/product-card";
import { PrismaService } from "../prisma/prisma.service";
import type {
  AdminListQuery,
  CategoryInputDto,
  CategoryUpdateDto,
  ProductInputDto,
} from "./admin.dto";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "item";

@Injectable()
export class AdminCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // --- Products -----------------------------------------------------------

  async products(query: AdminListQuery) {
    const rows = await this.prisma.product.findMany({
      where: query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              {
                category: { name: { contains: query.q, mode: "insensitive" } },
              },
            ],
          }
        : {},
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        basePriceCents: true,
        category: { select: { name: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true, alt: true },
        },
        variants: { select: { stockQty: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status,
      priceCents: row.basePriceCents,
      category: row.category.name,
      image: row.images[0] ?? null,
      stock: row.variants.reduce((sum, v) => sum + v.stockQty, 0),
    }));
  }

  async product(id: string) {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          select: { url: true, alt: true },
        },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!row) throw new NotFoundException("We couldn't find that product.");

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      categoryId: row.categoryId,
      status: row.status,
      priceCents: row.basePriceCents,
      compareAtPriceCents: row.compareAtPriceCents,
      isFeatured: row.isFeatured,
      isNewArrival: row.isNewArrival,
      images: row.images,
      variants: row.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        label: variantLabel(variant),
        stockQty: variant.stockQty,
      })),
    };
  }

  /** New products start with a single, option-less variant. */
  async createProduct(actorId: string, input: ProductInputDto) {
    await this.assertCategory(input.categoryId);
    const slug = await this.uniqueSlug("product", slugify(input.name));

    const row = await this.prisma.product.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        status: input.status,
        basePriceCents: input.priceCents,
        compareAtPriceCents: input.compareAtPriceCents ?? null,
        isFeatured: input.isFeatured ?? false,
        isNewArrival: input.isNewArrival ?? false,
        variants: {
          create: {
            sku: `${slug.slice(0, 24).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
            priceCents: input.priceCents,
            stockQty: input.stockQty ?? 0,
          },
        },
      },
    });

    await this.audit.record({
      actorId,
      action: "create",
      entity: "product",
      entityId: row.id,
      diff: { name: input.name },
    });
    return this.product(row.id);
  }

  /**
   * The design's single price applies to every variant. Stock comes either as
   * one number (single-variant product) or per variant.
   */
  async updateProduct(actorId: string, id: string, input: ProductInputDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: { select: { id: true } } },
    });
    if (!existing)
      throw new NotFoundException("We couldn't find that product.");
    await this.assertCategory(input.categoryId);

    const ownIds = new Set(existing.variants.map((v) => v.id));
    if (input.variants?.some((v) => !ownIds.has(v.id))) {
      throw new BadRequestException(
        "A variant does not belong to this product.",
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          categoryId: input.categoryId,
          status: input.status,
          basePriceCents: input.priceCents,
          compareAtPriceCents: input.compareAtPriceCents ?? null,
          ...(input.isFeatured === undefined
            ? {}
            : { isFeatured: input.isFeatured }),
          ...(input.isNewArrival === undefined
            ? {}
            : { isNewArrival: input.isNewArrival }),
        },
      });
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: { priceCents: input.priceCents },
      });

      if (input.variants?.length) {
        for (const variant of input.variants) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stockQty: variant.stockQty },
          });
        }
      } else if (
        input.stockQty !== undefined &&
        existing.variants.length === 1
      ) {
        await tx.productVariant.update({
          where: { id: existing.variants[0].id },
          data: { stockQty: input.stockQty },
        });
      }
    });

    await this.audit.record({
      actorId,
      action: "update",
      entity: "product",
      entityId: id,
      diff: {
        name: input.name,
        status: input.status,
        priceCents: input.priceCents,
      },
    });
    return this.product(id);
  }

  // --- Categories ---------------------------------------------------------

  async categories() {
    const rows = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
        children: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      status: row.status,
      productCount:
        row._count.products +
        row.children.reduce((sum, child) => sum + child._count.products, 0),
      children: row.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        status: child.status,
        productCount: child._count.products,
      })),
    }));
  }

  async createCategory(actorId: string, input: CategoryInputDto) {
    if (input.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: input.parentId },
        select: { parentId: true },
      });
      if (!parent)
        throw new NotFoundException("We couldn't find the parent category.");
      if (parent.parentId) {
        throw new BadRequestException(
          "Subcategories can't have their own subcategories.",
        );
      }
    }

    const slug = await this.uniqueSlug("category", slugify(input.name));
    const sortOrder = await this.prisma.category.count({
      where: { parentId: input.parentId ?? null },
    });

    const row = await this.prisma.category.create({
      data: {
        slug,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? "ACTIVE",
        parentId: input.parentId ?? null,
        sortOrder,
      },
    });
    await this.audit.record({
      actorId,
      action: "create",
      entity: "category",
      entityId: row.id,
      diff: { name: row.name, parentId: row.parentId },
    });
    return this.categories();
  }

  async updateCategory(actorId: string, id: string, input: CategoryUpdateDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException("We couldn't find that category.");

    await this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.description === undefined
          ? {}
          : { description: input.description }),
        ...(input.status === undefined ? {} : { status: input.status }),
      },
    });
    await this.audit.record({
      actorId,
      action: "update",
      entity: "category",
      entityId: id,
      diff: { ...input },
    });
    return this.categories();
  }

  /** Refused while any product sits in it or its subcategories. */
  async deleteCategory(actorId: string, id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing)
      throw new NotFoundException("We couldn't find that category.");

    const productCount = await this.prisma.product.count({
      where: { OR: [{ categoryId: id }, { category: { parentId: id } }] },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `${existing.name} still has ${productCount} product${productCount === 1 ? "" : "s"}. Move ${productCount === 1 ? "it" : "them"} to another category first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "delete",
      entity: "category",
      entityId: id,
      diff: { name: existing.name },
    });
    return this.categories();
  }

  // --- Helpers ------------------------------------------------------------

  private async assertCategory(id: string): Promise<void> {
    const found = await this.prisma.category.count({ where: { id } });
    if (!found) {
      throw new BadRequestException({
        statusCode: 400,
        message: "Choose a category.",
        errors: { categoryId: "Choose a category." },
      });
    }
  }

  private async uniqueSlug(
    kind: "product" | "category",
    base: string,
  ): Promise<string> {
    for (let n = 1; ; n += 1) {
      const slug = n === 1 ? base : `${base}-${n}`;
      const taken =
        kind === "product"
          ? await this.prisma.product.count({ where: { slug } })
          : await this.prisma.category.count({ where: { slug } });
      if (!taken) return slug;
    }
  }
}
