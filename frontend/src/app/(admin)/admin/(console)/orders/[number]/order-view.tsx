"use client";

import {
  AdminPageHeader,
  AdminPanel,
  Thumb,
} from "@/components/admin/admin-ui";
import { OrderTimeline } from "@/components/orders/order-detail";
import { FormAlert } from "@/components/ui/form-alert";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, type OrderStatus } from "@/lib/account";
import {
  ORDER_STATUS_OPTIONS,
  useAdminOrder,
  useSetOrderStatus,
} from "@/lib/admin";
import { formatDate, formatPrice } from "@/lib/utils";

const BACK = { href: "/admin/orders", label: "Back to orders" };

export function OrderView({ number }: { number: string }) {
  const { data: order, isPending, error } = useAdminOrder(number);
  const setStatus = useSetOrderStatus(number);

  if (error) {
    return (
      <>
        <AdminPageHeader title={`Order #${number}`} back={BACK} />
        <FormAlert>{error.message}</FormAlert>
      </>
    );
  }
  if (isPending) {
    return (
      <>
        <AdminPageHeader title={`Order #${number}`} back={BACK} />
        <Skeleton className="h-96" />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={`Order #${order.number}`}
        back={BACK}
        subtitle={`Placed ${formatDate(order.placedAt, { month: "long", day: "numeric", year: "numeric" })} by ${order.customerName}`}
        actions={
          <div className="w-52">
            <Select
              label="Status"
              shape="admin"
              value={order.status}
              disabled={setStatus.isPending}
              onChange={(event) =>
                setStatus.mutate(event.target.value as OrderStatus)
              }
              options={ORDER_STATUS_OPTIONS}
            />
          </div>
        }
      />

      {setStatus.error ? (
        <FormAlert className="mb-5">{setStatus.error.message}</FormAlert>
      ) : null}
      <p role="status" className="sr-only">
        {setStatus.isSuccess
          ? `Status set to ${order.status.toLowerCase()}.`
          : ""}
      </p>

      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <AdminPanel>
            <OrderTimeline steps={order.timeline} />
          </AdminPanel>

          <AdminPanel title="Items">
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3.5 py-3.5">
                  <Thumb />
                  <div className="min-w-0 flex-1 text-[13px]">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-muted">
                      {item.variantLabel ? `${item.variantLabel} · ` : ""}Qty{" "}
                      {item.qty} ·{" "}
                      {formatPrice(item.unitPriceCents, order.currency)} each
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(item.lineTotalCents, order.currency)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-2 border-t border-border pt-4 text-sm">
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
              <div className="flex justify-between pt-1 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.totalCents, order.currency)}</dd>
              </div>
            </dl>
          </AdminPanel>
        </div>

        <div className="space-y-5">
          <AdminPanel title="Customer">
            <p className="text-sm font-semibold">{order.customerName}</p>
            <a
              href={`mailto:${order.email}`}
              className="text-sm text-accent-700 hover:text-accent-800"
            >
              {order.email}
            </a>
            <p className="mt-2 text-[13px] text-muted">
              {order.customer.isGuest
                ? "Guest checkout"
                : `${order.customer.orderCount} ${order.customer.orderCount === 1 ? "order" : "orders"} in total`}
            </p>
          </AdminPanel>
          <AdminPanel title="Shipping address">
            <address className="text-sm leading-relaxed text-text-secondary not-italic">
              {formatAddress(order.shippingAddress).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            {order.shipment?.trackingNumber ? (
              <p className="mt-3 border-t border-border pt-3 text-[13px] text-muted">
                {order.shipment.carrier} · {order.shipment.trackingNumber}
              </p>
            ) : null}
          </AdminPanel>
          <AdminPanel title="Payment">
            <p className="text-sm">{order.paymentMethod}</p>
            <p className="mt-1 text-[13px] text-muted">
              No online payment is captured yet — a refund here only records the
              status.
            </p>
          </AdminPanel>
        </div>
      </div>
    </>
  );
}
