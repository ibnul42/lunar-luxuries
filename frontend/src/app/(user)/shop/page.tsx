import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { ProductGrid, ProductTile } from "@/components/catalog/product-tile";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  type CategoryNode,
  getCategories,
  getProducts,
  type Sort,
  SORTS,
  toQueryString,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

import { ShopFilters } from "./shop-filters";

export const dynamic = "force-dynamic";

type SearchParams = Awaited<PageProps<"/shop">["searchParams"]>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readFilters(params: SearchParams) {
  const category = (first(params.category) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sortParam = first(params.sort);
  const sort: Sort = SORTS.some((s) => s.value === sortParam)
    ? (sortParam as Sort)
    : "featured";
  const collectionParam = first(params.collection);
  const collection: "new" | "featured" | undefined =
    collectionParam === "new" || collectionParam === "featured"
      ? collectionParam
      : undefined;
  const page = Math.max(1, Number(first(params.page)) || 1);
  return { category, sort, collection, page };
}

/** Finds a slug at either level of the tree. */
function findCategory(tree: CategoryNode[], slug: string) {
  for (const node of tree) {
    if (node.slug === slug)
      return { name: node.name, description: node.description };
    const child = node.children.find((c) => c.slug === slug);
    if (child)
      return { name: child.name, description: `Part of ${node.name}.` };
  }
  return null;
}

function heading(
  tree: CategoryNode[],
  filters: ReturnType<typeof readFilters>,
): { kicker: string; title: string; description?: string | null } {
  if (filters.collection === "new")
    return { kicker: "Just landed", title: "New arrivals" };
  if (filters.collection === "featured") {
    return { kicker: "Loved again and again", title: "Best selling" };
  }
  if (filters.category.length === 1) {
    const found = findCategory(tree, filters.category[0]!);
    if (found)
      return {
        kicker: "Shop",
        title: found.name,
        description: found.description,
      };
  }
  return { kicker: "Shop all", title: "Every considered thing" };
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/shop">): Promise<Metadata> {
  const filters = readFilters(await searchParams);
  if (filters.collection === "new") return { title: "New arrivals" };
  if (filters.collection === "featured") return { title: "Best selling" };
  return { title: "Shop" };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const filters = readFilters(await searchParams);
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      category: filters.category,
      sort: filters.sort,
      collection: filters.collection,
      page: filters.page,
    }),
  ]);
  const { kicker, title, description } = heading(categories, filters);
  const pages = Math.ceil(result.total / result.pageSize);

  return (
    <>
      <section className="shell pt-8 pb-3 lg:pt-10">
        <p className="mb-3 kicker text-accent-700">{kicker}</p>
        <h1 className="font-display text-[30px] leading-tight sm:text-h2">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-[15px] text-muted">{description}</p>
        ) : null}
      </section>

      <section className="shell grid items-start gap-8 pt-6 pb-section-y-sm lg:grid-cols-[var(--spacing-facets)_1fr] lg:gap-column lg:pt-8 lg:pb-section-y-lg">
        <ShopFilters
          categories={categories}
          selected={filters.category}
          sort={filters.sort}
        />

        <div>
          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {result.total} {result.total === 1 ? "item" : "items"}
          </p>

          {result.items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Nothing here yet"
              action={
                <Link href="/shop" className={buttonClasses()}>
                  See everything
                </Link>
              }
            >
              No products match these filters. Try another category, or clear
              them all.
            </EmptyState>
          ) : (
            <ProductGrid columns={3}>
              {result.items.map((product, index) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </ProductGrid>
          )}

          {pages > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-14 flex flex-wrap justify-center gap-2"
            >
              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/shop${toQueryString({ ...filters, page })}`}
                  aria-current={page === filters.page ? "page" : undefined}
                  className={cn(
                    "grid size-11 place-items-center rounded-pill text-sm font-semibold",
                    page === filters.page
                      ? "bg-text text-bg"
                      : "border border-border-strong hover:bg-accent-100",
                  )}
                >
                  {page}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
