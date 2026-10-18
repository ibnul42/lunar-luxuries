import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductGrid, ProductTile } from "@/components/catalog/product-tile";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StarRating } from "@/components/ui/star-rating";
import { getCategories, getProducts, type ProductCard } from "@/lib/catalog";

import { CategoryRail } from "./category-rail";

/** Catalogue data is per-request (see lib/catalog.ts); never prerender. */
export const dynamic = "force-dynamic";

/**
 * Marketing quotes from the Homepage design — store-level testimonials, not
 * product reviews, so they live with the page rather than in `Review`.
 */
const TESTIMONIALS = [
  {
    quote: "Every piece feels considered. Nothing here feels mass-produced.",
    name: "Elena R.",
    location: "Portland",
  },
  {
    quote: "Packaging alone made it feel like a gift to myself.",
    name: "Marcus T.",
    location: "Austin",
  },
  {
    quote: "I've reordered three times. The quality never wavers.",
    name: "Priya N.",
    location: "Chicago",
  },
] as const;

function ProductSection({
  id,
  kicker,
  title,
  href,
  products,
}: {
  id: string;
  kicker: string;
  title: string;
  href: string;
  products: ProductCard[];
}) {
  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby={id}
      className="shell py-section-y-sm lg:py-section-y"
    >
      <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
        <SectionHeading
          id={id}
          kicker={kicker}
          title={title}
          className="space-y-3"
        />
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-800"
        >
          View all <ArrowRight size={16} strokeWidth={2.75} aria-hidden />
          <span className="sr-only">{title.toLowerCase()}</span>
        </Link>
      </div>
      <ProductGrid>
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ProductGrid>
    </section>
  );
}

export default async function HomePage() {
  const [categories, featured, arrivals] = await Promise.all([
    getCategories(),
    getProducts({ collection: "featured", limit: 4 }),
    getProducts({ collection: "new", sort: "newest", limit: 4 }),
  ]);

  return (
    <>
      {/* Full-bleed hero — the design's default of its three variants. */}
      <section className="relative flex min-h-[70vh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 hero-glow washed" />
        <div aria-hidden className="absolute inset-0 scrim" />

        <CategoryRail categories={categories} />

        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center text-surface sm:px-10 lg:px-section-x">
          <p className="mb-4 text-[12px] font-semibold tracking-kicker-wide text-accent-200 uppercase">
            New season, quietly arrived
          </p>
          <span aria-hidden className="mb-7 h-px w-10 bg-surface/40" />
          <h1 className="mb-7 max-w-3xl font-display text-[40px] leading-[1.08] tracking-tight text-balance text-surface sm:text-[48px] lg:text-[60px]">
            Small luxuries, quietly extraordinary.
          </h1>
          <p className="mx-auto mb-10 max-w-[40ch] text-[17px] leading-relaxed text-surface/90 lg:text-lg">
            Jewelry, home, beauty and more — chosen for how they feel to live
            with, not just how they photograph.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link href="/shop" className={buttonClasses()}>
              Shop the collection
            </Link>
            <Link
              href="/shop?collection=new"
              className={buttonClasses({
                variant: "ghost",
                className:
                  "border border-surface/45 text-surface hover:bg-surface/10 active:bg-surface/20",
              })}
            >
              Explore new arrivals
              <ArrowRight size={16} strokeWidth={2.75} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* The rail is desktop-only; phones get the categories as chips. */}
      <nav
        aria-label="Shop by category"
        className="shell -mb-4 flex gap-2 overflow-x-auto pt-8 pb-1 lg:hidden"
      >
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="shrink-0 rounded-pill border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text"
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <ProductSection
        id="best-selling"
        kicker="Loved again and again"
        title="Best selling"
        href="/shop?collection=featured"
        products={featured.items}
      />

      <ProductSection
        id="new-arrival"
        kicker="Just landed"
        title="New arrival"
        href="/shop?collection=new"
        products={arrivals.items}
      />

      <section
        aria-labelledby="testimonials"
        className="shell pb-section-y-sm lg:pb-section-y"
      >
        <SectionHeading
          id="testimonials"
          kicker="In their words"
          title="Made to be lived with"
          align="center"
          className="mb-10 space-y-3 lg:mb-12"
        />
        <ul className="grid gap-gutter md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col gap-5 p-8">
                  <StarRating value={5} />
                  <blockquote className="flex-1 font-display text-[19px] leading-snug text-text">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 place-items-center rounded-pill bg-accent-100 font-display text-accent-800"
                    >
                      {t.name[0]}
                    </span>
                    <p className="text-sm">
                      <span className="block font-semibold text-text">
                        {t.name}
                      </span>
                      <span className="text-muted">{t.location}</span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
