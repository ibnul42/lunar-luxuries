import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  /** Usually a `buttonClasses()` link. */
  action?: ReactNode;
  className?: string;
}

/** Empty cart, empty wishlist, no search results, no orders yet. */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-panel bg-surface px-6 py-16 text-center shadow-panel sm:py-20",
        className,
      )}
    >
      <span className="grid size-16 place-items-center rounded-pill bg-accent-100 text-accent-700">
        <Icon size={28} strokeWidth={2.5} aria-hidden />
      </span>
      <h2 className="font-display text-2xl text-text">{title}</h2>
      {children ? (
        <div className="max-w-md text-[15px] leading-relaxed text-muted">
          {children}
        </div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
