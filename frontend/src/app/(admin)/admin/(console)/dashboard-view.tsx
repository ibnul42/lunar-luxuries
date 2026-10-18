"use client";

import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  AdminPageHeader,
  AdminPanel,
  Thumb,
} from "@/components/admin/admin-ui";
import { FormAlert } from "@/components/ui/form-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { delta, useDashboard } from "@/lib/admin";
import { cn, formatDate, formatPrice } from "@/lib/utils";

function Delta({ current, previous }: { current: number; previous: number }) {
  const value = delta(current, previous);
  if (value === null) {
    return <p className="text-[13px] text-muted">New this period</p>;
  }
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-[13px]",
        up ? "text-sage-700" : "text-accent-700",
      )}
    >
      <Icon size={15} strokeWidth={2.5} aria-hidden />
      {up ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
      <span className="text-muted"> vs. previous 30 days</span>
    </p>
  );
}

export function DashboardView() {
  const { data, isPending, error } = useDashboard();
  const today = formatDate(new Date(), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (error) return <FormAlert>{error.message}</FormAlert>;

  const tiles = data
    ? [
        {
          label: "Revenue (30d)",
          value: formatPrice(data.current.revenueCents),
          current: data.current.revenueCents,
          previous: data.previous.revenueCents,
        },
        {
          label: "Orders (30d)",
          value: String(data.current.orders),
          current: data.current.orders,
          previous: data.previous.orders,
        },
        {
          label: "New customers",
          value: String(data.current.newCustomers),
          current: data.current.newCustomers,
          previous: data.previous.newCustomers,
        },
        {
          label: "Average order value",
          value: formatPrice(data.current.averageOrderCents),
          current: data.current.averageOrderCents,
          previous: data.previous.averageOrderCents,
        },
      ]
    : [];

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle={today} />

      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isPending
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
          : tiles.map((tile) => (
              <AdminPanel key={tile.label}>
                <p className="mb-2 text-[13px] font-semibold text-muted">
                  {tile.label}
                </p>
                <p className="mb-2 font-display text-[28px] leading-none">
                  {tile.value}
                </p>
                <Delta current={tile.current} previous={tile.previous} />
              </AdminPanel>
            ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
        <AdminPanel
          title="Recent orders"
          action={
            <Link
              href="/admin/orders"
              className="text-[13px] font-semibold text-accent-700 hover:text-accent-800"
            >
              View all
            </Link>
          }
        >
          {isPending ? (
            <Skeleton className="h-60" />
          ) : (
            <ul className="divide-y divide-border">
              {data.recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.number}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 py-3.5 text-[13px] hover:bg-accent-100/40 sm:grid-cols-[72px_1fr_auto_100px]"
                  >
                    <span className="font-semibold">#{order.number}</span>
                    <span className="truncate">
                      {order.customerName}
                      <span className="block text-muted sm:hidden">
                        {formatDate(order.placedAt)}
                      </span>
                    </span>
                    <StatusPill status={order.status} />
                    <span className="col-span-3 text-right font-semibold sm:col-span-1">
                      {formatPrice(order.totalCents, order.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Top products">
          {isPending ? (
            <Skeleton className="h-60" />
          ) : data.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No sales in the last 30 days.</p>
          ) : (
            <ul className="space-y-4">
              {data.topProducts.map((product) => (
                <li key={product.name} className="flex items-center gap-3.5">
                  <Thumb />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="text-[13px] text-muted">
                      {product.units} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(product.revenueCents)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </>
  );
}
