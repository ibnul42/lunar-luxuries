import { cn, formatPrice } from "@/lib/utils";

export interface PriceProps {
  cents: number;
  compareAtCents?: number | null;
  size?: "sm" | "lg";
  className?: string;
}

/** A price, plus the struck-through "was" price when it is on sale. */
export function Price({
  cents,
  compareAtCents,
  size = "sm",
  className,
}: PriceProps) {
  const onSale = compareAtCents != null && compareAtCents > cents;

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2.5",
        className,
      )}
    >
      <span
        className={cn(
          size === "lg"
            ? "font-display text-[28px] leading-none text-text"
            : "text-sm text-text-secondary",
          onSale && size === "sm" && "font-semibold text-accent-700",
        )}
      >
        {onSale ? <span className="sr-only">Now </span> : null}
        {formatPrice(cents)}
      </span>
      {onSale ? (
        <s
          className={cn(
            "text-muted",
            size === "lg" ? "text-lg" : "text-[13px]",
          )}
        >
          <span className="sr-only">Was </span>
          {formatPrice(compareAtCents)}
        </s>
      ) : null}
    </span>
  );
}

/** "Save 20%" — whole percent, rounded down so it never overstates. */
export function savingsPercent(cents: number, compareAtCents: number | null) {
  if (compareAtCents == null || compareAtCents <= cents) return null;
  return Math.floor(((compareAtCents - cents) / compareAtCents) * 100);
}
