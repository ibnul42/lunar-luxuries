import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface CtaBandProps {
  title: string;
  /** Lead paragraph. */
  children?: ReactNode;
  /** Links styled with `buttonClasses()`; they stack full-width on phones. */
  actions: ReactNode;
  className?: string;
}

/** The terracotta closing panel that ends a content page with a next step. */
export function CtaBand({ title, children, actions, className }: CtaBandProps) {
  return (
    <div
      className={cn(
        "rounded-panel px-6 py-14 text-center text-surface sm:px-12 lg:px-16 lg:py-18",
        "bg-radial-[120%_140%_at_20%_0%] from-accent-600 via-accent-800 via-55% to-accent-900",
        className,
      )}
    >
      <h2 className="font-display text-h2 text-balance">{title}</h2>
      {children ? (
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-surface/85">
          {children}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
        {actions}
      </div>
    </div>
  );
}
