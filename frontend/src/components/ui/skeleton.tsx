import { cn } from "@/lib/utils";

/** A placeholder block while client data loads. Hidden from assistive tech. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-card bg-input", className)}
    />
  );
}
