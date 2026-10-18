"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";

import {
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminTable,
} from "@/components/admin/admin-ui";
import { FormAlert } from "@/components/ui/form-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCustomers } from "@/lib/admin";
import { formatDate, formatPrice } from "@/lib/utils";

export function CustomersView() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const { data, isPending, error, isFetching } =
    useAdminCustomers(deferredQuery);

  return (
    <>
      <AdminPageHeader
        title="Customers"
        subtitle={
          data
            ? `${data.length} ${data.length === 1 ? "customer" : "customers"}`
            : " "
        }
      />

      <AdminPanel>
        <div className="mb-5">
          <AdminSearch
            label="Search customers"
            value={query}
            onChange={setQuery}
            placeholder="Name or email"
          />
        </div>

        {error ? (
          <FormAlert>{error.message}</FormAlert>
        ) : isPending ? (
          <Skeleton className="h-96" />
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No customers match.
          </p>
        ) : (
          <div aria-busy={isFetching}>
            <AdminTable
              label="Customers"
              head={["Customer", "Orders", "Total spent", "Joined"]}
            >
              {data.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className="block font-semibold">{customer.name}</span>
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-muted hover:text-accent-700"
                    >
                      {customer.email}
                    </a>
                  </td>
                  <td className="tabular-nums">
                    {customer.orders > 0 ? (
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                        className="font-semibold text-accent-700 hover:text-accent-800"
                      >
                        {customer.orders}
                        <span className="sr-only">
                          {" "}
                          orders by {customer.name}
                        </span>
                      </Link>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="whitespace-nowrap">
                    {formatPrice(customer.totalSpentCents)}
                  </td>
                  <td className="whitespace-nowrap">
                    {formatDate(customer.joinedAt, {
                      month: "short",
                      year: "numeric",
                    })}
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
