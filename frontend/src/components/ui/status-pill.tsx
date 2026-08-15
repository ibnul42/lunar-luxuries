import { cn } from "@/lib/utils";

/** Order + product statuses from README §5. */
export type Status =
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "REFUNDED"
  | "CANCELLED"
  | "ACTIVE"
  | "DRAFT"
  | "OUT_OF_STOCK";

/**
 * Text sits on a tinted fill from the same ramp (700/800 on 100/200), which
 * keeps every combination above 4.5:1 without per-status tuning.
 */
const TONES: Record<Status, string> = {
  PROCESSING: "bg-accent-100 text-accent-800",
  SHIPPED: "bg-accent-200 text-accent-800",
  DELIVERED: "bg-sage-200 text-sage-800",
  REFUNDED: "bg-black/8 text-text/80",
  CANCELLED: "bg-black/8 text-text/80",
  ACTIVE: "bg-sage-200 text-sage-800",
  DRAFT: "bg-black/8 text-text/80",
  OUT_OF_STOCK: "bg-accent-200 text-accent-900",
};

const LABELS: Record<Status, string> = {
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  DRAFT: "Draft",
  OUT_OF_STOCK: "Out of stock",
};

export function StatusPill({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1.5 text-[12px] font-semibold",
        TONES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
