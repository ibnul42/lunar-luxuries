"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleX, Heart } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { FormAlert } from "@/components/ui/form-alert";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useAddToCart } from "@/lib/cart";
import type { ProductCard, ProductDetail } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useToggleWishlist } from "@/lib/wishlist";

const unique = <T,>(values: (T | null)[]) => [
  ...new Set(values.filter((v): v is T => v !== null)),
];

/**
 * Option pickers, quantity and the two actions. Colour and size are picked
 * independently and resolved to a variant; a combination that is sold out is
 * shown struck through rather than hidden, so the grid never jumps.
 */
export function ProductPurchase({
  product,
  card,
}: {
  product: ProductDetail;
  /** The tile shape, for the optimistic wishlist entry. */
  card: ProductCard;
}) {
  const { variants } = product;
  const colors = unique(variants.map((v) => v.color));
  const sizes = unique(variants.map((v) => v.size));

  // Start on the first variant that can actually be bought.
  const initial = variants.find((v) => v.inStock) ?? variants[0];
  const [color, setColor] = useState(initial?.color ?? null);
  const [size, setSize] = useState(initial?.size ?? null);
  const [requestedQty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => variants.find((v) => v.color === color && v.size === size) ?? null,
    [variants, color, size],
  );
  const maxQty = Math.max(1, variant?.maxQty ?? 1);
  const canBuy = Boolean(variant?.inStock);

  const addToCart = useAddToCart();
  const wishlist = useToggleWishlist();
  const saved = wishlist.isSaved(product.id);

  // A new pick can't keep a quantity its stock doesn't cover.
  const qty = Math.min(requestedQty, maxQty);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  const colorChoices = colors.map((value) => ({
    value,
    label: value,
    color: variants.find((v) => v.color === value)?.colorHex,
    disabled: !variants.some((v) => v.color === value && v.inStock),
  }));
  const sizeChoices = sizes.map((value) => ({
    value,
    label: value,
    disabled: !variants.some(
      (v) =>
        v.size === value && (color === null || v.color === color) && v.inStock,
    ),
  }));

  return (
    <div className="space-y-7">
      {colors.length > 0 ? (
        <ChoiceGroup
          legend={
            <>
              {product.colorLabel ?? "Colour"} —{" "}
              <span className="font-normal text-muted">{color}</span>
            </>
          }
          name="color"
          variant="swatch"
          choices={colorChoices}
          value={color ?? ""}
          onChange={setColor}
        />
      ) : null}

      {sizes.length > 0 ? (
        <ChoiceGroup
          legend="Size"
          name="size"
          choices={sizeChoices}
          value={size ?? ""}
          onChange={setSize}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={qty}
          onChange={setQty}
          max={maxQty}
          label={`Quantity of ${product.name}`}
          disabled={!canBuy}
        />
        <Button
          className="min-w-44 flex-1 sm:flex-none"
          disabled={!canBuy || addToCart.isPending}
          onClick={() => {
            if (!variant) return;
            addToCart.mutate(
              { variantId: variant.id, qty },
              { onSuccess: () => setAdded(true) },
            );
          }}
        >
          {!canBuy
            ? "Sold out"
            : addToCart.isPending
              ? "Adding…"
              : added
                ? "Added ✓"
                : "Add to cart"}
        </Button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => wishlist.toggle(card)}
          className={cn(
            buttonClasses({ variant: "secondary", size: "icon" }),
            "size-control",
            saved && "border-accent-500 bg-accent-100",
          )}
        >
          <Heart
            size={20}
            strokeWidth={2.75}
            aria-hidden
            className={saved ? "fill-accent-500 text-accent-500" : undefined}
          />
        </button>
      </div>

      {/* Announced politely: the button label alone changes too quietly. */}
      <p role="status" className="sr-only">
        {added ? `Added ${qty} to your cart.` : ""}
      </p>

      {addToCart.error ? (
        <FormAlert>{addToCart.error.message}</FormAlert>
      ) : null}

      {added ? (
        <p className="text-sm">
          <Link
            href="/cart"
            className="font-semibold text-accent-700 hover:text-accent-800"
          >
            View cart →
          </Link>
        </p>
      ) : null}

      <p className="flex items-center gap-2 text-sm text-text-secondary">
        {canBuy ? (
          <>
            <CircleCheck
              size={18}
              strokeWidth={2.5}
              aria-hidden
              className="text-sage-700"
            />
            In stock — ships within 2 business days
          </>
        ) : (
          <>
            <CircleX
              size={18}
              strokeWidth={2.5}
              aria-hidden
              className="text-accent-700"
            />
            {variant
              ? "This option is sold out"
              : "That combination isn't made"}
          </>
        )}
      </p>
    </div>
  );
}
