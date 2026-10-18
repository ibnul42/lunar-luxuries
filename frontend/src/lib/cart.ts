"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { ProductImage } from "@/lib/catalog";

/** Mirrors `CartView` in backend/src/cart/cart.service.ts. */
export interface CartLine {
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string | null;
  image: ProductImage | null;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
  maxQty: number;
  available: boolean;
}

export interface Cart {
  items: CartLine[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingThresholdCents: number;
  currency: string;
}

export const cartQueryKey = ["cart"] as const;

/**
 * The cart lives on the server — a guest's behind the API's `ll_cart` cookie,
 * a member's on the account — so every mutation answers with the whole,
 * re-priced cart and that answer replaces the cache. No totals are computed
 * here (README §8: the client never prices anything).
 */
export function useCart() {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: ({ signal }) => apiFetch<Cart>("/cart", { signal }),
    staleTime: 30 * 1000,
  });
}

function useCartMutation<TInput>(request: (input: TInput) => Promise<Cart>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}

export function useAddToCart() {
  return useCartMutation((input: { variantId: string; qty: number }) =>
    apiFetch<Cart>("/cart/items", { json: input }),
  );
}

export function useUpdateCartLine() {
  return useCartMutation((input: { id: string; qty: number }) =>
    apiFetch<Cart>(`/cart/items/${input.id}`, {
      method: "PATCH",
      json: { qty: input.qty },
    }),
  );
}

export function useRemoveCartLine() {
  return useCartMutation((id: string) =>
    apiFetch<Cart>(`/cart/items/${id}`, { method: "DELETE" }),
  );
}
