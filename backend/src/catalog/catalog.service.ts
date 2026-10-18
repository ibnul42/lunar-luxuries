import { Injectable, NotFoundException } from "@nestjs/common";

import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { ProductListQuery, ProductSort } from "./catalog.dto";
import {
  type ProductCard,
  productCardSelect,
  toProductCard,
  visibleProductWhere,
} from "./product-card";

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  children: { id: string; slug: string; name: string; productCount: number }[];
}

const REVIEWS_PER_PAGE = 6;

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> =
  {
    featured: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    newest: [{ createdAt: "desc" }],
    "price-asc": [{ basePriceCents: "asc" }, { name: "asc" }],
    "price-desc": [{ basePriceCents: "desc" }, { name: "asc" }],
    name: [{ name: "asc" }],
  };

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Visible top-level categories with their visible subcategories. */
  async categories(): Promise<CategoryNode[]> {
    const rows = await this.prisma.category.findMany({
      where: { parentId: null, status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: {
                products: {
                  where: { status: { in: ["ACTIVE", "OUT_OF_STOCK"] } },
                },
              },
            },
          },
        },
        _count: {
          select: {
            products: { where: { status: { in: ["ACTIVE", "OUT_OF_STOCK"] } } },
          },
        },
      },
    });

    return rows.map((row) => {
      const children = row.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        productCount: child._count.products,
      }));
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl,
        productCount:
          row._count.products +
          children.reduce((sum, child) => sum + child.productCount, 0),
        children,
      };
    });
  }

  async list(query: ProductListQuery): Promise<{
    items: ProductCard[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const pageSize = query.limit ?? 24;
    const page = query.page ?? 1;

    const where: Prisma.ProductWhereInput = {
      AND: [
        visibleProductWhere,
        // A slug matches its own products and, for a parent, its children's.
        query.category?.length
          ? {
              OR: [
                { category: { slug: { in: query.category } } },
                { category: { parent: { slug: { in: query.category } } } },
              ],
            }
          : {},
        // Plain ILIKE: twelve products do not need full-text search yet
        // (README §1 — Postgres FTS, then a search service if relevance suffers).
        query.q
          ? {
              OR: [
                { name: { contains: query.q, mode: "insensitive" } },
                { description: { contains: query.q, mode: "insensitive" } },
                {
                  category: {
                    name: { contains: query.q, mode: "insensitive" },
                  },
                },
              ],
            }
          : {},
        query.collection === "featured" ? { isFeatured: true } : {},
        query.collection === "new" ? { isNewArrival: true } : {},
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: ORDER_BY[query.sort ?? "featured"],
        select: productCardSelect,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: rows.map(toProductCard), total, page, pageSize };
  }

  async detail(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, ...visibleProductWhere },
      include: {
        category: {
          select: {
            slug: true,
            name: true,
            parent: { select: { slug: true, name: true } },
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: { url: true, alt: true },
        },
        variants: { orderBy: { sortOrder: "asc" } },
        specs: {
          orderBy: { sortOrder: "asc" },
          select: { label: true, value: true },
        },
      },
    });
    if (!product) throw new NotFoundException("We couldn't find that product.");

    const grouped = await this.prisma.review.groupBy({
      by: ["rating"],
      where: { productId: product.id, status: "PUBLISHED" },
      _count: { _all: true },
    });
    const histogram = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: grouped.find((g) => g.rating === stars)?._count._all ?? 0,
    }));
    const count = histogram.reduce((sum, bar) => sum + bar.count, 0);
    const average =
      count === 0
        ? null
        : histogram.reduce((sum, bar) => sum + bar.stars * bar.count, 0) /
          count;

    const purchasable = product.status === "ACTIVE";

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceCents: product.basePriceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      colorLabel: product.colorLabel,
      category: product.category,
      images: product.images,
      specs: product.specs,
      // Stock levels stay server-side; the page only needs "can I buy this".
      variants: product.variants.map((variant) => ({
        id: variant.id,
        color: variant.color,
        colorHex: variant.colorHex,
        size: variant.size,
        priceCents: variant.priceCents,
        inStock: purchasable && variant.stockQty > 0,
        maxQty: purchasable ? Math.min(variant.stockQty, 20) : 0,
      })),
      rating: { average, count, histogram },
    };
  }

  async reviews(slug: string, page = 1) {
    const where: Prisma.ReviewWhereInput = {
      status: "PUBLISHED",
      product: { slug, ...visibleProductWhere },
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          authorName: true,
          rating: true,
          body: true,
          createdAt: true,
        },
        take: REVIEWS_PER_PAGE,
        skip: (page - 1) * REVIEWS_PER_PAGE,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total, page, pageSize: REVIEWS_PER_PAGE };
  }

  /** Same top-level category first, topped up from the rest of the store. */
  async related(slug: string): Promise<ProductCard[]> {
    const product = await this.prisma.product.findFirst({
      where: { slug, ...visibleProductWhere },
      select: {
        id: true,
        category: { select: { id: true, parentId: true } },
      },
    });
    if (!product) throw new NotFoundException("We couldn't find that product.");

    const rootId = product.category.parentId ?? product.category.id;
    const LIMIT = 4;

    const sameFamily = await this.prisma.product.findMany({
      where: {
        ...visibleProductWhere,
        id: { not: product.id },
        OR: [{ categoryId: rootId }, { category: { parentId: rootId } }],
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: productCardSelect,
      take: LIMIT,
    });

    const filler =
      sameFamily.length < LIMIT
        ? await this.prisma.product.findMany({
            where: {
              ...visibleProductWhere,
              id: { notIn: [product.id, ...sameFamily.map((p) => p.id)] },
            },
            orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
            select: productCardSelect,
            take: LIMIT - sameFamily.length,
          })
        : [];

    return [...sameFamily, ...filler].map(toProductCard);
  }
}
