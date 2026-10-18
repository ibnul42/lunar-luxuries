import Link from "next/link";
import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatAddress, type OrderDetail } from "@/lib/account";
import { cn, formatDate, formatPrice } from "@/lib/utils";

/**
 * The status timeline. Horizontal from `sm`, a vertical list on phones. The
 * steps are an ordered list, and each says in words whether it is done, so it
 * reads correctly without the visual line.
 */
export function OrderTimeline({ steps }: { steps: OrderDetail["timeline"] }) {
  return (
    <ol className="flex flex-col gap-5 sm:flex-row sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.key}
          className="relative flex items-center gap-4 sm:flex-1 sm:flex-col sm:gap-3 sm:text-center"
        >
          {/* Connector to the next step: down on phones, across from sm. */}
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className={cn(
                "absolute top-10 left-5 h-[calc(100%-1rem)] w-0.5 sm:top-5 sm:left-[calc(50%+1.5rem)] sm:h-0.5 sm:w-[calc(100%-3rem)]",
                steps[index + 1]?.done ? "bg-sage-700" : "bg-border-strong",
              )}
            />
          ) : null}
          <span
            className={cn(
              "relative grid size-10 shrink-0 place-items-center rounded-pill text-sm font-semibold",
              step.done
                ? "bg-sage-700 text-white"
                : "border-2 border-border-strong bg-surface text-muted",
            )}
          >
            {step.done ? (
              <Check size={18} strokeWidth={3} aria-hidden />
            ) : (
              <span aria-hidden>{index + 1}</span>
            )}
          </span>
          <div>
            <p className="text-[15px] font-semibold">
              {step.label}
              <span className="sr-only">
                {step.done ? " — done" : " — not yet"}
              </span>
            </p>
            <p className="text-[13px] text-muted">
              {step.at && step.done ? formatDate(step.at) : "Pending"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const estimate =
    order.status === "SHIPPED" && order.shipment?.shippedAt
      ? new Date(new Date(order.shipment.shippedAt).getTime() + 4 * 86_400_000)
      : null;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[30px] leading-tight sm:text-h2">
            Order #{order.number}
          </h1>
          <StatusPill status={order.status} />
        </div>
        <p className="text-[15px] text-muted">
          Placed{" "}
          {formatDate(order.placedAt, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {estimate
            ? ` · Arriving around ${formatDate(estimate, { month: "long", day: "numeric" })}`
            : ""}
        </p>
      </div>

      <Card elevation="panel" className="p-6 sm:p-8">
        <h2 className="sr-only">Progress</h2>
        <OrderTimeline steps={order.timeline} />
        {order.shipment?.trackingNumber ? (
          <p className="mt-6 border-t border-border pt-5 text-sm text-muted">
            {order.shipment.carrier ? `${order.shipment.carrier} · ` : ""}
            Tracking number{" "}
            <span className="font-semibold text-text">
              {order.shipment.trackingNumber}
            </span>
          </p>
        ) : null}
      </Card>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        <Card elevation="panel" className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl">Items</h2>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  {item.slug ? (
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold text-text hover:text-accent-700"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-semibold">{item.name}</p>
                  )}
                  <p className="text-[13px] text-muted">
                    {item.variantLabel ? `${item.variantLabel} · ` : ""}Qty{" "}
                    {item.qty}
                  </p>
                </div>
                <p className="shrink-0 font-semibold">
                  {formatPrice(item.lineTotalCents, order.currency)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-border pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotalCents, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>
                {order.shippingCents === 0
                  ? "Free"
                  : formatPrice(order.shippingCents, order.currency)}
              </dd>
            </div>
            {order.taxCents > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted">Tax</dt>
                <dd>{formatPrice(order.taxCents, order.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between pt-2 text-[17px] font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalCents, order.currency)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card elevation="panel" className="p-6 sm:p-7">
            <h2 className="mb-3 font-display text-lg">Shipping to</h2>
            <address className="text-[15px] leading-relaxed text-text-secondary not-italic">
              {formatAddress(order.shippingAddress).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </Card>
          <Card elevation="panel" className="p-6 sm:p-7">
            <h2 className="mb-3 font-display text-lg">Payment</h2>
            <p className="text-[15px] text-text-secondary">
              {order.paymentMethod}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
