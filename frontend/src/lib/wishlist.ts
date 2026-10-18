"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { useSessionStatus } from "@/lib/auth/store";
import type { ProductCard } from "@/lib/catalog";

export const wishlistQueryKey = ["wishlist"] as const;

/** Members only. Signed out (or still loading), it is simply not fetched. */
export function useWishlist() {
  const status = useSessionStatus();
  return useQuery({
    queryKey: wishlistQueryKey,
    queryFn: ({ signal }) => apiFetch<ProductCard[]>("/wishlist", { signal }),
    enabled: status === "authenticated",
  });
}

/**
 * Save / unsave one product. Optimistic, so the heart fills on the press, and
 * rolled back if the API refuses. Signed out, it sends the visitor to sign in
 * and come back — the roadmap's default for guest hearts.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const status = useSessionStatus();
  const { data } = useWishlist();

  const mutation = useMutation({
    mutationFn: async ({
      product,
      saved,
    }: {
      product: ProductCard;
      saved: boolean;
    }) => {
      await apiFetch<void>(`/wishlist/${product.id}`, {
        method: saved ? "DELETE" : "PUT",
      });
    },
    onMutate: async ({ product, saved }) => {
      await queryClient.cancelQueries({ queryKey: wishlistQueryKey });
      const previous =
        queryClient.getQueryData<ProductCard[]>(wishlistQueryKey);
      queryClient.setQueryData<ProductCard[]>(wishlistQueryKey, (list = []) =>
        saved ? list.filter((p) => p.id !== product.id) : [product, ...list],
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(wishlistQueryKey, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });

  return {
    isSaved: (productId: string) =>
      data?.some((p) => p.id === productId) ?? false,
    toggle: (product: ProductCard) => {
      if (status !== "authenticated") {
        router.push(
          `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
        return;
      }
      const saved = data?.some((p) => p.id === product.id) ?? false;
      mutation.mutate({ product, saved });
    },
    isPending: mutation.isPending,
  };
}
