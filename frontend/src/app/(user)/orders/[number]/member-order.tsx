"use client";

import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

import { OrderDetailView } from "@/components/orders/order-detail";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrder } from "@/lib/account";
import { useRequireSession } from "@/lib/use-require-session";

/**
 * A signed-in customer's own order. The API looks it up by number *and* the
 * session's user id, so another customer's number answers 404, never their
 * order (README §8).
 */
export function MemberOrder({ number }: { number: string }) {
  const status = useRequireSession();
  const { data, isPending, error } = useMyOrder(number);

  return (
    <>
      <Link
        href="/account?tab=orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-800"
      >
        <ArrowLeft size={16} strokeWidth={2.75} aria-hidden />
        Back to orders
      </Link>

      {status !== "authenticated" || isPending ? (
        <div className="space-y-6">
          <Skeleton className="h-14 w-72" />
          <Skeleton className="h-36" />
          <Skeleton className="h-64" />
        </div>
      ) : error ? (
        <EmptyState
          icon={PackageX}
          title="We couldn't find that order"
          action={
            <Link href="/orders/track" className={buttonClasses()}>
              Track an order
            </Link>
          }
        >
          It may have been placed with a different account. You can still look
          it up with its number and email.
        </EmptyState>
      ) : (
        <OrderDetailView order={data} />
      )}
    </>
  );
}
