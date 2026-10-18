"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { OrderDetail, OrderStatus, OrderSummary } from "@/lib/account";
import { apiFetch } from "@/lib/api";
import { useSessionUser } from "@/lib/auth/store";
import { STAFF_ROLES } from "@/lib/auth/api";
import type { ProductImage } from "@/lib/catalog";

/** Mirrors backend/src/admin. Every route there is behind `AdminGuard`. */

export interface DashboardPeriod {
  revenueCents: number;
  orders: number;
  newCustomers: number;
  averageOrderCents: number;
}

export interface Dashboard {
  current: DashboardPeriod;
  previous: DashboardPeriod;
  recentOrders: OrderSummary[];
  topProducts: { name: string; units: number; revenueCents: number }[];
}

export type AdminOrderDetail = OrderDetail & {
  customer: { isGuest: boolean; orderCount: number };
};

export type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";
export type CategoryStatus = "ACTIVE" | "HIDDEN";

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  priceCents: number;
  category: string;
  image: ProductImage | null;
  stock: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  status: ProductStatus;
  priceCents: number;
  compareAtPriceCents: number | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  images: ProductImage[];
  variants: {
    id: string;
    sku: string;
    label: string | null;
    stockQty: number;
  }[];
}

export interface ProductInput {
  name: string;
  description: string;
  categoryId: string;
  status: ProductStatus;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQty?: number;
  variants?: { id: string; stockQty: number }[];
  isFeatured: boolean;
  isNewArrival: boolean;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: CategoryStatus;
  productCount: number;
  children: {
    id: string;
    slug: string;
    name: string;
    status: CategoryStatus;
    productCount: number;
  }[];
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  orders: number;
  totalSpentCents: number;
}

export const CURRENCIES = ["BDT", "USD", "EUR", "GBP"] as const;

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: (typeof CURRENCIES)[number];
  timezone: string;
  flatRateCents: number;
  freeShippingThresholdCents: number;
  internationalShipping: boolean;
  payCards: boolean;
  payGoogle: boolean;
  payApple: boolean;
}

const keys = {
  all: ["admin"] as const,
  dashboard: ["admin", "dashboard"] as const,
  orders: (params: string) => ["admin", "orders", params] as const,
  order: (number: string) => ["admin", "order", number] as const,
  products: (q: string) => ["admin", "products", q] as const,
  product: (id: string) => ["admin", "product", id] as const,
  categories: ["admin", "categories"] as const,
  customers: (q: string) => ["admin", "customers", q] as const,
  settings: ["admin", "settings"] as const,
};

/** True once the session is known to belong to staff. */
export function useIsStaff(): boolean {
  const user = useSessionUser();
  return user !== null && STAFF_ROLES.includes(user.role);
}

function useAdminQuery<T>(
  key: readonly unknown[],
  path: string,
  enabled = true,
) {
  const isStaff = useIsStaff();
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiFetch<T>(path, { signal }),
    enabled: isStaff && enabled,
    // Search and filter changes keep the old rows on screen until the new
    // ones land, instead of flashing a skeleton on every keystroke.
    placeholderData: keepPreviousData,
  });
}

function search(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  ).toString();
  return query ? `?${query}` : "";
}

export function useDashboard() {
  return useAdminQuery<Dashboard>(keys.dashboard, "/admin/dashboard");
}

export function useAdminOrders(q: string, status: OrderStatus | "") {
  const params = search({ q, status });
  return useAdminQuery<OrderSummary[]>(
    keys.orders(params),
    `/admin/orders${params}`,
  );
}

export function useAdminOrder(number: string) {
  return useAdminQuery<AdminOrderDetail>(
    keys.order(number),
    `/admin/orders/${encodeURIComponent(number)}`,
  );
}

export function useSetOrderStatus(number: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) =>
      apiFetch<AdminOrderDetail>(
        `/admin/orders/${encodeURIComponent(number)}`,
        {
          method: "PATCH",
          json: { status },
        },
      ),
    onSuccess: (order) => {
      queryClient.setQueryData(keys.order(number), order);
      // Lists and the dashboard show statuses and revenue too.
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "admin" && query.queryKey[1] !== "order",
      });
    },
  });
}

export function useAdminProducts(q: string) {
  return useAdminQuery<AdminProductRow[]>(
    keys.products(q),
    `/admin/products${search({ q })}`,
  );
}

export function useAdminProduct(id: string | null) {
  return useAdminQuery<AdminProduct>(
    keys.product(id ?? "new"),
    `/admin/products/${id}`,
    id !== null,
  );
}

export function useSaveProduct(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) =>
      id
        ? apiFetch<AdminProduct>(`/admin/products/${id}`, {
            method: "PATCH",
            json: input,
          })
        : apiFetch<AdminProduct>("/admin/products", { json: input }),
    onSuccess: (product) => {
      queryClient.setQueryData(keys.product(product.id), product);
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      void queryClient.invalidateQueries({ queryKey: keys.categories });
    },
  });
}

export function useAdminCategories() {
  return useAdminQuery<AdminCategory[]>(keys.categories, "/admin/categories");
}

/** Every category mutation answers with the whole, fresh tree. */
function useCategoryMutation<TInput>(
  request: (input: TInput) => Promise<AdminCategory[]>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (tree) => queryClient.setQueryData(keys.categories, tree),
  });
}

export function useCreateCategory() {
  return useCategoryMutation(
    (input: {
      name: string;
      description?: string;
      status?: CategoryStatus;
      parentId?: string;
    }) => apiFetch<AdminCategory[]>("/admin/categories", { json: input }),
  );
}

export function useUpdateCategory() {
  return useCategoryMutation(
    ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      status?: CategoryStatus;
    }) =>
      apiFetch<AdminCategory[]>(`/admin/categories/${id}`, {
        method: "PATCH",
        json: input,
      }),
  );
}

export function useDeleteCategory() {
  return useCategoryMutation((id: string) =>
    apiFetch<AdminCategory[]>(`/admin/categories/${id}`, { method: "DELETE" }),
  );
}

export function useAdminCustomers(q: string) {
  return useAdminQuery<AdminCustomer[]>(
    keys.customers(q),
    `/admin/customers${search({ q })}`,
  );
}

export function useStoreSettings() {
  return useAdminQuery<StoreSettings>(keys.settings, "/admin/settings");
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<StoreSettings>) =>
      apiFetch<StoreSettings>("/admin/settings", {
        method: "PATCH",
        json: patch,
      }),
    onSuccess: (settings) => queryClient.setQueryData(keys.settings, settings),
  });
}

export const ORDER_STATUS_OPTIONS = [
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const PRODUCT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
] as const;

/** "+12.4%" against the previous period; null when there is nothing to compare. */
export function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
