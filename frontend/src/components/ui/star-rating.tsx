import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StarRatingProps {
  /** 0–5; fractions round to the nearest whole star for display. */
  value: number;
  size?: number;
  className?: string;
}

/**
 * Display only. The stars are hidden from assistive tech and replaced by one
 * sentence, so a screen reader hears "4.8 out of 5 stars", not five icons.
 * Terracotta is fine here: icons are non-text and only need 3:1.
 */
export function StarRating({ value, size = 16, className }: StarRatingProps) {
  const filled = Math.round(value);

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="sr-only">
        {Number.isInteger(value) ? value : value.toFixed(1)} out of 5 stars
      </span>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={2.25}
          aria-hidden
          className={cn(
            star <= filled
              ? "fill-accent-500 text-accent-500"
              : "fill-transparent text-accent-300",
          )}
        />
      ))}
    </span>
  );
}
