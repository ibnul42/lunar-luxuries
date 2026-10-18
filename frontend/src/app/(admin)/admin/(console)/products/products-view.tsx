"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminTable,
  Thumb,
} from "@/components/admin/admin-ui";
import { buttonClasses } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useAdminProducts } from "@/lib/admin";
import { cn, formatPrice } from "@/lib/utils";

export function ProductsView() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const { data, isPending, error, isFetching } =
    useAdminProducts(deferredQuery);

  return (
    <>
      <AdminPageHeader
        title="Products"
        subtitle={
          data
            ? `${data.length} ${data.length === 1 ? "product" : "products"}`
            : " "
        }
        actions={
          <Link
            href="/admin/products/new"
            className={buttonClasses({ size: "admin" })}
          >
            <Plus size={16} strokeWidth={2.75} aria-hidden />
            Add product
          </Link>
        }
      />

      <AdminPanel>
        <div className="mb-5">
          <AdminSearch
            label="Search products"
            value={query}
            onChange={setQuery}
            placeholder="Product or category"
          />
        </div>

        {error ? (
          <FormAlert>{error.message}</FormAlert>
        ) : isPending ? (
          <Skeleton className="h-96" />
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No products match.
          </p>
        ) : (
          <div aria-busy={isFetching}>
            <AdminTable
              label="Products"
              head={["Product", "Category", "Price", "Stock", "Status"]}
            >
              {data.map((product) => (
                <tr key={product.id} className="hover:bg-accent-100/30">
                  <td>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3 font-semibold text-text hover:text-accent-700"
                    >
                      <Thumb src={product.image?.url} />
                      {product.name}
                    </Link>
                  </td>
                  <td>{product.category}</td>
                  <td className="whitespace-nowrap">
                    {formatPrice(product.priceCents)}
                  </td>
                  <td
                    className={cn(
                      "tabular-nums",
                      product.stock === 0 && "font-semibold text-accent-700",
                    )}
                  >
                    {product.stock}
                  </td>
                  <td>
                    <StatusPill status={product.status} />
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
