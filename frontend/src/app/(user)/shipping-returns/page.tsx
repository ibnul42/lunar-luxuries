import Link from "next/link";

import { PolicyPage } from "@/components/marketing/policy-page";
import { getStore, type StorePublic } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Shipping & Returns",
  description: "Processing times, delivery estimates, returns and exchanges.",
};

/** The shipping figures come from Admin → Settings, so the page can't drift. */
export const dynamic = "force-dynamic";

export default async function ShippingReturnsPage() {
  const store: StorePublic = await getStore();

  return (
    <PolicyPage
      kicker="Help center"
      title="Shipping & returns"
      sections={[
        {
          title: "Processing time",
          body: (
            <p>
              Orders are packed and shipped within 2 business days. You can
              follow each one from{" "}
              <Link href="/account?tab=orders">your account</Link> or with{" "}
              <Link href="/orders/track">Track an order</Link> as soon as it
              leaves the studio.
            </p>
          ),
        },
        {
          title: "Delivery estimates",
          body: (
            <p>
              Standard delivery takes 3–7 business days and is free on orders
              over {formatPrice(store.freeShippingThresholdCents)} (
              {formatPrice(store.flatRateCents)} flat rate otherwise).
              {store.internationalShipping
                ? " International shipping is available, priced by destination."
                : " We don't ship internationally at the moment."}
            </p>
          ),
        },
        {
          title: "Returns",
          body: (
            <p>
              Unused items in their original packaging can be returned within 30
              days of delivery for a full refund. Sale items and gift cards are
              final sale. <Link href="/contact">Contact us</Link> to start a
              return and we&rsquo;ll arrange the collection.
            </p>
          ),
        },
        {
          title: "Exchanges",
          body: (
            <p>
              Need a different size or colour? Return the original for a refund
              and place a new order — it&rsquo;s faster than a swap and means
              you&rsquo;re not waiting on stock.
            </p>
          ),
        },
        {
          title: "Damaged or incorrect items",
          body: (
            <p>
              If something arrives damaged or isn&rsquo;t what you ordered,
              reach out within 7 days with a photo and we&rsquo;ll send a
              replacement or refund right away, no return required.
            </p>
          ),
        },
      ]}
    />
  );
}
