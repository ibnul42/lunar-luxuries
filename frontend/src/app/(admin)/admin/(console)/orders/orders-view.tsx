"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminTable,
} from "@/components/admin/admin-ui";
import { FormAlert } from "@/components/ui/form-alert";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import type { OrderStatus } from "@/lib/account";
import { ORDER_STATUS_OPTIONS, useAdminOrders } from "@/lib/admin";
import { formatDate, formatPrice } from "@/lib/utils";

export function OrdersView() {
  // Customers links here as `?q=<email>` to list one customer's orders.
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<OrderStatus | "">("");
  // Typing stays responsive; the request follows the settled value.
  const deferredQuery = useDeferredValue(query.trim());
  const { data, isPending, error, isFetching } = useAdminOrders(
    deferredQuery,
    status,
  );

  return (
    <>
      <AdminPageHeader
        title="Orders"
        subtitle={
          data
            ? `${data.length} ${data.length === 1 ? "order" : "orders"}`
            : " "
        }
      />

      <AdminPanel>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <AdminSearch
            label="Search orders"
            value={query}
            onChange={setQuery}
            placeholder="Order # or customer"
          />
          <div className="sm:w-52">
            <Select
              label="Status"
              hideLabel
              shape="admin"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as OrderStatus | "")
              }
              options={[
                { value: "", label: "All statuses" },
                ...ORDER_STATUS_OPTIONS,
              ]}
            />
          </div>
        </div>

        {error ? (
          <FormAlert>{error.message}</FormAlert>
        ) : isPending ? (
          <Skeleton className="h-96" />
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No orders match.
          </p>
        ) : (
          <div aria-busy={isFetching}>
            <AdminTable
              label="Orders"
              head={["Order", "Customer", "Date", "Status", "Total"]}
            >
              {data.map((order) => (
                <tr key={order.id} className="hover:bg-accent-100/30">
                  <td>
                    <Link
                      href={`/admin/orders/${order.number}`}
                      className="font-semibold text-accent-700 hover:text-accent-800"
                    >
                      #{order.number}
                    </Link>
                  </td>
                  <td>
                    {order.customerName}
                    <span className="block text-muted">{order.email}</span>
                  </td>
                  <td className="whitespace-nowrap">
                    {formatDate(order.placedAt)}
                  </td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                  <td className="font-semibold whitespace-nowrap">
                    {formatPrice(order.totalCents, order.currency)}
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>
        )}
      </AdminPanel>
    </>
  );
}
