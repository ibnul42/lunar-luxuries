"use client";

import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormAlert } from "@/components/ui/form-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useMyOrders } from "@/lib/account";
import { formatDate, formatPrice } from "@/lib/utils";

export function OrdersPanel() {
  const { data, isPending, error } = useMyOrders();

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-22" />
        <Skeleton className="h-22" />
        <Skeleton className="h-22" />
      </div>
    );
  }
  if (error) return <FormAlert>{error.message}</FormAlert>;

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        action={
          <Link href="/shop" className={buttonClasses()}>
            Start shopping
          </Link>
        }
      >
        When you place an order, it&rsquo;ll appear here with its tracking.
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((order) => (
        <li key={order.id}>
          <Link
            href={`/orders/${order.number}`}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-card bg-surface px-5 py-5 shadow-panel transition-colors hover:bg-accent-100/40 sm:grid-cols-[1fr_auto_auto_auto] sm:px-6"
          >
            <div>
              <p className="font-semibold">Order #{order.number}</p>
              <p className="text-[13px] text-muted">
                Placed {formatDate(order.placedAt)} · {order.itemCount}{" "}
                {order.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
            <StatusPill
              status={order.status}
              className="justify-self-end sm:justify-self-auto"
            />
            <p className="font-semibold sm:w-28 sm:text-right">
              {formatPrice(order.totalCents, order.currency)}
            </p>
            <ChevronRight
              size={18}
              strokeWidth={2.75}
              aria-hidden
              className="hidden text-muted sm:block"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
