import type { ReactNode } from "react";
import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import { WashedImage } from "@/components/ui/washed-image";
import type { ProductCard } from "@/lib/catalog";
import { cn } from "@/lib/utils";

import { Price } from "./price";

export interface ProductTileProps {
  product: ProductCard;
  /** Above-the-fold tiles load eagerly. */
  priority?: boolean;
  /** Extra controls under the price — the wishlist's buttons. Kept outside the link. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The Shop design's tile: a 4:5 washed photo that lifts on hover, the name in
 * the display face, the price. The whole tile is one link; `actions` sit
 * outside it so a button is never nested in an anchor.
 */
export function ProductTile({
  product,
  priority,
  actions,
  className,
}: ProductTileProps) {
  const onSale =
    product.compareAtPriceCents != null &&
    product.compareAtPriceCents > product.priceCents;

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="block rounded-card transition-transform duration-200 hover:-translate-y-1.5"
      >
        <div className="relative mb-4">
          <WashedImage
            src={product.image?.url}
            alt={product.image?.alt ?? product.name}
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="aspect-4/5 rounded-card shadow-tile transition-shadow duration-200 group-hover:shadow-tile-hover"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {!product.inStock ? <Tag tone="overlay">Sold out</Tag> : null}
            {product.inStock && onSale ? <Tag tone="overlay">Sale</Tag> : null}
            {product.inStock && !onSale && product.isNewArrival ? (
              <Tag tone="overlay">New</Tag>
            ) : null}
          </div>
        </div>
        <h3 className="mb-1.5 font-display text-[16px] leading-snug text-text">
          {product.name}
        </h3>
        <Price
          cents={product.priceCents}
          compareAtCents={product.compareAtPriceCents}
        />
      </Link>
      {actions ? <div className="mt-4">{actions}</div> : null}
    </article>
  );
}

/**
 * The product grids: 2-up on phones (the design is desktop-only, README §10
 * q2 — this is derived), 3 or 4 from `lg`.
 */
export function ProductGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-x-gutter lg:gap-y-12",
        columns === 4 && "xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
