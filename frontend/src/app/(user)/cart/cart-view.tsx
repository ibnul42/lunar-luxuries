"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, Truck } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormAlert } from "@/components/ui/form-alert";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { WashedImage } from "@/components/ui/washed-image";
import {
  type CartLine,
  useCart,
  useRemoveCartLine,
  useUpdateCartLine,
} from "@/lib/cart";
import { SITE } from "@/lib/site";
import { cn, formatPrice } from "@/lib/utils";

function Line({ line }: { line: CartLine }) {
  const update = useUpdateCartLine();
  const remove = useRemoveCartLine();
  const busy = update.isPending || remove.isPending;

  return (
    <li
      className={cn(
        "grid grid-cols-[88px_1fr] gap-4 py-6 sm:grid-cols-[112px_1fr_auto] sm:gap-6",
        busy && "opacity-60",
      )}
    >
      <Link href={`/products/${line.slug}`} tabIndex={-1} aria-hidden>
        <WashedImage
          src={line.image?.url}
          alt=""
          sizes="112px"
          className="aspect-4/5 rounded-thumb"
        />
      </Link>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Link
          href={`/products/${line.slug}`}
          className="font-display text-[17px] leading-snug text-text hover:text-accent-700"
        >
          {line.name}
        </Link>
        {line.variantLabel ? (
          <p className="text-[13px] text-muted">{line.variantLabel}</p>
        ) : null}
        <p className="text-[13px] text-muted">
          {formatPrice(line.unitPriceCents)} each
        </p>

        {line.available ? (
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <QuantityStepper
              size="sm"
              value={line.qty}
              max={line.maxQty}
              label={`Quantity of ${line.name}`}
              disabled={busy}
              onChange={(qty) => update.mutate({ id: line.id, qty })}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => remove.mutate(line.id)}
              className="text-[13px] font-semibold text-muted underline-offset-4 hover:text-accent-700 hover:underline"
            >
              Remove<span className="sr-only"> {line.name}</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <p className="text-[13px] font-semibold text-accent-700">
              No longer available — not included in your total.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => remove.mutate(line.id)}
              className="text-[13px] font-semibold text-muted underline-offset-4 hover:text-accent-700 hover:underline"
            >
              Remove<span className="sr-only"> {line.name}</span>
            </button>
          </div>
        )}

        {update.error || remove.error ? (
          <p role="alert" className="text-[13px] text-danger">
            {(update.error ?? remove.error)?.message}
          </p>
        ) : null}
      </div>

      <p className="col-start-2 text-[15px] font-semibold sm:col-start-auto sm:text-right">
        {line.available ? formatPrice(line.lineTotalCents) : "—"}
      </p>
    </li>
  );
}

export function CartView() {
  const { data: cart, isPending, error, refetch } = useCart();

  if (isPending) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <FormAlert>{error.message}</FormAlert>
        <Button variant="secondary" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        action={
          <Link href="/shop" className={buttonClasses()}>
            Shop all
          </Link>
        }
      >
        Nothing here yet. Find something you&rsquo;ll love living with.
      </EmptyState>
    );
  }

  const toFree = cart.freeShippingThresholdCents - cart.subtotalCents;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <div>
        <ul className="divide-y divide-border border-y border-border">
          {cart.items.map((line) => (
            <Line key={line.id} line={line} />
          ))}
        </ul>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-800"
        >
          <ArrowLeft size={16} strokeWidth={2.75} aria-hidden />
          Continue shopping
        </Link>
      </div>

      <Card
        elevation="panel"
        className="p-7 lg:sticky lg:top-[calc(var(--spacing-header)+24px)] lg:p-8"
      >
        <h2 className="mb-6 font-display text-xl">Order summary</h2>

        {toFree > 0 ? (
          <p className="mb-6 flex items-start gap-2.5 rounded-card bg-sage-100 px-4 py-3 text-[13px] text-sage-800">
            <Truck
              size={18}
              strokeWidth={2.5}
              aria-hidden
              className="shrink-0"
            />
            Add {formatPrice(toFree)} more for free shipping.
          </p>
        ) : null}

        <dl className="space-y-3 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatPrice(cart.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>
              {cart.shippingCents === 0
                ? "Free"
                : formatPrice(cart.shippingCents)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-4 text-[17px] font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(cart.totalCents)}</dd>
          </div>
        </dl>

        {/* Checkout waits on the payment provider decision (README §10 q1). */}
        <Button
          className="mt-7 w-full"
          disabled
          aria-describedby="checkout-note"
        >
          Proceed to checkout
        </Button>
        <p
          id="checkout-note"
          className="mt-3 text-center text-[13px] text-muted"
        >
          Online checkout is coming soon. To order now, email{" "}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="font-semibold text-accent-700 hover:text-accent-800"
          >
            {SITE.supportEmail}
          </a>
          .
        </p>
        <p className="mt-5 border-t border-border pt-5 text-center text-[13px] text-muted">
          Free returns within 30 days.
        </p>
      </Card>
    </div>
  );
}
