import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Same `name` on several items makes them exclusive — one open at a time. */
  name?: string;
}

/**
 * Native `<details>`/`<summary>`: keyboard, screen-reader state and find-in-page
 * all come from the platform, and it works with no JavaScript at all.
 */
export function AccordionItem({
  title,
  children,
  defaultOpen,
  name,
}: AccordionItemProps) {
  return (
    <details
      name={name}
      open={defaultOpen}
      className="group border-b border-border last:border-b-0"
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-6 py-5",
          "text-[16px] font-semibold text-text transition-colors hover:text-accent-700",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        {title}
        <ChevronDown
          size={18}
          strokeWidth={2.75}
          aria-hidden
          className="shrink-0 text-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-6 text-[15px] leading-relaxed text-text-secondary">
        {children}
      </div>
    </details>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border", className)}>{children}</div>
  );
}
