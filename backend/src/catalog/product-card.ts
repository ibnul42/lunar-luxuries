import type { Prisma } from "../generated/prisma/client";

/**
 * Products a shopper may see: live or sold out (drafts never), in a category
 * that — along with its parent — is not hidden.
 */
export const visibleProductWhere = {
  status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
  category: {
    status: "ACTIVE",
    OR: [{ parentId: null }, { parent: { status: "ACTIVE" } }],
  },
} satisfies Prisma.ProductWhereInput;

/** Everything a product tile needs, and nothing else. */
export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  status: true,
  basePriceCents: true,
  compareAtPriceCents: true,
  isNewArrival: true,
  category: { select: { name: true, slug: true } },
  images: {
    select: { url: true, alt: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  },
  variants: { select: { stockQty: true } },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  image: { url: string; alt: string } | null;
  category: { name: string; slug: string };
  isNewArrival: boolean;
  inStock: boolean;
}

export function toProductCard(row: ProductCardRow): ProductCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    priceCents: row.basePriceCents,
    compareAtPriceCents: row.compareAtPriceCents,
    image: row.images[0] ?? null,
    category: row.category,
    isNewArrival: row.isNewArrival,
    inStock:
      row.status === "ACTIVE" && row.variants.some((v) => v.stockQty > 0),
  };
}

/** "Sand · 32oz", or null for a product without options. */
export function variantLabel(variant: {
  color: string | null;
  size: string | null;
}): string | null {
  return [variant.color, variant.size].filter(Boolean).join(" · ") || null;
}
