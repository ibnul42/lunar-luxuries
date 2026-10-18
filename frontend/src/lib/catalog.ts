import { apiFetch } from "@/lib/api";

/**
 * Catalogue reads. Mirrors backend/src/catalog. These run in server components
 * (the storefront's browse pages render on the server for SEO), so they opt
 * out of Next's data cache: an admin's price change must show on the next
 * request, not after a revalidation window.
 */

export interface ProductImage {
  url: string;
  alt: string;
}

/** Mirrors `ProductCard` in backend/src/catalog/product-card.ts. */
export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  image: ProductImage | null;
  category: { name: string; slug: string };
  isNewArrival: boolean;
  inStock: boolean;
  /** Set for single-variant products, which a list can add to the cart directly. */
  quickAddVariantId: string | null;
}

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  children: { id: string; slug: string; name: string; productCount: number }[];
}

export interface ProductVariant {
  id: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  priceCents: number;
  inStock: boolean;
  maxQty: number;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  colorLabel: string | null;
  category: {
    slug: string;
    name: string;
    parent: { slug: string; name: string } | null;
  };
  images: ProductImage[];
  specs: { label: string; value: string }[];
  variants: ProductVariant[];
  rating: {
    average: number | null;
    count: number;
    histogram: { stars: number; count: number }[];
  };
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
] as const;
export type Sort = (typeof SORTS)[number]["value"];

export interface ProductQuery {
  category?: readonly string[];
  q?: string;
  collection?: "featured" | "new";
  sort?: Sort;
  limit?: number;
  page?: number;
}

const fresh = { cache: "no-store" } as const;

export function toQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  if (query.category?.length) params.set("category", query.category.join(","));
  if (query.q) params.set("q", query.q);
  if (query.collection) params.set("collection", query.collection);
  if (query.sort) params.set("sort", query.sort);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function getCategories(): Promise<CategoryNode[]> {
  return apiFetch<CategoryNode[]>("/categories", fresh);
}

export function getProducts(
  query: ProductQuery = {},
): Promise<Paged<ProductCard>> {
  return apiFetch<Paged<ProductCard>>(
    `/products${toQueryString(query)}`,
    fresh,
  );
}

export function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(
    `/products/${encodeURIComponent(slug)}`,
    fresh,
  );
}

export function getRelated(slug: string): Promise<ProductCard[]> {
  return apiFetch<ProductCard[]>(
    `/products/${encodeURIComponent(slug)}/related`,
    fresh,
  );
}

export function getReviews(slug: string, page = 1): Promise<Paged<Review>> {
  return apiFetch<Paged<Review>>(
    `/products/${encodeURIComponent(slug)}/reviews?page=${page}`,
    fresh,
  );
}

/** Shipping thresholds and the store name — `GET /store`. */
export interface StorePublic {
  storeName: string;
  supportEmail: string;
  currency: string;
  flatRateCents: number;
  freeShippingThresholdCents: number;
  internationalShipping: boolean;
}

export function getStore(): Promise<StorePublic> {
  return apiFetch<StorePublic>("/store", fresh);
}

/** "Sand · 32oz", or null for a product without options. */
export function variantLabel(variant: Pick<ProductVariant, "color" | "size">) {
  return [variant.color, variant.size].filter(Boolean).join(" · ") || null;
}
