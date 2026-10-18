"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { ProductGrid, ProductTile } from "@/components/catalog/product-tile";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionStatus } from "@/lib/auth/store";
import { useAddToCart } from "@/lib/cart";
import type { ProductCard } from "@/lib/catalog";
import { useToggleWishlist, useWishlist } from "@/lib/wishlist";

function Actions({ product }: { product: ProductCard }) {
  const wishlist = useToggleWishlist();
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {!product.inStock ? (
        <Button size="sm" variant="secondary" disabled>
          Sold out
        </Button>
      ) : product.quickAddVariantId ? (
        <Button
          size="sm"
          disabled={addToCart.isPending}
          onClick={() =>
            addToCart.mutate(
              { variantId: product.quickAddVariantId!, qty: 1 },
              {
                onSuccess: () => {
                  setAdded(true);
                  // "Move to cart": once it is in the bag it leaves the list.
                  wishlist.toggle(product);
                },
              },
            )
          }
        >
          {added ? "Added ✓" : "Move to cart"}
        </Button>
      ) : (
        <Link
          href={`/products/${product.slug}`}
          className={buttonClasses({ size: "sm" })}
        >
          Choose options
        </Link>
      )}
      <button
        type="button"
        onClick={() => wishlist.toggle(product)}
        className="self-center text-[13px] font-semibold text-muted underline-offset-4 hover:text-accent-700 hover:underline"
      >
        Remove<span className="sr-only"> {product.name} from wishlist</span>
      </button>
      {addToCart.error ? (
        <p role="alert" className="text-[13px] text-danger">
          {addToCart.error.message}
        </p>
      ) : null}
    </div>
  );
}

export function WishlistView() {
  const status = useSessionStatus();
  const { data, isPending } = useWishlist();

  if (status === "anonymous") {
    return (
      <EmptyState
        icon={Heart}
        title="Sign in to see your wishlist"
        action={
          <Link href="/login?next=/wishlist" className={buttonClasses()}>
            Sign in
          </Link>
        }
      >
        Save the pieces you&rsquo;re considering, and find them again on any
        device.
      </EmptyState>
    );
  }

  if (status === "loading" || isPending) {
    return (
      <ProductGrid>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-4/5" />
        ))}
      </ProductGrid>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        action={
          <Link href="/shop" className={buttonClasses()}>
            Shop all
          </Link>
        }
      >
        Save the pieces you&rsquo;re considering so they&rsquo;re easy to find
        later.
      </EmptyState>
    );
  }

  return (
    <ProductGrid>
      {data.map((product) => (
        <ProductTile
          key={product.id}
          product={product}
          actions={<Actions product={product} />}
        />
      ))}
    </ProductGrid>
  );
}
