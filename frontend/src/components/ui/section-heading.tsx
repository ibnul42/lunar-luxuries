import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
  /** The one H1 on an interior page — About, Contact. */
  page: "text-h2 md:text-title",
  section: "text-h2",
} as const;

/** Both are the 700 step, which clears 4.5:1 at kicker size on cream. */
const TONES = {
  accent: "text-accent-700",
  sage: "text-sage-700",
} as const;

export interface SectionHeadingProps {
  kicker?: string;
  title: ReactNode;
  /** Put on the heading, for a section's `aria-labelledby`. */
  id?: string;
  /** The heading level is the page outline's business, not the size's. */
  as?: "h1" | "h2";
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  align?: "start" | "center";
  /** Lead paragraph under the title. */
  children?: ReactNode;
  className?: string;
}

/** Kicker + display heading + optional lead: the opener of most sections. */
export function SectionHeading({
  kicker,
  title,
  id,
  as: Heading = "h2",
  size = "section",
  tone = "accent",
  align = "start",
  children,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn("space-y-4", centered && "text-center", className)}>
      {kicker ? <p className={cn("kicker", TONES[tone])}>{kicker}</p> : null}
      <Heading
        id={id}
        className={cn(
          "font-display text-balance",
          SIZES[size],
          centered && "mx-auto",
        )}
      >
        {title}
      </Heading>
      {children ? (
        <div
          className={cn(
            "max-w-xl space-y-4 leading-relaxed text-text-secondary",
            size === "page" ? "text-lg" : "text-base",
            centered && "mx-auto",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
