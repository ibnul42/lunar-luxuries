import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { Price, savingsPercent } from "@/components/catalog/price";
import { ProductGrid, ProductTile } from "@/components/catalog/product-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { StarRating } from "@/components/ui/star-rating";
import { Tag } from "@/components/ui/tag";
import { ApiError } from "@/lib/api";
import {
  getProduct,
  getRelated,
  getReviews,
  getStore,
  type ProductCard,
  type ProductDetail,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

import { ProductGallery } from "./product-gallery";
import { ProductPurchase } from "./product-purchase";
import { ProductTabs } from "./product-tabs";

export const dynamic = "force-dynamic";

/** A 404 from the API is our 404; anything else is a real error. */
async function load(slug: string): Promise<ProductDetail> {
  try {
    return await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, related, reviews, store] = await Promise.all([
    load(slug),
    getRelated(slug).catch(() => [] as ProductCard[]),
    getReviews(slug),
    getStore(),
  ]);

  const { category, rating } = product;
  const savings = savingsPercent(
    product.priceCents,
    product.compareAtPriceCents,
  );
  const card: ProductCard = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    compareAtPriceCents: product.compareAtPriceCents,
    image: product.images[0] ?? null,
    category: { name: category.name, slug: category.slug },
    isNewArrival: false,
    inStock: product.variants.some((v) => v.inStock),
  };

  const crumbs = [
    { label: "Home", href: "/" },
    ...(category.parent
      ? [
          {
            label: category.parent.name,
            href: `/shop?category=${category.parent.slug}`,
          },
        ]
      : []),
    { label: category.name, href: `/shop?category=${category.slug}` },
    { label: product.name },
  ];

  return (
    <>
      <div className="shell pt-6 lg:pt-8">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="shell grid gap-10 pt-6 pb-section-y-sm lg:grid-cols-2 lg:gap-16 lg:pt-8 lg:pb-section-y">
        <ProductGallery name={product.name} images={product.images} />

        <div className="lg:pt-4">
          <p className="mb-3 kicker text-accent-700">
            {category.parent?.name ?? category.name}
          </p>
          <h1 className="mb-4 font-display text-[32px] leading-tight sm:text-[40px]">
            {product.name}
          </h1>

          {rating.count > 0 && rating.average !== null ? (
            <div className="mb-6 flex items-center gap-3">
              <StarRating value={rating.average} />
              <a
                href="#product-info"
                className="text-sm text-muted underline-offset-4 hover:text-accent-700 hover:underline"
              >
                {rating.average.toFixed(1)} · {rating.count} reviews
              </a>
            </div>
          ) : null}

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Price
              cents={product.priceCents}
              compareAtCents={product.compareAtPriceCents}
              size="lg"
            />
            {savings ? <Tag>Save {savings}%</Tag> : null}
          </div>

          <p className="mb-8 max-w-xl text-[16px] leading-relaxed text-text-secondary">
            {product.description.split(/\n{2,}/)[0]}
          </p>

          <ProductPurchase product={product} card={card} />

          <ul className="mt-8 grid gap-4 border-t border-border pt-7 text-sm text-text-secondary sm:grid-cols-3">
            <li className="flex items-center gap-2.5">
              <Truck
                size={18}
                strokeWidth={2.5}
                aria-hidden
                className="shrink-0 text-accent-700"
              />
              Free shipping over {formatPrice(store.freeShippingThresholdCents)}
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck
                size={18}
                strokeWidth={2.5}
                aria-hidden
                className="shrink-0 text-accent-700"
              />
              2-year warranty
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw
                size={18}
                strokeWidth={2.5}
                aria-hidden
                className="shrink-0 text-accent-700"
              />
              30-day easy returns
            </li>
          </ul>
        </div>
      </section>

      <section
        id="product-info"
        className="shell scroll-mt-28 pb-section-y-sm lg:pb-section-y"
      >
        <ProductTabs
          product={product}
          firstReviews={reviews}
          freeShippingThresholdCents={store.freeShippingThresholdCents}
        />
      </section>

      {related.length > 0 ? (
        <section
          aria-labelledby="related"
          className="shell pb-section-y-sm lg:pb-section-y"
        >
          <SectionHeading
            id="related"
            kicker="Pairs well"
            title="You may also like"
            className="mb-8 space-y-3 lg:mb-10"
          />
          <ProductGrid>
            {related.map((item) => (
              <ProductTile key={item.id} product={item} />
            ))}
          </ProductGrid>
        </section>
      ) : null}
    </>
  );
}
