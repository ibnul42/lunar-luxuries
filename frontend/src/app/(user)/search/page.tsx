import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { ProductGrid, ProductTile } from "@/components/catalog/product-tile";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProducts } from "@/lib/catalog";

import { SearchBox } from "./search-box";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim();
  return {
    title: query ? `Search: ${query}` : "Search",
    // Result pages are thin duplicates of /shop; keep them out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = ((Array.isArray(q) ? q[0] : q) ?? "").trim().slice(0, 100);
  const result = query ? await getProducts({ q: query, limit: 48 }) : null;

  return (
    <div className="shell pb-section-y-sm lg:pb-section-y-lg">
      <section className="mx-auto max-w-2xl pt-10 pb-8 lg:pt-14 lg:pb-12">
        <h1 className="sr-only">Search</h1>
        <SearchBox initial={query} />
      </section>

      {result === null ? (
        <p className="text-center text-[15px] text-muted">
          Search by product, material or category.
        </p>
      ) : result.total > 0 ? (
        <section aria-labelledby="results">
          <h2
            id="results"
            className="mb-6 text-sm text-muted"
            aria-live="polite"
          >
            {result.total} {result.total === 1 ? "result" : "results"} for
            &ldquo;{query}&rdquo;
          </h2>
          <ProductGrid>
            {result.items.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </ProductGrid>
        </section>
      ) : (
        <EmptyState
          icon={SearchX}
          title={`No results for “${query}”`}
          action={
            <Link href="/shop" className={buttonClasses()}>
              Shop all
            </Link>
          }
        >
          Try a different word, or browse the full collection.
        </EmptyState>
      )}
    </div>
  );
}
