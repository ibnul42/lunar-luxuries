"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs } from "@/components/ui/tabs";
import {
  getReviews,
  type Paged,
  type ProductDetail,
  type Review,
} from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/utils";

function ReviewsPanel({
  product,
  firstPage,
}: {
  product: ProductDetail;
  firstPage: Paged<Review>;
}) {
  const { rating } = product;
  const reviews = useInfiniteQuery({
    queryKey: ["reviews", product.slug],
    queryFn: ({ pageParam }) => getReviews(product.slug, pageParam),
    initialPageParam: 1,
    initialData: { pages: [firstPage], pageParams: [1] },
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });
  const items = reviews.data.pages.flatMap((page) => page.items);

  if (rating.count === 0) {
    return <p className="text-[15px] text-muted">No reviews yet.</p>;
  }

  return (
    <div
      id="reviews"
      className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16"
    >
      <div className="space-y-3">
        <p className="font-display text-[52px] leading-none">
          {rating.average?.toFixed(1)}
        </p>
        <StarRating value={rating.average ?? 0} size={18} />
        <p className="text-sm text-muted">Based on {rating.count} reviews</p>
        <dl className="space-y-2.5 pt-4">
          {rating.histogram.map((bar) => {
            const pct = Math.round((bar.count / rating.count) * 100);
            return (
              <div
                key={bar.stars}
                className="flex items-center gap-3 text-[13px]"
              >
                <dt className="w-14 shrink-0 text-muted">{bar.stars} star</dt>
                <dd className="flex flex-1 items-center gap-3">
                  <span className="h-2 flex-1 overflow-hidden rounded-pill bg-input">
                    <span
                      className="block h-full rounded-pill bg-accent-500"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-muted tabular-nums">
                    {bar.count}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div>
        <ul className="divide-y divide-border">
          {items.map((review) => (
            <li key={review.id} className="py-6 first:pt-0">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-[15px] font-semibold">
                    {review.authorName}
                  </p>
                  <StarRating value={review.rating} size={14} />
                </div>
                <time
                  dateTime={review.createdAt}
                  className="shrink-0 text-[13px] text-muted"
                >
                  {formatDate(review.createdAt, {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              <p className="text-[15px] leading-relaxed text-text-secondary">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
        {reviews.hasNextPage ? (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            disabled={reviews.isFetchingNextPage}
            onClick={() => void reviews.fetchNextPage()}
          >
            {reviews.isFetchingNextPage ? "Loading…" : "Show more reviews"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ProductTabs({
  product,
  firstReviews,
  freeShippingThresholdCents,
}: {
  product: ProductDetail;
  firstReviews: Paged<Review>;
  freeShippingThresholdCents: number;
}) {
  const [tab, setTab] = useState("description");
  const paragraphs = product.description.split(/\n{2,}/);

  return (
    <Tabs
      label="Product information"
      value={tab}
      onChange={setTab}
      panelClassName="max-w-4xl"
      tabs={[
        {
          id: "description",
          label: "Description",
          content: (
            <div className="max-w-2xl space-y-4 text-[16px] leading-relaxed text-text-secondary">
              {paragraphs.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          ),
        },
        {
          id: "details",
          label: "Details",
          content:
            product.specs.length > 0 ? (
              <dl className="grid max-w-3xl gap-x-12 sm:grid-cols-2">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between gap-6 border-b border-border py-3.5 text-[15px]"
                  >
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="text-right font-semibold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-[15px] text-muted">No additional details.</p>
            ),
        },
        {
          id: "shipping",
          label: "Shipping & Returns",
          content: (
            <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-display text-lg">Shipping</h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  Orders ship within 2 business days. Standard delivery takes
                  3–7 business days. Free on orders over{" "}
                  {formatPrice(freeShippingThresholdCents)}.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-lg">Returns</h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  Unused items in original packaging can be returned within 30
                  days for a full refund. Contact us and we&rsquo;ll arrange the
                  collection.
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "reviews",
          label: `Reviews (${product.rating.count})`,
          content: <ReviewsPanel product={product} firstPage={firstReviews} />,
        },
      ]}
    />
  );
}
