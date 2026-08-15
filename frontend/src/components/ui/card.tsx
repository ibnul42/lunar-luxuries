import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** `card` is the storefront elevation; `panel` is the flatter admin surface. */
  elevation?: "card" | "panel" | "flat";
};

export function Card({ elevation = "card", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface",
        elevation === "card" && "rounded-card shadow-card",
        elevation === "panel" && "rounded-panel shadow-panel",
        elevation === "flat" && "rounded-card border border-border",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-7", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-xl leading-tight text-text", className)}
      {...props}
    />
  );
}
